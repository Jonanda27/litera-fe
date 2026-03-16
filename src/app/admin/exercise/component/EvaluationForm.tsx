"use client";

import { Question } from "@/lib/types/exercise";
import { Trash2, CheckCircle2, ClipboardCheck, AlertCircle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EvaluationFormProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
}

export function EvaluationForm({ questions, setQuestions }: EvaluationFormProps) {
  
  const updateQuestion = (idx: number, field: string, value: any) => {
    const newQs = [...questions];
    (newQs[idx] as any)[field] = value;
    setQuestions(newQs);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const newQs = [...questions];
    newQs[qIdx].options[oIdx].text = value;
    setQuestions(newQs);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <AnimatePresence mode="popLayout">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout // Animasi perpindahan posisi saat ada soal yang dihapus
            className="group relative"
          >
            {/* Soft Glow Effect saat Hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-[2rem] blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
              
              {/* Header Card: Ringkas & Elegan */}
              <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black  text-base shadow-lg shadow-slate-200">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Blok Pertanyaan</h4>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeQuestion(q.id)}
                  className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </motion.button>
              </div>

              <div className="p-8 space-y-8">
                {/* Input Soal */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest ml-1">
                    <HelpCircle size={14} className="text-blue-400"/> Narasi Pertanyaan
                  </div>
                  <textarea
                    className="w-full bg-slate-50/50 rounded-[1.5rem] p-5 text-lg font-bold text-slate-800 tracking-tight outline-none border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all duration-300 resize-none min-h-[110px] placeholder:text-slate-300"
                    placeholder="Apa yang ingin Anda tanyakan?..."
                    value={q.text}
                    onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                  />
                </div>

                {/* Grid Jawaban */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Pilihan Jawaban</span>
                     <span className="text-[9px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-tighter">Pilih Kunci</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.correctAnswer === opt.id;
                      return (
                        <motion.div
                          key={opt.id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateQuestion(idx, 'correctAnswer', opt.id)}
                          className={`group/opt relative flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all duration-300 cursor-pointer
                            ${isCorrect 
                              ? "bg-emerald-50/50 border-emerald-400 shadow-md shadow-emerald-100" 
                              : "bg-white border-slate-100 hover:border-blue-300 hover:bg-slate-50/50"
                            }`}
                        >
                          {/* Circle Label Huruf */}
                          <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm transition-all duration-500
                            ${isCorrect 
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg rotate-[360deg]" 
                              : "bg-slate-50 border-slate-200 text-slate-400 group-hover/opt:text-blue-500"
                            }`}
                          >
                            {opt.id}
                          </div>

                          <input
                            type="text"
                            className={`w-full bg-transparent font-bold text-sm outline-none transition-colors
                              ${isCorrect ? "text-emerald-900" : "text-slate-600"}`}
                            value={opt.text}
                            placeholder={`Pilihan ${opt.id}...`}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                          />

                          {isCorrect && (
                             <motion.div 
                               initial={{ scale: 0 }} 
                               animate={{ scale: 1 }} 
                               className="bg-emerald-500 text-white p-1.5 rounded-full shadow-inner"
                             >
                                <CheckCircle2 size={14} />
                             </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Info Footer Validasi */}
              {!q.text && (
                <div className="bg-amber-50/50 px-8 py-3 flex items-center gap-3 text-amber-600 font-black text-[9px] uppercase tracking-[0.1em] border-t border-amber-100/50">
                  <AlertCircle size={14} />
                  Peringatan: Isi teks pertanyaan agar dapat disimpan.
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State: Tetap Estetik */}
      {questions.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 space-y-6 text-center"
        >
          <div className="relative w-24 h-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl flex items-center justify-center text-slate-200">
             <ClipboardCheck size={48} strokeWidth={1.5}/>
          </div>
          <div className="space-y-2">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter ">Kanvas Kuis Kosong</h3>
             <p className="text-sm text-slate-400 font-bold max-w-xs">Tekan tombol <span className="text-blue-500">Tambah Pertanyaan</span> untuk mulai.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}