"use client";

import { motion } from 'framer-motion';

interface CertLevelBarProps {
  level: number;
  progress: number;
  barColor: string; // Misal: "bg-[#c31a26]"
}

export function CertLevelBar({ level, progress, barColor }: CertLevelBarProps) {
  // Memastikan angka tidak minus atau lebih dari 100
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Label Level di Samping */}
      <span className="font-black text-slate-800 text-xl min-w-[100px] italic uppercase tracking-tighter">
        Level-{level}
      </span>

      {/* Container Progress Bar Utama */}
      <div className="relative flex-1 bg-[#1e4e8c] h-10 rounded-full overflow-hidden shadow-lg border-4 border-white">
        
        {/* Background Layer: Muncul jika progres 0 atau rendah agar teks tidak "terpotong" */}
        {safeProgress < 15 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/40 font-black text-[10px] md:text-xs uppercase tracking-wider">
              {safeProgress === 0 
                ? "Belum ada progres (0%)" 
                : `Progres kamu ${safeProgress}%`
              }
            </span>
          </div>
        )}

        {/* Layer Utama: Bar yang bergerak (Warna dinamis dari prop barColor) */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} 
          className={`absolute top-0 left-0 h-full ${barColor} flex items-center justify-end shadow-[4px_0_10px_rgba(0,0,0,0.3)] z-10`}
        >
          {/* Teks Progres di dalam Bar: Muncul jika lebar >= 15% */}
          {safeProgress >= 15 && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white font-black text-[10px] md:text-xs whitespace-nowrap px-4 uppercase italic"
            >
              PROGRES KAMU {safeProgress}%
            </motion.span>
          )}
        </motion.div>

        {/* Glossy Overlay: Efek kilapan 3D */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10 z-20 pointer-events-none" />
      </div>
    </div>
  );
}