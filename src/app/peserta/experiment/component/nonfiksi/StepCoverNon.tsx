"use client";

import { useState, useRef, ChangeEvent } from "react";
import { 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  Info, 
  Save, 
  Loader2,
  FileDigit,
  AlertTriangle
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

// --- Utils Kompresi dengan Limit 2MB ---
const compressImage = (base64Str: string, maxWidth = 1200, targetSizeMb = 2): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Putihkan background untuk JPEG
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }

      const maxSizeBytes = targetSizeMb * 1024 * 1024;
      let quality = 0.8; // Mulai dari kualitas cukup tinggi
      let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

      // Loop pengecekan ukuran: turunkan kualitas jika masih > 2MB
      // (Base64 length * 0.75 adalah estimasi ukuran biner)
      while (compressedBase64.length * 0.75 > maxSizeBytes && quality > 0.1) {
        quality -= 0.1;
        compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(compressedBase64);
    };
  });
};

// Helper Hitung Ukuran
const getBase64SizeRaw = (base64String: string | null) => {
  if (!base64String) return 0;
  const stringLength = base64String.length - (base64String.indexOf(',') + 1);
  return stringLength * (3 / 4);
};

const formatSize = (bytes: number) => {
  const kb = bytes / 1024;
  if (kb > 1024) return (kb / 1024).toFixed(2) + " MB";
  return kb.toFixed(2) + " KB";
};

export default function StepCoverNon({ formData, onDataChange }: any) {
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const originalBase64 = reader.result as string;
          // Kompres dengan target maksimal 2MB
          const compressedBase64 = await compressImage(originalBase64, 1200, 2);
          
          const field = side === "front" ? "coverFront" : "coverBack";
          onDataChange({ ...formData, [field]: compressedBase64 });
          setSaveSuccess(false);
        } catch (error) {
          console.error("Compression error:", error);
          alert("Gagal memproses gambar.");
        } finally {
          setIsCompressing(false);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (side: "front" | "back") => {
    const field = side === "front" ? "coverFront" : "coverBack";
    onDataChange({ ...formData, [field]: null });
    setSaveSuccess(false);
  };

  const handleSaveToDatabase = async () => {
    if (!formData.id) return alert("ID Proyek tidak ditemukan.");
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/books/save-covers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: formData.id,
          coverFront: formData.coverFront,
          coverBack: formData.coverBack
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(result.message || "Gagal menyimpan sampul");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 px-1 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-[2rem] shadow-lg text-white gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
            <ImageIcon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider">Desain Sampul</h3>
          </div>
        </div>

        <button
          onClick={handleSaveToDatabase}
          disabled={isSaving || isCompressing}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
            saveSuccess ? "bg-emerald-500 text-white" : "bg-white text-amber-600 hover:bg-amber-50"
          } disabled:opacity-50`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : saveSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {isSaving ? "Menyimpan..." : saveSuccess ? "Tersimpan!" : "Simpan Sampul"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cover Depan */}
        <div className="space-y-4">
          <div className="flex justify-between items-end ml-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sampul Depan</label>
            {formData.coverFront && (
              <span className={`text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                getBase64SizeRaw(formData.coverFront) > 2 * 1024 * 1024 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"
              }`}>
                <FileDigit size={10} /> {formatSize(getBase64SizeRaw(formData.coverFront))}
              </span>
            )}
          </div>
          <div 
            onClick={() => !formData.coverFront && !isCompressing && frontInputRef.current?.click()}
            className={`relative aspect-[2/3] rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer ${
              formData.coverFront ? "border-emerald-400 shadow-xl" : "border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-white"
            }`}
          >
            <input type="file" ref={frontInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, "front")} />
            {isCompressing && !formData.coverFront ? (
               <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-amber-500" size={32} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimasi Ukuran...</p>
               </div>
            ) : formData.coverFront ? (
              <>
                <img src={formData.coverFront} alt="Front" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  <button onClick={(e) => { e.stopPropagation(); frontInputRef.current?.click(); }} className="bg-white text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Ganti</button>
                  <button onClick={(e) => { e.stopPropagation(); removeImage("front"); }} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Hapus</button>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <Upload size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Klik Unggah</p>
              </div>
            )}
          </div>
        </div>

        {/* Cover Belakang */}
        <div className="space-y-4">
          <div className="flex justify-between items-end ml-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sampul Belakang</label>
            {formData.coverBack && (
              <span className={`text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                getBase64SizeRaw(formData.coverBack) > 2 * 1024 * 1024 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"
              }`}>
                <FileDigit size={10} /> {formatSize(getBase64SizeRaw(formData.coverBack))}
              </span>
            )}
          </div>
          <div 
            onClick={() => !formData.coverBack && !isCompressing && backInputRef.current?.click()}
            className={`relative aspect-[2/3] rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer ${
              formData.coverBack ? "border-emerald-400 shadow-xl" : "border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-white"
            }`}
          >
            <input type="file" ref={backInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, "back")} />
            {isCompressing && !formData.coverBack ? (
               <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-amber-500" size={32} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimasi Ukuran...</p>
               </div>
            ) : formData.coverBack ? (
              <>
                <img src={formData.coverBack} alt="Back" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  <button onClick={(e) => { e.stopPropagation(); backInputRef.current?.click(); }} className="bg-white text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Ganti</button>
                  <button onClick={(e) => { e.stopPropagation(); removeImage("back"); }} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Hapus</button>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <Upload size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Klik Unggah</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-200 flex items-start gap-4 shadow-sm">
        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600">Sistem Diet Gambar Aktif:</p>
          <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
            Biar file-nya nggak obesitas, sistem otomatis membatasi ukuran maksimal <b>2.00 MB</b>. Jika kamu upload gambar raksasa, kualitasnya akan disesuaikan secara otomatis agar tetap muat di database dan lancar saat di-download sebagai PDF.
          </p>
        </div>
      </div>
    </div>
  );
}