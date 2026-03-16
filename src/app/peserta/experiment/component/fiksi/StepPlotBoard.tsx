"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Edit3,
  Trash2,
  Info,
  X,
  Save,
  Plus,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  Zap,
  Settings,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface SceneCard {
  id: string;
  bookId: number;
  title: string;
  act: string;
  chapterNum: string;
  sequenceNum: string;
  location: string;
  time: string;
  characters: string;
  summary: string;
  conflict: string;
  function: string;
  prevScene: string;
  nextScene: string;
  status: "Ide" | "Draft" | "Selesai";
  labelColor: string;
}

export default function StepPlotBoard({ formData, onDataChange }: any) {
  const [scenes, setScenes] = useState<SceneCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<SceneCard | null>(null);
  const [loading, setLoading] = useState(false);

  // Ref untuk menyimpan elemen scroll tiap babak
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const bookId = formData?.id || formData?.bookId;

  const [newScene, setNewScene] = useState<Partial<SceneCard>>({
    title: "",
    act: "Babak 1: Pengenalan",
    chapterNum: "",
    sequenceNum: "",
    location: "",
    time: "",
    characters: "",
    summary: "",
    conflict: "",
    function: "Membangun konflik",
    prevScene: "",
    nextScene: "",
    status: "Ide",
    labelColor: "#f43f5e",
  });

  const fetchPlots = async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/books/plots/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedData = res.data.map((item: any) => ({
        ...item,
        id: item.id.toString(),
        function: item.sceneFunction || item.function || "Membangun konflik",
      }));
      setScenes(mappedData);
    } catch (err) {
      console.error("Gagal memuat adegan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, [bookId]);

  useEffect(() => {
    onDataChange({ ...formData, plotBase: scenes });
  }, [scenes]);

  // LOGIKA MOUSE DRAG SCROLL
  const handleMouseDown = (act: string, e: React.MouseEvent) => {
    const slider = scrollRefs.current[act];
    if (!slider) return;

    const startX = e.pageX - slider.offsetLeft;
    const scrollLeft = slider.scrollLeft;
    let isDown = true;

    slider.classList.add("cursor-grabbing");

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDown) return;
      moveEvent.preventDefault();
      const x = moveEvent.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Kecepatan scroll
      slider.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      isDown = false;
      slider.classList.remove("cursor-grabbing");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleSave = async () => {
    if (!newScene.title) return alert("Judul Adegan wajib diisi");
    if (!bookId) return alert("ID Buku tidak ditemukan");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...newScene,
        bookId: Number(bookId),
        sceneFunction: newScene.function,
      };

      if (editingId) {
        await axios.patch(`${API_BASE_URL}/books/plots/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_BASE_URL}/books/plots`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setIsAdding(false);
      resetForm();
      fetchPlots();
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus kartu adegan ini secara permanen?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/books/plots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlots();
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  const handleEdit = (e: React.MouseEvent, scene: SceneCard) => {
    e.stopPropagation();
    setEditingId(scene.id);
    setNewScene(scene);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setNewScene({
      title: "",
      act: "Babak 1: Pengenalan",
      chapterNum: "",
      sequenceNum: "",
      location: "",
      time: "",
      characters: "",
      summary: "",
      conflict: "",
      function: "Membangun konflik",
      prevScene: "",
      nextScene: "",
      status: "Ide",
      labelColor: "#f43f5e",
    });
    setEditingId(null);
  };

  const acts = [
    "Babak 1: Pengenalan",
    "Babak 2: Konflik Meningkat",
    "Babak 3: Klimaks",
    "Babak 4: Resolusi",
  ];

  const functions = [
    "Memperkenalkan karakter",
    "Membangun konflik",
    "Memberi informasi penting",
    "Mengembangkan hubungan",
    "Twist / Kejutan",
    "Transisi",
  ];

  return (
    <div className="space-y-6 px-1 md:px-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-orange-500 to-rose-600 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-md gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white shrink-0">
            🎞️
          </div>
          <div className="text-left">
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">
              Story Board
            </h3>
            <p className="text-[9px] md:text-[10px] font-bold text-orange-100 uppercase opacity-80 leading-tight">
              Rancang alur adegan secara visual
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
            isAdding
              ? "bg-white text-rose-600 shadow-rose-200"
              : "bg-white text-orange-400 shadow-orange-900/20"
          }`}
        >
          {isAdding ? (
            <>
              <X size={14} /> Batal
            </>
          ) : (
            <>
              <Plus size={14} /> Kartu Adegan
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-orange-100 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 lg:p-8 shadow-xl space-y-6">
              <h4 className="text-[10px] md:text-xs font-black text-orange-600 uppercase tracking-widest px-1 text-left">
                {editingId ? "📝 Edit Kartu Adegan" : "✨ Adegan Baru"}
              </h4>
              {/* Form content (sama seperti sebelumnya) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 text-left">
                  <InputGroup label="Judul Adegan">
                    <input
                      type="text"
                      value={newScene.title}
                      onChange={(e) =>
                        setNewScene({ ...newScene, title: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold text-slate-900"
                      placeholder="Judul..."
                    />
                  </InputGroup>
                  <div className="grid grid-cols-2 gap-3">
                    <MiniInput
                      label="Bab ke-"
                      value={newScene.chapterNum}
                      onChange={(v: any) =>
                        setNewScene({ ...newScene, chapterNum: v })
                      }
                    />
                    <MiniInput
                      label="Urutan"
                      value={newScene.sequenceNum}
                      onChange={(v: any) =>
                        setNewScene({ ...newScene, sequenceNum: v })
                      }
                    />
                  </div>
                </div>
                <InputGroup label="Posisi Babak">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                    {acts.map((act) => (
                      <button
                        key={act}
                        onClick={() => setNewScene({ ...newScene, act: act })}
                        className={`px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase border-2 text-left transition-all ${newScene.act === act ? "bg-orange-500 border-orange-500 text-white shadow-md" : "bg-white border-slate-100 text-slate-400"}`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </InputGroup>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 text-left">
                <div className="md:col-span-2 space-y-4">
                  <InputGroup label="Ringkasan">
                    <textarea
                      value={newScene.summary}
                      onChange={(e) =>
                        setNewScene({ ...newScene, summary: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-orange-500 outline-none text-xs font-bold text-slate-900 h-24 sm:h-32 resize-none shadow-inner"
                    />
                  </InputGroup>
                  <InputGroup label="Konflik Utama">
                    <input
                      type="text"
                      value={newScene.conflict}
                      onChange={(e) =>
                        setNewScene({ ...newScene, conflict: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-rose-500 outline-none text-xs font-bold text-slate-900"
                    />
                  </InputGroup>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                  <MiniInput
                    label="Lokasi"
                    value={newScene.location}
                    onChange={(v: any) =>
                      setNewScene({ ...newScene, location: v })
                    }
                  />
                  <MiniInput
                    label="Waktu"
                    value={newScene.time}
                    onChange={(v: any) => setNewScene({ ...newScene, time: v })}
                  />
                  <MiniInput
                    label="Karakter"
                    value={newScene.characters}
                    onChange={(v: any) =>
                      setNewScene({ ...newScene, characters: v })
                    }
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                className="w-full py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} /> Simpan Adegan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY STORYBOARD */}
      <div className="space-y-10">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em] text-xs">
            Syncing Storyboard...
          </div>
        ) : (
          acts.map((actName) => (
            <div key={actName} className="space-y-4 text-left">
              <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 px-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>{" "}
                {actName}
              </h4>

              {/* CONTAINER DRAG SCROLL */}
              <div
                ref={(el) => {
                  scrollRefs.current[actName] = el;
                }}
                onMouseDown={(e) => handleMouseDown(actName, e)}
                className="flex overflow-x-auto pb-4 gap-5 custom-scrollbar-hidden snap-x snap-mandatory select-none cursor-grab active:cursor-grabbing"
              >
                {scenes.filter((s) => s.act === actName).length === 0 ? (
                  <div className="w-full py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      Belum ada adegan
                    </p>
                  </div>
                ) : (
                  scenes
                    .filter((s) => s.act === actName)
                    .map((scene) => (
                      <motion.div
                        layout
                        key={scene.id}
                        onClick={() => setSelectedScene(scene)}
                        className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden hover:border-orange-300 transition-all shadow-sm group relative cursor-pointer snap-start"
                      >
                        <div
                          className="h-2 w-full"
                          style={{ backgroundColor: scene.labelColor }}
                        />
                        <div className="p-4 md:p-5 space-y-3 pointer-events-none">
                          {" "}
                          {/* Disable text select inside card while dragging */}
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-tighter truncate">
                              Bab {scene.chapterNum} • Seq {scene.sequenceNum}
                            </span>
                            <span
                              className={`text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${scene.status === "Selesai" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}
                            >
                              {scene.status}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase leading-tight line-clamp-2 min-h-[2.4em]">
                            {scene.title}
                          </h4>
                          <div className="bg-slate-50 p-3 rounded-xl shadow-inner">
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-500 line-clamp-3 leading-relaxed italic">
                              "{scene.summary}"
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-[7px] md:text-[8px] font-black bg-rose-50 text-rose-500 px-2 py-1 rounded-md uppercase">
                              ⚡ {scene.conflict}
                            </span>
                          </div>
                        </div>
                        {/* Floating Buttons tetap interaktif */}
                        <div className="absolute top-4 right-3 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(e, scene);
                            }}
                            className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md pointer-events-auto"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(e, scene.id);
                            }}
                            className="w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md pointer-events-auto"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL (Sama seperti sebelumnya) */}
      <AnimatePresence>
        {selectedScene && (
          <div className="fixed inset-0 bg-slate-900/70 z-[110] flex items-center justify-center p-3 md:p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative border-[3px] md:border-4 border-orange-100 flex flex-col max-h-[92vh]"
            >
              <div
                className="h-3 md:h-4 w-full shrink-0"
                style={{ backgroundColor: selectedScene.labelColor }}
              />
              <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar flex-1 text-left">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div className="min-w-0 text-left">
                    <span className="text-[8px] md:text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">
                      {selectedScene.act}
                    </span>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                      {selectedScene.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedScene(null)}
                    className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <section>
                      <h5 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 text-left">
                        <Info size={14} className="text-orange-500" /> Ringkasan
                        Adegan
                      </h5>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                        <p className="text-xs md:text-sm font-medium text-slate-600 leading-relaxed italic">
                          "{selectedScene.summary}"
                        </p>
                      </div>
                    </section>
                  </div>
                  <div className="bg-orange-50/50 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 space-y-4">
                    <DetailRow
                      icon={<MapPin size={14} />}
                      label="Lokasi"
                      value={selectedScene.location}
                    />
                    <DetailRow
                      icon={<Clock size={14} />}
                      label="Waktu"
                      value={selectedScene.time}
                    />
                    <DetailRow
                      icon={<Users size={14} />}
                      label="Karakter"
                      value={selectedScene.characters}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-6 border-t bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={(e) => handleEdit(e, selectedScene)}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
                >
                  Edit Adegan
                </button>
                <button
                  onClick={() => setSelectedScene(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-slate-200 text-slate-400 rounded-xl font-black text-[10px] uppercase hover:bg-slate-100 transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .cursor-grab {
          cursor: grab;
        }
        .cursor-grabbing {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function DetailRow({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3 min-w-0 text-left">
      <div className="text-orange-500 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase leading-none mb-1">
          {label}
        </p>
        <p className="text-[10px] md:text-xs font-bold text-slate-700 truncate">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function InputGroup({ label, children }: any) {
  return (
    <div className="space-y-1.5 w-full text-left">
      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function MiniInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1 w-full text-left">
      <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase pl-1">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:border-orange-400 outline-none transition-all shadow-sm"
      />
    </div>
  );
}
  