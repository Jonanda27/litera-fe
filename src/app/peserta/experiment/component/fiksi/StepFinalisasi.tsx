"use client";

import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { useState, useEffect } from "react";

interface StepFinalisasiProps {
  previewImage: string | null;
  previewConfig: {
    fontFamily: string;
    fontSize: string;
    pageSize: string;
    margin: string;
  };
  setPreviewConfig: (config: any) => void;
}

export default function StepFinalisasi({
  previewImage,
  previewConfig,
}: StepFinalisasiProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [localPreviewPages, setLocalPreviewPages] = useState<string[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  useEffect(() => {
    if (previewImage) {
      generatePreviewPages(previewImage);
    }
  }, [previewImage]);

  // --- FUNGSI GENERATE PREVIEW PER HALAMAN (FIXED SLICING) ---
  const generatePreviewPages = (base64Img: string) => {
    setIsLoadingPreview(true);
    const img = new Image();
    img.src = base64Img;

    img.onload = () => {
      const pages: string[] = [];
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      // Hitung tinggi halaman berdasarkan rasio A4 (297/210)
      const pxPageHeight = (297 / 210) * imgWidth;
      
      let yOffset = 0;

      while (yOffset < imgHeight) {
        const canvas = document.createElement("canvas");
        canvas.width = imgWidth;
        canvas.height = pxPageHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Pastikan background bersih putih
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Hitung tinggi potongan sumber (agar tidak mengambil area kosong di luar gambar asli)
          const sourceHeight = Math.min(pxPageHeight, imgHeight - yOffset);
          
          // Draw image dengan koordinat yang presisi
          ctx.drawImage(
            img,
            0, yOffset, imgWidth, sourceHeight, // Potong dari gambar asli
            0, 0, imgWidth, sourceHeight        // Tempel di canvas baru
          );
          
          pages.push(canvas.toDataURL("image/png"));
        }
        // Pastikan offset bertambah tepat setinggi halaman A4
        yOffset += pxPageHeight;
      }
      setLocalPreviewPages(pages);
      setIsLoadingPreview(false);
    };
  };

  // --- FUNGSI EXPORT PDF ---
  const handleExportPDF = async () => {
    if (!previewImage) return;
    setIsExporting(true);

    try {
      const img = new Image();
      img.src = previewImage;

      img.onload = () => {
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = 210;
        const pdfHeight = 297;

        const imgWidth = img.width;
        const imgHeight = img.height;
        const pxPageHeight = (pdfHeight / pdfWidth) * imgWidth;
        
        const topMarginMm = 15; 
        const topMarginPx = (topMarginMm / 210) * imgWidth;

        let yOffset = 0; 
        let pageNum = 1;

        while (yOffset < imgHeight) {
          if (pageNum > 1) pdf.addPage();

          const canvas = document.createElement("canvas");
          canvas.width = imgWidth;
          canvas.height = pxPageHeight;
          const ctx = canvas.getContext("2d");

          const availablePxHeight = pxPageHeight - (topMarginPx * 2);
          const sourceHeight = Math.min(availablePxHeight, imgHeight - yOffset);

          if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
              img,
              0, yOffset, imgWidth, sourceHeight,          
              0, topMarginPx, imgWidth, sourceHeight       
            );
          }

          const pageData = canvas.toDataURL("image/png", 1.0);
          pdf.addImage(pageData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

          yOffset += availablePxHeight;
          pageNum++;
        }

        pdf.save(`Naskah_LITERA_Final_${Date.now()}.pdf`);
        setIsExporting(false);
      };
    } catch (error) {
      console.error("Gagal export PDF:", error);
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[75vh] space-y-4 overflow-hidden text-black">
      <div className="bg-emerald-50 px-4 py-3 rounded-xl border-l-4 border-emerald-500 text-[11px] font-bold text-emerald-800 shadow-sm shrink-0 uppercase">
        "Naskah telah diproses. Setiap halaman kini ditampilkan dalam bingkai A4 yang terpisah secara presisi."
      </div>

      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden p-1">
        
        {/* PREVIEW LAYOUT */}
        <section className="lg:col-span-8 flex flex-col space-y-3 min-h-0">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-700">1. Preview Halaman (Horizontal)</h4>
            <span className="text-[9px] font-black text-white bg-slate-800 px-3 py-1 rounded-full">{localPreviewPages.length} HALAMAN</span>
          </div>
          
          <div className="flex-1 bg-slate-200 rounded-[2.5rem] shadow-inner flex items-center border border-slate-300 overflow-x-auto p-12 custom-scrollbar gap-10 snap-x snap-mandatory">
            {!isLoadingPreview && localPreviewPages.length > 0 ? (
              localPreviewPages.map((pageImg, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-shrink-0 snap-center flex flex-col items-center gap-5"
                >
                  <div className="bg-white w-[280px] md:w-[320px] aspect-[210/297] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-300 relative overflow-hidden flex-shrink-0">
                    <img 
                      src={pageImg} 
                      alt={`Halaman ${index + 1}`} 
                      className="w-full h-full object-fill" 
                    />
                    <div className="absolute top-4 right-4 bg-slate-100/80 backdrop-blur-sm text-[8px] font-black px-2 py-1 rounded border border-slate-200">
                       PAGE {index + 1}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-black text-slate-600 uppercase">Halaman {index + 1}</span>
                    <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="animate-spin w-10 h-10 border-4 border-slate-300 border-t-emerald-600 rounded-full" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Menyusun Tampilan...</p>
              </div>
            )}
          </div>
        </section>

        {/* EXPORT OPTIONS */}
        <section className="lg:col-span-4 flex flex-col space-y-4 min-h-0">
          <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-700">2. Export Options</h4>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting || isLoadingPreview || !previewImage}
              className="flex items-center gap-4 p-6 bg-white rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all active:scale-95 disabled:opacity-50 shadow-md group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-colors ${isExporting ? 'bg-slate-200 text-slate-400' : 'bg-red-600 text-white group-hover:bg-emerald-600'}`}>
                {isExporting ? '...' : 'PDF'}
              </div>
              <div className="text-left">
                <p className="text-base font-black text-slate-900 leading-none">Cetak Naskah PDF</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Kualitas Tinggi A4</p>
              </div>
            </button>

            <div className="mt-auto p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl border border-white/5">
              <p className="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">Informasi Preview</p>
              <p className="text-[11px] leading-relaxed font-medium opacity-80">
                Gambar telah dipotong secara individual menggunakan unit A4 standar. Hal ini memastikan tampilan yang Anda lihat di sini akan sama persis dengan hasil cetak PDF.
              </p>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #e2e8f0; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}