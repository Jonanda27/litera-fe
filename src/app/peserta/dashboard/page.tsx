"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  MessageCircle,
  Radio,
  Calendar,
  ArrowRight,
  Users,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { API_BASE_URL } from "../../../lib/constans/constans";

// --- HELPER: GET INITIAL ---
const getInitial = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : "?";
};

// --- HELPER: GET GREETING ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 19) return "Selamat Sore";
  return "Selamat Malam";
};

// --- SUB-COMPONENT: COURSE CARD ---
function CourseCard({ title, progress, icon }: { title: string; progress: number; icon?: string }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-white/50 relative overflow-hidden group hover:shadow-2xl transition-all h-full flex flex-col justify-center min-h-[300px]"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl group-hover:bg-blue-200/50 transition-colors duration-700" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-50/50 rounded-full blur-3xl group-hover:bg-red-100/50 transition-colors duration-700" />
      </div>

      <div className="flex items-center gap-6 mb-8 relative z-10">
        <div className="text-4xl bg-white w-20 h-20 flex items-center justify-center rounded-[2rem] group-hover:rotate-12 transition-transform shrink-0 border border-slate-100 shadow-sm">
          <span>{icon || "🚀"}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-[#c31a26] fill-[#c31a26]" />
            <p className="text-[10px] text-[#c31a26] font-black uppercase tracking-[0.25em]">Lanjutkan Progress</p>
          </div>
          <h3 className="font-black text-slate-800 text-2xl md:text-4xl leading-tight uppercase tracking-tighter ">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-end font-black mb-1">
          <span className="text-xs text-slate-400 uppercase tracking-[0.2em]">Status: {progress >= 100 ? "Selesai" : "Sedang Berjalan"}</span>
          <span className="text-4xl text-slate-800 tracking-tighter">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100/50 h-6 rounded-full overflow-hidden flex shadow-inner relative border border-slate-200/50 p-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 12, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-[#1e4e8c] via-[#c31a26] to-[#1e4e8c] bg-[length:200%_100%] animate-shimmer rounded-full relative z-10 border-r-2 border-white/30"
          />
        </div>
      </div>

      <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700">
        <BookOpen size={240} />
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [mentor, setMentor] = useState<any>(null);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [latestDiscussion, setLatestDiscussion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState({ mentor: true, live: true, discussion: true });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.status === "Non-Aktif") {
      window.location.href = "/peserta/upgrade";
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/dashboard-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setSummary(await res.json());
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchExtra = async () => {
      // Mengambil data diri termasuk mentorData
      fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(d => {
          // Sesuai dengan respons API: { mentorData: { nama, spesialisasi, ... } }
          if (d.mentorData) {
            setMentor(d.mentorData);
          }
        })
        .finally(() => setLoadingItems(p => ({ ...p, mentor: false })));

      fetch(`${API_BASE_URL}/live-session/all-live`)
        .then(res => res.json()).then(r => { if (r.success) setLiveSessions(r.data.filter((s: any) => s.status === 'active').slice(0, 2)); })
        .finally(() => setLoadingItems(p => ({ ...p, live: false })));

      fetch(`${API_BASE_URL}/books/discussions/all`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json()).then(r => { if (r.success && r.data?.length > 0) setLatestDiscussion(r.data[0]); })
        .finally(() => setLoadingItems(p => ({ ...p, discussion: false })));
    };

    fetchData();
    fetchExtra();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1e4e8c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black text-[#1e4e8c] animate-pulse uppercase text-sm tracking-widest">Menyiapkan Ruang Belajar...</p>
      </div>
    </div>
  );

  return (
    <Sidebar>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-[#1e4e8c]/5 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 100, 0], scale: [1, 1.5, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-[#c31a26]/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 pb-12 relative z-10">

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end"
        >
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#c31a26]/10 rounded-lg backdrop-blur-sm">
                <Sparkles className="text-[#c31a26]" size={18} />
              </div>
              <p className="text-[#c31a26] font-black uppercase text-xs tracking-[0.3em]">
                {getGreeting()}
              </p>
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">
              DASHBOARD
            </h1>
            <div className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-lg shadow-slate-200">
              <span className="font-bold uppercase text-[10px] tracking-widest">
                {summary?.level_saat_ini || "Level 1: Dasar Literasi"}
              </span>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={16} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-xs">Total Progress Belajar</span>
              </div>
              <span className="font-black text-xl text-[#1e4e8c] ">{summary?.persentase_progres || 0}%</span>
            </div>
            <div className="relative z-10">
              <ProgressBar progress={summary?.persentase_progres || 0} />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseCard
              title={summary?.currentModule?.title || "Mulai Belajar Sekarang"}
              progress={summary?.currentModule?.progress || 0}
              icon="📖"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <section className="bg-gradient-to-br from-[#c31a26] via-[#a51620] to-[#1e4e8c] rounded-[2.5rem] p-8 h-full flex flex-col justify-between text-white relative overflow-hidden shadow-2xl shadow-red-200/50 group">
              <div className="absolute -top-[100%] left-[-100%] w-[300%] h-[300%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_50%)] group-hover:animate-pulse pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-[0.2em] text-white/80 mb-1">Personal</h3>
                    <p className="text-2xl font-black  uppercase tracking-tighter">Mentor</p>
                  </div>
                  <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 group-hover:rotate-12 transition-transform">
                    <MessageCircle size={24} className="text-white" />
                  </div>
                </div>

                {loadingItems.mentor ? (
                  <div className="flex items-center gap-4 animate-pulse">
                    <div className="w-20 h-20 bg-white/20 rounded-[2rem]"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-white/20 rounded"></div>
                      <div className="w-16 h-3 bg-white/10 rounded"></div>
                    </div>
                  </div>
                ) : mentor ? (
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center shadow-xl shrink-0 group-hover:scale-110 transition-all duration-500 border-4 border-white/20">
                      <span className="text-[#c31a26] text-3xl font-black">
                        {getInitial(mentor.nama)}
                      </span>
                    </div>
                    <div>
                      <p className="font-black uppercase text-xl leading-none mb-1 tracking-tight">{mentor.nama}</p>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.1em]">{mentor.spesialisasi || "Expert Mentor"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Belum ada mentor yang ditugaskan</p>
                  </div>
                )}
              </div>

              <button className="relative z-10 w-full py-5 bg-white text-[#c31a26] font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] mt-8 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-xl">
                Konsultasi Sekarang
              </button>

              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
            </section>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/50 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors duration-700" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-[#1e4e8c]">
                  <Users size={24} />
                </div>
                <h3 className="font-black text-slate-800 uppercase tracking-widest ">Diskusi Hangat</h3>
              </div>
              <Link href="/peserta/experience" className="text-[10px] font-black text-[#c31a26] hover:bg-[#c31a26] hover:text-white border border-[#c31a26] px-4 py-2 rounded-full transition-all uppercase tracking-widest">Eksplor</Link>
            </div>

            {loadingItems.discussion ? <Loader2 className="animate-spin text-slate-200" /> : latestDiscussion ? (
              <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 group-hover:border-[#1e4e8c]/30 group-hover:bg-white transition-all relative overflow-hidden z-10">
                <div className="flex gap-4 items-center mb-5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#1e4e8c] flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-white text-lg font-black ">
                      {getInitial(latestDiscussion.owner?.nama)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1">{latestDiscussion.owner?.nama}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Community Member</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-700 leading-tight mb-6 relative z-10 ">"{latestDiscussion.title}"</p>
                <Link href="/peserta/experience">
                  <button className="flex items-center gap-2 text-[11px] font-black text-[#1e4e8c] uppercase tracking-widest hover:gap-4 transition-all">
                    Ikuti Percakapan <ArrowRight size={16} />
                  </button>
                </Link>
                <MessageCircle className="absolute right-[-20px] bottom-[-20px] text-slate-200/20 rotate-12" size={120} />
              </div>
            ) : <p className="text-xs text-slate-400 font-bold">Belum ada diskusi terbaru.</p>}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/50 relative overflow-hidden group"
          >
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-50/50 rounded-full blur-2xl -ml-10 -mb-10 group-hover:bg-red-100 transition-colors duration-700" />

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="p-3 bg-red-50 rounded-2xl">
                <Radio size={24} className="text-[#c31a26] animate-pulse" />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-widest ">Live Session</h3>
            </div>

            <div className="space-y-4 relative z-10">
              {loadingItems.live ? <Loader2 className="animate-spin text-slate-200" /> : liveSessions.length > 0 ? liveSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group overflow-hidden relative">
                  <div className="min-w-0 relative z-10">
                    <p className="font-black text-slate-800 text-sm uppercase truncate group-hover:text-[#c31a26] transition-colors tracking-tight">{session.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar size={14} className="text-[#c31a26]" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jadwal Terdekat</p>
                    </div>
                  </div>
                  <Link href={`/peserta/livesession/${session.id}`} className="relative z-10">
                    <button className="px-6 py-3 bg-[#c31a26] text-white font-black text-[10px] rounded-xl uppercase tracking-widest hover:bg-slate-900 hover:scale-105 transition-all shadow-lg">Gabung</button>
                  </Link>
                  <div className="absolute right-0 top-0 h-full w-1 bg-[#c31a26] opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              )) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                  <Calendar size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Belum ada jadwal sesi live</p>
                </div>
              )}
            </div>
          </motion.section>

        </div>
      </div>
    </Sidebar>
  );
}