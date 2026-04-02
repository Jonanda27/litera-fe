// File: src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

// Lapisan Layanan (Information Expert)
import { adminDashboardService } from '@/lib/services/adminDashboardService';

// Kontrak Data (Types)
import {
  DashboardSummaryData,
  MentorActivityLogData,
  DashboardChartsData
} from '@/lib/types/dashboard';

// Komponen Visual (Presentational)
import { AdminStatWidget } from '@/components/dashboard/AdminStatWidget';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { DashboardChartsWidget } from '@/components/dashboard/DashboardChartsWidget';

export default function AdminDashboard() {
  // 1. Inisialisasi State Reaktif Terpusat
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
  const [activities, setActivities] = useState<MentorActivityLogData[]>([]);
  const [chartsData, setChartsData] = useState<DashboardChartsData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Konfigurasi Animasi Hierarkis Framer Motion
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // 3. Eksekusi Pemanggilan Data (UI Controller)
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('token') || '';

      if (!token) {
        setError('Sesi tidak valid. Harap login kembali.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Eksekusi paralel untuk efisiensi I/O jaringan (Non-blocking)
        const [summaryRes, logsRes, chartsRes] = await Promise.all([
          adminDashboardService.getSummary(token),
          adminDashboardService.getMentorLogs(token),
          adminDashboardService.getCharts(token)
        ]);

        setSummaryData(summaryRes);
        setActivities(logsRes);
        setChartsData(chartsRes);

      } catch (err: any) {
        setError(err.message || 'Kegagalan komunikasi dengan server.');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  return (
    <Sidebar>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVars}
        className="max-w-[1400px] mx-auto space-y-6 px-2 md:px-0 pb-10"
      >
        {/* Header Section */}
        <header className="mb-6 md:mb-10 pt-4 md:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Dashboard Admin
            </h1>
            <p className="text-sm text-slate-500 mt-1">Pantauan analitik sistem, produktivitas, dan aktivitas mentor Litera.</p>
          </div>

          {/* Indikator Sinkronisasi Data */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm w-fit">
            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {isLoading ? 'Menyinkronkan...' : 'Real-Time'}
            </span>
          </div>
        </header>

        {/* State: Error Handling Eksekusi API */}
        {error && (
          <motion.div
            variants={itemVars}
            className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex items-center shadow-sm text-sm"
          >
            <span className="mr-3 text-xl">⚠️</span>
            <span className="font-bold">{error}</span>
          </motion.div>
        )}

        {/* ==========================================
            BAGIAN 1: METRIK STATISTIK (KPI)
            ========================================== */}
        <section>
          {isLoading && !error ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-100 animate-pulse h-24 md:h-36 rounded-2xl border border-slate-200"></div>
              ))}
            </div>
          ) : summaryData ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <AdminStatWidget
                title="Peserta"
                value={summaryData.totalPeserta}
                icon="👥"
                color="blue"
                variants={itemVars}
              />
              <AdminStatWidget
                title="Mentor"
                value={summaryData.totalMentor}
                icon="👨‍🏫"
                color="indigo"
                variants={itemVars}
              />
              <AdminStatWidget
                title="Modul Selesai"
                value={summaryData.totalAktivitasModulSelesai}
                icon="📚"
                color="green"
                variants={itemVars}
              />
              <AdminStatWidget
                title="Rata-rata Progres"
                value={`${summaryData.rataRataProgresSistem}%`}
                icon="📈"
                color="orange"
                variants={itemVars}
              />
            </div>
          ) : null}
        </section>

        {/* ==========================================
            BAGIAN 2: VISUALISASI GRAFIK
            ========================================== */}
        <motion.section variants={itemVars}>
          <DashboardChartsWidget data={chartsData} isLoading={isLoading} />
        </motion.section>

        {/* ==========================================
            BAGIAN 3: TIMELINE LOG AKTIVITAS
            ========================================== */}
        <motion.section variants={itemVars} className="mt-8">
          <div className="bg-white p-5 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[450px] relative overflow-hidden">
            {/* Dekorasi Aksen Layar Besar */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 z-0" />

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mb-8">
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">📡</span>
                  Aktivitas Sistem & Mentor
                </h2>
              </div>

              <button className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-white transition-all bg-blue-50 hover:bg-blue-600 px-6 py-3 rounded-xl border border-blue-100 flex items-center justify-center gap-2 active:scale-95">
                Lihat Semua Log <span>→</span>
              </button>
            </div>

            <div className="pt-2 relative z-10">
              <div className="overflow-x-auto custom-scrollbar">
                <ActivityTimeline activities={activities} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </motion.section>

      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </Sidebar>
  );
}