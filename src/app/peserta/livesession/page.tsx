"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { LiveSessionCard } from '@/components/live/LiveSessionCard';
import { PastVideoCard } from '@/components/live/PastVideoCard';
import { API_BASE_URL } from "@/lib/constans/constans";
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface LiveSession {
  id: string;
  title: string;
  speaker_name: string;
  scheduled_at: string;
  status: 'scheduled' | 'active' | 'ended';
  poster_url: string;
  recording_url?: string;
}

export default function LiveSessionPage() {
  const [activeSessions, setActiveSessions] = useState<LiveSession[]>([]);
  const [pastSessions, setPastSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/live-session/all-live`);
        const result = await res.json();

        if (result.success) {
          // Pisahkan data berdasarkan status
          const live = result.data.filter((s: LiveSession) => s.status !== 'ended');
          const ended = result.data.filter((s: LiveSession) => s.status === 'ended');

          setActiveSessions(live);
          setPastSessions(ended);
        }
      } catch (err) {
        console.error("Gagal load sesi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <Sidebar>
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#1E4E8C] animate-spin" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Menyinkronkan Siaran...</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto space-y-8 pb-20"
      >
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Live <span className="text-[#c31a26]">Session</span>
          </h1>
          <p className="text-slate-800 font-bold text-lg mt-1 uppercase">Silahkan ikuti kelas online hari ini</p>
        </header>

        {/* Section 1: Sesi Aktif & Terjadwal */}
        <section className="space-y-6">
          {activeSessions.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Belum ada jadwal siaran aktif</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeSessions.map((session) => (
                <Link href={`/peserta/livesession/${session.id}`} key={session.id}>
                  <LiveSessionCard
                    imageSrc={`${API_BASE_URL}${session.poster_url}`}
                    title={session.title}
                    speaker={session.speaker_name}
                    status={session.status}
                    time={session.scheduled_at}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Rekaman Video Sebelumnya */}
        <section className="space-y-6 pt-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-[#1E4E8C]"></div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              Arsip Rekaman Kelas
            </h2>
          </div>

          {pastSessions.length === 0 ? (
            <p className="text-slate-400 italic text-sm">Belum ada rekaman tersedia.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pastSessions.map((video) => (
                <PastVideoCard
                  key={video.id}
                  title={video.title}
                  thumbnail={`${API_BASE_URL}${video.poster_url}`}
                  url={video.recording_url} // Pastikan komponen ini menangani klik URL
                />
              ))}
            </div>
          )}

          {pastSessions.length > 0 && (
            <div className="flex justify-end pt-4">
              <button className="text-[#1E4E8C] font-black text-sm italic flex items-center gap-1 hover:mr-2 transition-all uppercase tracking-tighter">
                Lihat Semua Rekaman <span className="not-italic">→</span>
              </button>
            </div>
          )}
        </section>
      </motion.div>
    </Sidebar>
  );
}