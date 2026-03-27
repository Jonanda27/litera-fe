"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Dispatch, SetStateAction, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/constans/constans";
import { 
  Loader2, 
  FileDown, 
  BookCheck, 
  AlertCircle, 
  Maximize2, 
  Minimize2, 
  X 
} from "lucide-react";

interface StepFinalisasiProps {
  formData: any;
  previewConfig: {
    fontFamily: string;
    fontSize: string;
    pageSize: string;
    margin: string;
  };
  previewImage: string | null;
  setPreviewConfig: Dispatch<
    SetStateAction<{
      fontFamily: string;
      fontSize: string;
      pageSize: string;
      margin: string;
    }>
  >;
}

interface PageContent {
  chapterTitle: string;
  chapterNumber: string;
  content: string;
  pageIndex: number;
}

const StepFinalisasi = forwardRef((props: StepFinalisasiProps, ref) => {
  const { formData, previewConfig } = props;
  const [allPages, setAllPages] = useState<PageContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const bookId = formData?.id || formData?.bookId;

  useEffect(() => {
    const fetchFullBook = async () => {
      if (!bookId) {
        setError("ID Proyek tidak ditemukan.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const outlineRes = await axios.get(`${API_BASE_URL}/books/outlines/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const outlines = outlineRes.data;

        const contentPromises = outlines.map((chap: any) =>
          axios.get(`${API_BASE_URL}/books/get-chapter?bookId=${bookId}&outlineId=${chap.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        const contentsResults = await Promise.all(contentPromises);
        const flattenedPages: PageContent[] = [];
        
        contentsResults.forEach((res, index) => {
          const chapter = outlines[index];
          (res.data.data || []).forEach((p: any) => {
            flattenedPages.push({
              chapterTitle: chapter.title,
              chapterNumber: chapter.chapter_number,
              content: p.content,
              pageIndex: p.page,
            });
          });
        });
        setAllPages(flattenedPages);
      } catch (err) {
        setError("Gagal memuat data naskah.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFullBook();
  }, [bookId, token]);

  // Helper untuk generate HTML string
  const generateFullHtml = () => {
    return `
        <html>
        <head>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; font-family: ${previewConfig.fontFamily || 'serif'}; background: #ffffff; }
            .page-break { page-break-after: always; }
            .cover-img { width: 210mm; height: 297mm; object-fit: cover; display: block; }
            .content-page { 
              width: 210mm; 
              height: 297mm; 
              padding: 2.54cm; 
              box-sizing: border-box; 
              background: white; 
              color: black; 
              font-size: ${previewConfig.fontSize || '12pt'}; 
              line-height: 1.6; 
              text-align: justify; 
              overflow: hidden;
            }
            h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; margin-top: 0.5em; line-height: 1.2; text-align: center; }
            h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.4em; margin-top: 0.4em; line-height: 1.2; }
            h3 { font-size: 1.2em; font-weight: bold; margin-bottom: 0.3em; margin-top: 0.3em; line-height: 1.2; }
            p { margin: 0 0 1em 0; }
          </style>
        </head>
        <body>
            ${formData.coverFront ? `<img src="${formData.coverFront}" class="cover-img page-break" />` : ''}
            ${allPages.map(p => `<div class="content-page page-break">${p.content}</div>`).join('')}
            ${formData.coverBack ? `<img src="${formData.coverBack}" class="cover-img" />` : ''}
        </body>
        </html>
      `;
  };

  // FUNGSI 1: HANYA DOWNLOAD KE DEVICE (Panggil API Download)
  const handleDownloadOnly = async () => {
    if (!token) return alert("Sesi kadaluarsa.");
    setIsExporting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/books/download-pdf`, 
        { 
          htmlContent: generateFullHtml(), 
          title: formData.title 
        },
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob' // Menerima file mentah
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.title || 'naskah'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Gagal mendownload PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // FUNGSI 2: HANYA SIMPAN KE DB (Panggil API Generate & Update DB)
  const handleSaveToDB = async () => {
    if (!token) return false;
    setIsExporting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/books/save-pdf-db`, 
        { 
          htmlContent: generateFullHtml(), 
          title: formData.title,
          bookId: bookId 
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return response.data.success;
    } catch (err) {
      console.error("Gagal menyimpan ke database");
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  useImperativeHandle(ref, () => ({
    exportPDF: handleDownloadOnly, // Untuk tombol di halaman ini (Download)
    saveToDB: handleSaveToDB        // Untuk tombol di Modal (Save DB)
  }));

  const RenderPages = () => (
    <>
      {formData?.coverFront && (
        <div className="flex-shrink-0 snap-center flex flex-col items-center gap-6">
          <p className="text-[11px] font-black uppercase text-white bg-slate-900/50 px-4 py-1.5 rounded-full backdrop-blur-md">Sampul Depan</p>
          <div className="bg-white w-[210mm] h-[297mm] shadow-2xl border-4 border-slate-900 overflow-hidden relative origin-top scale-[0.4] md:scale-[0.5] lg:scale-[0.6] mb-[-120mm]">
            <img src={formData.coverFront} className="w-full h-full object-cover" alt="Front Cover" />
          </div>
        </div>
      )}

      {allPages.map((page, index) => (
        <div key={index} className="flex-shrink-0 snap-center flex flex-col items-center gap-6">
          <p className="text-[11px] font-black uppercase text-white bg-slate-900/50 px-4 py-1.5 rounded-full backdrop-blur-md">{page.chapterTitle} - Hal {page.pageIndex}</p>
          <div 
            className="bg-white shadow-2xl overflow-hidden prose prose-slate a4-page-div origin-top scale-[0.4] md:scale-[0.5] lg:scale-[0.6] mb-[-120mm]"
            style={{ 
              width: '210mm', height: '297mm', padding: '2.54cm',
              fontSize: previewConfig.fontSize || '12pt', lineHeight: '1.6', 
              fontFamily: previewConfig.fontFamily || 'serif', textAlign: 'justify',
              boxSizing: 'border-box', color: '#000000', backgroundColor: '#ffffff'
            }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      ))}

      {formData?.coverBack && (
        <div className="flex-shrink-0 snap-center flex flex-col items-center gap-6">
          <p className="text-[11px] font-black uppercase text-white bg-slate-900/50 px-4 py-1.5 rounded-full backdrop-blur-md">Sampul Belakang</p>
          <div className="bg-white w-[210mm] h-[297mm] shadow-2xl border-4 border-slate-900 overflow-hidden relative origin-top scale-[0.4] md:scale-[0.5] lg:scale-[0.6] mb-[-120mm]">
            <img src={formData.coverBack} className="w-full h-full object-cover" alt="Back Cover" />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col h-full space-y-6 text-black">
      <div className="bg-slate-900 p-5 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center shadow-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg shadow-lg">
            <BookCheck size={20} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest block text-emerald-400">Final Export Engine</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{allPages.length} Halaman Terdeteksi</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsZenMode(true)}
            className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Maximize2 size={16} /> Mode Zen
          </button>

          <button 
            onClick={handleDownloadOnly}
            disabled={isLoading || isExporting}
            className="flex-[2] md:flex-none bg-[#c31a26] hover:bg-red-700 disabled:bg-slate-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
          >
            {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
            {isExporting ? "Memproses PDF..." : "Download PDF ke Device"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-12 bg-slate-400 rounded-[3rem] shadow-inner flex items-start gap-12 custom-scrollbar snap-x">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center w-full py-20 text-white">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-black uppercase text-xs tracking-widest">Memproses Naskah...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center w-full py-20 text-rose-200">
            <AlertCircle size={40} className="mb-2" />
            <p className="font-black uppercase text-xs">{error}</p>
          </div>
        ) : (
          <RenderPages />
        )}
      </div>

      <AnimatePresence>
        {isZenMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[999] bg-slate-950 flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <BookCheck size={20} />
                </div>
                <div>
                  <h2 className="text-white font-black text-sm uppercase tracking-tighter">Reviewing: {formData.title || "Karya"}</h2>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Focus Mode Active</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDownloadOnly}
                  disabled={isExporting}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase flex items-center gap-2 transition-all"
                >
                  {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} 
                  Download PDF
                </button>
                <button 
                  onClick={() => setIsZenMode(false)}
                  className="w-10 h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <Minimize2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto p-10 md:p-20 flex items-start gap-16 custom-scrollbar-zen snap-x">
              <RenderPages />
            </div>

            <div className="p-4 text-center bg-slate-900/30 text-white/30 text-[9px] font-bold uppercase tracking-[0.3em]">
              Gunakan scroll horizontal untuk berpindah halaman • Tekan tombol X untuk keluar
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .a4-page-div h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em !important; margin-top: 0.5em !important; line-height: 1.2; text-align: center; color: black; }
        .a4-page-div h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.4em !important; margin-top: 0.4em !important; line-height: 1.2; color: black; }
        .a4-page-div h3 { font-size: 1.2em; font-weight: bold; margin-bottom: 0.3em !important; margin-top: 0.3em !important; line-height: 1.2; color: black; }
        .a4-page-div p { margin-bottom: 1em !important; line-height: 1.6; text-align: justify; color: black; }
        .custom-scrollbar::-webkit-scrollbar,
        .custom-scrollbar-zen::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar-zen::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
});

StepFinalisasi.displayName = "StepFinalisasi";
export default StepFinalisasi;