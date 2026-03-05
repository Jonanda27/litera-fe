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
  const [selectedFontSize, setSelectedFontSize] = useState("12pt");
  
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. INITIAL LOAD ---
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
          const content = result.data.content || "";
          // Gunakan pemisah halaman saat split
          const splitPages = content.split("");
          setPageCount(splitPages.length || 1);
          
          setTimeout(() => {
            splitPages.forEach((pageText: string, i: number) => {
              if (editorRefs.current[i]) {
                editorRefs.current[i]!.innerHTML = pageText;
              }
            });
            updateStats();
          }, 100);

          if (result.data.id && !formData.currentChapterId) {
            handleInputChange("currentChapterId", result.data.id);
          }
        }
      } catch (error) {
        console.error("Gagal memuat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialContent();
  }, [formData.bookId]);

  // --- 2. STATS & AUTO-SAVE ---
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

    const htmlPages = [];
    for (let i = 0; i < pageCount; i++) {
      htmlPages.push(editorRefs.current[i]?.innerHTML || "");
    }
    const fullHtml = htmlPages.join("");
    
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
          chapterId: formData.currentChapterId || null,
          title: "Draf Utama",
          content: fullHtml,
          wordCount: formData.currentWordCount || 0,
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
    // Menggunakan trik font size execCommand lalu menggantinya dengan span style
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
    
    requestAnimationFrame(() => {
      if (el.scrollHeight > el.clientHeight) {
        if (index === pageCount - 1) {
          setPageCount(prev => prev + 1);
          setTimeout(() => editorRefs.current[index + 1]?.focus(), 10);
        } else {
          editorRefs.current[index + 1]?.focus();
        }
      }
    });

    if (e.key === "Backspace" && el.innerText.trim() === "" && index > 0) {
      setPageCount(prev => prev - 1);
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
      <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4 max-w-[1200px] mx-auto">
        <h4 className="font-black uppercase tracking-tighter text-black italic text-lg">
          {isZenMode ? "📝 Mode Fokus" : "1. Editor Naskah Utama"}
        </h4>
        <button onClick={() => setIsZenMode(!isZenMode)} className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase shadow-xl hover:bg-slate-800 transition-all">
          {isZenMode ? "Keluar Mode Fokus" : "Mode Fokus 🧘‍♂️"}
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto">
        <div className="border-2 border-slate-200 rounded-3xl overflow-hidden bg-slate-400 relative z-10 shadow-inner">
          
          {/* TOOLBAR LENGKAP */}
          <div className="w-full bg-slate-50 px-6 py-4 border-b-2 border-slate-100 flex flex-wrap items-center gap-4 sticky top-0 z-50 shadow-sm">
             
            {/* Bold, Italic, Underline */}
            <div className="flex bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-black font-black">
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("bold"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-all">B</button>
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("italic"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 italic font-serif text-lg">I</button>
              <button onMouseDown={(e) => { e.preventDefault(); applyStyle("underline"); }} className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white underline">U</button>
            </div>

            {/* Font Size */}
            <div className="flex items-center bg-white rounded-xl border-2 border-slate-200 shadow-sm px-3 overflow-hidden">
              <span className="text-[8px] font-black uppercase text-slate-400 mr-2">Size</span>
              <select 
                value={selectedFontSize}
                onChange={(e) => applyFontSize(e.target.value)}
                className="bg-transparent text-[11px] font-black outline-none py-2 cursor-pointer text-black"
              >
                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36].map((size) => (
                  <option key={size} value={`${size}pt`}>{size} pt</option>
                ))}
              </select>
            </div>

            {/* Alignment */}
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

            {/* Headings */}
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
            
            <div className="flex-1" />

            {/* Save Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full shadow-lg">
              <span className={`w-2 h-2 rounded-full ${
                saveStatus === "Saving..." ? "bg-yellow-400 animate-spin" : 
                saveStatus === "Typing..." ? "bg-blue-400 animate-pulse" : 
                saveStatus === "Error" ? "bg-red-500" : "bg-green-400"
              }`} />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">{saveStatus}</span>
            </div>
          </div>

          {/* AREA HALAMAN A4 */}
          <div className="w-full p-4 md:p-12 bg-slate-400 flex flex-col items-center gap-8 min-h-[800px] overflow-y-auto custom-scrollbar" style={{ height: isZenMode ? 'calc(100vh - 180px)' : '800px' }}>
            {Array.from({ length: pageCount }).map((_, index) => (
              <div key={`page-${index}`} className="relative group">
                <div className="absolute -left-16 top-10 text-slate-100 font-black text-4xl opacity-30 group-hover:opacity-100 transition-all">
                  {index + 1}
                </div>

                <div 
                  ref={(el) => { editorRefs.current[index] = el; }}
                  contentEditable={!isLoading}
                  suppressContentEditableWarning={true}
                  onInput={updateStats}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="bg-white shadow-2xl outline-none text-black font-serif prose prose-slate a4-page-div"
                  style={{ 
                      width: '210mm',
                      height: '297mm', 
                      padding: '2.54cm', 
                      fontSize: '12pt', 
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
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Kata Terhitung</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black italic">{formData.currentWordCount || 0}</span>
                <span className="text-sm font-bold text-slate-500">/ {formData.targetKata}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
               <div className="text-[10px] font-black uppercase bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                {pageCount} Halaman A4
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase italic mr-2 tracking-tighter">Debounced Save Active (2s)</p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .a4-page-div {
          background-color: white !important;
          color: black !important;
        }
        .prose p { margin: 0 !important; padding-bottom: 0.2em; line-height: 1.6; text-align: justify; color: black !important; }
        .prose h1, .prose h2, .prose h3 { color: black !important; margin: 0.5em 0 !important; font-weight: 900; }
        
        [contenteditable]:empty:before {
          content: "Mulai menulis di sini...";
          color: #cbd5e1;
          font-style: italic;
          display: block;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}</style>
    </div>
  );
}