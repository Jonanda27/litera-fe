"use client";
import { motion } from "framer-motion";
import { RotateCcw, X, ArrowRightLeft } from "lucide-react";

interface ComparisonModalProps {
  version: any;
  currentContent: any[];
  onClose: () => void;
  onRestore: () => void;
}

export default function ComparisonModal({ version, currentContent, onClose, onRestore }: ComparisonModalProps) {
  // Parsing konten versi lama
  let oldPages: any[] = [];
  try {
    const parsed = JSON.parse(version.content);
    oldPages = Array.isArray(parsed) ? parsed : [{ content: version.content }];
  } catch {
    oldPages = [{ content: version.content }];
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-7xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
              <ArrowRightLeft size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Bandingkan & Pulihkan</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Versi: {version.version_name} ({new Date(version.createdAt).toLocaleDateString("id-ID")})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Comparison Area */}
        <div className="flex-1 flex overflow-hidden bg-slate-50">
          {/* Sisi Kiri: Draft Sekarang */}
          <div className="flex-1 flex flex-col border-r border-slate-200">
            <div className="p-4 bg-slate-100/50 text-center border-b">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Draf Utama Saat Ini</span>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white prose-sm max-w-none">
              {currentContent.map((p, i) => (
                <div key={i} className="bg-white p-6 border rounded-xl shadow-sm opacity-60">
                  <div dangerouslySetInnerHTML={{ __html: p.content }} />
                </div>
              ))}
            </div>
          </div>

          {/* Sisi Kanan: Versi Backup */}
          <div className="flex-1 flex flex-col bg-orange-50/30">
            <div className="p-4 bg-orange-100/30 text-center border-b">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Arsip Versi (Preview)</span>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 prose-sm max-w-none">
              {oldPages.map((p, i) => (
                <div key={i} className="bg-white p-6 border-2 border-orange-100 rounded-xl shadow-md">
                  <div dangerouslySetInnerHTML={{ __html: p.content }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-8 border-t bg-slate-50 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
          >
            Batal
          </button>
          <button 
            onClick={() => {
              if(confirm("Apakah Anda yakin? Seluruh naskah utama saat ini akan digantikan oleh versi ini.")) {
                onRestore();
              }
            }}
            className="flex items-center gap-3 px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-200 transition-all active:scale-95"
          >
            <RotateCcw size={18} />
            Pulihkan Versi Ini
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}