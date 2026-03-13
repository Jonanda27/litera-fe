// src/components/dashboard/AdminStatWidget.tsx
import React from 'react';
import { motion, Variants } from 'framer-motion';

export interface AdminStatWidgetProps {
    title: string;
    value: string | number;
    icon: React.ReactNode | string;
    color: 'blue' | 'indigo' | 'green' | 'orange' | 'red';
    variants?: Variants;
}

export const AdminStatWidget: React.FC<AdminStatWidgetProps> = ({
    title,
    value,
    icon,
    color,
    variants
}) => {
    // Pemetaan kelas Tailwind berdasarkan properti warna.
    // Ini menghindari manipulasi string kelas dinamis yang tidak dikenali oleh kompilator Tailwind.
    const colorMap = {
        blue: 'bg-blue-50/50 text-blue-600 border-blue-100',
        indigo: 'bg-indigo-50/50 text-indigo-600 border-indigo-100',
        green: 'bg-green-50/50 text-green-600 border-green-100',
        orange: 'bg-orange-50/50 text-orange-600 border-orange-100',
        red: 'bg-red-50/50 text-red-600 border-red-100',
    };

    const selectedColorClass = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            variants={variants}
            className={`p-6 rounded-2xl border flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${selectedColorClass}`}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-600 font-semibold text-sm tracking-wide uppercase">{title}</h3>
                <span className="text-2xl drop-shadow-sm">{icon}</span>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
        </motion.div>
    );
};