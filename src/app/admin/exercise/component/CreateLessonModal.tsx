"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: { title: string; type: string };
  setData: (data: any) => void;
  onSave: () => void;
}

export function CreateLessonModal({ isOpen, onClose, data, setData, onSave }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop - Kembali menggunakan warna hitam transparan dengan Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-white/20 z-10 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Tambah Materi
                </h3>
                <div className="h-1.5 w-12 bg-blue-600 rounded-full" />
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Body */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                  Judul Materi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pengenalan Algoritma"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                  Pilih Tipe Konten
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  {["pdf", "video", "evaluasi"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setData({ ...data, type: t })}
                      className={`py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                        data.type === t
                          ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5 scale-[1.02]"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {t === 'pdf' ? 'PDF' : t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={onSave}
                  className="group w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all duration-500 shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  <span>Simpan Perubahan</span>
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}