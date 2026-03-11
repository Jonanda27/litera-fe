"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Layout, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  GripVertical, 
  CheckSquare,
  BookOpen,
  ArrowRightCircle,
  Edit3,
  RefreshCw,
  Hash,
  Target,
  ListChecks,
  ChevronRight,
  Info
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface SubChapter {
  id: string;
  title: string;
  mainPoint: string;
  explanation: string;
  evidence: string;
}

interface ChapterStructure {
  id: string;
  bookId: number;
  chapterNumber: string;
  title: string;
  hook: string;
  learningPoints: string[];
  subChapters: SubChapter[];
  summaryPoints: string[];
  reflections: string[];
  actions: string[];
  nextPreview: string;
}

interface StepStructureProps {
  formData: any;
  onDataChange: (data: any) => void;
}

export default function StepChapterStructure({ formData, onDataChange }: StepStructureProps) {
  const [structures, setStructures] = useState<ChapterStructure[]>(formData.chapterStructures || []);
  const [isAdding, setIsAdding] = useState<boolean>(structures.length === 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<ChapterStructure | null>(null);

  // Refs for protection
  const hasFetchedRef = useRef<number | null>(null);
  const lastSentDataRef = useRef("");

  const [newItem, setNewItem] = useState<Partial<ChapterStructure>>({
    chapterNumber: "",
    title: "",
    hook: "",
    learningPoints: ["", "", ""],
    subChapters: [
      { id: "s1", title: "", mainPoint: "", explanation: "", evidence: "" },
    ],
    summaryPoints: ["", ""],
    reflections: ["", ""],
    actions: ["", ""],
    nextPreview: ""
  });

  // --- 1. FETCH DATA DARI DATABASE ---
  useEffect(() => {
    const fetchStructures = async () => {
      const bookId = formData?.bookId || formData?.id;
      if (!bookId || hasFetchedRef.current === bookId) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/books/chapter-structures/${bookId}`, {
  headers: { Authorization: `Bearer ${token}` }
});

        if (res.data && res.data.length > 0) {
          hasFetchedRef.current = bookId;
          const dbItems = res.data.map((item: any) => ({
            ...item,
            id: item.id.toString(),
            learningPoints: item.learningPoints || ["", "", ""],
            subChapters: item.subChapters || [{ id: "s1", title: "", mainPoint: "", explanation: "", evidence: "" }],
            summaryPoints: item.summaryPoints || ["", ""],
            actions: item.actions || ["", ""]
          }));
          setStructures(dbItems);
          setIsAdding(false);
        } else {
          setIsAdding(true);
        }
      } catch (err) {
        console.error("Gagal memuat struktur bab:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStructures();
  }, [formData?.bookId, formData?.id]);

  // --- 2. SINKRONISASI KE PARENT MODAL ---
  useEffect(() => {
    const currentDataString = JSON.stringify(structures);
    if (lastSentDataRef.current !== currentDataString) {
      lastSentDataRef.current = currentDataString;
      onDataChange({ ...formData, chapterStructures: structures });
    }
  }, [structures, onDataChange, formData]);

  const addSubChapter = () => {
    setNewItem({
      ...newItem,
      subChapters: [
        ...(newItem.subChapters || []),
        { id: Date.now().toString(), title: "", mainPoint: "", explanation: "", evidence: "" }
      ]
    });
  };

  // --- 3. HANDLE SAVE (CREATE ATAU UPDATE) ---
  const handleSave = async () => {
    if (!newItem.title?.trim()) return alert("Judul Bab wajib diisi!");
    const bookId = formData?.bookId || formData?.id;
    if (!bookId) return alert("ID Buku tidak ditemukan");

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { ...newItem, bookId };

     if (editingId) {
  await axios.patch(`${API_BASE_URL}/books/chapter-structures/${editingId}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
} else {
  await axios.post(`${API_BASE_URL}/books/chapter-structures`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

      hasFetchedRef.current = null;
      setEditingId(null);
      setIsAdding(false);
      resetForm();

      // Refresh data
      const res = await axios.get(`${API_BASE_URL}/books/chapter-structures/${bookId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
      setStructures(res.data.map((item: any) => ({ ...item, id: item.id.toString() })));
      
    } catch (error) {
      alert("Gagal menyimpan ke database");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. HANDLE DELETE ---
  const removeItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus struktur bab ini?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/books/chapter-structures/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
      const updated = structures.filter((s) => s.id !== id);
      setStructures(updated);
      if (updated.length === 0) setIsAdding(true);
      if (selectedStructure?.id === id) setSelectedStructure(null);
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const handleEdit = (e: React.MouseEvent, item: ChapterStructure) => {
    e.stopPropagation();
    setNewItem(item);
    setEditingId(item.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewItem({
      chapterNumber: "", title: "", hook: "",
      learningPoints: ["", "", ""],
      subChapters: [{ id: "s1", title: "", mainPoint: "", explanation: "", evidence: "" }],
      summaryPoints: ["", ""], reflections: ["", ""], actions: ["", ""], nextPreview: ""
    });
  };

  return (
    <div className="space-y-6 pb-10 text-slate-800 relative">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-cyan-700 p-5 rounded-[2rem] shadow-lg border-b-4 border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
            <Layout size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Arsitektur Struktur Bab</h3>
            {isLoading ? (
              <p className="text-[10px] font-bold text-blue-100 animate-pulse uppercase">Syncing Database...</p>
            ) : (
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-tighter opacity-80 italic">Rancang alur logika pembaca per bab</p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md active:scale-95 flex items-center gap-2 ${
            isAdding ? "bg-rose-500 text-white shadow-rose-200" : "bg-white text-blue-700 hover:bg-blue-50"
          }`}
        >
          {isAdding ? <><X size={14}/> Batal</> : <><Plus size={14}/> Struktur Baru</>}
        </button>
      </div>

      {/* FORM INPUT */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-8 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-4">
              <Edit3 size={16}/>
              <h4 className="text-[10px] font-black uppercase tracking-widest">{editingId ? "Update Arsitektur Bab" : "Buat Arsitektur Bab Baru"}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <InputWrapper label="Bab Ke-">
                <input type="text" className="form-input-modal text-center font-black" placeholder="01"
                  value={newItem.chapterNumber || ""} onChange={(e) => setNewItem({...newItem, chapterNumber: e.target.value})}/>
              </InputWrapper>
              <div className="md:col-span-3">
                <InputWrapper label="Judul Bab Utama">
                  <input type="text" className="form-input-modal font-black text-blue-600 uppercase" placeholder="Contoh: Fondasi Berpikir Kritis"
                    value={newItem.title || ""} onChange={(e) => setNewItem({...newItem, title: e.target.value})}/>
                </InputWrapper>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                <BookOpen size={14}/> I. Pembuka Bab
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputWrapper label="Hook (Kisah/Fakta/Pertanyaan)">
                  <textarea className="form-textarea-modal h-24" placeholder="Tuliskan pembuka..."
                    value={newItem.hook || ""} onChange={(e) => setNewItem({...newItem, hook: e.target.value})}></textarea>
                </InputWrapper>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Objectives:</label>
                  {newItem.learningPoints?.map((lp, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                      <CheckSquare size={14} className="text-blue-400" />
                      <input type="text" className="flex-1 bg-transparent outline-none text-[11px] font-medium" placeholder="Poin pembelajaran..."
                        value={lp} onChange={(e) => {
                          const updated = [...(newItem.learningPoints || [])];
                          updated[idx] = e.target.value;
                          setNewItem({...newItem, learningPoints: updated});
                        }}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <GripVertical size={14}/> II. Isi Inti (Sub-Bab)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newItem.subChapters?.map((sub, idx) => (
                  <div key={sub.id} className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100/50 space-y-4 relative group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase">Sub-Bab {idx + 1}</span>
                    </div>
                    <input type="text" className="w-full bg-white border-b-2 border-blue-200 p-2 text-sm font-black outline-none focus:border-blue-500 uppercase tracking-tight" placeholder="Judul Sub-Bab..."
                      value={sub.title} onChange={(e) => {
                        const updated = [...(newItem.subChapters || [])];
                        updated[idx].title = e.target.value;
                        setNewItem({...newItem, subChapters: updated});
                      }}/>
                    <div className="space-y-3">
                      <MiniInputModal label="Poin Utama" placeholder="Argumen utama..." value={sub.mainPoint}
                        onChange={(v) => {
                          const updated = [...(newItem.subChapters || [])];
                          updated[idx].mainPoint = v;
                          setNewItem({...newItem, subChapters: updated});
                        }}/>
                      <MiniInputModal label="Penjelasan" placeholder="Detail logika..." value={sub.explanation}
                        onChange={(v) => {
                          const updated = [...(newItem.subChapters || [])];
                          updated[idx].explanation = v;
                          setNewItem({...newItem, subChapters: updated});
                        }}/>
                      <MiniInputModal label="Contoh/Data" placeholder="Bukti pendukung..." value={sub.evidence}
                        onChange={(v) => {
                          const updated = [...(newItem.subChapters || [])];
                          updated[idx].evidence = v;
                          setNewItem({...newItem, subChapters: updated});
                        }}/>
                    </div>
                    {newItem.subChapters!.length > 1 && (
                      <button onClick={() => {
                        const updated = newItem.subChapters!.filter((_, i) => i !== idx);
                        setNewItem({...newItem, subChapters: updated});
                      }} className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                    )}
                  </div>
                ))}
                <button onClick={addSubChapter} className="border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-10 text-slate-300 hover:text-blue-400 hover:border-blue-100 transition-all group">
                  <Plus size={40} className="group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-xs font-black uppercase tracking-widest">Tambah Sub-Bab</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl space-y-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] border-b border-white/10 pb-2 flex items-center gap-2">
                <Save size={14}/> III. Penutup Bab
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ringkasan Utama</label>
                  {newItem.summaryPoints?.map((sp, idx) => (
                    <input key={idx} type="text" className="bg-white/5 border border-white/10 p-3 rounded-xl w-full text-[11px] outline-none focus:border-blue-400" placeholder={`Poin #${idx+1}`}
                      value={sp} onChange={(e) => {
                        const updated = [...(newItem.summaryPoints || [])];
                        updated[idx] = e.target.value;
                        setNewItem({...newItem, summaryPoints: updated});
                      }}/>
                  ))}
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tugas Pembaca</label>
                  {newItem.actions?.map((ac, idx) => (
                    <input key={idx} type="text" className="bg-white/5 border border-white/10 p-3 rounded-xl w-full text-[11px] outline-none focus:border-blue-400" placeholder={`Tugas #${idx+1}`}
                      value={ac} onChange={(e) => {
                        const updated = [...(newItem.actions || [])];
                        updated[idx] = e.target.value;
                        setNewItem({...newItem, actions: updated});
                      }}/>
                  ))}
                </div>
                <InputWrapper label="Hook ke Bab Berikutnya">
                  <textarea className="bg-white/5 border border-white/10 p-4 rounded-[1.5rem] w-full text-[11px] outline-none focus:border-blue-400 h-[105px] resize-none" placeholder="Next preview..."
                    value={newItem.nextPreview || ""} onChange={(e) => setNewItem({...newItem, nextPreview: e.target.value})}></textarea>
                </InputWrapper>
              </div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
              {isSaving ? <RefreshCw size={18} className="animate-spin"/> : <Save size={18}/>} 
              {editingId ? "Update Rencana Bab Ke Database" : "Simpan Arsitektur Bab"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY LIST STRUCTURES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {structures.length === 0 && !isAdding && !isLoading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Belum ada struktur bab.</p>
          </div>
        )}
        {structures.map((item, idx) => (
          <motion.div layout key={item.id} onClick={() => setSelectedStructure(item)}
            className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all group relative overflow-hidden flex gap-6 items-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shrink-0 border border-blue-100">
              {item.chapterNumber || idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1 truncate">{item.title}</h4>
              <div className="flex gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase">📦 {item.subChapters.length} Sub-Bab</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                  <ArrowRightCircle size={12}/> Next: {item.nextPreview ? "Yes" : "None"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => handleEdit(e, item)} className="p-2 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit3 size={16}/></button>
              <button onClick={(e) => removeItem(e, item.id)} className="p-2 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedStructure && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedStructure(null)}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-blue-700 p-8 text-white relative shrink-0">
                <button onClick={() => setSelectedStructure(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={28}/></button>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl">
                    {selectedStructure.chapterNumber}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Chapter Blueprint</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight">{selectedStructure.title}</h2>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar text-black">
                
                {/* Pembuka Section */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Target size={14}/> The Hook</h5>
                    <p className="bg-slate-50 p-6 rounded-3xl text-sm font-medium leading-relaxed text-slate-600 italic border border-slate-100">
                      "{selectedStructure.hook}"
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ListChecks size={14}/> Learning Objectives</h5>
                    <div className="space-y-2">
                      {selectedStructure.learningPoints?.filter(p => p !== "").map((point, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-blue-50/50 p-3 rounded-xl">
                          <CheckSquare size={14} className="text-blue-400 shrink-0"/> {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sub-Chapters Detail Section */}
                <div className="space-y-6">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Info size={14}/> Detailed Body Map</h5>
                  <div className="grid gap-4">
                    {selectedStructure.subChapters?.map((sub, i) => (
                      <div key={i} className="p-6 border-2 border-slate-50 rounded-[2.5rem] bg-white hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                           <span className="text-xs font-black text-blue-600">#{i+1}</span>
                           <h4 className="text-base font-black uppercase tracking-tight">{sub.title}</h4>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Main Point</p>
                              <p className="text-xs font-bold text-slate-800">{sub.mainPoint || "-"}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Explanation</p>
                              <p className="text-xs font-medium text-slate-500 leading-relaxed">{sub.explanation || "-"}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Evidence/Example</p>
                              <p className="text-xs font-medium italic text-blue-600">{sub.evidence || "-"}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Closing Section */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white grid md:grid-cols-3 gap-10">
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Summary Takeaway</h5>
                      <ul className="space-y-3">
                         {selectedStructure.summaryPoints?.filter(p => p !== "").map((p, i) => (
                           <li key={i} className="text-xs font-medium opacity-80 flex gap-2">
                             <span className="text-blue-500">•</span> {p}
                           </li>
                         ))}
                      </ul>
                   </div>
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Action Items</h5>
                      <ul className="space-y-3">
                         {selectedStructure.actions?.filter(p => p !== "").map((p, i) => (
                           <li key={i} className="text-xs font-bold flex gap-2">
                             <span className="text-emerald-500">✓</span> {p}
                           </li>
                         ))}
                      </ul>
                   </div>
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Next Preview</h5>
                      <p className="text-xs italic leading-relaxed opacity-70">
                         {selectedStructure.nextPreview || "No preview set."}
                      </p>
                      <div className="pt-2">
                         <div className="w-10 h-1 bg-orange-400/30 rounded-full" />
                      </div>
                   </div>
                </div>

                <div className="pt-6 flex justify-end">
                   <button onClick={() => setSelectedStructure(null)} className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all">Close Blueprint</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .form-input-modal { width: 100%; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; outline: none; font-size: 13px; font-weight: 700; transition: all 0.2s; color: #334155; }
        .form-input-modal:focus { background-color: white; border-color: #2563eb; }
        .form-textarea-modal { width: 100%; padding: 16px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 20px; outline: none; font-size: 13px; font-weight: 500; resize: none; transition: all 0.2s; color: #334155; line-height: 1.6; }
        .form-textarea-modal:focus { background-color: white; border-color: #2563eb; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function InputWrapper({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}

function MiniInputModal({ label, placeholder, value, onChange }: { label: string, placeholder: string, value?: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-blue-400 uppercase tracking-wider ml-1">{label}</label>
      <input type="text" className="w-full bg-white border border-blue-100 p-2 rounded-xl text-xs font-bold outline-none focus:border-blue-400 transition-all" 
        placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}/>
    </div>
  );
}