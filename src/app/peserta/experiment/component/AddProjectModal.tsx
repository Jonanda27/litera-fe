"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Loader2, CheckCircle2, Rocket } from "lucide-react"; 
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toPng } from "html-to-image";

// Import Steps Fiksi
import StepIdeCepat from "./fiksi/StepIdeCepat";
import StepPapanVisi from "./fiksi/StepPapanVisi";
import StepRiset from "./fiksi/StepRiset";
import StepCharacter from "./fiksi/StepCharacter";
import StepOutline from "./fiksi/StepOutline";
import StepWorldBuilding from "./fiksi/StepWorldBuilding";
import StepTimeline from "./fiksi/StepTimeline";
import StepPlotBoard from "./fiksi/StepPlotBoard";
import StepPenulisan from "./fiksi/StepPenulisan";
import StepRevisi from "./fiksi/StepRevisi";
import StepFinalisasi from "./fiksi/StepFinalisasi";
import StepCover from "./fiksi/StepCover";

// Import Steps Non-Fiksi
import StepRisetNonFiksi from "./nonfiksi/StepRisetNonFiksi";
import StepDaftarIstilah from "./nonfiksi/StepDaftarIstilah";
import StepDaftarPustaka from "./nonfiksi/StepDaftarPustaka";
import StepStudiKasus from "./nonfiksi/StepStudiKasus";
import StepWorksheet from "./nonfiksi/StepWorksheet";
import StepKoleksi from "./nonfiksi/StepKoleksi";
import StepChapterStructure from "./nonfiksi/StepChapterStructure";
import StepPenulisanNonFiction from "./nonfiksi/StepPenulisanNon";

import { API_BASE_URL } from "@/lib/constans/constans";
import StepCoverNon from "./nonfiksi/StepCoverNon";
import StepFinalisasiNon from "./nonfiksi/StepFinalisasiNon";
import StepRevisiNon from "./nonfiksi/StepRevisiNon";

// KONFIGURASI LANGKAH...
const FICTION_STEPS = [
  { id: 1, title: "Ide Cepat" },
  { id: 2, title: "Papan Visi" },
  { id: 3, title: "Cover Buku" },
  { id: 4, title: "Riset" },
  { id: 5, title: "Outline" },
  { id: 6, title: "Karakter" },
  { id: 7, title: "Peta Dunia" },
  { id: 8, title: "Kronologi Cerita" },
  { id: 9, title: "Papan PLot" },
  { id: 10, title: "Draf Penulisan" },
  { id: 11, title: "Revisi Total" },
  { id: 12, title: "Finalisasi" },
];

const NON_FICTION_STEPS = [
  { id: 1, title: "Problem & Riset" },
  { id: 2, title: "Cover Buku" },
  { id: 3, title: "Daftar Istilah" },
  { id: 4, title: "Daftar Pustaka" },
  { id: 5, title: "Studi Kasus" },
  { id: 6, title: "Worksheet" },
  { id: 7, title: "Koleksi Data" },
  { id: 8, title: "Struktur Bab" },
  { id: 9, title: "Penulisan Inti" },
  { id: 10, title: "Revisi Total" }, // Tahap Revisi ditambahkan
  { id: 11, title: "Finalisasi" },   // Digeser menjadi 11
];

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  selectedId: number | null;
  category: string;
}

const AddProjectModal = ({
  isOpen,
  onClose,
  onSave,
  selectedId,
  category,
}: AddProjectModalProps) => {
  const activeSteps =
    category === "Non-Fiksi" ? NON_FICTION_STEPS : FICTION_STEPS;
  const totalSteps = activeSteps.length;

  const finalisasiRef = useRef<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // STATE BARU: Untuk Overlay Proses
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState("Menyiapkan dokumen...");

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewConfig, setPreviewConfig] = useState({
    fontFamily: "'Times New Roman', serif",
    fontSize: "12pt",
    pageSize: "A4",
    margin: "2.54cm",
  });

  const [formData, setFormData] = useState<any>({
    id: selectedId,
    bookId: selectedId,
    title: "",
  });

  useEffect(() => {
    const fetchBookDetail = async () => {
      if (isOpen) setCurrentStep(1);
      if (isOpen && selectedId) {
        setLoadingDetail(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${API_BASE_URL}/books/${selectedId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const bookData = response.data.data;
          setFormData({
            ...bookData,
            id: selectedId,
            bookId: selectedId,
            title: bookData?.title || "Tanpa Judul",
          });
        } catch (error) {
          console.error("Gagal mengambil detail buku:", error);
        } finally {
          setLoadingDetail(false);
        }
      } else if (isOpen && !selectedId) {
        setFormData({ title: "", id: null, bookId: null });
      }
    };
    fetchBookDetail();
  }, [isOpen, selectedId]);

  // Fungsi Helper untuk Capture Image sebelum pindah step (jika diperlukan)
  const captureRevisiImage = async () => {
    const paper = document.getElementById("paper-revisi");
    if (paper) {
      try {
        const dataUrl = await toPng(paper, {
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });
        setPreviewImage(dataUrl);
      } catch (err) {
        console.error("Gagal mengambil preview:", err);
      }
    }
  };

  const handleNextStep = async () => {
    const isTimetoCapture =
      (category === "Fiksi" && currentStep === 11) ||
      (category === "Non-Fiksi" && currentStep === 10); // Menyesuaikan ID step Revisi Non-Fiksi
    
    if (isTimetoCapture) {
      await captureRevisiImage();
    }
    
    if (currentStep < totalSteps) setCurrentStep((p) => p + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((p) => p - 1);
  };

  // Fungsi baru untuk navigasi langsung
  const goToStep = async (stepId: number) => {
    // Jika kita meninggalkan step revisi, coba capture dulu
    const isTimetoCapture =
      (category === "Fiksi" && currentStep === 11) ||
      (category === "Non-Fiksi" && currentStep === 10); // Menyesuaikan ID step Revisi Non-Fiksi
    
    if (isTimetoCapture) {
      await captureRevisiImage();
    }
    setCurrentStep(stepId);
  };

  const handleConfirmFinish = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true); // Mulai loading overlay
    setProcessStatus("Sedang men-generate PDF...");
    
    if (finalisasiRef.current) {
      try {
        setProcessStatus("Menyimpan ke server database...");
        const isSaved = await finalisasiRef.current.saveToDB();
        
        if (isSaved) {
          setProcessStatus("Berhasil! Mengalihkan halaman...");
          // Berikan delay sedikit agar user bisa melihat status sukses
          setTimeout(() => {
            setIsProcessing(false);
            onSave(formData);
          }, 1500);
        } else {
            throw new Error("Save failed");
        }
      } catch (e) {
        console.error("Gagal menyimpan PDF otomatis ke DB");
        setIsProcessing(false);
        alert("Terjadi kesalahan saat menyimpan PDF.");
      }
    } else {
      setIsProcessing(false);
      onSave(formData);
    }
  };

  const renderStepContent = () => {
    if (loadingDetail)
      return (
        <div className="p-20 text-center font-black text-slate-400 uppercase text-xs">
          Memuat Detail...
        </div>
      );

    if (category === "Non-Fiksi") {
      switch (currentStep) {
        case 1:
          return (
            <StepRisetNonFiksi
              formData={formData}
              onDataChange={(newData) =>
                setFormData((prev: any) => ({ ...prev, ...newData }))
              }
            />
          );
        case 2:
          return (
            <StepCoverNon formData={formData} onDataChange={setFormData} />
          );
        case 3:
          return (
            <StepDaftarIstilah formData={formData} onDataChange={setFormData} />
          );
        case 4:
          return (
            <StepDaftarPustaka formData={formData} onDataChange={setFormData} />
          );
        case 5:
          return (
            <StepStudiKasus formData={formData} onDataChange={setFormData} />
          );
        case 6:
          return (
            <StepWorksheet formData={formData} onDataChange={setFormData} />
          );
        case 7:
          return <StepKoleksi formData={formData} onDataChange={setFormData} />;
        case 8:
          return (
            <StepChapterStructure
              formData={formData}
              onDataChange={setFormData}
            />
          );
        case 9:
          return (
            <StepPenulisanNonFiction
              isZenMode={isZenMode}
              setIsZenMode={setIsZenMode}
              formData={formData}
              handleInputChange={(f: string, v: any) =>
                setFormData((p: any) => ({ ...p, [f]: v }))
              }
            />
          );
        case 10:
          return (
            <StepRevisiNon
              comments={[]}
              versions={[]}
              formData={formData}
              handleInputChange={(f: string, v: any) =>
                setFormData((p: any) => ({ ...p, [f]: v }))
              }
            />
          );
        case 11:
          return (
            <StepFinalisasiNon
              ref={finalisasiRef}
              previewImage={previewImage}
              previewConfig={previewConfig}
              setPreviewConfig={setPreviewConfig}
              formData={formData}
            />
          );
        default:
          return (
            <StepRisetNonFiksi formData={formData} onDataChange={setFormData} />
          );
      }
    } else {
      switch (currentStep) {
        case 1:
          return (
            <StepIdeCepat
              formData={formData}
              onDataChange={setFormData}
              key={formData.id}
            />
          );
        case 2:
          return (
            <StepPapanVisi formData={formData} onDataChange={setFormData} />
          );
        case 3:
          return <StepCover formData={formData} onDataChange={setFormData} />;
        case 4:
          return <StepRiset formData={formData} onDataChange={setFormData} />;
        case 5:
          return <StepOutline formData={formData} onDataChange={setFormData} />;
        case 6:
          return (
            <StepCharacter formData={formData} onDataChange={setFormData} />
          );
        case 7:
          return (
            <StepWorldBuilding formData={formData} onDataChange={setFormData} />
          );
        case 8:
          return (
            <StepTimeline formData={formData} onDataChange={setFormData} />
          );
        case 9:
          return (
            <StepPlotBoard formData={formData} onDataChange={setFormData} />
          );
        case 10:
          return (
            <StepPenulisan
              isZenMode={isZenMode}
              setIsZenMode={setIsZenMode}
              formData={formData}
              handleInputChange={(f: string, v: any) =>
                setFormData((p: any) => ({ ...p, [f]: v }))
              }
            />
          );
        case 11:
          return (
            <StepRevisi
              comments={[]}
              versions={[]}
              formData={formData}
              handleInputChange={(f: string, v: any) =>
                setFormData((p: any) => ({ ...p, [f]: v }))
              }
            />
          );
        case 12:
          return (
            <StepFinalisasi
              ref={finalisasiRef}
              previewImage={previewImage}
              previewConfig={previewConfig}
              setPreviewConfig={setPreviewConfig}
              formData={formData}
            />
          );
        default:
          return (
            <div className="p-10 text-center font-bold text-slate-400 uppercase text-xs">
              Under Development
            </div>
          );
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-2 md:p-4 backdrop-blur-sm text-black">
      
      {/* OVERLAY PROSES (Muncul saat generate PDF) */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <div className="relative">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className={`w-24 h-24 border-t-4 border-b-4 rounded-full ${category === "Non-Fiksi" ? "border-amber-600" : "border-violet-600"}`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    {processStatus.includes("Berhasil") ? (
                        <CheckCircle2 size={40} className="text-green-500" />
                    ) : (
                        <Rocket size={40} className={category === "Non-Fiksi" ? "text-amber-600" : "text-violet-600"} />
                    )}
                </div>
            </div>
            
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
            >
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                    {processStatus.includes("Berhasil") ? "Hampir Selesai!" : "Memproses Karya Anda"}
                </h2>
                <div className="flex items-center gap-2 justify-center text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                    {!processStatus.includes("Berhasil") && <Loader2 size={12} className="animate-spin" />}
                    {processStatus}
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`bg-white w-full max-w-5xl ${isZenMode ? "h-screen rounded-none" : "max-h-[95vh] rounded-[2.5rem]"} overflow-hidden shadow-2xl flex flex-col`}
      >
        {!isZenMode && (
          <div className="p-6 border-b bg-slate-50 shrink-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${category === "Non-Fiksi" ? "bg-amber-100 text-amber-600" : "bg-violet-100 text-violet-600"}`}
                >
                  {category}
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {loadingDetail ? "..." : formData.title || "Proyek Baru"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-slate-200 rounded-full hover:bg-rose-500 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* PROGRESS BAR YANG BISA DIKLIK */}
            <div className="flex gap-1.5">
              {activeSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  title={step.title} // Menunjukkan nama langkah saat mouse di-hover
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 hover:opacity-70 ${
                    currentStep === step.id 
                      ? (category === "Non-Fiksi" ? "bg-amber-500 ring-2 ring-amber-200 ring-offset-1" : "bg-violet-600 ring-2 ring-violet-200 ring-offset-1") 
                      : currentStep > step.id 
                        ? (category === "Non-Fiksi" ? "bg-amber-400" : "bg-violet-400")
                        : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            
            {/* LABEL LANGKAH AKTIF (Opsional: Agar user tahu posisi saat ini) */}
            <div className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex justify-between px-1">
              <span>Langkah {currentStep} dari {totalSteps}</span>
              <span className={category === "Non-Fiksi" ? "text-amber-600" : "text-violet-600"}>
                {activeSteps.find(s => s.id === currentStep)?.title}
              </span>
            </div>
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto ${isZenMode ? "p-0" : "p-8"} bg-white custom-scrollbar`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep + category}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {!isZenMode && (
          <div className="p-6 border-t bg-slate-50 flex justify-between items-center shrink-0">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1 || loadingDetail}
              className={`font-black uppercase flex items-center gap-2 ${currentStep === 1 ? "opacity-0" : "text-slate-400 hover:text-slate-600"}`}
            >
              ← Kembali
            </button>
            <button
              onClick={
                currentStep === totalSteps
                  ? () => setShowConfirmModal(true)
                  : handleNextStep
              }
              className={`px-10 py-4 text-white font-black rounded-full uppercase text-xs ${category === "Non-Fiksi" ? "bg-amber-600" : "bg-violet-600"}`}
            >
              {currentStep === totalSteps
                ? "Selesaikan Proyek"
                : "Selanjutnya →"}
            </button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                🚀
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase mb-2">
                Publikasikan Proyek?
              </h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Menyelesaikan proyek akan menyimpan draf PDF secara otomatis dan
                mempublikasikannya ke profil Anda.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmFinish}
                  className={`w-full py-4 text-white font-black rounded-2xl uppercase text-xs ${category === "Non-Fiksi" ? "bg-amber-600" : "bg-violet-600"}`}
                >
                  Ya, Publish & Simpan PDF
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-4 text-slate-400 font-black rounded-2xl uppercase text-xs"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddProjectModal;