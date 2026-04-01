"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constans/constans';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellRing, 
  AlertCircle, 
  Clock, 
  X, 
  Circle
} from 'lucide-react';

const motivations = [
  "Buku adalah jendela dunia, mulailah menulis duniamu.",
  "Penulis yang baik adalah pembaca yang rajin.",
  "Setiap kata yang kau tulis adalah jejak keabadian.",
  "Jangan menunggu inspirasi, ciptakanlah dengan menulis.",
  "Satu buku bisa mengubah ribuan pemikiran.",
  "Tuliskan apa yang layak dibaca, atau lakukan apa yang layak ditulis.",
  "Menulislah agar duniamu tahu bahwa kau pernah ada.", 
  "Buku yang belum ditulis adalah cerita yang terperangkap dalam jiwamu.", 
  "Karya hebat tidak lahir dari keberuntungan, tapi dari ketekunan menyusun kata.", 
  "Pena lebih tajam dari pedang, dan buku adalah perisai peradaban."
];

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  // State Notifikasi
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<number[]>([]); 
  const notifRef = useRef<HTMLDivElement>(null);

  const [userData, setUserData] = useState<{ id: string | null, name: string; role: string }>({
    id: null,
    name: "User",
    role: "User"
  });

  const unreadCount = notifications.filter(n => !readNotifIds.includes(n.id)).length;

  useEffect(() => {
    setMounted(true);
    fetchUser();

    const savedReadIds = localStorage.getItem('read_notif_ids');
    if (savedReadIds) {
      setReadNotifIds(JSON.parse(savedReadIds));
    }

    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % motivations.length);
    }, 5000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(quoteInterval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Gagal mengambil data");

      const data = await response.json();
      setUserData({
        id: data.id,
        name: data.nama || "User",
        role: data.role || "Member"
      });

      if (data.role === 'Mentor') {
        fetchMentorNotifications(token);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.clear();
      router.push('/login');
    }
  };

  const fetchMentorNotifications = async (token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/mentors/my-logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
            const adminMessages = result.data.filter((log: any) => 
                log.action === 'PERINGATAN_ADMIN' || log.action === 'SYSTEM_NOTICE'
            );
            setNotifications(adminMessages);
        }
    } catch (err) {
        console.error("Fetch Notif Error:", err);
    }
  };

  const handleOpenDropdown = () => {
    if (userData.role !== 'Mentor') return;
    
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && notifications.length > 0) {
      const allIds = notifications.map(n => n.id);
      setReadNotifIds(allIds);
      localStorage.setItem('read_notif_ids', JSON.stringify(allIds));
    }
  };

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar?")) return;
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    } finally {
      localStorage.clear();
      router.push('/login');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const initial = userData.name.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 md:h-24 overflow-visible shadow-sm">
      <div className="absolute inset-0 z-0">
        <Image src="/bg-navbar.png" alt="BG" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-full flex items-center justify-between">
        
        {/* Left Section: Logo */}
        <div className="flex-1 flex items-center">
           <Link href="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-[#c31a26] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:rotate-6 transition-transform">L</div>
             <span className="text-lg md:text-xl font-black text-slate-800 tracking-tighter uppercase">LITERA</span>
          </Link>
        </div>

        {/* Center Section */}
        <div className="flex-[3] hidden md:flex flex-col items-center px-4">
          <div className="relative h-12 flex items-center justify-center w-full text-center">
            {motivations.map((text, index) => (
              <p key={index} className={`absolute transition-all duration-1000 ease-in-out text-sm lg:text-base font-medium italic text-slate-700 leading-tight w-full ${index === quoteIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                "{text}"
              </p>
            ))}
          </div>
          <div className="w-16 md:w-24 h-1 bg-[#c31a26]/30 rounded-full mt-1" />
        </div>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-end gap-4 md:gap-8">
          
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-right leading-tight hidden lg:block">
              <p className="text-sm md:text-base font-black text-slate-900 group-hover:text-[#c31a26] transition-colors truncate max-w-[120px]">
                {userData.name}
              </p>
              {/* Role Tetap Putih */}
              <p className="text-[9px] md:text-[10px] font-bold text-slate-100 uppercase tracking-[0.2em]">
                {userData.role} 
              </p>
            </div>
            
            <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-all duration-300 bg-[#c31a26] flex items-center justify-center shrink-0">
              <span className="text-white text-lg md:text-2xl font-black select-none">{initial}</span>
            </div>
          </div>

          <div className="h-8 md:h-12 w-[1.5px] bg-slate-300 rounded-full" />

          {/* ICON NOTIFIKASI HITAM */}
          <div className="relative flex items-center" ref={notifRef}>
            <button 
              onClick={handleOpenDropdown}
              className={`relative p-2.5 md:p-3 rounded-2xl transition-all duration-300 group
                ${showNotifDropdown ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-white shadow-xl hover:bg-black'}`}
            >
              <BellRing 
                size={22} 
                className={`transition-transform duration-500 group-hover:rotate-12 
                  ${unreadCount > 0 ? 'text-white animate-bounce' : 'text-white'} `} 
              />
              
              {userData.role === 'Mentor' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-slate-900 items-center justify-center text-[9px] font-black text-white">
                    {unreadCount}
                  </span>
                </span>
              )}

              {userData.role !== 'Mentor' && (
                <Circle size={6} className="absolute top-2 right-2 text-red-500 fill-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            {/* DROPDOWN ISI PUTIH */}
            <AnimatePresence>
              {showNotifDropdown && userData.role === 'Mentor' && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 8, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100]"
                >
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Pesan Sistem</span>
                    </div>
                    <button onClick={() => setShowNotifDropdown(false)} className="text-slate-400 hover:text-red-600 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto bg-white custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif, idx) => (
                        <div key={idx} className="p-5 border-b border-slate-50 hover:bg-slate-50/80 transition-all flex gap-4 group/item">
                          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors 
                            ${readNotifIds.includes(notif.id) ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-600 group-hover/item:bg-red-600 group-hover/item:text-white'}`}>
                            <AlertCircle size={20} />
                          </div>
                          <div className="flex-1 text-left">
                            
                            {/* JUDUL PERINGATAN - MERAH TEGAS */}
                            <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-red-600">
                                {notif.action?.replace('_', ' ')}
                            </p>
                            
                            {/* ISI PESAN - HITAM PEKAT (MENGGUNAKAN text-slate-900 !) */}
                            <p className="text-xs font-bold leading-relaxed text-slate-900">
                                {notif.description}
                            </p>
                            
                            <div className="flex items-center gap-1.5 mt-2.5 text-slate-400">
                              <Clock size={12} />
                              <span className="text-[10px] font-black uppercase tracking-tighter">
                                {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} • {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-16 px-6 text-center">
                        <BellRing size={40} className="mx-auto text-slate-100 mb-3" />
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Belum ada pemberitahuan</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout Action */}
          <div className="flex items-center border-l border-slate-200 pl-4 md:pl-6">
            <button 
              onClick={handleLogout}
              disabled={isLoading}
              className={`px-4 py-2 md:px-5 md:py-2.5 ${isLoading ? 'bg-slate-500' : 'bg-[#c31a26] hover:bg-slate-900'} text-white font-black rounded-xl transition-all duration-300 text-[10px] tracking-[0.2em] uppercase shadow-md active:scale-95`}
            >
              {isLoading ? 'Wait...' : 'LOGOUT'}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}