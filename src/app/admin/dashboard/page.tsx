// File: src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion, Variants } from 'framer-motion';

// Lapisan Layanan
import { adminDashboardService } from '@/lib/services/adminDashboardService';

// Kontrak Data (Types)
import {
  DashboardSummaryData,
  MentorActivityLogData,
  DashboardChartsData,
  RiskyUser,
  DifficultModule,
  PaginationMeta,
  MentorLogsResponse
} from '@/lib/types/dashboard';

// Komponen Visual
import { AdminStatWidget } from '@/components/dashboard/AdminStatWidget';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { DashboardChartsWidget } from '@/components/dashboard/DashboardChartsWidget';
import { RetentionAnalysisWidget } from '@/components/dashboard/RetentionAnalysisWidget';

export default function AdminDashboard() {
  // --- STATE ---
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
  const [chartsData, setChartsData] = useState<DashboardChartsData | null>(null);

  const [activities, setActivities] = useState<MentorActivityLogData[]>([]);
  const [logsMeta, setLogsMeta] = useState<PaginationMeta | undefined>(undefined);
  const [logPage, setLogPage] = useState<number>(1);
  const [logFilter, setLogFilter] = useState<string>('');
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(true);

  const [riskyUsers, setRiskyUsers] = useState<RiskyUser[]>([]);
  const [difficultModules, setDifficultModules] = useState<DifficultModule[]>([]);

  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- ANIMATION VARIANTS ---
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // --- LOGIC ---
  const fetchLogs = useCallback(async (page: number, actionFilter: string) => {
    const token = localStorage.getItem('token') || '';
    if (!token) return;

    try {
      setIsLogsLoading(true);
      const response = await adminDashboardService.getMentorLogs(token, page, 10, actionFilter) as unknown as MentorLogsResponse;

      setActivities(response.data || []);
      if (response.meta) setLogsMeta(response.meta);
    } catch (err) {
      console.error("Gagal mengambil log:", err);
    } finally {
      setIsLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initGlobalData = async () => {
      const token = localStorage.getItem('token') || '';

      if (!token) {
        setError('Sesi tidak valid. Harap login kembali.');
        setIsGlobalLoading(false);
        return;
      }

      try {
        setIsGlobalLoading(true);
        setError(null);

        const [summaryRes, chartsRes, retentionRes] = await Promise.all([
          adminDashboardService.getSummary(token),
          adminDashboardService.getCharts(token),
          adminDashboardService.getRetentionAnalysis(token)
        ]);

        setSummaryData(summaryRes);
        setChartsData(chartsRes);
        setRiskyUsers(retentionRes.riskyUsers);
        setDifficultModules(retentionRes.difficultModules);

        await fetchLogs(1, '');

      } catch (err: any) {
        setError(err.message || 'Kegagalan komunikasi dengan server.');
      } finally {
        setIsGlobalLoading(false);
      }
    };

    initGlobalData();
  }, [fetchLogs]);

  const handleNudge = async (userId: number) => {
    const token = localStorage.getItem('token') || '';
    try {
      const success = await adminDashboardService.sendWhatsAppNudge(token, userId);
      if (success) alert("Pesan pengingat berhasil dikirim ke WhatsApp peserta.");
    } catch (err) {
      alert("Gagal mengirim pesan WhatsApp. Pastikan layanan WA API aktif.");
    }
  };

  const handlePageChange = (newPage: number) => {
    setLogPage(newPage);
    fetchLogs(newPage, logFilter);
  };

  const handleFilterChange = (newFilter: string) => {
    setLogFilter(newFilter);
    setLogPage(1);
    fetchLogs(1, newFilter);
  };

  return (
    <Sidebar>
      {/* Wrapper Utama dengan Background Lembut & Lebar Maksimal yang tepat */}
      <div className="min-h-screen bg-[#f8fafc] pb-16">

        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVars}
          className="max-w-400 mx-auto p-4 md:p-8 lg:px-10 space-y-2" // space-y-2 karena margin dalam komponen akan mengatur jarak antar seksi
        >
          {/* HEADER SECTION */}
          <motion.header variants={itemVars} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2 border-b border-slate-200/60">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Pusat Kendali
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-2">
                Tinjauan holistik performa platform, retensi peserta, dan log sistem.
              </p>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm w-fit">
              <span className="relative flex h-3 w-3">
                {(isGlobalLoading || isLogsLoading) ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                )}
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                {(isGlobalLoading || isLogsLoading) ? 'Menyinkronkan...' : 'Sistem Optimal'}
              </span>
            </div>
          </motion.header>

          {/* ERROR BANNER */}
          {error && (
            <motion.div variants={itemVars} className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-5 rounded-2xl shadow-sm flex items-center mb-6">
              <span className="mr-4 text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-sm">Terjadi Kesalahan</h3>
                <p className="text-xs mt-1 opacity-90">{error}</p>
              </div>
            </motion.div>
          )}

          {/* SECTION 1: STAT WIDGETS (Satu Baris Penuh, dibagi 6 kolom) */}
          <motion.section variants={itemVars}>
            {isGlobalLoading && !error ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white animate-pulse h-30 rounded-4xl border border-slate-100 shadow-sm"></div>
                ))}
              </div>
            ) : summaryData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5">
                <AdminStatWidget title="Total Peserta" value={summaryData.totalPeserta} icon="👥" color="blue" variants={itemVars} />
                <AdminStatWidget title="Total Mentor" value={summaryData.totalMentor} icon="👨‍🏫" color="indigo" variants={itemVars} />
                <AdminStatWidget title="Modul Selesai" value={summaryData.totalAktivitasModulSelesai} icon="📚" color="green" variants={itemVars} />
                <AdminStatWidget title="Rata-rata Progres" value={`${summaryData.rataRataProgresSistem}%`} icon="📈" color="orange" variants={itemVars} />
                <AdminStatWidget title="Buku Fiksi" value={summaryData.distribusiBuku?.fiksi || 0} icon="📖" color="indigo" variants={itemVars} />
                <AdminStatWidget title="Buku Non-Fiksi" value={summaryData.distribusiBuku?.nonFiksi || 0} icon="📓" color="blue" variants={itemVars} />
              </div>
            ) : null}
          </motion.section>

          {/* SECTION 2: CHARTS (Full Width - Komponen menangani 3 kolom di dalamnya) */}
          <motion.section variants={itemVars} className="w-full">
            <DashboardChartsWidget data={chartsData} isLoading={isGlobalLoading} />
          </motion.section>

          {/* SECTION 3: RETENTION & BOTTLE NECK (Full Width - Komponen menangani 2 kolom di dalamnya) */}
          <motion.section variants={itemVars} className="w-full">
            <RetentionAnalysisWidget
              riskyUsers={riskyUsers}
              difficultModules={difficultModules}
              isLoading={isGlobalLoading}
              onNudge={handleNudge}
            />
          </motion.section>

          {/* SECTION 4: ACTIVITY TIMELINE */}
          <motion.section variants={itemVars} className="pt-8">
            <div className="bg-white p-6 md:p-10 rounded-4xl shadow-xl shadow-slate-100/40 border border-slate-200/60 relative overflow-hidden group">
              {/* Dekorasi Latar */}
              <div className="absolute top-0 right-0 w-100 h-100 bg-linear-to-bl from-slate-50/80 to-transparent rounded-full -mr-40 -mt-40 pointer-events-none opacity-50 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-8 mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
                    <span className="flex h-12 w-12 items-center justify-center bg-slate-900 text-white rounded-2xl shadow-md">📡</span>
                    Jejak Audit Sistem
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2 ml-16">
                    Pemantauan real-time terhadap aktivitas pengguna dan notifikasi otomatis.
                  </p>
                </div>

                {logsMeta && (
                  <div className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl flex flex-col items-center shadow-inner">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Rekaman</span>
                    <span className="text-xl font-black text-blue-600 leading-none">{logsMeta.totalItems}</span>
                  </div>
                )}
              </div>

              <div className="relative z-10">
                <div className="overflow-x-auto custom-scrollbar pr-2">
                  <ActivityTimeline
                    activities={activities}
                    isLoading={isLogsLoading}
                    meta={logsMeta}
                    currentFilter={logFilter}
                    onPageChange={handlePageChange}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          </motion.section>

        </motion.main>
      </div>

      {/* Global Style untuk Scrollbar agar senada dengan UI */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </Sidebar>
  );
}