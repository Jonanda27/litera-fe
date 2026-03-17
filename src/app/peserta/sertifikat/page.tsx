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
  levelCertificateUrl?: string | null; 
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
      alert(`Sertifikat untuk ${title} sedang diproses atau belum tersedia.`);
      return;
    }
    window.open(url, '_blank');
  };

  if (loading) return (
    <Sidebar>
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1e4e8c] border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-slate-400 tracking-[0.3em] text-xs uppercase">Syncing Data...</p>
        </div>
      </div>
    </Sidebar>
  );

  return (
    <Sidebar>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-[1400px] mx-auto h-[calc(100dvh-80px)] md:h-[calc(100vh-120px)] flex flex-col px-2 md:px-4 lg:px-0 space-y-12"
      >
        <header className="relative py- border-b-2 border-slate-100">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Sertifikat Kamu
            </h1>
          </div>
          <p className="text-slate-500 font-bold text-sm md:text-base  uppercase tracking-widest opacity-70">
            Apresiasi pencapaian akademis dan dedikasi belajar kamu.
          </p>
        </header>

        {data.map((levelItem) => (
          <section key={levelItem.id} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-transparent rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            
            <div className="relative bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <span className="text-[12rem] font-black  select-none leading-none">0{levelItem.id}</span>
              </div>

              <CertLevelBar 
                level={levelItem.id} 
                progress={levelItem.totalProgress} 
                barColor="bg-[#C31A26]" 
              />
              
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter ">Status Kelulusan</h2>
                  <div className="h-[2px] flex-1 bg-slate-100" />
                </div>
                
                <div className="flex flex-col lg:flex-row items-center gap-10">
                  <div className="w-full max-w-[320px]">
                    <CertItemCard 
                      title={`LEVEL ${levelItem.id} GRADUATE`} 
                      subtitle={levelItem.totalProgress === 100 ? "Verified Achievement" : "Requirements Incomplete"} 
                      isSpecial 
                      isLocked={levelItem.totalProgress < 100}
                      // @ts-ignore
                      onClick={() => levelItem.totalProgress === 100 && handleDownload(levelItem.levelCertificateUrl || "#", `Level ${levelItem.id}`)}
                    />
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Syarat Klaim Sertifikat:</p>
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${levelItem.totalProgress === 100 ? 'bg-green-500' : 'bg-slate-200'}`}>
                          {levelItem.totalProgress === 100 ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className="text-slate-400 font-black">!</span>
                          )}
                        </div>
                        <div>
                          <p className={`text-lg font-black uppercase  ${levelItem.totalProgress === 100 ? 'text-green-600' : 'text-slate-600'}`}>
                            {levelItem.totalProgress === 100 
                              ? "Lulus Kualifikasi Level" 
                              : `Progres Kurang ${100 - levelItem.totalProgress}%`
                            }
                          </p>
                          <p className="text-xs text-slate-400 font-bold uppercase">Semua modul harus mencapai status 100%.</p>
                        </div>
                      </div>
                    </div>
                    
                    {levelItem.totalProgress === 100 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(levelItem.levelCertificateUrl || "#", `Level ${levelItem.id}`)}
                        className="w-full py-4 bg-[#1e4e8c] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                      >
                        Unduh Sertifikat Resmi <span className="text-xl">⬇</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </motion.div>
    </Sidebar>
  );
}