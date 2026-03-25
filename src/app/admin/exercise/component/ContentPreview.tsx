import { PlayCircle, FileText } from "lucide-react";

export function ContentPreview({ previewUrl, selectedLesson }: any) {
  return (
    <div className="h-full rounded-[3rem] border-2 border-slate-100 overflow-hidden bg-slate-50 relative group shadow-inner min-h-[600px]">
      {previewUrl ? (
        <iframe 
          src={previewUrl} 
          className="w-full h-full border-0 rounded-[2.5rem]" 
          allowFullScreen 
          title="Preview" 
        />
      ) : (
        <div className="h-full flex flex-col items-center justify-center space-y-4 py-40">
          <div className="p-10 bg-white rounded-full shadow-2xl opacity-10 group-hover:opacity-100 transition-opacity">
            {selectedLesson?.type === "video" ? <PlayCircle size={60} className="text-blue-600" /> : <FileText size={60} className="text-amber-600" />}
          </div>
          <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Pilih file atau masukkan link untuk pratinjau</p>
        </div>
      )}
    </div>
  );
}