"use client";

import { motion } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

interface StepPenulisanProps {
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function StepPenulisan({
  isZenMode,
  setIsZenMode,
  formData,
  handleInputChange,
}: StepPenulisanProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Safe");
  const [selectedFontSize, setSelectedFontSize] = useState("12pt");
  const [pages, setPages] = useState<string[]>([""]);

  

  // --- 1. LOGIKA FETCH DATA ---
  useEffect(() => {
    const fetchInitialContent = async () => {
      const token = localStorage.getItem("token");
      if (!token || !formData.bookId) return;

      try {
        const idParam = formData.currentChapterId
          ? `chapterId=${formData.currentChapterId}`
          : `bookId=${formData.bookId}`;

        const response = await fetch(`http://localhost:4000/api/books/get-chapter?${idParam}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        const result = await response.json();

        if (response.ok && result.data) {
          if (editorRef.current) {
            editorRef.current.innerHTML = result.data.content || "";
            updateWordCount();
            if (result.data.id && !formData.currentChapterId) {
              handleInputChange("currentChapterId", result.data.id);
            }
          }
        }
      } catch (error) {
        console.error("Gagal memuat konten:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialContent();
  }, [formData.bookId]);

  const updateWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      const words = text.trim().split(/\s+/).filter((w) => w !== "").length;
      handleInputChange("currentWordCount", words);
    }
  };

  // --- 2. LOGIKA AUTO SAVE ---
  const autoSave = useCallback(async () => {
    if (!editorRef.current || isLoading) return;
    const currentBookId = formData.bookId;
    if (!currentBookId) return;

    const htmlContent = editorRef.current.innerHTML;
    if (htmlContent === "" || htmlContent === "<br>") return;

    setSaveStatus("Saving...");
    try {
      const token = localStorage.getItem("token");
      const payload = {
        bookId: currentBookId,
        chapterId: formData.currentChapterId || null,
        title: "Draf Utama",
        content: htmlContent,
        wordCount: formData.currentWordCount || 0,
        dailyTarget: parseInt(formData.targetKata) || 1000,
      };

      const response = await fetch("http://localhost:4000/api/books/save-chapter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.chapterId && data.chapterId !== formData.currentChapterId) {
          handleInputChange("currentChapterId", data.chapterId);
        }
        setSaveStatus("Saved");
        setTimeout(() => setSaveStatus("Safe"), 2000);
      } else {
        setSaveStatus("Error");
      }
    } catch (error) {
      setSaveStatus("Error");
    }
  }, [formData.bookId, formData.currentChapterId, formData.targetKata, formData.currentWordCount, handleInputChange, isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => autoSave(), 2000);
    return () => clearTimeout(timer);
  }, [formData.currentWordCount, autoSave]);

  // --- 3. FORMATTING TOOLS ---
  const applyStyle = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(command, false, value);
    updateWordCount();
  };

  const applyFontSize = (size: string) => {
    setSelectedFontSize(size);
    if (editorRef.current) editorRef.current.focus();
    document.execCommand('fontSize', false, "7"); 
    const fontSpans = editorRef.current?.querySelectorAll('font[size="7"]');
    fontSpans?.forEach(span => {
      (span as HTMLElement).removeAttribute('size');
      (span as HTMLElement).style.fontSize = size;
    });
    updateWordCount();
  };

  return (
    <div className={`space-y-8 transition-all duration-500 overflow-x-hidden ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-4 md:p-12 overflow-y-auto" : ""}`}>
      
      {/* 1. HEADER */}
      <div className={`${isZenMode ? "max-w-[1200px] mx-auto" : ""} flex justify-between items-center border-b-2 border-slate-100 pb-4`}>
        <h4 className="font-black uppercase tracking-tighter text-black italic text-lg">
          {isZenMode ? "📝 Zen Writing Mode" : "1. Editor Teks Utama"}
        </h4>
        <div className="flex gap-3">
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="text-[10px] font-black bg-black text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all uppercase shadow-xl active:scale-95"
          >
            {isZenMode ? "Keluar Mode Fokus" : "Mode Fokus 🧘‍♂️"}
          </button>
        </div>
      </div>

      <div className={`${isZenMode ? "max-w-[1200px] mx-auto" : "space-y-6"}`}>
        
        {/* 2. AREA EDITOR KERTAS */}
        <div className="border-2 border-slate-200 rounded-3xl overflow-hidden bg-slate-400 shadow-inner relative z-10">
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-black rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Menyiapkan Naskah...</p>
            </div>
          )}

          {/* TOOLBAR LENGKAP DENGAN HEADING */}
          <div className="w-full bg-slate-50 px-6 py-4 border-b-2 border-slate-100 flex flex-wrap items-center gap-4 sticky top-0 z-10 shadow-sm">
            
            {/* Bold, Italic, Underline */}
            <div className="flex bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-black font-black">
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("bold"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white font-serif text-lg border-r-2 border-slate-100 transition-all">B</button>
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("italic"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white font-serif italic text-lg border-r-2 border-slate-100 transition-all">I</button>
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("underline"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white font-serif underline text-lg transition-all">U</button>
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center bg-white rounded-xl border-2 border-slate-200 shadow-sm px-3 overflow-hidden">
              <span className="text-[8px] font-black uppercase text-slate-400 mr-2">Size</span>
              <select 
                value={selectedFontSize}
                onChange={(e) => applyFontSize(e.target.value)}
                className="bg-transparent text-[11px] font-black outline-none py-2 cursor-pointer text-black"
              >
                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36].map((size) => (
                  <option key={size} value={`${size}pt`}>{size} pt</option>
                ))}
              </select>
            </div>

            {/* Alignment Tools */}
            <div className="flex bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-black">
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyLeft"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyCenter"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="5" y1="18" x2="19" y2="18" /></svg>
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyRight"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="6" y1="18" x2="21" y2="18" /></svg>
              </button>
            </div>

            {/* HEADING BUTTONS (KEMBALI DITAMPILKAN) */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border-2 border-slate-200 shadow-sm text-black">
              {["H1", "H2", "H3"].map((h) => (
                <button 
                  key={h} 
                  onMouseDown={(e) => { e.preventDefault(); applyStyle("formatBlock", `<${h}>`); }} 
                  className="px-3 h-8 flex items-center justify-center hover:bg-black hover:text-white text-[10px] font-black border-r border-slate-100 last:border-0 transition-all rounded-md"
                >
                  {h}
                </button>
              ))}
              <button 
                onMouseDown={(e) => { e.preventDefault(); applyStyle("formatBlock", "<p>"); }} 
                className="px-3 h-8 flex items-center justify-center hover:bg-black hover:text-white text-[9px] font-black uppercase transition-all rounded-md ml-1"
              >
                Normal
              </button>
            </div>

            <div className="flex-1 min-w-[20px]" />

            {/* Save Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full shadow-lg">
              <span className={`w-2 h-2 rounded-full ${saveStatus === "Saving..." ? "bg-yellow-400 animate-spin" : saveStatus === "Error" ? "bg-red-500" : "bg-green-400 animate-pulse"}`} />
              <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">{saveStatus}</span>
            </div>
          </div>

          {/* AREA KERTAS A4 MULTI-HALAMAN */}
          <div className="w-full overflow-x-hidden overflow-y-auto p-4 md:p-12 custom-scrollbar bg-slate-400" style={{ height: isZenMode ? 'calc(100vh - 180px)' : '750px' }}>
            <div className="paper-zoom-wrapper">
                <div 
                  id="paper-penulisan"
                  ref={editorRef}
                  contentEditable={!isLoading}
                  suppressContentEditableWarning={true}
                  onInput={updateWordCount}
                  className="bg-white shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-[2.54cm] w-[210mm] outline-none text-black font-serif prose prose-slate max-w-none block a4-multi-page-shadow"
                  style={{ 
                      fontSize: '12pt', 
                      lineHeight: '1.6',
                      color: 'black', 
                      wordBreak: 'normal',
                      whiteSpace: 'pre-wrap',
                      textAlign: 'left',
                      minHeight: '297mm',
                  }}
                />
            </div>
          </div>
        </div>

        {/* 3. STATISTIK */}
        {!isZenMode && (
          <div className="bg-black p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl border-t-8 border-slate-800 gap-6 relative z-10">
            <div className="space-y-1 w-full md:w-auto">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Kata</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black italic">{formData.currentWordCount || 0}</span>
                <span className="text-sm font-bold text-slate-500 italic">/ {formData.targetKata}</span>
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Target Hari Ini</span>
                <span className="text-white bg-slate-800 px-2 py-0.5 rounded">
                  {Math.min(Math.round(((formData.currentWordCount || 0) / (parseInt(formData.targetKata) || 1)) * 100), 100)}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-[1px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((formData.currentWordCount || 0) / (parseInt(formData.targetKata) || 1)) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        body {
          overflow-x: hidden;
        }

        .paper-zoom-wrapper {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          min-height: 100%;
          padding-bottom: 50mm;
        }

        a4-multi-page-shadow {
  width: 210mm;
  min-height: 297mm;
  padding: 2.54cm 2.54cm 5cm 2.54cm; /* Tambah padding bawah (5cm) agar teks tidak mentok */
  background: white;
  
  /* Membuat visualisasi celah antar halaman */
  background-image: linear-gradient(
    to bottom,
    transparent 287mm,      /* Area putih kertas */
    #94a3b8 287mm,          /* Mulai warna abu-abu (celah) */
    #94a3b8 307mm,          /* Akhir warna abu-abu */
    transparent 307mm       /* Mulai halaman berikutnya */
  );
  background-size: 100% 307mm;
  position: relative;
  
  /* Menghindari teks terpotong tepat di garis celah */
  line-height: 1.6; 
}

/* TRICK UTAMA: 
   Agar teks otomatis "melompat" melewati celah, 
   kita beri margin-bottom yang sinkron dengan tinggi celah 
*/
.prose p, .prose h1, .prose h2, .prose h3 {
  position: relative;
  z-index: 2;
  /* Memastikan elemen tidak terhenti di tengah-tengah celah */
  break-inside: avoid; 
}

/* Menambahkan padding visual buatan di bawah editor */
.paper-zoom-wrapper {
  padding-bottom: 100px;
}
        .a4-multi-page-shadow::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Biarkan klik tembus ke teks */
  
  /* Membuat strip transparan yang memblokir seleksi di area abu-abu */
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 287mm,
    rgba(148, 163, 184, 0.1) 287mm,
    rgba(148, 163, 184, 0.1) 307mm
  );
  z-index: 5;
}

        @media (max-width: 1300px) { .a4-multi-page-shadow { transform: scale(0.9); } }
        @media (max-width: 1100px) { .a4-multi-page-shadow { transform: scale(0.8); } }
        @media (max-width: 950px) { .a4-multi-page-shadow { transform: scale(0.7); } }
        @media (max-width: 800px) { .a4-multi-page-shadow { transform: scale(0.6); } }
        @media (max-width: 650px) { .a4-multi-page-shadow { transform: scale(0.5); } }

        [contenteditable]:empty:before {
          content: "Mulailah menulis naskah Anda di sini...";
          color: #cbd5e1;
          font-style: italic;
          display: block;
        }

        .prose p {
          color: black !important;
          line-height: 1.6;
          margin-bottom: 1.5em;
          font-size: 12pt;
          text-align: justify;
        }
        
        .prose h1, .prose h2, .prose h3 {
          color: black !important;
          font-weight: 900;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #cbd5e1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}