"use client";

import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { CertLevelBar } from '@/components/certificate/CertLevelBar';
import { CertItemCard } from '@/components/certificate/CertItemCard';

export default function SertifikatPage() {
  return (
    <Sidebar>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-[1200px] mx-auto space-y-12 pb-20"
      >
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">SERTIFIKAT KAMU</h1>
        </header>

        {/* --- LEVEL 1 (Selesai 100%) --- */}
        <section>
          <CertLevelBar level={1} progress={100} barColor="bg-[#C31A26]" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
            <CertItemCard title="Level-I/Modul-1" subtitle="Mindset Keuangan Sehat" />
            <CertItemCard title="Level-I/Modul-2" subtitle="Dasar Perencanaan Keuangan" />
            <CertItemCard title="Level-I/Modul-3" subtitle="Mengelola Risiko dan Proteksi" />
            <CertItemCard title="Level-I/Modul-4" subtitle="Pengelolaan Aset dan Investasi" />
            <CertItemCard title="Level-I/Modul-5" subtitle="Pengelolaan Aset dan Investasi" />
            <CertItemCard title="Anisa Panduwinata" subtitle="Telah Menyelesaikan LEVEL-I" isSpecial />
          </div>
        </section>

        {/* --- LEVEL 2 (Progres 20%) --- */}
        <section>
          <CertLevelBar level={2} progress={20} barColor="bg-[#C31A26]" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
            <CertItemCard title="Level-2/Modul-1" subtitle="Analisis Keuangan Lanjut" />
            <CertItemCard title="Level-2/Modul-2" subtitle="Strategi Investasi Mikro" />
            <CertItemCard title="Level-2/Modul-3" subtitle="..." isLocked />
            <CertItemCard title="Level-2/Modul-4" subtitle="..." isLocked />
            <CertItemCard title="Level-2/Modul-5" subtitle="..." isLocked />
            <CertItemCard title="Sertifikat Level-2" subtitle="Belum Diperoleh" isSpecial isLocked />
          </div>
        </section>

        {/* --- LEVEL 3 (Belum Mulai 0%) --- */}
        <section>
          <CertLevelBar level={3} progress={0} barColor="bg-[#1E4E8C]" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CertItemCard 
                key={i} 
                title={`Level-3/Modul-${i}`} 
                subtitle="..." 
                isLocked 
                isSpecial={i === 6} 
              />
            ))}
          </div>
        </section>

      </motion.div>
    </Sidebar>
  );
}