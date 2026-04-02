// src/components/dashboard/AdminStatWidget.tsx

import React from 'react';
import { motion, Variants } from 'framer-motion';

/**
 * Kontrak properti untuk komponen widget statistik.
 * Dibuat se-generik mungkin agar bisa digunakan untuk berbagai macam metrik (KPI).
 */
export interface AdminStatWidgetProps {
    title: string;
    value: string | number;
    icon: React.ReactNode | string;
    color: 'blue' | 'indigo' | 'green' | 'orange' | 'red';
    variants?: Variants; // Properti opsional untuk animasi framer-motion dari parent
}

export const AdminStatWidget: React.FC<AdminStatWidgetProps> = ({
    title,
    value,
    icon,
    color,
    variants
}) => {
    // Pemetaan kelas warna Tailwind.
    // Ditulis secara statis (hardcoded map) agar kompilator (PurgeCSS) Tailwind 
    // bisa mendeteksi dan tidak membuang kelas-kelas ini saat build production.
    const colorMap: Record<AdminStatWidgetProps['color'], string> = {
        blue: 'bg-blue-50/60 text-blue-600 border-blue-200',
        indigo: 'bg-indigo-50/60 text-indigo-600 border-indigo-200',
        green: 'bg-green-50/60 text-green-600 border-green-200',
        orange: 'bg-orange-50/60 text-orange-600 border-orange-200',
        red: 'bg-red-50/60 text-red-600 border-red-200',
    };

    const selectedColorClass = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            variants={variants}
            className={`p-6 rounded-2xl border flex flex-col justify-between bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
        >
            {/* Aksen Background Dekoratif */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150 ${selectedColorClass.split(' ')[0]}`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-slate-500 font-semibold text-xs tracking-wider uppercase">
                    {title}
                </h3>
                <span className={`text-2xl drop-shadow-sm ${selectedColorClass.split(' ')[1]}`}>
                    {icon}
                </span>
            </div>

            <p className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight relative z-10">
                {value}
            </p>
        </motion.div>
    );
};