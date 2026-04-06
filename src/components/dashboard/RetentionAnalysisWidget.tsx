// src/components/dashboard/RetentionAnalysisWidget.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { RiskyUser, DifficultModule } from '@/lib/types/dashboard';

interface Props {
    riskyUsers: RiskyUser[];
    difficultModules: DifficultModule[];
    isLoading: boolean;
    onNudge: (userId: number) => void;
}

export const RetentionAnalysisWidget: React.FC<Props> = ({ riskyUsers, difficultModules, isLoading, onNudge }) => {

    // Skeleton Loader yang disesuaikan dengan desain baru
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-100 bg-slate-50 animate-pulse rounded-4xl border border-slate-100" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

            {/* 1. WIDGET PESERTA BERISIKO (AT-RISK STUDENTS) */}
            <div className="bg-white p-7 rounded-4xlrder border-slate-200/60 shadow-xl shadow-slate-100/50 flex flex-col h-full overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl">⚠️</span>
                </div>

                <div className="mb-6 relative z-10">
                    <h3 className="text-slate-900 font-black text-xl tracking-tight flex items-center gap-3">
                        Perlu Perhatian
                        <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-black tracking-widest">
                            {riskyUsers.length} Peserta
                        </span>
                    </h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">Peserta dengan progres stagnan dalam 7 hari terakhir.</p>
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {riskyUsers.length > 0 ? (
                        riskyUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 hover:shadow-md transition-all group/item"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-black text-slate-500">
                                            {user.nama.substring(0, 1)}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 tracking-tight">{user.nama}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 rounded-full"
                                                    style={{ width: `${user.persentase_progres}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{user.persentase_progres}%</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onNudge(user.id)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-90 opacity-0 group-hover/item:opacity-100"
                                    title="Kirim Nudge WA"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                            <span className="text-4xl mb-2">✨</span>
                            <p className="text-xs font-bold uppercase tracking-widest">Semua peserta aktif</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. ANALISA MODUL TERSULIT (BOTTLE NECK ANALYSIS) */}
            <div className="bg-slate-900 p-7 rounded-4xl border border-slate-800 shadow-xl flex flex-col h-full relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl -mr-16 -mt-16"></div>

                <div className="mb-8 relative z-10">
                    <h3 className="text-white font-black text-xl tracking-tight flex items-center gap-3">
                        Analisa Hambatan
                        <div className="h-2 w-2 bg-rose-500 rounded-full animate-pulse"></div>
                    </h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">Modul dengan tingkat kesulitan/stagnansi tertinggi.</p>
                </div>

                <div className="space-y-6 flex-1 relative z-10">
                    {difficultModules.length > 0 ? (
                        difficultModules.map((item, index) => {
                            const maxStuck = difficultModules[0]?.total_stuck || 1;
                            const percentage = (item.total_stuck / maxStuck) * 100;

                            return (
                                <div key={item.module_id} className="relative">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] leading-none mb-1">Rank #{index + 1}</span>
                                            <span className="text-sm font-bold text-slate-200">{item.module.nama_modul}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-white">{item.total_stuck}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Orang</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className="h-full rounded-full bg-linear-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.3)]"
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-30">
                            <span className="text-4xl mb-2">📉</span>
                            <p className="text-xs font-bold text-white uppercase tracking-widest text-center">Kurikulum berjalan mulus</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center relative z-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Data diperbarui otomatis</span>
                    <button className="text-[10px] font-black text-white hover:text-rose-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                        Detail Modul <span>→</span>
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};