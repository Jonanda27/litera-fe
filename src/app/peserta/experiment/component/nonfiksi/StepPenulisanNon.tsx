"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BookText,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  Lock,
  Edit3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface StepPenulisanProps {
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function StepPenulisanNonFiction({
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
  const [selectedFontFamily, setSelectedFontFamily] = useState(
    "'Times New Roman', serif",
  );

  // --- INTEGRASI OUTLINE & CUSTOM DROP-DOWN ---
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bookId = formData?.bookId || formData?.id;

  // --- 1. FETCH DAFTAR BAB (DARI STRUCTURE) ---
  useEffect(() => {
    const fetchChapterList = async () => {
      if (!bookId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
  `${API_BASE_URL}/books/chapter-structures/${bookId}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
        setChapters(res.data);
      } catch (err) {
        console.error("Gagal mengambil struktur bab");
      }
    };
    fetchChapterList();
  }, [bookId]);

  // --- 2. FETCH KONTEN SAAT BAB DIPILIH (Integrasi API GET) ---
  useEffect(() => {
    const fetchChapterContent = async () => {
      const token = localStorage.getItem("token");
      if (!token || !bookId || !selectedChapter) return;

      try {
        setIsLoading(true);
       const response = await fetch(
  `${API_BASE_URL}/books/non-fiction/get-content?bookId=${bookId}&chapterNumber=${selectedChapter.chapterNumber}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

        const result = await response.json();

        if (response.ok && result.data) {
          const content = result.data.content || "";

          setTimeout(() => {
            if (editorRefs.current[0]) {
              editorRefs.current[0]!.innerHTML = content;
            }
            updateStats();
          }, 300);
          setPageCount(1);
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
    fetchChapterContent();
  }, [selectedChapter, bookId]);

  // --- 3. STATS & AUTO-SAVE ---
  const updateStats = () => {
    let totalText = "";
    editorRefs.current.forEach((ref) => {
      if (ref) totalText += ref.innerText + " ";
    });
    const words = totalText
      .trim()
      .split(/\s+/)
      .filter((w) => w !== "").length;
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
    if (isLoading || !bookId || !selectedChapter) return;

    let fullHtml = "";
    editorRefs.current.forEach((ref) => {
      if (ref) fullHtml += ref.innerHTML;
    });

    const words =
      editorRefs.current[0]?.innerText
        .trim()
        .split(/\s+/)
        .filter((w) => w !== "").length || 0;

    setSaveStatus("Saving...");
    try {
      const token = localStorage.getItem("token");
    const response = await fetch(
  `${API_BASE_URL}/books/non-fiction/save-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId,
            chapterNumber: selectedChapter.chapterNumber,
            content: fullHtml,
            wordCount: words,
          }),
        },
      );

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
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // --- 4. FORMATTING TOOLS (FIXED FONT SIZE & FONT FAMILY) ---
  const applyStyle = (command: string, value: any = undefined) => {
    document.execCommand(command, false, value);
    updateStats();
  };

  const applyFontSize = (size: string) => {
    setSelectedFontSize(size);
    // execCommand 'fontSize' bawaan hanya 1-7. Kita gunakan hack font size 7 lalu diubah stylingnya.
    document.execCommand("fontSize", false, "7");
    const fontSpans = document.querySelectorAll('font[size="7"]');
    fontSpans.forEach((span) => {
      (span as HTMLElement).removeAttribute("size");
      (span as HTMLElement).style.fontSize = size;
    });
    updateStats();
  };

  const applyFontFamily = (font: string) => {
    setSelectedFontFamily(font);
    document.execCommand("fontName", false, font);
    updateStats();
  };

  // --- 5. NAVIGATION & OVERFLOW ---
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const el = e.currentTarget;
    setCurrentPage(index + 1);

    requestAnimationFrame(() => {
      if (el.scrollHeight > el.clientHeight) {
        if (index === pageCount - 1) {
          setPageCount((prev) => prev + 1);
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
      setPageCount((prev) => prev - 1);
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
    <div
      className={`space-y-6 ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-4 md:p-12 overflow-y-auto text-black" : ""}`}
    >
      {/* HEADER: CUSTOM DROPDOWN (WARNA PUTIH/ABU NETRAL) */}
      {!isZenMode && (
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative z-[60]">
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block pl-1">
              Navigasi Bab
            </label>

            <div className="relative w-full max-w-md">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl hover:border-slate-400 transition-all shadow-inner group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 shadow-sm">
                    <BookText size={16} />
                  </div>
                  <span
                    className={`text-sm font-bold truncate ${selectedChapter ? "text-slate-800" : "text-slate-400"}`}
                  >
                    {selectedChapter
                      ? `Bab ${selectedChapter.chapterNumber}: ${selectedChapter.title}`
                      : "Pilih bab untuk menulis..."}
                  </span>
                </div>
                <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                  <ChevronDown size={18} className="text-slate-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl z-20 overflow-hidden"
                    >
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                        {chapters.length > 0 ? (
                          chapters.map((ch) => (
                            <button
                              key={ch.id}
                              onClick={() => {
                                setSelectedChapter(ch);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all mb-1 ${
                                selectedChapter?.chapterNumber ===
                                ch.chapterNumber
                                  ? "bg-slate-100 text-slate-900"
                                  : "hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${selectedChapter?.chapterNumber === ch.chapterNumber ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-200"}`}
                              >
                                {ch.chapterNumber}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black uppercase tracking-tight truncate">
                                  {ch.title}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-xs font-bold text-slate-400 italic">
                              Belum ada struktur bab.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
                saveStatus === "Saved"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              {saveStatus === "Saved" ? (
                <CheckCircle2 size={14} />
              ) : (
                <RefreshCw
                  size={14}
                  className={saveStatus === "Saving..." ? "animate-spin" : ""}
                />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {saveStatus}
              </span>
            </div>
            <button
              onClick={() => setIsZenMode(!isZenMode)}
              className="bg-slate-800 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-slate-950 transition-all active:scale-95"
            >
              {isZenMode ? "Keluar Mode Fokus" : "Mode Fokus 🧘‍♂️"}
            </button>
          </div>
        </div>
      )}

      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4 max-w-[1200px] mx-auto text-black">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border shadow-sm flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${selectedChapter ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
            />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              {selectedChapter
                ? "Ready to write"
                : "Waiting for chapter selection"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold bg-white px-3 py-2 rounded-full border shadow-sm text-slate-700">
            Halaman: {currentPage} / {pageCount}
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto relative">
        {!selectedChapter ? (
          <div className="h-[500px] flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-6 opacity-30"
            >
              <Lock size={60} />
            </motion.div>
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">
              Editor Terkunci
            </h3>
            <p className="text-sm font-bold text-slate-300 italic mt-2">
              Pilih bab dari menu dropdown di atas untuk mengaktifkan kertas
            </p>
          </div>
        ) : (
          <div className="border-2 border-slate-200 rounded-3xl overflow-hidden bg-slate-400 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
            {/* TOOLBAR */}
            <div className="w-full bg-slate-50 px-6 py-4 border-b-2 border-slate-100 flex flex-wrap items-center gap-4 sticky top-0 z-50 shadow-sm text-black">
              {/* Bold, Italic, Underline */}
              <div className="flex bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-black font-black">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyStyle("bold");
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 border-r-2 border-slate-100 transition-colors"
                >
                  B
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyStyle("italic");
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 border-r-2 border-slate-100 italic transition-colors"
                >
                  I
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyStyle("underline");
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 underline transition-colors"
                >
                  U
                </button>
              </div>

              {/* Text Alignment */}
              <div className="flex bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-slate-600">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyStyle("justifyLeft");
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 border-r-2 border-slate-100 transition-colors"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyStyle("justifyCenter");
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 border-r-2 border-slate-100 transition-colors"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyStyle("justifyRight");
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 border-r-2 border-slate-100 transition-colors"
                >
                  <AlignRight size={16} />
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyStyle("justifyFull");
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <AlignJustify size={16} />
                </button>
              </div>

              {/* Font Family Selector */}
              <div className="flex items-center bg-white rounded-xl border-2 border-slate-200 shadow-sm px-3">
                <Type size={14} className="text-slate-400 mr-2" />
                <select
                  value={selectedFontFamily}
                  onChange={(e) => applyFontFamily(e.target.value)}
                  className="bg-transparent text-[11px] font-black outline-none py-2 cursor-pointer text-black"
                >
                  <option value="'Times New Roman', serif">
                    Times New Roman
                  </option>
                  <option value="'Georgia', serif">Georgia</option>
                  <option value="'Arial', sans-serif">Arial</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="'Garamond', serif">Garamond</option>
                </select>
              </div>

              {/* Font Size Selector */}
              <div className="flex items-center bg-white rounded-xl border-2 border-slate-200 shadow-sm px-3">
                <span className="text-[8px] font-black uppercase text-slate-400 mr-2">
                  Size
                </span>
                <select
                  value={selectedFontSize}
                  onChange={(e) => applyFontSize(e.target.value)}
                  className="bg-transparent text-[11px] font-black outline-none py-2 cursor-pointer text-black"
                >
                  {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36].map(
                    (size) => (
                      <option key={size} value={`${size}pt`}>
                        {size} pt
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full shadow-lg">
                <span
                  className={`w-2 h-2 rounded-full ${saveStatus === "Saving..." ? "bg-yellow-400 animate-spin" : saveStatus === "Typing..." ? "bg-blue-400 animate-pulse" : "bg-green-400"}`}
                />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">
                  {saveStatus}
                </span>
              </div>
            </div>

            {/* AREA HALAMAN (A4 STYLE) */}
            <div
              className="w-full p-4 md:p-12 bg-slate-400 flex flex-col items-center gap-8 min-h-[800px] overflow-y-auto custom-scrollbar"
              style={{ height: isZenMode ? "calc(100vh - 180px)" : "800px" }}
            >
              {Array.from({ length: pageCount }).map((_, index) => (
                <div key={`page-${index}`} className="relative group">
                  <div
                    className={`absolute -left-16 top-10 font-black text-4xl transition-all ${currentPage === index + 1 ? "text-slate-800 opacity-100 scale-110" : "text-slate-200 opacity-30"}`}
                  >
                    {index + 1}
                  </div>
                  <div
                    ref={(el) => {
                      editorRefs.current[index] = el;
                    }}
                    contentEditable={!isLoading}
                    suppressContentEditableWarning={true}
                    onFocus={() => setCurrentPage(index + 1)}
                    onInput={updateStats}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="bg-white shadow-2xl outline-none text-black prose prose-slate a4-page-div"
                    style={{
                      width: "210mm",
                      height: "297mm",
                      padding: "2.54cm",
                      fontSize: selectedFontSize,
                      fontFamily: selectedFontFamily,
                      lineHeight: "1.8",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              <button
                onClick={() => setPageCount((prev) => prev + 1)}
                className="mt-4 mb-20 px-10 py-4 bg-white/20 hover:bg-white/40 text-white rounded-full text-[10px] font-black uppercase border-2 border-white/30 transition-all shadow-xl backdrop-blur-md"
              >
                + Tambah Halaman Manual
              </button>
            </div>
          </div>
        )}

        {/* STATS FOOTER */}
        {!isZenMode && (
          <div className="mt-8 bg-white p-8 rounded-[2.5rem] text-slate-800 flex justify-between items-center shadow-2xl border border-slate-200">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Total Kata Bab {selectedChapter?.chapterNumber || ""}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black italic">
                  {formData.currentWordCount || 0}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  / {formData.targetKata || 1000} Target
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-[10px] font-black uppercase bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 shadow-inner">
                Total Halaman: {pageCount}
              </div>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">
                LITERA Non-Fiction System v.2
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .a4-page-div {
          background-color: white !important;
          color: black !important;
          border-radius: 4px;
        }
        .prose p {
          margin: 0 !important;
          padding-bottom: 0.8em;
          line-height: 1.8;
          text-align: justify;
          color: black !important;
        }
        [contenteditable]:empty:before {
          content: "Mulai menulis naskah bab di sini...";
          color: #cbd5e1;
          font-style: italic;
          display: block;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
