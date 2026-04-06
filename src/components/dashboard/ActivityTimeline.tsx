// src/components/dashboard/ActivityTimeline.tsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MentorActivityLogData, PaginationMeta } from '../../lib/types/dashboard';

export interface ActivityTimelineProps {
    activities: MentorActivityLogData[];
    isLoading: boolean;
    meta?: PaginationMeta;
    onPageChange?: (page: number) => void;
    onFilterChange?: (action: string) => void;
    currentFilter?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
    activities,
    isLoading,
    meta,
    onPageChange,
    onFilterChange,
    currentFilter = ''
}) => {
    // 1. Logic: Pengelompokan aktivitas berdasarkan tanggal (UX Depth)
    const groupedActivities = useMemo(() => {
        const groups: { [key: string]: MentorActivityLogData[] } = {};
        activities.forEach(log => {
            const date = new Date(log.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(log);
        });
        return groups;
    }, [activities]);

    const getActionTheme = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('REVIEW') || act.includes('COMMENT') || act.includes('FEEDBACK')) {
            return { color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', icon: '📝', label: 'Evaluasi' };
        }
        if (act.includes('MEETING') || act.includes('SESSION') || act.includes('CALL') || act.includes('WHATSAPP')) {
            return { color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', icon: '📹', label: 'Komunikasi' };
        }
        if (act.includes('SYSTEM') || act.includes('NOTICE') || act.includes('BROADCAST') || act.includes('LOGIN')) {
            return { color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', icon: '⚡', label: 'Sistem' };
        }
        if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('BLOCK')) {
            return { color: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700', icon: '⚠️', label: 'Keamanan' };
        }
        return { color: 'bg-slate-400', light: 'bg-slate-50', text: 'text-slate-700', icon: '📌', label: 'Umum' };
    };

    const renderFilters = () => {
        if (!onFilterChange) return null;
        const filters = [
            { id: '', label: 'Semua', icon: '🌈' },
            { id: 'REVIEW', label: 'Review', icon: '📝' },
            { id: 'MEETING', label: 'Sesi', icon: '📹' },
            { id: 'SYSTEM', label: 'Sistem', icon: '⚡' }
        ];

        return (
            <div className="flex flex-wrap gap-2 mb-8">
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => onFilterChange(f.id)}
                        disabled={isLoading}
                        className={`group flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border-2 ${currentFilter === f.id
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-0.5'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                            } active:scale-95 disabled:opacity-50`}
                    >
                        <span className={`${currentFilter === f.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </div>
        );
    };

    if (isLoading && activities.length === 0) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-10 w-2/3 bg-slate-100 rounded-2xl mb-10" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-1/4 bg-slate-100 rounded" />
                            <div className="h-20 w-full bg-slate-50 rounded-2xl" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="relative">
            {renderFilters()}

            {!activities || activities.length === 0 ? (
                <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-4xl py-20 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-inner flex items-center justify-center text-4xl mb-6">📭</div>
                    <p className="text-slate-400 font-bold tracking-tight">Tidak ada aktivitas yang ditemukan.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(groupedActivities).map(([date, logs]) => (
                        <div key={date} className="relative">
                            {/* Sticky Date Header */}
                            <div className="sticky top-0 z-20 flex items-center gap-4 mb-8">
                                <div className="bg-white border-2 border-slate-100 px-4 py-1.5 rounded-full shadow-sm text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    {date}
                                </div>
                                <div className="h-0.5 flex-1 bg-linear-to-r from-slate-100 to-transparent" />
                            </div>

                            <div className="relative border-l-[3px] border-slate-100 ml-6 space-y-8">
                                <AnimatePresence mode="popLayout">
                                    {logs.map((log, index) => {
                                        const theme = getActionTheme(log.action);
                                        const actorName = log.mentor ? log.mentor.nama : 'System Bot';

                                        return (
                                            <motion.div
                                                key={log.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="relative pl-10 group"
                                            >
                                                {/* Node Point */}
                                                <div className={`absolute -left-3.25 top-4 w-6 h-6 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125 ${theme.color}`} />

                                                <div className="bg-white border-2 border-slate-50 rounded-3xl p-5 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/40 group-hover:border-slate-100 transition-all">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl ${theme.light} flex items-center justify-center text-lg`}>
                                                                {theme.icon}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-sm font-black text-slate-900">{actorName}</span>
                                                                    {log.targetUser && (
                                                                        <>
                                                                            <span className="text-slate-300">/</span>
                                                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">@{log.targetUser.nama}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${theme.text}`}>
                                                                    {theme.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full w-fit">
                                                            {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium pl-1 md:pl-13">
                                                        {log.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}

                    {/* Modern Pagination Navigation */}
                    {meta && meta.totalPages > 1 && (
                        <div className="flex items-center justify-between bg-slate-900 p-2 rounded-3xl shadow-2xl shadow-slate-300">
                            <button
                                onClick={() => onPageChange?.(meta.currentPage - 1)}
                                disabled={meta.currentPage === 1 || isLoading}
                                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 rounded-2xl transition-all disabled:opacity-20"
                            >
                                ← Prev
                            </button>

                            <div className="hidden sm:flex items-center gap-2">
                                {[...Array(meta.totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onPageChange?.(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${meta.currentPage === i + 1
                                            ? 'bg-white text-slate-900 scale-110 shadow-lg'
                                            : 'text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => onPageChange?.(meta.currentPage + 1)}
                                disabled={meta.currentPage === meta.totalPages || isLoading}
                                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 rounded-2xl transition-all disabled:opacity-20"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};