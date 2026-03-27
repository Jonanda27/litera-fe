"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ChapterDropdownProps {
  outlines: any[];
  selectedChapter: any;
  setSelectedChapter: (chap: any) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (val: boolean) => void;
}

export default function ChapterDropdown({
  outlines,
  selectedChapter,
  setSelectedChapter,
  isDropdownOpen,
  setIsDropdownOpen,
}: ChapterDropdownProps) {
  return (
    <div className="flex-1">
      <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3 block pl-1">
        Pilih Bab Untuk Ditulis
      </label>

      <div className="relative w-full max-w-md">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between bg-slate-50 border-2 border-slate-100 p-3 md:p-4 rounded-xl md:rounded-2xl hover:border-blue-500 transition-all shadow-inner group"
        >
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-black shadow-lg shadow-blue-200">
              {selectedChapter ? selectedChapter.chapter_number : "?"}
            </span>
            <span className={`text-xs md:text-sm font-bold truncate ${selectedChapter ? 'text-slate-800' : 'text-slate-400'}`}>
              {selectedChapter ? selectedChapter.title : "Klik untuk memilih bab..."}
            </span>
          </div>
          <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
            <ChevronDown className="text-slate-400 group-hover:text-blue-500" size={16} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-2xl md:rounded-3xl shadow-2xl z-20 overflow-hidden"
              >
                <div className="max-h-[250px] md:max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                  {outlines.length > 0 ? (
                    outlines.map((chap) => (
                      <button
                        key={chap.id}
                        onClick={() => {
                          setSelectedChapter(chap);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 transition-all mb-1 ${selectedChapter?.id === chap.id
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-slate-50 text-slate-600"
                          }`}
                      >
                        <span className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-black ${selectedChapter?.id === chap.id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                          {chap.chapter_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] md:text-[13px] font-black uppercase tracking-tight truncate">{chap.title}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs font-bold text-slate-400 italic">Belum ada outline bab.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}