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
    Legend
} from 'recharts';
import { DashboardChartsData } from '../../lib/types/dashboard';

export interface DashboardChartsWidgetProps {
    data: DashboardChartsData | null;
    isLoading: boolean;
}

// Utilitas untuk memetakan angka bulan dari database (1-12) menjadi teks (UX yang lebih baik)
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export const DashboardChartsWidget: React.FC<DashboardChartsWidgetProps> = ({ data, isLoading }) => {

    // Menggunakan useMemo agar kalkulasi mapping data hanya terjadi saat 'data' berubah (Optimasi Memori/CPU UI)
    const { trendData, ratioData } = useMemo(() => {
        if (!data) return { trendData: [], ratioData: [] };

        // Mapping Tren Pendaftaran (Line Chart)
        const mappedTrend = data.registrationTrend.map(item => ({
            name: MONTH_NAMES[item.month - 1] || `Bulan ${item.month}`,
            Jumlah: item.count
        }));

        // Mapping Rasio Mentoring (Pie Chart)
        const mappedRatio = [
            { name: 'Diskusi Teks', value: data.mentoringRatio.textDiscussion },
            { name: 'Tatap Muka (Video)', value: data.mentoringRatio.faceToFace }
        ];

        return { trendData: mappedTrend, ratioData: mappedRatio };
    }, [data]);

    // Palet warna untuk Pie Chart (Disesuaikan dengan identitas warna Tailwind Litera)
    const PIE_COLORS = ['#3b82f6', '#8b5cf6']; // Blue-500 dan Violet-500

    // State Loading: Menampilkan Skeleton agar layout tidak melompat (Cumulative Layout Shift)
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse mt-8">
                <div className="lg:col-span-2 h-80 bg-slate-100 rounded-2xl border border-slate-200"></div>
                <div className="h-80 bg-slate-100 rounded-2xl border border-slate-200"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

            {/* =====================================================================
                KOLOM 1 (Lebar 2/3): GRAFIK TREN PENDAFTARAN (LINE CHART)
                ===================================================================== */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="mb-6">
                    <h3 className="text-slate-800 font-bold text-lg">Tren Pendaftaran Pengguna</h3>
                    <p className="text-sm text-slate-500">Pertumbuhan pengguna baru Litera sepanjang tahun ini.</p>
                </div>

                <div className="flex-1 w-full h-64 min-h-[250px]">
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Jumlah"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 0, fill: '#3b82f6' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                            Belum ada data pendaftaran tercatat.
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================================
                KOLOM 2 (Lebar 1/3): GRAFIK RASIO MENTORING (PIE CHART)
                ===================================================================== */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="mb-2">
                    <h3 className="text-slate-800 font-bold text-lg">Rasio Mentoring</h3>
                    <p className="text-sm text-slate-500">Perbandingan mode interaksi pendampingan.</p>
                </div>

                <div className="flex-1 w-full h-64 min-h-[250px] relative flex items-center justify-center">
                    {ratioData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ratioData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {ratioData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-slate-600 text-sm font-medium">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-slate-400 text-sm font-medium text-center">
                            Belum ada data interaksi<br />mentoring yang terjadi.
                        </div>
                    )}

                    {/* Tulisan di tengah Donut Chart (Hanya tampil jika ada data) */}
                    {ratioData.some(d => d.value > 0) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-36px]">
                            <span className="text-2xl font-black text-slate-800">
                                {ratioData.reduce((acc, curr) => acc + curr.value, 0)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};