"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { ExpProjectCard } from "@/components/experiment/ExpProjectCard";
import { ExpFooter } from "@/components/experiment/ExpFooter";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STEPS = [
  { id: 1, title: "Pramenulis", desc: "Ide & Riset" },
  { id: 2, title: "Pengembangan", desc: "Karakter & Plot" },
  { id: 3, title: "Penulisan", desc: "Draf Inti" },
  { id: 4, title: "Revisi", desc: "Editing" },
  { id: 5, title: "Finalisasi", desc: "Persiapan Terbit" },
];

const SortablePlotCard = ({ id, label, description, type }: any) => {
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
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:border-[#1E4E8C] transition-colors group"
    >
      <div className="flex justify-between items-start">
        <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase">
          {type}
        </span>
        <span className="text-slate-300 group-hover:text-slate-500 text-xs">
          ⠿
        </span>
      </div>
      <p className="text-xs font-bold mt-2 text-slate-800">{label}</p>
      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
        {description}
      </p>
    </div>
  );
};

const AddProjectModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) => {
  // 1. SEMUA HOOKS WAJIB DI SINI (URUTAN TETAP)
  const [formData, setFormData] = useState({
    ideCepat: "",
    outline: "",
    karakter: { nama: "", deskripsi: "" },
    worldBuilding: { lokasi: "", deskripsi: "" },
    targetKata: "1000",
    isKonsisten: false,
    versi: "v1.0",
    currentWordCount: 0,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isZenMode, setIsZenMode] = useState(false);

  const [plotItems, setPlotItems] = useState([
    {
      id: "p1",
      label: "Pertemuan Tak Terduga",
      desc: "Tokoh utama bertemu mentor di stasiun.",
      type: "Konflik",
      babak: "Babak I",
    },
    {
      id: "p2",
      label: "Panggilan Petualangan",
      desc: "Menerima surat misteri dari masa lalu.",
      type: "Plot Twist",
      babak: "Babak I",
    },
    {
      id: "p3",
      label: "Konfrontasi Pertama",
      desc: "Menghadapi rintangan awal di hutan.",
      type: "Aksi",
      babak: "Babak II",
    },
  ]);

  // PINDAHKAN INI KE ATAS JUGA
  const [outlineItems, setOutlineItems] = useState([
    {
      id: "ot-1",
      title: "Bab 1: Awal Mula",
      sub1: "↳ Pengenalan karakter utama",
      sub2: "• Detail: Kehidupan di desa",
    },
    {
      id: "ot-2",
      title: "Bab 2: Konflik Muncul",
      sub1: "↳ Kedatangan orang asing",
      sub2: "• Detail: Pesan misterius",
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [comments, setComments] = useState([
    {
      id: 1,
      text: "Cek kembali data sejarah di paragraf 2",
      label: "Cek Fakta",
      status: "open",
    },
    {
      id: 2,
      text: "Tambahkan deskripsi aroma pasar di sini",
      label: "Tambah Deskripsi",
      status: "done",
    },
  ]);

  const [versions, setVersions] = useState([
    {
      id: "v1",
      name: "Draft Awal",
      date: "01 Maret 2026",
      note: "Selesai babak 1",
    },
    {
      id: "v2",
      name: "Revisi Dialog",
      date: "02 Maret 2026",
      note: "Memperbaiki interaksi tokoh utama",
    },
  ]);

  const [previewConfig, setPreviewConfig] = useState({
    fontFamily: "font-serif",
    fontSize: "14px",
    pageSize: "A5",
    margin: "normal",
  });

  // 2. FUNGSI HANDLER
  const handleOutlineDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOutlineItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const SortableOutlineItem = ({ item }: { item: any }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-start gap-3 bg-white border-2 border-slate-100 p-4 rounded-xl shadow-sm group hover:border-[#1E4E8C] transition-colors"
      >
        {/* Handle Drag */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing pt-1"
        >
          <span className="text-slate-300 group-hover:text-[#1E4E8C] text-lg">
            ⠿
          </span>
        </div>

        <div className="flex-1 space-y-2">
          <input
            type="text"
            placeholder="Judul Bab..."
            defaultValue={item.title}
            className="w-full font-black text-sm outline-none border-b border-transparent focus:border-slate-200 text-black placeholder-slate-400 bg-white"
          />
          <div className="ml-6 space-y-2">
            <input
              type="text"
              placeholder="↳ Tambah Sub-bab..."
              defaultValue={item.sub1}
              className="w-full text-xs text-black placeholder-slate-400 outline-none bg-white font-medium"
            />
            <input
              type="text"
              placeholder="  • Tambah Detail adegan..."
              defaultValue={item.sub2}
              className="w-full text-[10px] text-black placeholder-slate-400 ml-4 outline-none bg-white"
            />
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...(prev as any)[parent], [field]: value },
    }));
  };

  // Handler saat kartu digeser di atas kontainer lain
  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Cari babak asal dan babak tujuan
    const activeItem = plotItems.find((i) => i.id === activeId);
    const overItem = plotItems.find((i) => i.id === overId);

    // Jika kita drag di atas babak kosong (ID babak itu sendiri)
    const isOverAContainer = ["Babak I", "Babak II", "Babak III"].includes(
      overId,
    );

    if (activeItem) {
      const overContainer = isOverAContainer ? overId : overItem?.babak;

      if (overContainer && activeItem.babak !== overContainer) {
        setPlotItems((prev) => {
          const activeIndex = prev.findIndex((i) => i.id === activeId);
          const newItems = [...prev];
          newItems[activeIndex] = {
            ...newItems[activeIndex],
            babak: overContainer,
          };
          return newItems;
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPlotItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    onSave({ ...formData, plotItems });
    onClose();
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
      >
        {/* Header & Progress Bar */}
        <div className="p-8 border-b bg-slate-50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                Perencanaan Buku
              </h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                Tahap {currentStep}: {STEPS[currentStep - 1].title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${currentStep >= step.id ? "bg-[#1E4E8C]" : "bg-slate-200"}`}
              />
            ))}
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-[#1E4E8C] text-sm italic text-slate-700">
                    "Ini tahap paling awal, sebelum nulis kata pertama.
                    Fungsinya buat nangkep ide, nyimpen riset, dan nyusun
                    kerangka."
                  </div>

                  {/* 1. Catatan Ide Cepat */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-end border-b pb-2">
                      <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
                        1. Catatan Ide Cepat
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Biar ide nggak hilang
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Judul Ide"
                          className="w-full border-2 border-slate-100 p-2 rounded-t-xl focus:border-[#1E4E8C] outline-none font-bold text-sm text-black placeholder-slate-400 bg-white"
                          value={formData.ideCepat}
                          onChange={(e) =>
                            handleInputChange("ideCepat", e.target.value)
                          }
                        />
                        <textarea
                          placeholder="Deskripsi singkat ide..."
                          className="w-full border-2 border-t-0 border-slate-100 p-3 rounded-b-xl focus:border-[#1E4E8C] outline-none text-sm min-h-[80px] text-black placeholder-slate-400 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <input
                          type="date"
                          className="w-full border-2 border-slate-100 p-2 rounded-xl text-xs text-black bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Tag Kategori (Misal: Plot Twist)"
                          className="w-full border-2 border-slate-100 p-2 rounded-xl text-xs text-black placeholder-slate-400 bg-white"
                        />
                      </div>
                    </div>
                  </section>

                  {/* 2. Papan Visi / Mood Board - Tidak ada input teks besar di sini */}
                  {/* 2. Papan Visi / Mood Board */}

                  <section className="space-y-4">
                    <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 border-b pb-2">
                      2. Papan Visi / Mood Board
                    </h4>

                    <p className="text-[11px] text-slate-500 italic">
                      Menampung inspirasi visual (gambar referensi karakter,
                      lokasi, suasana).
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            🖼️
                          </span>

                          <span className="text-[10px] font-black text-slate-400 mt-2 uppercase">
                            Upload / Link
                          </span>
                        </div>
                      ))}

                      <div className="aspect-square border-2 border-slate-100 rounded-2xl p-3 flex flex-col justify-between">
                        <select className="text-[9px] font-bold border-none bg-transparent outline-none uppercase text-[#1E4E8C]">
                          <option>Per Karakter</option>

                          <option>Per Bab</option>
                        </select>

                        <div className="h-full flex items-center justify-center text-[10px] text-slate-300 italic">
                          Kelompokkan inspirasimu{" "}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 3. Database Riset */}
                  <section className="space-y-4">
                    <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 border-b pb-2">
                      3. Database Riset
                    </h4>
                    <div className="bg-slate-900 p-5 rounded-2xl space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Cari riset atau filter tag... "
                          className="flex-1 bg-slate-800 border-none rounded-lg p-2 text-xs text-white placeholder-slate-400 outline-none"
                        />
                        <button className="bg-[#1E4E8C] text-white px-4 py-2 rounded-lg text-xs font-black uppercase">
                          Tambah Sumber
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white">
                        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                          <input
                            type="text"
                            placeholder="Judul Sumber (Artikel/Jurnal)"
                            className="w-full bg-transparent border-b border-slate-600 mb-2 text-xs text-white placeholder-slate-500 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Link/URL "
                            className="w-full bg-transparent text-[10px] text-blue-400 placeholder-slate-500 outline-none"
                          />
                          <textarea
                            placeholder="Catatan penting riset..."
                            className="w-full bg-slate-700 mt-2 p-2 rounded text-[10px] text-white placeholder-slate-400 outline-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 4. Penyusun Outline */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
                        4. Penyusun Outline
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Susun Struktur Cerita
                      </span>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleOutlineDragEnd}
                    >
                      <SortableContext
                        items={outlineItems.map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {outlineItems.map((item) => (
                            <SortableOutlineItem key={item.id} item={item} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    <button
                      onClick={() =>
                        setOutlineItems([
                          ...outlineItems,
                          {
                            id: `ot-${Date.now()}`,
                            title: "",
                            sub1: "",
                            sub2: "",
                          },
                        ])
                      }
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-black text-slate-400 hover:text-[#1E4E8C] hover:border-[#1E4E8C] transition-all uppercase bg-slate-50/50"
                    >
                      + Tambah Bab Baru (Bisa Di-drag)
                    </button>
                  </section>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-[#1E4E8C] text-sm italic text-slate-700">
                    "Setelah punya kerangka, sekarang waktunya ngembangin 'isi
                    dapur'nya cerita."
                  </div>

                  {/* 1. Profil Karakter */}
                  <section className="space-y-4">
                    <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 border-b pb-2">
                      1. Profil Karakter
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <input
                          type="text"
                          placeholder="Nama Tokoh"
                          className="w-full bg-transparent font-bold border-b border-slate-300 focus:border-[#1E4E8C] outline-none pb-1 text-black placeholder-slate-500"
                          value={formData.karakter.nama}
                          onChange={(e) =>
                            handleNestedChange(
                              "karakter",
                              "nama",
                              e.target.value,
                            )
                          }
                        />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Umur"
                            className="p-2 rounded bg-white border text-black placeholder-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Fisik"
                            className="p-2 rounded bg-white border text-black placeholder-slate-400"
                          />
                        </div>
                        <textarea
                          placeholder="Kepribadian, Latar Belakang, Motivasi, Konflik, & Perkembangan Karakter"
                          className="w-full text-sm p-3 rounded-xl border bg-white min-h-[100px] text-black placeholder-slate-400 outline-none focus:ring-1 focus:ring-[#1E4E8C]"
                          value={formData.karakter.deskripsi}
                          onChange={(e) =>
                            handleNestedChange(
                              "karakter",
                              "deskripsi",
                              e.target.value,
                            )
                          }
                        />
                        <div className="text-[10px] text-slate-400 italic font-bold uppercase cursor-pointer hover:text-[#1E4E8C] transition-colors">
                          + Upload Gambar Referensi
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. Worldbuilding (Setting) */}
                  <section className="space-y-4">
                    <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 border-b pb-2">
                      2. Worldbuilding (Setting)
                    </h4>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <input
                        type="text"
                        placeholder="Nama Tempat / Lokasi"
                        className="w-full bg-transparent font-bold border-b border-slate-300 focus:border-[#1E4E8C] outline-none text-black placeholder-slate-500"
                        value={formData.worldBuilding.lokasi}
                        onChange={(e) =>
                          handleNestedChange(
                            "worldBuilding",
                            "lokasi",
                            e.target.value,
                          )
                        }
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea
                          placeholder="Deskripsi & Suasana"
                          className="text-sm p-3 rounded-lg border bg-white h-24 text-black placeholder-slate-400 outline-none"
                        />
                        <textarea
                          placeholder="Sejarah & Hubungan antar lokasi"
                          className="text-sm p-3 rounded-lg border bg-white h-24 text-black placeholder-slate-400 outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Karakter yang tinggal di sini"
                        className="w-full text-sm p-2 rounded border bg-white text-black placeholder-slate-400"
                      />
                    </div>
                  </section>

                  {/* 3. Garis Waktu Cerita (Timeline) */}
                  <section className="space-y-4">
                    <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 border-b pb-2">
                      3. Garis Waktu (Timeline)
                    </h4>
                    <div className="overflow-x-auto pb-4 flex gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[200px] relative pt-6">
                          <div className="absolute top-0 left-0 w-4 h-4 bg-[#1E4E8C] rounded-full z-10" />
                          <div className="border-l-2 border-[#1E4E8C] pl-4 space-y-2">
                            <input
                              type="text"
                              placeholder="Waktu/Tanggal"
                              className="text-[10px] font-black uppercase text-[#1E4E8C] outline-none bg-transparent placeholder-slate-400"
                            />
                            <textarea
                              placeholder="Kejadian penting..."
                              className="w-full text-xs p-2 rounded border bg-white text-black placeholder-slate-400"
                              rows={2}
                            />
                            <input
                              type="text"
                              placeholder="Karakter terlibat"
                              className="text-[9px] w-full border-none bg-transparent italic text-black placeholder-slate-400 outline-none"
                            />
                          </div>
                        </div>
                      ))}
                      <button className="min-w-[100px] text-xs font-bold text-slate-400 hover:text-[#1E4E8C] transition-colors uppercase">
                        + Tambah Kejadian
                      </button>
                    </div>
                  </section>

                  {/* 4. Papan Plot (Story Board) */}
                  <section className="space-y-4">
                    <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 border-b pb-2">
                      4. Papan Plot (Story Board)
                    </h4>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {["Babak I", "Babak II", "Babak III"].map(
                          (babakLabel) => {
                            const itemsInBabak = plotItems.filter(
                              (item) => item.babak === babakLabel,
                            );

                            return (
                              <div
                                key={babakLabel}
                                className="min-w-[280px] flex flex-col"
                              >
                                <div className="bg-slate-100 p-4 rounded-2xl border-t-4 border-[#1E4E8C] shadow-sm flex-1">
                                  <p className="font-black text-xs mb-4 text-slate-600 uppercase italic">
                                    {babakLabel}{" "}
                                    {babakLabel === "Babak I"
                                      ? "(Perkenalan)"
                                      : babakLabel === "Babak II"
                                        ? "(Konflik)"
                                        : "(Resolusi)"}
                                  </p>

                                  <SortableContext
                                    id={babakLabel}
                                    items={itemsInBabak.map((i) => i.id)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    <div className="space-y-3 min-h-[150px]">
                                      {itemsInBabak.map((item) => (
                                        <SortablePlotCard
                                          key={item.id}
                                          id={item.id}
                                          label={item.label}
                                          description={item.desc}
                                          type={item.type}
                                        />
                                      ))}

                                      {itemsInBabak.length === 0 && (
                                        <div className="h-20 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400 uppercase font-bold text-center px-4 italic">
                                          Tarik adegan ke sini
                                        </div>
                                      )}
                                    </div>
                                  </SortableContext>

                                  <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-[10px] font-black text-slate-400 hover:bg-white hover:text-[#1E4E8C] hover:border-[#1E4E8C] transition-all uppercase mt-4">
                                    + Tambah Adegan
                                  </button>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </DndContext>
                  </section>
                </div>
              )}
              {currentStep === 3 && (
                <div
                  className={`space-y-8 transition-all duration-500 ${isZenMode ? "fixed inset-0 z-[100] bg-white p-12 overflow-y-auto" : ""}`}
                >
                  {/* Header & Fokus Toggle */}
                  <div
                    className={`${isZenMode ? "max-w-4xl mx-auto" : ""} flex justify-between items-center border-b-2 border-slate-100 pb-4`}
                  >
                    <h4 className="font-black uppercase tracking-tighter text-black italic text-lg">
                      {isZenMode
                        ? "📝 Zen Writing Mode"
                        : "1. Editor Teks Utama"}
                    </h4>
                    <button
                      onClick={() => setIsZenMode(!isZenMode)}
                      className="text-[10px] font-black bg-black text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all uppercase shadow-xl active:scale-95"
                    >
                      {isZenMode ? "Keluar Mode Fokus" : "Mode Fokus 🧘‍♂️"}
                    </button>
                  </div>

                  <div
                    className={`${isZenMode ? "max-w-4xl mx-auto" : "space-y-6"}`}
                  >
                    <div className="border-2 border-slate-200 rounded-3xl overflow-hidden bg-white shadow-2xl">
                      {/* TOOLBAR FORMATTING */}
                      <div className="bg-slate-50 px-6 py-4 border-b-2 border-slate-100 flex flex-wrap items-center gap-4 sticky top-0 z-10">
                        {/* Group 1: Gaya Dasar */}
                        <div className="flex bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-black font-black">
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              document.execCommand("bold", false);
                            }}
                            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white font-serif text-xl border-r-2 border-slate-100 transition-all"
                            title="Bold"
                          >
                            B
                          </button>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              document.execCommand("italic", false);
                            }}
                            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white font-serif italic text-xl border-r-2 border-slate-100 transition-all"
                            title="Italic"
                          >
                            I
                          </button>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              document.execCommand("underline", false);
                            }}
                            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white font-serif underline text-xl transition-all"
                            title="Underline"
                          >
                            U
                          </button>
                        </div>
                        {/* Group 2: Alignment (Custom SVG - Mirip Gambar) */}
                        <div className="flex bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden text-black">
                          {/* Rata Kiri */}
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              document.execCommand("justifyLeft", false);
                            }}
                            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-all"
                            title="Rata Kiri"
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <line x1="3" y1="12" x2="15" y2="12" />
                              <line x1="3" y1="18" x2="18" y2="18" />
                            </svg>
                          </button>

                          {/* Rata Tengah */}
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              document.execCommand("justifyCenter", false);
                            }}
                            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white border-r-2 border-slate-100 transition-all"
                            title="Rata Tengah"
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <line x1="6" y1="12" x2="18" y2="12" />
                              <line x1="5" y1="18" x2="19" y2="18" />
                            </svg>
                          </button>

                          {/* Rata Kanan */}
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              document.execCommand("justifyRight", false);
                            }}
                            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white transition-all"
                            title="Rata Kanan"
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <line x1="9" y1="12" x2="21" y2="12" />
                              <line x1="6" y1="18" x2="21" y2="18" />
                            </svg>
                          </button>
                        </div>

                        <div className="w-[2px] h-8 bg-slate-200 mx-1" />

                        {/* Group 3: Headings */}
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border-2 border-slate-200 shadow-sm text-black">
                          {["<h1>", "<h2>", "<h3>"].map((h, i) => (
                            <button
                              key={h}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                document.execCommand("formatBlock", false, h);
                              }}
                              className="px-5 h-10 flex items-center justify-center hover:bg-black hover:text-white text-[12px] font-black border-r-2 border-slate-100 last:border-0 transition-all rounded-md"
                            >
                              H{i + 1}
                            </button>
                          ))}
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              document.execCommand("formatBlock", false, "<p>");
                            }}
                            className="px-5 h-10 flex items-center justify-center hover:bg-black hover:text-white text-[11px] font-black uppercase transition-all rounded-md ml-1"
                          >
                            Normal
                          </button>
                        </div>

                        <div className="flex-1" />
                        <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full shadow-lg">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                            Safe
                          </span>
                        </div>
                      </div>

                      {/* AREA KETIK */}
                      <div
                        contentEditable
                        suppressContentEditableWarning={true}
                        onInput={(e) => {
                          const textContent = (e.target as HTMLElement)
                            .innerText;
                          const words = textContent
                            .trim()
                            .split(/\s+/)
                            .filter((w) => w !== "").length;
                          handleInputChange("currentWordCount", words);
                        }}
                        className={`w-full outline-none font-serif leading-relaxed text-black min-h-[500px] overflow-y-auto transition-all
            ${isZenMode ? "text-2xl py-12 px-16" : "text-xl p-12"}
            [&>h1]:text-5xl [&>h1]:font-black [&>h1]:mb-8 [&>h1]:mt-10 [&>h1]:text-black
            [&>h2]:text-3xl [&>h2]:font-black [&>h2]:mb-6 [&>h2]:mt-8 [&>h2]:text-black
            [&>h3]:text-2xl [&>h3]:font-black [&>h3]:mb-4 [&>h3]:mt-6 [&>h3]:text-black
            [&>p]:mb-6`}
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {/* User menulis di sini */}
                      </div>
                    </div>

                    {/* Progress Footer */}
                    {!isZenMode && (
                      <div className="bg-black p-10 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl border-t-8 border-slate-800">
                        <div className="space-y-2">
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
                            Statistik Kata
                          </p>
                          <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black italic text-white">
                              {(formData as any).currentWordCount || 0}
                            </span>
                            <span className="text-md font-bold text-slate-500 uppercase italic">
                              / {formData.targetKata}
                            </span>
                          </div>
                        </div>

                        <div className="w-1/2 space-y-4">
                          <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-widest text-slate-400">
                            <span>Target Hari Ini</span>
                            <span className="text-white bg-slate-800 px-3 py-1 rounded-md">
                              {Math.min(
                                Math.round(
                                  (((formData as any).currentWordCount || 0) /
                                    (parseInt(formData.targetKata) || 1)) *
                                    100,
                                ),
                                100,
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-[1px]">
                            <motion.div
                              animate={{
                                width: `${Math.min((((formData as any).currentWordCount || 0) / (parseInt(formData.targetKata) || 1)) * 100, 100)}%`,
                              }}
                              className="h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* --- TAHAP 4: REVISI --- */}
              {/* --- TAHAP 4: REVISI --- */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500 text-sm italic text-slate-700">
                    "Draft pertama selesai! Sekarang waktunya jadi kritikus
                    paling jujur buat karya sendiri. Poles sampai mengkilap!"
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1. PENCATAT REVISI / KOMENTAR */}
                    <section className="lg:col-span-2 space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
                          1. Pencatat Revisi
                        </h4>
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                          SIDE COMMENTARY
                        </span>
                      </div>

                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`p-4 rounded-2xl border-2 transition-all ${comment.status === "done" ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-100 shadow-sm"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                  comment.label === "Cek Fakta"
                                    ? "bg-red-100 text-red-600"
                                    : comment.label === "Plot Hole"
                                      ? "bg-purple-100 text-purple-600"
                                      : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {comment.label}
                              </span>
                              <input
                                type="checkbox"
                                checked={comment.status === "done"}
                                onChange={() => {}}
                                className="rounded-full border-slate-300"
                              />
                            </div>
                            <p className="text-xs font-bold text-slate-800 leading-relaxed">
                              {comment.text}
                            </p>
                            <div className="mt-3 flex gap-2">
                              <button className="text-[9px] font-black text-slate-400 hover:text-[#1E4E8C] uppercase">
                                Edit
                              </button>
                              <button className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase">
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                        <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:border-[#1E4E8C] hover:text-[#1E4E8C] transition-all uppercase">
                          + Tambah Catatan Revisi Baru
                        </button>
                      </div>
                    </section>

                    <div className="space-y-6">
                      {/* 2. MANAJEMEN VERSI */}
                      <section className="space-y-4">
                        <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 border-b pb-2">
                          2. Versi Naskah
                        </h4>
                        <div className="bg-slate-900 rounded-2xl p-4 space-y-4 shadow-xl">
                          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {versions.map((v) => (
                              <div
                                key={v.id}
                                className="p-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-[#1E4E8C] cursor-pointer transition-all group"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black text-white">
                                    {v.name}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-500 uppercase">
                                    {v.date}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1 italic line-clamp-1">
                                  {v.note}
                                </p>
                              </div>
                            ))}
                          </div>
                          <button className="w-full py-2 bg-[#1E4E8C] text-white text-[10px] font-black rounded-lg uppercase hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                            Save as New Version
                          </button>
                        </div>
                      </section>

                      {/* 3. PEMERIKSA KONSISTENSI */}
                      <section className="space-y-4">
                        <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 border-b pb-2">
                          3. Cek Konsistensi
                        </h4>
                        <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
                          <p className="text-[10px] text-slate-500 font-bold uppercase italic border-b pb-2">
                            Detail Karakter & Dunia:
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                              <div>
                                <p className="text-[10px] font-black text-slate-800">
                                  {formData.karakter.nama || "Nama Tokoh"}
                                </p>
                                <p className="text-[9px] text-slate-500">
                                  Mata: Biru | Umur: 25
                                </p>
                              </div>
                              <input type="checkbox" className="rounded-sm border-slate-300" />
                            </div>
                          </div>
                          <div className="pt-2">
                            <div className="flex items-center gap-2 mb-3">
                              <input
                                type="checkbox"
                                id="konsisten-check"
                                checked={formData.isKonsisten}
                                onChange={(e) => handleInputChange("isKonsisten", e.target.checked)}
                                className="w-4 h-4 rounded text-[#1E4E8C]"
                              />
                              <label htmlFor="konsisten-check" className="text-[10px] font-black uppercase text-slate-600 cursor-pointer">
                                Naskah Sudah Konsisten
                              </label>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAHAP 5: FINALISASI --- */}
              {currentStep === 5 && (
                <div className="flex flex-col h-full max-h-[65vh] space-y-4 overflow-hidden">
                  {/* Alert Header */}
                  <div className="bg-green-50 px-4 py-3 rounded-xl border-l-4 border-green-600 text-[11px] italic text-slate-700 shadow-sm shrink-0">
                    "GARIS FINISH SUDAH TERLIHAT! SIAPKAN NASKAH KAMU AGAR SIAP TERBIT."
                  </div>

                  {/* Main Content Area */}
                  <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden p-1">
                    <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] bg-[#1E4E8C] rounded-full -z-0 opacity-10 hidden lg:block" />

                    {/* 1. PREVIEW LAYOUT */}
                    <section className="lg:col-span-7 flex flex-col space-y-3 relative z-10 min-h-0">
                      <div className="flex justify-between items-center shrink-0">
                        <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-700">
                          1. PREVIEW LAYOUT
                        </h4>
                        <div className="flex gap-2">
                          <select
                            value={previewConfig.fontFamily}
                            onChange={(e) => setPreviewConfig({ ...previewConfig, fontFamily: e.target.value })}
                            className="text-[9px] font-black border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none"
                          >
                            <option value="font-serif">Serif</option>
                            <option value="font-sans">Sans</option>
                          </select>
                        </div>
                      </div>

                      {/* Frame Simulasi Buku */}
                      <div className="flex-1 bg-slate-100/80 backdrop-blur-sm rounded-[2rem] shadow-inner flex items-center justify-center gap-4 border border-white/50 overflow-hidden p-4">
                        <div className={`bg-white w-[180px] h-[260px] shadow-xl rounded-l-sm rounded-r-md p-6 flex flex-col relative ${previewConfig.fontFamily} scale-95 md:scale-100`}>
                          <div className="absolute top-3 left-0 right-0 text-center">
                            <p className="text-[6px] text-slate-300 font-black italic">HALAMAN GANJIL</p>
                          </div>
                          <div className="mt-4 flex-1">
                            <p className="text-[8px] leading-relaxed text-slate-800 text-justify font-medium uppercase">
                              Langkah pertama dimulai di sini. Cahaya lampu ruangan berpendar di atas meja kayu tua...
                            </p>
                          </div>
                        </div>

                        <div className={`bg-white w-[180px] h-[260px] shadow-xl rounded-r-sm rounded-l-md p-6 flex flex-col relative border-l border-slate-100 hidden md:flex ${previewConfig.fontFamily} scale-95 md:scale-100`}>
                          <div className="absolute top-3 left-0 right-0 text-center">
                            <p className="text-[6px] text-slate-300 font-black italic">HALAMAN GENAP</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* 2. EXPORT CENTER */}
                    <section className="lg:col-span-5 flex flex-col space-y-4 relative z-10 min-h-0">
                      <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-700 shrink-0">
                        2. EXPORT CENTER
                      </h4>

                      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                        <button className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-slate-50 transition-all border border-slate-100 shadow-sm shrink-0">
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-black text-[10px]">PDF</div>
                          <div className="text-left">
                            <p className="text-xs font-black text-slate-900">Export to PDF</p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase">PRINT READY</p>
                          </div>
                        </button>

                        <button className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-slate-50 transition-all border border-slate-100 shadow-sm shrink-0">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-[10px]">DOCX</div>
                          <div className="text-left">
                            <p className="text-xs font-black text-slate-900">Export to Word</p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase">EDITABLE</p>
                          </div>
                        </button>
                        
                        <div className="mt-auto p-3 bg-[#1E4E8C] rounded-xl text-white shrink-0">
                          <p className="text-[10px] font-bold italic">"Naskah akan disimpan sebagai versi final v1.0."</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

       {/* Footer Navigator */}
        <div className="p-8 border-t bg-slate-50 flex justify-between shrink-0">
          <button 
            onClick={() => setCurrentStep(prev => prev - 1)} 
            disabled={currentStep === 1}
            className={`font-black text-sm uppercase transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ← Kembali
          </button>
          
          <button 
            onClick={currentStep === 5 ? handleSubmit : () => setCurrentStep(prev => prev + 1)}
            className="px-10 py-4 bg-[#1E4E8C] text-white font-black rounded-full hover:bg-blue-900 shadow-lg uppercase text-sm transition-all active:scale-95"
          >
            {currentStep === 5 ? 'Simpan Proyek' : 'Selanjutnya →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function ExperimentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State Proyek Utama (Data Dummy)
  const [projects, setProjects] = useState([
    {
      title: "Menulis Buku Biografi Mamak",
      lastUpdate: "12 Januari 2026",
      obstacle: "Belum paham mengatur alur cerita",
    },
    {
      title: "Buku Kumpulan Cerita Lucu",
      lastUpdate: "12 Januari 2026",
      obstacle: "Menuangkan jokes ke dalam bentuk tulisan",
    },
  ]);

  const addNewProject = (data: any) => {
    // Simulasi penambahan data baru ke list
    const newProj = {
      title: data.ideCepat || "Buku Tanpa Judul",
      lastUpdate: "02 Maret 2026",
      obstacle: data.outline.substring(0, 50) + "...",
    };
    setProjects([newProj, ...projects]);
  };

  return (
    <Sidebar>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto space-y-8"
      >
        <header className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            EXPERIMENT
          </h1>
          <p className="text-slate-800 font-bold text-lg italic">
            Ini adalah ruang untuk melakukan penulisan buku kamu
          </p>
        </header>

        <section className="space-y-4 pt-4">
          {projects.map((proj, idx) => (
            <ExpProjectCard key={idx} {...proj} />
          ))}
        </section>

        <div className="flex justify-end pr-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[#1E4E8C] font-black text-sm italic hover:underline uppercase"
          >
            + Tambah Proyek Baru
          </button>
        </div>

        <ExpFooter />
        <AddProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addNewProject}
        />
      </motion.div>
    </Sidebar>
  );
}
