// File: src/components/dashboard/ActivityTimeline.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ActivityLog } from '../../lib/types/activity';

export interface ActivityTimelineProps {
    activities: ActivityLog[];
    isLoading: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, isLoading }) => {
    // Fungsi analitis untuk memetakan jenis aksi (dari backend) ke gaya visual yang representatif
    const getActionTheme = (action: string) => {
        const act = action.toUpperCase();

        // Klasifikasi Aksi Buat/Tambah
        if (act.includes('CREATE') || act.includes('REGISTER')) {
            return {
                color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
                icon: '✨',
                label: 'Dibuat'
            };
        }

        // Klasifikasi Aksi Hapus/Blokir
        if (act.includes('DELETE') || act.includes('REMOVE')) {
            return {
                color: 'bg-rose-100 text-rose-600 border-rose-200',
                icon: '🗑️',
                label: 'Dihapus'
            };
        }

        // Klasifikasi Aksi Ubah/Pembaruan
        if (act.includes('UPDATE') || act.includes('EDIT')) {
            return {
                color: 'bg-blue-100 text-blue-600 border-blue-200',
                icon: '✏️',
                label: 'Diperbarui'
            };
        }

        // Klasifikasi Aksi Autentikasi & Penyelesaian
        if (act.includes('LOGIN')) return { color: 'bg-indigo-100 text-indigo-600 border-indigo-200', icon: '🔑', label: 'Akses Masuk' };
        if (act.includes('LOGOUT')) return { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: '🚪', label: 'Akses Keluar' };
        if (act.includes('COMPLETE')) return { color: 'bg-amber-100 text-amber-600 border-amber-200', icon: '🏆', label: 'Diselesaikan' };

        // Default (Aktivitas Umum)
        return { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: '📌', label: 'Aktivitas Sistem' };
    };

    // State Loading: Kerangka Tulang (Skeleton) untuk transisi UX yang mulus
    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-start animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // State Kosong: Tidak ada log aktivitas yang ditemukan berdasarkan filter
    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="text-4xl mb-3">📭</span>
                <p className="font-medium text-sm">Belum ada aktivitas sistem yang tercatat pada rentang ini.</p>
            </div>
        );
    }

    return (
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
            {activities.map((log, index) => {
                const theme = getActionTheme(log.action);

                // Ekstrak detail spesifik dari objek JSON jika tersedia
                const hasDetails = log.details && Object.keys(log.details).length > 0;

                return (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }} // Sedikit dipercepat untuk responsivitas
                        className="relative pl-6 sm:pl-8"
                    >
                        {/* Indikator Titik Timeline */}
                        <div
                            className={`absolute -left-4.75 top-1 w-9 h-9 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center text-sm ${theme.color}`}
                        >
                            {theme.icon}
                        </div>

                        {/* Konten Log Card */}
                        <div className="bg-white hover:bg-slate-50 transition-colors p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-sm text-slate-800 leading-snug font-medium">
                                    <span className="font-bold text-slate-900">User ID: {log.userId}</span>
                                    <span className="mx-2 text-slate-400">&bull;</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme.color}`}>
                                        {theme.label}
                                    </span>
                                </p>
                                <span className="text-xs font-medium text-slate-400 shrink-0 ml-4">
                                    {new Date(log.createdAt).toLocaleString('id-ID', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </span>
                            </div>

                            <p className="text-sm text-slate-600 mt-1">
                                Operasi <strong className="text-slate-800">{log.action}</strong> pada entitas <strong className="text-blue-600">{log.resourceType}</strong>
                                {log.resourceId && <span> (ID: {log.resourceId})</span>}.
                            </p>

                            {/* Render area detail ekstraksi jika ada JSON payload (Indirection Representation) */}
                            {hasDetails && (
                                <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono text-slate-500 overflow-x-auto">
                                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};