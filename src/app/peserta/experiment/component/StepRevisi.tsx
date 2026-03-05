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
  const [savedContent, setSavedContent] = useState<string>("");
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

  const [selectedVersionId, setSelectedVersionId] = useState<string | number>(
    "sekarang",
  );
  const [mainChapterContent, setMainChapterContent] = useState<string>("");

  const contentRef = useRef<HTMLDivElement>(null);
  const zenContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      if (contentRef.current) contentRef.current.innerHTML = savedContent;
      if (zenContentRef.current) zenContentRef.current.innerHTML = savedContent;
    }
  }, [savedContent, loading, isZenMode]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const idParam = formData.currentChapterId
        ? `chapterId=${formData.currentChapterId}`
        : `bookId=${formData.bookId || 1}`;

      const resContent = await fetch(
        `http://localhost:4000/api/books/get-chapter?${idParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const contentResult = await resContent.json();
      if (contentResult.data) {
        const content = contentResult.data.content || "";
        setSavedContent(content);
        setMainChapterContent(content);
      }

      const resChars = await fetch(
        `http://localhost:4000/api/books/characters?bookId=${formData.bookId || 1}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const charResult = await resChars.json();
      if (charResult.data) setCharacters(charResult.data);

      if (formData.currentChapterId) {
        const resComments = await fetch(
          `http://localhost:4000/api/books/get-comments?chapterId=${formData.currentChapterId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const commentResult = await resComments.json();
        if (commentResult.data) setLocalComments(commentResult.data);

        const resVersions = await fetch(
          `http://localhost:4000/api/books/get-versions?chapterId=${formData.currentChapterId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
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
  }, [formData.currentChapterId, formData.bookId]);

  const handleSelectVersion = (version: any) => {
    if (version === "sekarang") {
      setSelectedVersionId("sekarang");
      setSavedContent(mainChapterContent);
    } else {
      setSelectedVersionId(version.id);
      setSavedContent(version.content);
    }
    setActiveFeature(null); // Tutup dropdown setelah pilih
  };

  const handleSaveVersion = async () => {
    const token = localStorage.getItem("token");
    if (!formData.currentChapterId) {
      alert("Pilih bab terlebih dahulu!");
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
          body: JSON.stringify({ chapterId: formData.currentChapterId }),
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

  const handleTextSelection = () => {
    if (selectedVersionId !== "sekarang") return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      setShowCommentInput(true);
    }
  };

  const addComment = async () => {
    const token = localStorage.getItem("token");
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

      const activeRef = isZenMode ? zenContentRef : contentRef;
      const updatedHtml = activeRef.current?.innerHTML || savedContent;

      const res = await fetch("http://localhost:4000/api/books/save-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapterId: formData.currentChapterId,
          highlight_id: highlightId,
          selected_text: selectedText,
          comment_text: commentText, // <--- Sekarang mengirim isi komentar
          label: commentLabel,
          currentContent: updatedHtml,
        }),
      });

      if (res.ok) {
        setShowCommentInput(false);
        setSelectedText("");
        setCommentText(""); // <--- Reset input setelah simpan
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
      setActiveFeature(null); // Tutup dropdown setelah scroll
    }
  };

  const handleDeleteComment = async (comment: any) => {
    const token = localStorage.getItem("token");
    if (!confirm("Hapus catatan ini?")) return;

    const element = document.getElementById(comment.highlight_id);
    if (element) element.replaceWith(element.innerText);

    const activeRef = isZenMode ? zenContentRef : contentRef;
    const cleanedHtml = activeRef.current?.innerHTML || "";

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
            chapterId: formData.currentChapterId,
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

  return (
    <div
      className={`space-y-8 transition-all duration-500 overflow-x-hidden ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-4 md:p-12 overflow-y-auto" : ""}`}
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
                {/* Label Selector */}
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

                {/* Textarea Catatan */}
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
        className={`${isZenMode ? "max-w-[1200px] mx-auto" : ""} flex justify-between items-center border-b-2 border-slate-100 pb-4`}
      >
        <h4 className="font-black uppercase tracking-tighter text-black italic text-lg">
          {isZenMode ? "📝 Zen Review Mode" : "4. Mode Revisi & Catatan"}
        </h4>
        <div className="flex gap-3">
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="text-[10px] font-black bg-black text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all uppercase shadow-xl active:scale-95"
          >
            {isZenMode ? "Keluar Mode Fokus" : "Mode Fokus 🧘‍♂️"}
          </button>
          {!isZenMode && (
            <button
              onClick={handleSaveVersion}
              className="text-[10px] font-black bg-orange-500 text-white px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all uppercase shadow-xl active:scale-95"
            >
              Simpan v.Next
            </button>
          )}
        </div>
      </div>

      <div
        className={`${isZenMode ? "max-w-[1200px] mx-auto" : "space-y-6"} relative`}
      >
        {/* FITUR TABS - DROPDOWN CARD TRIGGER */}
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

        {/* DROPDOWN CARD CONTENT (OVERLAY) */}
        <AnimatePresence>
          {activeFeature && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 right-0 top-[70px] z-50 px-2 pointer-events-none"
            >
              <div className="max-w-5xl mx-auto pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
                  {/* Header Internal Dropdown */}
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
                      Tutup
                      <span className="group-hover:rotate-90 transition-transform inline-block">
                        ✕
                      </span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-8 bg-white relative">
                    {/* Container Utama dengan Relatif untuk Posisi Panah */}
                    <div className="relative group/container">
                      {/* Wrapper Scroll Horizontal */}
                      <div
                        id="carousel-container"
                        className="flex gap-5 overflow-x-auto pb-6 custom-scrollbar-hide snap-x snap-mandatory scroll-smooth"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        {/* RENDER: KOMENTAR */}
                        {activeFeature === "komentar" &&
                          localComments.map((comment) => (
                            <motion.div
                              whileHover={{ y: -5 }}
                              key={comment.id}
                              className="min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start group relative bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-orange-400 p-5 rounded-[2rem] transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer"
                            >
                              <div
                                onClick={() =>
                                  scrollToHighlight(comment.highlight_id)
                                }
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
                              </div>
                            </motion.div>
                          ))}

                        {/* RENDER: VERSI */}
                        {activeFeature === "versi" && (
                          <>
                            <div
                              onClick={() => handleSelectVersion("sekarang")}
                              className={`min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start group p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer ${
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
                              <h6 className="font-black text-xs uppercase mb-1">
                                DRAFT UTAMA
                              </h6>
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
                                className={`min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start group p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer ${
                                  selectedVersionId === v.id
                                    ? "border-orange-500 bg-orange-50 shadow-lg"
                                    : "border-slate-100 bg-slate-50 hover:border-orange-200"
                                }`}
                              >
                                <div className="flex justify-between items-center mb-4 text-slate-400 group-hover:text-orange-500 transition-colors">
                                  <span className="text-[18px]">📜</span>
                                  <span className="text-[8px] font-black uppercase tracking-widest italic">
                                    {new Date(v.createdAt).toLocaleDateString(
                                      "id-ID",
                                    )}
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
                              className="min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start relative overflow-hidden bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:border-orange-200 transition-all duration-500 group"
                            >
                              <div className="absolute top-0 right-0 w-20 h-20 p-2 opacity-20 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110 overflow-hidden rounded-bl-[2rem]">
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
                                      {char.umur}{" "}
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
                              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-transparent w-0 group-hover:w-full transition-all duration-700" />
                            </div>
                          ))}
                      </div>

                      {/* Navigasi Panah (Hanya muncul jika item banyak) */}
                      {((activeFeature === "komentar" &&
                        localComments.length > 3) ||
                        (activeFeature === "versi" &&
                          localVersions.length > 2) ||
                        (activeFeature === "qc" && characters.length > 3)) && (
                        <>
                          {/* PANAH KIRI */}
                          <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex items-center z-10">
                            <button
                              onClick={() =>
                                document
                                  .getElementById("carousel-container")
                                  ?.scrollBy({ left: -400, behavior: "smooth" })
                              }
                              className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-2xl hover:bg-orange-500 hover:scale-110 transition-all active:scale-95 group/btn"
                            >
                              <span className="text-xl font-black group-hover:-translate-x-0.5 transition-transform">
                                ←
                              </span>
                            </button>
                            <div className="w-12 h-24 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
                          </div>

                          {/* PANAH KANAN */}
                          <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center z-10">
                            <div className="w-12 h-24 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
                            <button
                              onClick={() =>
                                document
                                  .getElementById("carousel-container")
                                  ?.scrollBy({ left: 400, behavior: "smooth" })
                              }
                              className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-2xl hover:bg-orange-500 hover:scale-110 transition-all active:scale-95 group/btn"
                            >
                              <span className="text-xl font-black group-hover:translate-x-0.5 transition-transform">
                                →
                              </span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AREA KERTAS */}
        <div className="border-2 border-slate-200 rounded-3xl overflow-hidden bg-slate-400 shadow-inner relative z-10">
          {loading && (
            <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-black rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Memuat Naskah Revisi...
              </p>
            </div>
          )}

          <div className="w-full bg-slate-50 px-6 py-4 border-b-2 border-slate-100 flex flex-wrap items-center gap-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border-2 border-slate-200 shadow-sm">
              <span
                className={`w-2 h-2 rounded-full ${selectedVersionId === "sekarang" ? "bg-green-500" : "bg-yellow-500"}`}
              />
              <span className="text-[10px] font-black text-black uppercase tracking-widest">
                {selectedVersionId === "sekarang"
                  ? "Draft Aktif"
                  : "Review Arsip"}
              </span>
            </div>
            <div className="flex-1 min-w-[20px]" />
            <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full shadow-lg">
              <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">
                {selectedVersionId === "sekarang" ? "v.Sekarang" : "v.Arsip"}
              </span>
            </div>
          </div>

          <div
            className="w-full overflow-x-hidden overflow-y-auto p-4 md:p-12 custom-scrollbar bg-slate-400"
            style={{ height: isZenMode ? "calc(100vh - 180px)" : "750px" }}
          >
            <div className="paper-zoom-wrapper">
              <div
                id="paper-revisi"
                ref={isZenMode ? zenContentRef : contentRef}
                onMouseUp={handleTextSelection}
                className="bg-white shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-[2.54cm] w-[210mm] outline-none text-black font-serif prose prose-slate max-w-none block a4-multi-page-shadow"
                style={{
                  fontSize: "12pt",
                  lineHeight: "1.6",
                  color: "black",
                  wordBreak: "normal",
                  whiteSpace: "pre-wrap",
                  textAlign: "justify",
                  minHeight: "297mm",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .paper-zoom-wrapper {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          min-height: 100%;
          padding-bottom: 50mm;
        }

        .a4-multi-page-shadow {
          width: 210mm;
          transform-origin: top center;
          background: white;
          background-image: linear-gradient(
            to bottom,
            transparent 297mm,
            #94a3b8 297mm,
            #94a3b8 307mm,
            transparent 307mm
          );
          background-size: 100% 307mm;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
          position: relative;
        }

        .a4-multi-page-shadow::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          background-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.02) 296mm,
            rgba(0, 0, 0, 0.1) 297mm,
            transparent 297mm
          );
          background-size: 100% 307mm;
        }

        @media (max-width: 1300px) {
          .a4-multi-page-shadow {
            transform: scale(0.9);
          }
        }
        @media (max-width: 1100px) {
          .a4-multi-page-shadow {
            transform: scale(0.8);
          }
        }
        @media (max-width: 950px) {
          .a4-multi-page-shadow {
            transform: scale(0.7);
          }
        }
        @media (max-width: 800px) {
          .a4-multi-page-shadow {
            transform: scale(0.6);
          }
        }
        @media (max-width: 650px) {
          .a4-multi-page-shadow {
            transform: scale(0.5);
          }
        }

        .prose p {
          color: black !important;
          line-height: 1.6;
          margin-bottom: 1.5em;
          font-size: 12pt;
          text-align: justify;
        }

  .custom-scrollbar-hide::-webkit-scrollbar { 
    display: none; 
  }
  .custom-scrollbar-hide { 
    -ms-overflow-style: none; 
    scrollbar-width: none; 
  }

  /* CSS Paper/Naskah Anda yang lain */
  .paper-zoom-wrapper { ... }
  .a4-multi-page-shadow { ... }
        
      `}</style>
    </div>
  );
}
