"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { CourseCard } from '@/components/dashboard/CourseCard';
import { SidebarRight } from '@/components/dashboard/SidebarRight';
import { ToolsSection } from '@/components/dashboard/ToolsSection';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Memanggil API summary yang sudah kita perbaiki di backend
        const response = await fetch('http://localhost:4000/api/auth/dashboard-summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Gagal mengambil data dashboard");

        const data = await response.json();
        
        /**
         * LOGIKA:
         * Data 'persentase_progres' dari BE sekarang berisi progres KUMULATIF level.
         * Contoh: Modul 1 (100%) + Modul 2 (0%) + Modul 3,4,5 (0%) = 20% Total Level.
         */
        setSummary(data);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1e4e8c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black italic text-[#1e4e8c] animate-pulse uppercase">Memuat Dashboard...</p>
      </div>
    </div>
  );

  if (!summary) return (
    <div className="flex h-screen items-center justify-center">
      <p className="font-bold text-red-600">Gagal memuat data dashboard. Pastikan server berjalan.</p>
    </div>
  );

  return (
    <Sidebar>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVars}
        className="space-y-6"
      >
        {/* Header Title */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase ">
              DASHBOARD
            </h1>
            <p className="text-[#c31a26] font-black mt-1 uppercase text-sm tracking-widest">
              {summary.level_saat_ini || "Level 1: Dasar Literasi"}
            </p>
          </div>
        </header>

        {/* PROGRESS BAR UTAMA 
          Menampilkan akumulasi dari 5 modul. 
          Jika Modul 1 Selesai, Bar ini akan menunjukkan 20%.
        */}
       <ProgressBar progress={summary.persentase_progres} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* COURSE CARD 
              Menampilkan detail progres modul yang SEDANG aktif dikerjakan.
              Misal: User sedang di Modul 2, maka progres di sini 0-100% milik modul 2.
            */}
            <CourseCard 
              type="level"
              title={summary.currentModule?.title || "Lanjutkan Belajar"}
              progress={summary.currentModule?.progress || 0}
              icon="📘"
            />

            {/* List Aktivitas */}
            <motion.div variants={containerVars} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 font-black text-slate-700 uppercase italic text-sm">
                  <span className="text-[#1e4e8c]">🚀</span> Lanjutkan Aktivitasmu
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {summary.activities && summary.activities.length > 0 ? (
                  summary.activities.map((activity: any, index: number) => (
                    <ActivityRow 
                      key={index}
                      title={activity.title}
                      progress={activity.progress}
                      btnLabel={activity.btnLabel}
                      isProject={activity.isProject}
                    />
                  ))
                ) : (
                  // Default rows jika data activity kosong dari BE
                  <>
                    <ActivityRow title="Diskusi: Etika Digital" progress={45} btnLabel="Lanjut" />
                    <ActivityRow title="Proyek Akhir Modul" progress={10} btnLabel="Mulai" isProject={true} />
                  </>
                )}
              </div>
            </motion.div>

            <ToolsSection />
          </div>

          {/* Sidebar Kanan (Info Mentor & Teman) */}
          <div className="space-y-6">
            <SidebarRight />
          </div>
        </div>
      </motion.div>
    </Sidebar>
  );
}

// Sub-component untuk Row Aktivitas
function ActivityRow({ title, progress, btnLabel, isProject = false }: any) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
        <div className={`w-full h-full flex items-center justify-center text-white text-[10px] font-black italic ${isProject ? 'bg-[#c31a26]' : 'bg-[#1e4e8c]'}`}>
          {isProject ? 'PROJ' : 'DISK'}
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-black text-slate-800 leading-tight mb-2 uppercase italic">{title}</h4>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className={`h-full ${isProject ? 'bg-[#c31a26]' : 'bg-[#1e4e8c]'}`}
          />
        </div>
      </div>
      <button className="px-5 py-2 bg-slate-900 text-white hover:bg-[#c31a26] font-black rounded-xl text-[10px] uppercase italic transition-all shadow-md active:scale-95">
        {btnLabel}
      </button>
    </div>
  );
}