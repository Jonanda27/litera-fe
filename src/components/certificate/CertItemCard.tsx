"use client";

import { motion } from 'framer-motion';

interface CertItemCardProps {
  title: string;
  subtitle: string;
  isLocked?: boolean;
  isSpecial?: boolean;
  onClick?: () => void;
}

export function CertItemCard({ title, subtitle, isLocked, isSpecial, onClick }: CertItemCardProps) {
  return (
    <motion.div 
      whileHover={!isLocked ? { y: -8, scale: 1.02 } : {}}
      onClick={onClick}
      className={`relative aspect-[1.4/1] rounded-2xl border-4 p-4 flex flex-col items-center justify-center text-center transition-all duration-500 overflow-hidden ${
        isLocked 
          ? 'opacity-40 grayscale border-slate-200 bg-slate-50' 
          : 'cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]'
      } ${isSpecial && !isLocked ? 'border-[#C31A26] bg-white' : 'border-slate-200 bg-white'}`}
    >
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-40 pointer-events-none" />

      {/* Decorative Frame */}
      <div className={`absolute inset-2 border-2 rounded-xl opacity-20 ${isSpecial ? 'border-[#C31A26]' : 'border-slate-300'}`} />
      <div className={`absolute inset-3 border rounded-lg opacity-10 ${isSpecial ? 'border-[#C31A26]' : 'border-slate-300'}`} />

      {/* Ribbon/Badge */}
      {isSpecial && !isLocked && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 bg-[#C31A26] rotate-45 shadow-lg" />
            <span className="relative text-white font-black text-[10px] ">LEVEL UP</span>
          </div>
        </div>
      )}

      {/* Central Emblem */}
      <div className="mb-4 z-10 relative">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-xl transition-transform duration-700 group-hover:rotate-[360deg] ${
          isSpecial && !isLocked ? 'border-[#C31A26] bg-white' : 'border-slate-100 bg-white'
        }`}>
          <span className={`font-black text-2xl  ${isSpecial && !isLocked ? 'text-[#C31A26]' : 'text-slate-300'}`}>Q</span>
        </div>
        {!isLocked && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
            <span className="text-[10px]">⭐</span>
          </div>
        )}
      </div>

      {/* Typography */}
      <div className="z-10 px-2 space-y-1">
        <h3 className={`text-xs md:text-sm font-black leading-tight uppercase tracking-tighter  ${
          isLocked ? 'text-slate-400' : 'text-slate-900'
        }`}>
          {title}
        </h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {subtitle}
        </p>
      </div>

      {/* Authentic Seal Effect */}
      <div className="absolute bottom-2 right-2 opacity-[0.05] grayscale z-0">
        <div className="w-12 h-12 border-4 border-black rounded-full" />
      </div>
    </motion.div>
  );
}