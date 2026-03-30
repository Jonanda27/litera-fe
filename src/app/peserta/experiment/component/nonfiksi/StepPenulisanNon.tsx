"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/constans/constans";

// Asumsi komponen ini di-copy/tersedia di folder nonfiksi juga, 
// atau Anda bisa menyesuaikan path-nya ke "../fiksi/componentPenulisan/..." jika di-share
import StatsFooter from "./componentPenulisan/StatsFooter";
import ChapterDropdown from "./componentPenulisan/ChapterDropdown";
import EditorToolbar from "./componentPenulisan/EditorToolbar";
import WritingPage from "./componentPenulisan/WritingPage";

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

  const [outlines, setOutlines] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. FETCH DAFTAR BAB DARI OUTLINE (NON-FIKSI) ---
  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || !formData.bookId) return;

        // Menggunakan endpoint Non-Fiksi
        const res = await axios.get(
          `${API_BASE_URL}/books/chapter-structures/${formData.bookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Map chapterNumber ke chapter_number agar komponen Dropdown & Footer tetap berjalan normal
        const mappedData = res.data.map((item: any) => ({
          ...item,
          chapter_number: item.chapterNumber, 
        }));

        setOutlines(mappedData);
      } catch (err) {
        console.error("Gagal memuat daftar outline:", err);
      }
    };

    fetchOutlines();
  }, [formData.bookId]);

  // --- 2. INITIAL LOAD CONTENT (NON-FIKSI MULTI-PAGE) ---
  useEffect(() => {
    const fetchInitialContent = async () => {
      const token = localStorage.getItem("token");

      if (!token || !formData.bookId || !selectedChapter) return;

      try {
        setIsLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/books/non-fiction/get-content?bookId=${formData.bookId}&chapterNumber=${selectedChapter.chapterNumber}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.data) {
          // Menyesuaikan dengan format DB baru: result.data seharusnya array of pages
          const pagesArray = Array.isArray(result.data) ? result.data : [result.data];

          if (pagesArray.length > 0) {
            setPageCount(pagesArray.length); // Render jumlah halaman sesuai data
            
            setTimeout(() => {
              pagesArray.forEach((pageData: any, index: number) => {
                if (editorRefs.current[index]) {
                  editorRefs.current[index]!.innerHTML = pageData.content || "";
                }
              });
              updateStats();
            }, 300);
          } else {
            // Jika array kosong (bab baru)
            setPageCount(1);
            setTimeout(() => {
              if (editorRefs.current[0]) editorRefs.current[0]!.innerHTML = "";
              updateStats();
            }, 300);
          }
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

  // --- 3. STATS & AUTO-SAVE (NON-FIKSI MULTI-PAGE) ---
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
    if (isLoading || !formData.bookId || !selectedChapter) return;

    // Petakan setiap ref ke dalam format object array untuk dikirim ke backend
    const pagesPayload = editorRefs.current
      .map((ref, index) => {
        if (!ref) return null;
        
        // Opsional: Hitung kata per halaman jika ingin disimpan spesifik per page di DB
        const textContent = ref.innerText || "";
        const wordCountPerPage = textContent.trim().split(/\s+/).filter((w) => w !== "").length;

        return {
          pageNumber: index + 1,
          content: ref.innerHTML,
          wordCount: wordCountPerPage,
        };
      })
      .filter(Boolean); // Filter elemen null jika ada ref yang kosong

    setSaveStatus("Saving...");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/books/non-fiction/save-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: formData.bookId,
          chapterNumber: selectedChapter.chapterNumber,
          pages: pagesPayload, // Kirimkan array of pages
          wordCount: formData.currentWordCount || 0, // Total kata tetap dikirim jika di-handle controller
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
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // --- 4. FORMATTING TOOLS ---
  const applyStyle = (command: string, value: any = undefined) => {
    document.execCommand(command, false, value);
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
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const el = e.currentTarget;

    setCurrentPage(index + 1);

    if (e.key === "Enter") {
      requestAnimationFrame(() => {
        if (el.scrollHeight > el.clientHeight) {
          if (index === pageCount - 1) {
            setPageCount((prev) => prev + 1);
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
        setPageCount((prev) => prev - 1);

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

  const handleReflow = useCallback(
    (index: number) => {
      const el = editorRefs.current[index];

      if (!el) return;

      if (el.scrollHeight > el.clientHeight) {
        
        // 1. Jika ini adalah halaman terakhir, tambah halaman baru
        if (index === pageCount - 1) {
          setPageCount((prev) => prev + 1);
        }

        // 2. Langsung pindahkan kursor/fokus ke halaman berikutnya 
        setTimeout(() => {
          const nextPage = editorRefs.current[index + 1];
          if (nextPage) {
            nextPage.focus();
            
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(nextPage);
            range.collapse(true); 
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 50); 
      }
    },
    [pageCount],
  );

  return (
    <div
      className={`space-y-4 md:space-y-6 ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-2 md:p-12 overflow-y-auto" : ""}`}
    >
      {/* HEADER: DROPDOWN BAB */}

      {!isZenMode && (
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative z-[60]">
          <ChapterDropdown
            outlines={outlines}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
          />

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
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">
                      Drafting Active
                    </span>

                    <span className="text-[11px] font-bold text-blue-900 mt-1">
                      Bab {selectedChapter.chapter_number}
                    </span>
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
            <span
              className={`w-2 h-2 rounded-full ${selectedChapter ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
            />

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
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-4xl md:text-6xl mb-4 md:mb-6 opacity-30"
            >
              📖
            </motion.div>

            <h3 className="text-lg md:text-xl font-black text-slate-400 uppercase tracking-tighter">
              Mulai Menulis
            </h3>

            <p className="text-xs md:text-sm font-bold text-slate-300 italic mt-2">
              Pilih bab dari menu di atas untuk mengaktifkan kertas
            </p>
          </div>
        ) : (
          <div className="border-2 border-slate-200 rounded-2xl md:rounded-3xl overflow-hidden bg-slate-400 relative z-10 shadow-2xl">
            <EditorToolbar
              applyStyle={applyStyle}
              applyFontFamily={applyFontFamily}
              selectedFontFamily={selectedFontFamily}
              saveStatus={saveStatus}
            />

            <div
              className="w-full p-2 md:p-12 bg-slate-400 flex flex-col items-center gap-4 md:gap-8 min-h-[500px] md:min-h-[800px] overflow-y-auto custom-scrollbar"
              style={{ height: isZenMode ? "calc(100vh - 120px)" : "800px" }}
            >
              {Array.from({ length: pageCount }).map((_, index) => (
                <WritingPage
                  key={`page-${index}`}
                  index={index}
                  currentPage={currentPage}
                  isLoading={isLoading}
                  selectedFontSize={selectedFontSize}
                  selectedFontFamily={selectedFontFamily}
                  onFocus={() => setCurrentPage(index + 1)}
                  onInput={() => handleInput(index)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  innerRef={(el) => {
                    editorRefs.current[index] = el;
                  }}
                />
              ))}

              <button
                onClick={() => setPageCount((prev) => prev + 1)}
                className="mt-4 mb-20 px-6 md:px-10 py-3 md:py-4 bg-black/20 hover:bg-black text-white rounded-full text-[9px] md:text-[10px] font-black uppercase border-2 border-white/30 transition-all shadow-xl backdrop-blur-md"
              >
                + Tambah Halaman
              </button>
            </div>
          </div>
        )}

        {!isZenMode && (
          <StatsFooter
            selectedChapter={selectedChapter}
            currentWordCount={formData.currentWordCount}
            targetKata={parseInt(formData.targetKata)}
            pageCount={pageCount}
          />
        )}
      </div>

      <style jsx global>{`
        .a4-page-div {
          background-color: white !important;
          color: black !important;
        }

        /* Reset Margin Heading agar pas dengan layout buku */

        .prose h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em !important;
          margin-top: 0.5em !important;
          line-height: 1.2;
        }

        .prose h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.4em !important;
          margin-top: 0.4em !important;
          line-height: 1.2;
        }

        .prose h3 {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 0.3em !important;
          margin-top: 0.3em !important;
          line-height: 1.2;
        }

        .prose p {
          margin: 0 !important;
          padding-bottom: 0.2em;
          line-height: 1.6;
          text-align: justify;
          color: black !important;
        }

        [contenteditable]:empty:before {
          content: "Mulai menulis di sini...";

          color: #cbd5e1;

          font-style: italic;

          display: block;
        }

        @media (max-width: 768px) {
          .writing-page-container {
            width: 100%;

            display: flex;

            justify-content: center;

            overflow: hidden;

            height: auto;
          }

          .a4-page-div {
            transform: scale(0.42);

            transform-origin: top center;

            margin-bottom: -170mm;
          }
        }

        @media (min-width: 480px) and (max-width: 767px) {
          .a4-page-div {
            transform: scale(0.6);

            margin-bottom: -120mm;
          }
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}