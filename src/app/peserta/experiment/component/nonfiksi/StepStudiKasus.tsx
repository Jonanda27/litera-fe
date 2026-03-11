"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  History, 
  Lightbulb, 
  CheckCircle2,
  Lock,
  Unlock,
  Edit3,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Info,
  AlertCircle,
  Hash // FIX: Tambahkan Hash di sini
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface CaseStudyItem {
  id: string;
  bookId: number;
  title: string;
  type: string;
  background: string;
  chronology: string;
  problem: string;
  solution: string;
  result: string;
  lessons: string[];
  relatedChapter: string;
  relatedConcept: string;
  corePrinciple: string;
  publicationStatus: string;
}

interface StepCaseStudyProps {
  formData: any;
  onDataChange: (data: any) => void;
}

export default function StepCaseStudy({ formData, onDataChange }: StepCaseStudyProps) {
  const [cases, setCases] = useState<CaseStudyItem[]>(formData.caseStudies || []);
  const [isAdding, setIsAdding] = useState<boolean>(cases.length === 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseStudyItem | null>(null);

  // Protection against loop
  const hasFetchedRef = useRef<number | null>(null);
  const lastSentDataRef = useRef("");

  const [newItem, setNewItem] = useState<Partial<CaseStudyItem>>({
    type: "Kisah Nyata",
    lessons: ["", "", ""],
    publicationStatus: "Fiktif (nama diubah)"
  });

  // --- 1. FETCH DATA DARI DATABASE ---
  useEffect(() => {
    const fetchCases = async () => {
      const bookId = formData?.bookId || formData?.id;
      if (!bookId || hasFetchedRef.current === bookId) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
       const res = await axios.get(`${API_BASE_URL}/books/case-studies/${bookId}`, {
  headers: { Authorization: `Bearer ${token}` }
});

        if (res.data && res.data.length > 0) {
          hasFetchedRef.current = bookId;
          const dbItems = res.data.map((item: any) => ({
            ...item,
            id: item.id.toString(),
            lessons: item.lessons || ["", "", ""]
          }));
          setCases(dbItems);
          setIsAdding(false);
        } else {
          setIsAdding(true);
        }
      } catch (err) {
        console.error("Gagal memuat studi kasus:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [formData?.bookId, formData?.id]);

  // --- 2. SINKRONISASI KE PARENT MODAL ---
  useEffect(() => {
    const currentDataString = JSON.stringify(cases);
    if (lastSentDataRef.current !== currentDataString) {
      lastSentDataRef.current = currentDataString;
      onDataChange({ ...formData, caseStudies: cases });
    }
  }, [cases, onDataChange, formData]);

  const caseTypes = [
    "Kisah Nyata", "Contoh Ilustrasi", "Studi Riset", 
    "Analogi", "Kisah Penulis Sendiri", "Lainnya"
  ];

  // --- 3. HANDLE SAVE (CREATE ATAU UPDATE) ---
  const handleSave = async () => {
    if (!newItem.title?.trim()) return alert("Judul Kasus wajib diisi!");
    const bookId = formData?.bookId || formData?.id;
    if (!bookId) return alert("ID Buku tidak ditemukan");

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { ...newItem, bookId };

     if (editingId) {
  // UPDATE API
  await axios.patch(`${API_BASE_URL}/books/case-studies/${editingId}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
} else {
  // CREATE API
  await axios.post(`${API_BASE_URL}/books/case-studies`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

      hasFetchedRef.current = null;
      setEditingId(null);
      setIsAdding(false);
      resetForm();

      // Refresh list
    const res = await axios.get(`${API_BASE_URL}/books/case-studies/${bookId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
      setCases(res.data.map((item: any) => ({ ...item, id: item.id.toString() })));
      
    } catch (error) {
      alert("Gagal menyimpan data ke database");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. HANDLE DELETE ---
  const removeItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus studi kasus ini?")) return;

    try {
      const token = localStorage.getItem("token");
await axios.delete(`${API_BASE_URL}/books/case-studies/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
      const updated = cases.filter((i) => i.id !== id);
      setCases(updated);
      if (updated.length === 0) setIsAdding(true);
      if (selectedCase?.id === id) setSelectedCase(null);
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const handleEdit = (e: React.MouseEvent, item: CaseStudyItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setNewItem(item);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewItem({ 
      type: "Kisah Nyata", 
      lessons: ["", "", ""], 
      publicationStatus: "Fiktif (nama diubah)",
      title: "", background: "", chronology: "", problem: "", solution: "", result: "", relatedChapter: "", relatedConcept: "", corePrinciple: ""
    });
  };

  return (
    <div className="space-y-6 pb-10 text-slate-800 relative">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-700 p-5 rounded-[2rem] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
            <ClipboardList size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Studi Kasus & Narasi</h3>
            {isLoading ? (
              <p className="text-[10px] font-bold text-indigo-200 animate-pulse uppercase">Syncing...</p>
            ) : (
              <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-tighter opacity-80 italic">Perkuat argumenmu dengan contoh nyata</p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md active:scale-95 flex items-center gap-2 ${
            isAdding ? "bg-rose-500 text-white shadow-rose-200" : "bg-white text-indigo-700 hover:bg-indigo-50"
          }`}
        >
          {isAdding ? <><X size={14}/> Batal</> : <><Plus size={14}/> Tambah Kasus</>}
        </button>
      </div>

      {/* FORM INPUT */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-xl space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-100 pb-4">
               <Edit3 size={16}/>
               <h4 className="text-[10px] font-black uppercase tracking-widest">{editingId ? "Update Analisis Kasus" : "Input Analisis Kasus Baru"}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <InputWrapper label="Judul Kasus">
                  <input type="text" className="form-input-modal" placeholder="Contoh: Kegagalan Startup X dalam Skalabilitas" 
                    value={newItem.title || ""} onChange={(e) => setNewItem({...newItem, title: e.target.value})}/>
                </InputWrapper>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Kasus</label>
                  <div className="flex flex-wrap gap-2">
                    {caseTypes.map((t) => (
                      <button key={t} type="button" onClick={() => setNewItem({...newItem, type: t})}
                        className={`py-2 px-4 rounded-full text-[9px] font-black uppercase transition-all border ${
                          newItem.type === t ? "bg-indigo-600 border-indigo-600 text-white shadow-md" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100 flex flex-col justify-center text-center space-y-2">
                <Lightbulb size={24} className="mx-auto text-indigo-500 opacity-50" />
                <p className="text-[9px] font-bold text-indigo-700 uppercase leading-relaxed px-2">Gunakan tipe "Analogi" jika konsep sangat teknis.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-50 pt-6">
              <div className="space-y-4">
                <InputWrapper label="Latar Belakang">
                  <textarea className="form-textarea-modal h-20" placeholder="Konteks situasi..." value={newItem.background || ""}
                    onChange={(e) => setNewItem({...newItem, background: e.target.value})}></textarea>
                </InputWrapper>
                <InputWrapper label="Kronologi Kejadian">
                  <div className="relative">
                    <History size={14} className="absolute left-3 top-3 text-slate-300" />
                    <textarea className="form-textarea-modal pl-10 h-32" placeholder="Urutan peristiwa..." value={newItem.chronology || ""}
                      onChange={(e) => setNewItem({...newItem, chronology: e.target.value})}></textarea>
                  </div>
                </InputWrapper>
              </div>
              <div className="space-y-4">
                <InputWrapper label="Masalah Utama">
                  <textarea className="form-textarea-modal h-20 border-rose-100 focus:border-rose-400" placeholder="Hambatan utama..." value={newItem.problem || ""}
                    onChange={(e) => setNewItem({...newItem, problem: e.target.value})}></textarea>
                </InputWrapper>
                <InputWrapper label="Solusi / Tindakan">
                  <textarea className="form-textarea-modal h-20 border-emerald-100 focus:border-emerald-400" placeholder="Langkah konkrit..." value={newItem.solution || ""}
                    onChange={(e) => setNewItem({...newItem, solution: e.target.value})}></textarea>
                </InputWrapper>
                <InputWrapper label="Hasil Akhir">
                  <input type="text" className="form-input-modal font-bold text-emerald-600" placeholder="Dampak nyata" value={newItem.result || ""}
                    onChange={(e) => setNewItem({...newItem, result: e.target.value})}/>
                </InputWrapper>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Takeaways</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                      <span className="text-indigo-400 font-black text-xs">#{idx+1}</span>
                      <input type="text" className="flex-1 bg-transparent outline-none text-[11px] font-medium" placeholder="Poin pelajaran..." 
                        value={newItem.lessons?.[idx] || ""}
                        onChange={(e) => {
                          const updated = [...(newItem.lessons || ["", "", ""])];
                          updated[idx] = e.target.value;
                          setNewItem({...newItem, lessons: updated});
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <InputWrapper label="Terkait Bab">
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-inner">
                    <input type="text" className="w-12 text-center bg-slate-100 rounded-lg p-2 text-xs font-black" placeholder="01" value={newItem.relatedChapter || ""}
                      onChange={(e) => setNewItem({...newItem, relatedChapter: e.target.value})}/>
                    <input type="text" className="flex-1 bg-transparent px-2 text-xs font-bold outline-none" placeholder="Konsep" value={newItem.relatedConcept || ""}
                      onChange={(e) => setNewItem({...newItem, relatedConcept: e.target.value})}/>
                  </div>
                </InputWrapper>
                <InputWrapper label="Prinsip Inti">
                  <input type="text" className="form-input-modal bg-white" placeholder="Integritas/Efisiensi" value={newItem.corePrinciple || ""}
                    onChange={(e) => setNewItem({...newItem, corePrinciple: e.target.value})}/>
                </InputWrapper>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Unlock size={12}/> Privasi</label>
                  <select className="form-input-modal bg-white text-[11px]" value={newItem.publicationStatus} onChange={(e) => setNewItem({...newItem, publicationStatus: e.target.value})}>
                    <option>Fiktif (nama diubah)</option>
                    <option>Ya, dengan nama asli</option>
                    <option>Ya, tapi inisial/samaran</option>
                  </select>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-slate-900 text-indigo-400 rounded-2xl text-[11px] font-black uppercase shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2">
              {isSaving ? <RefreshCw size={16} className="animate-spin"/> : <Save size={18}/>} 
              {editingId ? "Update Perubahan Ke Database" : "Simpan Analisis ke Database"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY LIST CASES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cases.length === 0 && !isAdding && !isLoading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Belum ada studi kasus.</p>
          </div>
        )}
        {cases.map((item) => (
          <motion.div layout key={item.id} onClick={() => setSelectedCase(item)}
            className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase w-fit tracking-wider">{item.type}</span>
                <h4 className="text-sm font-black text-slate-800 uppercase leading-tight mt-1 truncate max-w-[200px]">{item.title}</h4>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => handleEdit(e, item)} className="p-2 bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit3 size={14}/></button>
                <button onClick={(e) => removeItem(e, item.id)} className="p-2 bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                <div className={`p-2 rounded-lg ${item.publicationStatus.includes('asli') ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {item.publicationStatus.includes('asli') ? <Unlock size={14}/> : <Lock size={14}/>}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <div className="w-1 h-auto bg-rose-400 rounded-full" />
                <p className="text-[11px] font-medium text-slate-500 italic line-clamp-2 leading-relaxed">"{item.problem}"</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">Hasil: {item.result}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Referesi Konsep</span>
                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[150px]">Bab {item.relatedChapter || '-'}: {item.relatedConcept || 'Umum'}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowRight size={14}/>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedCase(null)}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-indigo-600 p-8 text-white relative shrink-0">
                <button onClick={() => setSelectedCase(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={28}/></button>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">{selectedCase.type}</span>
                  <span className="px-3 py-1 bg-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">{selectedCase.publicationStatus}</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight">{selectedCase.title}</h2>
                <div className="flex gap-4 mt-4 opacity-70">
                   <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><Hash size={12}/> Bab {selectedCase.relatedChapter}</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><BookOpen size={12}/> {selectedCase.relatedConcept}</p>
                </div>
              </div>

              {/* Modal Body - Narrative Layout */}
              <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar text-black">
                
                {/* Section 1: The Context */}
                <div className="grid md:grid-cols-2 gap-8 relative">
                   <div className="space-y-3">
                      <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Info size={14}/> Latar Belakang</h5>
                      <div className="bg-slate-50 p-5 rounded-3xl text-sm font-medium leading-relaxed text-slate-600 italic">"{selectedCase.background || "Tidak ada data."}"</div>
                   </div>
                   <div className="space-y-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={14}/> Kronologi</h5>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-100">{selectedCase.chronology || "-"}</p>
                   </div>
                </div>

                {/* Section 2: The Conflict (Core) */}
                <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><AlertCircle size={120}/></div>
                   <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-3">
                         <span className="px-3 py-1 bg-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Masalah Utama</span>
                         <h4 className="text-xl font-black uppercase leading-tight">{selectedCase.problem}</h4>
                      </div>
                      <div className="space-y-3">
                         <span className="px-3 py-1 bg-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Solusi Terapan</span>
                         <p className="text-sm font-medium italic opacity-90 leading-relaxed">"{selectedCase.solution}"</p>
                      </div>
                   </div>
                </div>

                {/* Section 3: The Result & Lessons */}
                <div className="grid md:grid-cols-3 gap-8 text-black">
                   <div className="md:col-span-1 space-y-4">
                      <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-100">
                         <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Hasil Akhir</h5>
                         <p className="text-lg font-black text-slate-800 leading-tight italic">"{selectedCase.result}"</p>
                      </div>
                      <div className="p-6 bg-slate-900 rounded-3xl">
                         <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Prinsip Inti</h5>
                         <p className="text-sm font-bold text-white uppercase tracking-tighter">{selectedCase.corePrinciple}</p>
                      </div>
                   </div>
                   <div className="md:col-span-2 space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14}/> Key Takeaways</h5>
                      <div className="space-y-3">
                         {selectedCase.lessons?.filter(l => l !== "").map((lesson, idx) => (
                           <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm shrink-0">{idx+1}</span>
                              <p className="text-xs font-bold text-slate-600 leading-relaxed">{lesson}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                   <button onClick={() => setSelectedCase(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-black transition-all shadow-xl">Tutup Analisis</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .form-input-modal { width: 100%; padding: 10px 14px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; outline: none; font-size: 13px; font-weight: 600; transition: all 0.2s; color: #334155; }
        .form-input-modal:focus { background-color: white; border-color: #4f46e5; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.05); }
        .form-textarea-modal { width: 100%; padding: 12px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; outline: none; font-size: 13px; font-weight: 500; resize: none; transition: all 0.2s; color: #334155; line-height: 1.5; }
        .form-textarea-modal:focus { background-color: white; border-color: #4f46e5; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
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