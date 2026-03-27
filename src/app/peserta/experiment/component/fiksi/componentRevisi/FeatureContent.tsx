"use client";
import { motion } from "framer-motion";
import { Loader2, Type, User, BookText, AlertTriangle, CheckCircle2 } from "lucide-react";

interface FeatureContentProps {
  activeFeature: string | null;
  isVertical?: boolean;
  isScanningConsistency: boolean;
  consistencyReports: any[];
  localComments: any[];
  localVersions: any[];
  characters: any[];
  selectedVersionId: any;
  handleSelectVersion: (v: any) => void;
  handleDeleteComment: (c: any) => void;
  scrollToHighlight: (id: string) => void;
  setSelectedChar: (char: any) => void;
}

export default function FeatureContent({
  activeFeature,
  isVertical = false,
  isScanningConsistency,
  consistencyReports,
  localComments,
  localVersions,
  characters,
  selectedVersionId,
  handleSelectVersion,
  handleDeleteComment,
  scrollToHighlight,
  setSelectedChar,
}: FeatureContentProps) {
  return (
    <div className={`${isVertical ? "space-y-4 px-2" : "flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth"}`}>
      {/* 1. KONSISTENSI AI */}
      {activeFeature === "konsistensi" && (
        <div className={`${isVertical ? "w-full" : "flex gap-4 w-full"}`}>
          {isScanningConsistency ? (
            <div className="flex flex-col items-center justify-center p-12 w-full bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <Loader2 className="animate-spin text-rose-500 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Editor AI sedang membedah naskah & ejaan...</p>
            </div>
          ) : consistencyReports.length > 0 ? (
            consistencyReports.map((report, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`${isVertical ? "w-full mb-6" : "min-w-[320px] flex-shrink-0 snap-start"} p-6 border-2 rounded-[2rem] shadow-sm relative group overflow-hidden ${report.type === "typo" ? "bg-blue-50 border-blue-100" : "bg-rose-50 border-rose-100"}`}>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  {report.type === "typo" ? <BookText size={60} className="text-blue-600" /> : <AlertTriangle size={60} className="text-rose-600" />}
                </div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${report.type === "typo" ? "bg-blue-600" : "bg-rose-600"}`}>
                      {report.type === "typo" ? <Type size={20} /> : <User size={20} />}
                   </div>
                   <div>
                      <h6 className={`font-black text-xs uppercase ${report.type === "typo" ? "text-blue-700" : "text-rose-700"}`}>{report.name}</h6>
                      <p className={`text-[8px] font-bold uppercase tracking-widest ${report.type === "typo" ? "text-blue-400" : "text-rose-400"}`}>
                        {report.type === "typo" ? "Saran Ejaan & Typo" : "Inkonsistensi Tokoh"}
                      </p>
                   </div>
                </div>
                <div className="space-y-3 relative z-10">
                   <div className="bg-white/60 p-3 rounded-xl border border-white/50 shadow-sm">
                      <span className={`text-[8px] font-black uppercase block mb-1 ${report.type === "typo" ? "text-blue-400" : "text-rose-400"}`}>Temuan Editor:</span>
                      <p className="text-[11px] text-slate-700 font-medium leading-relaxed italic">"{report.issue}"</p>
                   </div>
                   <div className={`p-3 rounded-xl border shadow-sm ${report.type === "typo" ? "bg-blue-600 text-white border-blue-700" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                      <span className={`text-[8px] font-black uppercase block mb-1 ${report.type === "typo" ? "text-blue-200" : "text-emerald-500"}`}>Saran Perbaikan:</span>
                      <p className="text-[11px] font-bold leading-relaxed">{report.fix_suggestion}</p>
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 w-full bg-slate-50 rounded-[2.5rem] text-slate-400 border-2 border-dashed border-slate-200">
              <CheckCircle2 className="text-emerald-500 mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest">Naskah Luar Biasa!</p>
            </div>
          )}
        </div>
      )}

      {/* 2. KOMENTAR */}
      {activeFeature === "komentar" && localComments.map((comment) => (
        <motion.div whileHover={{ y: -5 }} key={comment.id} onClick={() => scrollToHighlight(comment.highlight_id)}
          className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group relative bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-orange-400 p-5 rounded-[2rem] transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase ${comment.label === "Typo/Ejaan" ? "bg-blue-100 text-blue-600" : comment.label === "Plot Hole" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
              {comment.label}
            </span>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteComment(comment); }} className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">✕</button>
          </div>
          <div className="relative pl-4 border-l-2 border-slate-200 mb-3 text-black">
            <p className="text-[11px] leading-relaxed font-bold line-clamp-2">"{comment.selected_text}"</p>
          </div>
          {comment.comment_text && (
            <div className="bg-white p-3 rounded-2xl border border-slate-100 transition-colors">
              <p className="text-[10px] text-slate-600 font-medium leading-relaxed line-clamp-2">{comment.comment_text}</p>
            </div>
          )}
        </motion.div>
      ))}

      {/* 3. VERSI */}
      {activeFeature === "versi" && (
        <>
          <div onClick={() => handleSelectVersion("sekarang")}
            className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer ${selectedVersionId === "sekarang" ? "border-black bg-black text-white shadow-2xl" : "border-slate-100 bg-slate-50 hover:border-slate-300"}`}>
            <div className="flex justify-between items-center mb-4">
              <div className={`w-3 h-3 rounded-full animate-pulse ${selectedVersionId === "sekarang" ? "bg-green-400" : "bg-slate-300"}`} />
              <span className={`text-[8px] font-black uppercase tracking-widest ${selectedVersionId === "sekarang" ? "text-white/60" : "text-slate-400"}`}>Aktif</span>
            </div>
            <h6 className="font-black text-xs uppercase mb-1">DRAFT UTAMA</h6>
            <p className={`text-[9px] font-bold ${selectedVersionId === "sekarang" ? "text-white/50" : "text-slate-400"}`}>Penyuntingan Real-time</p>
          </div>
          {localVersions.map((v) => (
            <div key={v.id} onClick={() => handleSelectVersion(v)}
              className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer ${selectedVersionId === v.id ? "border-orange-500 bg-orange-50 shadow-lg" : "border-slate-100 bg-slate-50 hover:border-orange-200"}`}>
              <div className="flex justify-between items-center mb-4 text-slate-400 group-hover:text-orange-500 transition-colors">
                <span className="text-[18px]">📜</span>
                <span className="text-[8px] font-black uppercase tracking-widest">{new Date(v.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
              <h6 className="font-black text-xs uppercase text-slate-800 mb-1">{v.version_name}</h6>
              <p className="text-[9px] font-bold text-slate-400">Backup Terarsip</p>
            </div>
          ))}
        </>
      )}

      {/* 4. QC TOKOH */}
      {activeFeature === "qc" && characters.map((char) => (
        <motion.div layout whileHover={{ y: -5 }} key={char.id} onClick={() => setSelectedChar(char)}
          className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} bg-white rounded-[2.5rem] border-2 border-slate-100 p-5 group relative hover:border-violet-400 transition-all shadow-sm hover:shadow-xl cursor-pointer`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-violet-100 rounded-[1.5rem] flex items-center justify-center text-2xl overflow-hidden border-2 border-violet-50 shrink-0">
              {char.imageUrl ? <img src={char.imageUrl} alt={char.fullName} className="w-full h-full object-cover" /> : <User size={30} className="text-violet-300" />}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 uppercase truncate leading-none mb-1">{char.fullName}</h4>
              <span className="text-[9px] font-black bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full uppercase">{char.role}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-300 uppercase">Usia</span>
              <span className="text-[10px] font-black text-slate-600">{char.age || "-"} Tahun</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[8px] font-bold text-slate-300 uppercase">Sifat Utama</span>
              <span className="text-[10px] font-black text-slate-600 truncate">{char.goodTraits?.[0] || "-"}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}