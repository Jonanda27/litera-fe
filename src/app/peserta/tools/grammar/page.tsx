"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Sparkles, 
  CheckCircle2, 
  RefreshCcw, 
  Type, 
  Trash2, 
  Copy,
  Loader2,
  Wand2,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constans/constans";

export default function GrammarPage() {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const router = useRouter();

  const processText = async (action: "check" | "paraphrase" | "formal") => {
    if (!inputText) return;
    
    setIsProcessing(true);
    setActiveAction(action);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/ai/process-text`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: inputText,
          mode: action,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult(data.suggestion || data.result);
      } else {
        alert(data.message || "Gagal memproses teks.");
      }
    } catch (error) {
      console.error("Error processing AI:", error);
      alert("Gagal menghubungi server. Pastikan backend aktif.");
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result || inputText);
    alert("Teks berhasil disalin!");
  };

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-6 pb-20 pt-6 px-4">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-3 hover:bg-rose-50 rounded-2xl text-rose-600 transition-all active:scale-90 border border-transparent hover:border-rose-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                Asisten Penulis <Sparkles className="text-rose-500" size={20} />
              </h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Sempurnakan naskah Anda secara instan</p>
            </div>
          </div>
          
          <button 
            onClick={() => { setInputText(""); setResult(""); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider border border-slate-200 shadow-sm"
          >
            <Trash2 size={14} /> Reset Editor
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden ring-1 ring-slate-100">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tuliskan atau tempel naskah Anda di sini..."
                className="w-full h-[480px] p-10 outline-none text-slate-700 leading-relaxed resize-none text-lg placeholder:text-slate-300"
              />
              
              <div className="absolute bottom-0 w-full p-5 bg-white border-t flex justify-between items-center">
                <div className="flex gap-3">
                  <div className="px-4 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tight border border-slate-100">
                    {inputText.length} Karakter
                  </div>
                  <div className="px-4 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tight border border-slate-100">
                    {inputText.split(/\s+/).filter(Boolean).length} Kata
                  </div>
                </div>
              </div>
            </div>

            {/* Saran AI - Perbaikan Icon Wand2 */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-10 bg-rose-50/60 border-2 border-rose-200 rounded-[3rem] shadow-2xl relative"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      {/* Icon Slot: Rose Gelap Solid dengan Icon Putih Bersih */}
                      <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl shadow-lg flex items-center justify-center">
                        <Wand2 size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-700 block">Saran Litera AI</span>
                        <p className="text-[10px] font-medium text-rose-400 uppercase">Optimasi Kalimat Selesai</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-rose-600 hover:text-white rounded-2xl shadow-md text-rose-600 transition-all border border-rose-100 text-[11px] font-black uppercase tracking-widest"
                    >
                      <Copy size={16} /> Salin Hasil
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-300 rounded-full opacity-50" />
                    <p className="text-slate-800 text-xl leading-relaxed italic pl-8 py-2 font-medium">
                      "{result}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Kolom Sidebar: Aksi */}
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4 ring-1 ring-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-6">Pilih Kekuatan AI</h3>
              
              <ActionButton 
                label="Cek Typo & Grammar"
                desc="Perbaiki PUEBI & Ejaan"
                icon={<CheckCircle2 size={22} />}
                active={activeAction === "check"}
                disabled={isProcessing || !inputText}
                onClick={() => processText("check")}
              />

              <ActionButton 
                label="Parafrase Teks"
                desc="Ganti diksi lebih kreatif"
                icon={<RefreshCcw size={22} />}
                active={activeAction === "paraphrase"}
                disabled={isProcessing || !inputText}
                onClick={() => processText("paraphrase")}
              />

              <ActionButton 
                label="Ubah Menjadi Formal"
                desc="Gaya bahasa baku & rapi"
                icon={<Type size={22} />}
                active={activeAction === "formal"}
                disabled={isProcessing || !inputText}
                onClick={() => processText("formal")}
              />
            </div>

            {/* Card Tips */}
            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Tips Menulis</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  "Menulis adalah proses menuangkan jiwa, namun penyuntingan adalah proses memoles permata." Gunakan AI untuk memastikan tulisan Anda tanpa cacat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

function ActionButton({ label, desc, icon, onClick, disabled, active }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-6 rounded-[2rem] text-left transition-all border-2 group flex items-start gap-4 relative overflow-hidden active:scale-[0.98] ${
        active 
        ? "bg-rose-600 border-transparent shadow-lg scale-[1.02] text-white" 
        : "border-slate-50 bg-slate-50 hover:bg-white hover:border-rose-200 shadow-sm text-slate-700"
      } ${disabled && !active ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <div className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
        active 
        ? 'bg-white text-rose-600 shadow-md' 
        : 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
      }`}>
        {active ? <Loader2 className="animate-spin" size={20} /> : icon}
      </div>

      <div className="flex flex-col">
        <h4 className={`text-sm font-black uppercase tracking-tighter leading-tight ${active ? 'text-white' : 'text-slate-800'}`}>
          {label}
        </h4>
        <p className={`text-[10px] mt-1 font-medium leading-tight ${active ? 'text-rose-100' : 'text-slate-500'}`}>
          {desc}
        </p>
      </div>
    </button>
  );
}