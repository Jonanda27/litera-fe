"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Edit3, Trash2, X, MapPin, Clock, 
  User, BookOpen, ChevronRight, Info, Plus, Save 
} from "lucide-react";

// Interface untuk Sub Bab
interface SubChapter {
  id: string;
  title: string;
  points: string[];
}

// Interface untuk Bab/Chapter Utama
interface Chapter {
  id: string;
  number: string;
  title: string;
  pov: string;
  location: string;
  time: string;
  subChapters: SubChapter[];
  notes: string;
  status: "Ide" | "Outline" | "Draft" | "Revisi" | "Selesai";
}

// Interface untuk Props Komponen Helper
interface InputGroupProps {
  label: string;
  children: React.ReactNode;
}

interface MiniInputProps {
  label: string;
  value: string | undefined;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function StepOutline({ formData, onDataChange }: any) {
  const [outline, setOutline] = useState<Chapter[]>(formData.outlineBase || []);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(outline.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<Chapter | null>(null); // State untuk Modal Detail

  const bookId = formData?.id || formData?.bookId;

  const [newChapter, setNewChapter] = useState<Partial<Chapter>>({
    number: "",
    title: "",
    pov: "Orang ketiga (Dia)",
    location: "",
    time: "",
    subChapters: [{ id: "1", title: "", points: [""] }],
    notes: "",
    status: "Outline",
  });

  // 1. FETCH DATA
  const fetchOutlines = async () => {
    if (!bookId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:4000/api/books/outlines/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedData = res.data.map((item: any) => ({
        id: item.id.toString(),
        number: item.chapter_number,
        title: item.title,
        pov: item.pov,
        location: item.location,
        time: item.time_setting,
        subChapters: item.sub_chapters || [],
        notes: item.notes,
        status: item.status,
      }));

      setOutline(mappedData);
    } catch (err) {
      console.error("Gagal mengambil data outline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlines();
  }, [bookId]);

  useEffect(() => {
    onDataChange({ ...formData, outlineBase: outline });
  }, [outline]);

  // 2. LOGIKA EDIT & FORM
  const handleEditClick = (e: React.MouseEvent, chap: Chapter) => {
    e.stopPropagation(); // Penting: Mencegah modal detail terbuka
    setEditingId(chap.id);
    setNewChapter({ ...chap }); 
    setIsAdding(true);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewChapter({
      number: "", title: "", pov: "Orang ketiga (Dia)", location: "", time: "",
      subChapters: [{ id: "1", title: "", points: [""] }], notes: "", status: "Outline",
    });
  };

  const addSubChapter = () => {
    setNewChapter({
      ...newChapter,
      subChapters: [
        ...(newChapter.subChapters || []),
        { id: Date.now().toString(), title: "", points: [""] },
      ],
    });
  };

  // 3. SAVE DATA
  const handleSaveChapter = async () => {
    if (!newChapter.title) return alert("Judul Bab wajib diisi");
    if (!bookId) return alert("ID Buku tidak ditemukan.");

    try {
      const token = localStorage.getItem("token");
      const payload = { ...newChapter, bookId: bookId };

      if (editingId) {
        await axios.put(`http://localhost:4000/api/books/outlines/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://localhost:4000/api/books/outlines`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      await fetchOutlines();
      resetForm();
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    }
  };

  // 4. DELETE DATA
  const handleDeleteChapter = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!confirm("Hapus bab ini secara permanen?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/books/outlines/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOutlines();
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-700 p-5 rounded-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white">
            📑
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Arsitektur Outline</h3>
            <p className="text-[10px] font-bold text-emerald-100 uppercase opacity-80">Rancang alur per bab dengan presisi</p>
          </div>
        </div>
        
        <button
          onClick={() => (isAdding ? resetForm() : setIsAdding(true))}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 ${
            isAdding ? "bg-rose-500 text-white shadow-rose-200" : "bg-white text-emerald-700 shadow-emerald-900/20"
          }`}
        >
          {isAdding ? <span className="flex items-center gap-2"><X size={14}/> Batal</span> : <span className="flex items-center gap-2"><Plus size={14}/> Tambah Bab</span>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white border-2 border-emerald-100 rounded-[2.5rem] p-6 shadow-xl space-y-6">
              <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest px-1">
                {editingId ? "📝 Edit Struktur Bab" : "✨ Tambah Bab Baru"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100">
                <div className="md:col-span-1">
                  <InputGroup label="No. Bab">
                    <input type="text" placeholder="01" value={newChapter.number || ""} onChange={(e) => setNewChapter({ ...newChapter, number: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold text-slate-900 text-center" />
                  </InputGroup>
                </div>
                <div className="md:col-span-3">
                  <InputGroup label="Judul Bab">
                    <input type="text" placeholder="Judul..." value={newChapter.title || ""} onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold text-slate-900" />
                  </InputGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputGroup label="POV">
                  <select value={newChapter.pov || "Orang ketiga (Dia)"} onChange={(e) => setNewChapter({ ...newChapter, pov: e.target.value })} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500">
                    <option>Orang pertama (Aku)</option>
                    <option>Orang ketiga (Dia)</option>
                    <option>Campuran</option>
                  </select>
                </InputGroup>
                <InputGroup label="Lokasi Utama">
                  <input type="text" placeholder="Lokasi..." value={newChapter.location || ""} onChange={(e) => setNewChapter({ ...newChapter, location: e.target.value })} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500" />
                </InputGroup>
                <InputGroup label="Waktu">
                  <input type="text" placeholder="Waktu..." value={newChapter.time || ""} onChange={(e) => setNewChapter({ ...newChapter, time: e.target.value })} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500" />
                </InputGroup>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-Bab / Adegan</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                {newChapter.subChapters?.map((sub, idx) => (
                  <div key={sub.id} className="p-5 border-2 border-slate-50 bg-slate-50/30 rounded-3xl space-y-3 relative group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-emerald-500">#{idx + 1}</span>
                      <input type="text" placeholder="Judul Adegan..." value={sub.title} onChange={(e) => {
                        const updated = [...(newChapter.subChapters || [])];
                        updated[idx].title = e.target.value;
                        setNewChapter({ ...newChapter, subChapters: updated });
                      }} className="flex-1 bg-transparent border-b border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold text-slate-900 pb-1" />
                    </div>
                    <textarea placeholder="Poin alur..." className="w-full p-3 rounded-xl bg-white border border-slate-100 text-xs font-semibold text-slate-900 h-20 outline-none focus:border-emerald-400" value={sub.points.join("\n")} onChange={(e) => {
                      const updated = [...(newChapter.subChapters || [])];
                      updated[idx].points = e.target.value.split("\n");
                      setNewChapter({ ...newChapter, subChapters: updated });
                    }} />
                  </div>
                ))}
                <button type="button" onClick={addSubChapter} className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-black uppercase hover:border-emerald-300 hover:text-emerald-500 transition-all">
                  ➕ Tambah Sub-Bab
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
                <div className="md:col-span-2">
                  <InputGroup label="Catatan Khusus">
                    <input type="text" value={newChapter.notes || ""} onChange={(e) => setNewChapter({ ...newChapter, notes: e.target.value })} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500" />
                  </InputGroup>
                </div>
                <InputGroup label="Status">
                  <select value={newChapter.status || "Outline"} onChange={(e) => setNewChapter({ ...newChapter, status: e.target.value as any })} className="w-full p-3 rounded-xl bg-emerald-900 text-white text-xs font-black uppercase outline-none">
                    <option value="Ide">Ide</option>
                    <option value="Outline">Outline</option>
                    <option value="Draft">Draft</option>
                    <option value="Revisi">Revisi</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </InputGroup>
              </div>

              <button onClick={handleSaveChapter} className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={16}/> {editingId ? "Perbarui Struktur" : "Simpan Struktur"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY LIST BAB */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-10 text-center font-black text-emerald-500 animate-pulse uppercase tracking-widest">Sinkronisasi Outline...</div>
        ) : outline.length === 0 && !isAdding ? (
          <div className="py-16 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Belum ada outline bab yang disusun.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {outline.map((chap, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                key={chap.id}
                onClick={() => setSelectedDetail(chap)} // KLIK UNTUK DETAIL
                className="bg-white p-5 rounded-3xl border-2 border-slate-100 flex flex-col md:flex-row gap-4 items-center group relative overflow-hidden cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-black shrink-0">
                  {chap.number || index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-slate-900 uppercase truncate">{chap.title}</h4>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${chap.status === 'Selesai' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {chap.status}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">👤 {chap.pov}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">📍 {chap.location}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEditClick(e, chap)} className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                    <Edit3 size={16}/>
                  </button>
                  <button onClick={(e) => handleDeleteChapter(e, chap.id)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DETAIL OUTLINE */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-emerald-100">
              <button onClick={() => setSelectedDetail(null)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all z-10">
                <X size={20}/>
              </button>

              <div className="grid md:grid-cols-5 h-full max-h-[85vh]">
                {/* Side Info */}
                <div className="md:col-span-2 bg-emerald-600 p-8 flex flex-col text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-6">📑</div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-1">Bab {selectedDetail.number}</h3>
                  <h2 className="text-2xl font-black uppercase leading-tight mb-8 tracking-tight">{selectedDetail.title}</h2>
                  
                  <div className="space-y-4 mt-auto">
                    <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                      <p className="text-[8px] font-black uppercase opacity-60 mb-1 flex items-center gap-1"><User size={10}/> Sudut Pandang</p>
                      <p className="text-xs font-bold">{selectedDetail.pov}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                      <p className="text-[8px] font-black uppercase opacity-60 mb-1 flex items-center gap-1"><MapPin size={10}/> Lokasi</p>
                      <p className="text-xs font-bold">{selectedDetail.location}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                      <p className="text-[8px] font-black uppercase opacity-60 mb-1 flex items-center gap-1"><Clock size={10}/> Waktu</p>
                      <p className="text-xs font-bold">{selectedDetail.time}</p>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="md:col-span-3 p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <BookOpen size={14}/> Struktur Alur Adegan
                      </h4>
                      <div className="space-y-4">
                        {selectedDetail.subChapters.map((sub, i) => (
                          <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <h5 className="font-black text-sm text-slate-800 mb-3 flex items-center gap-2">
                              <span className="text-emerald-500 italic">#{i+1}</span> {sub.title}
                            </h5>
                            <ul className="space-y-2">
                              {sub.points.map((p, j) => p && (
                                <li key={j} className="text-[11px] font-medium text-slate-600 flex items-start gap-2 italic leading-relaxed">
                                  <ChevronRight size={12} className="mt-0.5 text-emerald-400 shrink-0"/> {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>

                    {selectedDetail.notes && (
                      <section className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100">
                        <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Info size={14}/> Catatan Penulis
                        </h4>
                        <p className="text-xs font-bold text-amber-800 leading-relaxed italic">"{selectedDetail.notes}"</p>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// HELPER COMPONENTS
function InputGroup({ label, children }: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">{label}</label>
      {children}
    </div>
  );
}

function MiniInput({ label, value, onChange, placeholder }: MiniInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase pl-1">{label}</label>
      <input type="text" placeholder={placeholder} value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:border-emerald-400 outline-none transition-all" />
    </div>
  );
}