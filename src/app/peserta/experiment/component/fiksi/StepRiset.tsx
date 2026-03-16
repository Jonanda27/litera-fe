"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Edit3, Trash2, ExternalLink, Quote, 
  BookOpen, Star, Tag, MapPin, X, Info 
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface ResearchItem {
  id: string;
  title: string;
  sourceType: string;
  reference: string;
  tags: string[];
  importantQuotes: string;
  pageOrTime: {
    page: string;
    time: string;
  };
  credibility: number;
  usagePlan: string;
}

export default function StepRiset({ formData, onDataChange }: any) {
  const [researchList, setResearchList] = useState<ResearchItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState<ResearchItem | null>(null);

  const bookId = formData?.id || formData?.bookId;

  const fetchResearch = async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/books/research/${bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const mapped = res.data.map((item: any) => {
        const [p, t] = (item.reference_point || "|").split("|");
        return {
          id: item.id.toString(),
          title: item.source_title,
          sourceType: item.source_type,
          reference: item.link_url,
          tags: item.topics ? item.topics.split(", ") : [],
          importantQuotes: item.important_quote,
          pageOrTime: { page: p, time: t },
          credibility: item.credibility,
          usagePlan: item.usage_plan,
        };
      });

      setResearchList(mapped);

      if (mapped.length === 0) {
        setIsAdding(true);
      } else if (!editingId) {
        setIsAdding(false);
      }
      
    } catch (err) {
      console.error("Gagal load riset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, [bookId]);

  const [newItem, setNewItem] = useState<Partial<ResearchItem>>({
    title: "",
    sourceType: "article",
    reference: "",
    tags: [],
    importantQuotes: "",
    pageOrTime: { page: "", time: "" },
    credibility: 5,
    usagePlan: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setNewItem({
      title: "",
      sourceType: "article",
      reference: "",
      tags: [],
      importantQuotes: "",
      pageOrTime: { page: "", time: "" },
      credibility: 5,
      usagePlan: "",
    });
    
    if (researchList.length > 0) {
      setIsAdding(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, item: ResearchItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setNewItem({
      ...item,
      sourceType:
        item.sourceType === "Artikel Online"
          ? "article"
          : item.sourceType === "Buku"
            ? "book"
            : item.sourceType === "Video YouTube"
              ? "video"
              : item.sourceType === "Podcast"
                ? "podcast"
                : item.sourceType === "Wawancara"
                  ? "interview"
                  : "note",
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveResearch = async () => {
    if (!newItem.title) return alert("Judul Materi wajib diisi");
    if (!bookId) return alert("ID Buku tidak ditemukan");

    try {
      const token = localStorage.getItem("token");
      const payload = { ...newItem, bookId };

      if (editingId) {
        await axios.patch(
          `${API_BASE_URL}/books/research/${editingId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await axios.post(`${API_BASE_URL}/books/research`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setEditingId(null);
      await fetchResearch();
      resetForm();
    } catch (err) {
      alert("Gagal menyimpan riset");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus riset ini secara permanen?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/books/research/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchResearch();
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const sourceOptions = [
    { id: "article", label: "Artikel", icon: "📄" },
    { id: "book", label: "Buku", icon: "📚" },
    { id: "video", label: "Video", icon: "🎥" },
    { id: "podcast", label: "Podcast", icon: "🎙️" },
    { id: "note", label: "Catatan", icon: "📝" },
    { id: "interview", label: "Wawancara", icon: "💬" },
  ];

  return (
    <div className="space-y-6 px-1 md:px-0">
      {/* HEADER SECTION - Responsive Padding & Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-amber-500 to-orange-600 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-md gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white shrink-0">
            🏛️
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">
              Research Vault
            </h3>
            <p className="text-[9px] md:text-[10px] font-bold text-amber-100 uppercase opacity-80">
              Gudang Referensi & Data Terpercaya
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding && editingId) resetForm();
            else setIsAdding(!isAdding);
          }}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 ${
            isAdding
              ? "bg-white text-rose-600"
              : "bg-slate-900 text-amber-400 shadow-amber-900/20"
          }`}
        >
          {isAdding ? "✕ Tutup" : "+ Simpan Riset Baru"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-amber-100 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-xl space-y-6">
              <h4 className="text-[10px] md:text-xs font-black text-amber-600 uppercase tracking-widest px-1">
                {editingId ? "📝 Edit Materi Riset" : "✨ Tambah Materi Riset"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                <div className="md:col-span-2">
                  <InputGroup label="Judul Materi Riset">
                    <input
                      type="text"
                      placeholder="Misal: Sejarah Arsitektur Gotik"
                      value={newItem.title}
                      onChange={(e) =>
                        setNewItem({ ...newItem, title: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-500 outline-none text-sm font-bold text-black transition-all"
                    />
                  </InputGroup>
                </div>
                <InputGroup label="Kredibilitas Sumber">
                  <div className="flex gap-1 items-center h-11 bg-slate-50 px-3 rounded-xl border border-slate-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setNewItem({ ...newItem, credibility: star })
                        }
                        className={`text-lg transition-all ${newItem.credibility! >= star ? "text-amber-500 scale-110" : "text-slate-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </InputGroup>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Jenis Sumber
                </label>
                <div className="flex flex-wrap gap-2">
                  {sourceOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() =>
                        setNewItem({ ...newItem, sourceType: opt.id as any })
                      }
                      className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase border-2 transition-all ${newItem.sourceType === opt.id ? "bg-amber-500 border-amber-500 text-white shadow-md" : "bg-white border-slate-100 text-slate-400 hover:border-amber-200"}`}
                    >
                      <span className="text-xs md:text-sm">{opt.icon}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <InputGroup label="Link / Referensi URL">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={newItem.reference}
                  onChange={(e) =>
                    setNewItem({ ...newItem, reference: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-bold text-black"
                />
              </InputGroup>

              <InputGroup label="Kutipan Penting">
                <textarea
                  placeholder="Tuliskan poin penting..."
                  value={newItem.importantQuotes}
                  onChange={(e) =>
                    setNewItem({ ...newItem, importantQuotes: e.target.value })
                  }
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 h-24 md:h-32 resize-none text-sm font-bold text-black"
                />
              </InputGroup>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                <InputGroup label="Tags (pisahkan koma)">
                  <input
                    type="text"
                    placeholder="sejarah, medis"
                    value={newItem.tags?.join(", ")}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        tags: e.target.value.split(",").map((t) => t.trim()),
                      })
                    }
                    className="w-full p-3 rounded-xl bg-slate-50 border text-[10px] md:text-[11px] font-black uppercase text-black"
                  />
                </InputGroup>
                <InputGroup label="Letak (Hal / Menit)">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Hal."
                      value={newItem.pageOrTime?.page}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          pageOrTime: {
                            ...newItem.pageOrTime!,
                            page: e.target.value,
                          },
                        })
                      }
                      className="w-1/2 p-3 rounded-xl bg-slate-50 border text-center font-bold text-black"
                    />
                    <input
                      type="text"
                      placeholder="Menit"
                      value={newItem.pageOrTime?.time}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          pageOrTime: {
                            ...newItem.pageOrTime!,
                            time: e.target.value,
                          },
                        })
                      }
                      className="w-1/2 p-3 rounded-xl bg-slate-50 border text-center font-bold text-black"
                    />
                  </div>
                </InputGroup>
                <div className="sm:col-span-2 md:col-span-1">
                  <InputGroup label="Rencana Penggunaan">
                    <input
                      type="text"
                      placeholder="Misal: Bab 3"
                      value={newItem.usagePlan}
                      onChange={(e) =>
                        setNewItem({ ...newItem, usagePlan: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-black"
                    />
                  </InputGroup>
                </div>
              </div>

              <button
                onClick={handleSaveResearch}
                className="w-full py-4 bg-slate-900 text-amber-400 rounded-2xl font-black uppercase shadow-xl hover:bg-black active:scale-95 transition-all text-xs md:text-sm"
              >
                {editingId ? "💾 Perbarui Data Riset" : "💾 Simpan ke Research Base"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESEARCH LIST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {researchList.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedResearch(item)}
            className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-slate-100 hover:border-amber-400 transition-all group relative cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase">
                {item.sourceType}
              </span>
              <div className="text-amber-500 text-[10px] md:text-xs">
                {"★".repeat(item.credibility)}
              </div>
            </div>
            <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase mb-2 line-clamp-1 pr-12">
              {item.title}
            </h4>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 line-clamp-2 italic mb-3">
              "{item.importantQuotes}"
            </p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-50 gap-2">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase truncate">
                📍 {item.usagePlan}
              </span>
              <span className="shrink-0 text-[8px] md:text-[9px] font-black bg-slate-100 px-2 py-1 rounded text-slate-600 uppercase">
                {item.pageOrTime.page
                  ? `HAL. ${item.pageOrTime.page}`
                  : `${item.pageOrTime.time} MIN`}
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="absolute top-4 right-4 flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
               <button
                  onClick={(e) => handleEditClick(e, item)}
                  className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
            </div>
          </div>
        ))}
        {researchList.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Belum ada riset yang disimpan</p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL - Optimized for all screens */}
      <AnimatePresence>
        {selectedResearch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.5rem] md:rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative border-[3px] md:border-4 border-amber-400"
            >
              <button 
                onClick={() => setSelectedResearch(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all z-10"
              >
                <X size={18} />
              </button>

              <div className="p-5 md:p-10 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                      {selectedResearch.sourceType}
                    </span>
                    <div className="flex text-amber-500">
                       {"★".repeat(selectedResearch.credibility)}
                    </div>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase leading-tight">
                    {selectedResearch.title}
                  </h2>
                </div>

                <div className="relative bg-slate-50 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-100 italic">
                  <Quote className="absolute top-3 left-3 md:top-4 md:left-4 text-amber-200" size={30} />
                  <p className="relative z-10 text-sm md:text-lg font-medium text-slate-700 leading-relaxed text-center px-2">
                    "{selectedResearch.importantQuotes}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white border-2 border-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Rencana Penggunaan</p>
                      <p className="text-xs md:text-sm font-bold text-slate-800 truncate">{selectedResearch.usagePlan}</p>
                    </div>
                  </div>
                  <div className="bg-white border-2 border-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                      <BookOpen size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Letak Referensi</p>
                      <p className="text-xs md:text-sm font-bold text-slate-800 truncate">
                        {selectedResearch.pageOrTime.page ? `Halaman ${selectedResearch.pageOrTime.page}` : `Menit ${selectedResearch.pageOrTime.time}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                     <Tag size={12} /> Topik Terkait
                   </p>
                   <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {selectedResearch.tags.map((tag, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold border border-slate-200">
                          #{tag}
                        </span>
                      ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 md:gap-4">
                  <a 
                    href={selectedResearch.reference} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full sm:flex-1 bg-amber-500 text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase shadow-lg shadow-amber-200 flex items-center justify-center gap-2 hover:bg-amber-600 transition-all active:scale-95"
                  >
                    Buka Sumber <ExternalLink size={14} />
                  </a>
                  <button 
                    onClick={() => {
                      setSelectedResearch(null);
                      handleEditClick(new MouseEvent('click') as any, selectedResearch);
                    }}
                    className="w-full sm:w-auto px-6 md:px-10 bg-slate-900 text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase hover:bg-black transition-all"
                  >
                    Edit Data
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
        {label}
      </label>
      {children}
    </div>
  );
}