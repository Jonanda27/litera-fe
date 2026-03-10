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
  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Safe");
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFontSize, setSelectedFontSize] = useState("12pt");
  
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. INITIAL LOAD (GET CHAPTER) ---
  useEffect(() => {
    const fetchInitialContent = async () => {
      const token = localStorage.getItem("token");
      if (!token || !formData.bookId) return;

      try {
        setIsLoading(true);
        // Menggunakan query params bookId sesuai controller backend Anda
        const response = await fetch(`http://localhost:4000/api/books/get-chapter?bookId=${formData.bookId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        const result = await response.json();

        // Jika data berupa array (per halaman) sesuai backend baru
        if (response.ok && Array.isArray(result.data) && result.data.length > 0) {
          // Set jumlah halaman berdasarkan data dari backend
          setPageCount(result.data.length);
          
          // Beri waktu sebentar agar elemen DOM ter-render sesuai pageCount baru
          setTimeout(() => {
            result.data.forEach((item: any, i: number) => {
              if (editorRefs.current[i]) {
                editorRefs.current[i]!.innerHTML = item.content || "";
              }
            });
            updateStats();
          }, 300);
        } else {
          // Jika belum ada draf, mulai dengan 1 halaman kosong
          setPageCount(1);
        }
      } catch (error) {
        console.error("Gagal memuat naskah:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialContent();
  }, [formData.bookId]);

  // --- 2. STATS & AUTO-SAVE (SAVE CHAPTER) ---
  const updateStats = () => {
    let totalText = "";
    editorRefs.current.forEach(ref => {
      if (ref) totalText += ref.innerText + " ";
    });
    const words = totalText.trim().split(/\s+/).filter((w) => w !== "").length;
    handleInputChange("currentWordCount", words);
    triggerAutoSave();
  };

  const triggerAutoSave = () => {
    setSaveStatus("Typing...");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      performSave();
    }, 2000);
  };

  const performSave = async () => {
    if (isLoading || !formData.bookId) return;

    // Mapping konten dari refs ke dalam array objek 'pages' sesuai backend
    const pagesPayload = editorRefs.current
      .slice(0, pageCount)
      .map((ref, index) => ({
        page: index + 1,
        content: ref ? ref.innerHTML : ""
      }));
    
    setSaveStatus("Saving...");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/books/save-chapter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          bookId: formData.bookId,
          title: "Draf Utama",
          pages: pagesPayload, // Kirim array per halaman
          dailyTarget: parseInt(formData.targetKata) || 1000,
        }),
      });

      if (response.ok) {
        setSaveStatus("Saved");
        setTimeout(() => setSaveStatus("Safe"), 2000);
      } else {
        setSaveStatus("Error");
      }
    } catch (error) {
      setSaveStatus("Error");
      console.error("Save Error:", error);
    }
  };

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  // --- 3. FORMATTING TOOLS ---
  const applyStyle = (command: string, value: any = undefined) => {
    document.execCommand(command, false, value);
    updateStats();
  };

  const applyFontSize = (size: string) => {
    setSelectedFontSize(size);
    document.execCommand('fontSize', false, "7"); 
    editorRefs.current.forEach(ref => {
        const fontSpans = ref?.querySelectorAll('font[size="7"]');
        fontSpans?.forEach(span => {
            (span as HTMLElement).removeAttribute('size');
            (span as HTMLElement).style.fontSize = size;
        });
    });
    updateStats();
  };

  // --- 4. NAVIGATION & OVERFLOW ---
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setCurrentPage(index + 1);
    
    requestAnimationFrame(() => {
      if (el.scrollHeight > el.clientHeight) {
        if (index === pageCount - 1) {
          setPageCount(prev => prev + 1);
          setTimeout(() => {
             editorRefs.current[index + 1]?.focus();
             setCurrentPage(index + 2);
          }, 10);
        } else {
          editorRefs.current[index + 1]?.focus();
          setCurrentPage(index + 2);
        }
      }
    });

    if (e.key === "Backspace" && el.innerText.trim() === "" && index > 0) {
      setPageCount(prev => prev - 1);
      setCurrentPage(index);
      setTimeout(() => {
        const prevPage = editorRefs.current[index - 1];
        if (prevPage) {
          prevPage.focus();
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(prevPage);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 10);
    }
  };

  return (
    <div className={`space-y-8 ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-4 md:p-12 overflow-y-auto" : ""}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4 max-w-[1200px] mx-auto text-black">
        <h4 className="font-black uppercase tracking-tighter italic text-lg">
          {isZenMode ? "📝 Mode Fokus" : "1. Editor Naskah Utama"}
        </h4>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border shadow-sm">
             Halaman: {currentPage} / {pageCount}
           </span>
           <button onClick={() => setIsZenMode(!isZenMode)} className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase shadow-xl hover:bg-slate-800 transition-all">
             {isZenMode ? "Keluar" : "Mode Fokus 🧘‍♂️"}
           </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto">
        <div className="border-2 border-slate-200 rounded-3xl overflow-hidden bg-slate-400 relative z-10 shadow-inner">
          
          {/* TOOLBAR */}
          <div className="w-full bg-slate-50 px-6 py-4 border-b-2 border-slate-100 flex flex-wrap items-center gap-4 sticky top-0 z-50 shadow-sm text-black">
            <div className="flex bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-black font-black">
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("bold"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100">B</button>
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("italic"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 italic">I</button>
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("underline"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white underline">U</button>
            </div>

            <div className="flex bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden">
               <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyLeft"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100">L</button>
               <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyCenter"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100">C</button>
               <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyRight"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white">R</button>
            </div>

            <div className="flex items-center bg-white rounded-xl border-2 border-slate-200 shadow-sm px-3">
              <span className="text-[8px] font-black uppercase text-slate-400 mr-2">Size</span>
              <select value={selectedFontSize} onChange={(e) => setSelectedFontSize(e.target.value)} className="bg-transparent text-[11px] font-black outline-none py-2 cursor-pointer text-black">
                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36].map((size) => (
                  <option key={size} value={`${size}pt`}>{size} pt</option>
                ))}
              </select>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full shadow-lg">
              <span className={`w-2 h-2 rounded-full ${saveStatus === "Saving..." ? "bg-yellow-400 animate-spin" : saveStatus === "Typing..." ? "bg-blue-400 animate-pulse" : "bg-green-400"}`} />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">{saveStatus}</span>
            </div>
          </div>

          {/* AREA HALAMAN */}
          <div className="w-full p-4 md:p-12 bg-slate-400 flex flex-col items-center gap-8 min-h-[800px] overflow-y-auto custom-scrollbar" style={{ height: isZenMode ? 'calc(100vh - 180px)' : '800px' }}>
            {Array.from({ length: pageCount }).map((_, index) => (
              <div key={`page-${index}`} className="relative group">
                <div className={`absolute -left-16 top-10 font-black text-4xl transition-all ${currentPage === index + 1 ? "text-black opacity-100 scale-110" : "text-slate-100 opacity-30"}`}>
                  {index + 1}
                </div>
                <div 
                  ref={(el) => { editorRefs.current[index] = el; }}
                  contentEditable={!isLoading}
                  suppressContentEditableWarning={true}
                  onFocus={() => setCurrentPage(index + 1)}
                  onInput={() => {
                    updateStats();
                  }}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="bg-white shadow-2xl outline-none text-black font-serif prose prose-slate a4-page-div"
                  style={{ 
                      width: '210mm',
                      height: '297mm', 
                      padding: '2.54cm', 
                      fontSize: selectedFontSize, 
                      lineHeight: '1.6',
                      overflow: 'hidden', 
                      boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            
            <button onClick={() => setPageCount(prev => prev + 1)} className="mt-4 mb-20 px-8 py-3 bg-white/20 hover:bg-black text-white rounded-full text-xs font-black uppercase border-2 border-white/30 transition-all">
              + Tambah Halaman Manual
            </button>
          </div>
        </div>

        {/* STATS FOOTER */}
        {!isZenMode && (
          <div className="mt-8 bg-black p-6 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl border-t-8 border-slate-800">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Kata</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black italic">{formData.currentWordCount || 0}</span>
                <span className="text-sm font-bold text-slate-500">/ {formData.targetKata}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
               <div className="text-[10px] font-black uppercase bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                Total Halaman: {pageCount}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .a4-page-div { background-color: white !important; color: black !important; }
        .prose p { margin: 0 !important; padding-bottom: 0.2em; line-height: 1.6; text-align: justify; color: black !important; }
        [contenteditable]:empty:before {
          content: "Mulai menulis di sini...";
          color: #cbd5e1;
          font-style: italic;
          display: block;
        }
      `}</style>
    </div>
  );
}