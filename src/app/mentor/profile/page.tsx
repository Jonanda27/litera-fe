"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

// Definisikan tipe data untuk State Profil
interface ProfileData {
  nama: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  specialization: string;
  experience: string;
  linkedin: string;
  availability: string;
}

// Definisikan tipe data untuk Props InputField
interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function ProfilMentor() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    nama: "Fajar Ramadhan",
    role: "Senior Literacy Guide",
    bio: "Membantu peserta menemukan potensi kritis melalui refleksi mendalam dan panduan literasi digital yang relevan.",
    email: "fajar.mentor@literacy.id",
    phone: "+62 812 3456 7890",
    location: "Jakarta, Indonesia (WIB)",
    specialization: "UX Strategy & Digital Ethics",
    experience: "8 Tahun",
    linkedin: "linkedin.com/in/fajarramadhan",
    availability: "Senin - Jumat (15:00 - 18:00)"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Simulasi loading/saving effect bisa ditambahkan di sini nantinya
    setIsEditing(false);
    console.log("Data tersimpan:", profileData);
  };

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        
        {/* Header Profil */}
        <div className={`p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 transition-all duration-500 ease-in-out ${
          isEditing 
            ? 'bg-white border-2 border-[#C31A26]/20 shadow-lg shadow-red-100/50 scale-[1.01]' 
            : 'bg-white border border-slate-100 shadow-sm'
        }`}>
          {/* Cover Background dengan efek transisi warna */}
          <div className={`absolute top-0 left-0 w-full h-24 z-0 transition-colors duration-500 ${
            isEditing ? 'bg-gradient-to-r from-red-50 to-red-100' : 'bg-gradient-to-r from-slate-50 to-slate-100/80'
          }`}></div>
          
          {/* Avatar / Inisial */}
          <div className="w-32 h-32 rounded-[2rem] bg-[#C31A26] text-white flex items-center justify-center text-5xl font-black shadow-xl shadow-red-200 shrink-0 z-10 transition-transform duration-300 hover:scale-105">
            {profileData.nama.charAt(0)}
          </div>
          
          {/* Info Header */}
          <div className="flex-1 text-center md:text-left space-y-3 z-10 transition-all duration-300">
            {isEditing ? (
              <input 
                name="nama"
                value={profileData.nama}
                onChange={handleChange}
                className="text-3xl font-black text-slate-900 border-b-2 border-[#C31A26] bg-transparent outline-none w-full max-w-sm transition-all duration-300 focus:border-red-600 focus:bg-red-50/30 px-2 py-1 rounded-t-md"
              />
            ) : (
              <h1 className="text-3xl font-black text-slate-900 leading-tight px-2 py-1">{profileData.nama}</h1>
            )}

            {isEditing ? (
              <input 
                name="role"
                value={profileData.role}
                onChange={handleChange}
                className="text-[#C31A26] font-bold uppercase text-xs tracking-[0.2em] border-b border-[#C31A26]/50 bg-transparent outline-none w-full max-w-sm block transition-all duration-300 focus:bg-red-50/30 px-2 py-1 rounded-t-md mt-1"
              />
            ) : (
              <p className="text-[#C31A26] font-bold uppercase text-xs tracking-[0.2em] px-2 py-1">{profileData.role}</p>
            )}

            {isEditing ? (
              <textarea 
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                rows={2}
                className="text-slate-600 text-sm font-medium leading-relaxed w-full max-w-lg bg-white p-3 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#C31A26]/40 shadow-sm transition-all duration-300 resize-none mt-2"
              />
            ) : (
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl px-2">
                {profileData.bio}
              </p>
            )}
          </div>

          {/* Action Button */}
          <button 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`absolute top-8 right-8 px-6 py-3 rounded-xl font-bold transition-all duration-300 z-10 shadow-sm flex items-center gap-2 active:scale-95 ${
              isEditing 
                ? 'bg-[#C31A26] text-white hover:bg-red-800 hover:shadow-md hover:shadow-red-200' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {isEditing ? (
              <><span className="animate-pulse">💾</span> Simpan Profil</>
            ) : (
              <><span>✏️</span> Edit Profil</>
            )}
          </button>
        </div>

        {/* Layout Grid untuk Form Profil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri */}
          <div className="lg:col-span-1 space-y-8">
            <div className={`p-8 rounded-[2rem] transition-all duration-500 ${
              isEditing ? 'bg-white border border-[#C31A26]/20 shadow-lg shadow-red-50/50' : 'bg-white border border-slate-100 shadow-sm'
            }`}>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b border-slate-100 pb-4">
                Kontak & Lokasi
              </h3>
              
              <div className="space-y-4 mt-5">
                <InputField 
                  label="Email Publik" 
                  name="email" 
                  type="email" 
                  value={profileData.email} 
                  isEditing={isEditing} 
                  onChange={handleChange} 
                />
                <InputField 
                  label="Nomor WhatsApp" 
                  name="phone" 
                  type="text" 
                  value={profileData.phone} 
                  isEditing={isEditing} 
                  onChange={handleChange} 
                />
                <InputField 
                  label="Domisili & Zona Waktu" 
                  name="location" 
                  type="text" 
                  value={profileData.location} 
                  isEditing={isEditing} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-5 transition-all duration-300 hover:shadow-md">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b border-slate-100 pb-4">
                Pengaturan Akun
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all duration-200 text-left flex justify-between items-center active:scale-[0.98]">
                  <span>Ganti Password</span>
                  <span className="text-lg">🔑</span>
                </button>
                <button className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all duration-200 text-left flex justify-between items-center active:scale-[0.98]">
                  <span>Notifikasi SLA Email</span>
                  <span className="text-lg">🔔</span>
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="lg:col-span-2 space-y-8">
            <div className={`p-8 rounded-[2rem] transition-all duration-500 ${
              isEditing ? 'bg-white border border-[#C31A26]/20 shadow-lg shadow-red-50/50' : 'bg-white border border-slate-100 shadow-sm'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">
                  Profil Profesional
                </h3>
                {isEditing && (
                  <span className="text-[10px] font-bold text-[#C31A26] bg-red-50 px-3 py-1.5 rounded-full border border-red-100 animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C31A26]"></span>
                    Mode Edit Aktif
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Spesialisasi Utama" 
                  name="specialization" 
                  type="text" 
                  value={profileData.specialization} 
                  isEditing={isEditing} 
                  onChange={handleChange} 
                />
                <InputField 
                  label="Pengalaman Industri" 
                  name="experience" 
                  type="text" 
                  value={profileData.experience} 
                  isEditing={isEditing} 
                  onChange={handleChange} 
                />
                <InputField 
                  label="URL LinkedIn" 
                  name="linkedin" 
                  type="text" 
                  value={profileData.linkedin} 
                  isEditing={isEditing} 
                  onChange={handleChange} 
                />
                <InputField 
                  label="Ketersediaan Mentoring" 
                  name="availability" 
                  type="text" 
                  value={profileData.availability} 
                  isEditing={isEditing} 
                  onChange={handleChange} 
                  placeholder="Misal: Senin - Jumat (18:00 - 20:00)"
                />
              </div>

              <div className="mt-8 p-5 bg-slate-50 rounded-2xl flex items-start gap-4 border border-slate-200 transition-all hover:bg-slate-100/50">
                <div className="text-xl mt-0.5">💡</div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  <strong className="text-slate-700 block mb-1">Penting:</strong>
                  Data profil ini (Spesialisasi, Pengalaman, dan Ketersediaan) akan muncul secara publik pada dashboard peserta. Pastikan URL LinkedIn Anda aktif agar peserta dapat melihat portofolio Anda sebelum sesi dimulai.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
}

// Komponen InputField yang ditingkatkan dengan Animasi Transisi
function InputField({ label, name, type, value, isEditing, onChange, placeholder }: InputFieldProps) {
  return (
    <div className="flex flex-col group">
      <label className={`text-[10px] font-black uppercase tracking-wide ml-1 mb-2 transition-colors duration-300 ${
        isEditing ? 'text-[#C31A26]' : 'text-slate-400'
      }`}>
        {label}
      </label>
      <input 
        type={type} 
        name={name}
        disabled={!isEditing}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3.5 rounded-xl text-sm font-semibold transition-all duration-300 outline-none border ${
          isEditing 
            ? 'bg-white border-slate-300 focus:border-[#C31A26] focus:ring-4 focus:ring-[#C31A26]/10 text-slate-800 shadow-sm hover:border-[#C31A26]/50 focus:-translate-y-0.5' 
            : 'bg-slate-50 border-transparent text-slate-600 opacity-90 cursor-not-allowed'
        }`}
      />
    </div>
  );
}