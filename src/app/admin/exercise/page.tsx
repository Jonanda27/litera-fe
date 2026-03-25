"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { ExModuleItem } from "@/components/exercise/ExModuleItem";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  UploadCloud,
  Film,
  BookOpen,
  Loader2,
  CheckCircle2,
  Layers,
  Plus,
  ClipboardCheck,
  PlusCircle,
  Layout,
  Info,
  Target,
  FileText,
  Save,
  HelpCircle,
  Link as LinkIcon,
} from "lucide-react";
import { API_BASE_URL, SOCKET_API_BASE_URL } from "@/lib/constans/constans";
import { ContentPreview } from "./component/ContentPreview";
import { EvaluationForm } from "./component/EvaluationForm";
import { LessonData, LevelData, Question } from "@/lib/types/exercise";
import { CreateLessonModal } from "./component/CreateLessonModal";

export default function ExercisePage() {
  const [view, setView] = useState<"list" | "edit">("list");
  const [selectedLesson, setSelectedLesson] = useState<{
    id: number;
    title: string;
    type: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLessonData, setNewLessonData] = useState({
    title: "",
    type: "pdf",
  });
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileSize, setFileSize] = useState<string>("0 KB");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/exercise/levels-stats`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        const sorted = result.data.sort((a: any, b: any) => a.id - b.id);
        setLevels(sorted);
        if (result.data.length > 0 && !selectedLevelId)
          setSelectedLevelId(result.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLesson = async (lesson: LessonData, category: string) => {
    setSelectedLesson({
      id: lesson.id,
      title: lesson.judul_materi,
      type: category,
    });
    setFileSize("Checking...");

    if (category === "evaluasi") {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/exercise/evaluation/${lesson.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const result = await res.json();
        setQuestions(
          result.success ? result.data.questions : lesson.soal_evaluasi || [],
        );
      } catch (e) {
        setQuestions(lesson.soal_evaluasi || []);
      } finally {
        setIsLoading(false);
      }
      setInputValue("");
      setPreviewUrl(null);
    } else {
      setInputValue(lesson.url_konten || "");
      setupPreview(lesson.url_konten, category);
      setQuestions([]);

      if (category === "book" && lesson.url_konten) {
        try {
          const res = await fetch(
            `${SOCKET_API_BASE_URL}${lesson.url_konten}`,
            { method: "HEAD" },
          );
          const size = res.headers.get("content-length");
          if (size) setFileSize(formatBytes(parseInt(size)));
        } catch (e) {
          setFileSize("Unknown");
        }
      }
    }
    setView("edit");
  };

  const setupPreview = (url: string, type: string) => {
    if (!url) return setPreviewUrl(null);
    if (type === "video") {
      const vId = url.includes("v=")
        ? url.split("v=")[1].split("&")[0]
        : url.split("youtu.be/")[1];
      setPreviewUrl(vId ? `https://www.youtube.com/embed/${vId}` : null);
    } else {
      const base = SOCKET_API_BASE_URL;
      setPreviewUrl(
        url.startsWith("/")
          ? `${base}${url}`
          : url.startsWith("blob:")
            ? url
            : `${base}/uploads/${url}`,
      );
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const processFile = (file: File) => {
    if (file.type !== "application/pdf") return alert("Hanya PDF!");
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setInputValue(file.name);
    setFileSize(formatBytes(file.size));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // --- FUNGSI YANG DICARI ---
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: Date.now(),
      text: "",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      correctAnswer: "A",
    };
    setQuestions([...questions, newQ]);
  };

  const handleSaveContent = async () => {
    if (!selectedLesson?.id) return alert("Pilih materi!");
    setIsSaving(true);
    try {
      let res;
      if (selectedLesson.type === "evaluasi") {
        res = await fetch(`${API_BASE_URL}/admin/exercise/save-evaluation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ lesson_id: selectedLesson.id, questions }),
        });
      } else {
        const fd = new FormData();
        fd.append("lesson_id", selectedLesson.id.toString());
        fd.append(
          "tipe_konten",
          selectedLesson.type === "book" ? "pdf" : selectedLesson.type,
        );
        fd.append("judul_materi", selectedLesson.title);
        const file = fileInputRef.current?.files?.[0];
        if (selectedLesson.type === "book" && file) fd.append("file", file);
        else fd.append("url_konten", inputValue);
        res = await fetch(`${API_BASE_URL}/admin/exercise/save-lesson`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: fd,
        });
      }
      if ((await res.json()).success) {
        alert("Berhasil!");
        fetchLevels();
        setView("list");
      }
    } catch (e) {
      alert("Error!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLesson = async () => {
    const res = await fetch(`${API_BASE_URL}/admin/exercise/create-lesson`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        module_id: selectedModuleId,
        judul_materi: newLessonData.title,
        tipe_konten: newLessonData.type,
      }),
    });
    if ((await res.json()).success) {
      setIsModalOpen(false);
      setNewLessonData({ title: "", type: "pdf" });
      fetchLevels();
    }
  };

  const currentLevel = levels.find((l) => l.id === selectedLevelId);
  const sortedModules = currentLevel?.modules
    ? [...currentLevel.modules].sort((a, b) => a.id - b.id)
    : [];
  const currentModule = sortedModules.find((m) => m.id === selectedModuleId);

  if (isLoading)
    return (
      <Sidebar>
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </Sidebar>
    );

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
        <CreateLessonModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={newLessonData}
          setData={setNewLessonData}
          onSave={handleCreateLesson}
        />

        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight ">
                    Manajemen Modul
                  </h1>
                  <p className="text-slate-500 font-bold text-lg">
                    Kelola materi pembelajaran dengan presisi.
                  </p>
                </div>
                <div className="flex gap-2 p-2 bg-slate-100 rounded-[2rem] border shadow-inner">
                  {levels.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        setSelectedLevelId(lvl.id);
                        setSelectedModuleId(null);
                      }}
                      className={`px-6 py-3 rounded-[1.5rem] font-black text-xs uppercase transition-all ${selectedLevelId === lvl.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Level {lvl.id}
                    </button>
                  ))}
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {sortedModules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`p-6 rounded-[2.5rem] border-2 text-left transition-all ${selectedModuleId === mod.id ? "border-blue-500 bg-blue-50 shadow-lg" : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"}`}
                  >
                    <Layers
                      className={
                        selectedModuleId === mod.id
                          ? "text-blue-600"
                          : "text-slate-300"
                      }
                    />
                    <h3 className="font-black text-slate-800 uppercase text-sm mt-4">
                      {mod.nama_modul}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                      {mod.lessons.length} Materi
                    </p>
                  </button>
                ))}
              </div>

              {selectedModuleId && (
                <div className="bg-white rounded-[3.5rem] p-12 border-2 relative space-y-12 shadow-sm border-slate-100">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-10 right-12 bg-blue-600 text-white px-8 py-4 rounded-full font-black text-xs uppercase shadow-xl hover:bg-black transition-all flex items-center gap-2"
                  >
                    <Plus size={18} /> Tambah Materi
                  </button>
                  <Section
                    title="Reading Materials"
                    icon={<BookOpen size={16} />}
                    color="text-amber-600"
                    lessons={
                      currentModule?.lessons.filter(
                        (l) =>
                          l.tipe_konten === "pdf" || l.tipe_konten === "bacaan",
                      ) || []
                    }
                    type="book"
                    onEdit={handleEditLesson}
                  />
                  <Section
                    title="Video Lessons"
                    icon={<Film size={16} />}
                    color="text-blue-600"
                    lessons={
                      currentModule?.lessons.filter(
                        (l) => l.tipe_konten === "video",
                      ) || []
                    }
                    type="video"
                    onEdit={handleEditLesson}
                  />
                  <Section
                    title="Evaluasi & Tugas"
                    icon={<ClipboardCheck size={16} />}
                    color="text-emerald-600"
                    lessons={
                      currentModule?.lessons.filter(
                        (l) => l.tipe_konten === "evaluasi",
                      ) || []
                    }
                    type="evaluasi"
                    onEdit={handleEditLesson}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-3 text-slate-400 font-black text-xs uppercase hover:text-black group transition-all"
              >
                <div className="p-2.5 bg-white border rounded-full group-hover:bg-slate-50 shadow-sm">
                  <ArrowLeft size={18} />
                </div>{" "}
                Kembali ke Dashboard
              </button>

              <div className="bg-[#f8fafc] rounded-[4rem] border-2 border-slate-200/50 shadow-2xl overflow-hidden grid lg:grid-cols-7 min-h-[850px]">
                <div className="lg:col-span-2 p-12 bg-white border-r border-slate-100 flex flex-col justify-between">
                  <div className="space-y-12">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                        {selectedLesson?.title}
                      </h2>
                      <div className="h-1.5 w-20 bg-blue-600 rounded-full"></div>
                    </div>

                    <div className="space-y-8">
                      <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 space-y-6">
                        <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-widest">
                          <Info size={18} /> Detail Materi
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                            <span>
                              {selectedLesson?.type === "book"
                                ? "Size PDF:"
                                : "Total Item:"}
                            </span>
                            <span className="bg-white px-4 py-1 rounded-full border shadow-sm text-blue-600 font-black">
                              {selectedLesson?.type === "evaluasi"
                                ? questions.length
                                : selectedLesson?.type === "book"
                                  ? fileSize
                                  : "1 File"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                            <span>Format:</span>
                            <span className="uppercase text-slate-900 font-black">
                              {selectedLesson?.type === "book"
                                ? "PDF Document"
                                : selectedLesson?.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedLesson?.type === "evaluasi" ? (
                        <div className="space-y-5">
                          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                            <p className="text-[11px] font-bold text-amber-700 leading-relaxed ">
                              "Tip: Pastikan setiap pertanyaan memiliki satu
                              kunci jawaban yang benar untuk penilaian
                              otomatis."
                            </p>
                          </div>
                          <button
                            onClick={handleAddQuestion}
                            className="w-full py-6 bg-white border-4 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black text-xs uppercase flex items-center justify-center gap-3 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all group active:scale-95"
                          >
                            <PlusCircle
                              size={24}
                              className="group-hover:rotate-90 transition-transform"
                            />{" "}
                            Tambah Pertanyaan
                          </button>
                        </div>
                      ) : selectedLesson?.type === "book" ? (
                        <div className="space-y-4">
                          <label className="text-[11px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                            Upload & Drag File
                          </label>
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full h-56 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group
                                ${isDragging ? "border-blue-500 bg-blue-100 scale-105" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300"}`}
                          >
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <UploadCloud
                              className={`transition-all duration-500 mb-3 ${isDragging ? "text-blue-600 scale-125" : "text-slate-300 group-hover:text-blue-400"}`}
                              size={48}
                            />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors text-center px-4">
                              {inputValue
                                ? `File: ${inputValue}`
                                : "Klik atau Tarik PDF ke sini"}
                            </span>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept=".pdf"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) processFile(f);
                              }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-tighter">
                            Support: PDF Only (Max 10MB)
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                              YouTube URL
                            </label>
                            <div className="relative">
                              <LinkIcon
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                                size={18}
                              />
                              <input
                                type="text"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-5 font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none shadow-inner"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                              />
                            </div>
                            <button
                              onClick={() => setupPreview(inputValue, "video")}
                              className="w-full mt-2 bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                            >
                              Generate Preview
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-12">
                    <button
                      onClick={handleSaveContent}
                      disabled={isSaving}
                      className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:translate-y-0"
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}{" "}
                      {isSaving ? "Syncing..." : "Sync & Publish Changes"}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#fdfdfd] p-12 overflow-y-auto max-h-[850px] scroll-smooth">
                  {selectedLesson?.type === "evaluasi" ? (
                    <EvaluationForm
                      questions={questions}
                      setQuestions={setQuestions}
                    />
                  ) : (
                    <div className="h-full min-h-[600px] bg-white rounded-[4rem] border-2 border-slate-100 shadow-xl overflow-hidden relative">
                      <ContentPreview
                        previewUrl={previewUrl}
                        selectedLessonType={selectedLesson?.type}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Sidebar>
  );
}

function Section({ title, icon, color, lessons, type, onEdit }: any) {
  return (
    <div className="space-y-8">
      <div
        className={`flex items-center gap-3 font-black uppercase tracking-[0.3em] text-[11px] ${color}`}
      >
        <div className="p-3 bg-white rounded-2xl border shadow-sm flex items-center justify-center">
          {icon}
        </div>{" "}
        {title}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {lessons.length > 0 ? (
          lessons.map((lesson: any) => (
            <div
              key={lesson.id}
              onClick={() => onEdit(lesson, type)}
              className="cursor-pointer transform hover:-translate-y-3 transition-all duration-300"
            >
              <ExModuleItem
                title={lesson.judul_materi}
                type={type === "evaluasi" ? "book" : type}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 border-4 border-dashed border-slate-50 rounded-[3rem] flex flex-col items-center justify-center">
            <Layers className="text-slate-100 mb-2" size={48} />
            <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
              Empty Category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
