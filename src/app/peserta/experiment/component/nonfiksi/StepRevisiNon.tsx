"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, RotateCcw } from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";
import CommentInputModal from "./componentRevisi/CommentInputModal";
import RevisionHeader from "./componentRevisi/RevisionHeader";
import FeatureContent from "./componentRevisi/FeatureContent";
import RevisionPage from "./componentRevisi/RevisionPage";
import ComparisonModal from "./componentRevisi/ComparisonModal"; // Pastikan komponen ini dibuat

interface StepRevisiProps {
  comments: any[];
  versions: any[];
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function StepRevisiNon({
  formData,
  handleInputChange,
}: StepRevisiProps) {
  // --- STATES ---
  const [loading, setLoading] = useState(true);
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

  const [selectedVersionId, setSelectedVersionId] = useState<string | number>("sekarang");

  // State untuk Fitur Restore
  const [versionToRestore, setVersionToRestore] = useState<any | null>(null);

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

  // --- 2. FETCH OUTLINES (NON-FIKSI) ---
  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !formData.bookId) return;

        const res = await fetch(`${API_BASE_URL}/books/chapter-structures/${formData.bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        const mappedData = data.map((item: any) => ({
          ...item,
          chapter_number: item.chapterNumber,
        }));
        
        setOutlines(mappedData);

        if (mappedData.length > 0 && !selectedChapter) {
          setSelectedChapter(mappedData[0]);
        }
      } catch (err) {
        console.error("Gagal memuat daftar outline non-fiksi:", err);
      }
    };
    fetchOutlines();
  }, [formData.bookId]);

  // --- 3. FETCH DATA BAB (CONTENT, COMMENTS, VERSIONS) ---
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token || !formData.bookId || !selectedChapter) return;

    try {
      setLoading(true);
      setSaveStatus("Loading...");

      const resContent = await fetch(
        `${API_BASE_URL}/books/non-fiction/get-content?bookId=${formData.bookId}&chapterNumber=${selectedChapter.chapterNumber}`,
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
        pagesData = [{ page: 1, content: "", id: contentResult.data?.id }];
        setSavedPages(pagesData);
        setMainChapterPages(pagesData);
      }

      // Get Comments & Versions (Menggunakan ID dari halaman pertama Non-Fiksi)
      if (pagesData.length > 0 && pagesData[0].id) {
        const firstPageId = pagesData[0].id;

        // Fetch Comments
        const resComments = await fetch(`${API_BASE_URL}/books/get-comments?chapterId=${firstPageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const commentResult = await resComments.json();
        if (commentResult.data) setLocalComments(commentResult.data);

        // Fetch Versions
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

  // --- 4. LOGIKA RESTORE VERSI ---
  const handleRestoreVersion = async (version: any) => {
    const token = localStorage.getItem("token");
    const chapterId = savedPages[0]?.id; // ID dari tabel NonFictionChapterContents

    if (!chapterId || !version.id) {
      alert("Data tidak lengkap untuk melakukan pemulihan.");
      return;
    }

    try {
      setSaveStatus("Restoring...");
      const res = await fetch(`${API_BASE_URL}/books/restore-version`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          chapterId: chapterId, 
          versionId: version.id, 
          isNonFiction: true
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setVersionToRestore(null);
        setSelectedVersionId("sekarang");
        await fetchData(); // Refresh content di editor
        alert(result.message || "Naskah berhasil dipulihkan!");
      } else {
        alert(result.message || "Gagal memulihkan naskah.");
      }
    } catch (error) {
      console.error("Restore Error:", error);
      setSaveStatus("Error");
    } finally {
      setSaveStatus("Safe");
    }
  };

  const handleSelectVersion = (version: any) => {
    if (version === "sekarang") {
      setSelectedVersionId("sekarang");
      setSavedPages(mainChapterPages);
      setPageCount(mainChapterPages.length || 1);
    } else {
      setVersionToRestore(version); // Membuka modal perbandingan
    }
    setActiveFeature(null);
  };

  // --- 5. LOGIKA SAVE, SELECTION, COMMENT ---
  const handleSaveVersion = async () => {
    const token = localStorage.getItem("token");
    const firstPageId = savedPages[0]?.id;
    if (!firstPageId) return alert("Simpan naskah terlebih dahulu!");

    try {
      setSaveStatus("Archiving...");
      const res = await fetch(`${API_BASE_URL}/books/save-chapter-version`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chapterId: firstPageId, isNonFiction: true }),
      });
      if (res.ok) { fetchData(); setActiveFeature("versi"); }
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
    if (!targetPage?.id) return;

    try {
      setSaveStatus("Commenting...");
      const res = await fetch(`${API_BASE_URL}/books/save-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            chapterId: targetPage.id,
            highlight_id: `highlight-${Date.now()}`,
            selected_text: selectedText,
            comment_text: commentText,
            label: commentLabel,
            currentContent: editorRefs.current[currentPage - 1]?.innerHTML || "",
            isNonFiction: true
        }),
      });

      if (res.ok) {
        setShowCommentInput(false);
        setSelectedText("");
        setCommentText("");
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
    try {
      setSaveStatus("Deleting...");
      await fetch(`${API_BASE_URL}/books/delete-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          commentId: comment.id,
          chapterId: comment.chapterId,
          highlight_id: comment.highlight_id,
          currentContent: editorRefs.current[currentPage - 1]?.innerHTML || "",
        }),
      });
      fetchData();
    } catch (error) { setSaveStatus("Error"); }
  };

  return (
    <div className={`space-y-8 transition-all duration-500 overflow-x-hidden ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-0 flex flex-col h-screen overflow-hidden text-black" : ""}`}>
      
      {/* MODALS */}
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

      <AnimatePresence>
        {versionToRestore && (
          <ComparisonModal 
            version={versionToRestore}
            currentContent={mainChapterPages}
            onClose={() => setVersionToRestore(null)}
            onRestore={() => handleRestoreVersion(versionToRestore)}
          />
        )}
      </AnimatePresence>

      {/* HEADER NAV */}
      {!isZenMode && (
        <RevisionHeader 
          outlines={outlines}
          selectedChapter={selectedChapter}
          setSelectedChapter={setSelectedChapter}
          isScanningConsistency={false}
          handleAIConsistencyCheck={() => {}}
        />
      )}

      {/* TOOLBAR */}
      <div className={`${isZenMode ? "px-12 py-6 border-b bg-white" : "flex justify-between items-center border-b-2 border-slate-100 pb-4 max-w-[1200px] mx-auto"} flex justify-between items-center gap-4 flex-wrap`}>
        <div className="flex items-center gap-4">
          <h4 className="font-black uppercase text-black text-lg">📄 Review Non-Fiksi</h4>
          <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border shadow-sm text-slate-700">
            Hal: {currentPage} / {pageCount}
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={() => setIsZenMode(!isZenMode)} className="text-[10px] font-black bg-black text-white px-6 py-2.5 rounded-full uppercase shadow-xl">
            {isZenMode ? "Keluar Mode Fokus" : "Mode Fokus 🧘‍♂️"}
          </button>
          {!isZenMode && (
            <button onClick={handleSaveVersion} className="text-[10px] font-black bg-orange-500 text-white px-6 py-2.5 rounded-full uppercase shadow-xl">
              Simpan v.Next
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className={`${isZenMode ? "flex flex-1 overflow-hidden" : "space-y-6 relative"}`}>
        
        {!isZenMode ? (
          <div className="max-w-[400px] mx-auto flex border-2 border-slate-100 bg-white p-2 gap-2 rounded-2xl shadow-sm relative z-30">
            {[{ id: "komentar", label: `Catatan (${localComments.length})`, icon: "💬" }, { id: "versi", label: "Versi", icon: "📜" }].map((item) => (
              <button key={item.id} onClick={() => setActiveFeature(activeFeature === item.id ? null : item.id)}
                className={`flex-1 py-3 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest ${activeFeature === item.id ? "bg-black text-white" : "text-slate-400 hover:bg-slate-50"}`}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-16 bg-white border-r flex flex-col items-center py-6 gap-6 z-20">
            {[{ id: "komentar", icon: "💬" }, { id: "versi", icon: "📜" }].map((item) => (
              <button key={item.id} onClick={() => setActiveFeature(activeFeature === item.id ? null : item.id)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm ${activeFeature === item.id ? "bg-black text-white" : "bg-slate-50 text-slate-400"}`}>
                <span className="text-lg">{item.icon}</span>
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {!isZenMode && activeFeature && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute left-0 right-0 top-[70px] z-50 px-2 pointer-events-none">
              <div className="max-w-5xl mx-auto pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                  <div className="p-8">
                    <FeatureContent 
                      activeFeature={activeFeature}
                      localComments={localComments}
                      localVersions={localVersions}
                      selectedVersionId={selectedVersionId}
                      handleSelectVersion={handleSelectVersion}
                      handleDeleteComment={handleDeleteComment}
                      scrollToHighlight={scrollToHighlight}
                      // Non-fiksi tidak butuh data tokoh di sini, kirim empty array
                      isScanningConsistency={false}
                      consistencyReports={[]}
                      characters={[]}
                      setSelectedChar={() => {}}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex-1 overflow-y-auto bg-slate-400 p-8 custom-scrollbar`}
             style={{ height: isZenMode ? 'calc(100vh - 80px)' : 'auto' }}>
          <div className={`mx-auto flex flex-col items-center gap-8 bg-slate-400 ${isZenMode ? "max-w-[1000px]" : "w-full"}`}>
            {!selectedChapter ? (
              <div className="bg-white/80 backdrop-blur-md border-4 border-dashed border-white rounded-[3rem] p-20 flex flex-col items-center justify-center text-slate-500 shadow-2xl">
                <Lock size={40} className="mb-6 opacity-20" />
                <h3 className="text-xl font-black uppercase tracking-tighter">Review Terkunci</h3>
                <p className="font-bold mt-2">Pilih bab untuk mulai mereview.</p>
              </div>
            ) : (
              <>
                {loading && <div className="text-white text-xs font-black animate-pulse">MEMPROSES...</div>}
                {Array.from({ length: pageCount }).map((_, index) => (
                  <RevisionPage 
                    key={index} index={index} currentPage={currentPage}
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
      </div>
    </div>
  );
}