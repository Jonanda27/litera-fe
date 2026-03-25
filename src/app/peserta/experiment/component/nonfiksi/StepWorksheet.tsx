"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Save,
  X,
  Target,
  MessageSquare,
  CheckSquare,
  HelpCircle,
  BookOpen
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  answerPlaceholder: string;
  isCustomSpace: boolean;
}

interface ChecklistItem {
  id: string;
  item: string;
}

interface WorksheetItem {
  id: string;
  title: string;
  relatedChapter: string;
  chapterTitle: string;
  objective: string;
  instruction: string;
  questions: Question[];
  checklist: ChecklistItem[];
  reflection: string;
  sampleAnswer: string;
}

interface StepWorksheetProps {
  formData: any;
  onDataChange: (data: any) => void;
}

export default function StepWorksheet({ formData, onDataChange }: StepWorksheetProps) {
  const [worksheets, setWorksheets] = useState<WorksheetItem[]>(formData.worksheets || []);
  const [isAdding, setIsAdding] = useState(false);

  const [newItem, setNewItem] = useState<Partial<WorksheetItem>>({
    questions: [
      { id: "q1", text: "", answerPlaceholder: "", isCustomSpace: true },
      { id: "q2", text: "", answerPlaceholder: "", isCustomSpace: true },
      { id: "q3", text: "", answerPlaceholder: "", isCustomSpace: true }
    ],
    checklist: [
      { id: "c1", item: "" },
      { id: "c2", item: "" },
      { id: "c3", item: "" }
    ]
  });

  useEffect(() => {
    onDataChange({ ...formData, worksheets: worksheets });
  }, [worksheets]);

  const handleSave = () => {
    if (!newItem.title?.trim()) return alert("Judul Latihan wajib diisi!");
    const itemToAdd = { ...newItem, id: Date.now().toString() } as WorksheetItem;
    setWorksheets([itemToAdd, ...worksheets]);
    setIsAdding(false);
    // Reset form
    setNewItem({
      questions: [
        { id: "q1", text: "", answerPlaceholder: "", isCustomSpace: true },
        { id: "q2", text: "", answerPlaceholder: "", isCustomSpace: true },
        { id: "q3", text: "", answerPlaceholder: "", isCustomSpace: true }
      ],
      checklist: [
        { id: "c1", item: "" },
        { id: "c2", item: "" },
        { id: "c3", item: "" }
      ]
    });
  };

  return (
    <div className="space-y-6 pb-6 text-slate-800 px-2 md:px-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-rose-600 to-pink-700 p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-lg gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Worksheet Pembaca</h3>
            <p className="text-[10px] font-bold text-rose-100 uppercase tracking-tighter opacity-80 italic">Ubah teori menjadi aksi nyata bagi pembaca</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md active:scale-95 flex items-center gap-2 ${isAdding ? "bg-white text-rose-600 shadow-rose-200" : "bg-slate-900 text-rose-400"
            }`}
        >
          {isAdding ? <><X size={14} /> Batal</> : <><Plus size={14} /> Worksheet Baru</>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-xl space-y-6 md:space-y-8 relative overflow-hidden"
          >
            {/* INFO UTAMA & TUJUAN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-2 space-y-4">
                <InputWrapper label="Judul Latihan">
                  <input type="text" className="form-input-modal" placeholder="Contoh: Audit Keuangan Pribadi 30 Hari"
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                </InputWrapper>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputWrapper label="Bab">
                    <input type="text" className="form-input-modal text-center" placeholder="01"
                      onChange={(e) => setNewItem({ ...newItem, relatedChapter: e.target.value })} />
                  </InputWrapper>
                  <div className="col-span-2">
                    <InputWrapper label="Judul Bab">
                      <input type="text" className="form-input-modal" placeholder="Contoh: Mindset Sehat"
                        onChange={(e) => setNewItem({ ...newItem, chapterTitle: e.target.value })} />
                    </InputWrapper>
                  </div>
                </div>
              </div>
              <InputWrapper label="Tujuan Latihan">
                <textarea className="form-textarea-modal h-[105px]" placeholder="Setelah mengisi ini, pembaca bisa..."
                  onChange={(e) => setNewItem({ ...newItem, objective: e.target.value })}></textarea>
              </InputWrapper>
            </div>

            {/* INSTRUKSI & PERTANYAAN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 border-t border-slate-50 pt-6">
              <div className="space-y-6">
                <InputWrapper label="Instruksi Pengerjaan">
                  <div className="relative">
                    <BookOpen size={14} className="absolute left-3 top-3 text-rose-300" />
                    <textarea className="form-textarea-modal pl-10 h-24" placeholder="Jelaskan langkah-langkah praktisnya..."
                      onChange={(e) => setNewItem({ ...newItem, instruction: e.target.value })}></textarea>
                  </div>
                </InputWrapper>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pertanyaan / Tugas</label>
                  {newItem.questions?.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex gap-2">
                        <span className="text-xs font-black text-rose-500">{idx + 1}.</span>
                        <input type="text" className="flex-1 bg-transparent outline-none text-xs font-bold text-slate-700 border-b border-slate-200" placeholder="Pertanyaan..."
                          onChange={(e) => {
                            const updated = [...(newItem.questions || [])];
                            updated[idx].text = e.target.value;
                            setNewItem({ ...newItem, questions: updated });
                          }} />
                      </div>
                      <input type="text" className="w-full bg-white p-2 rounded-lg text-[11px] outline-none border border-slate-200" placeholder="Placeholder jawaban (opsional)..."
                        onChange={(e) => {
                          const updated = [...(newItem.questions || [])];
                          updated[idx].answerPlaceholder = e.target.value;
                          setNewItem({ ...newItem, questions: updated });
                        }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* CHECKLIST & REFLEKSI */}
              <div className="space-y-6">
                <div className="bg-rose-50 p-5 rounded-[2rem] border border-rose-100 space-y-4">
                  <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Checklist Pengerjaan</label>
                  <div className="space-y-2">
                    {newItem.checklist?.map((c, idx) => (
                      <div key={c.id} className="flex items-center gap-3 bg-white p-2 px-4 rounded-xl shadow-sm">
                        <CheckSquare size={14} className="text-rose-300" />
                        <input type="text" className="flex-1 bg-transparent outline-none text-[11px] font-medium" placeholder="Hal yang harus dicek..."
                          onChange={(e) => {
                            const updated = [...(newItem.checklist || [])];
                            updated[idx].item = e.target.value;
                            setNewItem({ ...newItem, checklist: updated });
                          }} />
                      </div>
                    ))}
                  </div>
                </div>

                <InputWrapper label="Refleksi Diri (Insight)">
                  <textarea className="form-textarea-modal h-20" placeholder="Pembaca diharapkan menyadari bahwa..."
                    onChange={(e) => setNewItem({ ...newItem, reflection: e.target.value })}></textarea>
                </InputWrapper>

                <InputWrapper label="Contoh Jawaban (Panduan)">
                  <textarea className="form-textarea-modal h-20 border-emerald-100 bg-emerald-50/30" placeholder="Berikan satu contoh untuk memandu pembaca..."
                    onChange={(e) => setNewItem({ ...newItem, sampleAnswer: e.target.value })}></textarea>
                </InputWrapper>
              </div>
            </div>

            <button onClick={handleSave} className="w-full py-4 bg-slate-900 text-rose-400 rounded-2xl text-[11px] font-black uppercase shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2">
              <Save size={18} /> Simpan Worksheet Pembaca
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY LIST WORKSHEETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {worksheets.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Belum ada latihan untuk pembaca.</p>
          </div>
        )}
        {worksheets.map((item) => (
          <motion.div layout key={item.id} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">Bab {item.relatedChapter}</span>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.title}</h4>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase italic">Tujuan: {item.objective}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <Target size={14} className="text-rose-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <HelpCircle size={12} className="text-slate-300" />
                <span className="text-[10px] font-black text-slate-500 uppercase">{item.questions?.length} Pertanyaan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare size={12} className="text-slate-300" />
                <span className="text-[10px] font-black text-slate-500 uppercase">{item.checklist?.filter(c => c.item).length} Checklist</span>
              </div>
            </div>

            <button
              onClick={() => setWorksheets(worksheets.filter(w => w.id !== item.id))}
              className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg flex items-center justify-center text-xs"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>

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
      .form-input-modal:focus {
        background-color: white;
        border-color: #e11d48;
        box-shadow: 0 4px 12px rgba(225, 29, 72, 0.05);
      }
      .form-textarea-modal {
        width: 100%;
        padding: 12px;
        background-color: #f8fafc;
        border: 1px solid #f1f5f9;
        border-radius: 14px;
        outline: none;
        font-size: 13px;
        font-weight: 500;
        resize: none;
        transition: all 0.2s;
        color: #334155;
        line-height: 1.5;
      }
      .form-textarea-modal:focus {
        background-color: white;
        border-color: #e11d48;
      }
      @media (min-width: 768px) {
        .form-textarea-modal { border-radius: 16px; }
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