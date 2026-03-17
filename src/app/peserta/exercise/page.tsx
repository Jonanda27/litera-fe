"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { ExProgressBar } from "@/components/exercise/ExProgressBar";
import { ExModuleItem } from "@/components/exercise/ExModuleItem";
import { ExFooterTools } from "@/components/exercise/ExFooterTools";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  API_BASE_URL,
  SOCKET_API_BASE_URL,
} from "../../../lib/constans/constans";

// Interface untuk struktur soal evaluasi
interface Question {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
}

export default function ExercisePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [activeModule, setActiveModule] = useState(1);
  const [selectedLesson, setSelectedLesson] = useState<{
    id: number;
    title: string;
    type: string;
    required: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // State tambahan untuk Konten & Evaluasi
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State Navigasi & Hasil
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, correct: 0, wrong: 0 });

  useEffect(() => {
    fetchUserData();
  }, [activeModule]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.moduleProgress) {
        // Mengambil progres berdasarkan activeModule (1, 2, atau 3)
        const currentModProgress = data.moduleProgress[activeModule] || 0;
        setProgress(currentModProgress);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const setupPreview = (url: string, type: string) => {
    if (!url) return setPreviewUrl(null);
    if (type === "video") {
      const vId = url.includes("v=")
        ? url.split("v=")[1].split("&")[0]
        : url.split("youtu.be/")[1];
      setPreviewUrl(vId ? `https://www.youtube.com/embed/${vId}` : url);
    } else {
      const base = SOCKET_API_BASE_URL;
      const fullUrl = url.startsWith("http")
        ? url
        : url.startsWith("/")
          ? `${base}${url}`
          : `${base}/uploads/${url}`;
      setPreviewUrl(fullUrl);
    }
  };

  const handleLessonClick = async (
    id: number,
    title: string,
    type: string,
    required: number,
  ) => {
    if (progress < required) {
      alert(`Materi Terkunci! Selesaikan urutan sebelumnya.`);
      return;
    }

    setSelectedLesson({ id, title, type, required });
    setPreviewUrl(null);
    setQuestions([]);
    setUserAnswers({});
    setIsSubmitted(false);
    setShowReview(false);
    setCurrentQuestionIndex(0);
    setScoreData({ score: 0, correct: 0, wrong: 0 });
    setIsFetchingContent(true);
    window.scrollTo({ top: 200, behavior: "smooth" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/exercise/lesson-detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.success && result.data) {
        const rawSoal = result.data.soal_evaluasi;
        const parsedSoal = typeof rawSoal === "string" ? JSON.parse(rawSoal) : rawSoal;
        
        if (type === "evaluasi" || parsedSoal) {
          setQuestions(parsedSoal || []);
          
          // Deteksi riwayat dari UserProgresses (Sesuai payload database)
          const historyList = result.data.UserProgresses;
          if (historyList && historyList.length > 0) {
            const history = historyList[0];
            if (history.status_selesai && history.jawaban_user) {
              setUserAnswers(history.jawaban_user);
              let correct = 0;
              const soalArray = parsedSoal || [];
              soalArray.forEach((q: Question) => {
                if (history.jawaban_user[q.id] === q.correctAnswer) correct++;
              });
              setScoreData({ 
                score: history.skor || 0, 
                correct: correct, 
                wrong: soalArray.length - correct 
              });
              setIsSubmitted(true);
            }
          }
        } 
        if (result.data.url_konten) {
          setupPreview(result.data.url_konten, type);
        }
      }
    } catch (err) {
      console.error("Gagal memuat konten:", err);
    } finally {
      setIsFetchingContent(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleBackQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleCompleteLesson = async () => {
    if (!selectedLesson) return;

    let payload: any = { lessonId: selectedLesson.id, moduleId: activeModule };

    if (questions.length > 0 && !isSubmitted) {
      const totalAnswered = Object.keys(userAnswers).length;
      if (totalAnswered < questions.length) {
        alert("Harap jawab semua soal sebelum menekan konfirmasi.");
        return;
      }

      let correct = 0;
      questions.forEach((q) => {
        if (userAnswers[q.id] === q.correctAnswer) correct++;
      });
      const score = Math.round((correct / questions.length) * 100);

      payload.jawaban_user = userAnswers;
      payload.skor = score;
      setScoreData({ score, correct, wrong: questions.length - correct });
      setIsSubmitted(true);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/auth/update-module-progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        if (questions.length === 0 || isSubmitted) {
          setProgress(data.newProgress);
          setSelectedLesson(null);
          setPreviewUrl(null);
          setQuestions([]);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          setProgress(data.newProgress);
        }
      }
    } catch (err) {
      alert("Koneksi gagal ke server.");
    }
  };

  const goToModule = (moduleNumber: number) => {
    setActiveModule(moduleNumber);
    setSelectedLesson(null);
    setPreviewUrl(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewCertificate = () => {
    router.push("/peserta/sertifikat");
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-xl md:text-2xl text-[#1e4e8c]">SYNCING...</div>;

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8 pb-10 md:pb-20 px-2 sm:px-0">
        <header className="pt-4 md:pt-0">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">EXERCISE</h1>
          <p className="text-slate-800 font-bold text-sm md:text-lg uppercase mt-1">
            Level 1 / {activeModule === 1 ? "Modul 1: Dasar Literasi" : activeModule === 2 ? "Modul 2: Analisis Kritis" : "Modul 3: Penulisan Kreatif"}
          </p>
        </header>

        <ExProgressBar progress={progress} />

        <AnimatePresence>
          {selectedLesson && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-[2rem] border-2 border-[#1e4e8c] shadow-2xl overflow-hidden mb-8 md:mb-10">
              <div className="bg-slate-50 px-4 md:px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className={`flex h-2 w-2 rounded-full animate-pulse ${isSubmitted ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-[10px] md:text-xs font-black text-[#1e4e8c] uppercase tracking-widest">{isSubmitted ? 'Hasil Evaluasi' : `Mode ${selectedLesson.type}`}</span>
                </div>
                <button onClick={() => { setSelectedLesson(null); setPreviewUrl(null); setQuestions([]); }} className="text-slate-400 hover:text-red-500 transition-all p-1 hover:rotate-90">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-4 md:p-8">
                <h2 className="text-xl md:text-3xl font-black text-slate-900 mb-6 md:mb-8 uppercase italic leading-tight tracking-tighter">{selectedLesson.title}</h2>
                
                <div className={`w-full bg-[#0f172a] rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-white mb-6 md:mb-10 shadow-2xl relative overflow-hidden border-4 border-slate-100 ${questions.length > 0 ? 'min-h-[450px] p-4 md:p-12 block bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'aspect-video'}`}>
                  {isFetchingContent ? (
                    <div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Menyiapkan Materi...</p></div>
                  ) : questions.length > 0 ? (
                    isSubmitted && !showReview ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-auto text-center py-10 space-y-8">
                            <div className="relative inline-block">
                                <svg className="w-40 h-40 transform -rotate-90"><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-700" /><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * scoreData.score) / 100} className="text-blue-500 transition-all duration-1000" /></svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-5xl font-black italic">{scoreData.score}</span><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Score</span></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl"><p className="text-2xl font-black text-green-500">{scoreData.correct}</p><p className="text-[10px] uppercase font-bold text-slate-400">Benar</p></div>
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl"><p className="text-2xl font-black text-red-500">{scoreData.wrong}</p><p className="text-[10px] uppercase font-bold text-slate-400">Salah</p></div>
                            </div>
                            <button onClick={() => { setShowReview(true); setCurrentQuestionIndex(0); }} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-slate-600">Review Jawaban</button>
                        </motion.div>
                    ) : (
                        <div className="w-full max-w-3xl mx-auto py-6 flex flex-col h-full justify-between">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl text-white italic shadow-lg">{currentQuestionIndex + 1}</span>
                                        <div className="space-y-1"><p className="text-[10px] uppercase font-black tracking-widest text-blue-400">{showReview ? 'Review Mode' : `Pertanyaan ${currentQuestionIndex + 1} / ${questions.length}`}</p><p className="font-bold text-lg md:text-2xl text-slate-100 leading-relaxed">{questions[currentQuestionIndex].text}</p></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {questions[currentQuestionIndex].options.map((opt) => {
                                            const isSelected = userAnswers[questions[currentQuestionIndex].id] === opt.id;
                                            const isCorrect = questions[currentQuestionIndex].correctAnswer === opt.id;
                                            let btnClass = "bg-slate-800/40 border-slate-700 text-slate-400";
                                            if (!showReview) { if (isSelected) btnClass = "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"; } 
                                            else { if (isCorrect) btnClass = "bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"; else if (isSelected) btnClass = "bg-red-600 border-red-400 text-white"; }
                                            return (
                                                <motion.button key={opt.id} disabled={isSubmitted && !showReview} whileTap={{ scale: isSubmitted ? 1 : 0.98 }} onClick={() => !showReview && setUserAnswers({ ...userAnswers, [questions[currentQuestionIndex].id]: opt.id })} className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${btnClass}`}><div className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-black ${isSelected || (showReview && isCorrect) ? 'bg-white text-slate-900' : 'bg-slate-900 border-slate-600'}`}>{opt.id}</div><span className="font-bold text-sm md:text-lg flex-grow">{opt.text}</span>
                                                    {showReview && (<div className="flex-shrink-0">{isCorrect && <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}{isSelected && !isCorrect && <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>}</div>)}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-800/50">
                                <button onClick={handleBackQuestion} disabled={currentQuestionIndex === 0} className={`flex items-center gap-2 font-black uppercase text-xs tracking-widest ${currentQuestionIndex === 0 ? 'opacity-20' : 'text-slate-400 hover:text-white'}`}>← Back</button>
                                <div className="flex gap-1">{questions.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentQuestionIndex ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`}></div>))}</div>
                                {currentQuestionIndex === questions.length - 1 ? (showReview ? (<button onClick={() => setShowReview(false)} className="font-black uppercase text-xs tracking-widest text-blue-500">Hasil Summary</button>) : (<span className="text-[10px] font-black text-blue-500 uppercase italic">Terakhir</span>)) : (<button onClick={handleNextQuestion} className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-blue-500">Next →</button>)}
                            </div>
                        </div>
                    )
                  ) : previewUrl ? (
                    <iframe src={previewUrl} className="w-full h-full border-0" allowFullScreen></iframe>
                  ) : (<div className="flex flex-col items-center gap-4 opacity-30"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg><p className="font-black text-sm uppercase tracking-widest italic">Belum Ada Konten</p></div>)}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 md:gap-0 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <div>
                    <p className="text-[11px] md:text-sm text-slate-600 font-bold uppercase tracking-tight">{isSubmitted ? "Evaluasi Selesai" : "Progress Pengerjaan"}</p>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium italic mt-1">{questions.length > 0 ? (isSubmitted ? `Skor Akhir: ${scoreData.score}/100` : `Menjawab ${Object.keys(userAnswers).length} dari ${questions.length} soal.`) : "Pahami materi dengan seksama sebelum menekan selesai."}</p>
                  </div>
                  <button onClick={handleCompleteLesson} className="w-full sm:w-auto justify-center bg-[#c31a26] text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-red-200 hover:-translate-y-1 active:scale-95 transition-all uppercase flex items-center gap-3 tracking-widest">
                    {questions.length > 0 && !isSubmitted ? "Konfirmasi Jawaban" : "Selesaikan Materi"} <span className="text-xl">→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-[#f8fafc] rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border border-slate-200 shadow-sm relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 sm:gap-0">
            <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase ">Daftar Materi</h2>
            <button onClick={handleViewCertificate} disabled={progress < 100} className={`w-full sm:w-auto text-center ${progress < 100 ? "bg-slate-300" : "bg-[#1e4e8c]"} text-white px-5 md:px-6 py-3 md:py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase shadow-lg transition-colors`}>Lihat Sertifikat</button>
          </div>

          {activeModule === 1 ? (
            /* ================= MODUL 1 ================= */
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-10 lg:hidden">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((id) => (
                  <div key={id} onClick={() => handleLessonClick(id, id === 11 ? "Evaluasi Membaca" : (id % 2 !== 0 ? `Membaca Sehat ${Math.ceil(id/2)}` : `Menulis Sehat ${id/2}`), id === 11 ? "evaluasi" : (id % 2 !== 0 ? "book" : "video"), (id - 1) * 9)}>
                    <ExModuleItem title={id === 11 ? "Evaluasi Membaca" : (id % 2 !== 0 ? `Membaca Sehat ${Math.ceil(id/2)}` : `Menulis Sehat ${id/2}`)} type={id % 2 !== 0 ? "book" : "video"} locked={progress < (id - 1) * 9} active={progress >= (id - 1) * 9 && progress < id * 9} />
                  </div>
                ))}
              </div>
              <div className="hidden lg:block">
                <div className="grid grid-cols-6 gap-4 mb-10">
                  {[1, 3, 5, 7, 9, 11].map((id) => (
                    <div key={id} onClick={() => handleLessonClick(id, id === 11 ? "Evaluasi Membaca" : `Membaca Sehat ${Math.ceil(id/2)}`, id === 11 ? "evaluasi" : "book", (id - 1) * 9)}>
                      <ExModuleItem title={id === 11 ? "Evaluasi Membaca" : `Membaca Sehat ${Math.ceil(id/2)}`} type="book" locked={progress < (id - 1) * 9} active={progress >= (id - 1) * 9 && progress < (id === 11 ? 101 : (id + 1) * 9)} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {[2, 4, 6, 8, 10].map((id) => (
                    <div key={id} onClick={() => handleLessonClick(id, `Menulis Sehat ${id/2}`, "video", (id - 1) * 9)}>
                      <ExModuleItem title={`Menulis Sehat ${id/2}`} type="video" locked={progress < (id - 1) * 9} active={progress >= (id - 1) * 9 && progress < id * 9} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-8">{progress >= 100 && <button onClick={() => goToModule(2)} className="text-[#1e4e8c] font-black uppercase italic text-xs">Lanjut ke Modul 2 →</button>}</div>
            </>
          ) : activeModule === 2 ? (
            /* ================= MODUL 2 ================= */
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-10 lg:hidden">
                {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((id) => (
                  <div key={id} onClick={() => handleLessonClick(id, id === 22 ? "Evaluasi Modul 2" : (id % 2 === 0 ? `Analisis Kritis ${Math.floor((id-10)/2)}` : `Struktur Opini ${Math.floor((id-11)/2)}`), id === 22 ? "evaluasi" : (id % 2 === 0 ? "book" : "video"), (id - 12) * 9)}>
                    <ExModuleItem title={id === 22 ? "Evaluasi Modul 2" : (id % 2 === 0 ? `Analisis Kritis ${Math.floor((id-10)/2)}` : `Struktur Opini ${Math.floor((id-11)/2)}`)} type={id % 2 === 0 ? "book" : "video"} locked={progress < (id - 12) * 9} active={progress >= (id - 12) * 9 && progress < (id - 11) * 9} />
                  </div>
                ))}
              </div>
              <div className="hidden lg:block">
                <div className="grid grid-cols-6 gap-4 mb-10">
                  {[12, 14, 16, 18, 20, 22].map((id) => (
                    <div key={id} onClick={() => handleLessonClick(id, id === 22 ? "Evaluasi Modul 2" : `Analisis Kritis ${Math.floor((id-10)/2)}`, id === 22 ? "evaluasi" : "book", (id - 12) * 9)}>
                      <ExModuleItem title={id === 22 ? "Evaluasi Modul 2" : `Analisis Kritis ${Math.floor((id-10)/2)}`} type="book" locked={progress < (id - 12) * 9} active={progress >= (id - 12) * 9 && progress < (id === 22 ? 101 : (id - 10) * 9)} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {[13, 15, 17, 19, 21].map((id) => (
                    <div key={id} onClick={() => handleLessonClick(id, `Struktur Opini ${Math.floor((id-11)/2)}`, "video", (id - 12) * 9)}>
                      <ExModuleItem title={`Struktur Opini ${Math.floor((id-11)/2)}`} type="video" locked={progress < (id - 12) * 9} active={progress >= (id - 12) * 9 && progress < (id - 11) * 9} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-8"><button onClick={() => goToModule(1)} className="text-slate-400 font-bold uppercase italic text-xs">← Kembali ke Modul 1</button>{progress >= 100 && <button onClick={() => goToModule(3)} className="text-[#1e4e8c] font-black uppercase italic text-xs">Lanjut ke Modul 3 →</button>}</div>
            </>
          ) : (
            /* ================= MODUL 3 ================= */
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-10 lg:hidden">
                {[23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33].map((id) => (
                  <div key={id} onClick={() => handleLessonClick(id, id === 33 ? "Evaluasi Akhir" : (id % 2 !== 0 ? `Kreatifitas ${Math.floor((id-21)/2)}` : `Teknik Menulis ${Math.floor((id-22)/2)}`), id === 33 ? "evaluasi" : (id % 2 !== 0 ? "book" : "video"), (id - 23) * 9)}>
                    <ExModuleItem title={id === 33 ? "Evaluasi Akhir" : (id % 2 !== 0 ? `Kreatifitas ${Math.floor((id-21)/2)}` : `Teknik Menulis ${Math.floor((id-22)/2)}`)} type={id % 2 !== 0 ? "book" : "video"} locked={progress < (id - 23) * 9} active={progress >= (id - 23) * 9 && progress < (id - 22) * 9} />
                  </div>
                ))}
              </div>
              <div className="hidden lg:block">
                <div className="grid grid-cols-6 gap-4 mb-10">
                  {[23, 25, 27, 29, 31, 33].map((id) => (
                    <div key={id} onClick={() => handleLessonClick(id, id === 33 ? "Evaluasi Akhir" : `Kreatifitas ${Math.floor((id-21)/2)}`, id === 33 ? "evaluasi" : "book", (id - 23) * 9)}>
                      <ExModuleItem title={id === 33 ? "Evaluasi Akhir" : `Kreatifitas ${Math.floor((id-21)/2)}`} type="book" locked={progress < (id - 23) * 9} active={progress >= (id - 23) * 9 && progress < (id === 33 ? 101 : (id - 21) * 9)} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {[24, 26, 28, 30, 32].map((id) => (
                    <div key={id} onClick={() => handleLessonClick(id, `Teknik Menulis ${Math.floor((id-22)/2)}`, "video", (id - 23) * 9)}>
                      <ExModuleItem title={`Teknik Menulis ${Math.floor((id-22)/2)}`} type="video" locked={progress < (id - 23) * 9} active={progress >= (id - 23) * 9 && progress < (id - 22) * 9} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-start mt-8"><button onClick={() => goToModule(2)} className="text-slate-400 font-bold uppercase italic text-xs">← Kembali ke Modul 2</button></div>
            </>
          )}
        </div>
        <ExFooterTools />
      </div>
    </Sidebar>
  );
}