"use client";
import { motion } from "framer-motion";
import { User, Briefcase, Info } from "lucide-react";

interface CharacterDetailModalProps {
  selectedChar: any;
  onClose: () => void;
}

export default function CharacterDetailModal({ selectedChar, onClose }: CharacterDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all z-10">✕</button>

        <div className="grid md:grid-cols-5 h-full">
          <div className="md:col-span-2 bg-violet-600 p-8 flex flex-col items-center text-center text-white">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white/20 border-4 border-white/30 overflow-hidden mb-4 shadow-xl">
              {selectedChar.imageUrl ? <img src={selectedChar.imageUrl} className="w-full h-full object-cover" /> : <User size={60} className="m-auto h-full opacity-50" />}
            </div>
            <h3 className="text-xl font-black uppercase leading-tight">{selectedChar.fullName}</h3>
            <p className="text-xs font-bold text-violet-200 uppercase tracking-widest mt-1">"{selectedChar.nickname}"</p>
            <span className="mt-4 px-4 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase">{selectedChar.role}</span>
            <div className="mt-8 w-full space-y-3">
              <div className="flex items-center gap-2 text-left w-full bg-black/10 p-2 rounded-xl">
                <div className="text-violet-200"><Briefcase size={12} /></div>
                <div className="min-w-0">
                  <p className="text-[7px] uppercase font-black text-violet-300 leading-none">Pekerjaan</p>
                  <p className="text-[10px] font-bold truncate text-white">{selectedChar.job || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 p-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">Biografi & Masa Lalu</h4>
                <p className="text-sm font-medium text-slate-600 leading-relaxed ">{selectedChar.past || "Belum ada riwayat masa lalu..."}</p>
              </section>
              <section className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Sifat Baik</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedChar.goodTraits?.map((t: string, i: number) => t && <span key={i} className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold">#{t.trim()}</span>)}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Sifat Buruk</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedChar.badTraits?.map((t: string, i: number) => t && <span key={i} className="text-[9px] bg-rose-50 text-rose-600 px-2 py-1 rounded-md font-bold">#{t.trim()}</span>)}
                  </div>
                </div>
              </section>
              <section className="bg-slate-50 p-4 rounded-2xl">
                <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Info size={12} /> Perkembangan Arc</h4>
                <div className="flex items-center gap-3 text-xs"><span className="font-bold text-slate-400 uppercase">Mulai:</span><p className="font-black text-slate-700">{selectedChar.arcStart || "-"}</p></div>
                <div className="flex items-center gap-3 text-xs mt-1"><span className="font-bold text-slate-400 uppercase">Akhir:</span><p className="font-black text-fuchsia-600">{selectedChar.arcEnd || "-"}</p></div>
              </section>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}