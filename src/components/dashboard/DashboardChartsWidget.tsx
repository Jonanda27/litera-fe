// src/components/dashboard/DashboardChartsWidget.tsx

import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    Area,
    AreaChart
} from 'recharts';
import { DashboardChartsData } from '../../lib/types/dashboard';

export interface DashboardChartsWidgetProps {
    data: DashboardChartsData | null;
    isLoading: boolean;
}

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const DashboardChartsWidget: React.FC<DashboardChartsWidgetProps> = ({ data, isLoading }) => {

    const { trendData, ratioData, totalRegistrations } = useMemo(() => {
        if (!data) return { trendData: [], ratioData: [], totalRegistrations: 0 };

        const mappedTrend = data.registrationTrend.map(item => ({
            name: MONTH_NAMES[item.month - 1] || `Bulan ${item.month}`,
            shortName: MONTH_NAMES[item.month - 1]?.substring(0, 3) || `B${item.month}`,
            pendaftaran: item.count
        }));

        const mappedRatio = [
            { name: 'Diskusi Teks', value: data.mentoringRatio.textDiscussion },
            { name: 'Tatap Muka', value: data.mentoringRatio.faceToFace }
        ];

        const total = data.registrationTrend.reduce((acc, curr) => acc + curr.count, 0);

        return { trendData: mappedTrend, ratioData: mappedRatio, totalRegistrations: total };
    }, [data]);

    const PIE_COLORS = ['#6366f1', '#06b6d4']; // Indigo-500 dan Cyan-500

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 h-100 bg-slate-100/50 animate-pulse rounded-3xl border border-slate-200" />
                <div className="h-100 bg-slate-100/50 animate-pulse rounded-3xl border border-slate-200" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

            {/* AREA CHART: TREN PENDAFTARAN (Lebar 2/3) */}
            <div className="lg:col-span-2 bg-white p-8 rounded-4xl border border-slate-200/60 shadow-xl shadow-slate-100/40 flex flex-col group transition-all hover:shadow-2xl hover:shadow-slate-200/50">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                            <h3 className="text-slate-900 font-black text-xl tracking-tight">Akusisi Pengguna</h3>
                        </div>
                        <p className="text-sm font-medium text-slate-400 ml-5">Performa pertumbuhan pendaftaran Litera</p>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                        <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Total Tahun Ini</span>
                        <span className="text-xl font-black text-indigo-600">{totalRegistrations.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="flex-1 w-full h-70">
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPendaftaran" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="shortName"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-800">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-lg font-black text-white">{payload[0].value} <span className="text-xs font-medium text-slate-400 ml-1">Pengguna Baru</span></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pendaftaran"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorPendaftaran)"
                                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4, fill: '#6366f1' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <span className="text-4xl mb-2">📊</span>
                            <p className="text-sm font-bold uppercase tracking-widest">Data belum tersedia</p>
                        </div>
                    )}
                </div>
            </div>

            {/* DONUT CHART: RASIO MENTORING (Lebar 1/3) */}
            <div className="bg-white p-8 rounded-4xl border border-slate-200/60 shadow-xl shadow-slate-100/40 flex flex-col items-center group transition-all hover:shadow-2xl hover:shadow-slate-200/50">
                <div className="w-full mb-8">
                    <h3 className="text-slate-900 font-black text-xl tracking-tight text-center">Interaksi Mentor</h3>
                    <div className="w-8 h-1 bg-cyan-500 mx-auto mt-2 rounded-full" />
                </div>

                <div className="flex-1 w-full h-60 relative flex items-center justify-center">
                    {ratioData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ratioData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                    startAngle={90}
                                    endAngle={450}
                                >
                                    {ratioData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                                            className="outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100">
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{payload[0].name}</p>
                                                    <p className="text-lg font-black" style={{ color: payload[0].payload.fill }}>{payload[0].value} Sesi</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-slate-300 text-center flex flex-col items-center">
                            <span className="text-4xl mb-2">📹</span>
                            <p className="text-xs font-black uppercase tracking-widest">Belum ada Sesi</p>
                        </div>
                    )}

                    {/* Donut Center Label */}
                    {ratioData.some(d => d.value > 0) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-900">
                                {ratioData.reduce((acc, curr) => acc + curr.value, 0)}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">Sesi</span>
                        </div>
                    )}
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-8">
                    {ratioData.map((item, idx) => (
                        <div key={item.name} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.name}</span>
                            </div>
                            <span className="text-sm font-black text-slate-800">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};