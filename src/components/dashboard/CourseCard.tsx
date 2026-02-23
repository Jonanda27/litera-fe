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
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl bg-blue-50 w-10 h-10 flex items-center justify-center rounded-lg">
          <span className="text-[#1e4e8c]">📘</span>
        </div>
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      </div>

      <div className="relative pt-2">
        {/* Progress Bar Background */}
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex shadow-inner">
          {/* Bagian Biru */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '25%' }}
            className="h-full bg-[#1e4e8c]"
          />
          {/* Bagian Merah (Progress Aktif) */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-full bg-[#c31a26] border-l-2 border-white/20"
          />
        </div>
        <span className="absolute right-0 -top-5 text-xs font-bold text-slate-500">
          {progress}%
        </span>
      </div>
    </motion.div>
  );
}