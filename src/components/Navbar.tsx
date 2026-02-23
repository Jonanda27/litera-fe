"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const name = "Anisa!".split("");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-24 overflow-hidden shadow-sm">
      {/* Background Image Layer */}
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
        
        {/* Logo Section - Disesuaikan agar pas di kiri */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="group">
            {/* h-16 adalah ukuran ideal untuk navbar h-24 agar ada napas (padding) */}
            {/* <div className="relative mt-5 mr-10 h-60 w-48 transition-transform duration-300 group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Litera Logo" 
                fill
                className="object-contain object-left" // object-left memastikan logo menempel ke kiri container
                priority
              />
            </div> */}
          </Link>
        </div>

        {/* Greeting Section */}
        <div className="flex-[2] hidden md:flex flex-col items-center">
          <div 
            className={`transition-all duration-1000 ease-out transform ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <h1 className="text-3xl lg:text-4xl font-black text-[#c31a26] tracking-tight flex items-center">
              <span className="mr-3 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">Selamat datang,</span>
              <span className="flex text-slate-900">
                {name.map((char, index) => (
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

        {/* Profile & Action Section */}
        <div className="flex-1 flex items-center justify-end gap-8">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-base font-black text-slate-900 group-hover:text-[#c31a26] transition-colors">Anisa Panduwinata</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Premium Member</p>
            </div>
            <div className="relative w-14 h-14 rounded-2xl border-2 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <Image 
                src="https://i.pravatar.cc/150?u=anisa" 
                alt="Profile Anisa"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 border-l border-black/10 pl-8">
            <button className="relative p-2 rounded-full hover:bg-white/40 transition-colors">
              <svg className="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-ping" />
            </button>

            <button className="px-6 py-2.5 bg-[#c31a26] text-white font-black rounded-xl hover:bg-slate-900 transition-all duration-300 text-[11px] tracking-[0.2em] uppercase shadow-lg">
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}