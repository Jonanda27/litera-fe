"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from './Navbar'; // Pastikan path import benar

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/exercise', label: 'Exercise' },
    { href: '/experience', label: 'Experience' },
    { href: '/experiment', label: 'Experiment' },
    { href: '/livesession', label: 'Live Session' },
    { href: '/sertifikat', label: 'Sertifikasi' },
    { href: '/tools', label: 'Tools Pendukung' },
    { href: '/riwayat', label: 'Riwayat Kegiatan' },
    { href: '/pengaturan', label: 'Pengaturan' },
    { href: '/mentor', label: 'Kontak Mentor Kamu' },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* 1. Memanggil Navbar sesuai permintaanmu */}
      <Navbar />

      {/* 2. Sidebar - Sesuaikan top-20 agar tidak tertutup Navbar h-20 */}
      <aside 
        className={`fixed left-0 top-20 h-[calc(100vh-80px)] bg-[#C31A26] transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="py-25 px-4 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-bold text-sm ${
                  isActive 
                    ? 'bg-white text-[#C31A26]' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* 3. Tombol Toggle Sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-0 top-24 bg-white border border-slate-200 rounded-r-lg p-2 z-50 shadow-md transition-transform duration-300"
        style={{ transform: sidebarOpen ? 'translateX(256px)' : 'translateX(0)' }}
      >
        <svg className={`w-4 h-4 text-slate-600 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 4. Konten Utama - Sesuaikan pt-20 (padding top) agar pas di bawah Navbar */}
      <div className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          {children}
        </div>
      </div>
    </main>
  );
}