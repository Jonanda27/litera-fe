"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function ProfilMentor() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Profil */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="w-32 h-32 rounded-[2rem] bg-[#C31A26] text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-red-100 shrink-0">
            F
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Fajar Ramadhan</h1>
            <p className="text-[#C31A26] font-bold uppercase text-xs tracking-[0.2em]">Senior Literacy Guide</p>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md">
              Membantu peserta menemukan potensi kritis melalui refleksi mendalam dan panduan literasi digital yang relevan.
            </p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-8 right-8 bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {isEditing ? '💾 Simpan' : '✏️ Edit'}
          </button>
        </div>

        {/* Form Pengaturan Profil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b border-slate-50 pb-4 mb-4">Informasi Dasar</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email Publik</label>
                <input 
                  type="email" 
                  disabled={!isEditing}
                  defaultValue="fajar.mentor@literacy.id"
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C31A26]/20 outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Spesialisasi</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  defaultValue="UX Strategy & Digital Ethics"
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C31A26]/20 outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b border-slate-50 pb-4 mb-4">Keamanan</h3>
            <div className="space-y-4">
              <button className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all">
                Ganti Password Akun
              </button>
              <button className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all">
                Atur Notifikasi SLA (Email)
              </button>
            </div>
            <div className="mt-6 p-4 bg-red-50 rounded-2xl">
              <p className="text-[10px] text-[#C31A26] font-bold leading-relaxed">
                * Data profil ini akan muncul pada dashboard peserta saat Anda memberikan feedback proyek.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}