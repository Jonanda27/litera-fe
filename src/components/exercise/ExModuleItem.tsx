"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Lock, BookOpen, PlayCircle, FileText } from "lucide-react";

interface ExModuleItemProps {
  title: string;
  type: 'book' | 'video' | 'evaluasi';
  active?: boolean;
  locked?: boolean;
  completed?: boolean; // Tambahan properti
}

export function ExModuleItem({ title, type, active, locked, completed }: ExModuleItemProps) {
  const icons = {
    book: <BookOpen className="w-6 h-6" />,
    video: <PlayCircle className="w-6 h-6" />,
    evaluasi: <FileText className="w-6 h-6" />
  };

  // Logika Warna Dasar
  let containerClass = "bg-white border-slate-200 text-slate-400";
  let iconClass = "bg-slate-100 text-slate-400";
  
  if (completed) {
    containerClass = "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm";
    iconClass = "bg-emerald-500 text-white shadow-lg shadow-emerald-200";
  } else if (active) {
    containerClass = "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400 text-white shadow-xl shadow-rose-200 scale-105 z-10";
    iconClass = "bg-white/20 text-white backdrop-blur-md";
  } else if (locked) {
    containerClass = "bg-slate-50 border-slate-100 opacity-40 grayscale cursor-not-allowed";
    iconClass = "bg-slate-200 text-slate-400";
  } else {
    // Tersedia tapi belum diklik/aktif
    containerClass = "bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:shadow-lg hover:shadow-slate-100 cursor-pointer";
    iconClass = "bg-slate-100 text-slate-500 group-hover:bg-rose-50 group-hover:text-rose-500";
  }

  return (
    <motion.div 
      whileHover={!locked && !active ? { y: -5 } : {}}
      className={`relative group p-5 rounded-[2rem] border-2 transition-all duration-300 h-full flex flex-col items-center text-center overflow-hidden ${containerClass}`}
    >
      {/* Badge Selesai */}
      {completed && (
        <div className="absolute top-3 right-3 text-emerald-500">
          <CheckCircle2 size={18} />
        </div>
      )}
      
      {/* Badge Terkunci */}
      {locked && (
        <div className="absolute top-3 right-3 text-slate-400">
          <Lock size={16} />
        </div>
      )}

      {/* Icon Sphere */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${iconClass}`}>
        {icons[type]}
      </div>

      {/* Label Materi */}
      <p className={`text-[8px] font-black uppercase tracking-[0.15em] mb-1 opacity-70`}>
        {type === 'evaluasi' ? 'Assessment' : type === 'book' ? 'Reading' : 'Video Content'}
      </p>

      {/* Judul Materi */}
      <p className="text-[11px] md:text-xs font-bold leading-tight line-clamp-2 px-1 uppercase tracking-tighter ">
        {title}
      </p>

      {/* Active Indicator Line */}
      {active && (
        <motion.div 
            layoutId="activeTab"
            className="absolute bottom-0 w-full h-1 bg-white/40"
        />
      )}
    </motion.div>
  );
}