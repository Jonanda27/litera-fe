"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [userData, setUserData] = useState<{ name: string; role: string }>({
    name: "Loading...",
    role: "User"
  });

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Gagal mengambil data");

      const data = await response.json();
      setUserData({
        name: data.nama || "User",
        role: data.role || "Member"
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar?")) return;
    
    setIsLoading(true);
    try {
      await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
      router.refresh();
      setIsLoading(false);
    }
  };

  // Ambil huruf pertama (inisial) dari nama user
  const initial = userData.name.charAt(0).toUpperCase();
  // Memecah nama menjadi array untuk animasi bounce
  const nameArray = userData.name.split("");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-24 overflow-hidden shadow-sm">
      {/* Background Section */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/bg-navbar.png" 
          alt="Navbar Background" 
          fill 
          className="object-cover" 
          priority
        />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-10 h-full flex items-center justify-between">
        
        {/* Left Section: Logo */}
        <div className="flex-1 flex items-center">
          {/* <Link href="/" className="flex items-center gap-2 group">
             <div className="w-10 h-10 bg-[#c31a26] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:rotate-6 transition-transform">
               L
             </div>
             <span className="text-xl font-black text-slate-800 tracking-tighter">LITERA</span>
          </Link> */}
        </div>

        {/* Center Section: Greeting Animation */}
        <div className="flex-[2] hidden md:flex flex-col items-center">
          <div className={`transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h1 className="text-3xl lg:text-4xl font-black text-[#c31a26] tracking-tight flex items-center">
              <span className="mr-3 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">Selamat datang,</span>
              <span className="flex text-slate-900">
                {nameArray.map((char, index) => (
                  <span
                    key={index}
                    className="inline-block animate-bounce"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      animationDuration: '1s' 
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
            </h1>
            <div className={`h-1 bg-[#c31a26] rounded-full mt-1 mx-auto transition-all duration-1000 delay-700 ${mounted ? 'w-32 opacity-40' : 'w-0'}`} />
          </div>
        </div>

        {/* Right Section: Profile & Actions */}
        <div className="flex-1 flex items-center justify-end gap-8">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-base font-black text-slate-900 group-hover:text-[#c31a26] transition-colors">
                {userData.name}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                {userData.role} 
              </p>
            </div>
            
            {/* --- AVATAR MANUAL (Hanya Huruf Depan + Background Merah) --- */}
            <div className="relative w-14 h-14 rounded-2xl border-2 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 bg-[#c31a26] flex items-center justify-center">
              <span className="text-white text-2xl font-black select-none">
                {initial}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 border-l border-black/10 pl-8">
            <button className="relative p-2 rounded-full hover:bg-white/40 transition-colors">
              <svg className="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <button 
              onClick={handleLogout}
              disabled={isLoading}
              className={`px-6 py-2.5 ${isLoading ? 'bg-slate-500' : 'bg-[#c31a26] hover:bg-slate-900'} text-white font-black rounded-xl transition-all duration-300 text-[11px] tracking-[0.2em] uppercase shadow-lg`}
            >
              {isLoading ? 'Wait...' : 'LOGOUT'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}