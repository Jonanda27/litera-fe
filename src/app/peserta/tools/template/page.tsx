"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  X,
  CheckCircle2,
  Layout,
  Type,
  AlignLeft,
  ArrowLeft,
  Upload,
  ImageIcon,
  Plus,
  Image as LucideImage
} from "lucide-react";
import { toPng } from "html-to-image";
import { categories, templates } from "./component/TemplateData";
import { useRouter } from "next/navigation";

export default function TemplatePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<"A4" | "B5">("B5");
  const [activeTab, setActiveTab] = useState<"front" | "back">("front");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const editorFileInputRef = useRef<HTMLInputElement>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editSynopsis, setEditSynopsis] = useState("");
  
  const [customFrontImg, setCustomFrontImg] = useState<string | null>(null);
  const [customBackImg, setCustomBackImg] = useState<string | null>(null);

  const filteredTemplates = templates.filter((t) => {
    return activeCategory === "Semua" || t.category === activeCategory;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === "front") setCustomFrontImg(reader.result as string);
        else setCustomBackImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCustomEditor = () => {
    if (!customFrontImg && !customBackImg) {
        alert("Silakan pilih setidaknya satu gambar cover.");
        return;
    }

    const customTemplate = {
      id: "direct-upload-" + Date.now(),
      title: "JUDUL BUKU ANDA",
      subtitle: "SUB-JUDUL DISINI",
      author: "NAMA PENULIS",
      synopsis: "Tuliskan sinopsis buku anda...",
      category: "Custom",
      bgImage: customFrontImg || "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800",
      titleColor: "text-slate-900",
      authorColor: "text-slate-700",
      isCustom: true // Penanda bahwa ini template buatan user
    };

    setSelectedTemplate(customTemplate);
    setEditTitle(customTemplate.title);
    setEditSubtitle(customTemplate.subtitle);
    setEditAuthor(customTemplate.author);
    setEditSynopsis(customTemplate.synopsis);
    setIsUploadModalOpen(false);
    setActiveTab("front");
  };

  const handleOpenPreview = (template: any) => {
    setCustomFrontImg(null);
    setCustomBackImg(null);
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

  const getDisplayImage = (side: "front" | "back") => {
    if (side === "front") return customFrontImg || selectedTemplate?.bgImage;
    return customBackImg || selectedTemplate?.bgImage;
  };

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-6 pb-20 pt-4">
        
        {/* Navigasi Atas */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
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
          <motion.div
            whileHover={{ y: -8 }}
            onClick={() => setIsUploadModalOpen(true)}
            className="group cursor-pointer bg-slate-50 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center transition-all hover:bg-white hover:border-slate-900"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Plus size={32} />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-sm">Upload Sendiri</h3>
            <p className="text-slate-400 text-[9px] font-bold uppercase mt-1">Gunakan Gambar Anda</p>
          </motion.div>

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

        {/* MODAL UPLOAD COVER */}
        <AnimatePresence>
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[3rem] p-6 md:p-10 shadow-2xl relative flex flex-col overflow-hidden"
                    >
                        <button onClick={() => setIsUploadModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                          <X size={20} />
                        </button>
                        
                        <div className="text-center mb-6">
                          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">Upload Cover Anda</h2>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Pilih gambar untuk sisi depan & belakang buku.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8 overflow-hidden">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block text-center">Sisi Depan</label>
                                <div onClick={() => frontFileInputRef.current?.click()} className="aspect-[2/2.8] md:aspect-[2/3] max-h-[300px] mx-auto rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-slate-900 hover:bg-white transition-all overflow-hidden relative group shadow-inner">
                                    <input type="file" ref={frontFileInputRef} onChange={(e) => handleFileChange(e, "front")} accept="image/*" className="hidden" />
                                    {customFrontImg ? (
                                        <img src={customFrontImg} className="w-full h-full object-cover" alt="front-custom" />
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                              <LucideImage size={24} className="text-slate-400" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-slate-400">Pilih File</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block text-center">Sisi Belakang</label>
                                <div onClick={() => backFileInputRef.current?.click()} className="aspect-[2/2.8] md:aspect-[2/3] max-h-[300px] mx-auto rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-slate-900 hover:bg-white transition-all overflow-hidden relative group shadow-inner">
                                    <input type="file" ref={backFileInputRef} onChange={(e) => handleFileChange(e, "back")} accept="image/*" className="hidden" />
                                    {customBackImg ? (
                                        <img src={customBackImg} className="w-full h-full object-cover" alt="back-custom" />
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                              <LucideImage size={24} className="text-slate-400" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-slate-400">Pilih File</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={startCustomEditor}
                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-[0.98]"
                        >
                            Lanjutkan ke Editor
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* MODAL EDITOR */}
        <AnimatePresence>
          {selectedTemplate && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-0 md:p-6">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-7xl h-full md:h-[90vh] rounded-none md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
              >
                <button 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setCustomFrontImg(null);
                    setCustomBackImg(null);
                  }}
                  className="hidden md:flex absolute left-1/2 top-6 -translate-x-1/2 z-[110] w-12 h-12 bg-white rounded-full items-center justify-center text-slate-900 hover:text-rose-500 shadow-2xl transition-all border border-slate-100 active:scale-90"
                >
                  <X size={24} />
                </button>
                
                <div className="w-full md:w-3/5 p-6 flex flex-col items-center justify-center bg-slate-100 relative border-r border-slate-100">
                  <div className="flex gap-2 mb-8 bg-white/80 p-1.5 rounded-2xl backdrop-blur-md z-20 shadow-sm border border-slate-200/50">
                    <button onClick={() => setActiveTab('front')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'front' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Sisi Depan</button>
                    <button onClick={() => setActiveTab('back')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'back' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Sisi Belakang</button>
                  </div>

                  <div className="relative w-full h-full max-h-[520px] flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        ref={activeTab === 'front' ? frontRef : backRef}
                        style={{ aspectRatio: pageSize === "A4" ? "210/297" : "176/250" }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="h-full bg-white shadow-2xl relative overflow-hidden flex flex-col"
                      >
                        <img src={getDisplayImage(activeTab)} className={`absolute inset-0 w-full h-full object-cover z-0 ${activeTab === 'back' && !selectedTemplate.isCustom ? 'opacity-40 grayscale' : 'opacity-100'}`} alt="preview" />
                        
                        {activeTab === 'front' ? (
                          <div className="relative z-10 h-full flex flex-col justify-between py-12 px-8 text-center bg-black/5">
                            <div className="mt-8">
                              <h2 className={`${selectedTemplate.titleColor} font-black text-4xl uppercase leading-[0.9] tracking-tighter drop-shadow-sm`}>{editTitle}</h2>
                              <div className="w-16 h-1 bg-current opacity-30 mx-auto my-6"></div>
                              <p className={`${selectedTemplate.authorColor} text-[11px] font-medium opacity-90 px-4 drop-shadow-sm`}>{editSubtitle}</p>
                            </div>
                            <p className={`${selectedTemplate.authorColor} font-bold text-[11px] tracking-[0.4em] uppercase drop-shadow-sm`}>{editAuthor}</p>
                          </div>
                        ) : (
                          <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center bg-black/10">
                            <h4 className={`${selectedTemplate.isCustom ? 'text-slate-900' : 'text-white/40'} font-black text-[9px] uppercase tracking-[0.4em] mb-6`}>Sinopsis</h4>
                            <p className={`${selectedTemplate.isCustom ? 'text-slate-800' : 'text-white'} text-sm font-medium leading-relaxed italic opacity-90 drop-shadow-sm`}>{editSynopsis}</p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="w-full md:w-2/5 bg-white p-8 md:p-12 flex flex-col overflow-y-auto">
                  <div className="flex items-center gap-3 mb-8 border-b pb-4">
                    <Layout className="text-slate-900" size={24} />
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Konfigurasi Desain</h3>
                  </div>

                  {/* TOMBOL GANTI GAMBAR HANYA MUNCUL JIKA TEMPLATE CUSTOM */}
                  {selectedTemplate.isCustom && (
                    <div className="mb-8">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Latar Belakang ({activeTab === 'front' ? 'Depan' : 'Belakang'})</label>
                      <input type="file" ref={editorFileInputRef} onChange={(e) => handleFileChange(e, activeTab)} accept="image/*" className="hidden" />
                      <button 
                        onClick={() => editorFileInputRef.current?.click()}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-3 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all"
                      >
                        <ImageIcon size={18} />
                        <span className="text-xs font-bold uppercase">Ganti Gambar Ini</span>
                      </button>
                    </div>
                  )}

                  <div className="mb-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Pilih Format Ukuran</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['B5', 'A4'].map((s) => (
                        <button key={s} onClick={() => setPageSize(s as any)}
                          className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${pageSize === s ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                        >Format {s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-grow space-y-6">
                    {activeTab === 'front' ? (
                      <div className="space-y-4">
                        <EditorInput label="Judul Utama" value={editTitle} onChange={(e:any) => setEditTitle(e.target.value)} icon={<Type size={14}/>} />
                        <EditorInput label="Sub-Judul" value={editSubtitle} onChange={(e:any) => setEditSubtitle(e.target.value)} icon={<AlignLeft size={14}/>}/>
                        <EditorInput label="Nama Penulis" value={editAuthor} onChange={(e:any) => setEditAuthor(e.target.value)} icon={<Type size={14}/>}/>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block">Ringkasan (Sinopsis)</label>
                        <textarea value={editSynopsis} onChange={(e) => setEditSynopsis(e.target.value)} rows={10} className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 font-medium text-sm text-slate-700 resize-none transition-all" placeholder="Tulis sinopsis..." />
                      </div>
                    )}
                  </div>

                  <div className="mt-10 pt-6 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => downloadSide('front')} disabled={!!isDownloading} className="flex flex-col items-center justify-center p-5 bg-slate-50 border-2 border-slate-100 hover:border-slate-900 transition-all gap-2 rounded-2xl group active:scale-95 disabled:opacity-50">
                        {isDownloading === 'front' ? <span className="text-[9px] animate-pulse text-black font-black">Proses...</span> : 
                        <>
                          <Download size={20} className="text-black" />
                          <span className="text-[9px] font-black uppercase text-black">Download Depan</span>
                        </>}
                      </button>
                      <button onClick={() => downloadSide('back')} disabled={!!isDownloading} className="flex flex-col items-center justify-center p-5 bg-slate-50 border-2 border-slate-100 hover:border-slate-900 transition-all gap-2 rounded-2xl group active:scale-95 disabled:opacity-50">
                        {isDownloading === 'back' ? <span className="text-[9px] animate-pulse text-black font-black">Proses...</span> : 
                        <>
                          <Download size={20} className="text-black" />
                          <span className="text-[9px] font-black uppercase text-black">Download Belakang</span>
                        </>}
                      </button>
                    </div>
                    {isSuccess && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase border border-emerald-100">
                        <CheckCircle2 size={16} /> Berhasil Diunduh
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