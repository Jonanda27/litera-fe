"use client";

import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-40 space-y-8 text-center"
    >
      <div className="relative">
        {/* Dekorasi Background Glow */}
        <div className="absolute inset-0 bg-blue-400 rounded-full blur-[80px] opacity-10 animate-pulse"></div>
        
        {/* Icon Container */}
        <div className="relative w-32 h-32 bg-white rounded-[3rem] border border-slate-100 shadow-2xl flex items-center justify-center text-slate-100 transition-transform hover:scale-105 duration-500">
          <ClipboardCheck size={64} strokeWidth={1} className="text-slate-200" />
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">
          Kanvas Evaluasi Kosong
        </h3>
        <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed px-6">
          Panel ini akan memuat seluruh pertanyaan pilihan ganda yang Anda buat. 
          Gunakan tombol <span className="text-blue-500 font-black">"Tambah Pertanyaan"</span> di panel samping untuk memulai.
        </p>
      </div>
    </motion.div>
  );
}