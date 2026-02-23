"use client";
import { motion } from 'framer-motion';

interface ExModuleCardProps {
  title: string;
  type: 'book' | 'video';
  status: 'done' | 'active' | 'locked';
}

export function ExModuleCard({ title, type, status }: ExModuleCardProps) {
  const isActive = status === 'active';
  const isLocked = status === 'locked';

  return (
    <motion.div
      whileHover={!isLocked ? { y: -4, scale: 1.02 } : {}}
      className={`relative p-3 rounded-xl border-2 flex flex-col items-center text-center h-full transition-all ${
        isActive ? 'bg-[#FFF3E0] border-[#FFCC80] shadow-md' : 'bg-white border-slate-100 shadow-sm'
      } ${isLocked ? 'opacity-40 grayscale' : 'cursor-pointer'}`}
    >
      {/* Icon Area */}
      <div className="h-14 flex items-center justify-center mb-2">
        {type === 'book' ? (
          <span className="text-4xl drop-shadow-sm">📚</span>
        ) : (
          <div className={`w-12 h-8 rounded-md flex items-center justify-center shadow-inner ${
            isActive ? 'bg-[#FF0000]' : 'bg-slate-500'
          }`}>
            <span className="text-white text-lg">▶️</span>
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-[10px] font-black text-slate-700 leading-tight uppercase tracking-tighter">
        {title}
      </p>
    </motion.div>
  );
}