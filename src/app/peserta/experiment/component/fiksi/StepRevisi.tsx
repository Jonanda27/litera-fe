"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";
import CharacterDetailModal from "./componentRevisi/CharacterDetailModal";
import CommentInputModal from "./componentRevisi/CommentInputModal";
import RevisionHeader from "./componentRevisi/RevisionHeader";
import FeatureContent from "./componentRevisi/FeatureContent";
import RevisionPage from "./componentRevisi/RevisionPage";



interface StepRevisiProps {
  comments: any[];
  versions: any[];
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function StepRevisi({
  comments: initialComments,
  versions: initialVersions,
  formData,
  handleInputChange,
}: StepRevisiProps) {
  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<any[]>([]);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [localVersions, setLocalVersions] = useState<any[]>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [commentLabel, setCommentLabel] = useState("Cek Fakta");
  const [commentText, setCommentText] = useState("");
  const [isZenMode, setIsZenMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Safe");

  const [outlines, setOutlines] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  const [savedPages, setSavedPages] = useState<any[]>([]);
  const [mainChapterPages, setMainChapterPages] = useState<any[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFontSize, setSelectedFontSize] = useState("12pt");
  const [selectedFontFamily, setSelectedFontFamily] = useState("'Times New Roman', serif");
  const [selectedChar, setSelectedChar] = useState<any | null>(null);

  const [isScanningConsistency, setIsScanningConsistency] = useState(false);
  const [consistencyReports, setConsistencyReports] = useState<any[]>([]);

  const [selectedVersionId, setSelectedVersionId] = useState<string | number>("sekarang");

  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);

  // --- 1. SYNC CONTENT KE EDITOR ---
  useEffect(() => {
    if (!loading && savedPages.length > 0) {
      setTimeout(() => {
        savedPages.forEach((item, i) => {
          if (editorRefs.current[i]) {
            editorRefs.current[i]!.innerHTML = item.content || "";
          }
        });
      }, 300);
    }
  }, [savedPages, loading, isZenMode, pageCount]);

  // --- 2. FETCH OUTLINES ---
  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !formData.bookId) return;

        const res = await fetch(`${API_BASE_URL}/books/outlines/${formData.bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOutlines(data);

        if (data.length > 0 && !selectedChapter) {
          setSelectedChapter(data[0]);
        }
      } catch (err) {
        console.error("Gagal memuat daftar outline:", err);
      }
    };
    fetchOutlines();
  }, [formData.bookId]);

  // --- 3. FETCH DATA BAB (CONTENT, CHARS, COMMENTS, VERSIONS) ---
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token || !formData.bookId || !selectedChapter) return;

    try {
      setLoading(true);
      setSaveStatus("Loading...");

      // Get Content
      const resContent = await fetch(
        `${API_BASE_URL}/books/get-chapter?bookId=${formData.bookId}&outlineId=${selectedChapter.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const contentResult = await resContent.json();

      let pagesData: any[] = [];
      if (contentResult.data && Array.isArray(contentResult.data) && contentResult.data.length > 0) {
        pagesData = contentResult.data;
        setPageCount(pagesData.length);
        setSavedPages(pagesData);
        setMainChapterPages(pagesData);
      } else {
        setPageCount(1);
        setSavedPages([{ page: 1, content: "" }]);
        setMainChapterPages([{ page: 1, content: "" }]);
      }

      // Get Characters
      const resChars = await fetch(`${API_BASE_URL}/books/characters/${formData.bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const charResult = await resChars.json();
      if (charResult) setCharacters(charResult);

      // Get Comments & Versions
      if (pagesData.length > 0) {
        const commentsPromises = pagesData.map((p: any) =>
          fetch(`${API_BASE_URL}/books/get-comments?chapterId=${p.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json())
        );
        const commentsResults = await Promise.all(commentsPromises);
        let allComments: any[] = [];
        commentsResults.forEach((res) => { if (res.data) allComments = [...allComments, ...res.data]; });
        allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLocalComments(allComments);

        const firstPageId = pagesData[0].id;
        const resVersions = await fetch(`${API_BASE_URL}/books/get-versions?chapterId=${firstPageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const versionResult = await resVersions.json();
        if (versionResult.data) setLocalVersions(versionResult.data);
      }
      setSaveStatus("Safe");
    } catch (error) {
      console.error("Fetch Error:", error);
      setSaveStatus("Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formData.bookId, selectedChapter]);

  // --- 4. LOGIKA AI SCAN ---
  const handleAIConsistencyCheck = async () => {
    const token = localStorage.getItem("token");
    if (!token || characters.length === 0) return;

    const fullText = editorRefs.current.map((ref) => ref?.innerText || "").join("\n");
    if (fullText.trim().length < 50) {
      alert("Naskah terlalu pendek untuk dianalisis.");
      return;
    }

    try {
      setIsScanningConsistency(true);
      setActiveFeature("konsistensi");
      const response = await fetch(`${API_BASE_URL}/ai/check-character-consistency`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: fullText, characterDatabase: characters }),
      });
      const result = await response.json();
      if (result.success) setConsistencyReports(result.data);
    } catch (error) {
      console.error("Error AI Scan:", error);
    } finally {
      setIsScanningConsistency(false);
    }
  };

  // --- 5. LOGIKA VERSI & KOMENTAR ---
  const handleSelectVersion = (version: any) => {
    if (version === "sekarang") {
      setSelectedVersionId("sekarang");
      setSavedPages(mainChapterPages);
      setPageCount(mainChapterPages.length || 1);
    } else {
      setSelectedVersionId(version.id);
      try {
        const parsedContent = JSON.parse(version.content);
        setSavedPages(Array.isArray(parsedContent) ? parsedContent : [{ page: 1, content: version.content }]);
        setPageCount(Array.isArray(parsedContent) ? parsedContent.length : 1);
      } catch (error) {
        setSavedPages([{ page: 1, content: version.content }]);
        setPageCount(1);
      }
    }
    setActiveFeature(null);
  };

  const handleSaveVersion = async () => {
    const token = localStorage.getItem("token");
    const firstPageId = savedPages[0]?.id;
    if (!firstPageId) return alert("Naskah kosong!");

    try {
      setSaveStatus("Archiving...");
      const res = await fetch(`${API_BASE_URL}/books/save-chapter-version`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chapterId: firstPageId }),
      });
      if (res.ok) { alert("Versi berhasil diarsipkan!"); fetchData(); setActiveFeature("versi"); }
    } catch (error) { setSaveStatus("Error"); }
  };

  const handleTextSelection = (index: number) => {
    if (selectedVersionId !== "sekarang") return;
    setCurrentPage(index + 1);
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      setShowCommentInput(true);
    }
  };

  const addComment = async () => {
    const token = localStorage.getItem("token");
    const targetPage = savedPages[currentPage - 1];
    if (!targetPage?.id) return alert("ID halaman tidak ditemukan.");

    const highlightId = `highlight-${Date.now()}`;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selectedText) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.id = highlightId;
    span.className = "bg-orange-200 rounded px-1 transition-all duration-300";

    try {
      setSaveStatus("Commenting...");
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);

      const res = await fetch(`${API_BASE_URL}/books/save-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          chapterId: targetPage.id,
          highlight_id: highlightId,
          selected_text: selectedText,
          comment_text: commentText,
          label: commentLabel,
          currentContent: editorRefs.current[currentPage - 1]?.innerHTML || "",
        }),
      });

      if (res.ok) {
        setShowCommentInput(false);
        setSelectedText("");
        setCommentText("");
        selection.removeAllRanges();
        fetchData();
        setActiveFeature("komentar");
      }
    } catch (error) { setSaveStatus("Error"); }
  };

  const scrollToHighlight = (highlightId: string) => {
    const element = document.getElementById(highlightId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.animate([{ backgroundColor: "#fef08a" }, { backgroundColor: "#fed7aa" }], { duration: 800 });
      if (!isZenMode) setActiveFeature(null);
    }
  };

  const handleDeleteComment = async (comment: any) => {
    const token = localStorage.getItem("token");
    if (!confirm("Hapus catatan ini?")) return;

    const element = document.getElementById(comment.highlight_id);
    if (element) element.replaceWith(element.innerText);

    const targetPageIndex = savedPages.findIndex((p) => p.id === comment.chapterId);
    const activeIndex = targetPageIndex !== -1 ? targetPageIndex : currentPage - 1;

    try {
      setSaveStatus("Deleting...");
      const res = await fetch(`${API_BASE_URL}/books/delete-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          commentId: comment.id,
          chapterId: comment.chapterId,
          highlight_id: comment.highlight_id,
          currentContent: editorRefs.current[activeIndex]?.innerHTML || "",
        }),
      });
      if (res.ok) fetchData();
    } catch (error) { setSaveStatus("Error"); }
  };

  // --- RENDER ---
  return (
    <div className={`space-y-8 transition-all duration-500 overflow-x-hidden ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-0 flex flex-col h-screen overflow-hidden text-black" : ""}`}>
      
      {/* MODALS */}
      <AnimatePresence>
        {selectedChar && <CharacterDetailModal selectedChar={selectedChar} onClose={() => setSelectedChar(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showCommentInput && (
          <CommentInputModal 
            selectedText={selectedText}
            commentLabel={commentLabel}
            setCommentLabel={setCommentLabel}
            commentText={commentText}
            setCommentText={setCommentText}
            addComment={addComment}
            onCancel={() => { window.getSelection()?.removeAllRanges(); setShowCommentInput(false); }}
          />
        )}
      </AnimatePresence>

      {/* HEADER NAV */}
      {!isZenMode && (
        <RevisionHeader 
          outlines={outlines}
          selectedChapter={selectedChapter}
          setSelectedChapter={setSelectedChapter}
          isScanningConsistency={isScanningConsistency}
          handleAIConsistencyCheck={handleAIConsistencyCheck}
        />
      )}

      {/* TOOLBAR KONTROL */}
      <div className={`${isZenMode ? "px-12 py-6 border-b bg-white" : "flex justify-between items-center border-b-2 border-slate-100 pb-4 max-w-[1200px] mx-auto"} flex justify-between items-center gap-4 flex-wrap`}>
        <div className="flex items-center gap-4">
          <h4 className="font-black uppercase tracking-tighter text-black text-lg">
            {isZenMode ? "📝 Mode Fokus" : "📄 Review Naskah"}
          </h4>
          <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border shadow-sm text-slate-700">
            Halaman: {currentPage} / {pageCount}
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={() => setIsZenMode(!isZenMode)} className="text-[10px] font-black bg-black text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all uppercase shadow-xl">
            {isZenMode ? "Keluar Mode Fokus" : "Mode Fokus 🧘‍♂️"}
          </button>
          {!isZenMode && (
            <button onClick={handleSaveVersion} className="text-[10px] font-black bg-orange-500 text-white px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all uppercase shadow-xl">
              Simpan v.Next
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className={`${isZenMode ? "flex flex-1 overflow-hidden" : "space-y-6 relative"}`}>
        
        {/* TABS SIDEBAR (NORMAL) */}
        {!isZenMode ? (
          <div className="max-w-[1200px] mx-auto flex border-2 border-slate-100 bg-white p-2 gap-2 rounded-2xl shadow-sm relative z-30">
            {[
              { id: "komentar", label: `Catatan (${localComments.length})`, icon: "💬" },
              { id: "versi", label: "Versi", icon: "📜" },
              { id: "qc", label: "QC Tokoh", icon: "👤" },
              { id: "konsistensi", label: "Cek AI", icon: "🤖" },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveFeature(activeFeature === item.id ? null : item.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest ${activeFeature === item.id ? "bg-black text-white" : "text-slate-400 hover:bg-slate-50"}`}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        ) : (
          /* TABS SIDEBAR (ZEN) */
          <div className="w-16 bg-white border-r flex flex-col items-center py-6 gap-6 z-20">
            {[{ id: "komentar", icon: "💬" }, { id: "versi", icon: "📜" }, { id: "qc", icon: "👤" }, { id: "konsistensi", icon: "🤖" }].map((item) => (
              <button key={item.id} onClick={() => setActiveFeature(activeFeature === item.id ? null : item.id)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm ${activeFeature === item.id ? "bg-black text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>
                <span className="text-lg">{item.icon}</span>
              </button>
            ))}
          </div>
        )}

        {/* FEATURE PANEL (FLOATING ON NORMAL) */}
        <AnimatePresence>
          {!isZenMode && activeFeature && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute left-0 right-0 top-[70px] z-50 px-2 pointer-events-none">
              <div className="max-w-5xl mx-auto pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                  <div className="p-8">
                    <FeatureContent 
                      activeFeature={activeFeature}
                      isScanningConsistency={isScanningConsistency}
                      consistencyReports={consistencyReports}
                      localComments={localComments}
                      localVersions={localVersions}
                      characters={characters}
                      selectedVersionId={selectedVersionId}
                      handleSelectVersion={handleSelectVersion}
                      handleDeleteComment={handleDeleteComment}
                      scrollToHighlight={scrollToHighlight}
                      setSelectedChar={setSelectedChar}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EDITOR AREA */}
        <div className={`flex-1 overflow-y-auto bg-slate-400 p-8 custom-scrollbar`}
             style={{ height: isZenMode ? 'calc(100vh - 80px)' : 'auto' }}>
          <div id="paper-revisi" className={`mx-auto flex flex-col items-center gap-8 bg-slate-400 ${isZenMode ? "max-w-[1000px]" : "w-full"}`}>
            {!selectedChapter ? (
              <div className="bg-white/80 backdrop-blur-md border-4 border-dashed border-white rounded-[3rem] p-20 flex flex-col items-center justify-center text-slate-500 shadow-2xl">
                <Lock size={40} className="mb-6 opacity-20" />
                <h3 className="text-xl font-black uppercase tracking-tighter">Review Terkunci</h3>
                <p className="font-bold mt-2 text-center">Silahkan pilih bab pada dropdown navigasi.</p>
              </div>
            ) : (
              <>
                {loading && <div className="text-white text-xs font-black animate-pulse">MEMPROSES NASKAH...</div>}
                {Array.from({ length: pageCount }).map((_, index) => (
                  <RevisionPage 
                    key={index}
                    index={index}
                    currentPage={currentPage}
                    innerRef={(el) => { editorRefs.current[index] = el; }}
                    onMouseUp={() => handleTextSelection(index)}
                    onFocus={() => setCurrentPage(index + 1)}
                    selectedFontSize={selectedFontSize}
                    selectedFontFamily={selectedFontFamily}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* ZEN MODE SIDEBAR PANEL */}
        <AnimatePresence>
          {isZenMode && activeFeature && (
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="w-[400px] bg-white border-l-2 border-slate-200 h-full flex flex-col z-20 shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <h5 className="font-black text-xs uppercase text-black">{activeFeature} Panel</h5>
                <button onClick={() => setActiveFeature(null)} className="text-black">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <FeatureContent 
                  activeFeature={activeFeature}
                  isVertical={true}
                  isScanningConsistency={isScanningConsistency}
                  consistencyReports={consistencyReports}
                  localComments={localComments}
                  localVersions={localVersions}
                  characters={characters}
                  selectedVersionId={selectedVersionId}
                  handleSelectVersion={handleSelectVersion}
                  handleDeleteComment={handleDeleteComment}
                  scrollToHighlight={scrollToHighlight}
                  setSelectedChar={setSelectedChar}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .a4-page-div { background-color: white !important; color: black !important; }
        
        /* Reset Margin Heading agar pas dengan layout buku */
        .prose h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em !important; margin-top: 0.5em !important; line-height: 1.2; color: black !important; }
        .prose h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.4em !important; margin-top: 0.4em !important; line-height: 1.2; color: black !important; }
        .prose h3 { font-size: 1.2em; font-weight: bold; margin-bottom: 0.3em !important; margin-top: 0.3em !important; line-height: 1.2; color: black !important; }
        
        .prose p { margin: 0 !important; padding-bottom: 0.2em; line-height: 1.6; text-align: justify; color: black !important; word-break: break-word; }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }

        /* Media Queries untuk Scaling di Mobile (Sama seperti StepPenulisan) */
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

        /* Style untuk highlight komentar */
        [id^="highlight-"] {
          cursor: pointer;
          transition: all 0.2s;
        }
        [id^="highlight-"]:hover {
          filter: brightness(0.9);
        }
      `}</style>
    </div>
  );
}