"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, Check } from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

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
  const [category, setCategory] = useState("Fiksi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Baru untuk AI
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleGetAISuggestions = async () => {
    if (!title.trim() || title.length < 3) {
      return alert("Ketik minimal 3 huruf untuk mendapatkan saran AI");
    }

    setIsSuggesting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/ai/suggest-titles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ keywords: title, category }),
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Gagal mengambil saran judul:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleConfirm = async () => {
    if (!title.trim()) return alert("Judul buku tidak boleh kosong");
    setIsSubmitting(true);
    await onSubmit(title, category);
    setIsSubmitting(false);
    setTitle("");
    setCategory("Fiksi");
    setSuggestions([]);
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
        <div className="mb-6 relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
            Judul Proyek
          </label>
          <div className="relative group">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ketik kata kunci judul..."
              className="w-full p-4 pr-14 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#1E4E8C] outline-none font-bold text-slate-700 transition-all shadow-inner"
              autoFocus
            />
            
            {/* Tombol Rekomendasi AI - Diperbaiki pewarnaannya */}
            <button
              onClick={handleGetAISuggestions}
              disabled={isSuggesting || !title.trim()}
              type="button"
              title="Dapatkan Saran AI"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#1E4E8C] text-white rounded-lg hover:bg-blue-800 transition-all shadow-md active:scale-90 disabled:opacity-50 disabled:grayscale"
            >
              {isSuggesting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 fill-current" />
              )}
            </button>
          </div>

          {/* Container Saran AI */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 p-4 bg-blue-50/50 rounded-2xl border-2 border-blue-100 space-y-3"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-[#1E4E8C] uppercase tracking-[0.15em] flex items-center gap-1.5">
                    <Sparkles size={12} className="fill-current" /> Saran Judul Litera
                  </span>
                  <button onClick={() => setSuggestions([])} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <RefreshCw size={12} />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTitle(sug);
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#1E4E8C] hover:bg-blue-50 transition-all shadow-sm flex items-center justify-between group"
                    >
                      {sug} 
                      <Check size={14} className="text-[#1E4E8C] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                type="button"
                onClick={() => {
                    setCategory(cat);
                    setSuggestions([]); 
                }}
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
            onClick={() => {
                onClose();
                setSuggestions([]);
            }}
            type="button"
            className="flex-1 py-3 font-black text-slate-400 uppercase text-xs hover:text-slate-600 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            type="button"
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