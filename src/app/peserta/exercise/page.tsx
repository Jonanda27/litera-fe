"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { ExProgressBar } from "@/components/exercise/ExProgressBar";
import { ExModuleItem } from "@/components/exercise/ExModuleItem";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  API_BASE_URL,
  SOCKET_API_BASE_URL,
} from "../../../lib/constans/constans";
import { BookOpen, Award } from "lucide-react";

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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
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
      const vId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("youtu.be/")[1];
      setPreviewUrl(vId ? `https://www.youtube.com/embed/${vId}` : url);
    } else {
      const base = SOCKET_API_BASE_URL;
      const fullUrl = url.startsWith("http") ? url : url.startsWith("/") ? `${base}${url}` : `${base}/uploads/${url}`;
      setPreviewUrl(fullUrl);
    }
  };

  const handleLessonClick = async (id: number, title: string, type: string, required: number) => {
    if (progress < required) return;
    
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
          const historyList = result.data.userProgress; // Menggunakan alias userProgress dari backend
          if (historyList && historyList.length > 0) {
            const history = historyList[0];
            if (history.status_selesai && history.jawaban_user) {
              setUserAnswers(history.jawaban_user);
              let correct = 0;
              const soalArray = parsedSoal || [];
              soalArray.forEach((q: Question) => { if (history.jawaban_user[q.id] === q.correctAnswer) correct++; });
              setScoreData({ score: history.skor || 0, correct: correct, wrong: soalArray.length - correct });
              setIsSubmitted(true);
            }
          }
        } 
        if (result.data.url_konten) setupPreview(result.data.url_konten, type);
      }
    } catch (err) {
      console.error("Gagal memuat konten:", err);
    } finally {
      setIsFetchingContent(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!selectedLesson) return;
    let payload: any = { lessonId: selectedLesson.id, moduleId: activeModule };
    if (questions.length > 0 && !isSubmitted) {
      const totalAnswered = Object.keys(userAnswers).length;
      if (totalAnswered < questions.length) {
        alert("Harap jawab semua soal.");
        return;
      }
      let correct = 0;
      questions.forEach((q) => { if (userAnswers[q.id] === q.correctAnswer) correct++; });
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
        setProgress(data.newProgress);
        if (questions.length === 0 || isSubmitted) {
          setSelectedLesson(null);
          setPreviewUrl(null);
          setQuestions([]);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } catch (err) {
      alert("Koneksi gagal.");
    }
  };

  const goToModule = (moduleNumber: number) => {
    setActiveModule(moduleNumber);
    setSelectedLesson(null);
    setPreviewUrl(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

const handleNextQuestion = () => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1); };
  const handleBackQuestion = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1); };

  const handleViewCertificate = () => router.push("/peserta/sertifikat");

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-xl md:text-2xl text-[#c31a26] bg-white">SYNCING...</div>;

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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-5xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden mb-12">
              <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isSubmitted ? 'bg-emerald-500' : 'bg-[#c31a26] animate-pulse'}`}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isSubmitted ? 'Evaluation Result' : `Learning: ${selectedLesson.type}`}</span>
                </div>
                <button onClick={() => { setSelectedLesson(null); setPreviewUrl(null); setQuestions([]); }} className="text-slate-400 hover:text-[#c31a26] transition-all p-2 hover:rotate-90">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 md:p-10">
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-8 uppercase  tracking-tighter leading-none">{selectedLesson.title}</h2>
                <div className={`w-full bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-white mb-10 shadow-inner relative overflow-hidden border-8 border-slate-50 ${questions.length > 0 ? 'min-h-[500px] p-6 md:p-12 block bg-gradient-to-br from-slate-900 via-slate-950 to-black' : 'aspect-video'}`}>
                  {isFetchingContent ? (
                    <div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-[#c31a26] border-t-transparent rounded-full animate-spin"></div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c31a26]">Syncing Content...</p></div>
                  ) : questions.length > 0 ? (
                    isSubmitted && !showReview ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-auto text-center py-10 space-y-8">
                            <div className="relative inline-block">
                                <svg className="w-48 h-48 transform -rotate-90"><circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" /><circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={534} strokeDashoffset={534 - (534 * scoreData.score) / 100} className="text-emerald-500 transition-all duration-1000" /></svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-6xl font-black ">{scoreData.score}</span><span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Summary Score</span></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem]"><p className="text-3xl font-black text-emerald-500">{scoreData.correct}</p><p className="text-[10px] uppercase font-bold text-emerald-600/50">Correct</p></div>
                                <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-[2rem]"><p className="text-3xl font-black text-rose-500">{scoreData.wrong}</p><p className="text-[10px] uppercase font-bold text-rose-600/50">Incorrect</p></div>
                            </div>
                            <button onClick={() => { setShowReview(true); setCurrentQuestionIndex(0); }} className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10">Review Answers</button>
                        </motion.div>
                    ) : (
                        <div className="w-full max-w-3xl mx-auto flex flex-col h-full justify-between">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="flex items-start gap-6">
                                        <span className="flex-shrink-0 w-14 h-14 rounded-3xl bg-[#c31a26] flex items-center justify-center font-black text-2xl text-white  shadow-lg shadow-red-900/40">{currentQuestionIndex + 1}</span>
                                        <div className="space-y-2"><p className="text-[10px] uppercase font-black tracking-[0.3em] text-red-500">{showReview ? 'Analytic Mode' : `Task ${currentQuestionIndex + 1} of ${questions.length}`}</p><p className="font-bold text-xl md:text-3xl text-white leading-tight tracking-tight">{questions[currentQuestionIndex].text}</p></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {questions[currentQuestionIndex].options.map((opt) => {
                                            const isSelected = userAnswers[questions[currentQuestionIndex].id] === opt.id;
                                            const isCorrect = questions[currentQuestionIndex].correctAnswer === opt.id;
                                            let btnClass = "bg-white/5 border-white/5 text-slate-400";
                                            if (!showReview) { if (isSelected) btnClass = "bg-red-600 border-red-400 text-white shadow-xl scale-[1.02]"; } 
                                            else { if (isCorrect) btnClass = "bg-emerald-600 border-emerald-400 text-white shadow-lg"; else if (isSelected) btnClass = "bg-red-600 border-red-400 text-white"; }
                                            return (
                                                <motion.button key={opt.id} disabled={isSubmitted && !showReview} whileTap={{ scale: isSubmitted ? 1 : 0.98 }} onClick={() => !showReview && setUserAnswers({ ...userAnswers, [questions[currentQuestionIndex].id]: opt.id })} className={`group relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300 flex items-center gap-5 ${btnClass}`}>
                                                  <div className={`flex-shrink-0 w-10 h-10 rounded-2xl border-2 flex items-center justify-center text-xs font-black transition-colors ${isSelected || (showReview && isCorrect) ? 'bg-white text-slate-900' : 'bg-slate-900 border-white/10 text-white'}`}>{opt.id}</div>
                                                  <span className="font-bold text-sm md:text-lg flex-grow tracking-tight">{opt.text}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                            <div className="flex justify-between items-center mt-12 pt-10 border-t border-white/5">
                                <button onClick={handleBackQuestion} disabled={currentQuestionIndex === 0} className={`font-black uppercase text-[10px] tracking-widest ${currentQuestionIndex === 0 ? 'opacity-10' : 'text-slate-500 hover:text-white'}`}>Back</button>
                                <div className="flex gap-2">{questions.map((_, i) => (<div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentQuestionIndex ? 'w-10 bg-red-500' : 'w-2 bg-slate-800'}`}></div>))}</div>
                                {currentQuestionIndex === questions.length - 1 ? (showReview ? (<button onClick={() => setShowReview(false)} className="font-black uppercase text-[10px] tracking-widest text-emerald-500">View Summary</button>) : (<span className="text-[10px] font-black text-red-500 uppercase ">Finish</span>)) : (<button onClick={handleNextQuestion} className="font-black uppercase text-[10px] tracking-widest text-red-500">Next</button>)}
                            </div>
                        </div>
                    )
                  ) : previewUrl ? (
                    <iframe src={previewUrl} className="w-full h-full border-0" allowFullScreen></iframe>
                  ) : (<div className="flex flex-col items-center gap-4 opacity-20"><BookOpen size={64} /><p className="font-black text-xs uppercase tracking-[0.4em] ">No Content Available</p></div>)}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50 rounded-[3rem] p-8 border border-slate-100">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{isSubmitted ? "Status: Completed" : "Progress"}</p>
                    <p className="text-sm text-slate-700 font-bold ">{questions.length > 0 ? (isSubmitted ? `Final Result: ${scoreData.score}/100` : `Answered ${Object.keys(userAnswers).length} of ${questions.length} tasks`) : "Pahami materi di atas untuk melanjutkan."}</p>
                  </div>
                  <button onClick={handleCompleteLesson} className="w-full sm:w-auto bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-xs shadow-2xl hover:bg-[#c31a26] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    {questions.length > 0 && !isSubmitted ? "Submit Task" : "Complete Lesson"} <span className="text-xl">→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#c31a26] via-blue-500 to-emerald-500"></div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase  tracking-tighter">Curriculum Path</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Selesaikan materi secara berurutan untuk membuka modul berikutnya</p>
            </div>
            {/* CLAIM CERTIFICATE BUTTON - RED CONSISTENT */}
            <button 
                onClick={handleViewCertificate} 
                disabled={progress < 100} 
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                    progress < 100 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-[#c31a26] text-white shadow-red-200 hover:-translate-y-1 hover:bg-red-700 active:scale-95"
                }`}
            >
                <Award size={16} />
                Claim Certificate
            </button>
          </div>

          {activeModule === 1 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:hidden gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((id) => {
                   const req = (id - 1) * 9;
                   return (
                    <div key={id} onClick={() => handleLessonClick(id, id === 11 ? "Evaluasi Membaca" : (id % 2 !== 0 ? `Membaca Sehat ${Math.ceil(id/2)}` : `Menulis Sehat ${id/2}`), id === 11 ? "evaluasi" : (id % 2 !== 0 ? "book" : "video"), req)}>
                      <ExModuleItem 
                        title={id === 11 ? "Evaluasi Membaca" : (id % 2 !== 0 ? `Membaca Sehat ${Math.ceil(id/2)}` : `Menulis Sehat ${id/2}`)} 
                        type={id % 2 !== 0 ? "book" : "video"} 
                        locked={progress < req} 
                        active={selectedLesson?.id === id}
                        completed={progress >= id * 9 || (id === 11 && progress >= 100)}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="hidden lg:block space-y-4">
                <div className="grid grid-cols-6 gap-4">
                  {[1, 3, 5, 7, 9, 11].map((id) => {
                     const req = (id - 1) * 9;
                     return (
                      <div key={id} onClick={() => handleLessonClick(id, id === 11 ? "Evaluasi Membaca" : `Membaca Sehat ${Math.ceil(id/2)}`, id === 11 ? "evaluasi" : "book", req)}>
                        <ExModuleItem title={id === 11 ? "Evaluasi Membaca" : `Membaca Sehat ${Math.ceil(id/2)}`} type="book" locked={progress < req} active={selectedLesson?.id === id} completed={progress >= id * 9 || (id === 11 && progress >= 100)} />
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-5 gap-4 pr-20">
                  {[2, 4, 6, 8, 10].map((id) => {
                     const req = (id - 1) * 9;
                     return (
                      <div key={id} onClick={() => handleLessonClick(id, `Menulis Sehat ${id/2}`, "video", req)}>
                        <ExModuleItem title={`Menulis Sehat ${id/2}`} type="video" locked={progress < req} active={selectedLesson?.id === id} completed={progress >= id * 9} />
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-end mt-12">{progress >= 100 && <button onClick={() => goToModule(2)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase  text-[10px] tracking-widest hover:bg-[#c31a26] transition-colors shadow-lg">Next Module: Analisis Kritis →</button>}</div>
            </>
          ) : activeModule === 2 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:hidden gap-4">
                {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((id) => {
                   const req = (id - 12) * 9;
                   return (
                    <div key={id} onClick={() => handleLessonClick(id, id === 22 ? "Evaluasi Modul 2" : (id % 2 === 0 ? `Analisis Kritis ${Math.floor((id-10)/2)}` : `Struktur Opini ${Math.floor((id-11)/2)}`), id === 22 ? "evaluasi" : (id % 2 === 0 ? "book" : "video"), req)}>
                      <ExModuleItem title={id === 22 ? "Evaluasi Modul 2" : (id % 2 === 0 ? `Analisis Kritis ${Math.floor((id-10)/2)}` : `Struktur Opini ${Math.floor((id-11)/2)}`)} type={id % 2 === 0 ? "book" : "video"} locked={progress < req} active={selectedLesson?.id === id} completed={progress >= (id - 11) * 9 || (id === 22 && progress >= 100)} />
                    </div>
                  )
                })}
              </div>
              <div className="hidden lg:block space-y-4">
                <div className="grid grid-cols-6 gap-4">
                  {[12, 14, 16, 18, 20, 22].map((id) => {
                    const req = (id - 12) * 9;
                    return (
                      <div key={id} onClick={() => handleLessonClick(id, id === 22 ? "Evaluasi Modul 2" : `Analisis Kritis ${Math.floor((id-10)/2)}`, id === 22 ? "evaluasi" : "book", req)}>
                        <ExModuleItem title={id === 22 ? "Evaluasi Modul 2" : `Analisis Kritis ${Math.floor((id-10)/2)}`} type="book" locked={progress < req} active={selectedLesson?.id === id} completed={progress >= (id - 11) * 9 || (id === 22 && progress >= 100)} />
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-5 gap-4 pr-20">
                  {[13, 15, 17, 19, 21].map((id) => {
                    const req = (id - 12) * 9;
                    return (
                      <div key={id} onClick={() => handleLessonClick(id, `Struktur Opini ${Math.floor((id-11)/2)}`, "video", req)}>
                        <ExModuleItem title={`Struktur Opini ${Math.floor((id-11)/2)}`} type="video" locked={progress < req} active={selectedLesson?.id === id} completed={progress >= (id - 11) * 9} />
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-between mt-12"><button onClick={() => goToModule(1)} className="text-slate-400 font-black uppercase  text-[10px] tracking-widest hover:text-slate-900 transition-colors">← Back to Module 1</button>{progress >= 100 && <button onClick={() => goToModule(3)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase  text-[10px] tracking-widest hover:bg-[#c31a26] transition-colors shadow-lg">Next Module: Creative Writing →</button>}</div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:hidden gap-4">
                {[23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33].map((id) => {
                  const req = (id - 23) * 9;
                  return (
                    <div key={id} onClick={() => handleLessonClick(id, id === 33 ? "Evaluasi Akhir" : (id % 2 !== 0 ? `Kreatifitas ${Math.floor((id-21)/2)}` : `Teknik Menulis ${Math.floor((id-22)/2)}`), id === 33 ? "evaluasi" : (id % 2 !== 0 ? "book" : "video"), req)}>
                      <ExModuleItem title={id === 33 ? "Evaluasi Akhir" : (id % 2 !== 0 ? `Kreatifitas ${Math.floor((id-21)/2)}` : `Teknik Menulis ${Math.floor((id-22)/2)}`)} type={id % 2 !== 0 ? "book" : "video"} locked={progress < req} active={selectedLesson?.id === id} completed={progress >= (id - 22) * 9 || (id === 33 && progress >= 100)} />
                    </div>
                  )
                })}
              </div>
              <div className="hidden lg:block space-y-4">
                <div className="grid grid-cols-6 gap-4">
                  {[23, 25, 27, 29, 31, 33].map((id) => {
                    const req = (id - 23) * 9;
                    return (
                      <div key={id} onClick={() => handleLessonClick(id, id === 33 ? "Evaluasi Akhir" : `Kreatifitas ${Math.floor((id-21)/2)}`, id === 33 ? "evaluasi" : "book", req)}>
                        <ExModuleItem title={id === 33 ? "Evaluasi Akhir" : `Kreatifitas ${Math.floor((id-21)/2)}`} type="book" locked={progress < req} active={selectedLesson?.id === id} completed={progress >= (id - 22) * 9 || (id === 33 && progress >= 100)} />
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-5 gap-4 pr-20">
                  {[24, 26, 28, 30, 32].map((id) => {
                    const req = (id - 23) * 9;
                    return (
                      <div key={id} onClick={() => handleLessonClick(id, `Teknik Menulis ${Math.floor((id-22)/2)}`, "video", req)}>
                        <ExModuleItem title={`Teknik Menulis ${Math.floor((id-22)/2)}`} type="video" locked={progress < req} active={selectedLesson?.id === id} completed={progress >= (id - 22) * 9} />
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-start mt-12"><button onClick={() => goToModule(2)} className="text-slate-400 font-black uppercase  text-[10px] tracking-widest hover:text-slate-900 transition-colors">← Back to Module 2</button></div>
            </>
          )}
        </div>
      </div>
    </Sidebar>
  );
}