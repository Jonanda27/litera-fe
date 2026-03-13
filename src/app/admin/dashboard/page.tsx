"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { adminDashboardService } from '@/lib/services/adminDashboardService';
import { DashboardSummaryData } from '@/lib/types/dashboard';
import { AdminStatWidget } from '@/components/dashboard/AdminStatWidget';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';

export default function AdminDashboard() {
  // 1. Inisialisasi State Reaktif
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
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

  // 3. Eksekusi Pemanggilan Data (Side Effect)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mengambil token otorisasi dari storage (bisa disesuaikan jika menggunakan Cookies)
        const token = localStorage.getItem('token') || '';

        // Memanggil API melalui Service Layer (High Cohesion)
        const data = await adminDashboardService.getSummary(token);
        setSummaryData(data);
      } catch (err: any) {
        setError(err.message || 'Kegagalan komunikasi dengan server saat memuat metrik.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
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

        {/* State: Error Handling */}
        {error && (
          <motion.div variants={itemVars} className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center shadow-sm">
            <span className="mr-3 text-xl">⚠️</span>
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}

        {/* State: Loading (Skeleton Loader) */}
        {isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse h-36 rounded-2xl border border-slate-100"></div>
            ))}
          </div>
        )}

        {/* State: Success (Data Injection) */}
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
        {!isLoading && !error && (
          <motion.div variants={itemVars} className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-75">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Aktivitas Sistem Terkini</h2>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Lihat Semua</button>
            </div>

            <div className="pt-2">
              {/* Memanggil komponen ActivityTimeline.
                Saat ini property activities di-set ke array kosong, yang akan menampilkan state "kosong" (empty state)
                hingga kita membangun endpoint API khusus untuk mengambil data log aktivitas.
              */}
              <ActivityTimeline activities={[]} isLoading={isLoading} />
            </div>
          </motion.div>
        )}

      </motion.div>
    </Sidebar>
  );
}