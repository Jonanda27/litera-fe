"use client";

import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { LiveSessionCard } from '@/components/live/LiveSessionCard';
import { PastVideoCard } from '@/components/live/PastVideoCard';

export default function LiveSessionPage() {
  // Menggunakan URL placeholder yang stabil
  const posters = [
    "https://picsum.photos/id/1/300/400",
    "https://picsum.photos/id/2/300/400",
    "https://picsum.photos/id/3/300/400",
    "https://picsum.photos/id/4/300/400"
  ];

  const pastVideos = [
    { title: "Pengaturan Keuangan Pribadi", thumb: "https://picsum.photos/id/10/400/225" },
    { title: "Hidup Sehat dan Bahagia", thumb: "https://picsum.photos/id/11/400/225" },
    { title: "Masa Depan Bahagia", thumb: "https://picsum.photos/id/12/400/225" }
  ];

  return (
    <Sidebar>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1200px] mx-auto space-y-12 pb-20"
      >
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Live Session</h1>
          <p className="text-slate-800 font-bold text-lg mt-1">Silahkan ikuti kelas online</p>
        </header>

        {/* Grid Sesi Aktif (4 Kolom) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {posters.map((url, i) => (
            <LiveSessionCard key={i} imageSrc={url} />
          ))}
        </div>

        {/* Section Rekaman (3 Kolom) */}
        <section className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Rekaman kelas online sebelumnya
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pastVideos.map((video, i) => (
              <PastVideoCard key={i} title={video.title} thumbnail={video.thumb} />
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button className="text-[#1E4E8C] font-black text-sm italic flex items-center gap-1 hover:mr-2 transition-all">
              Video Selanjutnya <span className="not-italic">&gt;&gt;</span>
            </button>
          </div>
        </section>
      </motion.div>
    </Sidebar>
  );
}