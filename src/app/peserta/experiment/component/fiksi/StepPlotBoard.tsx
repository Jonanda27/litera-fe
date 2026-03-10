"use client";

import { useState, useEffect } from "react";
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
  function: string; // Properti di FE
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

  const bookId = formData?.id || formData?.bookId;

  // State Form Adegan Baru
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

  // 1. FETCH DATA DARI DATABASE
  const fetchPlots = async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:4000/api/books/plots/${bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // PERBAIKAN: Mapping dari sceneFunction (DB) kembali ke function (FE)
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

  // 2. HANDLE SAVE (CREATE & UPDATE)
  const handleSave = async () => {
    if (!newScene.title) return alert("Judul Adegan wajib diisi");
    if (!bookId) return alert("ID Buku tidak ditemukan");

    try {
      const token = localStorage.getItem("token");

      // PERBAIKAN: Memetakan properti 'function' ke 'sceneFunction' agar sesuai dengan model Backend
      const payload = {
        ...newScene,
        bookId: Number(bookId),
        sceneFunction: newScene.function, // Kirim sebagai sceneFunction ke BE
      };

      if (editingId) {
        // UPDATE
        await axios.patch(
          `http://localhost:4000/api/books/plots/${editingId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        // CREATE
        await axios.post(`http://localhost:4000/api/books/plots`, payload, {
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

  // 3. HANDLE DELETE
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus kartu adegan ini secara permanen?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/books/plots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlots();
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  // 4. HANDLE EDIT CLICK
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
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-gradient-to-r from-orange-500 to-rose-600 p-5 rounded-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white">
            🎞️
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Story Board
            </h3>
            <p className="text-[10px] font-bold text-orange-100 uppercase opacity-80">
              Rancang alur emosi dan konflik per adegan
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 ${
            isAdding
              ? "bg-white text-rose-600 shadow-rose-200"
              : "bg-white text-orange-400 shadow-orange-900/20"
          }`}
        >
          {isAdding ? (
            <span className="flex items-center gap-2">
              <X size={14} /> Batal
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus size={14} /> Kartu Adegan
            </span>
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
            <div className="bg-white border-2 border-orange-100 rounded-[2.5rem] p-6 shadow-xl space-y-6">
              <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest px-1">
                {editingId ? "📝 Edit Kartu Adegan" : "✨ Adegan Baru"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InputGroup label="Judul Adegan">
                    <input
                      type="text"
                      value={newScene.title}
                      onChange={(e) =>
                        setNewScene({ ...newScene, title: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold text-slate-900"
                      placeholder="Misal: Pertengkaran di Meja Makan"
                    />
                  </InputGroup>
                  <div className="grid grid-cols-2 gap-3">
                    <MiniInput
                      label="Bab ke-"
                      placeholder="1"
                      value={newScene.chapterNum}
                      onChange={(v: any) =>
                        setNewScene({ ...newScene, chapterNum: v })
                      }
                    />
                    <MiniInput
                      label="Urutan dalam Bab"
                      placeholder="Adegan 1"
                      value={newScene.sequenceNum}
                      onChange={(v: any) =>
                        setNewScene({ ...newScene, sequenceNum: v })
                      }
                    />
                  </div>
                </div>
                <InputGroup label="Posisi Babak">
                  <div className="grid grid-cols-1 gap-2">
                    {acts.map((act) => (
                      <button
                        key={act}
                        onClick={() => setNewScene({ ...newScene, act: act })}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 text-left transition-all ${newScene.act === act ? "bg-orange-500 border-orange-500 text-white shadow-md" : "bg-white border-slate-100 text-slate-400"}`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <div className="md:col-span-2 space-y-4">
                  <InputGroup label="Apa yang Terjadi? (Ringkasan)">
                    <textarea
                      value={newScene.summary}
                      onChange={(e) =>
                        setNewScene({ ...newScene, summary: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-orange-500 outline-none text-xs font-bold text-slate-900 h-24 resize-none shadow-inner"
                      placeholder="Tuliskan aksi utama dalam adegan ini..."
                    />
                  </InputGroup>
                  <InputGroup label="Konflik Utama dalam Adegan">
                    <input
                      type="text"
                      value={newScene.conflict}
                      onChange={(e) =>
                        setNewScene({ ...newScene, conflict: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-rose-500 outline-none text-xs font-bold text-slate-900"
                      placeholder="Apa rintangan yang dihadapi karakter?"
                    />
                  </InputGroup>
                </div>
                <div className="space-y-4">
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
                    label="Karakter yang Hadir"
                    value={newScene.characters}
                    onChange={(v: any) =>
                      setNewScene({ ...newScene, characters: v })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Fungsi Adegan
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {functions.map((f) => (
                      <button
                        key={f}
                        onClick={() =>
                          setNewScene({ ...newScene, function: f })
                        }
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border-2 transition-all ${newScene.function === f ? "bg-slate-900 border-slate-900 text-orange-400" : "bg-white border-slate-100 text-slate-400"}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniInput
                    label="Adegan Sebelumnya"
                    value={newScene.prevScene}
                    onChange={(v: any) =>
                      setNewScene({ ...newScene, prevScene: v })
                    }
                  />
                  <MiniInput
                    label="Adegan Selanjutnya"
                    value={newScene.nextScene}
                    onChange={(v: any) =>
                      setNewScene({ ...newScene, nextScene: v })
                    }
                  />
                  <div className="col-span-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase pl-1">
                      Warna Label
                    </label>
                    <input
                      type="color"
                      value={newScene.labelColor}
                      onChange={(e) =>
                        setNewScene({ ...newScene, labelColor: e.target.value })
                      }
                      className="w-full h-9 rounded-lg border-none bg-transparent cursor-pointer"
                    />
                  </div>
                  {/* Cari bagian dropdown Status di dalam form (isAdding) */}
                  <div className="col-span-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase pl-1">
                      Status
                    </label>
                    <select
                      value={newScene.status}
                      onChange={(e) =>
                        setNewScene({
                          ...newScene,
                          status: e.target.value as any,
                        })
                      }
                      // Tambahkan 'text-black' di sini untuk memastikan warna tulisan hitam
                      className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-black uppercase text-black"
                    >
                      <option className="text-black">Ide</option>
                      <option className="text-black">Draft</option>
                      <option className="text-black">Selesai</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-orange-100 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />{" "}
                {editingId ? "Update Kartu Adegan" : "Simpan Kartu Adegan"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY STORYBOARD GRID */}
      <div className="space-y-8">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em]">
            Syncing Storyboard...
          </div>
        ) : (
          acts.map((actName) => (
            <div key={actName} className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>{" "}
                {actName}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {scenes.filter((s) => s.act === actName).length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      Belum ada adegan di babak ini
                    </p>
                  </div>
                )}
                {scenes
                  .filter((s) => s.act === actName)
                  .map((scene) => (
                    <motion.div
                      layout
                      key={scene.id}
                      onClick={() => setSelectedScene(scene)}
                      className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden hover:border-orange-300 transition-all shadow-sm group relative cursor-pointer"
                    >
                      <div
                        className="h-2 w-full"
                        style={{ backgroundColor: scene.labelColor }}
                      />
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                            Bab {scene.chapterNum} • Seq {scene.sequenceNum}
                          </span>
                          <span
                            className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${scene.status === "Selesai" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}
                          >
                            {scene.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase leading-tight line-clamp-2">
                          {scene.title}
                        </h4>
                        <div className="bg-slate-50 p-3 rounded-2xl shadow-inner">
                          <p className="text-[10px] font-bold text-slate-500 line-clamp-3 leading-relaxed italic">
                            "{scene.summary}"
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-[8px] font-black bg-rose-50 text-rose-500 px-2 py-1 rounded-md uppercase">
                            ⚡ {scene.conflict}
                          </span>
                          <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-md uppercase">
                            📍 {scene.location}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => handleEdit(e, scene)}
                          className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 shadow-lg"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, scene.id)}
                          className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedScene && (
          <div className="fixed inset-0 bg-slate-900/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-orange-100"
            >
              <div
                className="h-4 w-full"
                style={{ backgroundColor: selectedScene.labelColor }}
              />
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-widest">
                      {selectedScene.act}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 uppercase mt-2 tracking-tight">
                      {selectedScene.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                      Bab {selectedScene.chapterNum} • Adegan{" "}
                      {selectedScene.sequenceNum}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedScene(null)}
                    className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <section>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Info size={14} className="text-orange-500" /> Ringkasan
                        Cerita
                      </h5>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                          "{selectedScene.summary}"
                        </p>
                      </div>
                    </section>
                    <section>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap size={14} className="text-rose-500" /> Konflik
                        Utama
                      </h5>
                      <p className="text-sm font-black text-slate-700 ml-6">
                        {selectedScene.conflict}
                      </p>
                    </section>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 space-y-4">
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
                      {/* PERBAIKAN: Menampilkan field function di Detail Modal */}
                      <DetailRow
                        icon={<Settings size={14} />}
                        label="Fungsi"
                        value={selectedScene.function}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
                      <div className="text-center flex-1 border-r border-white/10">
                        <p className="text-[8px] font-black opacity-50 uppercase">
                          Sebelumnya
                        </p>
                        <p className="text-[10px] font-bold truncate px-2">
                          {selectedScene.prevScene || "-"}
                        </p>
                      </div>
                      <ArrowRight className="mx-2 text-orange-400" size={16} />
                      <div className="text-center flex-1">
                        <p className="text-[8px] font-black opacity-50 uppercase">
                          Selanjutnya
                        </p>
                        <p className="text-[10px] font-bold truncate px-2">
                          {selectedScene.nextScene || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={(e) => handleEdit(e, selectedScene)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-black active:scale-95 transition-all"
                >
                  Edit Adegan
                </button>
                <button
                  onClick={() => setSelectedScene(null)}
                  className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-400 rounded-xl font-black text-[10px] uppercase hover:bg-slate-100 transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function DetailRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-orange-500">{icon}</div>
      <div>
        <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">
          {label}
        </p>
        <p className="text-xs font-bold text-slate-700">{value || "-"}</p>
      </div>
    </div>
  );
}

function InputGroup({ label, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function MiniInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase pl-1">
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
