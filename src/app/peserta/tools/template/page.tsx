"use client";

import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  X,
  CheckCircle2,
  Layout,
  Type,
  AlignLeft,
  ArrowLeft, // Tambahkan icon ArrowLeft
} from "lucide-react";
import { toPng } from "html-to-image";
import { categories, templates } from "./component/TemplateData";
import { useRouter } from "next/navigation"; // Tambahkan useRouter

export default function TemplatePage() {
  const router = useRouter(); // Inisialisasi router
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<"A4" | "B5">("B5");
  const [activeTab, setActiveTab] = useState<"front" | "back">("front");

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editSynopsis, setEditSynopsis] = useState("");

  const filteredTemplates = templates.filter((t) => {
    return activeCategory === "Semua" || t.category === activeCategory;
  });

  const handleOpenPreview = (template: any) => {
    setSelectedTemplate(template);
    setEditTitle(template.title);
    setEditSubtitle(template.subtitle);
    setEditAuthor(template.author);
    setEditSynopsis(template.synopsis || "");
    setActiveTab("front");
    setIsSuccess(false);
  };

  const downloadSide = async (side: "front" | "back") => {
    const targetRef = side === "front" ? frontRef : backRef;
    if (!targetRef.current) return;

    setIsDownloading(side);
    try {
      const width = pageSize === "A4" ? 794 : 665;
      const height = pageSize === "A4" ? 1123 : 945;

      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 5,
        canvasWidth: width,
        canvasHeight: height,
      });

      const link = document.createElement("a");
      link.download = `Cover-${side.toUpperCase()}-${pageSize}-${editTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error("Gagal mendownload:", err);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-6 pb-20 pt-4">
        
        {/* Navigasi Atas: Tombol Kembali & Filter Kategori */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          {/* Tombol Kembali */}
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            title="Kembali"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap border-2 ${
                  activeCategory === cat 
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Templates */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredTemplates.map((template) => (
            <motion.div
              whileHover={{ y: -8 }}
              key={template.id}
              onClick={() => handleOpenPreview(template)}
              className="group cursor-pointer bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all"
            >
              <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner">
                <img src={template.bgImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={template.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                   <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tighter">{template.title}</h3>
                   <p className="text-white/60 text-[10px] font-bold tracking-[0.2em] mt-2 uppercase">{template.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MODAL EDITOR */}
        <AnimatePresence>
          {selectedTemplate && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-0 md:p-6">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-7xl h-full md:h-[90vh] rounded-none md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
              >
                {/* TOMBOL X DI TENGAH */}
                <button 
                  onClick={() => setSelectedTemplate(null)}
                  className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 z-[110] w-12 h-12 bg-white rounded-full items-center justify-center text-slate-900 hover:text-rose-500 shadow-2xl transition-all border border-slate-100 active:scale-90"
                >
                  <X size={24} />
                </button>
                
                {/* Mobile Close Button */}
                <button onClick={() => setSelectedTemplate(null)} className="md:hidden absolute top-4 right-4 z-[110] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <X size={20} />
                </button>

                {/* AREA PREVIEW (KIRI) */}
                <div className="w-full md:w-3/5 p-6 flex flex-col items-center justify-center bg-slate-100 relative border-r border-slate-100">
                  <div className="flex gap-2 mb-8 bg-white/80 p-1.5 rounded-2xl backdrop-blur-md z-20 shadow-sm border border-slate-200/50">
                    <button 
                      onClick={() => setActiveTab('front')}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'front' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      Sisi Depan
                    </button>
                    <button 
                      onClick={() => setActiveTab('back')}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'back' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      Sisi Belakang
                    </button>
                  </div>

                  <div className="relative w-full h-full max-h-[520px] flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      {activeTab === 'front' ? (
                        <motion.div
                          key="front-view"
                          ref={frontRef}
                          style={{ aspectRatio: pageSize === "A4" ? "210/297" : "176/250" }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="h-full bg-black shadow-2xl relative overflow-hidden flex flex-col"
                        >
                          <img src={selectedTemplate.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-90 z-0" alt="front" />
                          <div className="relative z-10 h-full flex flex-col justify-between py-12 px-8 text-center bg-black/5">
                            <div className="mt-8">
                              <h2 className={`${selectedTemplate.titleColor} font-black text-4xl uppercase leading-[0.9] tracking-tighter drop-shadow-md`}>{editTitle}</h2>
                              <div className="w-16 h-1 bg-white/30 mx-auto my-6"></div>
                              <p className="text-white text-[11px] font-medium opacity-80 px-4 drop-shadow-sm">{editSubtitle}</p>
                            </div>
                            <p className={`${selectedTemplate.authorColor} font-bold text-[11px] tracking-[0.4em] uppercase drop-shadow-sm`}>{editAuthor}</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="back-view"
                          ref={backRef}
                          style={{ aspectRatio: pageSize === "A4" ? "210/297" : "176/250" }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="h-full bg-black shadow-2xl relative overflow-hidden flex flex-col"
                        >
                          <img src={selectedTemplate.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale z-0" alt="back" />
                          <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center bg-black/10">
                            <h4 className="text-white/40 font-black text-[9px] uppercase tracking-[0.4em] mb-6">Sinopsis</h4>
                            <p className="text-white text-sm font-medium leading-relaxed italic opacity-90 drop-shadow-sm">{editSynopsis}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* PANEL EDITOR (KANAN) */}
                <div className="w-full md:w-2/5 bg-white p-8 md:p-12 flex flex-col overflow-y-auto">
                  <div className="flex items-center gap-3 mb-8 border-b pb-4">
                    <Layout className="text-slate-900" size={24} />
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Konfigurasi Desain</h3>
                  </div>

                  {/* Size Selector */}
                  <div className="mb-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Pilih Format Ukuran</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['B5', 'A4'].map((s) => (
                        <button key={s} onClick={() => setPageSize(s as any)}
                          className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${pageSize === s ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                        >
                          Format {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="flex-grow space-y-6">
                    {activeTab === 'front' ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <EditorInput label="Judul Utama" value={editTitle} onChange={(e:any) => setEditTitle(e.target.value)} icon={<Type size={14}/>} />
                        <EditorInput label="Sub-Judul" value={editSubtitle} onChange={(e:any) => setEditSubtitle(e.target.value)} icon={<AlignLeft size={14}/>}/>
                        <EditorInput label="Nama Penulis" value={editAuthor} onChange={(e:any) => setEditAuthor(e.target.value)} icon={<Type size={14}/>}/>
                      </div>
                    ) : (
                      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block">Ringkasan (Sinopsis)</label>
                        <textarea
                          value={editSynopsis}
                          onChange={(e) => setEditSynopsis(e.target.value)}
                          rows={10}
                          className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 font-medium text-sm text-slate-700 resize-none transition-all"
                          placeholder="Tulis ringkasan buku Anda di sini..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Export */}
                  <div className="mt-10 pt-6 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => downloadSide('front')}
                        disabled={!!isDownloading}
                        className="flex flex-col items-center justify-center p-5 bg-slate-50 border-2 border-slate-100 hover:border-slate-900 transition-all gap-2 rounded-2xl group active:scale-95"
                      >
                        {isDownloading === 'front' ? <span className="text-[9px] animate-pulse">Menyiapkan...</span> : 
                        <>
                          <Download size={20} className="text-black transition-colors" />
                          <span className="text-[9px] font-black uppercase text-slate-600">Download Depan</span>
                        </>}
                      </button>

                      <button
                        onClick={() => downloadSide('back')}
                        disabled={!!isDownloading}
                        className="flex flex-col items-center justify-center p-5 bg-slate-50 border-2 border-slate-100 hover:border-slate-900 transition-all gap-2 rounded-2xl group active:scale-95"
                      >
                        {isDownloading === 'back' ? <span className="text-[9px] animate-pulse">Menyiapkan...</span> : 
                        <>
                          <Download size={20} className="text-black transition-colors" />
                          <span className="text-[9px] font-black uppercase text-slate-600">Download Belakang</span>
                        </>}
                      </button>
                    </div>

                    {isSuccess && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase border border-emerald-100">
                        <CheckCircle2 size={16} /> Cover Berhasil Diunduh
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Sidebar>
  );
}

function EditorInput({ label, value, onChange, icon }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 font-bold text-slate-900 transition-all text-xs uppercase"
      />
    </div>
  );
}