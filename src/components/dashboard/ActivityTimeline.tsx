// src/components/dashboard/ActivityTimeline.tsx
import React from 'react';
import { motion } from 'framer-motion';

// Definisi kontrak data untuk Log Aktivitas (Sesuai dengan rancangan tabel ActivityLogs)
export interface ActivityLog {
    id: string | number;
    actor: string;
    role: 'Admin' | 'Mentor' | 'Peserta';
    action: string;
    target: string;
    timestamp: string; // Format ISO atau format yang sudah di-parse
}

export interface ActivityTimelineProps {
    activities: ActivityLog[];
    isLoading: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, isLoading }) => {
    // Fungsi analitis untuk memetakan jenis aksi ke warna/ikon visual yang representatif
    const getActionTheme = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('CREATE') || act.includes('TAMBAH')) return { color: 'bg-green-500', icon: '✨' };
        if (act.includes('DELETE') || act.includes('HAPUS') || act.includes('BLOCK')) return { color: 'bg-red-500', icon: '🗑️' };
        if (act.includes('UPDATE') || act.includes('UBAH')) return { color: 'bg-blue-500', icon: '✏️' };
        if (act.includes('LOGIN')) return { color: 'bg-indigo-500', icon: '🔑' };
        return { color: 'bg-slate-400', icon: '📌' }; // Default
    };

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

    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="text-4xl mb-3">📭</span>
                <p className="font-medium">Belum ada aktivitas sistem yang tercatat.</p>
            </div>
        );
    }

    return (
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
            {activities.map((log, index) => {
                const theme = getActionTheme(log.action);

                return (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-6 sm:pl-8"
                    >
                        {/* Indikator Titik Timeline */}
                        <span
                            className={`absolute -left-4.25 top-1 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-[10px] ${theme.color}`}
                        >
                            {theme.icon}
                        </span>

                        {/* Konten Log */}
                        <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-sm text-slate-700 leading-snug">
                                <span className="font-bold text-slate-900">{log.actor}</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 mx-2">
                                    {log.role}
                                </span>
                                {log.action.toLowerCase()} <span className="font-semibold text-blue-600">{log.target}</span>
                            </p>
                            <span className="block mt-2 text-xs font-medium text-slate-400">
                                {new Date(log.timestamp).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};