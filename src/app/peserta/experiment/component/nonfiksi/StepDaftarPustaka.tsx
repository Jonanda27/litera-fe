"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Library,
  Plus,
  Trash2,
  Save,
  X,
  Link as LinkIcon,
  Quote,
  CheckCircle,
  AlertCircle,
  Edit3,
  BookOpen,
  Calendar,
  User,
  Info,
  Hash,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface SourceItem {
  id: string;
  bookId: number;
  type: string;
  title: string;
  author: string;
  year: string;
  publisherUrl: string;
  isbnDoi: string;
  relatedChapters: string[];
  quotes: string;
  pageRef: string;
  notes: string;
  credibility: "Tinggi" | "Sedang" | "Rendah";
  citationStatus: "Belum dipake" | "Udah dipake" | "Buat referensi aja";
}

interface StepSourceProps {
  formData: any;
  onDataChange: (data: any) => void;
}

export default function StepSourceManagement({ formData, onDataChange }: StepSourceProps) {
  const [sources, setSources] = useState<SourceItem[]>(formData.sources || []);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);

  // Ref untuk proteksi infinite loop dan sinkronisasi [cite: 1025]
  const hasFetchedRef = useRef<number | null>(null);
  const lastSentDataRef = useRef("");

  const [newItem, setNewItem] = useState<Partial<SourceItem>>({
    type: "Buku",
    credibility: "Sedang",
    citationStatus: "Belum dipake",
    relatedChapters: ["", "", ""]
  });

  // --- 1. FETCH DATA DARI DATABASE (READ) --- [cite: 1115, 1908]
  useEffect(() => {
    const fetchSources = async () => {
      const bookId = formData?.bookId || formData?.id;
      if (!bookId || hasFetchedRef.current === bookId) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/books/sources/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.length > 0) {
          hasFetchedRef.current = bookId;
          const dbItems = res.data.map((item: any) => ({
            ...item,
            id: item.id.toString(),
            relatedChapters: item.relatedChapters || ["", "", ""]
          }));
          setSources(dbItems);
        }
      } catch (err) {
        console.error("Gagal memuat sumber referensi:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSources();
  }, [formData?.bookId, formData?.id]);

  // --- 2. SINKRONISASI KE PARENT MODAL --- [cite: 1025]
  useEffect(() => {
    const currentDataString = JSON.stringify(sources);
    if (lastSentDataRef.current !== currentDataString) {
      lastSentDataRef.current = currentDataString;
      onDataChange({ ...formData, sources: sources });
    }
  }, [sources, onDataChange, formData]);

  const sourceTypes = [
    { label: "Buku", icon: "📚" },
    { label: "Jurnal Ilmiah", icon: "📄" },
    { label: "Website/Artikel", icon: "🌐" },
    { label: "Video/Kuliah Online", icon: "🎥" },
    { label: "Podcast/Wawancara", icon: "🎙️" },
    { label: "Data/Statistik", icon: "📊" },
    { label: "Pengalaman Pribadi", icon: "💬" },
    { label: "Lainnya", icon: "🧩" }
  ];

  // --- 3. HANDLE SIMPAN (CREATE ATAU UPDATE) --- [cite: 591, 592, 1908]
  const handleSave = async () => {
    if (!newItem.title) return alert("Judul sumber wajib diisi!");
    const bookId = formData?.bookId || formData?.id;
    if (!bookId) return alert("ID Buku tidak ditemukan");

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { ...newItem, bookId };

      if (editingId) {
        // UPDATE API
        await axios.patch(`${API_BASE_URL}/books/sources/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // CREATE API
        await axios.post(`${API_BASE_URL}/books/sources`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Reset status fetch agar data ditarik kembali secara sinkron
      hasFetchedRef.current = null;
      setEditingId(null);
      setIsAdding(false);
      resetForm();

      // Ambil data terbaru
      const res = await axios.get(`${API_BASE_URL}/books/sources/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSources(res.data.map((item: any) => ({ ...item, id: item.id.toString() })));

    } catch (error) {
      alert("Gagal menyimpan data ke database");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. HANDLE HAPUS (DELETE) --- [cite: 596, 1908]
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus sumber referensi ini dari database?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/books/sources/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSources(sources.filter(s => s.id !== id));
      if (selectedSource?.id === id) setSelectedSource(null);
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const handleEdit = (e: React.MouseEvent, item: SourceItem) => {
    e.stopPropagation();
    setNewItem(item);
    setEditingId(item.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewItem({
      type: "Buku",
      credibility: "Sedang",
      citationStatus: "Belum dipake",
      relatedChapters: ["", "", ""]
    });
  };

  return (
    <div className="space-y-6 pb-10 text-slate-800 relative">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-lg border-b-4 border-emerald-500/20 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
            <Library size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Manajemen Sumber</h3>
            {isLoading ? (
              <p className="text-[10px] font-bold text-blue-200 animate-pulse uppercase">Mensinkronkan Data...</p>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Database Referensi Karyamu</p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) { setEditingId(null); resetForm(); }
            setIsAdding(!isAdding);
          }}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center ${isAdding ? "bg-rose-500 text-white" : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
        >
          {isAdding ? <><X size={14} /> Batal</> : <><Plus size={14} /> Tambah Sumber</>}
        </button>
      </div>

      {/* FORM INPUT SECTION */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-slate-100 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-xl space-y-6">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Edit3 size={12} /> {editingId ? "Ubah Data Referensi" : "Input Referensi Baru"}
              </h4>

              {/* JENIS SUMBER GRID */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Sumber</label>
                <div className="flex flex-wrap gap-2">
                  {sourceTypes.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setNewItem({ ...newItem, type: t.label })}
                      className={`py-2 px-4 rounded-full text-[10px] font-black uppercase transition-all border flex items-center gap-2 ${newItem.type === t.label ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-emerald-200"
                        }`}
                    >
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* INFORMASI SUMBER */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                <div className="md:col-span-2 space-y-4">
                  <InputWrapper label="Judul Sumber (Buku/Artikel/Video)">
                    <input type="text" className="form-input-modal" placeholder="Judul Lengkap" value={newItem.title || ""}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                  </InputWrapper>
                  <div className="grid grid-cols-2 gap-4">
                    <InputWrapper label="Pengarang/Penulis">
                      <input type="text" className="form-input-modal" placeholder="Nama Penulis" value={newItem.author || ""}
                        onChange={(e) => setNewItem({ ...newItem, author: e.target.value })} />
                    </InputWrapper>
                    <InputWrapper label="Tahun Terbit">
                      <input type="text" className="form-input-modal" placeholder="YYYY" value={newItem.year || ""}
                        onChange={(e) => setNewItem({ ...newItem, year: e.target.value })} />
                    </InputWrapper>
                  </div>
                  <InputWrapper label="Penerbit / URL / Link Sumber">
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" className="form-input-modal pl-10" placeholder="https://..." value={newItem.publisherUrl || ""}
                        onChange={(e) => setNewItem({ ...newItem, publisherUrl: e.target.value })} />
                    </div>
                  </InputWrapper>
                </div>
                <div className="space-y-4">
                  <InputWrapper label="ISBN / DOI (Opsional)">
                    <input type="text" className="form-input-modal" placeholder="ID Unik Sumber" value={newItem.isbnDoi || ""}
                      onChange={(e) => setNewItem({ ...newItem, isbnDoi: e.target.value })} />
                  </InputWrapper>
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed text-center italic">
                      Data ini akan otomatis disusun menjadi Daftar Pustaka di tahap akhir.
                    </p>
                  </div>
                </div>
              </div>

              {/* PENGGUNAAN DALAM BUKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-50 pt-4">
                <InputWrapper label="Kutipan Paling Relevan">
                  <div className="relative">
                    <Quote size={14} className="absolute left-3 top-4 text-emerald-500 opacity-30" />
                    <textarea className="form-textarea-modal pl-10 h-24" placeholder="Tulis kutipan yang ingin Anda kutip..." value={newItem.quotes || ""}
                      onChange={(e) => setNewItem({ ...newItem, quotes: e.target.value })}></textarea>
                  </div>
                </InputWrapper>
                <div className="space-y-4">
                  <InputWrapper label="Catatan Internal">
                    <textarea className="form-textarea-modal h-24" placeholder="Kenapa sumber ini penting untuk buku Anda?" value={newItem.notes || ""}
                      onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}></textarea>
                  </InputWrapper>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                <InputWrapper label="Bab Terkait">
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((idx) => (
                      <input key={idx} type="text" className="form-input-modal text-center px-1" placeholder={`B${idx + 1}`} value={newItem.relatedChapters?.[idx] || ""}
                        onChange={(e) => {
                          const updated = [...(newItem.relatedChapters || ["", "", ""])];
                          updated[idx] = e.target.value;
                          setNewItem({ ...newItem, relatedChapters: updated });
                        }} />
                    ))}
                  </div>
                </InputWrapper>
                <InputWrapper label="Halaman Referensi">
                  <input type="text" className="form-input-modal" placeholder="Misal: Hal 10-15" value={newItem.pageRef || ""}
                    onChange={(e) => setNewItem({ ...newItem, pageRef: e.target.value })} />
                </InputWrapper>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  <InputWrapper label="Kredibilitas">
                    <select className="form-input-modal text-[10px]" value={newItem.credibility}
                      onChange={(e) => setNewItem({ ...newItem, credibility: e.target.value as any })}>
                      <option>Tinggi</option>
                      <option>Sedang</option>
                      <option>Rendah</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Status Sitasi">
                    <select className="form-input-modal text-[10px]" value={newItem.citationStatus}
                      onChange={(e) => setNewItem({ ...newItem, citationStatus: e.target.value as any })}>
                      <option>Belum dipake</option>
                      <option>Udah dipake</option>
                      <option>Buat referensi aja</option>
                    </select>
                  </InputWrapper>
                </div>
              </div>

              <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-black uppercase shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {editingId ? "Perbarui Data di Database" : "Simpan ke Database Sumber"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID DISPLAY SOURCES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1 md:px-0">
        {sources.length === 0 && !isAdding && !isLoading && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50">
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Belum ada sumber referensi.</p>
          </div>
        )}
        {sources.map((item) => (
          <motion.div
            layout key={item.id}
            onClick={() => setSelectedSource(item)}
            className="bg-white p-5 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all group relative cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase">{item.type}</span>
                {item.citationStatus === "Udah dipake" ?
                  <CheckCircle size={14} className="text-emerald-500" /> :
                  <AlertCircle size={14} className="text-amber-500" />
                }
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => handleEdit(e, item)} className="p-1.5 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Edit3 size={14} />
                </button>
                <button onClick={(e) => handleDelete(e, item.id)} className="p-1.5 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h4 className="text-xs font-black text-slate-800 uppercase truncate mb-1">{item.title}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-3">
              {item.author} ({item.year})
            </p>
            <div className="bg-slate-50/50 p-3 rounded-xl mb-3 border border-slate-100">
              <p className="text-[10px] text-slate-600 line-clamp-2 italic font-medium leading-relaxed">
                "{item.quotes || "Tidak ada kutipan tersimpan"}"
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-slate-50 pt-3">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <Hash size={10} /> Bab: {item.relatedChapters?.filter(c => c).join(", ") || "-"}
              </span>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${item.credibility === 'Tinggi' ? 'bg-emerald-100 text-emerald-700' :
                item.credibility === 'Sedang' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                }`}>Cred: {item.credibility}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DETAIL MODAL SECTION */}
      <AnimatePresence>
        {selectedSource && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedSource(null)}
          >
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-[3rem] shadow-2xl overflow-hidden text-slate-800 max-h-[95vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-emerald-600 p-8 text-white relative">
                <button onClick={() => setSelectedSource(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                  <X size={24} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">{selectedSource.type}</span>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] ${selectedSource.credibility === 'Tinggi' ? 'bg-emerald-400' : 'bg-amber-400'}`}>Kredibilitas: {selectedSource.credibility}</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight">{selectedSource.title}</h2>
              </div>
              <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <DetailBox icon={<User size={14} />} label="Penulis" value={selectedSource.author} />
                  <DetailBox icon={<Calendar size={14} />} label="Tahun" value={selectedSource.year} />
                  <DetailBox icon={<Hash size={14} />} label="ISBN/DOI" value={selectedSource.isbnDoi} />
                  <DetailBox icon={<BookOpen size={14} />} label="Halaman" value={selectedSource.pageRef} />
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Quote size={14} /> Kutipan Utama</h5>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 italic text-slate-600 text-sm font-medium">"{selectedSource.quotes || "Tidak ada kutipan."}"</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan & Konteks</h5>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">{selectedSource.notes || "-"}</p>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akses Sumber</h5>
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs truncate">
                        <ExternalLink size={14} /><a href={selectedSource.publisherUrl} target="_blank" rel="noreferrer" className="hover:underline">{selectedSource.publisherUrl || "-"}</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex gap-6">
                    <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digunakan di Bab</p><p className="text-xs font-black text-slate-800">{selectedSource.relatedChapters?.filter(c => c).join(", ") || "-"}</p></div>
                    <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status Sitasi</p><p className="text-xs font-black text-emerald-600 uppercase">{selectedSource.citationStatus}</p></div>
                  </div>
                  <button onClick={() => setSelectedSource(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-black transition-all">Tutup</button>
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
      .form-input-modal:focus { background-color: white; border-color: #10b981; }
      
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
      .form-textarea-modal:focus { background-color: white; border-color: #10b981; }

      @media (min-width: 768px) {
        .form-input-modal { padding: 12px 16px; }
      }
      `}</style>
    </div>
  );
}

function DetailBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">{icon} {label}</p>
      <p className="text-xs font-bold text-slate-800 truncate">{value || "-"}</p>
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