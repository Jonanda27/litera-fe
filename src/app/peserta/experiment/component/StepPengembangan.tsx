"use client";

import { motion } from "framer-motion";
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
    data: { type: 'container' } // Tambahkan data type
  });
  return (
    <div ref={setNodeRef} className="space-y-3 min-h-[250px] flex-1">
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-[#1E4E8C] transition-colors group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <input
          value={type || ""}
          onChange={(e) => onUpdate(id, "type", e.target.value)}
          className="text-[9px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase outline-none w-1/2 placeholder-orange-300"
          placeholder="TIPE"
        />
        <div className="flex gap-1 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all text-[10px]"
          >
            ✕
          </button>
          <span
            {...attributes}
            {...listeners}
            className="text-slate-300 group-hover:text-slate-500 text-xs cursor-grab active:cursor-grabbing p-1"
          >
            ⠿
          </span>
        </div>
      </div>
      <input
        value={label || ""}
        onChange={(e) => onUpdate(id, "label", e.target.value)}
        className="text-[11px] font-bold text-black w-full outline-none border-b border-transparent focus:border-slate-100 mb-1 placeholder-slate-300"
        placeholder="Judul adegan..."
      />
      <textarea
        value={description || ""}
        onChange={(e) => onUpdate(id, "desc", e.target.value)}
        className="text-[10px] text-black w-full outline-none bg-transparent resize-none overflow-hidden placeholder-slate-300"
        placeholder="Ceritakan kejadiannya..."
        rows={2}
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
}: StepPengembanganProps) {
  const fileInputRefs = useRef<any>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);

  // --- INTEGRASI API: GET DATA PENGEMBANGAN ---
  useEffect(() => {
    const fetchPengembanganData = async () => {
      if (!formData.bookId) return;

      setIsLoadingFetch(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:4000/api/books/pengembangan/${formData.bookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.data) {
          const fetchedData = response.data.data;
          
          setFormData((prev: any) => ({
            ...prev,
            karakter: fetchedData.karakter?.length > 0 ? fetchedData.karakter : prev.karakter,
            worldBuilding: fetchedData.worldBuilding?.lokasi ? fetchedData.worldBuilding : prev.worldBuilding,
            timeline: fetchedData.timeline?.length > 0 ? fetchedData.timeline : prev.timeline,
            plotColumns: fetchedData.plotColumns?.length > 0 ? fetchedData.plotColumns : prev.plotColumns,
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

  // --- INTEGRASI API: SAVE / UPDATE DATA ---
  const handleSaveAllData = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const bookId = formData.bookId;

      if (!bookId) {
        alert("⚠️ Simpan tahap Pramenulis terlebih dahulu untuk mendapatkan ID Buku!");
        setIsSaving(false);
        return;
      }

      const payload = {
        bookId,
        karakter: formData.karakter,
        worldBuilding: formData.worldBuilding,
        timeline: formData.timeline,
        plotItems: plotItems,
        plotColumns: formData.plotColumns || columns,
      };

      await axios.post(
        "http://localhost:4000/api/books/pengembangan",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Data Pengembangan Berhasil Disimpan!");
    } catch (error: any) {
      console.error("Gagal simpan:", error);
      alert(
        "❌ Gagal: " + (error.response?.data?.message || "Kesalahan Server")
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- LOGIKA KARAKTER ---
  const handleAddKarakter = () => {
    const newKarakter = {
      nama: "", umur: "", fisik: "", kepribadian: "", latarBelakang: "",
      motivasi: "", konflik: "", perkembangan: "", image: null,
    };
    setFormData({
      ...formData,
      karakter: [...(formData.karakter || []), newKarakter],
    });
  };

  const handleRemoveKarakter = (index: number) => {
    const updatedKarakter = formData.karakter.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, karakter: updatedKarakter });
  };

  const handleCharacterChange = (index: number, field: string, value: string) => {
    const updatedKarakter = [...formData.karakter];
    updatedKarakter[index] = { ...updatedKarakter[index], [field]: value };
    setFormData({ ...formData, karakter: updatedKarakter });
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
    const updatedBabak = [...(formData.plotColumns || []), { id: newBabakId, title: "Babak Baru" }];
    setFormData({ ...formData, plotColumns: updatedBabak });
  };

  const handleDeleteBabak = (babakId: string) => {
    if (confirm("Hapus babak dan seluruh adegan di dalamnya?")) {
      const updatedColumns = formData.plotColumns.filter((b: any) => b.id !== babakId);
      const updatedItems = plotItems.filter((p: any) => p.babak !== babakId);
      setFormData({ ...formData, plotColumns: updatedColumns });
      setPlotItems(updatedItems);
    }
  };

  const handleUpdateBabakTitle = (id: string, newTitle: string) => {
    const updatedBabak = (formData.plotColumns || columns).map((b: any) =>
      b.id === id ? { ...b, title: newTitle } : b
    );
    setFormData({ ...formData, plotColumns: updatedBabak });
  };

  const handleAddAdegan = (babakId: string) => {
    const newAdegan = { id: `ade-${Date.now()}`, label: "", desc: "", type: "AKSI", babak: babakId };
    setPlotItems([...plotItems, newAdegan]);
  };

  const handleUpdateAdegan = (id: string, field: string, value: string) => {
    setPlotItems(plotItems.map((p: any) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleDeleteAdegan = (id: string) => {
    setPlotItems(plotItems.filter((p: any) => p.id !== id));
  };

  const columns = formData.plotColumns?.length > 0 ? formData.plotColumns : [{ id: "babak-1", title: "Babak I" }];

  return (
    <div className="space-y-10 pb-24 relative">
      {/* TOMBOL SIMPAN */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleSaveAllData}
          disabled={isSaving || isLoadingFetch}
          className={`${
            isSaving || isLoadingFetch
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-xl active:scale-95"
          } text-white px-8 py-4 rounded-full font-black flex items-center gap-3 transition-all uppercase text-[10px] tracking-widest`}
        >
          {isLoadingFetch ? "Mencari Data..." : isSaving ? "Sedang Menyimpan..." : "💾 Simpan Semua"}
        </button>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border-l-8 border-[#1E4E8C] text-[11px] italic text-slate-700 shadow-sm leading-relaxed">
        "Setelah punya kerangka, sekarang waktunya ngembangin 'isi dapur'nya
        cerita agar setiap elemen konsisten sampai akhir."
      </div>

      {isLoadingFetch && (
         <div className="w-full text-center py-4 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
            Menyinkronkan data dengan database...
         </div>
      )}

      {/* 1. PROFIL KARAKTER */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4">
          <div>
            <h4 className="font-black text-sm uppercase tracking-tighter text-slate-800">
              1. Profil Karakter
            </h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Mencatat detail tokoh agar konsisten.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddKarakter}
            className="text-[9px] bg-[#1E4E8C] text-white px-5 py-2 rounded-full font-black hover:bg-blue-800 transition-all active:scale-95 shadow-md uppercase tracking-widest"
          >
            + Tokoh
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200">
          {(formData.karakter || []).map((char: any, index: number) => (
            <div
              key={index}
              className="min-w-[350px] md:min-w-[450px] snap-start bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg relative group animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="NAMA TOKOH"
                    className="w-full bg-transparent text-base font-black border-b border-slate-50 focus:border-[#1E4E8C] outline-none pb-1 text-black placeholder-slate-200 transition-all uppercase tracking-tighter"
                    value={char.nama || ""}
                    onChange={(e) => handleCharacterChange(index, "nama", e.target.value)}
                  />
                </div>
                {formData.karakter.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveKarakter(index)}
                    className="ml-4 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div className="flex gap-6">
                  <div
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="w-32 h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 hover:bg-slate-100 cursor-pointer transition-all overflow-hidden relative group/img"
                  >
                    {char.image ? (
                      <>
                        <img src={char.image} alt="Profile" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                          <span className="text-white text-[8px] font-black uppercase tracking-widest">Ubah</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl mb-1">🖼️</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">Foto Tokoh</span>
                      </>
                    )}
                    <input type="file" hidden accept="image/*" ref={(el) => { fileInputRefs.current[index] = el; }} onChange={(e) => handleImageUpload(index, e)} />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Umur & Status</label>
                      <input
                        type="text"
                        placeholder="Misal: 25 Tahun"
                        className="w-full p-2 text-[10px] font-bold rounded-xl border border-slate-100 bg-slate-50 text-black outline-none focus:ring-1 focus:ring-blue-100 transition-all placeholder-slate-300"
                        value={char.umur || ""}
                        onChange={(e) => handleCharacterChange(index, "umur", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciri Fisik</label>
                      <input
                        type="text"
                        placeholder="Misal: Tinggi"
                        className="w-full p-2 text-[10px] font-bold rounded-xl border border-slate-100 bg-slate-50 text-black outline-none focus:ring-1 focus:ring-blue-100 transition-all placeholder-slate-300"
                        value={char.fisik || ""}
                        onChange={(e) => handleCharacterChange(index, "fisik", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kepribadian</label>
                    <textarea
                      className="w-full text-[10px] font-medium p-4 rounded-3xl border border-slate-100 bg-slate-50 text-black min-h-[90px] outline-none focus:ring-1 focus:ring-blue-100 leading-relaxed placeholder-slate-300"
                      placeholder="Sifat..."
                      value={char.kepribadian || ""}
                      onChange={(e) => handleCharacterChange(index, "kepribadian", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Latar Belakang</label>
                    <textarea
                      className="w-full text-[10px] font-medium p-4 rounded-3xl border border-slate-100 bg-slate-50 text-black min-h-[90px] outline-none focus:ring-1 focus:ring-blue-100 leading-relaxed placeholder-slate-300"
                      placeholder="Masa lalu..."
                      value={char.latarBelakang || ""}
                      onChange={(e) => handleCharacterChange(index, "latarBelakang", e.target.value)}
                    />
                  </div>
                </div>

                {/* DESAIN MOTIVASI, KONFLIK, PERKEMBANGAN TETAP ADA */}
                <div className="space-y-3 pt-4 border-t-2 border-slate-50">
                  <div className="flex items-center gap-4 group/input">
                    <div className="w-2 h-2 rounded-full bg-orange-400 group-hover/input:scale-150 transition-all"></div>
                    <input
                      type="text"
                      placeholder="MOTIVASI (Apa yang dia inginkan?)"
                      className="flex-1 text-[10px] font-black bg-transparent outline-none border-b border-transparent focus:border-orange-200 text-black placeholder-slate-300 uppercase tracking-tight py-1"
                      value={char.motivasi || ""}
                      onChange={(e) => handleCharacterChange(index, "motivasi", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-4 group/input">
                    <div className="w-2 h-2 rounded-full bg-red-400 group-hover/input:scale-150 transition-all"></div>
                    <input
                      type="text"
                      placeholder="KONFLIK (Apa rintangannya?)"
                      className="flex-1 text-[10px] font-black bg-transparent outline-none border-b border-transparent focus:border-red-200 text-black placeholder-slate-300 uppercase tracking-tight py-1"
                      value={char.konflik || ""}
                      onChange={(e) => handleCharacterChange(index, "konflik", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-4 group/input">
                    <div className="w-2 h-2 rounded-full bg-blue-400 group-hover/input:scale-150 transition-all"></div>
                    <input
                      type="text"
                      placeholder="PERKEMBANGAN (Bagaimana dia berubah?)"
                      className="flex-1 text-[10px] font-black bg-transparent outline-none border-b border-transparent focus:border-blue-200 text-black placeholder-slate-300 uppercase tracking-tight py-1"
                      value={char.perkembangan || ""}
                      onChange={(e) => handleCharacterChange(index, "perkembangan", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. WORLDBUILDING */}
      <section className="space-y-6">
        <div className="border-b-2 border-slate-100 pb-4">
          <h4 className="font-black text-sm uppercase tracking-tighter text-slate-800">
            2. Catatan Lokasi / Dunia
          </h4>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Membangun setting cerita agar suasana terasa nyata.
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-lg space-y-6 animate-in fade-in duration-700">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-[#1E4E8C] uppercase tracking-[0.2em] ml-1">
              Nama Tempat / Dunia Utama
            </label>
            <input
              type="text"
              placeholder="Ketik lokasi utama..."
              className="w-full bg-transparent text-lg font-black border-b border-slate-50 focus:border-[#1E4E8C] outline-none pb-2 text-black placeholder-slate-200 transition-all uppercase tracking-tighter"
              value={formData.worldBuilding?.lokasi || ""}
              onChange={(e) => handleNestedChange("worldBuilding", "lokasi", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi & Suasana</label>
                <textarea
                  placeholder="Gambarkan pemandangan, aroma, suara..."
                  className="w-full text-[10px] font-medium p-4 rounded-[2rem] border border-slate-100 bg-slate-50 text-black min-h-[120px] outline-none focus:ring-1 focus:ring-blue-50 leading-relaxed placeholder-slate-300"
                  value={formData.worldBuilding?.deskripsi || ""}
                  onChange={(e) => handleNestedChange("worldBuilding", "deskripsi", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Sejarah Tempat</label>
                <textarea
                  placeholder="Mitos atau peristiwa masa lalu..."
                  className="w-full text-[10px] font-medium p-4 rounded-[2rem] border border-slate-100 bg-slate-50 text-black min-h-[100px] outline-none focus:ring-1 focus:ring-blue-50 leading-relaxed placeholder-slate-300"
                  value={formData.worldBuilding?.sejarah || ""}
                  onChange={(e) => handleNestedChange("worldBuilding", "sejarah", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Karakter yang Tinggal</label>
                <textarea
                  placeholder="Siapa saja tokoh yang sering berada di sini?"
                  className="w-full text-[10px] font-medium p-4 rounded-[2rem] border border-slate-100 bg-slate-50 text-black min-h-[120px] outline-none focus:ring-1 focus:ring-blue-50 leading-relaxed placeholder-slate-300"
                  value={formData.worldBuilding?.karakterPenghuni || ""}
                  onChange={(e) => handleNestedChange("worldBuilding", "karakterPenghuni", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Hubungan Antar Lokasi</label>
                <textarea
                  placeholder="Transportasi atau jalur..."
                  className="w-full text-[10px] font-medium p-4 rounded-[2rem] border border-slate-100 bg-slate-50 text-black min-h-[100px] outline-none focus:ring-1 focus:ring-blue-50 leading-relaxed placeholder-slate-300"
                  value={formData.worldBuilding?.hubungan || ""}
                  onChange={(e) => handleNestedChange("worldBuilding", "hubungan", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GARIS WAKTU */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4">
          <div>
            <h4 className="font-black text-sm uppercase tracking-tighter text-slate-800">
              3. Garis Waktu Cerita
            </h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Melacak kronologi kejadian agar alur tidak berantakan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const newTimeline = { waktu: "", kejadian: "", karakter: "", bab: "" };
              setFormData({ ...formData, timeline: [...(formData.timeline || []), newTimeline] });
            }}
            className="text-[9px] bg-slate-800 text-white px-5 py-2 rounded-full font-black hover:bg-black transition-all active:scale-95 shadow-md uppercase tracking-widest"
          >
            + Kejadian
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-thin scrollbar-thumb-slate-200 snap-x">
          {Array.isArray(formData.timeline) && formData.timeline.length > 0 ? (
            formData.timeline.map((event: any, idx: number) => (
              <div key={idx} className="min-w-[280px] relative pt-10 snap-start group">
                <div className="absolute top-12 left-0 w-full h-1 bg-slate-100 -z-10 group-first:left-1/2 group-last:w-1/2" />
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1E4E8C] rounded-full ring-[4px] ring-white z-10 shadow-lg" />

                <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-md space-y-4 mt-6 hover:border-[#1E4E8C] transition-all relative">
                  <button
                    onClick={() => setFormData({ ...formData, timeline: formData.timeline.filter((_: any, i: number) => i !== idx) })}
                    className="absolute -top-3 -right-3 bg-white text-red-500 w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity border"
                  >✕</button>

                  <input
                    type="text"
                    placeholder="WAKTU / TANGGAL"
                    className="w-full text-[9px] font-black uppercase text-[#1E4E8C] outline-none bg-transparent placeholder-blue-100 tracking-tighter"
                    value={event.waktu || ""}
                    onChange={(e) => {
                      const updated = [...formData.timeline];
                      updated[idx].waktu = e.target.value;
                      setFormData({ ...formData, timeline: updated });
                    }}
                  />
                  <textarea
                    placeholder="Apa yang terjadi?"
                    className="w-full text-[10px] font-medium p-3 rounded-2xl bg-slate-50 text-black outline-none focus:ring-1 focus:ring-blue-100 min-h-[80px] resize-none leading-relaxed placeholder-slate-300"
                    value={event.kejadian || ""}
                    onChange={(e) => {
                      const updated = [...formData.timeline];
                      updated[idx].kejadian = e.target.value;
                      setFormData({ ...formData, timeline: updated });
                    }}
                  />

                  {/* BAGIAN TOKOH DAN BAB TETAP ADA */}
                  <div className="space-y-2 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] font-black text-slate-400 uppercase w-14 tracking-tighter">Tokoh:</span>
                      <input
                        type="text"
                        placeholder="..."
                        className="flex-1 text-[10px] font-bold text-black bg-transparent border-b border-transparent focus:border-slate-100 outline-none placeholder-slate-300"
                        value={event.karakter || ""}
                        onChange={(e) => {
                          const updated = [...formData.timeline];
                          updated[idx].karakter = e.target.value;
                          setFormData({ ...formData, timeline: updated });
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] font-black text-slate-400 uppercase w-14 tracking-tighter">Bab:</span>
                      <input
                        type="text"
                        placeholder="..."
                        className="flex-1 text-[10px] font-bold text-black bg-transparent border-b border-transparent focus:border-slate-100 outline-none placeholder-slate-300"
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
              <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] italic">Belum ada kronologi</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. PAPAN PLOT */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
          <div>
            <h4 className="font-black text-sm uppercase tracking-tighter text-slate-800">
              4. Papan Plot (Story Board)
            </h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Drag & Drop kartu adegan ke bab yang sesuai.
            </p>
          </div>
          <button
            onClick={handleAddBabak}
            className="text-[9px] bg-slate-100 text-slate-500 px-5 py-2.5 rounded-full font-black hover:bg-[#1E4E8C] hover:text-white transition-all shadow-sm uppercase tracking-widest"
          >
            + Babak
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-slate-200">
            {columns.map((babak: any) => {
              const itemsInBabak = (plotItems || []).filter((item) => item.babak === babak.id);

              return (
                <div key={babak.id} className="min-w-[320px] flex flex-col group/col">
                  <div className="bg-slate-50 p-5 rounded-[2.5rem] border-t-[10px] border-[#1E4E8C] shadow-lg flex-1 flex flex-col relative transition-all hover:shadow-xl">
                    <div className="flex items-center gap-3 mb-6 px-2">
                      <input
                        className="bg-transparent font-black text-[11px] text-slate-800 uppercase italic outline-none border-b-2 border-transparent focus:border-slate-200 flex-1 tracking-tighter placeholder-slate-300"
                        value={babak.title}
                        onChange={(e) => handleUpdateBabakTitle(babak.id, e.target.value)}
                        placeholder="NAMA BABAK..."
                      />
                      {columns.length > 1 && (
                        <button onClick={() => handleDeleteBabak(babak.id)} className="opacity-0 group-hover/col:opacity-100 text-[9px] font-bold text-red-300 hover:text-red-500 transition-all uppercase tracking-tighter">Hapus</button>
                      )}
                    </div>

                    <SortableContext id={babak.id} items={itemsInBabak.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                      <DroppableColumn id={babak.id}>
                        {itemsInBabak.map((item) => (
                          <SortablePlotCard key={item.id} id={item.id} label={item.label} description={item.desc} type={item.type} onDelete={handleDeleteAdegan} onUpdate={handleUpdateAdegan} />
                        ))}
                        {itemsInBabak.length === 0 && (
                          <div className="h-full border-4 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center text-[9px] text-slate-400 uppercase font-black text-center px-6 italic py-16 pointer-events-none tracking-widest leading-relaxed">
                            Kosongkan alur<br />Tarik ke sini
                          </div>
                        )}
                      </DroppableColumn>
                    </SortableContext>

                    <button
                      onClick={() => handleAddAdegan(babak.id)}
                      className="w-full py-4 border-2 border-dashed border-slate-300 rounded-[2rem] text-[9px] font-black text-slate-400 hover:bg-white hover:text-[#1E4E8C] hover:border-[#1E4E8C] transition-all uppercase mt-6 tracking-widest"
                    >+ Tambah Adegan</button>
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