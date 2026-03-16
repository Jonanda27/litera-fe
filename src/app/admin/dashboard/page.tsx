// File: src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { adminDashboardService } from '@/lib/services/adminDashboardService';
import ActivityLogService from '@/lib/services/activityLogService';
import { DashboardSummaryData } from '@/lib/types/dashboard';
import { ActivityLog } from '@/lib/types/activity';
import { AdminStatWidget } from '@/components/dashboard/AdminStatWidget';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';

export default function AdminDashboard() {
  // 1. Inisialisasi State Reaktif
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogLoading, setIsLogLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logError, setLogError] = useState<string | null>(null);

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

  // 3. Eksekusi Pemanggilan Data
  useEffect(() => {
    const fetchDashboardData = async (token: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminDashboardService.getSummary(token);
        setSummaryData(data);
      } catch (err: any) {
        setError(err.message || 'Kegagalan komunikasi dengan server.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchActivityLogs = async (token: string) => {
      try {
        setIsLogLoading(true);
        setLogError(null);
        const response = await ActivityLogService.getLogs({ limit: 5 }, token);
        setActivities(response.data);
      } catch (err: any) {
        setLogError(err.message || 'Gagal memuat jejak aktivitas.');
      } finally {
        setIsLogLoading(false);
      }
    };

    const initData = () => {
      const token = localStorage.getItem('token') || '';
      if (!token) {
        setError('Sesi tidak valid. Harap login kembali.');
        setIsLoading(false);
        setIsLogLoading(false);
        return;
      }
      fetchDashboardData(token);
      fetchActivityLogs(token);
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
        <header className="mb-6 md:mb-10 pt-4 md:pt-0">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Dashboard Admin
          </h1>
        </header>

        {/* State: Error Handling */}
        {error && (
          <motion.div 
            variants={itemVars} 
            className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex items-center shadow-sm text-sm"
          >
            <span className="mr-3 text-xl">⚠️</span>
            <span className="font-bold">{error}</span>
          </motion.div>
        )}

        {/* Grid Metrik Statistik - Dibuat 2 Kolom di Mobile agar tidak polos kebawah */}
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
                title="Tuntas"
                value={summaryData.totalAktivitasModulSelesai}
                icon="✅"
                color="green"
                variants={itemVars}
              />
              <AdminStatWidget
                title="Progres"
                value={`${summaryData.rataRataProgresSistem}%`}
                icon="📈"
                color="orange"
                variants={itemVars}
              />
            </div>
          ) : null}
        </section>

        {/* Section: Log Activity */}
        <motion.section variants={itemVars} className="mt-8">
          <div className="bg-white p-5 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[450px] relative overflow-hidden">
            {/* Dekorasi Aksen Layar Besar */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 z-0" />
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mb-8">
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">📡</span> 
                  Aktivitas Sistem
                </h2>
              </div>
              
              <button className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-white transition-all bg-blue-50 hover:bg-blue-600 px-6 py-3 rounded-xl border border-blue-100 flex items-center justify-center gap-2 active:scale-95">
                Lihat Semua Log <span>→</span>
              </button>
            </div>

            <div className="pt-2 relative z-10">
              {logError ? (
                <div className="text-center text-red-500 py-16 bg-red-50 rounded-[2rem] border-2 border-dashed border-red-200">
                  <p className="font-black uppercase tracking-tighter text-sm">{logError}</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                   <ActivityTimeline activities={activities} isLoading={isLogLoading} />
                </div>
              )}
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