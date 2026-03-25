"use client";

import { motion } from 'framer-motion';

interface CertLevelBarProps {
  level: number;
  progress: number;
  barColor: string;
}

export function CertLevelBar({ level, progress, barColor }: CertLevelBarProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pencapaian</span>
        <span className="font-black text-slate-800 text-3xl  uppercase tracking-tighter leading-none">
          Level {level}
        </span>
      </div>

      <div className="relative flex-1 bg-slate-100 h-12 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner group">
        {/* Track Label */}
        <div className="absolute inset-0 flex items-center justify-between px-6 z-20 pointer-events-none">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Progress</span>
          <span className="text-sm font-black text-slate-800 ">{safeProgress}%</span>
        </div>

        {/* Dynamic Bar */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} 
          className={`absolute top-0 left-0 h-full ${barColor} shadow-[10px_0_20px_rgba(0,0,0,0.15)] z-10 relative`}
        >
          {/* Bar Glossy Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/10" />
          
          {/* Text Inside Bar (Only if space allows) */}
          
        </motion.div>

        {/* Subtle Scanline Effect */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none z-30" />
      </div>
    </div>
  );
}