"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import DiscussionCards from '@/components/experience/DiscussionCards';

export default function ExperienceList() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    // Ambil daftar meeting yang statusnya 'active'
    fetch('http://localhost:4000/api/meetings/all-meetings')
      .then(res => res.json())
      .then(result => setMeetings(result.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Experience</h1>
            <p className="text-slate-800 font-bold text-lg">Ruang diskusi komunitas.</p>
          </div>

          {/* TOMBOL UNTUK KE HALAMAN BUAT MEETING */}
          <Link href="/peserta/experience/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-200">
              + Mulai Diskusi
            </button>
          </Link>
        </div>

        {/* Kirim data meetings dari backend ke component DiscussionCards */}
        <DiscussionCards items={meetings} />
      </div>
    </Sidebar>
  );
}