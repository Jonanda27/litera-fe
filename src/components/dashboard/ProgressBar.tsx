"use client";

import { motion } from 'framer-motion';

export function ProgressBar({ progress }: { progress: number }) {
  // Memastikan angka adalah tipe data Number dan berada di rentang 0-100
  const numericProgress = Number(progress) || 0;
  const safeProgress = Math.min(Math.max(numericProgress, 0), 100);

  return (
    <div className="relative w-full bg-[#1e4e8c] h-8 md:h-10 rounded-full overflow-hidden shadow-lg border-2 md:border-4 border-white">
      
      {/* Background Layer: Muncul jika progres rendah (< 20%) agar teks tetap terbaca di mobile */}
      {safeProgress < 20 && (
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <span className="text-white/60 md:text-white/40 font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider text-center truncate">
            {safeProgress === 0 
              ? "Mulai progres (0%)" 
              : `Progres ${safeProgress}%` 
            }
          </span>
        </div>
      )}

      {/* Layer Utama: Bar Merah yang bergerak */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${safeProgress}%` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} 
        className="absolute top-0 left-0 h-full bg-[#c31a26] flex items-center justify-end shadow-[4px_0_10px_rgba(0,0,0,0.3)] z-10"
      >
        {/* Teks Progres di dalam Bar: Muncul jika bar sudah cukup lebar (>= 20%) */}
        {safeProgress >= 20 && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider whitespace-nowrap px-2 md:px-4"
          >
            {safeProgress}%
            <span className="hidden sm:inline"> PROGRES</span>
          </motion.span>
        )}
      </motion.div>

      {/* Glossy Overlay: Efek kilap premium */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10 z-20 pointer-events-none" />
      
    </div>
  );
}