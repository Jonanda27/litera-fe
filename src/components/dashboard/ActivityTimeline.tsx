// src/components/dashboard/ActivityTimeline.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MentorActivityLogData } from '../../lib/types/dashboard';

export interface ActivityTimelineProps {
    activities: MentorActivityLogData[];
    isLoading: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, isLoading }) => {
    // Fungsi analitis untuk memetakan jenis aksi ke gaya visual yang representatif (Information Expert)
    const getActionTheme = (action: string) => {
        const act = action.toUpperCase();

        // Klasifikasi Aksi Mentoring & Review
        if (act.includes('REVIEW') || act.includes('COMMENT') || act.includes('FEEDBACK')) {
            return {
                color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
                icon: '📝',
                label: 'Evaluasi'
            };
        }

        // Klasifikasi Aksi Komunikasi & Live Session
        if (act.includes('MEETING') || act.includes('SESSION') || act.includes('CALL')) {
            return {
                color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
                icon: '📹',
                label: 'Sesi Langsung'
            };
        }

        // Klasifikasi Aksi Notifikasi Global / Sistem
        if (act.includes('SYSTEM') || act.includes('NOTICE') || act.includes('BROADCAST')) {
            return {
                color: 'bg-amber-100 text-amber-600 border-amber-200',
                icon: '📢',
                label: 'Pengumuman'
            };
        }

        // Klasifikasi Aksi Peringatan / Pelanggaran
        if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('BLOCK')) {
            return {
                color: 'bg-rose-100 text-rose-600 border-rose-200',
                icon: '⚠️',
                label: 'Peringatan'
            };
        }

        // Default (Aktivitas Umum)
        return {
            color: 'bg-slate-100 text-slate-600 border-slate-200',
            icon: '📌',
            label: 'Aktivitas Umum'
        };
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

    // State Kosong: Tidak ada log aktivitas yang ditemukan
    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="text-4xl mb-3">📭</span>
                <p className="font-medium text-sm">Belum ada aktivitas mentor yang tercatat saat ini.</p>
            </div>
        );
    }

    return (
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
            {activities.map((log, index) => {
                const theme = getActionTheme(log.action);

                // Mengambil identitas pelaku aksi (Bisa Mentor atau Sistem)
                const actorName = log.mentor ? log.mentor.nama : 'Sistem Utama';
                const isSystemAction = !log.mentor;

                return (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-6 sm:pl-8 group"
                    >
                        {/* Indikator Titik Timeline */}
                        <div
                            className={`absolute -left-4.75 top-1 w-9 h-9 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center text-sm transition-transform group-hover:scale-110 ${theme.color}`}
                        >
                            {theme.icon}
                        </div>

                        {/* Konten Log Card */}
                        <div className="bg-white hover:bg-slate-50 transition-colors p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">

                            {/* Aksen visual ringan untuk sistem */}
                            {isSystemAction && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm text-slate-800 leading-snug font-medium flex items-center flex-wrap gap-2">
                                    <span className={`font-bold ${isSystemAction ? 'text-amber-600' : 'text-slate-900'}`}>
                                        {actorName}
                                    </span>

                                    {/* Jika ada target user (Peserta), tampilkan arah aksinya */}
                                    {log.targetUser && (
                                        <>
                                            <span className="text-slate-400 text-xs">▶</span>
                                            <span className="text-blue-600 font-semibold">{log.targetUser.nama}</span>
                                        </>
                                    )}

                                    <span className="text-slate-300 hidden sm:inline">&bull;</span>

                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.color}`}>
                                        {theme.label}
                                    </span>
                                </p>

                                <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-4 bg-slate-50 px-2 py-1 rounded-md">
                                    {new Date(log.createdAt).toLocaleString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>

                            <p className="text-sm text-slate-600">
                                {log.description}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};