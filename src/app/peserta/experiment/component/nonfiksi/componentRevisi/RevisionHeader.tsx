"use client";
import { ChevronDown, SearchCheck, Loader2 } from "lucide-react";

interface RevisionHeaderProps {
  outlines: any[];
  selectedChapter: any;
  setSelectedChapter: (chap: any) => void;
  isScanningConsistency: boolean;
  handleAIConsistencyCheck: () => void;
}

export default function RevisionHeader({
  outlines,
  selectedChapter,
  setSelectedChapter,
  isScanningConsistency,
  handleAIConsistencyCheck,
}: RevisionHeaderProps) {
  return (
    <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative z-[60]">
      <div className="flex-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block pl-1">
          Navigasi Bab Revisi
        </label>
        <div className="relative w-full max-w-md">
          <select
            value={selectedChapter?.id || ""}
            onChange={(e) => {
              const found = outlines.find((o) => o.id.toString() === e.target.value);
              if (found) setSelectedChapter(found);
            }}
            className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl hover:border-slate-400 text-slate-800 font-bold text-sm outline-none appearance-none cursor-pointer transition-all pr-12 shadow-inner"
          >
            <option value="" disabled>-- Pilih Bab --</option>
            {outlines.map((chap) => (
              <option key={chap.id} value={chap.id}>
                Bab {chap.chapter_number}: {chap.title}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
            <div className="w-px h-4 bg-slate-300 mr-1" />
            <ChevronDown className="text-slate-400" size={18} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Mode</span>
          <span className="text-[11px] font-bold text-slate-800 mt-1 uppercase">
            Reviewing Bab {selectedChapter?.chapter_number || "?"}
          </span>
        </div>
      </div>
    </div>
  );
}