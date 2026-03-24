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
  MoreVertical,
  AlertCircle
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

  // Handler: Mengakhiri Sesi (Status -> ended)
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

  // Handler: Menghapus Sesi Permanen
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
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto py-10 px-6">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Live <span className="text-[#c31a26]">Manager</span>
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
              Kontrol penuh atas seluruh penyiaran langsung
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/livesession/create')}
            className="flex items-center gap-2 bg-[#c31a26] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] active:scale-95"
          >
            <Plus size={18} /> Buat Sesi Baru
          </button>
        </div>

        {/* Stats & Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari judul sesi atau pembicara..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-4 border-slate-900 outline-none font-bold text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-slate-100 rounded-2xl flex items-center justify-center p-4 border-2 border-slate-200">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Total Sesi: <span className="text-slate-900 text-lg ml-2">{sessions.length}</span>
            </p>
          </div>
        </div>

        {/* List Sesi */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 font-black text-slate-300 animate-pulse uppercase tracking-widest">Loading Data...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-slate-200 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-slate-400">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">Tidak Ada Sesi Ditemukan</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div key={session.id} className="group bg-white border-4 border-slate-900 rounded-[2rem] p-6 hover:shadow-[12px_12px_0px_0px_rgba(195,26,38,0.1)] transition-all flex flex-col md:flex-row items-center gap-6">

                {/* Status Indicator */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-4 border-slate-900 ${session.status === 'active' ? 'bg-red-50 text-[#c31a26]' :
                  session.status === 'scheduled' ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'
                  }`}>
                  <Video size={28} className={session.status === 'active' ? 'animate-pulse' : ''} />
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                    <h3 className="text-lg font-black text-slate-900 uppercase leading-tight">{session.title}</h3>
                    <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase border-2 ${session.status === 'active' ? 'bg-red-600 text-white border-red-600' :
                      session.status === 'scheduled' ? 'bg-amber-400 text-white border-amber-400' : 'bg-slate-200 text-slate-500 border-slate-200'
                      }`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase">
                      <User size={14} className="text-[#c31a26]" /> {session.speaker_name}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                      <Calendar size={14} /> {session.scheduled_at}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {session.status === 'active' && (
                    <>
                      <button
                        onClick={() => router.push(`/admin/livesession/${session.id}`)}
                        className="p-4 bg-slate-900 text-white rounded-xl hover:bg-[#c31a26] transition-all group-hover:scale-105"
                        title="Masuk ke Ruangan"
                      >
                        <ExternalLink size={20} />
                      </button>
                      <button
                        onClick={() => handleEndSession(session.id)}
                        className="p-4 bg-red-50 text-[#c31a26] border-2 border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                        title="Akhiri Sesi"
                      >
                        <StopCircle size={20} />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-4 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                    title="Hapus Permanen"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </Sidebar>
  );
}