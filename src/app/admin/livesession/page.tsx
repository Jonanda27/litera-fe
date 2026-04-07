"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
  Video,
  Trash2,
  StopCircle,
  ExternalLink,
  Plus,
  Calendar,
  User,
  Search,
  AlertCircle,
  Clock,
  Radio,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { API_BASE_URL } from "@/lib/constans/constans";

interface LiveSession {
  id: string;
  title: string;
  speaker_name: string;
  status: 'active' | 'scheduled' | 'ended';
  scheduled_at: string;
  room_name: string;
}

export default function AdminManageLive() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/live-session/all-live`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setSessions(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleEndSession = async (id: string) => {
    if (!window.confirm("Akhiri sesi ini untuk semua peserta?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/live-session/end-live/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchSessions();
    } catch (err) {
      alert("Gagal mengakhiri sesi");
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm("Hapus data sesi ini secara permanen?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/live-session/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchSessions();
    } catch (err) {
      alert("Gagal menghapus sesi");
    }
  };

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.speaker_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper untuk badge status
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'active':
        return { 
            bg: 'bg-red-50', 
            text: 'text-red-600', 
            border: 'border-red-200', 
            icon: <Radio size={14} className="animate-pulse" />, 
            label: 'Live Now' 
        };
      case 'scheduled':
        return { 
            bg: 'bg-blue-50', 
            text: 'text-blue-600', 
            border: 'border-blue-200', 
            icon: <Clock size={14} />, 
            label: 'Scheduled' 
        };
      default:
        return { 
            bg: 'bg-slate-50', 
            text: 'text-slate-500', 
            border: 'border-slate-200', 
            icon: <CheckCircle2 size={14} />, 
            label: 'Ended' 
        };
    }
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-[#f8fafc] pb-20">
        <div className="max-w-6xl mx-auto pt-10 px-6">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-1 bg-[#c31a26] rounded-full"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Stream Control Panel</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                Live<span className="text-[#c31a26]">Manager</span>
              </h1>
            </div>
            
            <button
              onClick={() => router.push('/admin/livesession/create')}
              className="group flex items-center gap-3 bg-slate-900 text-white px-7 py-4 rounded-2xl font-bold text-sm transition-all hover:bg-[#c31a26] hover:shadow-[0_20px_40px_-15px_rgba(195,26,38,0.35)] active:scale-95"
            >
              <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
                <Plus size={20} />
              </div>
              BUAT SESI BARU
            </button>
          </div>

          {/* Search & Utility Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau speaker..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-[#c31a26] focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium text-slate-600 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="px-8 py-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">
                Total Sesi: <span className="text-slate-900 ml-1">{sessions.length}</span>
              </p>
            </div>
          </div>

          {/* Sessions List */}
          <div className="grid gap-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 opacity-20">
                 <Loader2 className="animate-spin mb-4" size={40} />
                 <p className="font-black uppercase tracking-[0.5em]">Syncing Data</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-28 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={60} className="mb-4 text-slate-200" />
                <p className="font-bold uppercase tracking-widest text-sm">Tidak Ada Sesi Terdeteksi</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const status = getStatusDetails(session.status);
                return (
                  <div 
                    key={session.id} 
                    className="group bg-white rounded-[2.5rem] border border-slate-100 p-5 md:p-7 flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:border-[#c31a26]/10"
                  >
                    {/* Visual Icon */}
                    <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-500 ${status.bg} ${status.text}`}>
                      <Video size={32} />
                      {session.status === 'active' && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </span>
                      )}
                    </div>

                    {/* Information */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none group-hover:text-[#c31a26] transition-colors">
                          {session.title}
                        </h3>
                        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.bg} ${status.text} ${status.border} self-center md:self-auto`}>
                          {status.icon}
                          {status.label}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-6">
                        <div className="flex items-center gap-2.5 text-slate-500">
                          <div className="bg-slate-100 p-1.5 rounded-lg text-slate-400">
                            <User size={14} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-tighter">{session.speaker_name}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-500">
                          <div className="bg-slate-100 p-1.5 rounded-lg text-slate-400">
                            <Calendar size={14} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-tighter">
                            {new Date(session.scheduled_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-3xl border border-slate-100">
                      {session.status === 'active' && (
                        <>
                          <button
                            onClick={() => router.push(`/admin/livesession/${session.id}`)}
                            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all active:scale-90 shadow-lg shadow-slate-200"
                            title="Enter Room"
                          >
                            <ExternalLink size={20} />
                          </button>
                          <button
                            onClick={() => handleEndSession(session.id)}
                            className="p-4 bg-white text-red-600 border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-90"
                            title="End Session"
                          >
                            <StopCircle size={20} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-4 bg-white text-slate-400 border border-slate-200 rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-90"
                        title="Delete Permanently"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}