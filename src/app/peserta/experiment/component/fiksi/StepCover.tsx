"use client";

import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  CheckCircle2, 
  Info, 
  Save, 
  Loader2 
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

export default function StepCover({ formData, onDataChange }: any) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Penanganan konversi gambar ke Base64
  const handleUpload = (e: ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return alert("Ukuran file terlalu besar (Maksimal 5MB)");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const field = side === "front" ? "coverFront" : "coverBack";
        onDataChange({ ...formData, [field]: reader.result as string });
        setSaveSuccess(false); // Reset status sukses jika ada perubahan gambar
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (side: "front" | "back") => {
    const field = side === "front" ? "coverFront" : "coverBack";
    onDataChange({ ...formData, [field]: null });
    setSaveSuccess(false);
  };

  // Fungsi Integrasi API Simpan ke Database
  const handleSaveToDatabase = async () => {
    if (!formData.id) {
      return alert("ID Proyek tidak ditemukan. Harap simpan draf utama terlebih dahulu.");
    }

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
        setTimeout(() => setSaveSuccess(false), 3000); // Hilangkan notif sukses setelah 3 detik
      } else {
        alert(result.message || "Gagal menyimpan sampul");
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 px-1 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-indigo-600 to-blue-700 p-6 rounded-[2rem] shadow-lg text-white gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
            <ImageIcon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider">Desain Sampul Buku</h3>
            <p className="text-[10px] font-bold text-blue-100 uppercase opacity-80 italic">Visualisasikan identitas fisik karyamu</p>
          </div>
        </div>

        {/* Button Simpan */}
        <button
          onClick={handleSaveToDatabase}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
            saveSuccess 
            ? "bg-emerald-500 text-white" 
            : "bg-white text-indigo-700 hover:bg-indigo-50"
          } disabled:opacity-50`}
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : saveSuccess ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? "Menyimpan..." : saveSuccess ? "Tersimpan!" : "Simpan Sampul"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Slot Cover Depan */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Sampul Depan (Wajib)</label>
          <div 
            onClick={() => !formData.coverFront && frontInputRef.current?.click()}
            className={`relative aspect-[2/3] rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer ${
              formData.coverFront ? "border-emerald-400 shadow-xl" : "border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-white"
            }`}
          >
            <input type="file" ref={frontInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, "front")} />
            
            {formData.coverFront ? (
              <>
                <img src={formData.coverFront} alt="Cover Depan" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  <button onClick={(e) => { e.stopPropagation(); frontInputRef.current?.click(); }} className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Ganti Gambar</button>
                  <button onClick={(e) => { e.stopPropagation(); removeImage("front"); }} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Hapus</button>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <Upload size={48} className="text-slate-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Klik untuk Unggah<br/>Cover Depan</p>
              </div>
            )}
          </div>
        </div>

        {/* Slot Cover Belakang */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Sampul Belakang (Opsional)</label>
          <div 
            onClick={() => !formData.coverBack && backInputRef.current?.click()}
            className={`relative aspect-[2/3] rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer ${
              formData.coverBack ? "border-emerald-400 shadow-xl" : "border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-white"
            }`}
          >
            <input type="file" ref={backInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, "back")} />

            {formData.coverBack ? (
              <>
                <img src={formData.coverBack} alt="Cover Belakang" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  <button onClick={(e) => { e.stopPropagation(); backInputRef.current?.click(); }} className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Ganti Gambar</button>
                  <button onClick={(e) => { e.stopPropagation(); removeImage("back"); }} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Hapus</button>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <Upload size={48} className="text-slate-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Klik untuk Unggah<br/>Cover Belakang</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Syarat & Info */}
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-start gap-4 shadow-xl border border-white/5">
        <Info className="text-indigo-400 shrink-0" size={20} />
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Rekomendasi Format:</p>
          <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
            Gunakan rasio 2:3 (A5 atau B5) untuk hasil terbaik. Maksimal ukuran file 5MB per gambar. Sampul ini akan muncul di dashboard pengerjaan dan file PDF final Anda.
          </p>
        </div>
      </div>
    </div>
  );
}