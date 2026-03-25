"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  image: string;
  color: string;
  label: string;
  description?: string;
}

export default function ToolCard({ image, color, label, description }: ToolCardProps) {
  return (
    <div className="group relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col items-center h-full">
      {/* Background Decor */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-bl-full transition-opacity duration-500`} />
      
      {/* Icon/Image Container */}
      <div className="relative mb-6 transform transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
        <div className="absolute inset-0 bg-slate-200 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
        <img 
          src={image} 
          alt={label} 
          className="w-28 h-28 object-contain relative z-10 drop-shadow-2xl"
        />
      </div>
      
      {/* Info */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-black text-slate-800 tracking-tighter uppercase mb-1">
          {label}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {description || 'LITERA Support Tool'}
        </p>
      </div>
      
      {/* Animated Action Button */}
      <div className={`mt-auto w-full py-3 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center gap-2 shadow-lg transition-all duration-300 group-hover:shadow-blue-500/20 active:scale-95`}>
        <span className="text-white font-black text-[10px] uppercase tracking-widest">
          Buka Fitur
        </span>
        <ArrowRight size={14} className="text-white transform group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-x-4 top-4 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[2rem] pointer-events-none" />
    </div>
  );
}