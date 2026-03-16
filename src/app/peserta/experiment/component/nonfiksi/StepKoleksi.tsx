"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Quote as QuoteIcon,
  Plus,
  Trash2,
  Save,
  X,
  User,
  Book as BookIcon,
  Tag,
  Target,
  Sparkles,
  Edit3,
  RefreshCw,
  Info,
  Hash,
  ExternalLink,
  MessageCircle
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface QuoteItem {
  id: string;
  bookId: number;
  text: string;
  sourceType: string;
  sourceDetail: string;
  tags: string[];
  relatedChapter: string;
  chapterTitle: string;
  context: string;
}

interface StepQuoteProps {
  formData: any;
  onDataChange: (data: any) => void;
}

export default function StepQuoteCollection({ formData, onDataChange }: StepQuoteProps) {
  const [quotes, setQuotes] = useState<QuoteItem[]>(formData.quoteCollection || []);
  const [isAdding, setIsAdding] = useState<boolean>(quotes.length === 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);

  // Ref untuk sinkronisasi dan cegah loop
  const hasFetchedRef = useRef<number | null>(null);
  const lastSentDataRef = useRef("");

  const [newItem, setNewItem] = useState<Partial<QuoteItem>>({
    sourceType: "Tokoh Terkenal",
    tags: ["", "", ""],
    relatedChapter: "",
    chapterTitle: "",
    text: "",
    sourceDetail: "",
    context: ""
  });

  // --- 1. FETCH DATA DARI DATABASE (READ) ---
  useEffect(() => {
    const fetchQuotes = async () => {
      const bookId = formData?.bookId || formData?.id;
      if (!bookId || hasFetchedRef.current === bookId) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/books/quotes/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.length > 0) {
          hasFetchedRef.current = bookId;
          const dbItems = res.data.map((item: any) => ({
            ...item,
            id: item.id.toString(),
            tags: item.tags || ["", "", ""]
          }));
          setQuotes(dbItems);
          setIsAdding(false);
        } else {
          setIsAdding(true);
        }
      } catch (err) {
        console.error("Gagal memuat koleksi kutipan:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [formData?.bookId, formData?.id]);

  // --- 2. SINKRONISASI KE PARENT MODAL ---
  useEffect(() => {
    const currentDataString = JSON.stringify(quotes);
    if (lastSentDataRef.current !== currentDataString) {
      lastSentDataRef.current = currentDataString;
      onDataChange({ ...formData, quoteCollection: quotes });
    }
  }, [quotes, onDataChange, formData]);

  const sourceTypes = [
    { label: "Tokoh Terkenal", icon: <User size={12} /> },
    { label: "Buku Lain", icon: <BookIcon size={12} /> },
    { label: "Film/Pidato", icon: "🎬" },
    { label: "Penulis Sendiri", icon: "✍️" },
    { label: "Pepatah", icon: "📜" },
    { label: "Lainnya", icon: "🧩" }
  ];

  // --- 3. HANDLE SAVE (CREATE ATAU UPDATE) ---
  const handleSave = async () => {
    if (!newItem.text?.trim()) return alert("Isi kutipan wajib diisi!");
    const bookId = formData?.bookId || formData?.id;
    if (!bookId) return alert("ID Buku tidak ditemukan");

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { ...newItem, bookId };

      if (editingId) {
        // UPDATE API
        await axios.patch(`${API_BASE_URL}/books/quotes/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // CREATE API
        await axios.post(`${API_BASE_URL}/books/quotes`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      hasFetchedRef.current = null;
      setEditingId(null);
      setIsAdding(false);
      resetForm();

      // Fetch ulang data terbaru
      const res = await axios.get(`${API_BASE_URL}/books/quotes/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotes(res.data.map((item: any) => ({ ...item, id: item.id.toString() })));

    } catch (error) {
      alert("Gagal menyimpan data ke database");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. HANDLE DELETE ---
  const removeItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus kutipan ini?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/books/quotes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = quotes.filter((q) => q.id !== id);
      setQuotes(updated);
      if (updated.length === 0) setIsAdding(true);
      if (selectedQuote?.id === id) setSelectedQuote(null);
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const handleEdit = (e: React.MouseEvent, item: QuoteItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setNewItem(item);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewItem({
      sourceType: "Tokoh Terkenal",
      tags: ["", "", ""],
      relatedChapter: "",
      chapterTitle: "",
      text: "",
      sourceDetail: "",
      context: ""
    });
  };

  return (
    <div className="space-y-6 pb-10 text-slate-800 relative">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-violet-600 to-purple-700 p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-lg border-b-4 border-violet-900/20 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
            <QuoteIcon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Koleksi Kutipan</h3>
            {isLoading ? (
              <p className="text-[10px] font-bold text-violet-200 animate-pulse uppercase">Syncing Database...</p>
            ) : (
              <p className="text-[10px] font-bold text-violet-100 uppercase tracking-tighter opacity-80 italic">Kumpulkan inspirasi tulisanmu</p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md active:scale-95 flex items-center gap-2 ${isAdding ? "bg-rose-500 text-white shadow-rose-200" : "bg-white text-violet-700 hover:bg-violet-50"
            }`}
        >
          {isAdding ? <><X size={14} /> Batal</> : <><Plus size={14} /> Tambah Kutipan</>}
        </button>
      </div>

      {/* FORM INPUT */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-xl space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 text-violet-600 border-b border-slate-50 pb-4">
              <Edit3 size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">{editingId ? "Update Kutipan" : "Rekam Kutipan Baru"}</h4>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Sparkles size={12} /> Isi Kutipan
              </label>
              <textarea
                className="form-textarea-modal h-28 border-violet-100 focus:border-violet-400 text-base italic font-serif"
                placeholder='"Tuliskan kata-kata inspiratif di sini..."'
                value={newItem.text || ""}
                onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-50 pt-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sumber Kutipan</label>
                <div className="flex flex-wrap gap-2">
                  {sourceTypes.map((type) => (
                    <button key={type.label} type="button" onClick={() => setNewItem({ ...newItem, sourceType: type.label })}
                      className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase transition-all border flex items-center gap-2 ${newItem.sourceType === type.label ? "bg-violet-600 border-violet-600 text-white shadow-md" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-violet-200"
                        }`}
                    >
                      <span>{type.icon}</span> {type.label}
                    </button>
                  ))}
                </div>
                <InputWrapper label="Detail Sumber (Nama Tokoh/Judul Buku)">
                  <input type="text" className="form-input-modal" placeholder="Contoh: Albert Einstein / Filosofi Teras"
                    value={newItem.sourceDetail || ""} onChange={(e) => setNewItem({ ...newItem, sourceDetail: e.target.value })} />
                </InputWrapper>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Tag size={12} /> Topik / Tag
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((idx) => (
                      <input key={idx} type="text" className="form-input-modal text-center" placeholder="Tag"
                        value={newItem.tags?.[idx] || ""}
                        onChange={(e) => {
                          const updated = [...(newItem.tags || ["", "", ""])];
                          updated[idx] = e.target.value;
                          setNewItem({ ...newItem, tags: updated });
                        }} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputWrapper label="Bab">
                    <input type="text" className="form-input-modal text-center" placeholder="01"
                      value={newItem.relatedChapter || ""} onChange={(e) => setNewItem({ ...newItem, relatedChapter: e.target.value })} />
                  </InputWrapper>
                  <div className="col-span-2">
                    <InputWrapper label="Target Judul Bab">
                      <input type="text" className="form-input-modal" placeholder="Judul bab terkait..."
                        value={newItem.chapterTitle || ""} onChange={(e) => setNewItem({ ...newItem, chapterTitle: e.target.value })} />
                    </InputWrapper>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-50 pt-6">
              <InputWrapper label="Konteks Penggunaan (Kenapa kutipan ini relevan?)">
                <textarea className="form-textarea-modal h-20" placeholder="Jelaskan alasan kutipan ini dipakai..."
                  value={newItem.context || ""} onChange={(e) => setNewItem({ ...newItem, context: e.target.value })}></textarea>
              </InputWrapper>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-slate-900 text-violet-400 rounded-2xl text-[11px] font-black uppercase shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2">
              {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={18} />}
              {editingId ? "Update Kutipan ke Database" : "Simpan ke Koleksi Kutipan"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY LIST QUOTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1 md:px-0">
        {quotes.length === 0 && !isAdding && !isLoading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Koleksi kutipan masih kosong.</p>
          </div>
        )}
        {quotes.map((item) => (
          <motion.div layout key={item.id} onClick={() => setSelectedQuote(item)}
            className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500 opacity-20" />

            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-violet-50 rounded-xl">
                <QuoteIcon size={14} className="text-violet-500" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={(e) => handleEdit(e, item)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={14} /></button>
                <button onClick={(e) => removeItem(e, item.id)} className="p-2 bg-slate-100 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button>
              </div>
            </div>

            <p className="text-sm font-serif italic text-slate-700 leading-relaxed mb-4 line-clamp-3">
              "{item.text}"
            </p>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-black text-[10px]">
                {item.sourceDetail?.charAt(0) || "?"}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{item.sourceDetail}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">{item.sourceType}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-violet-400">
                <Target size={12} />
                <span className="text-[9px] font-black uppercase">Bab {item.relatedChapter || '-'}</span>
              </div>
              <ExternalLink size={14} className="text-slate-200 group-hover:text-violet-500 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedQuote && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedQuote(null)}
          >
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-[3rem] shadow-2xl overflow-hidden text-slate-800 max-h-[95vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="bg-violet-700 p-6 md:p-8 text-white relative shrink-0">
                <button onClick={() => setSelectedQuote(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={28} /></button>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">{selectedQuote.sourceType}</span>
                  <div className="flex gap-1">
                    {selectedQuote.tags?.filter(t => t !== "").map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-violet-400/30 rounded text-[8px] font-black uppercase">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <QuoteIcon size={40} className="absolute -top-4 -left-6 opacity-20 rotate-180" />
                  <h2 className="text-2xl font-serif italic leading-relaxed text-center px-4 relative z-10">
                    "{selectedQuote.text}"
                  </h2>
                  <QuoteIcon size={40} className="absolute -bottom-4 -right-6 opacity-20" />
                </div>
              </div>

              {/* Body Modal */}
              <div className="p-5 md:p-8 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-violet-600 uppercase tracking-widest flex items-center gap-2"><User size={14} /> Asal Usul</h5>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{selectedQuote.sourceDetail || "Anonim"}</p>
                    <p className="text-[11px] font-medium text-slate-400 italic">Dikategorikan sebagai: {selectedQuote.sourceType}</p>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target size={14} /> Penempatan</h5>
                    <p className="text-sm font-bold text-slate-700">Bab {selectedQuote.relatedChapter}: {selectedQuote.chapterTitle}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MessageCircle size={14} /> Konteks Narasi</h5>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 text-sm font-medium leading-relaxed text-slate-600 italic">
                    "{selectedQuote.context || "Belum ada konteks penggunaan yang ditambahkan."}"
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Info size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Quote ID: {selectedQuote.id}</span>
                  </div>
                  <button onClick={() => setSelectedQuote(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-black transition-all shadow-xl">Tutup Koleksi</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .form-input-modal { 
        width: 100%; 
        padding: 10px 14px; 
        background-color: #f8fafc; 
        border: 1px solid #f1f5f9; 
        border-radius: 12px; 
        outline: none; 
        font-size: 13px; 
        font-weight: 600; 
        transition: all 0.2s; 
        color: #334155; 
      }
      .form-input-modal:focus { background-color: white; border-color: #7c3aed; }
      
      .form-textarea-modal { 
        width: 100%; 
        padding: 12px; 
        background-color: #f8fafc; 
        border: 1px solid #f1f5f9; 
        border-radius: 16px; 
        outline: none; 
        font-size: 13px; 
        font-weight: 500; 
        resize: none; 
        transition: all 0.2s; 
        color: #334155; 
        line-height: 1.5; 
      }
      .form-textarea-modal:focus { background-color: white; border-color: #7c3aed; }

      @media (min-width: 768px) {
        .form-input-modal { padding: 12px 16px; }
      }
      `}</style>
    </div>
  );
}

function InputWrapper({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}