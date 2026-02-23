"use client";
import { motion } from 'framer-motion';

export function ExProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-[#1e4e8c] h-10 rounded-full overflow-hidden relative shadow-inner border-[3px] border-white">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className="h-full bg-[#c31a26] flex items-center justify-center transition-all duration-1000 ease-out"
      >
        <span className="text-white font-black text-sm px-4 whitespace-nowrap drop-shadow-sm">
          Progres kamu {progress}%
        </span>
      </motion.div>
    </div>
  );
}