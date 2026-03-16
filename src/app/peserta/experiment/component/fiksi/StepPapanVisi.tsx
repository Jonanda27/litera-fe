"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Edit2, Trash2, X, ExternalLink, Palette, User, MapPin, Book, Sparkles } from "lucide-react";
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-6">
      {/* HEADER SECTION - Optimized for Laptop */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-gradient-to-br from-indigo-600 to-blue-700 p-6 md:p-8 rounded-[2rem] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🖼️
          </div>
          <div>
            <h3 className="text-sm md:text-base font-black text-white uppercase tracking-widest">
              Papan Visi & Inspirasi
            </h3>
            <p className="text-[10px] md:text-xs font-bold text-indigo-100 uppercase opacity-90">
              Visualisasikan dunia ceritamu dengan detail
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) setEditingId(null);
          }}
          className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase transition-all shadow-lg active:scale-95 ${
            isAdding ? "bg-rose-500 text-white" : "bg-white text-blue-700 hover:bg-blue-50"
          }`}
        >
          {isAdding ? "✕ Batalkan" : "+ Tambah Inspirasi Baru"}
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
            <div className="bg-white border-2 border-indigo-50 rounded-[2rem] lg:rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-8">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Kiri: Tipe & Preview (Sticky on Laptop) */}
                <div className="w-full lg:w-[400px] space-y-6 lg:sticky lg:top-6 self-start">
                  <InputGroup label="Tipe Konten">
                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                      {(["image", "link", "color"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() =>
                            setNewItem({ ...newItem, type: t, content: "" })
                          }
                          className={`flex-1 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${
                            newItem.type === t
                              ? "bg-white text-indigo-600 shadow-md"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {t === "image" ? "File" : t === "link" ? "URL" : "Warna"}
                        </button>
                      ))}
                    </div>
                  </InputGroup>

                  <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-dashed border-indigo-100 aspect-video lg:aspect-square flex items-center justify-center overflow-hidden shadow-inner">
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
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                              <span className="text-3xl">{isUploading ? "⏳" : "📂"}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">
                              Klik atau Taruh Gambar Disini
                            </p>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            <img
                              src={newItem.content}
                              className="w-full h-full object-cover rounded-2xl"
                              alt="Preview"
                            />
                            <button
                              onClick={() =>
                                setNewItem({ ...newItem, content: "" })
                              }
                              className="absolute top-2 right-2 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-xl hover:scale-110 transition-transform"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {newItem.type === "link" && (
                      <textarea
                        placeholder="Tempel URL Gambar di sini..."
                        value={newItem.content}
                        onChange={(e) =>
                          setNewItem({ ...newItem, content: e.target.value })
                        }
                        className="w-full h-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold resize-none outline-none focus:ring-2 ring-indigo-100"
                      />
                    )}
                    {newItem.type === "color" && (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative p-2 bg-white rounded-full shadow-lg">
                          <input
                            type="color"
                            value={newItem.dominantColor}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                dominantColor: e.target.value,
                              })
                            }
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full cursor-pointer border-none bg-transparent"
                          />
                        </div>
                        <span className="px-4 py-2 bg-slate-900 text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
                          {newItem.dominantColor}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kanan: Form Data */}
                <div className="flex-1 space-y-6">
                  <InputGroup label="Judul Inspirasi">
                    <input
                      type="text"
                      placeholder='Contoh: Arsitektur Kota Melayang'
                      value={newItem.title}
                      onChange={(e) =>
                        setNewItem({ ...newItem, title: e.target.value })
                      }
                      className="w-full p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none text-xs md:text-sm font-bold text-slate-900 transition-all shadow-sm"
                    />
                  </InputGroup>

                  <InputGroup label="Deskripsi Detail">
                    <textarea
                      placeholder="Apa yang menarik dari visual ini? Jelaskan tekstur, cahaya, atau nuansa yang ingin ditonjolkan..."
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                      className="w-full p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none text-xs md:text-sm font-bold text-slate-900 h-32 md:h-48 resize-none transition-all shadow-sm"
                    />
                  </InputGroup>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
                      Koneksi dalam Cerita
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: "karakter", icon: "👤", label: "Karakter Terkait" },
                        { id: "lokasi", icon: "📍", label: "Lokasi / Setting" },
                        { id: "bab", icon: "📑", label: "Bab / Adegan" },
                        { id: "suasana", icon: "✨", label: "Mood / Suasana" }
                      ].map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 p-3 focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-sm"
                        >
                          <span className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-lg shadow-sm shrink-0 mr-3">
                            {field.icon}
                          </span>
                          <div className="flex-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">{field.label}</p>
                            <input
                              type="text"
                              placeholder="..."
                              value={(newItem.connections as any)[field.id]}
                              onChange={(e) =>
                                setNewItem({
                                  ...newItem,
                                  connections: {
                                    ...newItem.connections,
                                    [field.id]: e.target.value,
                                  },
                                } as any)
                              }
                              className="w-full bg-transparent outline-none text-[10px] md:text-[11px] font-bold text-slate-900 uppercase"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveIdea}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-2xl text-[11px] md:text-xs font-black uppercase shadow-xl hover:shadow-indigo-200 hover:translate-y-[-2px] active:scale-95 transition-all mt-4"
                  >
                    {editingId ? "💾 Perbarui Inspirasi" : "💾 Simpan ke Vision Board"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID DISPLAY - Better Laptop Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-10">
        {items.length === 0 && !isAdding && (
          <div className="col-span-full py-24 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <div className="text-5xl mb-4">🎨</div>
            <p className="text-[11px] md:text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
              Belum ada inspirasi visual
            </p>
            <p className="text-[10px] font-medium text-slate-300 mt-2">Mulai bangun duniamu dengan menambah item baru.</p>
          </div>
        )}

        {items.map((item) => (
          <motion.div
            layout
            key={item.id}
            className="group relative bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden hover:border-indigo-400 hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col"
            onClick={() => setSelectedDetail(item)}
          >
            <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden shrink-0">
              {item.type === "color" ? (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: item.dominantColor }}>
                  <span className="bg-white/95 px-4 py-2 rounded-xl text-[10px] font-black text-slate-800 shadow-xl">{item.dominantColor}</span>
                </div>
              ) : item.content ? (
                <img src={item.content} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-100"><span className="text-5xl opacity-20">🖼️</span></div>
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                  className="w-12 h-12 bg-white text-indigo-600 rounded-2xl shadow-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                  className="w-12 h-12 bg-white text-rose-500 rounded-2xl shadow-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3 flex-1 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.dominantColor }} />
                <h4 className="text-[11px] md:text-xs font-black text-slate-900 uppercase truncate tracking-tight">{item.title}</h4>
              </div>
              <p className="text-[10px] md:text-11px font-bold text-slate-400 line-clamp-2 h-8 italic leading-snug">
                {item.description || "Inspirasi ini belum memiliki deskripsi..."}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL DETAIL - Laptop Centric Layout */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-6xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl relative flex flex-col lg:flex-row max-h-[90vh] lg:h-[750px]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDetail(null)}
                className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 hover:bg-rose-500 text-white lg:text-slate-400 lg:hover:text-white flex items-center justify-center rounded-2xl transition-all shadow-lg backdrop-blur-md"
              >
                <X size={24} />
              </button>

              {/* Visual Section - Fixed 50% on Laptop */}
              <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center min-h-[300px] lg:min-h-full border-r border-slate-100 relative">
                {selectedDetail.type === "color" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-6 p-12" style={{ backgroundColor: selectedDetail.dominantColor }}>
                    <div className="bg-white/20 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/30">
                       <span className="font-black text-3xl md:text-5xl text-white drop-shadow-lg">{selectedDetail.dominantColor}</span>
                    </div>
                  </div>
                ) : (
                  <img src={selectedDetail.content} className="w-full h-full object-cover" alt={selectedDetail.title} />
                )}
              </div>

              {/* Content Section - Scrollable */}
              <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="space-y-8 md:space-y-10 my-auto">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">
                        {selectedDetail.type === 'image' ? 'Inspirasi Visual' : selectedDetail.type === 'link' ? 'Referensi Link' : 'Palet Warna'}
                      </span>
                      <div className="w-5 h-5 rounded-full border-2 border-slate-100 shadow-sm" style={{ backgroundColor: selectedDetail.dominantColor }} />
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight leading-[1.1]">{selectedDetail.title}</h2>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-3">
                      <Sparkles size={16} className="text-indigo-400" /> Deskripsi Inspirasi
                    </h4>
                    <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border-l-8 border-indigo-500 shadow-inner">
                      <p className="text-slate-600 font-bold leading-relaxed italic text-base md:text-xl">
                        "{selectedDetail.description || 'Tidak ada catatan visual untuk item ini.'}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Mapping Cerita</h4>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <DetailConnection icon={<User size={18}/>} label="Karakter" value={selectedDetail.connections.karakter} />
                      <DetailConnection icon={<MapPin size={18}/>} label="Lokasi" value={selectedDetail.connections.lokasi} />
                      <DetailConnection icon={<Book size={18}/>} label="Bab" value={selectedDetail.connections.bab} />
                      <DetailConnection icon={<Palette size={18}/>} label="Mood" value={selectedDetail.connections.suasana} />
                    </div>
                  </div>

                  {selectedDetail.type === 'link' && (
                    <a 
                      href={selectedDetail.content} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-indigo-600 hover:scale-[1.02] transition-all mt-6 shadow-xl"
                    >
                      Kunjungi Sumber Inspirasi <ExternalLink size={16} />
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

// Sub-component for connections
function DetailConnection({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 md:p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">{icon}</div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase leading-none mb-1.5 tracking-wider">{label}</p>
        <p className="text-[11px] md:text-[13px] font-black text-slate-800 leading-tight truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

// Sub-component for input groups
function InputGroup({ label, children }: any) {
  return (
    <div className="space-y-2.5">
      <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">
        {label}
      </label>
      {children}
    </div>
  );
}