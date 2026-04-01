"use client";

import { motion } from "framer-motion";

interface ExModuleItemProps {
  title: string;
  type: 'book' | 'video' | 'evaluasi';
  active?: boolean;
  locked?: boolean;
}

export function ExModuleItem({ title, type, active, locked }: ExModuleItemProps) {
  // Icon yang konsisten dengan tema penulis
  const icons = {
    book: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    video: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    evaluasi: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <motion.div 
      whileHover={!locked ? { 
        y: -10, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" } 
      } : {}}
      className={`relative group p-6 rounded-[2.5rem] border-2 transition-all duration-500 h-full flex flex-col items-center text-center overflow-hidden ${
        active 
          ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-500 shadow-[0_20px_40px_rgba(220,38,38,0.3)] text-white' 
          : 'bg-white/[0.03] border-white/5 text-slate-400 hover:border-red-500/50 hover:bg-red-500/5'
      } ${locked ? 'opacity-20 grayscale cursor-not-allowed border-transparent' : 'cursor-pointer'}`}
    >
      {/* Glossy Overlay Pemanis */}
      {active && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      )}

      {/* Icon Sphere dengan Hover Efek Merah */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${
        active 
          ? 'bg-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
          : 'bg-white/5 text-slate-500 group-hover:text-red-500 group-hover:bg-red-500/10 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]'
      }`}>
        {icons[type as keyof typeof icons] || icons.book}
      </div>

      {/* Label Materi */}
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 transition-colors ${
        active ? 'text-red-100' : 'text-slate-500 group-hover:text-red-400'
      }`}>
        {type === 'evaluasi' ? 'Final Check' : type === 'book' ? 'Lembar Baca' : 'Naskah Video'}
      </p>

      {/* Judul Materi */}
      <p className={`text-sm font-serif font-bold leading-tight transition-colors line-clamp-2 ${
        active ? 'text-white' : 'text-slate-300 group-hover:text-white'
      }`}>
        {title}
      </p>

      {/* Status Locked */}
      {locked && (
        <div className="absolute top-5 right-5 text-slate-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* Active Indicator Line (Ganti Dot dengan Line agar lebih modern) */}
      {active && (
        <motion.div 
            layoutId="activeLine"
            className="absolute bottom-0 w-12 h-1 bg-white rounded-t-full shadow-[0_-2px_10px_rgba(255,255,255,0.5)]"
        />
      )}
    </motion.div>
  );
}