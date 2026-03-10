"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  // State Naskah Multi-halaman
  const [savedPages, setSavedPages] = useState<any[]>([]);
  const [mainChapterPages, setMainChapterPages] = useState<any[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFontSize, setSelectedFontSize] = useState("12pt");

  const [selectedVersionId, setSelectedVersionId] = useState<string | number>(
    "sekarang",
  );

  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mengisi HTML ke dalam editor setelah loading selesai
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

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token || !formData.bookId) return;

    try {
      setLoading(true);

      const resContent = await fetch(
        `http://localhost:4000/api/books/get-chapter?bookId=${formData.bookId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const contentResult = await resContent.json();

      let pagesData: any[] = [];
      if (
        contentResult.data &&
        Array.isArray(contentResult.data) &&
        contentResult.data.length > 0
      ) {
        pagesData = contentResult.data;
        setPageCount(pagesData.length);
        setSavedPages(pagesData);
        setMainChapterPages(pagesData);
      } else {
        setPageCount(1);
        setSavedPages([{ page: 1, content: "" }]);
        setMainChapterPages([{ page: 1, content: "" }]);
      }

      const resChars = await fetch(
        `http://localhost:4000/api/books/characters?bookId=${formData.bookId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const charResult = await resChars.json();
      if (charResult.data) setCharacters(charResult.data);

      if (pagesData.length > 0) {
        const commentsPromises = pagesData.map((p: any) =>
          fetch(
            `http://localhost:4000/api/books/get-comments?chapterId=${p.id}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ).then((r) => r.json()),
        );
        const commentsResults = await Promise.all(commentsPromises);
        let allComments: any[] = [];
        commentsResults.forEach((res) => {
          if (res.data) allComments = [...allComments, ...res.data];
        });

        allComments.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setLocalComments(allComments);

        const firstPageId = pagesData[0].id;
        const resVersions = await fetch(
          `http://localhost:4000/api/books/get-versions?chapterId=${firstPageId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const versionResult = await resVersions.json();
        if (versionResult.data) setLocalVersions(versionResult.data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formData.bookId]);

  const handleSelectVersion = (version: any) => {
    if (version === "sekarang") {
      setSelectedVersionId("sekarang");
      setSavedPages(mainChapterPages);
      setPageCount(mainChapterPages.length || 1);
    } else {
      setSelectedVersionId(version.id);
      try {
        const parsedContent = JSON.parse(version.content);
        if (Array.isArray(parsedContent)) {
          setSavedPages(parsedContent);
          setPageCount(parsedContent.length || 1);
        } else {
          setSavedPages([{ page: 1, content: version.content }]);
          setPageCount(1);
        }
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
    if (!firstPageId) {
      alert("Naskah kosong, tidak bisa menyimpan versi!");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:4000/api/books/save-chapter-version",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chapterId: firstPageId }),
        },
      );

      if (res.ok) {
        alert("Versi baru berhasil diarsipkan!");
        fetchData();
        setActiveFeature("versi");
      }
    } catch (error) {
      console.error("Error saving version:", error);
    }
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
    if (!targetPage || !targetPage.id) {
      alert("Gagal memproses: Data ID halaman tidak ditemukan.");
      return;
    }

    const highlightId = `highlight-${Date.now()}`;
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !selectedText) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.id = highlightId;
    span.className = "bg-orange-200 rounded px-1 transition-all duration-300";

    try {
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);

      const activeHtmlContent =
        editorRefs.current[currentPage - 1]?.innerHTML || "";

      const res = await fetch("http://localhost:4000/api/books/save-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapterId: targetPage.id,
          highlight_id: highlightId,
          selected_text: selectedText,
          comment_text: commentText,
          label: commentLabel,
          currentContent: activeHtmlContent,
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
    } catch (error) {
      console.error("Gagal highlight:", error);
    }
  };

  const scrollToHighlight = (highlightId: string) => {
    const element = document.getElementById(highlightId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.animate(
        [
          { backgroundColor: "#fef08a", transform: "scale(1.02)" },
          { backgroundColor: "#fed7aa", transform: "scale(1)" },
        ],
        { duration: 800 },
      );
      if (!isZenMode) setActiveFeature(null);
    }
  };

  const handleDeleteComment = async (comment: any) => {
    const token = localStorage.getItem("token");
    if (!confirm("Hapus catatan ini?")) return;

    const element = document.getElementById(comment.highlight_id);
    if (element) element.replaceWith(element.innerText);

    const targetPageIndex = savedPages.findIndex(
      (p) => p.id === comment.chapterId,
    );
    const activeIndex =
      targetPageIndex !== -1 ? targetPageIndex : currentPage - 1;

    const cleanedHtml = editorRefs.current[activeIndex]?.innerHTML || "";

    try {
      const res = await fetch(
        "http://localhost:4000/api/books/delete-comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            commentId: comment.id,
            chapterId: comment.chapterId,
            highlight_id: comment.highlight_id,
            currentContent: cleanedHtml,
          }),
        },
      );

      if (res.ok) fetchData();
    } catch (error) {
      console.error("Gagal hapus komentar:", error);
    }
  };

  // --- SUB-KOMPONEN UNTUK KONTEN FITUR ---
  const FeatureContent = ({ isVertical = false }) => {
    return (
      <div
        className={`${isVertical ? "space-y-4 px-2" : "flex gap-5 overflow-x-auto pb-6 custom-scrollbar-hide snap-x snap-mandatory scroll-smooth"}`}
        id={!isVertical ? "carousel-container" : ""}
      >
        {/* RENDER: KOMENTAR */}
        {activeFeature === "komentar" &&
          localComments.map((comment) => (
            <motion.div
              whileHover={{ y: -5 }}
              key={comment.id}
              className={`${isVertical ? "w-full" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group relative bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-orange-400 p-5 rounded-[2rem] transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer`}
              onClick={() => scrollToHighlight(comment.highlight_id)}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                    comment.label === "Typo/Ejaan"
                      ? "bg-blue-100 text-blue-600"
                      : comment.label === "Plot Hole"
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {comment.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteComment(comment);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>
              <div className="relative pl-4 border-l-2 border-slate-200 mb-3 text-black">
                <p className="text-[11px] leading-relaxed font-bold italic line-clamp-2">
                  "{comment.selected_text}"
                </p>
              </div>
              {comment.comment_text && (
                <div className="bg-white group-hover:bg-orange-50/50 p-3 rounded-2xl border border-slate-100 transition-colors">
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {comment.comment_text}
                  </p>
                </div>
              )}
            </motion.div>
          ))}

        {/* RENDER: VERSI */}
        {activeFeature === "versi" && (
          <>
            <div
              onClick={() => handleSelectVersion("sekarang")}
              className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer ${
                selectedVersionId === "sekarang"
                  ? "border-black bg-black text-white shadow-2xl"
                  : "border-slate-100 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${selectedVersionId === "sekarang" ? "bg-green-400" : "bg-slate-300"}`}
                />
                <span
                  className={`text-[8px] font-black uppercase tracking-widest ${selectedVersionId === "sekarang" ? "text-white/60" : "text-slate-400"}`}
                >
                  Aktif
                </span>
              </div>
              <h6 className="font-black text-xs uppercase mb-1">DRAFT UTAMA</h6>
              <p
                className={`text-[9px] font-bold ${selectedVersionId === "sekarang" ? "text-white/50" : "text-slate-400"}`}
              >
                Penyuntingan Real-time
              </p>
            </div>
            {localVersions.map((v) => (
              <div
                key={v.id}
                onClick={() => handleSelectVersion(v)}
                className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer ${
                  selectedVersionId === v.id
                    ? "border-orange-500 bg-orange-50 shadow-lg"
                    : "border-slate-100 bg-slate-50 hover:border-orange-200"
                }`}
              >
                <div className="flex justify-between items-center mb-4 text-slate-400 group-hover:text-orange-500 transition-colors">
                  <span className="text-[18px]">📜</span>
                  <span className="text-[8px] font-black uppercase tracking-widest italic">
                    {new Date(v.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <h6 className="font-black text-xs uppercase text-slate-800 mb-1">
                  {v.version_name}
                </h6>
                <p className="text-[9px] font-bold text-slate-400">
                  Backup Terarsip
                </p>
              </div>
            ))}
          </>
        )}

        {/* RENDER: QC TOKOH */}
        {activeFeature === "qc" &&
          characters.map((char) => (
            <div
              key={char.id}
              className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} relative overflow-hidden bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:border-orange-200 transition-all duration-500 group`}
            >
              <div className="absolute top-0 right-0 w-16 h-16 p-2 opacity-20 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110 overflow-hidden rounded-bl-[2rem]">
                {char.image ? (
                  <img
                    src={char.image}
                    alt={char.nama}
                    className="w-full h-full object-cover rounded-xl shadow-inner"
                  />
                ) : (
                  <span className="text-[30px]">👤</span>
                )}
              </div>
              <div className="relative z-10 text-black">
                <h6 className="font-black text-sm text-slate-800 uppercase mb-4 tracking-tighter flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full inline-block"></span>
                  {char.nama}
                </h6>
                <div className="space-y-2">
                  <div className="flex gap-3 items-center">
                    <span className="text-[8px] font-black text-slate-300 uppercase w-10">
                      Umur
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded">
                      {char.umur}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[8px] font-black text-slate-300 uppercase w-10">
                      Fisik
                    </span>
                    <p className="text-[10px] font-medium text-slate-600 italic flex-1 line-clamp-2">
                      {char.fisik || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div
      className={`space-y-8 transition-all duration-500 overflow-x-hidden ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-0 flex flex-col h-screen overflow-hidden" : ""}`}
    >
      {/* MODAL INPUT KOMENTAR */}
      <AnimatePresence>
        {showCommentInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-orange-500 w-full max-w-md text-black"
            >
              <h5 className="font-black text-sm uppercase tracking-widest mb-4 text-center">
                Beri Catatan
              </h5>
              <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                  Teks Terpilih:
                </p>
                <p className="text-xs italic text-slate-700 line-clamp-2">
                  "{selectedText}"
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 block">
                    Kategori
                  </label>
                  <select
                    value={commentLabel}
                    onChange={(e) => setCommentLabel(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 text-xs font-bold text-black outline-none cursor-pointer"
                  >
                    <option>Cek Fakta</option>
                    <option>Tambah Deskripsi</option>
                    <option>Plot Hole</option>
                    <option>Typo/Ejaan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 block">
                    Isi Catatan
                  </label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Tulis detail revisi di sini..."
                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 text-xs font-medium text-black outline-none focus:border-orange-400 min-h-[100px] resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={addComment}
                    className="flex-[2] py-3 bg-orange-500 text-white text-[10px] font-black rounded-xl uppercase shadow-lg hover:bg-orange-600 transition-colors"
                  >
                    Simpan Catatan
                  </button>
                  <button
                    onClick={() => {
                      window.getSelection()?.removeAllRanges();
                      setShowCommentInput(false);
                      setCommentText("");
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-400 text-[10px] font-black rounded-xl uppercase"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER & TOOLBAR */}
      <div
        className={`${isZenMode ? "px-12 py-6 border-b bg-white" : "flex justify-between items-center border-b-2 border-slate-100 pb-4"} flex justify-between items-center`}
      >
        <h4 className="font-black uppercase tracking-tighter text-black italic text-lg">
          {isZenMode ? "📝 Zen Review Mode" : "4. Mode Revisi & Catatan"}
        </h4>
        <div className="flex gap-3 items-center">
          <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full border shadow-sm text-black">
            Halaman: {currentPage} / {pageCount}
          </span>
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="text-[10px] font-black bg-black text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all uppercase shadow-xl active:scale-95"
          >
            {isZenMode ? "Keluar Mode Fokus" : "Mode Fokus 🧘‍♂️"}
          </button>
          <button
            onClick={handleSaveVersion}
            className="text-[10px] font-black bg-orange-500 text-white px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all uppercase shadow-xl active:scale-95"
          >
            Simpan v.Next
          </button>
        </div>
      </div>

      <div
        className={`${isZenMode ? "flex flex-1 overflow-hidden" : "space-y-6 relative"}`}
      >
        {/* TAB NAVIGATION (Hanya tampil di luar Zen Mode atau sebagai sidebar-trigger di Zen Mode) */}
        {!isZenMode ? (
          <div className="flex border-2 border-slate-100 bg-white p-2 gap-2 rounded-2xl shadow-sm relative z-30">
            {[
              {
                id: "komentar",
                label: `Catatan (${localComments.length})`,
                icon: "💬",
              },
              { id: "versi", label: "Versi", icon: "📜" },
              { id: "qc", label: "QC Tokoh", icon: "👤" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setActiveFeature(activeFeature === item.id ? null : item.id)
                }
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest ${activeFeature === item.id ? "bg-black text-white" : "text-slate-400 hover:bg-slate-50"}`}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        ) : (
          /* Mini-Sidebar Tabs di Zen Mode */
          <div className="w-16 bg-white border-r flex flex-col items-center py-6 gap-6 z-20">
            {[
              { id: "komentar", icon: "💬" },
              { id: "versi", icon: "📜" },
              { id: "qc", icon: "👤" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setActiveFeature(activeFeature === item.id ? null : item.id)
                }
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm ${activeFeature === item.id ? "bg-black text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
              >
                <span className="text-lg">{item.icon}</span>
              </button>
            ))}
          </div>
        )}

        {/* DROPDOWN CARD (Hanya untuk non-Zen Mode) */}
        <AnimatePresence>
          {!isZenMode && activeFeature && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute left-0 right-0 top-[70px] z-50 px-2 pointer-events-none"
            >
              <div className="max-w-5xl mx-auto pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
                  <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-200">
                        {activeFeature === "komentar"
                          ? "💬"
                          : activeFeature === "versi"
                            ? "📜"
                            : "👤"}
                      </span>
                      <div>
                        <h5 className="font-black text-[12px] uppercase text-slate-800 tracking-[0.15em]">
                          {activeFeature === "komentar"
                            ? "Daftar Catatan Revisi"
                            : activeFeature === "versi"
                              ? "Riwayat Versi Naskah"
                              : "Database Karakter"}
                        </h5>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {activeFeature === "komentar"
                            ? `${localComments.length} entri ditemukan`
                            : "Pilih data untuk ditinjau"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveFeature(null)}
                      className="group flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 text-slate-400 hover:text-black hover:border-black transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      Tutup{" "}
                      <span className="group-hover:rotate-90 transition-transform inline-block">
                        ✕
                      </span>
                    </button>
                  </div>
                  <div className="p-8 bg-white relative">
                    <FeatureContent isVertical={false} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AREA KERTAS (TAMPILAN UTAMA) */}
        <div
          className={`flex-1 overflow-y-auto bg-slate-400 p-8 ${isZenMode ? "scrollbar-thin scrollbar-thumb-slate-500" : ""}`}
        >
          <div
            className={`mx-auto flex flex-col items-center gap-8 ${isZenMode ? "max-w-[1000px]" : "w-full"}`}
          >
            {loading && (
              <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-black rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Memuat Naskah Revisi...
                </p>
              </div>
            )}

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
                  onMouseUp={() => handleTextSelection(index)}
                  onFocus={() => setCurrentPage(index + 1)}
                  className="bg-white shadow-2xl outline-none text-black font-serif prose prose-slate a4-page-div"
                  style={{
                    width: "210mm",
                    height: "297mm",
                    padding: "2.54cm",
                    fontSize: selectedFontSize,
                    lineHeight: "1.6",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR (Hanya tampil di Zen Mode) */}
        <AnimatePresence>
          {isZenMode && activeFeature && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-[400px] bg-white border-l-2 border-slate-200 h-full flex flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div>
                  <h5 className="font-black text-xs uppercase tracking-widest text-black">
                    {activeFeature === "komentar"
                      ? "Catatan Revisi"
                      : activeFeature === "versi"
                        ? "Versi Naskah"
                        : "Database Tokoh"}
                  </h5>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    Panel Navigasi Zen
                  </p>
                </div>
                <button
                  onClick={() => setActiveFeature(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-black"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <FeatureContent isVertical={true} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .a4-page-div {
          background-color: white !important;
          color: black !important;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .prose p {
          margin: 0 !important;
          padding-bottom: 0.2em;
          line-height: 1.6;
          text-align: justify;
          color: black !important;
          word-break: break-word;
        }
        .custom-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
