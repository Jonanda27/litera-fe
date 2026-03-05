"use client";

import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { useState } from "react";
import { Document, Packer, Paragraph, ImageRun } from "docx"; // Import untuk Word
import { saveAs } from "file-saver"; // Untuk download file

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
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | null>(null);

  // --- FUNGSI EXPORT PDF ---
  const handleExportPDF = async () => {
    if (!previewImage) return;
    setIsExporting("pdf");
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(previewImage, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW');
      pdf.save("naskah-final-hd.pdf");
    } catch (error) {
      console.error("Gagal export PDF:", error);
    } finally {
      setIsExporting(null);
    }
  };

  // --- FUNGSI EXPORT WORD (DOCX) ---
  const handleExportWord = async () => {
    if (!previewImage) return;
    setIsExporting("word");

    try {
      // 1. Ambil data gambar
      const response = await fetch(previewImage);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // 2. Buat dokumen
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { 
                    width: "210mm", 
                    height: "297mm" 
                },
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
              },
            },
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: arrayBuffer,
                    // Tambahkan type di sini untuk mengatasi error IImageOptions
                    type: "png", 
                    transformation: {
                      width: 595, // Standar A4 (sekitar 21cm dalam poin/pixel docx)
                      height: 842, // Standar A4 (sekitar 29.7cm dalam poin/pixel docx)
                    },
                  }),
                ],
              }),
            ],
          },
        ],
      });

      // 3. Gunakan toBlob alih-alih toBuffer agar kompatibel dengan file-saver di browser
      const docBlob = await Packer.toBlob(doc);
      saveAs(docBlob, "naskah-final.docx");

    } catch (error) {
      console.error("Gagal export Word:", error);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[75vh] space-y-4 overflow-hidden">
      <div className="bg-green-50 px-4 py-3 rounded-xl border-l-4 border-green-600 text-[11px] italic text-slate-700 shadow-sm shrink-0 uppercase font-bold">
        "Garis finish sudah terlihat! Pilih format naskah yang kamu inginkan."
      </div>

      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden p-1">
        
        {/* 1. PREVIEW LAYOUT (Adjusted Zoom) */}
        <section className="lg:col-span-8 flex flex-col space-y-3 relative z-10 min-h-0">
          <div className="flex justify-between items-center shrink-0">
            <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-700">
              1. Preview Halaman A4
            </h4>
          </div>

          <div className="flex-1 bg-slate-100 rounded-[2.5rem] shadow-inner flex items-center justify-center border border-slate-200 overflow-hidden p-8">
            {previewImage ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                {/* Frame Kertas: Ukuran medium agar tidak terlalu dekat tapi tetap jelas */}
                <div className="bg-white w-[280px] h-[396px] md:w-[340px] md:h-[480px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-sm overflow-hidden border border-slate-200 relative">
                  <img 
                    src={previewImage} 
                    alt="Naskah Preview" 
                    className="w-full h-full object-contain"
                  />
                  {/* Subtle Spine Shade */}
                  <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/[0.03] to-transparent" />
                </div>
              </motion.div>
            ) : (
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[10px] font-black text-slate-500 uppercase">Preparing HD Preview...</p>
              </div>
            )}
          </div>
        </section>

        {/* 2. EXPORT CENTER */}
        <section className="lg:col-span-4 flex flex-col space-y-4 relative z-10 min-h-0 text-black">
          <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-700 shrink-0">
            2. Export Options
          </h4>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
            {/* Tombol PDF */}
            <button 
              onClick={handleExportPDF}
              disabled={!!isExporting || !previewImage}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-red-50 transition-all border border-slate-100 shadow-sm shrink-0 group hover:border-red-200"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${isExporting === 'pdf' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>
                {isExporting === 'pdf' ? '...' : 'PDF'}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-900 leading-none">Download PDF</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Professional Print Ready</p>
              </div>
            </button>

            {/* Tombol Word */}
            <button 
              onClick={handleExportWord}
              disabled={!!isExporting || !previewImage}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-blue-50 transition-all border border-slate-100 shadow-sm shrink-0 group hover:border-blue-200"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${isExporting === 'word' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                {isExporting === 'word' ? '...' : 'DOCX'}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-900 leading-none">Download Word</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">High Quality Document</p>
              </div>
            </button>

            <div className="mt-auto p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl">
              <p className="text-[10px] font-medium leading-relaxed opacity-80 uppercase tracking-widest mb-2">Final Check</p>
              <p className="text-[11px] font-medium leading-relaxed">
                Pastikan teks sudah benar. PDF disarankan untuk pencetakan, DOCX untuk pengeditan lanjut.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}