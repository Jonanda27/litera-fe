"use client";

interface StatsFooterProps {
  selectedChapter: any;
  currentWordCount: number;
  targetKata: number;
  pageCount: number;
}

export default function StatsFooter({
  selectedChapter,
  currentWordCount,
  targetKata,
  pageCount
}: StatsFooterProps) {
  return (
    <div className="mt-4 md:mt-8 bg-black p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl border-t-4 md:border-t-8 border-slate-800">
      <div className="text-center md:text-left">
        <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Kata Bab {selectedChapter?.chapter_number || ""}</p>
        <div className="flex items-baseline justify-center md:justify-start gap-2">
          <span className="text-3xl md:text-5xl font-black italic">{currentWordCount || 0}</span>
          <span className="text-xs md:text-sm font-bold text-slate-500">/ {targetKata || 1000} Target</span>
        </div>
      </div>
      <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
        <div className="text-[9px] md:text-[10px] font-black uppercase bg-slate-800 px-5 py-3 rounded-xl md:rounded-2xl border border-slate-700 shadow-inner w-full text-center">
          Halaman: {pageCount}
        </div>
      </div>
    </div>
  );
}