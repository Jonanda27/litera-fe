"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  ChevronDown,
  BookOpen
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

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
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Safe");
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFontSize, setSelectedFontSize] = useState("12pt");
  const [selectedFontFamily, setSelectedFontFamily] = useState("'Times New Roman', serif");

  // --- INTEGRASI OUTLINE & CUSTOM DROP-DOWN ---
  const [outlines, setOutlines] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. FETCH DAFTAR BAB DARI OUTLINE ---
  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !formData.bookId) return;

        const res = await axios.get(`${API_BASE_URL}/books/outlines/${formData.bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOutlines(res.data);
      } catch (err) {
        console.error("Gagal memuat daftar outline:", err);
      }
    };
    fetchOutlines();
  }, [formData.bookId]);

  // --- 2. INITIAL LOAD CONTENT (BERDASARKAN DROP-DOWN) ---
  useEffect(() => {
    const fetchInitialContent = async () => {
      const token = localStorage.getItem("token");
      if (!token || !formData.bookId || !selectedChapter) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/books/get-chapter?bookId=${formData.bookId}&outlineId=${selectedChapter.id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );

        const result = await response.json();

        if (response.ok && Array.isArray(result.data) && result.data.length > 0) {
          setPageCount(result.data.length);

          setTimeout(() => {
            result.data.forEach((item: any, i: number) => {
              if (editorRefs.current[i]) {
                editorRefs.current[i]!.innerHTML = item.content || "";
              }
            });
            updateStats();
          }, 300);
        } else {
          setPageCount(1);
          setTimeout(() => {
            if (editorRefs.current[0]) editorRefs.current[0]!.innerHTML = "";
            updateStats();
          }, 300);
        }
      } catch (error) {
        console.error("Gagal memuat naskah bab:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialContent();
  }, [selectedChapter, formData.bookId]);

  // --- 3. STATS & AUTO-SAVE ---
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
    if (!selectedChapter) return;
    setSaveStatus("Typing...");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      performSave();
    }, 2000);
  };

  const performSave = async () => {
    if (isLoading || !formData.bookId || !selectedChapter) return;

    const pagesPayload = editorRefs.current
      .slice(0, pageCount)
      .map((ref, index) => ({
        page: index + 1,
        content: ref ? ref.innerHTML : ""
      }));

    setSaveStatus("Saving...");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/books/save-chapter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: formData.bookId,
          outlineId: selectedChapter.id,
          title: selectedChapter.title || "Draf Utama",
          pages: pagesPayload,
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

  // --- 4. FORMATTING TOOLS ---
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

  const applyFontFamily = (font: string) => {
    setSelectedFontFamily(font);
    document.execCommand("fontName", false, font);
    updateStats();
  };

  const handleInput = (index: number) => {
    updateStats();
    handleReflow(index);
  };

  // --- 5. NAVIGATION & OVERFLOW ---
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setCurrentPage(index + 1);

    if (e.key === "Enter") {
      requestAnimationFrame(() => {
        if (el.scrollHeight > el.clientHeight) {
          if (index === pageCount - 1) {
            setPageCount(prev => prev + 1);
          }
          setTimeout(() => {
            editorRefs.current[index + 1]?.focus();
          }, 10);
        }
      });
    }

    if (e.key === "Backspace" && el.innerText.length === 0 && index > 0) {
      e.preventDefault();
      const prevPage = editorRefs.current[index - 1];
      if (prevPage) {
        setPageCount(prev => prev - 1);
        prevPage.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(prevPage);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const handleReflow = useCallback((index: number) => {
    const el = editorRefs.current[index];
    if (!el) return;

    if (el.scrollHeight > el.clientHeight) {
      if (index === pageCount - 1) {
        setPageCount(prev => prev + 1);
        return;
      }

      const nextPage = editorRefs.current[index + 1];
      if (nextPage) {
        while (el.scrollHeight > el.clientHeight && el.childNodes.length > 0) {
          const lastChild = el.lastChild;
          if (!lastChild) break;
          nextPage.insertBefore(lastChild, nextPage.firstChild);
        }
        handleReflow(index + 1);
      }
    }
  }, [pageCount]);

  return (
    <div className={`space-y-4 md:space-y-6 ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-2 md:p-12 overflow-y-auto" : ""}`}>

      {/* HEADER: DROPDOWN BAB MODERN */}
      {!isZenMode && (
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative z-[60]">
          <div className="flex-1">
            <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3 block pl-1">
              Pilih Bab Untuk Ditulis
            </label>

            <div className="relative w-full max-w-md">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-slate-50 border-2 border-slate-100 p-3 md:p-4 rounded-xl md:rounded-2xl hover:border-blue-500 transition-all shadow-inner group"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-black shadow-lg shadow-blue-200">
                    {selectedChapter ? selectedChapter.chapter_number : "?"}
                  </span>
                  <span className={`text-xs md:text-sm font-bold truncate ${selectedChapter ? 'text-slate-800' : 'text-slate-400'}`}>
                    {selectedChapter ? selectedChapter.title : "Klik untuk memilih bab..."}
                  </span>
                </div>
                <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                  <ChevronDown className="text-slate-400 group-hover:text-blue-500" size={16} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-2xl md:rounded-3xl shadow-2xl z-20 overflow-hidden"
                    >
                      <div className="max-h-[250px] md:max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                        {outlines.length > 0 ? (
                          outlines.map((chap) => (
                            <button
                              key={chap.id}
                              onClick={() => {
                                setSelectedChapter(chap);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 transition-all mb-1 ${selectedChapter?.id === chap.id
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-slate-50 text-slate-600"
                                }`}
                            >
                              <span className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-black ${selectedChapter?.id === chap.id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                                {chap.chapter_number}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] md:text-[13px] font-black uppercase tracking-tight truncate">{chap.title}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-xs font-bold text-slate-400 italic">Belum ada outline bab.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <AnimatePresence>
              {selectedChapter && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Drafting Active</span>
                    <span className="text-[11px] font-bold text-blue-900 mt-1">Bab {selectedChapter.chapter_number}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-slate-100 pb-4 max-w-[1200px] mx-auto text-black gap-4 px-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="px-3 md:px-4 py-2 bg-white rounded-xl border shadow-sm flex items-center gap-2 w-full justify-center">
            <span className={`w-2 h-2 rounded-full ${selectedChapter ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
            <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest truncate">
              {selectedChapter ? "Ready to write" : "Wait selection"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-2 md:gap-4">
          <span className="text-[9px] md:text-[10px] font-bold bg-white px-3 py-2 rounded-full border shadow-sm text-slate-700 whitespace-nowrap">
            Hal: {currentPage} / {pageCount}
          </span>
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="bg-black text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex-1 text-center"
          >
            {isZenMode ? "Keluar Mode Fokus" : "Fokus 🧘‍♂️"}
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto">
        {!selectedChapter ? (
          <div className="h-[300px] md:h-[500px] flex flex-col items-center justify-center bg-slate-50/50 rounded-[2rem] md:rounded-[3rem] border-4 border-dashed border-slate-200 p-6 text-center">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl md:text-6xl mb-4 md:mb-6 opacity-30">📖</motion.div>
            <h3 className="text-lg md:text-xl font-black text-slate-400 uppercase tracking-tighter">Mulai Menulis</h3>
            <p className="text-xs md:text-sm font-bold text-slate-300 italic mt-2">Pilih bab dari menu di atas untuk mengaktifkan kertas</p>
          </div>
        ) : (
          <div className="border-2 border-slate-200 rounded-2xl md:rounded-3xl overflow-hidden bg-slate-400 relative z-10 shadow-2xl">

            {/* TOOLBAR: SCROLLABLE ON MOBILE */}
            <div className="w-full bg-slate-50 px-3 md:px-6 py-3 md:py-4 border-b-2 border-slate-100 flex overflow-x-auto md:flex-wrap items-center gap-3 md:gap-4 sticky top-0 z-50 shadow-sm text-black no-scrollbar">

              {/* Bold, Italic, Underline */}
              <div className="flex bg-white rounded-lg md:rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-black font-black shrink-0">
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle("bold"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-colors text-xs">B</button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle("italic"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 italic transition-colors text-xs">I</button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle("underline"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white underline transition-colors text-xs">U</button>
              </div>

              {/* Text Alignment */}
              <div className="flex bg-white rounded-lg md:rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-slate-600 shrink-0">
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyLeft"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-colors"><AlignLeft size={14} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyCenter"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-colors"><AlignCenter size={14} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyRight"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-colors"><AlignRight size={14} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); applyStyle("justifyFull"); }} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"><AlignJustify size={14} /></button>
              </div>

              {/* Font Family Selector */}
              <div className="flex items-center bg-white rounded-lg md:rounded-xl border-2 border-slate-200 shadow-sm px-2 md:px-3 shrink-0">
                <Type size={12} className="text-slate-400 mr-1 md:mr-2" />
                <select value={selectedFontFamily} onChange={(e) => applyFontFamily(e.target.value)} className="bg-transparent text-[10px] md:text-[11px] font-black outline-none py-2 cursor-pointer text-black max-w-[80px] md:max-w-none">
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Arial', sans-serif">Arial</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </div>

              {/* Status Badge inside Toolbar for Mobile */}
              <div className="flex-1 md:hidden" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-full shadow-lg shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === "Saving..." ? "bg-yellow-400 animate-spin" : saveStatus === "Typing..." ? "bg-blue-400 animate-pulse" : "bg-green-400"}`} />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">{saveStatus}</span>
              </div>
            </div>

            {/* AREA HALAMAN (RESPONSIVE SCALING) */}
            <div className="w-full p-2 md:p-12 bg-slate-400 flex flex-col items-center gap-4 md:gap-8 min-h-[500px] md:min-h-[800px] overflow-y-auto custom-scrollbar" 
                 style={{ height: isZenMode ? 'calc(100vh - 120px)' : '800px' }}>
              
              {Array.from({ length: pageCount }).map((_, index) => (
                <div key={`page-${index}`} className="relative group writing-page-container">
                  {/* Page Number (Hidden on very small screens to save space) */}
                  <div className={`hidden lg:block absolute -left-16 top-10 font-black text-4xl transition-all ${currentPage === index + 1 ? "text-black opacity-100 scale-110" : "text-slate-100 opacity-30"}`}>
                    {index + 1}
                  </div>
                  
                  <div
                    ref={(el) => { editorRefs.current[index] = el; }}
                    contentEditable={!isLoading}
                    suppressContentEditableWarning={true}
                    onFocus={() => setCurrentPage(index + 1)}
                    onInput={() => handleInput(index)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="bg-white shadow-2xl outline-none text-black font-serif prose prose-slate a4-page-div origin-top"
                    style={{
                      width: '210mm',
                      height: '297mm',
                      padding: '2.54cm',
                      fontSize: selectedFontSize,
                      fontFamily: selectedFontFamily,
                      lineHeight: '1.6',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      wordBreak: 'break-word'
                    }}
                  />
                </div>
              ))}

              <button onClick={() => setPageCount(prev => prev + 1)} className="mt-4 mb-20 px-6 md:px-10 py-3 md:py-4 bg-black/20 hover:bg-black text-white rounded-full text-[9px] md:text-[10px] font-black uppercase border-2 border-white/30 transition-all shadow-xl backdrop-blur-md">
                + Tambah Halaman
              </button>
            </div>
          </div>
        )}

        {/* STATS FOOTER */}
        {!isZenMode && (
          <div className="mt-4 md:mt-8 bg-black p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl border-t-4 md:border-t-8 border-slate-800">
            <div className="text-center md:text-left">
              <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Kata Bab {selectedChapter?.chapter_number || ""}</p>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-3xl md:text-5xl font-black italic">{formData.currentWordCount || 0}</span>
                <span className="text-xs md:text-sm font-bold text-slate-500">/ {formData.targetKata || 1000} Target</span>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
              <div className="text-[9px] md:text-[10px] font-black uppercase bg-slate-800 px-5 py-3 rounded-xl md:rounded-2xl border border-slate-700 shadow-inner w-full text-center">
                Halaman: {pageCount}
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
        
        /* RESPONSIVE SCALE FOR MOBILE */
        @media (max-width: 768px) {
          .writing-page-container {
            width: 100%;
            display: flex;
            justify-content: center;
            overflow: hidden;
            height: auto;
          }
          /* Menghitung skala berdasarkan lebar layar (approx) */
          .a4-page-div {
            transform: scale(0.42); /* Scale down untuk mobile portrait */
            transform-origin: top center;
            margin-bottom: -170mm; /* Mengompensasi whitespace akibat scaling */
          }
        }
        
        @media (min-width: 480px) and (max-width: 767px) {
           .a4-page-div {
            transform: scale(0.6); 
            margin-bottom: -120mm;
          }
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}