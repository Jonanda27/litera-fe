"use client";
import { motion } from 'framer-motion';

interface CourseCardProps {
  title: string;
  progress: number;
  type: 'level' | 'activity';
  icon?: string;
}

export function CourseCard({ title, progress, icon }: CourseCardProps) {
  return (
    <motion.div 
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-5 md:mb-6">
        <div className="text-xl md:text-2xl bg-blue-50 w-10 h-10 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform shrink-0">
          <span className="text-[#1e4e8c]">{icon || "📘"}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-800 text-base md:text-lg leading-tight truncate">{title}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Modul Aktif</p>
        </div>
      </div>

      <div className="relative pt-2">
        {/* Progress Bar Container */}
        <div className="w-full bg-slate-100 h-3 md:h-4 rounded-full overflow-hidden flex shadow-inner relative">
          
          <div className="absolute inset-0 bg-[#1e4e8c] opacity-20" /> 
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              type: "spring", 
              stiffness: 50, 
              damping: 15,
              delay: 0.2 
            }}
            className="h-full bg-[#c31a26] relative z-10 border-r-2 border-white/30 shadow-[2px_0_10px_rgba(195,26,38,0.3)]"
          />
        </div>

        {/* Label Persentase */}
        <div className="flex justify-between items-center mt-2">
           <span className="text-[9px] md:text-[10px] font-black text-[#1e4e8c] italic uppercase">
            {progress >= 100 ? "Selesai" : "On Progress"}
           </span>
           <span className="text-xs md:text-sm font-black text-slate-700">
             {progress}%
           </span>
        </div>
      </div>
    </motion.div>
  );
}