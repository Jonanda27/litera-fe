"use client";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/constans/constans';
import { Loader2, MessageCircle, Radio, Calendar, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';

export function SidebarRight() {
  const [mentor, setMentor] = useState<any>(null);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [latestDiscussion, setLatestDiscussion] = useState<any>(null);
  const [loadingMentor, setLoadingMentor] = useState(true);
  const [loadingLive, setLoadingLive] = useState(true);
  const [loadingDiscussion, setLoadingDiscussion] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && data.mentor) setMentor(data.mentor);
      } catch (error) {
        console.error("Gagal memuat data mentor:", error);
      } finally {
        setLoadingMentor(false);
      }
    };

    const fetchLiveSessions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/live-session/all-live`);
        const result = await response.json();
        if (result.success && result.data) {
          const activeSessions = result.data
            .filter((session: any) => session.status === 'active')
            .slice(0, 2);
          setLiveSessions(activeSessions);
        }
      } catch (error) {
        console.error("Gagal memuat sesi live:", error);
      } finally {
        setLoadingLive(false);
      }
    };

    const fetchLatestDiscussion = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/books/discussions/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          setLatestDiscussion(result.data[0]);
        }
      } catch (error) {
        console.error("Gagal memuat diskusi:", error);
      } finally {
        setLoadingDiscussion(false);
      }
    };

    fetchUserData();
    fetchLiveSessions();
    fetchLatestDiscussion();
  }, []);

  return (
    <div className="space-y-6">
      {/* --- SECTION: DISKUSI TERBARU --- */}
      <section className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">Diskusi Terbaru</h3>
          <Users size={16} className="text-blue-500 opacity-50" />
        </div>
        
        {loadingDiscussion ? (
          <div className="flex justify-center py-6 text-slate-300">
            <Loader2 className="animate-spin" size={20} />
          </div>
        ) : latestDiscussion ? (
          <div className="space-y-4">
            <div className="flex gap-4 items-start relative z-10">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${latestDiscussion.owner?.nama || 'User'}&background=0D8ABC&color=fff`} 
                    alt="User" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-800 truncate">
                  {latestDiscussion.owner?.nama || "Anonymous Peserta"}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium mt-0.5">
                  "{latestDiscussion.title}"
                </p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    {latestDiscussion.name || "General Group"}
                  </span>
                </div>
              </div>
            </div>

            <Link href="/peserta/experience">
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 flex items-center justify-center gap-2 border-2 border-slate-50 text-slate-700 font-bold rounded-2xl text-[11px] transition-all group"
              >
                GABUNG DISKUSI 
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-slate-50 rounded-2xl">
            <p className="text-[11px] font-bold text-slate-400 uppercase italic">Belum ada diskusi aktif</p>
          </div>
        )}
      </section>

      {/* --- SECTION: LIVE SESSION --- */}
      <section className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-red-50 rounded-lg">
            <Radio size={16} className="text-[#c31a26] animate-pulse" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">Sesi Terdekat</h3>
        </div>

        {loadingLive ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-slate-200" size={24} />
          </div>
        ) : liveSessions.length > 0 ? (
          <div className="space-y-4">
            {liveSessions.map((session) => (
              <div key={session.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white">
                    <img 
                      src={session.poster_url ? `${API_BASE_URL.replace('/api', '')}${session.poster_url}` : `https://ui-avatars.com/api/?name=${session.speaker_name}&background=fecaca&color=c31a26`} 
                      alt="Speaker" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-[11px] truncate uppercase tracking-tight">{session.title}</p>
                    <p className="text-slate-500 text-[10px] font-bold mt-0.5">{session.speaker_name}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#c31a26] font-extrabold mt-1.5 bg-white w-fit px-2 py-0.5 rounded-md border border-red-50">
                      <Calendar size={10} />
                      {new Date(session.scheduled_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
                <Link href={`/peserta/livesession/${session.id}`}>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 bg-[#c31a26] text-white font-black uppercase tracking-[0.1em] rounded-xl text-[10px] shadow-lg shadow-red-200/50 hover:bg-red-700 transition-all"
                  >
                    IKUTI SEKARANG
                  </motion.button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center bg-slate-50/50 rounded-[20px] border-2 border-dashed border-slate-100">
            <Radio size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Tidak ada jadwal<br/>aktif saat ini</p>
          </div>
        )}
      </section>

      {/* --- SECTION: KONTAK MENTOR --- */}
      <section className="bg-gradient-to-br from-[#c31a26] to-[#a0141d] rounded-[24px] p-5 shadow-lg shadow-red-200/40 relative overflow-hidden">
        {/* Dekorasi Aksen */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
        
        <h3 className="font-extrabold text-white text-sm md:text-base tracking-tight mb-5 flex justify-between items-center relative z-10">
          Personal Mentor
          <MessageCircle size={16} className="opacity-60" />
        </h3>
        
        {loadingMentor ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-white/30" size={20} />
          </div>
        ) : mentor ? (
          <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 bg-white/20 p-1">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${mentor.nama}&background=fff&color=c31a26`} 
                    alt={mentor.nama} 
                    className="w-full h-full object-cover rounded-xl shadow-sm" 
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-[#c31a26] rounded-full"></div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">{mentor.nama}</p>
                <p className="text-[10px] text-white/70 uppercase font-black tracking-wider mt-1 line-clamp-1">{mentor.spesialisasi}</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="mt-3 px-4 py-1.5 bg-white text-[#c31a26] text-[10px] font-black rounded-lg flex items-center gap-2 shadow-xl"
                >
                  CHAT SEKARANG
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center bg-white/10 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-white/60 uppercase italic">Mentor belum diatur</p>
          </div>
        )}
      </section>
    </div>
  );
}