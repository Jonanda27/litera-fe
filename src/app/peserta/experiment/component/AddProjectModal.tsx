"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // Gunakan axios untuk mempermudah hit API
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toPng } from "html-to-image";

// Import Steps (Tetap sama)
//Fiksi
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

//Nonfiksi

import StepRisetNonFiksi from "./nonfiksi/StepRisetNonFiksi";
import StepDaftarIstilah from "./nonfiksi/StepDaftarIstilah";
import StepDaftarPustaka from "./nonfiksi/StepDaftarPustaka";
import StepStudiKasus from "./nonfiksi/StepStudiKasus";
import StepWorksheet from "./nonfiksi/StepWorksheet";
import StepKoleksi from "./nonfiksi/StepKoleksi";
import StepChapterStructure from "./nonfiksi/StepChapterStructure";
import StepPenulisanNonFiction from "./nonfiksi/StepPenulisanNon";
import { API_BASE_URL } from "@/lib/constans/constans";

// KONFIGURASI LANGKAH (Tetap sama)
const FICTION_STEPS = [
  { id: 1, title: "Ide Cepat" },
  { id: 2, title: "Papan Visi" },
  { id: 3, title: "Riset" },
  { id: 4, title: "Outline" },
  { id: 5, title: "Karakter" },
  { id: 6, title: "Peta Dunia" },
  { id: 7, title: "Kronologi Cerita" },
  { id: 8, title: "Papan PLot" },
  { id: 9, title: "Editor Naskah" },
  { id: 10, title: "Babak 2" },
  { id: 11, title: "Babak 3" },
  { id: 12, title: "Draf Penulisan" },
  { id: 13, title: "Self Editing" },
  { id: 14, title: "Revisi Total" },
  { id: 15, title: "Finalisasi" },
  { id: 16, title: "Persiapan Terbit" },
];

const NON_FICTION_STEPS = [
  { id: 1, title: "Problem & Riset" },
  { id: 2, title: "Big Idea" },
  { id: 3, title: "Target Pembaca" },
  { id: 4, title: "Koleksi Data" },
  { id: 5, title: "Struktur Bab" },
  { id: 6, title: "Penulisan Inti" },
  { id: 7, title: "Validasi Data" },
  { id: 8, title: "Editing" },
  { id: 9, title: "Finalisasi" },
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

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isZenMode, setIsZenMode] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    id: selectedId,
    bookId: selectedId,
    title: "",
  });

  useEffect(() => {
    const fetchBookDetail = async () => {
      // 1. TAMBAHKAN INI: Selalu reset ke step 1 setiap kali modal dibuka
      if (isOpen) {
        setCurrentStep(1);
      }

      // Hanya fetch jika modal terbuka dan ada ID (Membuka Editor/Proyek Lama)
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

          // Gunakan spread operator yang aman
          setFormData({
            ...bookData, // Masukkan semua data dari API
            id: selectedId,
            bookId: selectedId,
            title: bookData?.title || "Tanpa Judul",
          });
        } catch (error) {
          console.error("Gagal mengambil detail buku:", error);
        } finally {
          setLoadingDetail(false);
        }
      }
      // Jika buka proyek baru (tanpa ID)
      else if (isOpen && !selectedId) {
        setFormData({ title: "", id: null, bookId: null });
        // setCurrentStep(1); -> (Bagian ini bisa dihapus karena sudah di-handle di paling atas)
      }
    };

    fetchBookDetail();
  }, [isOpen, selectedId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleInputChange = (field: string, value: any) =>
    setFormData((p: any) => ({ ...p, [field]: value }));

  const handleNextStep = async () => {
    const paper = document.getElementById("paper-revisi");
    if (paper && currentStep === totalSteps - 2) {
      try {
        const dataUrl = await toPng(paper, {
          pixelRatio: 4,
          backgroundColor: "#94a3b8",
        });
        setPreviewImage(dataUrl);
      } catch (err) {
        console.error(err);
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep((p) => p + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((p) => p - 1);
  };

  const renderStepContent = () => {
    if (loadingDetail) {
      return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Memuat Detail Proyek...
          </p>
        </div>
      );
    }

    if (category === "Non-Fiksi") {
      switch (currentStep) {
        case 1:
          return (
           <StepRisetNonFiksi 
          formData={formData} 
          // GUNAKAN FUNGSI UPDATER UNTUK MERGE DATA, AGAR ID TIDAK TERHAPUS
          onDataChange={(newData) => setFormData((prev: any) => ({ ...prev, ...newData }))} 
        />
          );
        case 2:
          return (
            <StepDaftarIstilah formData={formData} onDataChange={setFormData} />
          );
        case 3:
          return (
            <StepDaftarPustaka formData={formData} onDataChange={setFormData} />
          );
          case 4:
          return (
            <StepStudiKasus formData={formData} onDataChange={setFormData} />
          );
          case 5:
          return (
            <StepWorksheet formData={formData} onDataChange={setFormData} />
          );
           case 6:
          return (
            <StepKoleksi formData={formData} onDataChange={setFormData} />
          );
          case 7:
          return (
            <StepChapterStructure formData={formData} onDataChange={setFormData} />
          );
          case 8:
          return (
            <StepPenulisanNonFiction
              isZenMode={isZenMode}
              setIsZenMode={setIsZenMode}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          );
        default:
          return (
            <StepIdeCepat formData={formData} onDataChange={setFormData} />
          );
      }
    } else {
      switch (currentStep) {
        case 1:
          return (
            <StepIdeCepat
              formData={formData}
              onDataChange={setFormData}
              key={formData.id} // Tambahkan key ini agar komponen refresh saat ID masuk
            />
          );
        case 2:
          return (
            <StepPapanVisi formData={formData} onDataChange={setFormData} />
          );
        case 3:
          return <StepRiset formData={formData} onDataChange={setFormData} />;
        case 4:
          return <StepOutline formData={formData} onDataChange={setFormData} />;
        case 5:
          return (
            <StepCharacter formData={formData} onDataChange={setFormData} />
          );
        case 6:
          return (
            <StepWorldBuilding formData={formData} onDataChange={setFormData} />
          );
        case 7:
          return (
            <StepTimeline formData={formData} onDataChange={setFormData} />
          );
        case 8:
          return (
            <StepPlotBoard formData={formData} onDataChange={setFormData} />
          );
        case 9:
          return (
            <StepPenulisan
              isZenMode={isZenMode}
              setIsZenMode={setIsZenMode}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          );
        case 10:
          return (
            <StepRevisi
              comments={[]}
              versions={[]}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          );
        default:
          return (
            <div className="p-10 text-center font-bold text-slate-400">
              Tahap Pengembangan {currentStep}
            </div>
          );
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
      >
        {/* HEADER */}
        <div className="p-6 border-b bg-slate-50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${category === "Non-Fiksi" ? "bg-amber-100 text-amber-600" : "bg-violet-100 text-violet-600"}`}
                >
                  {category}
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {loadingDetail ? "..." : formData.title || "Proyek Baru"}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Tahap {currentStep} dari {totalSteps}:{" "}
                {activeSteps[currentStep - 1]?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-200 rounded-full text-slate-600 hover:bg-rose-500 hover:text-white transition-all"
            >
              ✕
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="flex gap-1.5">
            {activeSteps.map((step) => (
              <div
                key={step.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  currentStep >= step.id
                    ? category === "Non-Fiksi"
                      ? "bg-amber-500"
                      : "bg-violet-600"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep + category + loadingDetail}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FOOTER NAVIGATION */}
        <div className="p-6 border-t bg-slate-50 flex justify-between items-center shrink-0">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1 || loadingDetail}
            className={`font-black text-xs uppercase flex items-center gap-2 transition-all ${
              currentStep === 1 || loadingDetail
                ? "opacity-0 pointer-events-none"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            ← Kembali
          </button>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Langkah {currentStep} / {totalSteps}
            </span>
            <button
              onClick={
                currentStep === totalSteps
                  ? () => onSave(formData)
                  : handleNextStep
              }
              disabled={loadingDetail}
              className={`px-10 py-4 text-white font-black rounded-full shadow-lg uppercase text-xs active:scale-95 transition-all ${
                loadingDetail
                  ? "bg-slate-300 cursor-not-allowed"
                  : category === "Non-Fiksi"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              {currentStep === totalSteps
                ? "Selesaikan Proyek"
                : "Selanjutnya →"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddProjectModal;
