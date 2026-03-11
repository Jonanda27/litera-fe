"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "@/lib/constans/constans";

interface IdeaItem {
  id: string;
  bookId: number;
  title: string;
  date: string;
  time?: string;
  category_tag: string;
  description: string;
  mood: string;
  reference: string;
  priority: "Segera" | "Nanti" | "Arsip";
  createdAt?: string;
}

export default function StepIdeCepat({ formData, onDataChange }: any) {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // State untuk mode Edit
  const [selectedIdea, setSelectedIdea] = useState<IdeaItem | null>(null);
  const [loading, setLoading] = useState(false);

  const bookId = formData?.id || formData?.bookId;

  useEffect(() => {
    // Pastikan fetch hanya jalan jika bookId benar-benar ada
    if (bookId) {
      console.log("Fetching ideas for Book ID:", bookId);
      fetchIdeas();
    }
  }, [bookId]); // Re-run jika bookId berubah (misal setelah loadingDetail selesai)

  const fetchIdeas = async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const response = await axios.get(
  `${API_BASE_URL}/books/quick-ideas/${bookId}`,
  {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  },
);
      setIdeas(response.data);
      
      // LOGIKA BARU: Jika data kosong, langsung tampilkan form tambah ide
      if (response.data.length === 0) {
        setIsAdding(true);
      }
    } catch (error) {
      console.error("Gagal mengambil ide:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => new Date().toISOString().split("T")[0];
  const getCurrentTime = () =>
    new Date()
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(".", ":");

  const [newItem, setNewItem] = useState<Partial<IdeaItem>>({
    title: "",
    date: getCurrentDate(),
    time: getCurrentTime(),
    category_tag: "Plot / Alur Cerita",
    description: "",
    mood: "",
    reference: "",
    priority: "Segera",
  });

  // Fungsi Reset Form
  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewItem({
      title: "",
      date: getCurrentDate(),
      time: getCurrentTime(),
      category_tag: "Plot / Alur Cerita",
      description: "",
      mood: "",
      reference: "",
      priority: "Segera",
    });
  };

  // Fungsi Masuk Mode Edit
  const handleEditClick = (idea: IdeaItem) => {
    setEditingId(idea.id);
    const ideaDate = idea.date ? idea.date.split("T")[0] : getCurrentDate();
    const ideaTime = idea.date
      ? new Date(idea.date)
          .toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .replace(".", ":")
      : getCurrentTime();

    setNewItem({
      title: idea.title,
      date: ideaDate,
      time: ideaTime,
      category_tag: idea.category_tag,
      description: idea.description,
      mood: idea.mood,
      reference: idea.reference,
      priority: idea.priority,
    });
    setIsAdding(true);
  };

  const handleSaveIdea = async () => {
    // Ambil ID tepat saat tombol diklik
    const currentBookId = formData?.id || formData?.bookId;

    console.log("Mencoba simpan ide untuk ID:", currentBookId);

    if (!currentBookId) {
      return alert("ID Buku tidak ditemukan. Coba refresh halaman.");
    }

    try {
      const payload = {
        bookId: Number(currentBookId), // Pastikan angka
        title: newItem.title,
        date: newItem.date,
        time: newItem.time,
        category: newItem.category_tag,
        description: newItem.description,
        mood: newItem.mood,
        reference: newItem.reference,
        priority: newItem.priority,
      };
      if (editingId) {
        // Mode UPDATE
       await axios.patch(
  `${API_BASE_URL}/books/quick-ideas/${editingId}`,
  payload,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);
      } else {
        // Mode CREATE
        await axios.post(
  `${API_BASE_URL}/books/quick-ideas`,
  payload,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  },
);
      }

      fetchIdeas(); // Refresh data
      resetForm();
    } catch (error: any) {
      alert(
        "Gagal menyimpan: " + (error.response?.data?.message || error.message),
      );
    }
  };

  // Fungsi Hapus
  const handleDeleteIdea = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Agar modal detail tidak terbuka
    if (!confirm("Hapus ide ini secara permanen?")) return;

    try {
     await axios.delete(`${API_BASE_URL}/books/quick-ideas/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const updatedIdeas = ideas.filter((i) => i.id !== id);
      setIdeas(updatedIdeas);
      
      // Jika setelah dihapus jadi kosong, buka form lagi
      if (updatedIdeas.length === 0) {
        setIsAdding(true);
      }
    } catch (error: any) {
      alert("Gagal menghapus ide.");
    }
  };

  const categories = [
    "Plot / Alur Cerita",
    "Karakter",
    "Dialog / Kutipan",
    "Adegan Spesifik",
    "Ending / Twist",
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-amber-400 to-rose-500 p-5 rounded-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white">
            ⚡
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Tangkap Ide Cepat
            </h3>
            <p className="text-[10px] font-bold text-amber-100 uppercase opacity-80">
              Jangan biarkan inspirasi lewat begitu saja
            </p>
          </div>
        </div>
        <button
          onClick={() => (isAdding ? resetForm() : setIsAdding(true))}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 ${isAdding ? "bg-white text-rose-600" : "bg-slate-900 text-amber-400 shadow-amber-900/20"}`}
        >
          {isAdding ? "✕ Batal" : "+ Rekam Ide"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-amber-100 rounded-[2.5rem] p-6 shadow-xl space-y-5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {editingId ? "📝 Edit Ide" : "✨ Rekam Ide Baru"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <InputGroup label="Judul Ide">
                    <input
                      type="text"
                      placeholder="Misal: Twist si pembunuh ternyata..."
                      value={newItem.title}
                      onChange={(e: any) =>
                        setNewItem({ ...newItem, title: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-500 outline-none text-sm font-bold text-slate-900"
                    />
                  </InputGroup>
                </div>
                <InputGroup label="Waktu Muncul">
                  <div className="flex gap-2 h-11 bg-slate-50 px-3 rounded-xl border border-slate-200 items-center">
                    <input
                      type="date"
                      value={newItem.date}
                      onChange={(e: any) =>
                        setNewItem({ ...newItem, date: e.target.value })
                      }
                      className="bg-transparent text-[10px] font-bold text-slate-900 outline-none"
                    />
                    <input
                      type="time"
                      value={newItem.time}
                      onChange={(e: any) =>
                        setNewItem({ ...newItem, time: e.target.value })
                      }
                      className="bg-transparent text-[10px] font-bold text-slate-900 outline-none"
                    />
                  </div>
                </InputGroup>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Kategori Ide
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setNewItem({ ...newItem, category_tag: cat })
                      }
                      className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase border-2 transition-all ${newItem.category_tag === cat ? "bg-amber-500 border-amber-500 text-white shadow-md" : "bg-white border-slate-100 text-slate-400 hover:border-amber-200"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <InputGroup label="Deskripsi Detail Ide">
                <textarea
                  placeholder="Tuliskan semua yang terlintas di pikiranmu secara spontan..."
                  value={newItem.description}
                  onChange={(e: any) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none text-sm font-bold text-slate-900 h-28 resize-none"
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <MiniInput
                  label="Suasana Hati (Mood)"
                  placeholder="Galau, Seru, Horor..."
                  value={newItem.mood}
                  onChange={(v: any) => setNewItem({ ...newItem, mood: v })}
                />
                <MiniInput
                  label="Referensi Cepat"
                  placeholder="Lagu/Film/Mimpi tadi malam..."
                  value={newItem.reference}
                  onChange={(v: any) =>
                    setNewItem({ ...newItem, reference: v })
                  }
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Prioritas Ide
                </label>
                <div className="flex gap-3">
                  {[
                    {
                      id: "Segera",
                      label: "🔥 Segera Kembangin",
                      color: "bg-rose-500",
                    },
                    {
                      id: "Nanti",
                      label: "⏳ Nanti Aja",
                      color: "bg-amber-500",
                    },
                    {
                      id: "Arsip",
                      label: "📦 Arsip Dulu",
                      color: "bg-slate-400",
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        setNewItem({ ...newItem, priority: p.id as any })
                      }
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${newItem.priority === p.id ? `${p.color} border-transparent text-white shadow-lg scale-[1.02]` : "bg-white border-slate-100 text-slate-400"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveIdea}
                className="w-full py-4 bg-slate-900 text-amber-400 rounded-2xl text-xs font-black uppercase shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>💾</span>{" "}
                {editingId ? "Update Perubahan Ide" : "Simpan Ide Kilat"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map((idea) => (
          <motion.div
            layout
            key={idea.id}
            onClick={() => setSelectedIdea(idea)}
            className="bg-white p-5 rounded-[2.5rem] border-2 border-slate-100 hover:border-amber-400 transition-all group relative cursor-pointer"
          >
            {/* Tombol Hapus & Edit yang muncul saat hover */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(idea);
                }}
                className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all text-xs"
              >
                📝
              </button>
              <button
                onClick={(e) => handleDeleteIdea(e, idea.id)}
                className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-between items-start mb-3">
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[8px] font-black uppercase">
                {idea.category_tag}
              </span>
              <div
                className={`w-2 h-2 rounded-full ${idea.priority === "Segera" ? "bg-rose-500" : idea.priority === "Nanti" ? "bg-amber-500" : "bg-slate-300"}`}
              />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase mb-2 line-clamp-1 pr-16">
              {idea.title}
            </h4>
            <p className="text-xs font-bold text-slate-500 line-clamp-3 mb-4 leading-relaxed italic">
              "{idea.description}"
            </p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
              <div className="flex gap-3">
                <span className="text-[9px] font-black text-slate-300 uppercase">
                  🎭 {idea.mood || "?"}
                </span>
                <span className="text-[9px] font-black text-slate-300 uppercase">
                  🔗 {idea.reference || "?"}
                </span>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase">
                {idea.createdAt
                  ? new Date(idea.createdAt).toLocaleDateString("id-ID")
                  : idea.date}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-8 max-w-lg w-full shadow-2xl relative border-4 border-amber-400"
            >
              <button
                onClick={() => setSelectedIdea(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-xs font-black hover:bg-rose-500 hover:text-white transition-all"
              >
                ✕
              </button>
              <div className="space-y-6">
                <div>
                  <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {selectedIdea.category_tag}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 uppercase leading-tight mt-4">
                    {selectedIdea.title}
                  </h2>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 italic text-slate-600 leading-relaxed text-sm font-bold">
                  "{selectedIdea.description}"
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-slate-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      🎭 Suasana Hati
                    </p>
                    <p className="text-xs font-bold text-slate-900">
                      {selectedIdea.mood || "Tidak ada catatan"}
                    </p>
                  </div>
                  <div className="bg-white border-2 border-slate-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      🔗 Referensi
                    </p>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {selectedIdea.reference || "Tidak ada referensi"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${selectedIdea.priority === "Segera" ? "bg-rose-500" : "bg-amber-500"}`}
                    />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      {selectedIdea.priority}
                    </span>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase italic">
                    Direkam:{" "}
                    {selectedIdea.createdAt
                      ? new Date(selectedIdea.createdAt).toLocaleString("id-ID")
                      : "-"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-komponen InputGroup
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

// Sub-komponen MiniInput
function MiniInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-amber-400 outline-none transition-all"
      />
    </div>
  );
}