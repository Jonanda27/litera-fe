"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

const literacyGuides = [
  {
    id: 1,
    title: "Etika Digital & Privasi",
    level: "Dasar",
    keyReflection: "Bagaimana teknologi mengubah cara kita mempercayai orang asing?",
    topics: ["Data Personal", "Jejak Digital", "Social Engineering"],
    status: "Active Guide"
  },
  {
    id: 2,
    title: "Logika Algoritma & Bias",
    level: "Menengah",
    keyReflection: "Apakah algoritma mencerminkan realitas, atau menciptakan realitas baru?",
    topics: ["Filter Bubble", "Echo Chamber", "Data Bias"],
    status: "Active Guide"
  },
  {
    id: 3,
    title: "Kreativitas di Era Generative AI",
    level: "Lanjut",
    keyReflection: "Di mana batas antara kolaborasi dengan AI dan kehilangan orisinalitas?",
    topics: ["Prompt Engineering", "Hak Cipta AI", "Human-Centric Design"],
    status: "Update Soon"
  }
];

export default function PanduanLiterasi() {
  const [selectedGuide, setSelectedGuide] = useState(literacyGuides[0]);

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[#C31A26] font-black text-xs uppercase tracking-[0.2em]">Knowledge Base</span>
            <h1 className="text-4xl font-black text-slate-900 mt-1 tracking-tight">Panduan Literasi</h1>
            <p className="text-slate-500 mt-2 font-medium italic">Senjata utama mentor untuk memantik refleksi kritis peserta.</p>
          </div>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             Kurikulum Versi 2.4 (2026)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Sidebar Daftar Modul */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Daftar Materi</h3>
            <div className="space-y-3">
              {literacyGuides.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-300 ${
                    selectedGuide.id === guide.id 
                    ? 'bg-white border-[#C31A26] shadow-xl shadow-red-100 ring-1 ring-[#C31A26]' 
                    : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <p className={`text-[10px] font-black uppercase mb-1 ${selectedGuide.id === guide.id ? 'text-[#C31A26]' : 'text-slate-400'}`}>
                    Level: {guide.level}
                  </p>
                  <h4 className={`font-bold ${selectedGuide.id === guide.id ? 'text-slate-900' : 'text-slate-600'}`}>
                    {guide.title}
                  </h4>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Detail Panduan Refleksi */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8 relative overflow-hidden">
              {/* Watermark/Background Accent */}
              <div className="absolute top-0 right-0 p-12 text-slate-50 font-black text-8xl pointer-events-none select-none">
                0{selectedGuide.id}
              </div>

              <div className="relative z-10 space-y-8">
                {/* Section 1: The Core Question */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#C31A26] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-[#C31A26]"></span>
                    Pertanyaan Pemantik Utama
                  </h3>
                  <p className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                    "{selectedGuide.keyReflection}"
                  </p>
                </div>

                {/* Section 2: Discussion Points */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Poin Diskusi Strategis</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedGuide.topics.map((topic, i) => (
                      <span key={i} className="bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-full text-sm font-bold text-slate-700">
                        # {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Section 3: Mentor Note Box */}
                <div className="bg-[#C31A26] text-white p-8 rounded-[2rem] shadow-xl shadow-red-200 mt-10">
                   <h4 className="font-black text-sm uppercase tracking-widest mb-3">Instruksi Memberikan Feedback:</h4>
                   <p className="text-sm font-medium leading-relaxed opacity-90">
                     Jika peserta menjawab secara teknis saja, minta mereka menghubungkannya dengan aspek kemanusiaan atau sosial. Contoh: "Analisis teknis Anda sudah baik, namun bagaimana jika fitur ini digunakan oleh populasi lansia yang memiliki literasi digital rendah?"
                   </p>
                   <button className="mt-6 bg-white text-[#C31A26] px-6 py-2.5 rounded-xl text-xs font-black hover:scale-105 transition-transform">
                      SALIN TEMPLATE REFLEKSI
                   </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
}