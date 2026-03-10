"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableOutlineItem = ({
  item,
  onChange,
}: {
  item: any;
  onChange: (id: string, field: string, value: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: "relative" as const,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-4 bg-white border-2 p-5 rounded-2xl shadow-sm transition-all duration-300 ${isDragging ? "border-[#1E4E8C] shadow-xl scale-[1.02]" : "border-slate-100"} group hover:border-indigo-300 hover:shadow-md`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing pt-1 touch-none"
      >
        <div className="bg-slate-50 group-hover:bg-indigo-50 p-2 rounded-lg transition-colors">
          <span className="text-slate-400 group-hover:text-[#1E4E8C] text-xl block">
            ⠿
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <div className="relative">
          <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
            Struktur Bab
          </label>
          <input
            type="text"
            placeholder="Judul Bab (Contoh: Bab 1: Awal Mula)"
            value={item.title}
            onChange={(e) => onChange(item.id, "title", e.target.value)}
            className="w-full font-black text-[12px] outline-none border-b-2 border-slate-50 focus:border-indigo-500 text-slate-800 placeholder-slate-300 bg-transparent uppercase tracking-tight transition-all"
          />
        </div>
        <div className="ml-4 space-y-3 border-l-2 border-slate-50 pl-4">
          <input
            type="text"
            placeholder="↳ Tambah Sub-bab..."
            value={item.sub1}
            onChange={(e) => onChange(item.id, "sub1", e.target.value)}
            className="w-full text-[11px] text-slate-700 placeholder-slate-300 outline-none bg-indigo-50/30 p-2 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-100 font-bold transition-all"
          />
          <input
            type="text"
            placeholder="  • Tambah Detail adegan..."
            value={item.sub2}
            onChange={(e) => onChange(item.id, "sub2", e.target.value)}
            className="w-full text-[10px] text-slate-600 placeholder-slate-300 outline-none bg-slate-50 p-2 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-100 font-medium transition-all"
          />
        </div>
      </div>
    </div>
  );
};

interface StepPramenulisProps {
  bookId?: string;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  sensors: any;
  outlineItems: any[];
  setOutlineItems: (items: any) => void;
  handleOutlineDragEnd: (event: any) => void;
  onDataChange: (data: any) => void;
}

export default function StepPramenulis({
  bookId,
  formData,
  handleInputChange,
  sensors,
  outlineItems,
  setOutlineItems,
  handleOutlineDragEnd,
  onDataChange,
}: StepPramenulisProps) {
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [tagKategori, setTagKategori] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [moodBoards, setMoodBoards] = useState<any[]>([
    { id: Date.now(), previewUrl: "", category: "Karakter" },
  ]);
  const [researches, setResearches] = useState<any[]>([]);

  // SINKRONISASI DATA KE INDUK SETIAP ADA PERUBAHAN
  useEffect(() => {
    const activeMoodBoards = moodBoards
      .filter((mb) => mb.previewUrl !== "")
      .map((mb) => ({ image_url: mb.previewUrl, category: mb.category }));
    const formattedResearches = researches
      .filter((rs) => rs.title.trim() !== "")
      .map((rs) => ({
        source_title: rs.title,
        link_url: rs.mode === "link" ? rs.linkUrl : rs.fileData,
        notes: rs.tag ? `[Tag: ${rs.tag}]\n${rs.notes}` : rs.notes,
      }));

    onDataChange({
      ideCepat: {
        title: formData.ideCepat,
        description: deskripsi,
        tag: tagKategori,
        date: tanggal || new Date(),
      },
      outlines: outlineItems.filter((ot) => ot.title.trim() !== ""),
      moodBoards: activeMoodBoards,
      researches: formattedResearches,
    });
  }, [
    moodBoards,
    researches,
    outlineItems,
    deskripsi,
    tanggal,
    tagKategori,
    formData.ideCepat,
  ]);

  useEffect(() => {
    const fetchPramenulisData = async () => {
      if (!bookId) return;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:4000/api/books/pramenulis/${bookId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await response.json();
        if (response.ok && result.data) {
          const d = result.data;
          handleInputChange("ideCepat", d.ideCepat?.title || "");
          setDeskripsi(d.ideCepat?.description || "");
          setTagKategori(d.ideCepat?.tag || "");
          if (d.ideCepat?.date) setTanggal(d.ideCepat.date.split("T")[0]);
          if (d.moodBoards?.length)
            setMoodBoards(
              d.moodBoards.map((mb: any) => ({
                id: mb.id,
                previewUrl: mb.image_url,
                category: mb.category,
              })),
            );
          if (d.researches?.length)
            setResearches(
              d.researches.map((rs: any) => ({
                id: rs.id.toString(),
                title: rs.source_title,
                mode: rs.link_url?.startsWith("http") ? "link" : "file",
                linkUrl: rs.link_url,
                fileData: rs.link_url,
                fileName: rs.link_url?.split("/").pop() || "File",
                tag: rs.notes?.match(/^\[Tag: (.*?)\]\n/)?.[1] || "",
                notes: rs.notes?.replace(/^\[Tag: (.*?)\]\n/, "") || rs.notes,
              })),
            );
          if (d.outlines?.length) setOutlineItems(d.outlines);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPramenulisData();
  }, [bookId]);

  const addMoodBoardCard = () =>
    setMoodBoards([
      ...moodBoards,
      { id: Date.now(), previewUrl: "", category: "Karakter" },
    ]);
  const removeMoodBoardCard = (id: number) =>
    setMoodBoards(moodBoards.filter((mb) => mb.id !== id));
  const updateMoodBoardCategory = (id: number, newCategory: string) =>
    setMoodBoards(
      moodBoards.map((mb) =>
        mb.id === id ? { ...mb, category: newCategory } : mb,
      ),
    );
  const handleImageUpload = (
    id: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setMoodBoards((prev) =>
          prev.map((mb) =>
            mb.id === id ? { ...mb, previewUrl: reader.result as string } : mb,
          ),
        );
      reader.readAsDataURL(file);
    }
  };

  const handleAddResearchCard = () =>
    setResearches([
      {
        id: Date.now().toString(),
        title: "",
        mode: "link",
        linkUrl: "",
        fileData: "",
        fileName: "",
        tag: "",
        notes: "",
      },
      ...researches,
    ]);
  const updateResearchItem = (id: string, field: string, value: string) =>
    setResearches((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  const removeResearchCard = (id: string) =>
    setResearches(researches.filter((r) => r.id !== id));
  const handleResearchFileUpload = (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateResearchItem(id, "fileData", reader.result as string);
        updateResearchItem(id, "fileName", file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateOutlineItem = (id: string, field: string, value: string) =>
    setOutlineItems((prev: any[]) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  const filteredResearches = researches.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.tag?.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-12 pb-20">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-l-8 border-[#1E4E8C] shadow-sm relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] text-8xl opacity-5 grayscale">
          🖋️
        </div>
        <p className="relative z-10 text-[12px] font-medium text-indigo-900 leading-relaxed italic">
          "Ini tahap paling awal, sebelum nulis kata pertama. Fungsinya buat
          nangkep ide, nyimpen riset, dan nyusun kerangka."
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg shadow-indigo-200 text-xs font-bold">
              01
            </span>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
              Catatan Ide Cepat
            </h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-xl shadow-slate-100/50 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                Judul Ide
              </label>
              <input
                type="text"
                placeholder="Apa inti dari ceritamu?"
                value={formData.ideCepat || ""}
                onChange={(e) => handleInputChange("ideCepat", e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:bg-white outline-none font-black text-[13px] text-slate-800 placeholder-slate-300 transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                Detail Ide
              </label>
              <textarea
                placeholder="Tuangkan deskripsi singkat di sini..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:bg-white outline-none text-[11px] min-h-[120px] text-slate-700 placeholder-slate-300 leading-relaxed font-medium transition-all shadow-inner"
              />
            </div>
          </div>
          <div className="space-y-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div>
              <label className="text-[9px] font-black text-indigo-400 uppercase mb-2 block tracking-widest">
                Tanggal Capture
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border-2 border-slate-100 p-3 rounded-xl text-[11px] text-slate-800 bg-white font-bold focus:border-indigo-400 outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-indigo-400 uppercase mb-2 block tracking-widest">
                Genre / Tag
              </label>
              <input
                type="text"
                placeholder="Contoh: Mystery, Sci-Fi"
                value={tagKategori}
                onChange={(e) => setTagKategori(e.target.value)}
                className="w-full border-2 border-slate-100 p-3 rounded-xl text-[11px] text-slate-800 bg-white font-bold placeholder-slate-300 focus:border-indigo-400 outline-none transition-all shadow-sm"
              />
            </div>
            <div className="pt-2">
              <div className="bg-indigo-100 p-3 rounded-xl text-[9px] text-indigo-700 font-bold leading-tight border border-indigo-200">
                💡 Tips: Jangan biarkan ide lewat begitu saja. Tulis apa adanya
                dulu!
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-pink-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg shadow-pink-200 text-xs font-bold">
              02
            </span>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
              Mood Board Visual
            </h4>
          </div>
          <button
            onClick={addMoodBoardCard}
            className="text-[10px] bg-pink-600 text-white px-4 py-2 rounded-xl font-black uppercase hover:bg-pink-700 transition-all shadow-md shadow-pink-100 tracking-widest flex items-center gap-2"
          >
            <span>+</span> Tambah Visual
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {moodBoards.map((mb) => (
            <div
              key={mb.id}
              className="bg-white p-3 rounded-3xl border-2 border-slate-50 shadow-lg hover:shadow-pink-100 transition-all group"
            >
              <label className="aspect-[3/4] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-pink-50 hover:border-pink-300 transition-all cursor-pointer relative overflow-hidden shadow-inner mb-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(mb.id, e)}
                />
                {mb.previewUrl ? (
                  <>
                    <img
                      src={mb.previewUrl}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white text-[9px] font-black uppercase border-2 border-white px-3 py-1.5 rounded-lg tracking-widest">
                        Update
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">
                      🖼️
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                      Drop Image
                    </span>
                  </div>
                )}
              </label>
              <div className="flex gap-2 items-center">
                <select
                  value={mb.category}
                  onChange={(e) =>
                    updateMoodBoardCategory(mb.id, e.target.value)
                  }
                  className="flex-1 text-[9px] font-black uppercase bg-slate-50 border-none rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-pink-200 text-pink-700 tracking-widest transition-all"
                >
                  <option value="Karakter">Karakter</option>
                  <option value="Lokasi">Lokasi</option>
                  <option value="Suasana">Suasana</option>
                  <option value="Bab">Per Bab</option>
                </select>
                <button
                  onClick={() => removeMoodBoardCard(mb.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                >
                  <span className="text-xs">✕</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg shadow-emerald-200 text-xs font-bold">
              03
            </span>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
              Database Riset
            </h4>
          </div>
          <button
            onClick={handleAddResearchCard}
            className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 shadow-md shadow-emerald-100 active:scale-95 transition-all tracking-widest flex items-center gap-2"
          >
            <span>+</span> Riset Baru
          </button>
        </div>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            🔍
          </span>
          <input
            type="text"
            placeholder="Filter database berdasarkan judul atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-[11px] text-slate-800 outline-none focus:border-emerald-500 transition-all font-bold placeholder-slate-300 shadow-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
          {filteredResearches.map((rs) => (
            <div
              key={rs.id}
              className="bg-white rounded-[32px] border-2 border-slate-50 relative flex flex-col shadow-xl shadow-slate-200/40 hover:shadow-emerald-100 hover:border-emerald-100 transition-all duration-300 overflow-hidden group"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => removeResearchCard(rs.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-slate-300 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100"
                >
                  <span className="text-xs">✕</span>
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-2">
                      Source Title
                    </label>
                    <input
                      type="text"
                      placeholder="Nama sumber..."
                      value={rs.title}
                      onChange={(e) =>
                        updateResearchItem(rs.id, "title", e.target.value)
                      }
                      className="w-full font-black text-[12px] text-slate-800 outline-none border-b-2 border-slate-100 focus:border-emerald-500 bg-transparent transition-all"
                    />
                  </div>
                  <div className="w-[100px]">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="#TAG"
                      value={rs.tag}
                      onChange={(e) =>
                        updateResearchItem(rs.id, "tag", e.target.value)
                      }
                      className="w-full bg-emerald-50 rounded-xl px-2 py-2 text-[9px] font-black uppercase text-emerald-700 outline-none tracking-widest text-center"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                    <button
                      onClick={() => updateResearchItem(rs.id, "mode", "link")}
                      className={`flex-1 text-[9px] font-black py-2.5 rounded-xl transition-all tracking-widest ${rs.mode === "link" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      🔗 URL
                    </button>
                    <button
                      onClick={() => updateResearchItem(rs.id, "mode", "file")}
                      className={`flex-1 text-[9px] font-black py-2.5 rounded-xl transition-all tracking-widest ${rs.mode === "file" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      📁 FILE
                    </button>
                  </div>
                  {rs.mode === "link" ? (
                    <input
                      type="text"
                      placeholder="Paste link referensi..."
                      value={rs.linkUrl}
                      onChange={(e) =>
                        updateResearchItem(rs.id, "linkUrl", e.target.value)
                      }
                      className="w-full text-[10px] p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-emerald-600 outline-none font-bold placeholder-slate-300 focus:bg-white focus:border-emerald-200 transition-all shadow-inner"
                    />
                  ) : (
                    <label className="block text-center border-2 border-dashed border-emerald-100 p-4 text-[10px] cursor-pointer bg-emerald-50/30 rounded-2xl text-emerald-600 hover:bg-emerald-50 transition-all font-black uppercase tracking-widest">
                      {rs.fileName ? `📄 ${rs.fileName}` : "➕ Attach Document"}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleResearchFileUpload(rs.id, e)}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Key Notes
                  </label>
                  <textarea
                    placeholder="Apa inti dari riset ini?"
                    value={rs.notes}
                    onChange={(e) =>
                      updateResearchItem(rs.id, "notes", e.target.value)
                    }
                    className="w-full text-[11px] p-4 bg-slate-50/50 border-2 border-slate-100 h-32 rounded-3xl outline-none text-slate-700 focus:bg-white focus:border-emerald-200 transition-all placeholder-slate-300 font-medium leading-relaxed resize-none shadow-inner"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-900 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg text-xs font-bold">
              04
            </span>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700">
              Penyusun Outline
            </h4>
          </div>
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Logical Path
          </span>
        </div>
        <div className="bg-slate-50/50 p-6 rounded-[40px] border-2 border-white shadow-inner">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleOutlineDragEnd}
          >
            <SortableContext
              items={outlineItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 min-h-[50px]">
                {outlineItems.map((item) => (
                  <SortableOutlineItem
                    key={item.id}
                    item={item}
                    onChange={updateOutlineItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button
            onClick={() =>
              setOutlineItems([
                ...outlineItems,
                { id: `ot-${Date.now()}`, title: "", sub1: "", sub2: "" },
              ])
            }
            className="w-full mt-6 py-5 border-4 border-dashed border-white rounded-[32px] text-[11px] font-black text-slate-400 hover:text-indigo-600 hover:bg-white hover:border-indigo-100 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-3 group"
          >
            <span className="text-xl group-hover:scale-125 transition-transform">
              ➕
            </span>{" "}
            Tambah Bab Baru
          </button>
        </div>
      </section>
    </div>
  );
}
