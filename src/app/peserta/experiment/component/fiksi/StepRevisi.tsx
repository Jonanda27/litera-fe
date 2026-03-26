"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Lock,
  User,
  Briefcase,
  Info,
  X,
  Sparkles,
  BookText,
  AlertTriangle,
  SearchCheck,
  Loader2,
  Type,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

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
  const [saveStatus, setSaveStatus] = useState("Safe");

  const [outlines, setOutlines] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  const [savedPages, setSavedPages] = useState<any[]>([]);
  const [mainChapterPages, setMainChapterPages] = useState<any[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFontSize, setSelectedFontSize] = useState("12pt");
  const [selectedChar, setSelectedChar] = useState<any | null>(null);

  const [isScanningConsistency, setIsScanningConsistency] = useState(false);
  const [consistencyReports, setConsistencyReports] = useState<any[]>([]);

  const [selectedVersionId, setSelectedVersionId] = useState<string | number>(
    "sekarang",
  );

  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !formData.bookId) return;

        const res = await fetch(
          `${API_BASE_URL}/books/outlines/${formData.bookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
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

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token || !formData.bookId || !selectedChapter) return;

    try {
      setLoading(true);
      setSaveStatus("Loading...");

      const resContent = await fetch(
        `${API_BASE_URL}/books/get-chapter?bookId=${formData.bookId}&outlineId=${selectedChapter.id}`,
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
        `${API_BASE_URL}/books/characters/${formData.bookId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const charResult = await resChars.json();
      if (charResult) setCharacters(charResult);

      if (pagesData.length > 0) {
        const commentsPromises = pagesData.map((p: any) =>
          fetch(`${API_BASE_URL}/books/get-comments?chapterId=${p.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
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
          `${API_BASE_URL}/books/get-versions?chapterId=${firstPageId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
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

  const handleAIConsistencyCheck = async () => {
    const token = localStorage.getItem("token");
    if (!token || characters.length === 0) return;

    const fullText = editorRefs.current
      .map((ref) => ref?.innerText || "")
      .join("\n");

    if (fullText.trim().length < 50) {
      alert("Naskah terlalu pendek untuk dianalisis.");
      return;
    }

    try {
      setIsScanningConsistency(true);
      setActiveFeature("konsistensi");

      const response = await fetch(
        `${API_BASE_URL}/ai/check-character-consistency`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: fullText,
            characterDatabase: characters,
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        setConsistencyReports(result.data);
      } else {
        console.error("AI Analysis failed");
      }
    } catch (error) {
      console.error("Error AI Scan:", error);
    } finally {
      setIsScanningConsistency(false);
    }
  };

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
      setSaveStatus("Archiving...");
      const res = await fetch(`${API_BASE_URL}/books/save-chapter-version`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chapterId: firstPageId }),
      });

      if (res.ok) {
        alert("Versi baru berhasil diarsipkan!");
        fetchData();
        setActiveFeature("versi");
      }
    } catch (error) {
      console.error("Error saving version:", error);
      setSaveStatus("Error");
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
      setSaveStatus("Commenting...");
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);

      const activeHtmlContent =
        editorRefs.current[currentPage - 1]?.innerHTML || "";

      const res = await fetch(`${API_BASE_URL}/books/save-comment`, {
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
      setSaveStatus("Error");
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
      setSaveStatus("Deleting...");
      const res = await fetch(`${API_BASE_URL}/books/delete-comment`, {
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
      });

      if (res.ok) fetchData();
    } catch (error) {
      console.error("Gagal hapus komentar:", error);
      setSaveStatus("Error");
    }
  };

  const FeatureContent = ({ isVertical = false }) => {
    return (
      <div
        className={`${isVertical ? "space-y-4 px-2" : "flex gap-5 overflow-x-auto pb-6 custom-scrollbar-hide snap-x snap-mandatory scroll-smooth"}`}
        id={!isVertical ? "carousel-container" : ""}
      >
        {activeFeature === "konsistensi" && (
          <div className={`${isVertical ? "w-full" : "flex gap-4 w-full"}`}>
            {isScanningConsistency ? (
              <div className="flex flex-col items-center justify-center p-12 w-full bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <Loader2
                  className="animate-spin text-rose-500 mb-4"
                  size={32}
                />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Editor AI sedang membedah naskah & ejaan...
                </p>
              </div>
            ) : consistencyReports.length > 0 ? (
              consistencyReports.map((report, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${
                    isVertical
                      ? "w-full mb-6"
                      : "min-w-[320px] flex-shrink-0 snap-start"
                  } p-6 border-2 rounded-[2rem] shadow-sm relative group overflow-hidden ${
                    report.type === "typo"
                      ? "bg-blue-50 border-blue-100"
                      : "bg-rose-50 border-rose-100"
                  }`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                    {report.type === "typo" ? (
                      <BookText size={60} className="text-blue-600" />
                    ) : (
                      <AlertTriangle size={60} className="text-rose-600" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                        report.type === "typo" ? "bg-blue-600" : "bg-rose-600"
                      }`}
                    >
                      {report.type === "typo" ? (
                        <Type size={20} />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <h6
                        className={`font-black text-xs uppercase ${
                          report.type === "typo"
                            ? "text-blue-700"
                            : "text-rose-700"
                        }`}
                      >
                        {report.name}
                      </h6>
                      <p
                        className={`text-[8px] font-bold uppercase tracking-widest ${
                          report.type === "typo"
                            ? "text-blue-400"
                            : "text-rose-400"
                        }`}
                      >
                        {report.type === "typo"
                          ? "Saran Ejaan & Typo"
                          : "Inkonsistensi Tokoh"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="bg-white/60 p-3 rounded-xl border border-white/50 shadow-sm">
                      <span
                        className={`text-[8px] font-black uppercase block mb-1 ${
                          report.type === "typo"
                            ? "text-blue-400"
                            : "text-rose-400"
                        }`}
                      >
                        Temuan Editor:
                      </span>
                      <p className="text-[11px] text-slate-700 font-medium leading-relaxed italic">
                        "{report.issue}"
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-xl border shadow-sm ${
                        report.type === "typo"
                          ? "bg-blue-600 text-white border-blue-700"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      <span
                        className={`text-[8px] font-black uppercase block mb-1 ${
                          report.type === "typo"
                            ? "text-blue-200"
                            : "text-emerald-500"
                        }`}
                      >
                        Saran Perbaikan:
                      </span>
                      <p className="text-[11px] font-bold leading-relaxed">
                        {report.fix_suggestion}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 w-full bg-slate-50 rounded-[2.5rem] text-slate-400 border-2 border-dashed border-slate-200">
                <CheckCircle2 className="text-emerald-500 mb-4" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Naskah Luar Biasa!
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 text-center max-w-[250px]">
                  Tidak ditemukan inkonsistensi tokoh maupun kesalahan ejaan
                  (typo) dalam bab ini.
                </p>
              </div>
            )}
          </div>
        )}

        {activeFeature === "komentar" &&
          localComments.map((comment) => (
            <motion.div
              whileHover={{ y: -5 }}
              key={comment.id}
              className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group relative bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-orange-400 p-5 rounded-[2rem] transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer`}
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
                <p className="text-[11px] leading-relaxed font-bold line-clamp-2">
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
                  <span className="text-[8px] font-black uppercase tracking-widest ">
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

        {activeFeature === "qc" &&
          characters.map((char) => (
            <motion.div
              layout
              whileHover={{ y: -5 }}
              key={char.id}
              onClick={() => setSelectedChar(char)}
              className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} bg-white rounded-[2.5rem] border-2 border-slate-100 p-5 group relative hover:border-violet-400 transition-all shadow-sm hover:shadow-xl cursor-pointer`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-violet-100 rounded-[1.5rem] flex items-center justify-center text-2xl overflow-hidden border-2 border-violet-50 shrink-0">
                  {char.imageUrl ? (
                    <img
                      src={char.imageUrl}
                      alt={char.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={30} className="text-violet-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-slate-900 uppercase truncate leading-none mb-1">
                    {char.fullName}
                  </h4>
                  <span className="text-[9px] font-black bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full uppercase">
                    {char.role}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-3">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-slate-300 uppercase">
                    Usia
                  </span>
                  <span className="text-[10px] font-black text-slate-600">
                    {char.age || "-"} Tahun
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[8px] font-bold text-slate-300 uppercase">
                    Sifat Utama
                  </span>
                  <span className="text-[10px] font-black text-slate-600 truncate">
                    {char.goodTraits?.[0] || "-"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    );
  };

  return (
    <div
      className={`space-y-8 transition-all duration-500 overflow-x-hidden ${isZenMode ? "fixed inset-0 z-[100] bg-[#F1F5F9] p-0 flex flex-col h-screen overflow-hidden text-black" : ""}`}
    >
      <AnimatePresence>
        {selectedChar && (
          <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedChar(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all z-10"
              >
                ✕
              </button>

              <div className="grid md:grid-cols-5 h-full">
                <div className="md:col-span-2 bg-violet-600 p-8 flex flex-col items-center text-center text-white">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white/20 border-4 border-white/30 overflow-hidden mb-4 shadow-xl">
                    {selectedChar.imageUrl ? (
                      <img
                        src={selectedChar.imageUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={60} className="m-auto h-full opacity-50" />
                    )}
                  </div>
                  <h3 className="text-xl font-black uppercase leading-tight">
                    {selectedChar.fullName}
                  </h3>
                  <p className="text-xs font-bold text-violet-200 uppercase tracking-widest mt-1 ">
                    "{selectedChar.nickname}"
                  </p>
                  <span className="mt-4 px-4 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase">
                    {selectedChar.role}
                  </span>

                  <div className="mt-8 w-full space-y-3">
                    <div className="flex items-center gap-2 text-left w-full bg-black/10 p-2 rounded-xl">
                      <div className="text-violet-200">
                        <Briefcase size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[7px] uppercase font-black text-violet-300 leading-none">
                          Pekerjaan
                        </p>
                        <p className="text-[10px] font-bold truncate text-white">
                          {selectedChar.job || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 p-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">
                        Biografi & Masa Lalu
                      </h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed ">
                        {selectedChar.past || "Belum ada riwayat masa lalu..."}
                      </p>
                    </section>

                    <section className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">
                          Sifat Baik
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedChar.goodTraits?.map(
                            (t: string, i: number) =>
                              t && (
                                <span
                                  key={i}
                                  className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold"
                                >
                                  #{t.trim()}
                                </span>
                              ),
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">
                          Sifat Buruk
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedChar.badTraits?.map(
                            (t: string, i: number) =>
                              t && (
                                <span
                                  key={i}
                                  className="text-[9px] bg-rose-50 text-rose-600 px-2 py-1 rounded-md font-bold"
                                >
                                  #{t.trim()}
                                </span>
                              ),
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="bg-slate-50 p-4 rounded-2xl">
                      <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Info size={12} /> Perkembangan Arc
                      </h4>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-slate-400 uppercase">
                          Mulai:
                        </span>
                        <p className="font-black text-slate-700">
                          {selectedChar.arcStart || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="font-bold text-slate-400 uppercase">
                          Akhir:
                        </span>
                        <p className="font-black text-fuchsia-600">
                          {selectedChar.arcEnd || "-"}
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <p className="text-xs  text-slate-700 line-clamp-2">
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

      {!isZenMode && (
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative z-[60]">
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block pl-1">
              Navigasi Bab Revisi
            </label>

            <div className="relative w-full max-w-md">
              <select
                value={selectedChapter?.id || ""}
                onChange={(e) => {
                  const found = outlines.find(
                    (o) => o.id.toString() === e.target.value,
                  );
                  if (found) setSelectedChapter(found);
                }}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl hover:border-slate-400 text-slate-800 font-bold text-sm outline-none appearance-none cursor-pointer transition-all pr-12 shadow-inner"
              >
                <option value="" disabled>
                  -- Pilih Bab --
                </option>
                {outlines.map((chap) => (
                  <option key={chap.id} value={chap.id}>
                    Bab {chap.chapter_number}: {chap.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                <div className="w-px h-4 bg-slate-300 mr-1" />
                <ChevronDown className="text-slate-400" size={18} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleAIConsistencyCheck}
              disabled={isScanningConsistency || !selectedChapter}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 border-2 ${
                isScanningConsistency
                  ? "bg-slate-100 text-slate-400 border-slate-200"
                  : "bg-white text-black border-black hover:bg-black hover:text-white shadow-slate-200"
              }`}
            >
              {isScanningConsistency ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <SearchCheck size={16} />
              )}
              {isScanningConsistency ? "Scanning AI..." : "Scan Tokoh AI"}
            </button>

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Status Mode
              </span>
              <span className="text-[11px] font-bold text-slate-800 mt-1 uppercase ">
                Reviewing Bab {selectedChapter?.chapter_number || "?"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${isZenMode ? "px-12 py-6 border-b bg-white" : "flex justify-between items-center border-b-2 border-slate-100 pb-4 max-w-[1200px] mx-auto"} flex justify-between items-center gap-4 flex-wrap`}
      >
        <div className="flex items-center gap-4">
          <h4 className="font-black uppercase tracking-tighter text-black  text-lg">
            {isZenMode ? "📝 Mode Fokus" : ""}
          </h4>
        </div>

        <div className="flex gap-3 items-center">
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
        className={`${isZenMode ? "flex flex-1 overflow-hidden" : "space-y-6 relative"}`}
      >
        {!isZenMode ? (
          <div className="max-w-[1200px] mx-auto flex border-2 border-slate-100 bg-white p-2 gap-2 rounded-2xl shadow-sm relative z-30">
            {[
              {
                id: "komentar",
                label: `Catatan (${localComments.length})`,
                icon: "💬",
              },
              { id: "versi", label: "Versi", icon: "📜" },
              { id: "qc", label: "QC Tokoh", icon: "👤" },
              { id: "konsistensi", label: "Cek AI", icon: "🤖" },
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
          <div className="w-16 bg-white border-r flex flex-col items-center py-6 gap-6 z-20">
            {[
              { id: "komentar", icon: "💬" },
              { id: "versi", icon: "📜" },
              { id: "qc", icon: "👤" },
              { id: "konsistensi", icon: "🤖" },
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
                      <span className="p-2 bg-slate-800 rounded-xl text-white shadow-lg">
                        {activeFeature === "komentar"
                          ? "💬"
                          : activeFeature === "versi"
                            ? "📜"
                            : activeFeature === "qc"
                              ? "👤"
                              : "🤖"}
                      </span>
                      <div>
                        <h5 className="font-black text-[12px] uppercase text-slate-800 tracking-[0.15em]">
                          {activeFeature === "komentar"
                            ? "Daftar Catatan Revisi"
                            : activeFeature === "versi"
                              ? "Riwayat Versi"
                              : activeFeature === "qc"
                                ? "Database Karakter"
                                : "Analisis Konsistensi AI"}
                        </h5>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          Review & Sync Panel
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

        <div
          className={`flex-1 overflow-y-auto bg-slate-400 p-8 ${isZenMode ? "scrollbar-thin scrollbar-thumb-slate-500" : ""}`}
        >
          {/* PENTING: ID "paper-revisi" ditambahkan di pembungkus ini agar toPng bisa mengambil semua halaman sekaligus */}
          <div
            id="paper-revisi"
            className={`mx-auto flex flex-col items-center gap-8 bg-slate-400 ${isZenMode ? "max-w-[1000px]" : "w-full"}`}
          >
            {!selectedChapter ? (
              <div className="bg-white/80 backdrop-blur-md border-4 border-dashed border-white rounded-[3rem] p-20 flex flex-col items-center justify-center text-slate-500 shadow-2xl">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 text-slate-200">
                  <Lock size={40} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter">
                  Review Terkunci
                </h3>
                <p className="font-bold  mt-2">
                  Silahkan pilih bab pada dropdown navigasi untuk meninjau
                  revisi.
                </p>
              </div>
            ) : (
              <>
                {loading && (
                  <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm rounded-[3rem]">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-black rounded-full animate-spin mb-4"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                      Memproses Naskah Bab...
                    </p>
                  </div>
                )}

                {Array.from({ length: pageCount }).map((_, index) => (
                  <div key={`page-${index}`} className="relative group">
                    <div
                      className={`absolute -left-16 top-10 font-black text-4xl transition-all ${currentPage === index + 1 ? "text-slate-900 opacity-100 scale-110" : "text-slate-200 opacity-30"}`}
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
              </>
            )}
          </div>
        </div>

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
                        : activeFeature === "qc"
                          ? "Database Tokoh"
                          : "Analisis AI"}
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