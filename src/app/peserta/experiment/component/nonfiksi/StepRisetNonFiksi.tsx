"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; 
import { 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  Star, 
  Users, 
  Compass, 
  Zap,
  RefreshCw,
  Save
} from "lucide-react";

interface StepRisetNonFiksiProps {
  formData: any;
  onDataChange: (data: any) => void;
}

export default function StepRisetNonFiksi({ formData, onDataChange }: StepRisetNonFiksiProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  
  // Ref untuk mengunci proses fetch agar tidak berulang (Infinite Loop Protection)
  const hasFetchedRef = useRef<number | null>(null);
  // Ref untuk memantau data terakhir yang dikirim ke parent (AddProjectModal)
  const lastSentDataRef = useRef("");

  const [data, setData] = useState({
    bookId: formData?.bookId || formData?.id || null,
    tempTitle: formData.tempTitle || "",
    mainTopic: formData.mainTopic || "",
    readerProblem: formData.readerProblem || "",
    bookSolution: formData.bookSolution || "",
    nicheLevel: formData.nicheLevel || "Pemula sama sekali",
    specificNiche: formData.specificNiche || "",
    targetLogic: {
      want: formData.targetLogic?.want || "",
      obstacle: formData.targetLogic?.obstacle || "",
      need: formData.targetLogic?.need || "",
    },
    usp: formData.usp || "",
    oneSentenceSummary: {
      target: formData.oneSentenceSummary?.target || "",
      duration: formData.oneSentenceSummary?.duration || "",
    },
  });

  // --- 1. SINKRONISASI ID DARI INDUK ---
  useEffect(() => {
    const currentId = formData?.bookId || formData?.id;
    if (currentId && currentId !== data.bookId) {
      setData(prev => ({ ...prev, bookId: currentId }));
    }
  }, [formData?.bookId, formData?.id]);

  // --- 2. FETCH DATA DARI DATABASE (GET) ---
  useEffect(() => {
    const fetchExistingResearch = async () => {
      const bookId = formData?.bookId || formData?.id;
      
      // Jika tidak ada ID atau ID ini sudah pernah di-fetch, jangan hit API lagi
      if (!bookId || hasFetchedRef.current === bookId) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Endpoint sesuai rute backend: /api/books/non-fiction/research/:bookId [cite: 1907]
        const res = await axios.get(`http://localhost:4000/api/books/non-fiction/research/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.data) {
          const dbData = res.data.data;
          
          // Kunci ID agar useEffect ini tidak berjalan lagi meski ada re-render
          hasFetchedRef.current = bookId;

          const syncedData = {
            bookId: bookId,
            tempTitle: dbData.tempTitle || "",
            mainTopic: dbData.mainTopic || "",
            readerProblem: dbData.readerProblem || "",
            bookSolution: dbData.bookSolution || "",
            nicheLevel: dbData.nicheLevel || "Pemula sama sekali",
            specificNiche: dbData.specificNiche || "",
            usp: dbData.usp || "",
            targetLogic: dbData.targetLogic || { want: "", obstacle: "", need: "" },
            oneSentenceSummary: dbData.oneSentenceSummary || { target: "", duration: "" },
          };
          
          // Update ref terakhir agar useEffect pengirim ke parent (no. 3) tidak memicu loop
          lastSentDataRef.current = JSON.stringify(syncedData);
          setData(syncedData);
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data non-fiksi:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingResearch();
  }, [formData?.bookId, formData?.id]);

  // --- 3. KIRIM PERUBAHAN KE PARENT (LOOP PREVENTION) ---
  useEffect(() => {
    const currentDataString = JSON.stringify(data);
    
    // Hanya panggil onDataChange jika data benar-benar berbeda dari yang terakhir dikirim
    if (lastSentDataRef.current !== currentDataString) {
      lastSentDataRef.current = currentDataString;
      onDataChange(data);
    }
  }, [data, onDataChange]);

  // --- 4. FUNGSI SIMPAN KE DATABASE (POST/PATCH) ---
  const handleSaveToDatabase = async () => {
    const currentBookId = data.bookId || formData?.bookId || formData?.id;
    
    if (!currentBookId) {
      alert("Error: ID Buku tidak ditemukan. Pastikan proyek telah terdaftar.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      // Endpoint sesuai rute backend: /api/books/non-fiction/research [cite: 1908]
      const res = await axios.post(
        `http://localhost:4000/api/books/non-fiction/research`,
        { ...data, bookId: currentBookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 || res.status === 201) {
        alert("Strategi buku berhasil disimpan ke database!");
      }
    } catch (error: any) {
      console.error("Save Error:", error);
      alert("Gagal menyimpan ke database: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (group: string, field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [group]: { ...prev[group], [field]: value },
    }));
  };

  const nicheOptions = [
    "Pemula sama sekali",
    "Punya dasar, mau naik level",
    "Profesional / Ahli",
    "Umum / Semua orang",
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-full mx-auto space-y-6 pb-6 text-slate-800"
    >
      {/* HEADER & TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
        <div className="text-left space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full shadow-md">
            <Compass size={12} />
            <h2 className="text-[9px] font-black uppercase tracking-widest">
              Visi & Strategi Buku
            </h2>
          </div>
          {isLoading && (
            <span className="ml-3 text-[10px] font-bold text-blue-400 animate-pulse uppercase tracking-tighter">
              Synchronizing...
            </span>
          )}
        </div>

        {/* BUTTON SIMPAN KE DATABASE */}
        <button
          onClick={handleSaveToDatabase}
          disabled={isSaving || isLoading}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
            isSaving 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
          }`}
        >
          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? "Menyimpan..." : "Simpan Ke Database"}
        </button>
      </div>
      
      <div className="relative group max-w-lg mx-auto text-center">
        <input
          type="text"
          value={data.tempTitle}
          onChange={(e) => handleChange("tempTitle", e.target.value)}
          placeholder="Judul Sementara Anda..."
          className="w-full text-center text-xl font-black text-slate-800 placeholder:text-slate-200 outline-none bg-transparent border-b border-transparent focus:border-blue-200 transition-all pb-1"
        />
      </div>

      {/* CORE IDEA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniCard icon={<Target size={16} className="text-blue-500" />} title="Topik Utama" color="blue">
          <textarea
            value={data.mainTopic}
            onChange={(e) => handleChange("mainTopic", e.target.value)}
            placeholder="Subjek besar buku..."
            className="form-textarea-modal focus:border-blue-400"
          />
        </MiniCard>

        <MiniCard icon={<AlertTriangle size={16} className="text-rose-500" />} title="Masalah Pembaca" color="rose">
          <textarea
            value={data.readerProblem}
            onChange={(e) => handleChange("readerProblem", e.target.value)}
            placeholder="Rasa sakit yang disembuhkan..."
            className="form-textarea-modal focus:border-rose-400"
          />
        </MiniCard>

        <MiniCard icon={<Lightbulb size={16} className="text-emerald-500" />} title="Solusi Buku" color="emerald">
          <textarea
            value={data.bookSolution}
            onChange={(e) => handleChange("bookSolution", e.target.value)}
            placeholder="Metode unik yang ditawarkan..."
            className="form-textarea-modal focus:border-emerald-400"
          />
        </MiniCard>

        <MiniCard icon={<Star size={16} className="text-amber-500" />} title="Value Unik (USP)" color="amber">
          <textarea
            value={data.usp}
            onChange={(e) => handleChange("usp", e.target.value)}
            placeholder="Kenapa buku ini berbeda?"
            className="form-textarea-modal focus:border-amber-400"
          />
        </MiniCard>
      </div>

      {/* NICHE & TARGET */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Level</h3>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {nicheOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange("nicheLevel", opt)}
                  className={`text-left px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                    data.nicheLevel === opt 
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Spesifik Pembaca</h3>
            </div>
            <textarea
              value={data.specificNiche}
              onChange={(e) => handleChange("specificNiche", e.target.value)}
              placeholder="Contoh: Ibu rumah tangga usia 25-40 thn..."
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-400 focus:bg-white outline-none text-xs font-semibold h-[115px] resize-none transition-all leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* READER LOGIC */}
      <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-lg relative overflow-hidden">
        <h3 className="text-[9px] font-black text-blue-400 uppercase text-center tracking-[0.3em] mb-5">
          The Reader's Journey Logic
        </h3>
        <div className="space-y-2.5 relative z-10">
          <LogicRow label="Ingin" color="blue" value={data.targetLogic.want} onChange={(v: string) => handleNestedChange("targetLogic", "want", v)} placeholder="Tujuan utama pembaca?" />
          <LogicRow label="Tapi" color="rose" value={data.targetLogic.obstacle} onChange={(v: string) => handleNestedChange("targetLogic", "obstacle", v)} placeholder="Rintangan mereka?" />
          <LogicRow label="Butuh" color="emerald" value={data.targetLogic.need} onChange={(v: string) => handleNestedChange("targetLogic", "need", v)} placeholder="Kenapa buku ini solusinya?" />
        </div>
      </div>

      {/* ELEVATOR PITCH */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-center shadow-lg">
        <div className="space-y-4">
          <h3 className="text-white/60 text-[9px] font-black uppercase tracking-widest">Elevator Pitch (Ultimate Hook)</h3>
          <div className="text-sm md:text-base text-white font-medium leading-relaxed italic">
            "Buku ini adalah panduan untuk{" "}
            <input
              type="text"
              value={data.oneSentenceSummary.target}
              onChange={(e) => handleNestedChange("oneSentenceSummary", "target", e.target.value)}
              placeholder="target utama"
              className="bg-white/10 border-b border-white/30 outline-none px-2 py-0.5 text-amber-300 placeholder:text-white/20 rounded font-bold w-40 inline-block text-center focus:bg-white/20 transition-all mx-1"
            />{" "}
            dalam waktu{" "}
            <input
              type="text"
              value={data.oneSentenceSummary.duration}
              onChange={(e) => handleNestedChange("oneSentenceSummary", "duration", e.target.value)}
              placeholder="durasi"
              className="bg-white/10 border-b border-white/30 outline-none px-2 py-0.5 text-amber-300 placeholder:text-white/20 rounded font-bold w-24 inline-block text-center focus:bg-white/20 transition-all mx-1"
            />."
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-textarea-modal {
          width: 100%;
          padding: 12px;
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          outline: none;
          font-size: 13px;
          font-weight: 600;
          height: 80px;
          resize: none;
          transition: all 0.2s;
          color: #334155;
        }
        .form-textarea-modal:focus {
          background-color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
      `}</style>
    </motion.div>
  );
}

function MiniCard({ icon, title, children, color }: any) {
  const colors: any = {
    blue: "border-l-blue-500",
    rose: "border-l-rose-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
  };

  return (
    <div className={`bg-white p-4 rounded-2xl shadow-sm border ${colors[color]} border-y-slate-50 border-r-slate-50 space-y-3`}>
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function LogicRow({ label, color, value, onChange, placeholder }: any) {
  const colorClasses: any = {
    blue: "text-blue-400 bg-blue-400/10",
    rose: "text-rose-400 bg-rose-400/10",
    emerald: "text-emerald-400 bg-emerald-400/10",
  };

  return (
    <div className="flex items-center gap-3 bg-white/5 p-1.5 pr-4 rounded-xl border border-white/5 focus-within:border-white/10 transition-all">
      <span className={`w-16 py-1 px-3 rounded-lg text-[9px] font-black uppercase text-center ${colorClasses[color]}`}>
        {label}
      </span>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-xs font-semibold text-white placeholder:font-normal placeholder:text-slate-600 py-2"
      />
    </div>
  );
}