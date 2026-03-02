"use client";

import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { CourseCard } from '@/components/dashboard/CourseCard';
import { SidebarRight } from '@/components/dashboard/SidebarRight';
import { ToolsSection } from '@/components/dashboard/ToolsSection';

export default function Dashboard() {
  // Kontainer animasi untuk stagger effect (muncul satu per satu)
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <Sidebar>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVars}
        className="space-y-6"
      >
        {/* Header Title */}
        <header>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">DASHBOARD KAMU</h1>
          <p className="text-red-600 font-bold mt-1">Level 1: Dasar-Dasar Literasi</p>
        </header>

        {/* Main Progress Bar */}
        <ProgressBar progress={90} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content (Main) */}
          <div className="lg:col-span-2 space-y-6">
            
            <CourseCard 
              type="level"
              title="Lanjutkan Level-1/Modul-2"
              progress={55}
              icon="📘"
            />

            <motion.div variants={containerVars} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="text-blue-600">⚙️</span> Lanjutkan Aktivitasmu
                </div>
                <span className="text-slate-400 font-mono">{">"}</span>
              </div>
              
              <div className="p-4 space-y-4">
                <ActivityRow 
                  image="/avatar-mentor.png" // Ganti dengan path image asli
                  title="Diskusi: Goal Setting Challenge"
                  progress={40}
                  btnLabel="Ikuti"
                />
                <ActivityRow 
                  image="/book-icon.png" 
                  title="Lanjutkan Proyekmu: Buku Biografi Mamak"
                  progress={15}
                  btnLabel="Buka"
                  isProject
                />
              </div>
            </motion.div>

            <ToolsSection />
          </div>

          {/* Right Content (Sidebar) */}
          <SidebarRight />
        </div>
      </motion.div>
    </Sidebar>
  );
}

// Sub-component kecil untuk baris aktivitas
function ActivityRow({ image, title, progress, btnLabel, isProject = false }: any) {
  return (
    <div className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors">
      <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
        {/* Placeholder image */}
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs">IMG</div>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-800 leading-tight mb-2">{title}</h4>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${isProject ? 'bg-blue-600' : 'bg-red-600'}`}
          />
        </div>
      </div>
      <button className="px-5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-all">
        {btnLabel}
      </button>
    </div>
  );
}