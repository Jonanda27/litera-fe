"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from './Navbar'; 

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rolePrefix, setRolePrefix] = useState('peserta'); 
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === 'mentor') {
          setRolePrefix('mentor');
        } else if (user.role === 'administrator' || user.role === 'admin') {
          setRolePrefix('admin');
        } else {
          setRolePrefix('peserta');
        }
      } catch (e) {
        console.error("Gagal parse data user", e);
      }
    }
  }, []);

  // Menu Navigasi
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/exercise', label: 'Exercise' },
    { path: '/experience', label: 'Experience' },
    { path: '/experiment', label: 'Experiment' },
    { path: '/livesession', label: 'Live Session' },
    { path: '/sertifikat', label: 'Sertifikasi' },
    { path: '/tools', label: 'Tools Pendukung' },
    { path: '/riwayat', label: 'Riwayat Kegiatan' },
    // TAMBAHAN MENU E-BOOK (dengan properti isExternal)
    { path: 'https://theleaders.id/', label: 'E-book', isExternal: true },
    { path: '/pengaturan', label: 'Pengaturan' },
    { path: '/mentor', label: 'Kontak Mentor Kamu' },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <aside 
        className={`fixed left-0 top-20 h-[calc(100vh-80px)] bg-[#C31A26] transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="py-25 px-4 flex flex-col gap-2">
          {menuItems.map((item) => {
            // Logika Link Eksternal vs Internal
            if (item.isExternal) {
              return (
                <a 
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg transition-all duration-200 font-bold text-sm text-white hover:bg-white/10 flex items-center justify-between"
                >
                  {item.label}
                 
                </a>
              );
            }

            // Logika Link Internal (dengan prefix role)
            const fullHref = `/${rolePrefix}${item.path}`;
            const isActive = pathname === fullHref;

            return (
              <Link 
                key={fullHref}
                href={fullHref}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-bold text-sm ${
                  isActive 
                    ? 'bg-white text-[#C31A26]' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Tombol Toggle Sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-0 top-24 bg-white border border-slate-200 rounded-r-lg p-2 z-50 shadow-md transition-transform duration-300"
        style={{ transform: sidebarOpen ? 'translateX(256px)' : 'translateX(0)' }}
      >
        <svg className={`w-4 h-4 text-slate-600 transition-transform ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Konten Utama */}
      <div className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          {children}
        </div>
      </div>
    </main>
  );
}