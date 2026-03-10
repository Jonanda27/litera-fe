"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ModalInputTitleProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, category: string) => void;
}

const ModalInputTitle = ({
  isOpen,
  onClose,
  onSubmit,
}: ModalInputTitleProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Fiksi"); // Default: Fiksi
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!title.trim()) return alert("Judul buku tidak boleh kosong");
    setIsSubmitting(true);
    await onSubmit(title, category);
    setIsSubmitting(false);
    setTitle("");
    setCategory("Fiksi");
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border-4 border-[#1E4E8C]"
      >
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
          Mulai Proyek Baru
        </h2>

        {/* Input Judul */}
        <div className="mb-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
            Judul Proyek
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ketik judul buku di sini..."
            className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#1E4E8C] outline-none font-bold text-slate-700 transition-all"
            autoFocus
          />
        </div>

        {/* Pilihan Kategori */}
        <div className="mb-8">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
            Kategori Buku
          </label>
          <div className="flex gap-3">
            {["Fiksi", "Non-Fiksi"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all border-2 ${
                  category === cat
                    ? "border-[#1E4E8C] bg-blue-50 text-[#1E4E8C]"
                    : "border-slate-100 text-slate-400 hover:border-slate-200"
                }`}
              >
                {cat === "Fiksi" ? "📖 Fiksi" : "🧠 Non-Fiksi"}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 font-black text-slate-400 uppercase text-xs hover:text-slate-600 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-[#1E4E8C] text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-blue-900 disabled:opacity-50 active:scale-95 transition-all"
          >
            {isSubmitting ? "Menyiapkan..." : "Buat Proyek →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ModalInputTitle;