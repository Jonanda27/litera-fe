"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ExProgressBar } from '@/components/exercise/ExProgressBar';
import { ExModuleItem } from '@/components/exercise/ExModuleItem';
import { ExFooterTools } from '@/components/exercise/ExFooterTools';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Import router untuk navigasi
import { API_BASE_URL } from "../../../lib/constans/constans";

export default function ExercisePage() {
  const router = useRouter(); // Inisialisasi router
  const [progress, setProgress] = useState(0);
  const [activeModule, setActiveModule] = useState(1);
  const [selectedLesson, setSelectedLesson] = useState<{ id: number, title: string, type: string, required: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [activeModule]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok && data.moduleProgress) {
        // Ambil progres spesifik untuk modul yang sedang aktif dari tabel User_Progress (via BE)
        const currentModProgress = data.moduleProgress[activeModule] || 0;
        setProgress(currentModProgress);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (id: number, title: string, type: string, required: number) => {
    if (progress < required) {
      alert(`Materi Terkunci! Selesaikan urutan sebelumnya.`);
      return;
    }
    setSelectedLesson({ id, title, type, required });
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleCompleteLesson = async () => {
  if (!selectedLesson) return;
  
  try {
    const token = localStorage.getItem('token');
    
    // Menggunakan variabel API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/auth/update-module-progress`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        lessonId: selectedLesson.id, 
        moduleId: activeModule 
      })
    });

    const data = await response.json();
    if (response.ok) {
      setProgress(data.newProgress); 
      setSelectedLesson(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (err) {
    alert("Koneksi gagal ke server.");
  }
};

  const goToModule = (moduleNumber: number) => {
    setActiveModule(moduleNumber);
    setSelectedLesson(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fungsi untuk navigasi ke halaman sertifikat
  const handleViewCertificate = () => {
    router.push('/peserta/sertifikat'); // Pastikan path ini sesuai dengan folder halaman sertifikat kamu
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-2xl text-[#1e4e8c]">SYNCING...</div>;

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20 ">
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight ">EXERCISE</h1>
          <p className="text-slate-800 font-bold text-lg uppercase ">
            Level 1 / {
              activeModule === 1 ? "Modul 1: Dasar Literasi" : 
              activeModule === 2 ? "Modul 2: Analisis Kritis" : 
              "Modul 3: Penulisan Kreatif"
            }
          </p>
        </header>

        <ExProgressBar progress={progress} />

        <AnimatePresence>
          {selectedLesson && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto bg-white rounded-[2rem] border-2 border-[#1e4e8c] shadow-xl overflow-hidden mb-10"
            >
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black bg-[#1e4e8c] text-white px-2 py-1 rounded-md uppercase tracking-tighter">
                  {selectedLesson.type}
                </span>
                <button 
                  onClick={() => setSelectedLesson(null)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-black text-slate-900 mb-4 uppercase italic leading-tight">
                  {selectedLesson.title}
                </h2>
                
                <div className="aspect-video max-h-[350px] w-full bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <p className="font-bold text-xs uppercase tracking-[0.3em] opacity-40 italic animate-pulse z-10">
                    Playing {selectedLesson.type} Content...
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-slate-400 font-medium italic">
                    Pastikan Anda memahami materi sebelum melanjutkan.
                  </p>
                  <button 
                    onClick={handleCompleteLesson} 
                    className="bg-[#c31a26] text-white px-6 py-3 rounded-xl font-black text-sm shadow-md hover:shadow-red-200 hover:-translate-y-0.5 active:scale-95 transition-all uppercase flex items-center gap-2"
                  >
                    SELESAI <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-[#f8fafc] rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800 uppercase ">Daftar Materi</h2>
            <button 
                onClick={handleViewCertificate} // Tambahkan onClick di sini
                disabled={progress < 100}
                className={`${progress < 100 ? 'bg-slate-300' : 'bg-[#1e4e8c]'} text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg transition-colors`}
            >
              Lihat Sertifikat
            </button>
          </div>

          {activeModule === 1 ? (
            /* ================= ZIG-ZAG MODUL 1 ================= */
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                <div onClick={() => handleLessonClick(1, "Membaca Sehat 1", "book", 0)}>
                  <ExModuleItem title="Membaca Sehat 1" type="book" active={progress >= 0 && progress < 9} />
                </div>
                <div onClick={() => handleLessonClick(3, "Membaca Sehat 2", "book", 18)}>
                  <ExModuleItem title="Membaca Sehat 2" type="book" locked={progress < 18} active={progress >= 18 && progress < 27} />
                </div>
                <div onClick={() => handleLessonClick(5, "Membaca Sehat 3", "book", 36)}>
                  <ExModuleItem title="Membaca Sehat 3" type="book" locked={progress < 36} active={progress >= 36 && progress < 45} />
                </div>
                <div onClick={() => handleLessonClick(7, "Membaca Sehat 4", "book", 54)}>
                  <ExModuleItem title="Membaca Sehat 4" type="book" locked={progress < 54} active={progress >= 54 && progress < 63} />
                </div>
                <div onClick={() => handleLessonClick(9, "Membaca Sehat 5", "book", 72)}>
                  <ExModuleItem title="Membaca Sehat 5" type="book" locked={progress < 72} active={progress >= 72 && progress < 81} />
                </div>
                <div onClick={() => handleLessonClick(11, "Evaluasi Membaca", "book", 90)}>
                  <ExModuleItem title="Evaluasi Membaca" type="book" locked={progress < 90} active={progress >= 90} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div onClick={() => handleLessonClick(2, "Menulis Sehat 1", "video", 9)}>
                  <ExModuleItem title="Menulis Sehat 1" type="video" locked={progress < 9} active={progress >= 9 && progress < 18} />
                </div>
                <div onClick={() => handleLessonClick(4, "Menulis Sehat 2", "video", 27)}>
                  <ExModuleItem title="Menulis Sehat 2" type="video" locked={progress < 27} active={progress >= 27 && progress < 36} />
                </div>
                <div onClick={() => handleLessonClick(6, "Menulis Sehat 3", "video", 45)}>
                  <ExModuleItem title="Menulis Sehat 3" type="video" locked={progress < 45} active={progress >= 45 && progress < 54} />
                </div>
                <div onClick={() => handleLessonClick(8, "Menulis Sehat 4", "video", 63)}>
                  <ExModuleItem title="Menulis Sehat 4" type="video" locked={progress < 63} active={progress >= 63 && progress < 72} />
                </div>
                <div onClick={() => handleLessonClick(10, "Menulis Sehat 5", "video", 81)}>
                  <ExModuleItem title="Menulis Sehat 5" type="video" locked={progress < 81} active={progress >= 81 && progress < 90} />
                </div>
              </div>

              <div className="flex justify-end mt-10">
                {progress >= 100 && (
                  <button onClick={() => goToModule(2)} className="text-[#1e4e8c] font-black hover:text-blue-800 transition-all text-xs uppercase italic tracking-tighter">
                    Lanjut ke Modul 2 →
                  </button>
                )}
              </div>
            </>
          ) : activeModule === 2 ? (
            /* ================= ZIG-ZAG MODUL 2 ================= */
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                <div onClick={() => handleLessonClick(12, "Analisis Kritis 1", "book", 0)}>
                  <ExModuleItem title="Analisis Kritis 1" type="book" active={progress >= 0 && progress < 9} />
                </div>
                <div onClick={() => handleLessonClick(14, "Analisis Kritis 2", "book", 18)}>
                  <ExModuleItem title="Analisis Kritis 2" type="book" locked={progress < 18} active={progress >= 18 && progress < 27} />
                </div>
                <div onClick={() => handleLessonClick(16, "Analisis Kritis 3", "book", 36)}>
                  <ExModuleItem title="Analisis Kritis 3" type="book" locked={progress < 36} active={progress >= 36 && progress < 45} />
                </div>
                <div onClick={() => handleLessonClick(18, "Analisis Kritis 4", "book", 54)}>
                  <ExModuleItem title="Analisis Kritis 4" type="book" locked={progress < 54} active={progress >= 54 && progress < 63} />
                </div>
                <div onClick={() => handleLessonClick(20, "Analisis Kritis 5", "book", 72)}>
                  <ExModuleItem title="Analisis Kritis 5" type="book" locked={progress < 72} active={progress >= 72 && progress < 81} />
                </div>
                <div onClick={() => handleLessonClick(22, "Evaluasi Modul 2", "book", 90)}>
                  <ExModuleItem title="Evaluasi Modul 2" type="book" locked={progress < 90} active={progress >= 90} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div onClick={() => handleLessonClick(13, "Struktur Opini 1", "video", 9)}>
                  <ExModuleItem title="Struktur Opini 1" type="video" locked={progress < 9} active={progress >= 9 && progress < 18} />
                </div>
                <div onClick={() => handleLessonClick(15, "Struktur Opini 2", "video", 27)}>
                  <ExModuleItem title="Struktur Opini 2" type="video" locked={progress < 27} active={progress >= 27 && progress < 36} />
                </div>
                <div onClick={() => handleLessonClick(17, "Struktur Opini 3", "video", 45)}>
                  <ExModuleItem title="Struktur Opini 3" type="video" locked={progress < 45} active={progress >= 45 && progress < 54} />
                </div>
                <div onClick={() => handleLessonClick(19, "Struktur Opini 4", "video", 63)}>
                  <ExModuleItem title="Struktur Opini 4" type="video" locked={progress < 63} active={progress >= 63 && progress < 72} />
                </div>
                <div onClick={() => handleLessonClick(21, "Struktur Opini 5", "video", 81)}>
                  <ExModuleItem title="Struktur Opini 5" type="video" locked={progress < 81} active={progress >= 81 && progress < 90} />
                </div>
              </div>

              <div className="flex justify-between mt-10">
                <button onClick={() => goToModule(1)} className="text-slate-400 font-bold hover:text-slate-600 transition-all text-xs uppercase italic">
                  ← KEMBALI KE MODUL 1
                </button>
                {progress >= 100 && (
                  <button onClick={() => goToModule(3)} className="text-[#1e4e8c] font-black hover:text-blue-800 transition-all text-xs uppercase italic tracking-tighter">
                    Lanjut ke Modul 3 →
                  </button>
                )}
              </div>
            </>
          ) : (
            /* ================= ZIG-ZAG MODUL 3 ================= */
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                <div onClick={() => handleLessonClick(23, "Kreatifitas 1", "book", 0)}>
                  <ExModuleItem title="Kreatifitas 1" type="book" active={progress >= 0 && progress < 9} />
                </div>
                <div onClick={() => handleLessonClick(25, "Kreatifitas 2", "book", 18)}>
                  <ExModuleItem title="Kreatifitas 2" type="book" locked={progress < 18} active={progress >= 18 && progress < 27} />
                </div>
                <div onClick={() => handleLessonClick(27, "Kreatifitas 3", "book", 36)}>
                  <ExModuleItem title="Kreatifitas 3" type="book" locked={progress < 36} active={progress >= 36 && progress < 45} />
                </div>
                <div onClick={() => handleLessonClick(29, "Kreatifitas 4", "book", 54)}>
                  <ExModuleItem title="Kreatifitas 4" type="book" locked={progress < 54} active={progress >= 54 && progress < 63} />
                </div>
                <div onClick={() => handleLessonClick(31, "Kreatifitas 5", "book", 72)}>
                  <ExModuleItem title="Kreatifitas 5" type="book" locked={progress < 72} active={progress >= 72 && progress < 81} />
                </div>
                <div onClick={() => handleLessonClick(33, "Evaluasi Akhir", "book", 90)}>
                  <ExModuleItem title="Evaluasi Akhir" type="book" locked={progress < 90} active={progress >= 90} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div onClick={() => handleLessonClick(24, "Teknik Menulis 1", "video", 9)}>
                  <ExModuleItem title="Teknik Menulis 1" type="video" locked={progress < 9} active={progress >= 9 && progress < 18} />
                </div>
                <div onClick={() => handleLessonClick(26, "Teknik Menulis 2", "video", 27)}>
                  <ExModuleItem title="Teknik Menulis 2" type="video" locked={progress < 27} active={progress >= 27 && progress < 36} />
                </div>
                <div onClick={() => handleLessonClick(28, "Teknik Menulis 3", "video", 45)}>
                  <ExModuleItem title="Teknik Menulis 3" type="video" locked={progress < 45} active={progress >= 45 && progress < 54} />
                </div>
                <div onClick={() => handleLessonClick(30, "Teknik Menulis 4", "video", 63)}>
                  <ExModuleItem title="Teknik Menulis 4" type="video" locked={progress < 63} active={progress >= 63 && progress < 72} />
                </div>
                <div onClick={() => handleLessonClick(32, "Teknik Menulis 5", "video", 81)}>
                  <ExModuleItem title="Teknik Menulis 5" type="video" locked={progress < 81} active={progress >= 81 && progress < 90} />
                </div>
              </div>

              <div className="flex justify-start mt-10">
                <button onClick={() => goToModule(2)} className="text-slate-400 font-bold hover:text-slate-600 transition-all text-xs uppercase italic">
                  ← KEMBALI KE MODUL 2
                </button>
              </div>
            </>
          )}
        </div>

        <ExFooterTools />
      </div>
    </Sidebar>
  );
}