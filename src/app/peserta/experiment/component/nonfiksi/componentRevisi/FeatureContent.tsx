"use client";
import { motion } from "framer-motion";

interface FeatureContentProps {
  activeFeature: string | null;
  isVertical?: boolean;
  localComments: any[];
  localVersions: any[];
  selectedVersionId: any;
  handleSelectVersion: (v: any) => void;
  handleDeleteComment: (c: any) => void;
  scrollToHighlight: (id: string) => void;
  // Props tambahan untuk kompatibilitas fiksi (opsional)
  isScanningConsistency?: boolean;
  consistencyReports?: any[];
  characters?: any[];
  setSelectedChar?: (char: any) => void;
}

export default function FeatureContent({
  activeFeature,
  isVertical = false,
  localComments,
  localVersions,
  selectedVersionId,
  handleSelectVersion,
  handleDeleteComment,
  scrollToHighlight,
}: FeatureContentProps) {
  return (
    <div className={`${isVertical ? "space-y-4 px-2" : "flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth"}`}>
      
      {activeFeature === "komentar" && localComments.map((comment) => (
        <motion.div 
          whileHover={{ y: -5 }} 
          key={comment.id} 
          onClick={() => scrollToHighlight(comment.highlight_id)}
          className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group relative bg-slate-50 hover:bg-white border-2 border-slate-100 p-5 rounded-[2rem] transition-all cursor-pointer shadow-sm`}
        >
          {/* ... UI Komentar Sama ... */}
        </motion.div>
      ))}

      {activeFeature === "versi" && (
        <>
          <div 
            onClick={() => handleSelectVersion("sekarang")}
            className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${selectedVersionId === "sekarang" ? "border-black bg-black text-white shadow-2xl" : "bg-slate-50 border-slate-100"}`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className={`w-3 h-3 rounded-full animate-pulse ${selectedVersionId === "sekarang" ? "bg-green-400" : "bg-slate-300"}`} />
              <span className="text-[8px] font-black uppercase">Aktif</span>
            </div>
            <h6 className="font-black text-xs uppercase">DRAFT UTAMA</h6>
          </div>

          {localVersions.map((v) => (
            <div 
              key={v.id} 
              onClick={() => handleSelectVersion(v)}
              className={`${isVertical ? "w-full mb-4" : "min-w-[calc(33.333%-14px)] flex-shrink-0 snap-start"} group p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${selectedVersionId === v.id ? "border-orange-500 bg-orange-50" : "border-slate-100 bg-slate-50"}`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[18px]">📜</span>
                <span className="text-[8px] font-black uppercase">{new Date(v.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
              <h6 className="font-black text-xs uppercase">{v.version_name}</h6>
              <p className="text-[9px] font-bold text-slate-400">Klik untuk Review</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}