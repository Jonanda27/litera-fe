"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState, useEffect } from "react";
import axios from "axios";

// ==========================================
// SUB-KOMPONEN INTERNAL
// ==========================================

const DroppableColumn = ({ id, children }: any) => {
  const { setNodeRef } = useDroppable({
    id: id,
    data: { type: "container" },
  });
  return (
    <div ref={setNodeRef} className="space-y-4 min-h-[300px] flex-1 px-1">
      {children}
    </div>
  );
};

const SortablePlotCard = ({
  id,
  label,
  description,
  type,
  onDelete,
  onUpdate,
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const getTypeColor = () => {
    const t = type?.toLowerCase() || "";
    if (t.includes("aksi"))
      return "bg-orange-50 text-orange-600 border-orange-100 focus:border-orange-400";
    if (t.includes("konflik"))
      return "bg-red-50 text-red-600 border-red-100 focus:border-red-400";
    if (t.includes("dialog"))
      return "bg-blue-50 text-blue-600 border-blue-100 focus:border-blue-400";
    return "bg-indigo-50 text-indigo-600 border-indigo-100 focus:border-indigo-400";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-2xl border-2 transition-all duration-300 shadow-sm group ${
        isDragging
          ? "border-indigo-500 shadow-xl scale-[1.02]"
          : "border-slate-50"
      } hover:border-indigo-200 hover:shadow-md`}
    >
      <div className="flex justify-between items-start mb-3">
        <input
          value={type || ""}
          onChange={(e) => onUpdate(id, "type", e.target.value)}
          className={`text-[9px] font-black px-3 py-1 rounded-full uppercase outline-none border transition-all placeholder-slate-300 w-2/3 ${getTypeColor()}`}
          placeholder="TIPE (AKSI/DIALOG)"
        />
        <div className="flex gap-2 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="opacity-0 group-hover:opacity-100 bg-red-50 text-red-400 hover:text-red-600 p-1 rounded-lg transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <span className="text-slate-300 group-hover:text-indigo-400 text-xl block">
              ⠿
            </span>
          </div>
        </div>
      </div>

      <input
        value={label || ""}
        onChange={(e) => onUpdate(id, "label", e.target.value)}
        className="w-full font-black text-[12px] text-slate-800 outline-none border-b-2 border-slate-50 focus:border-indigo-500 bg-transparent uppercase tracking-tight transition-all mb-2 placeholder-slate-200"
        placeholder="Judul adegan..."
      />

      <textarea
        value={description || ""}
        onChange={(e) => onUpdate(id, "desc", e.target.value)}
        className="w-full text-[11px] text-slate-600 outline-none bg-slate-50/50 p-3 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-100 font-medium transition-all resize-none leading-relaxed placeholder-slate-300"
        placeholder="Ceritakan kejadiannya..."
        rows={3}
      />
    </div>
  );
};

// ==========================================
// KOMPONEN UTAMA
// ==========================================

interface StepPengembanganProps {
  formData: any;
  setFormData: any;
  handleNestedChange: (parent: string, field: string, value: string) => void;
  plotItems: any[];
  setPlotItems: any;
  sensors: any;
  handleDragOver: (event: any) => void;
  handleDragEnd: (event: any) => void;
  onDataChange: (data: any) => void; 
}

export default function StepPengembangan({
  formData,
  setFormData,
  handleNestedChange,
  plotItems,
  sensors,
  handleDragOver,
  handleDragEnd,
  setPlotItems,
  onDataChange,
}: StepPengembanganProps) {
  const fileInputRefs = useRef<any>([]);
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const lastSentData = useRef("");

  useEffect(() => {
  const currentData = {
    karakter: formData.karakter,
    worldBuilding: formData.worldBuilding,
    timeline: formData.timeline,
    plotItems: plotItems,
    plotColumns: formData.plotColumns || columns,
  };

  // Stringify untuk melakukan pengecekan simpel apakah data benar-benar berubah
  const dataString = JSON.stringify(currentData);

  if (lastSentData.current !== dataString) {
    lastSentData.current = dataString;
    onDataChange(currentData);
  }
}, [formData.karakter, formData.worldBuilding, formData.timeline, plotItems, formData.plotColumns, onDataChange]);
  // --- INTEGRASI API: GET DATA PENGEMBANGAN ---
  useEffect(() => {
    const fetchPengembanganData = async () => {
      if (!formData.bookId) return;

      setIsLoadingFetch(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:4000/api/books/pengembangan/${formData.bookId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.data && response.data.data) {
          const fetchedData = response.data.data;

          setFormData((prev: any) => ({
            ...prev,
            karakter:
              fetchedData.karakter?.length > 0
                ? fetchedData.karakter
                : prev.karakter,
            worldBuilding: fetchedData.worldBuilding?.lokasi
              ? fetchedData.worldBuilding
              : prev.worldBuilding,
            timeline:
              fetchedData.timeline?.length > 0
                ? fetchedData.timeline
                : prev.timeline,
            plotColumns:
              fetchedData.plotColumns?.length > 0
                ? fetchedData.plotColumns
                : prev.plotColumns,
          }));

          if (fetchedData.plotItems?.length > 0) {
            setPlotItems(fetchedData.plotItems);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data pengembangan:", error);
      } finally {
        setIsLoadingFetch(false);
      }
    };

    fetchPengembanganData();
  }, [formData.bookId]);

  // --- LOGIKA KARAKTER ---
  const handleAddKarakter = () => {
    const newKarakter = {
      nama: "",
      umur: "",
      fisik: "",
      kepribadian: "",
      latarBelakang: "",
      motivasi: "",
      konflik: "",
      perkembangan: "",
      image: null,
    };
    setFormData({
      ...formData,
      karakter: [...(formData.karakter || []), newKarakter],
    });
  };

  const handleRemoveKarakter = (index: number) => {
    const updatedKarakter = formData.karakter.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData({ ...formData, karakter: updatedKarakter });
  };

  const handleCharacterChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedKarakter = [...formData.karakter];
    updatedKarakter[index] = { ...updatedKarakter[index], [field]: value };
    setFormData({ ...formData, karakter: updatedKarakter });
  };

  const handleImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleCharacterChange(index, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIKA PAPAN PLOT ---
  const handleAddBabak = () => {
    const newBabakId = `babak-${Date.now()}`;
    const updatedBabak = [
      ...(formData.plotColumns || []),
      { id: newBabakId, title: "Babak Baru" },
    ];
    setFormData({ ...formData, plotColumns: updatedBabak });
  };

  const handleDeleteBabak = (babakId: string) => {
    if (confirm("Hapus babak dan seluruh adegan di dalamnya?")) {
      const updatedColumns = (formData.plotColumns || []).filter(
        (b: any) => b.id !== babakId,
      );
      const updatedItems = plotItems.filter((p: any) => p.babak !== babakId);
      setFormData({ ...formData, plotColumns: updatedColumns });
      setPlotItems(updatedItems);
    }
  };

  const handleUpdateBabakTitle = (id: string, newTitle: string) => {
    const updatedBabak = (formData.plotColumns || columns).map((b: any) =>
      b.id === id ? { ...b, title: newTitle } : b,
    );
    setFormData({ ...formData, plotColumns: updatedBabak });
  };

  const handleAddAdegan = (babakId: string) => {
    const newAdegan = {
      id: `ade-${Date.now()}`,
      label: "",
      desc: "",
      type: "AKSI",
      babak: babakId,
    };
    setPlotItems([...plotItems, newAdegan]);
  };

  const handleUpdateAdegan = (id: string, field: string, value: string) => {
    setPlotItems(
      plotItems.map((p: any) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleDeleteAdegan = (id: string) => {
    setPlotItems(plotItems.filter((p: any) => p.id !== id));
  };

  const columns =
    formData.plotColumns?.length > 0
      ? formData.plotColumns
      : [{ id: "babak-1", title: "Babak I" }];

  return (
    <div className="space-y-12 pb-24 relative">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-l-8 border-[#1E4E8C] shadow-sm relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] text-8xl opacity-5 grayscale">
          🎭
        </div>
        <p className="relative z-10 text-[12px] font-medium text-indigo-900 leading-relaxed italic">
          "Setelah punya kerangka, sekarang waktunya ngembangin 'isi dapur'nya
          cerita agar setiap elemen konsisten sampai akhir."
        </p>
      </div>

      {isLoadingFetch && (
        <div className="w-full text-center py-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 animate-pulse">
          Menyinkronkan data dengan database...
        </div>
      )}

      {/* 1. PROFIL KARAKTER */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg shadow-indigo-200 text-xs font-bold">
              01
            </span>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
              Profil Karakter
            </h4>
          </div>
          <button
            type="button"
            onClick={handleAddKarakter}
            className="text-[10px] bg-indigo-600 text-white px-5 py-2 rounded-xl font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-100 uppercase tracking-widest"
          >
            + Tokoh Baru
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
          {(formData.karakter || []).map((char: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-[400px] md:min-w-[500px] snap-start bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-xl shadow-slate-100/50 relative group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
                    Identitas Tokoh
                  </label>
                  <input
                    type="text"
                    placeholder="NAMA TOKOH"
                    className="w-full bg-transparent text-xl font-black outline-none border-b-2 border-slate-50 focus:border-indigo-500 text-slate-800 placeholder-slate-200 transition-all uppercase tracking-tighter"
                    value={char.nama || ""}
                    onChange={(e) =>
                      handleCharacterChange(index, "nama", e.target.value)
                    }
                  />
                </div>
                {formData.karakter.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveKarakter(index)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <span className="text-xs font-black">✕</span>
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex gap-6">
                  <div
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="w-32 h-32 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-all overflow-hidden relative group/img shadow-inner"
                  >
                    {char.image ? (
                      <>
                        <img
                          src={char.image}
                          alt="Profile"
                          className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                          <span className="text-white text-[8px] font-black uppercase border-2 border-white px-2 py-1 rounded-lg">
                            Ubah
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl mb-1 block">🖼️</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          Avatar
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      onChange={(e) => handleImageUpload(index, e)}
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Umur & Peran
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: 25 Tahun / Antagonis"
                        className="w-full p-3 text-[11px] font-bold rounded-xl border-2 border-slate-50 bg-slate-50 text-slate-700 outline-none focus:bg-white focus:border-indigo-100 transition-all"
                        value={char.umur || ""}
                        onChange={(e) =>
                          handleCharacterChange(index, "umur", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Ciri Fisik Utama
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: Mata biru, luka di pipi"
                        className="w-full p-3 text-[11px] font-bold rounded-xl border-2 border-slate-50 bg-slate-50 text-slate-700 outline-none focus:bg-white focus:border-indigo-100 transition-all"
                        value={char.fisik || ""}
                        onChange={(e) =>
                          handleCharacterChange(index, "fisik", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">
                      Kepribadian
                    </label>
                    <textarea
                      className="w-full text-[11px] font-medium p-4 rounded-2xl border-2 border-slate-50 bg-indigo-50/20 text-slate-700 min-h-[100px] outline-none focus:bg-white focus:border-indigo-100 leading-relaxed resize-none shadow-inner"
                      placeholder="Bagaimana sifatnya?"
                      value={char.kepribadian || ""}
                      onChange={(e) =>
                        handleCharacterChange(
                          index,
                          "kepribadian",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest ml-1">
                      Latar Belakang
                    </label>
                    <textarea
                      className="w-full text-[11px] font-medium p-4 rounded-2xl border-2 border-slate-50 bg-amber-50/20 text-slate-700 min-h-[100px] outline-none focus:bg-white focus:border-amber-100 leading-relaxed resize-none shadow-inner"
                      placeholder="Masa lalu tokoh..."
                      value={char.latarBelakang || ""}
                      onChange={(e) =>
                        handleCharacterChange(
                          index,
                          "latarBelakang",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t-2 border-slate-50">
                  <div className="flex items-center gap-4 group/input">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg shadow-sm">
                      🎯
                    </div>
                    <div className="flex-1">
                      <label className="text-[8px] font-black text-orange-500 uppercase tracking-widest block">
                        Motivasi
                      </label>
                      <input
                        type="text"
                        placeholder="Apa yang dia inginkan?"
                        className="w-full text-[11px] font-bold bg-transparent outline-none border-b border-slate-100 focus:border-orange-200 text-slate-700 py-1"
                        value={char.motivasi || ""}
                        onChange={(e) =>
                          handleCharacterChange(
                            index,
                            "motivasi",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group/input">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-lg shadow-sm">
                      🔥
                    </div>
                    <div className="flex-1">
                      <label className="text-[8px] font-black text-red-500 uppercase tracking-widest block">
                        Konflik
                      </label>
                      <input
                        type="text"
                        placeholder="Apa rintangannya?"
                        className="w-full text-[11px] font-bold bg-transparent outline-none border-b border-slate-100 focus:border-red-200 text-slate-700 py-1"
                        value={char.konflik || ""}
                        onChange={(e) =>
                          handleCharacterChange(index, "konflik", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group/input">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg shadow-sm">
                      📈
                    </div>
                    <div className="flex-1">
                      <label className="text-[8px] font-black text-blue-500 uppercase tracking-widest block">
                        Perkembangan
                      </label>
                      <input
                        type="text"
                        placeholder="Bagaimana dia berubah?"
                        className="w-full text-[11px] font-bold bg-transparent outline-none border-b border-slate-100 focus:border-blue-200 text-slate-700 py-1"
                        value={char.perkembangan || ""}
                        onChange={(e) =>
                          handleCharacterChange(
                            index,
                            "perkembangan",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. WORLDBUILDING */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
          <span className="bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg shadow-emerald-200 text-xs font-bold">
            02
          </span>
          <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
            Setting & World Building
          </h4>
        </div>

        <div className="bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-2xl shadow-slate-100/50 space-y-8">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1 ml-1">
              Pusat Lokasi Utama
            </label>
            <input
              type="text"
              placeholder="Nama Kota / Benua / Planet..."
              className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-black text-xl text-slate-800 placeholder-slate-200 transition-all shadow-inner uppercase tracking-tighter"
              value={formData.worldBuilding?.lokasi || ""}
              onChange={(e) =>
                handleNestedChange("worldBuilding", "lokasi", e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Deskripsi & Atmosfer ☁️
                </label>
                <textarea
                  placeholder="Gambarkan pemandangan, aroma, suara..."
                  className="w-full text-[11px] font-medium p-5 rounded-3xl border-2 border-slate-100 bg-slate-50 text-slate-700 min-h-[140px] outline-none focus:bg-white focus:border-emerald-200 leading-relaxed shadow-inner"
                  value={formData.worldBuilding?.deskripsi || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "worldBuilding",
                      "deskripsi",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Sistem & Sejarah 📜
                </label>
                <textarea
                  placeholder="Mitos, hukum, atau peristiwa masa lalu..."
                  className="w-full text-[11px] font-medium p-5 rounded-3xl border-2 border-slate-100 bg-slate-50 text-slate-700 min-h-[120px] outline-none focus:bg-white focus:border-emerald-200 leading-relaxed shadow-inner"
                  value={formData.worldBuilding?.sejarah || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "worldBuilding",
                      "sejarah",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Demografi Penghuni 👥
                </label>
                <textarea
                  placeholder="Siapa saja ras atau kelompok di sini?"
                  className="w-full text-[11px] font-medium p-5 rounded-3xl border-2 border-slate-100 bg-slate-50 text-slate-700 min-h-[140px] outline-none focus:bg-white focus:border-emerald-200 leading-relaxed shadow-inner"
                  value={formData.worldBuilding?.karakterPenghuni || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "worldBuilding",
                      "karakterPenghuni",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Logistik & Geografi 🗺️
                </label>
                <textarea
                  placeholder="Transportasi atau jalur antar wilayah..."
                  className="w-full text-[11px] font-medium p-5 rounded-3xl border-2 border-slate-100 bg-slate-50 text-slate-700 min-h-[120px] outline-none focus:bg-white focus:border-emerald-200 leading-relaxed shadow-inner"
                  value={formData.worldBuilding?.hubungan || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "worldBuilding",
                      "hubungan",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GARIS WAKTU */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-pink-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg shadow-pink-200 text-xs font-bold">
              03
            </span>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
              Timeline Kronologi
            </h4>
          </div>
          <button
            type="button"
            onClick={() => {
              const newTimeline = {
                waktu: "",
                kejadian: "",
                karakter: "",
                bab: "",
              };
              setFormData({
                ...formData,
                timeline: [...(formData.timeline || []), newTimeline],
              });
            }}
            className="text-[10px] bg-pink-600 text-white px-5 py-2 rounded-xl font-black hover:bg-pink-700 transition-all shadow-md shadow-pink-100 uppercase tracking-widest"
          >
            + Titik Waktu
          </button>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent snap-x">
          {Array.isArray(formData.timeline) && formData.timeline.length > 0 ? (
            formData.timeline.map((event: any, idx: number) => (
              <div
                key={idx}
                className="min-w-[300px] relative pt-10 snap-start group"
              >
                <div className="absolute top-[48px] left-0 w-full h-1 bg-pink-100 -z-10 group-first:left-1/2 group-last:w-1/2" />
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 rounded-full ring-[6px] ring-white z-10 shadow-lg" />

                <div className="bg-white border-2 border-slate-50 rounded-[32px] p-6 shadow-xl space-y-4 mt-6 hover:border-pink-300 transition-all relative group/card">
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        timeline: (formData.timeline || []).filter(
                          (_: any, i: number) => i !== idx,
                        ),
                      })
                    }
                    className="absolute -top-3 -right-3 bg-white text-red-500 w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-[10px] font-bold opacity-0 group-hover/card:opacity-100 transition-opacity border-2 border-slate-50"
                  >
                    ✕
                  </button>

                  <div>
                    <label className="text-[8px] font-black text-pink-400 uppercase tracking-widest block mb-1">
                      Periode
                    </label>
                    <input
                      type="text"
                      placeholder="Kapan?"
                      className="w-full text-[11px] font-black uppercase text-pink-700 outline-none bg-pink-50/50 p-2 rounded-lg"
                      value={event.waktu || ""}
                      onChange={(e) => {
                        const updated = [...formData.timeline];
                        updated[idx].waktu = e.target.value;
                        setFormData({ ...formData, timeline: updated });
                      }}
                    />
                  </div>

                  <textarea
                    placeholder="Apa yang terjadi?"
                    className="w-full text-[10px] font-bold p-4 rounded-2xl bg-slate-50 text-slate-700 outline-none focus:bg-white focus:ring-1 focus:ring-slate-100 min-h-[100px] resize-none leading-relaxed"
                    value={event.kejadian || ""}
                    onChange={(e) => {
                      const updated = [...formData.timeline];
                      updated[idx].kejadian = e.target.value;
                      setFormData({ ...formData, timeline: updated });
                    }}
                  />

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] font-black text-slate-400 uppercase w-10">
                        Tokoh:
                      </span>
                      <input
                        type="text"
                        placeholder="..."
                        className="flex-1 text-[10px] font-bold text-slate-800 bg-transparent outline-none border-b border-transparent focus:border-slate-100"
                        value={event.karakter || ""}
                        onChange={(e) => {
                          const updated = [...formData.timeline];
                          updated[idx].karakter = e.target.value;
                          setFormData({ ...formData, timeline: updated });
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] font-black text-slate-400 uppercase w-10">
                        Bab:
                      </span>
                      <input
                        type="text"
                        placeholder="..."
                        className="flex-1 text-[10px] font-bold text-slate-800 bg-transparent outline-none border-b border-transparent focus:border-slate-100"
                        value={event.bab || ""}
                        onChange={(e) => {
                          const updated = [...formData.timeline];
                          updated[idx].bab = e.target.value;
                          setFormData({ ...formData, timeline: updated });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-16 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center bg-slate-50/30">
              <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] italic">
                Belum ada kronologi
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. PAPAN PLOT (DRAG AND DROP) */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-900 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg text-xs font-bold">
              04
            </span>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
              Papan Plot Adegan
            </h4>
          </div>
          <button
            onClick={handleAddBabak}
            className="text-[10px] bg-slate-100 text-slate-500 px-5 py-2.5 rounded-xl font-black hover:bg-indigo-900 hover:text-white transition-all shadow-sm uppercase tracking-widest"
          >
            + Tambah Babak
          </button>
        </div>

        {/*  */}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-thin scrollbar-thumb-indigo-200">
            {columns.map((babak: any) => {
              const itemsInBabak = (plotItems || []).filter(
                (item) => item.babak === babak.id,
              );

              return (
                <div
                  key={babak.id}
                  className="min-w-[340px] flex flex-col group/col"
                >
                  <div className="bg-slate-50/50 p-5 rounded-[40px] border-t-[12px] border-indigo-900 shadow-xl shadow-slate-200/50 flex-1 flex flex-col relative transition-all hover:shadow-2xl hover:bg-slate-50">
                    <div className="flex items-center gap-3 mb-6 px-2">
                      <div className="bg-indigo-900 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black">
                        {columns.indexOf(babak) + 1}
                      </div>
                      <input
                        className="bg-transparent font-black text-[13px] text-slate-800 uppercase italic outline-none border-b-2 border-transparent focus:border-indigo-400 flex-1 tracking-tighter placeholder-slate-300"
                        value={babak.title}
                        onChange={(e) =>
                          handleUpdateBabakTitle(babak.id, e.target.value)
                        }
                        placeholder="NAMA BABAK..."
                      />
                      {columns.length > 1 && (
                        <button
                          onClick={() => handleDeleteBabak(babak.id)}
                          className="opacity-0 group-hover/col:opacity-100 text-red-400 hover:text-red-600 transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    <SortableContext
                      id={babak.id}
                      items={itemsInBabak.map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableColumn id={babak.id}>
                        {itemsInBabak.map((item) => (
                          <SortablePlotCard
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            description={item.desc}
                            type={item.type}
                            onDelete={handleDeleteAdegan}
                            onUpdate={handleUpdateAdegan}
                          />
                        ))}
                        {itemsInBabak.length === 0 && (
                          <div className="h-full border-4 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-[10px] text-slate-300 uppercase font-black text-center px-6 italic py-20 pointer-events-none tracking-widest leading-relaxed">
                            <span className="text-3xl mb-2 opacity-20">📍</span>
                            Kosongkan alur
                            <br />
                            Tarik ke sini
                          </div>
                        )}
                      </DroppableColumn>
                    </SortableContext>

                    <button
                      onClick={() => handleAddAdegan(babak.id)}
                      className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-black text-slate-400 hover:bg-white hover:text-indigo-600 hover:border-indigo-300 transition-all uppercase mt-6 tracking-widest shadow-sm"
                    >
                      + Adegan Baru
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      </section>
    </div>
  );
}