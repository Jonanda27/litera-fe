"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { CertLevelBar } from '@/components/certificate/CertLevelBar';
import { CertItemCard } from '@/components/certificate/CertItemCard';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constans/constans';

interface ModuleData {
  id: number;
  title: string;
  progress: number;
  isLocked: boolean;
  certificateUrl: string | null;
}

interface LevelData {
  id: number;
  levelName: string;
  totalProgress: number;
  modules: ModuleData[];
}

export default function SertifikatPage() {
  const [data, setData] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem('token');
       const response = await axios.get(`${API_BASE_URL}/auth/my-certificates`, {
  headers: { Authorization: `Bearer ${token}` }
});
        setData(response.data);
      } catch (error) {
        console.error("Gagal memuat data sertifikat:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const handleDownload = (url: string | null, title: string) => {
    if (!url || url === "#") {
      alert(`Sertifikat untuk ${title} sedang diproses atau file belum di-upload oleh admin.`);
      return;
    }
    window.open(url, '_blank');
  };

  if (loading) return (
    <Sidebar><div className="p-10 text-center font-bold">MEMUAT DATA...</div></Sidebar>
  );

  return (
    <Sidebar>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="max-w-[1400px] mx-auto space-y-8"
      >
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">SERTIFIKAT KAMU</h1>
        </header>

        {data.map((levelItem) => (
          <section key={levelItem.id}>
            {/* Bar Progress Level (0%, 20%, 40%... dst sesuai jumlah modul tuntas) */}
            <CertLevelBar 
              level={levelItem.id} 
              progress={levelItem.totalProgress} 
              barColor="bg-[#C31A26]" 
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              {levelItem.modules.map((mod) => (
                <CertItemCard 
                  key={mod.id}
                  title={mod.title} 
                  subtitle={mod.isLocked ? `${mod.progress}% Selesai` : "Selesai 100%"} 
                  isLocked={mod.isLocked}
                  // Menggunakan onClick jika komponen mendukung, atau pastikan card bisa diklik
                  // @ts-ignore
                  onClick={() => !mod.isLocked && handleDownload(mod.certificateUrl, mod.title)}
                />
              ))}

              {/* Card Spesial untuk Kelulusan Level */}
              <CertItemCard 
                title={`LEVEL ${levelItem.id}`} 
                subtitle={levelItem.totalProgress === 100 ? "LULUS" : "BELUM LULUS"} 
                isSpecial 
                isLocked={levelItem.totalProgress < 100}
              />
            </div>
          </section>
        ))}
      </motion.div>
    </Sidebar>
  );
}