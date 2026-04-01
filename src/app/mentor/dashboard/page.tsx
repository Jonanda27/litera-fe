"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';

// Data Dummy Strategis
const mentorStats = [
  { label: 'Peserta Bimbingan', value: '18', total: '20', sub: 'Kapasitas Mentor', icon: '🎯' },
  { label: 'Menunggu Feedback', value: '05', sub: 'SLA < 48 Jam', icon: '⏳' },
  { label: 'Selesai Refleksi', value: '12', sub: 'Minggu ini', icon: '✨' },
];

const priorityQueue = [
  { id: 1, name: 'Budi Santoso', project: 'User Flow Persona', timeElapsed: '26 Jam', status: 'Urgent' },
  { id: 2, name: 'Siti Aminah', project: 'Refleksi Modul 2', timeElapsed: '12 Jam', status: 'On Track' },
  { id: 3, name: 'Rian Perdana', project: 'Wireframing Pro', timeElapsed: '2 Jam', status: 'New' },
];

export default function ModernMentorDashboard() {
  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[#C31A26] font-black text-xs uppercase tracking-[0.2em]">Overview Mentor</span>
            <h1 className="text-4xl font-black text-slate-900 mt-1 tracking-tight">
              Selamat Pagi, <span className="text-slate-400 font-medium">Fajar!</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Kamu memiliki <span className="text-[#C31A26] font-bold">5 tugas refleksi</span> yang perlu dipantik hari ini.</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-800">30 Maret 2024</p>
            <p className="text-xs text-slate-400 font-medium">Status Server: Optimal</p>
          </div>
        </div>

        {/* Stats Grid - Modern Glass Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentorStats.map((stat, i) => (
            <div key={i} className="group relative bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-[#C31A26]/5 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-4xl">
                {stat.icon}
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-2">
                <h2 className="text-5xl font-black text-slate-900">{stat.value}</h2>
                {stat.total && <span className="text-slate-300 font-bold text-xl">/{stat.total}</span>}
              </div>
              <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C31A26]"></span>
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Action: Feedback Queue */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800">Antrean Refleksi Utama</h3>
              <button className="text-xs font-bold text-[#C31A26] hover:tracking-widest transition-all">LIHAT SEMUA →</button>
            </div>

            <div className="space-y-4">
              {priorityQueue.map((item) => (
                <div key={item.id} className="group bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between hover:border-[#C31A26]/30 transition-all shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center font-black text-[#C31A26] border border-slate-100">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-[#C31A26] transition-colors">{item.project}</h4>
                      <p className="text-xs text-slate-400 font-medium">{item.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:block text-right">
                      <p className={`text-[10px] font-black uppercase tracking-tighter ${item.status === 'Urgent' ? 'text-red-500' : 'text-slate-400'}`}>
                        Waktu Berjalan
                      </p>
                      <p className="text-sm font-bold text-slate-700">{item.timeElapsed}</p>
                    </div>
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-[#C31A26] transition-all shadow-lg shadow-slate-200 active:scale-95">
                      PANTIK REFLEKSI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guide Section: Batasan Teknis Reminder */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800">Panduan Cepat</h3>
            <div className="bg-[#C31A26] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-red-200">
              <div className="relative z-10">
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 italic">Literacy Guide</p>
                <h4 className="text-lg font-bold leading-tight mb-6">
                  "Feedback yang baik bukan menilai benar/salah, tapi memicu pertanyaan baru."
                </h4>
                <ul className="space-y-3 text-sm text-white/80 font-medium">
                  <li className="flex items-start gap-2">
                    <span>✓</span> Fokus pada titik strategis peserta.
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span> Gunakan bahasa yang suportif.
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span> Pastikan respon sebelum 48 jam.
                  </li>
                </ul>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
}