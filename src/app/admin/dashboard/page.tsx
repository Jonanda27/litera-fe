// File: src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { adminDashboardService } from '@/lib/services/adminDashboardService';
import ActivityLogService from '@/lib/services/activityLogService'; // Import Service Baru
import { DashboardSummaryData } from '@/lib/types/dashboard';
import { ActivityLog } from '@/lib/types/activity'; // Import Tipe Data Baru
import { AdminStatWidget } from '@/components/dashboard/AdminStatWidget';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';

export default function AdminDashboard() {
  // 1. Inisialisasi State Reaktif
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]); // State untuk Log Aktivitas

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogLoading, setIsLogLoading] = useState<boolean>(true); // State loading terpisah untuk Log
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

  // 3. Eksekusi Pemanggilan Data (Side Effect)
  useEffect(() => {
    // Fungsi untuk mengambil metrik ringkasan
    const fetchDashboardData = async (token: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminDashboardService.getSummary(token);
        setSummaryData(data);
      } catch (err: any) {
        setError(err.message || 'Kegagalan komunikasi dengan server saat memuat metrik.');
      } finally {
        setIsLoading(false);
      }
    };

    // Fungsi untuk mengambil log aktivitas (Independen agar tidak memblokir metrik)
    const fetchActivityLogs = async (token: string) => {
      try {
        setIsLogLoading(true);
        setLogError(null);

        // Kita batasi hanya mengambil 5 aktivitas terbaru untuk dashboard
        const response = await ActivityLogService.getLogs({ limit: 5 }, token);
        setActivities(response.data);
      } catch (err: any) {
        setLogError(err.message || 'Gagal memuat jejak aktivitas sistem.');
      } finally {
        setIsLogLoading(false);
      }
    };

    // Eksekusi Paralel (High Performance)
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
        className="space-y-6 p-4 md:p-8 w-full max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">DASHBOARD ADMIN</h1>
          <p className="text-slate-500 font-medium mt-1">Ringkasan Eksekutif Sistem LITERA</p>
        </header>

        {/* State: Error Handling Utama */}
        {error && (
          <motion.div variants={itemVars} className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center shadow-sm">
            <span className="mr-3 text-xl">⚠️</span>
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}

        {/* State: Loading Utama (Skeleton Loader) */}
        {isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse h-36 rounded-2xl border border-slate-100"></div>
            ))}
          </div>
        )}

        {/* State: Success (Data Injection Metrik) */}
        {!isLoading && !error && summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatWidget
              title="Total Peserta"
              value={summaryData.totalPeserta}
              icon="👥"
              color="blue"
              variants={itemVars}
            />
            <AdminStatWidget
              title="Total Mentor"
              value={summaryData.totalMentor}
              icon="👨‍🏫"
              color="indigo"
              variants={itemVars}
            />
            <AdminStatWidget
              title="Modul Diselesaikan"
              value={summaryData.totalAktivitasModulSelesai}
              icon="✅"
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
        )}

        {/* Section: Log Activity */}
        <motion.div variants={itemVars} className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[300px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-blue-500">📡</span> Aktivitas Sistem Terkini
            </h2>
            {/* Tombol ini nantinya bisa di-route ke halaman khusus /admin/activity-logs jika mau */}
            <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              Lihat Semua Log
            </button>
          </div>

          <div className="pt-2">
            {/* Penanganan Error Spesifik untuk Log */}
            {logError ? (
              <div className="text-center text-red-500 py-8 bg-red-50 rounded-xl border border-red-100">
                <p className="font-semibold">{logError}</p>
              </div>
            ) : (
              /* Inject data riil ke komponen Timeline */
              <ActivityTimeline activities={activities} isLoading={isLogLoading} />
            )}
          </div>
        </motion.div>

      </motion.div>
    </Sidebar>
  );
}