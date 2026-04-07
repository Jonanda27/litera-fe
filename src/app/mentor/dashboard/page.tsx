"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { API_BASE_URL } from '@/lib/constans/constans';
import { 
  Users, 
  MessageSquare, 
  History, 
  Clock, 
  Loader2,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// --- Interfaces ---
interface DashboardStats {
  totalStudents: number;
  waitingFeedback: number;
  totalActivities: number;
}

interface PriorityQueueItem {
  id: string;
  name: string;
  project: string;
  timeElapsed: string;
  status: 'Urgent' | 'New';
  unhandledCount: number;
}

interface MentorLog {
  id: string;
  description: string;
  createdAt: string;
}

export default function ModernMentorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    waitingFeedback: 0,
    totalActivities: 0
  });
  const [priorityQueue, setPriorityQueue] = useState<PriorityQueueItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<MentorLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mentorName, setMentorName] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Selamat Pagi"); // Default greeting

  // Fungsi untuk mendapatkan sapaan berdasarkan waktu
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  useEffect(() => {
    // Set greeting saat komponen dimuat
    setGreeting(getGreeting());

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Ambil Data Profil Mentor
        const resMe = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataMe = await resMe.json();
        const firstName = dataMe.nama?.split(' ')[0] || 'Mentor';
        setMentorName(firstName);

        // 2. Ambil Daftar Peserta
        const resStudents = await fetch(`${API_BASE_URL}/mentors/my-students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const studentData = await resStudents.json();

        if (studentData.success) {
          let totalWaitingMessages = 0;

          const studentsWithUnread = await Promise.all(studentData.data.map(async (student: any) => {
            const generatedRoom = `private-mentoring-${dataMe.id}-${student.id}`;
            let unhandledCount = 0;

            try {
              const resHistory = await fetch(`${API_BASE_URL}/books/private-history/${generatedRoom}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const historyData = await resHistory.json();
              
              if (historyData.success) {
                const msgs = historyData.data;
                let studentMsgs = 0;
                let systemMsgs = 0;

                for (let i = msgs.length - 1; i >= 0; i--) {
                  const m = msgs[i];
                  const isSystem = m.message.startsWith("[SYSTEM]");
                  const isMentor = m.senderId === dataMe.id && !isSystem;

                  if (isMentor) break;

                  if (isSystem) {
                    systemMsgs++;
                  } else if (m.senderId === student.id) {
                    studentMsgs++;
                  }
                }
                
                unhandledCount = Math.max(0, studentMsgs - systemMsgs);
              }
            } catch (err) {
              console.error("Gagal kalkulasi unread untuk dashboard:", err);
            }

            totalWaitingMessages += unhandledCount;
            return { ...student, unhandledCount };
          }));

          const queue: PriorityQueueItem[] = studentsWithUnread
            .filter((s: any) => s.unhandledCount > 0)
            .map((s: any): PriorityQueueItem => ({
              id: s.id,
              name: s.nama,
              project: s.currentLevelDisplay,
              timeElapsed: s.inactivityLabel || 'Baru Saja',
              status: s.daysInactive >= 3 ? 'Urgent' : 'New', 
              unhandledCount: s.unhandledCount
            }));

          setPriorityQueue(queue);
          setStats(prev => ({
            ...prev,
            totalStudents: studentsWithUnread.length,
            waitingFeedback: totalWaitingMessages 
          }));
        }

        // 3. Ambil Log Aktivitas
        const resLogs = await fetch(`${API_BASE_URL}/mentors/my-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const logsData = await resLogs.json();
        if (logsData.success) {
          setRecentLogs(logsData.data.slice(0, 2));
          setStats(prev => ({ ...prev, totalActivities: logsData.data.length }));
        }

      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return (
    <Sidebar>
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#C31A26]" size={40} />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat Dashboard...</p>
      </div>
    </Sidebar>
  );

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto space-y-10 pb-12">
        
        {/* Welcome Header */}
        <div 
          className="rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
          style={{
            backgroundImage: "url('/bekgroncard.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60 z-0"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C31A26] rounded-full mix-blend-screen filter blur-[80px] opacity-40 z-0"></div>
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 z-0"></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-black mt-1 tracking-tight">
              {greeting}, <span className="text-white">{mentorName}!</span>
            </h1>
            <p className="text-slate-200 mt-3 font-medium text-sm md:text-base max-w-lg">
              Kamu memiliki <span className="text-red-400 font-bold bg-red-400/20 px-2 py-0.5 rounded-md border border-red-400/30">{stats.waitingFeedback} pesan baru</span> dari {priorityQueue.length} peserta yang membutuhkan arahanmu hari ini.
            </p>
          </div>
          
          <div className="relative z-10 hidden md:flex flex-col items-end bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-lg">
            <p className="text-sm font-bold text-white">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <p className="text-[10px] text-emerald-300 font-black uppercase tracking-widest">Sistem Online</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Peserta Bimbingan" 
            value={`${stats.totalStudents}/20`} 
            sub="Total Siswa Aktif" 
            icon={<Users size={24} />} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
          />
          <StatCard 
            label="Menunggu Feedback" 
            value={stats.waitingFeedback} 
            sub="Total Pesan Belum Dibalas" 
            icon={<MessageSquare size={24} />} 
            color="text-red-600" 
            bgColor="bg-orange-50" 
          />
          <StatCard 
            label="Aktivitas Mentor" 
            value={stats.totalActivities} 
            sub="Minggu Ini" 
            icon={<History size={24} />} 
            color="text-emerald-600" 
            bgColor="bg-emerald-50" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Antrean Pesan</h3>
                <span className="bg-red-100 text-[#C31A26] px-2 py-1 rounded-md text-[10px] font-black">{stats.waitingFeedback} Pesan</span>
              </div>
              <Link href="/mentor/feedback-proyek" className="group flex items-center gap-1 text-[11px] font-black text-[#C31A26] hover:text-red-800 transition-colors uppercase tracking-widest">
                Lihat Semua <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4">
              {priorityQueue.length > 0 ? priorityQueue.map((item) => (
                <div key={item.id} className="group bg-white border border-slate-100 p-5 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#C31A26]/30 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-black shadow-md">
                        {item.name.charAt(0)}
                      </div>
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                        {item.unhandledCount}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 text-sm group-hover:text-[#C31A26] transition-colors">{item.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${item.status === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {item.project}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-6 w-full md:w-auto mt-2 md:mt-0">
                    <Link href={`/mentor/feedback-proyek`}>
                      <button className="bg-slate-50 hover:bg-[#C31A26] text-slate-700 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 border border-slate-200 hover:border-transparent">
                        Balas Chat
                      </button>
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] py-16 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                    <Sparkles size={28} />
                  </div>
                  <h4 className="text-slate-700 font-black">Kerja Bagus!</h4>
                  <p className="text-slate-400 font-medium text-sm text-center max-w-xs">Tidak ada antrean pesan saat ini.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Log Aktivitas</h3>
              <Link href="/mentor/daftar-peserta" className="group flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-[#C31A26] transition-colors uppercase tracking-widest">
                Lihat Semua <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-2">
                {recentLogs.length > 0 ? recentLogs.map((log, index) => (
                  <div key={log.id} className="relative pl-6">
                    <div className="absolute -left-[17px] top-0.5 w-8 h-8 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <Clock size={12} className={index === 0 ? "text-[#C31A26]" : ""} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className={`text-xs font-semibold leading-relaxed ${index === 0 ? 'text-slate-800' : 'text-slate-600'}`}>
                        {log.description}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 pl-4 font-medium">Belum ada aktivitas tercatat.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
}

// Sub-komponen StatCard
function StatCard({ label, value, sub, icon, color, bgColor }: any) {
  return (
    <div className="group bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl ${bgColor} ${color} transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">{value}</h2>
        </div>
      </div>
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-[10px] text-slate-400 font-semibold mt-2 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${color.replace('text', 'bg')}`}></span>
        {sub}
      </p>
    </div>
  );
}