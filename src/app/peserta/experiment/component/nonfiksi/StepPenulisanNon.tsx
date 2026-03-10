"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import {
  BookText,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  Lock,
  Edit3,
} from "lucide-react";

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
  const [chapters, setChapters] = useState<any[]>([]); // Daftar bab dari structure [cite: 99]
  const [selectedChapter, setSelectedChapter] = useState<string>(""); // chapterNumber aktif
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Safe");
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFontSize, setSelectedFontSize] = useState("12pt");

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bookId = formData?.bookId || formData?.id; // [cite: 472]

  // --- 1. FETCH DAFTAR BAB (DARI STRUCTURE) ---
  useEffect(() => {
    const fetchChapterList = async () => {
      if (!bookId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:4000/api/books/chapter-structures/${bookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
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
      if (!bookId || !selectedChapter) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Menggunakan API: /non-fiction/get-content
        const response = await fetch(
          `http://localhost:4000/api/books/non-fiction/get-content?bookId=${bookId}&chapterNumber=${selectedChapter}`,
          { headers: { Authorization: `Bearer ${token}` } },
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
          if (editorRefs.current[0]) editorRefs.current[0]!.innerHTML = "";
          setPageCount(1);
        }
      } catch (error) {
        console.error("Gagal memuat naskah bab:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChapterContent();
  }, [selectedChapter, bookId]);

  // --- 3. STATS & AUTO-SAVE (Integrasi API POST) ---
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
    saveTimerRef.current = setTimeout(performSave, 2000);
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
      // Menggunakan API: /non-fiction/save-content
      const response = await fetch(
        "http://localhost:4000/api/books/non-fiction/save-content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId,
            chapterNumber: selectedChapter,
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
    }
  };

  // --- 4. FORMATTING & NAVIGATION (Existing Logic) ---
  const applyStyle = (command: string, value: any = undefined) => {
    document.execCommand(command, false, value);
    updateStats();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const el = e.currentTarget;
    if (el.scrollHeight > el.clientHeight) {
      if (index === pageCount - 1) setPageCount((prev) => prev + 1);
    }
  };

  return (
    <div
      className={`space-y-8 ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-4 md:p-12 overflow-y-auto text-black" : ""}`}
    >
      {/* HEADER: CHAPTER SELECTOR */}
      <div className="max-w-[1200px] mx-auto bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border-b-4 border-blue-500 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <BookText size={28} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block mb-1 ml-1">
              Pilih Bab Untuk Ditulis
            </label>
            <div className="relative group">
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="bg-white/5 border-2 border-white/10 hover:border-blue-500 text-white font-black text-lg px-5 py-2.5 rounded-2xl outline-none appearance-none cursor-pointer transition-all pr-12 w-full md:w-[350px] uppercase tracking-tighter"
              >
                <option value="" disabled className="text-slate-900">
                  -- Pilih Nomor Bab --
                </option>
                {chapters.map((ch) => (
                  <option
                    key={ch.id}
                    value={ch.chapterNumber}
                    className="text-slate-900"
                  >
                    Bab {ch.chapterNumber}: {ch.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
                size={20}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${saveStatus === "Saved" ? "bg-green-500/10 border-green-500/50 text-green-400" : "bg-blue-500/10 border-blue-500/50 text-blue-400"}`}
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
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-blue-700 transition-all"
          >
            {isZenMode ? "Keluar Fokus" : "Mode Fokus 🧘‍♂️"}
          </button>
        </div>
      </div>

      {/* EDITOR AREA */}
      <div className="max-w-[1200px] mx-auto relative">
        <AnimatePresence>
          {!selectedChapter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-100/80 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center border-4 border-dashed border-slate-300"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-4 text-slate-300">
                <Lock size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                Editor Terkunci
              </h3>
              <p className="text-slate-500 font-bold italic mt-2">
                Silahkan pilih bab di atas untuk mulai menulis.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-2 border-slate-200 rounded-[3rem] overflow-hidden bg-slate-400 relative z-10 shadow-2xl">
          {/* TOOLBAR */}
          <div className="w-full bg-slate-50 px-8 py-5 border-b-2 border-slate-100 flex flex-wrap items-center gap-6 sticky top-0 z-50 shadow-sm text-black">
            <div className="flex bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden font-black">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyStyle("bold");
                }}
                className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100"
              >
                B
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyStyle("italic");
                }}
                className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 italic"
              >
                I
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyStyle("underline");
                }}
                className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white underline"
              >
                U
              </button>
            </div>

            <div className="flex items-center bg-white rounded-2xl border-2 border-slate-200 shadow-sm px-4">
              <span className="text-[9px] font-black uppercase text-slate-400 mr-3">
                Font Size
              </span>
              <select
                value={selectedFontSize}
                onChange={(e) => setSelectedFontSize(e.target.value)}
                className="bg-transparent text-xs font-black outline-none py-3 cursor-pointer text-black"
              >
                {[10, 11, 12, 14, 16, 18, 20].map((size) => (
                  <option key={size} value={`${size}pt`}>
                    {size} pt
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1" />

            {selectedChapter && (
              <div className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl shadow-lg">
                <Edit3 size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  BAB {selectedChapter}
                </span>
              </div>
            )}
          </div>

          {/* PAGES AREA */}
          <div
            className="w-full p-4 md:p-12 bg-slate-400 flex flex-col items-center gap-10 min-h-[800px] overflow-y-auto custom-scrollbar"
            style={{ height: isZenMode ? "calc(100vh - 250px)" : "800px" }}
          >
            {Array.from({ length: pageCount }).map((_, index) => (
              <div key={`page-${index}`} className="relative group">
                <div
                  className={`absolute -left-16 top-10 font-black text-4xl transition-all ${currentPage === index + 1 ? "text-black opacity-100 scale-110" : "text-slate-100 opacity-30"}`}
                >
                  {index + 1}
                </div>
                <div
                  ref={(el) => {
                    editorRefs.current[index] = el;
                  }}
                  contentEditable={!!selectedChapter && !isLoading}
                  suppressContentEditableWarning={true}
                  onFocus={() => setCurrentPage(index + 1)}
                  onInput={updateStats}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="bg-white shadow-2xl outline-none text-black font-serif prose prose-slate a4-page-div"
                  style={{
                    width: "210mm",
                    height: "297mm",
                    padding: "2.54cm",
                    fontSize: selectedFontSize,
                    lineHeight: "1.8",
                    overflow: "hidden",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
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
          text-align: justify;
          color: black !important;
        }
        [contenteditable]:empty:before {
          content: "Tulis isi bab di sini...";
          color: #cbd5e1;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
