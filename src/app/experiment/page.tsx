"use client";

import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { ExpProjectCard } from '@/components/experiment/ExpProjectCard';
import { ExpFooter } from '@/components/experiment/ExpFooter';

export default function ExperimentPage() {
  return (
    <Sidebar>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto space-y-8"
      >
        {/* Header Section */}
        <header className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">EXPERIMENT</h1>
          <p className="text-slate-800 font-bold text-lg">
            Ini adalah ruang untuk melakukan penulisan buku kamu
          </p>
        </header>

        {/* Daftar Proyek */}
        <section className="space-y-4 pt-4">
          <ExpProjectCard 
            title="Menulis Buku Biografi Mamak"
            lastUpdate="12 Januari 2026"
            obstacle="Belum paham mengatur alur cerita"
          />
          <ExpProjectCard 
            title="Buku Kumpulan Cerita Lucu"
            lastUpdate="12 Januari 2026"
            obstacle="Menuangkan jokes ke dalam bentuk tulisan"
          />
        </section>

        {/* Link Tambah Proyek */}
        <div className="flex justify-end pr-4">
          <button className="text-[#1E4E8C] font-black text-sm italic hover:underline">
            Tambah Proyek
          </button>
        </div>

        {/* Footer: Tools & Mentor */}
        <ExpFooter />
      </motion.div>
    </Sidebar>
  );
}