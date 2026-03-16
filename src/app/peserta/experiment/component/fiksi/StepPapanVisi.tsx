"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Edit2, Trash2, X, Maximize2, ExternalLink, Palette, User, MapPin, Book, Sparkles } from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface VisionItem {
  id: string;
  title: string;
  type: "image" | "link" | "color";
  content: string;
  description: string;
  connections: {
    karakter: string;
    lokasi: string;
    bab: string;
    suasana: string;
  };
  dominantColor: string;
}

export default function StepPramenulis({ formData, onDataChange }: any) {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<VisionItem | null>(null);

  const bookId = formData?.id || formData?.bookId;

  const fetchVisionBoard = async () => {
    if (!bookId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/books/vision-board/${bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedData = res.data.map((item: any) => ({
        id: item.id.toString(),
        title: item.board_title,
        type:
          item.content_type === "Upload Gambar"
            ? "image"
            : item.content_type === "Link URL"
              ? "link"
              : "color",
        content: item.image_url,
        description: item.visual_description,
        connections: item.connection_to || {
          karakter: "",
          lokasi: "",
          bab: "",
          suasana: "",
        },
        dominantColor: item.dominant_color || "#1E4E8C",
      }));

      setItems(formattedData);

      if (formattedData.length === 0) {
        setIsAdding(true);
      }
    } catch (err) {
      console.error("Gagal memuat papan visi:", err);
    }
  };

  useEffect(() => {
    fetchVisionBoard();
  }, [bookId]);

  const [newItem, setNewItem] = useState<Partial<VisionItem>>({
    title: "",
    type: "image",
    content: "",
    description: "",
    connections: { karakter: "", lokasi: "", bab: "", suasana: "" },
    dominantColor: "#1E4E8C",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return alert("Ukuran file terlalu besar (Maksimal 5MB)");
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewItem({ ...newItem, content: reader.result as string });
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Gagal membaca file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveIdea = async () => {
    if (!newItem.title) return alert("Judul Papan wajib diisi");
    if (!newItem.content && newItem.type !== "color")
      return alert("Konten inspirasi belum diisi");
    if (!bookId) return alert("ID Buku tidak ditemukan");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        bookId: bookId,
        title: newItem.title,
        type: newItem.type,
        content: newItem.content,
        description: newItem.description,
        connections: newItem.connections,
        dominantColor: newItem.dominantColor,
      };

      if (editingId) {
        await axios.patch(
          `${API_BASE_URL}/books/vision-board/${editingId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/books/vision-board`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setIsAdding(false);
      setEditingId(null);
      setNewItem({
        title: "",
        type: "image",
        content: "",
        description: "",
        connections: { karakter: "", lokasi: "", bab: "", suasana: "" },
        dominantColor: "#1E4E8C",
      });
      fetchVisionBoard();
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Hapus inspirasi ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/books/vision-board/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedItems = items.filter((i) => i.id !== id);
      setItems(updatedItems);

      if (updatedItems.length === 0) {
        setIsAdding(true);
      }
    } catch (err) {
      alert("Gagal menghapus item");
    }
  };

  const handleEditClick = (item: VisionItem) => {
    setEditingId(item.id);
    setNewItem(item);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      {/* HEADER SECTION - Responsive Padding & Layout */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-gradient-to-r from-indigo-500 to-blue-600 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl shrink-0">
            🖼️
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">
              Papan Visi & Inspirasi
            </h3>
            <p className="text-[9px] md:text-[10px] font-bold text-indigo-100 uppercase opacity-80">
              Visualisasikan dunia ceritamu
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) setEditingId(null);
          }}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 ${
            isAdding ? "bg-rose-500 text-white" : "bg-white text-blue-700"
          }`}
        >
          {isAdding ? "✕ Batalkan" : "+ Tambah Inspirasi"}
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
            <div className="bg-white border-2 border-indigo-100 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-xl space-y-6">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                {/* Kiri: Tipe & Preview */}
                <div className="w-full lg:w-1/3 space-y-4">
                  <InputGroup label="Tipe Konten">
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                      {(["image", "link", "color"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() =>
                            setNewItem({ ...newItem, type: t, content: "" })
                          }
                          className={`flex-1 py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all ${
                            newItem.type === t
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-slate-400"
                          }`}
                        >
                          {t === "image" ? "File" : t === "link" ? "URL" : "Warna"}
                        </button>
                      ))}
                    </div>
                  </InputGroup>

                  <div className="bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-indigo-100 aspect-video lg:h-64 flex items-center justify-center overflow-hidden">
                    {newItem.type === "image" && (
                      <div className="w-full h-full relative group">
                        {!newItem.content ? (
                          <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={handleFileUpload}
                            />
                            <span className="text-3xl block mb-1">
                              {isUploading ? "⏳" : "📂"}
                            </span>
                            <p className="text-[9px] font-black text-slate-400 uppercase text-center">
                              Klik / Taruh Gambar
                            </p>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            <img
                              src={newItem.content}
                              className="w-full h-full object-cover rounded-lg"
                              alt="Preview"
                            />
                            <button
                              onClick={() =>
                                setNewItem({ ...newItem, content: "" })
                              }
                              className="absolute top-1 right-1 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-lg"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {newItem.type === "link" && (
                      <textarea
                        placeholder="Tempel URL Gambar..."
                        value={newItem.content}
                        onChange={(e) =>
                          setNewItem({ ...newItem, content: e.target.value })
                        }
                        className="w-full h-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold resize-none outline-none"
                      />
                    )}
                    {newItem.type === "color" && (
                      <div className="flex flex-col items-center gap-2">
                        <input
                          type="color"
                          value={newItem.dominantColor}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              dominantColor: e.target.value,
                            })
                          }
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full cursor-pointer border-4 border-white shadow-md bg-transparent"
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {newItem.dominantColor}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kanan: Form Data */}
                <div className="flex-1 space-y-4">
                  <InputGroup label="Judul Papan (Wajib)">
                    <input
                      type="text"
                      placeholder='Misal: "Istana Pasir"'
                      value={newItem.title}
                      onChange={(e) =>
                        setNewItem({ ...newItem, title: e.target.value })
                      }
                      className="w-full p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-xs md:text-sm font-bold text-slate-900 transition-all"
                    />
                  </InputGroup>

                  <InputGroup label="Deskripsi Visual">
                    <textarea
                      placeholder="Ceritakan detail visualnya agar mudah diingat..."
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                      className="w-full p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-xs md:text-sm font-bold text-slate-900 h-24 md:h-32 resize-none"
                    />
                  </InputGroup>

                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {["karakter", "lokasi", "bab", "suasana"].map((field) => (
                      <div
                        key={field}
                        className="flex items-center bg-slate-50 rounded-xl border border-slate-100 p-2 md:p-3 focus-within:border-indigo-200 transition-all"
                      >
                        <span className="w-5 text-xs md:text-sm shrink-0">
                          {field === "karakter" ? "👤" : field === "lokasi" ? "📍" : field === "bab" ? "📑" : "✨"}
                        </span>
                        <input
                          type="text"
                          placeholder={field.toUpperCase()}
                          value={(newItem.connections as any)[field]}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              connections: {
                                ...newItem.connections,
                                [field]: e.target.value,
                              },
                            } as any)
                          }
                          className="flex-1 bg-transparent px-1 md:px-2 outline-none text-[8px] md:text-[10px] font-black text-slate-900 uppercase"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveIdea}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-[1.2rem] text-[10px] md:text-xs font-black uppercase shadow-lg active:scale-95 transition-all mt-4"
              >
                {editingId ? "💾 Simpan Perubahan" : "💾 Masukkan ke Papan Visi"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID DISPLAY - Responsive Grid Cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {items.length === 0 && !isAdding && (
          <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">
              Papan Visi Masih Kosong
            </p>
          </div>
        )}

        {items.map((item) => (
          <motion.div
            layout
            key={item.id}
            className="group relative bg-white rounded-3xl border-2 border-slate-100 overflow-hidden hover:border-indigo-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => setSelectedDetail(item)}
          >
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden shrink-0">
              {item.type === "color" ? (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: item.dominantColor }}>
                  <span className="bg-white/90 px-2 py-1 rounded text-[9px] font-black text-slate-800">{item.dominantColor}</span>
                </div>
              ) : item.content ? (
                <img src={item.content} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-100"><span className="text-4xl">🖼️</span></div>
              )}
              
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                  className="w-8 h-8 md:w-9 md:h-9 bg-white text-indigo-600 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                  className="w-8 h-8 md:w-9 md:h-9 bg-white text-rose-500 rounded-full shadow-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1">
              <h4 className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase truncate leading-none">{item.title}</h4>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 line-clamp-2 h-7 md:h-8 italic leading-tight">{item.description || "Tidak ada deskripsi..."}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL DETAIL - Full Responsive Redesign */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-5xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[95vh] md:h-auto lg:h-[80vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDetail(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 md:w-10 md:h-10 bg-black/20 md:bg-black/10 hover:bg-rose-500 text-white flex items-center justify-center rounded-full transition-all"
              >
                <X size={18} />
              </button>

              {/* Visual Section */}
              <div className="w-full md:w-1/2 bg-slate-100 flex items-center justify-center min-h-[250px] md:min-h-full">
                {selectedDetail.type === "color" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-8" style={{ backgroundColor: selectedDetail.dominantColor }}>
                    <span className="bg-white px-5 py-2 md:px-8 md:py-3 rounded-full font-black text-lg md:text-2xl shadow-xl">{selectedDetail.dominantColor}</span>
                  </div>
                ) : (
                  <img src={selectedDetail.content} className="w-full h-full object-contain md:object-cover" alt={selectedDetail.title} />
                )}
              </div>

              {/* Content Section */}
              <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                        {selectedDetail.type === 'image' ? 'Inspirasi Visual' : selectedDetail.type === 'link' ? 'Referensi Link' : 'Palet Warna'}
                      </span>
                      <div className="w-4 h-4 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: selectedDetail.dominantColor }} />
                    </div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">{selectedDetail.title}</h2>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Sparkles size={14} className="text-indigo-500" /> Deskripsi Inspirasi
                    </h4>
                    <p className="text-slate-600 font-medium leading-relaxed italic text-sm md:text-base lg:text-lg bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border-l-4 border-indigo-500">
                      "{selectedDetail.description || 'Tidak ada deskripsi visual yang ditambahkan untuk item ini.'}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Koneksi Cerita</h4>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <DetailConnection icon={<User size={14}/>} label="Karakter" value={selectedDetail.connections.karakter} />
                      <DetailConnection icon={<MapPin size={14}/>} label="Lokasi" value={selectedDetail.connections.lokasi} />
                      <DetailConnection icon={<Book size={14}/>} label="Bab" value={selectedDetail.connections.bab} />
                      <DetailConnection icon={<Palette size={14}/>} label="Suasana" value={selectedDetail.connections.suasana} />
                    </div>
                  </div>

                  {selectedDetail.type === 'link' && (
                    <a 
                      href={selectedDetail.content} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] md:text-xs hover:bg-indigo-600 transition-all mt-4"
                    >
                      Buka Sumber Asli <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailConnection({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-3 md:p-4 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm flex items-center gap-2 md:gap-3">
      <div className="p-1.5 md:p-2 bg-slate-50 text-indigo-500 rounded-lg shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase leading-none mb-1 truncate">{label}</p>
        <p className="text-[9px] md:text-[11px] font-black text-slate-800 leading-none truncate">{value || "-"}</p>
      </div>
    </div>
  );
}

function InputGroup({ label, children }: any) {
  return (
    <div className="space-y-1.5 md:space-y-2">
      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
        {label}
      </label>
      {children}
    </div>
  );
}