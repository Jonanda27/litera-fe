"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toPng } from "html-to-image";
// Import Recharts untuk grafik
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Path component
import StepPramenulis from "./component/StepPramenulis";
import StepPengembangan from "./component/StepPengembangan";
import StepPenulisan from "./component/StepPenulisan";
import StepRevisi from "./component/StepRevisi";
import StepFinalisasi from "./component/StepFinalisasi";

const STEPS = [
  { id: 1, title: "Pramenulis", desc: "Ide & Riset" },
  { id: 2, title: "Pengembangan", desc: "Karakter & Plot" },
  { id: 3, title: "Penulisan", desc: "Draf Inti" },
  { id: 4, title: "Revisi", desc: "Editing" },
  { id: 5, title: "Finalisasi", desc: "Persiapan Terbit" },
];

// --- COMPONENT: WeeklyWordCountChart ---
const WeeklyWordCountChart = ({ bookId }: { bookId: number }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!bookId) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:4000/api/books/stats/${bookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Respon server bukan JSON");
        }

        const result = await res.json();

        const daysOrder = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        const dayMap: Record<number, string> = {
          1: "Sen",
          2: "Sel",
          3: "Rab",
          4: "Kam",
          5: "Jum",
          6: "Sab",
          0: "Min",
        };
        const chartData = daysOrder.map((day) => ({ day, words: 0 }));

        if (res.ok && result.data) {
          result.data.forEach((item: any) => {
            const dayName = dayMap[new Date(item.date).getDay()];
            const foundIndex = chartData.findIndex((d) => d.day === dayName);
            if (foundIndex !== -1) {
              chartData[foundIndex].words = item.word_count;
            }
          });
        }
        setData(chartData);
      } catch (err) {
        console.error("Gagal mengambil statistik kata:", err);
        const daysOrder = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        setData(daysOrder.map((day) => ({ day, words: 0 })));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [bookId]);

  return (
    <div className="h-[120px] w-full py-2">
      {loading ? (
        <div className="h-full flex items-center justify-center text-[10px] text-blue-400 font-bold animate-pulse uppercase tracking-widest">
          Memproses Statistik...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#dbeafe"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: "900", fill: "#60a5fa" }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "#eff6ff" }}
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            />
            <Bar dataKey="words" fill="#1E4E8C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// --- COMPONENT: ExpProjectCard (With Enhanced Colorful Dropdown) ---
interface ExpProjectCardProps {
  id: number;
  title: string;
  lastUpdate: string;
  obstacle: string;
  onOpen: () => void;
}

function ExpProjectCard({
  id,
  title,
  lastUpdate,
  obstacle,
  onOpen,
}: ExpProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col mb-6">
      {" "}
      {/* Menambah margin bawah antar card */}
      {/* Bagian Utama Kartu */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-md z-10 ${isExpanded ? "border-blue-600 ring-4 ring-blue-50" : "border-slate-100"}`}
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <span className="text-5xl">📖</span>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-md shadow-sm p-0.5 border border-slate-100">
                <span className="text-xl">🧮</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-800 leading-tight">
                  Proyek: {title}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-all ${isExpanded ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  {isExpanded ? "Tutup Stats" : "Lihat Stats"}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-700">
                Update terakhir: {lastUpdate}
              </p>
              <p className="text-sm font-bold text-slate-700 italic">
                <span className="not-italic font-black text-slate-400">
                  Kendala:
                </span>{" "}
                {obstacle}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="bg-[#1E4E8C] text-white px-10 py-2 rounded-xl font-black text-sm shadow-lg hover:bg-blue-800 transition-colors active:scale-95"
          >
            Buka Editor
          </button>
        </div>
      </div>
      {/* Dropdown Grafik Aktivitas - Sekarang lebih berwarna */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: -20 }}
            animate={{ height: "auto", opacity: 1, marginTop: 0 }}
            exit={{ height: 0, opacity: 0, marginTop: -20 }}
            className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-b-[2rem] border-x-2 border-b-2 border-blue-200 px-8 pt-12 pb-6 -mt-8 shadow-inner"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em]">
                  Aktivitas Penulisan Mingguan
                </p>
              </div>
              <p className="text-[10px] font-bold text-blue-400 italic">
                Data Real-time
              </p>
            </div>
            <WeeklyWordCountChart bookId={id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENT: ModalInputTitle ---
const ModalInputTitle = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;
  const handleConfirm = async () => {
    if (!title.trim()) return alert("Judul buku tidak boleh kosong");
    setIsSubmitting(true);
    await onSubmit(title);
    setIsSubmitting(false);
    setTitle("");
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border-4 border-[#1E4E8C]"
      >
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
          Mulai Proyek Baru
        </h2>
        <p className="text-slate-500 font-bold text-sm mb-6 italic">
          Berikan judul awal untuk karya hebatmu hari ini.
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ketik judul buku di sini..."
          className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-[#1E4E8C] outline-none font-bold text-slate-700 mb-6 transition-all"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 font-black text-slate-400 uppercase text-xs"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-[#1E4E8C] text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-blue-900 disabled:opacity-50"
          >
            {isSubmitting ? "Menyiapkan..." : "Buat Buku →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- COMPONENT: AddProjectModal ---
const AddProjectModal = ({
  isOpen,
  onClose,
  onSave,
  selectedId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  selectedId: number | null;
}) => {
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isZenMode, setIsZenMode] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bookId: null as number | null,
    title: "",
    ideCepat: "",
    outline: "",
    karakter: [
      {
        nama: "",
        umur: "",
        fisik: "",
        kepribadian: "",
        latarBelakang: "",
        image: null,
      },
    ],
    worldBuilding: {
      lokasi: "",
      deskripsi: "",
      sejarah: "",
      karakterPenghuni: "",
    },
    timeline: [],
    plotColumns: [{ id: "babak-1", title: "Perkenalan" }],
    targetKata: "1000",
    currentChapterId: null,
    currentWordCount: 0,
  });
  const [plotItems, setPlotItems] = useState<any[]>([]);
  const [outlineItems, setOutlineItems] = useState<any[]>([]);
  const [previewConfig, setPreviewConfig] = useState({
    fontFamily: "font-serif",
    fontSize: "14px",
    pageSize: "A5",
    margin: "normal",
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleInputChange = (field: string, value: any) =>
    setFormData((p) => ({ ...p, [field]: value }));
  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    const activeContainer = plotItems.find((i) => i.id === activeId)?.babak;
    const overContainer = formData.plotColumns.find((c) => c.id === overId)
      ? overId
      : plotItems.find((i) => i.id === overId)?.babak;
    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;
    setPlotItems((prev) => {
      const activeIndex = prev.findIndex((i) => i.id === activeId);
      const updatedItems = [...prev];
      updatedItems[activeIndex] = {
        ...updatedItems[activeIndex],
        babak: overContainer,
      };
      return updatedItems;
    });
  };
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    const activeContainer = plotItems.find((i) => i.id === activeId)?.babak;
    const overContainer = formData.plotColumns.find((c) => c.id === overId)
      ? overId
      : plotItems.find((i) => i.id === overId)?.babak;
    if (activeContainer === overContainer) {
      setPlotItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const newIndex = items.findIndex((i) => i.id === overId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedId || !isOpen) return;
      setLoadingDetail(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:4000/api/books/${selectedId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await res.json();
        if (res.ok && result.data) {
          const d = result.data;
          setFormData({
            bookId: d.id,
            title: d.title,
            ideCepat: d.QuickIdea?.description || "",
            outline: "",
            karakter:
              d.Characters?.map((c: any) => ({
                nama: c.name,
                umur: c.age,
                fisik: c.physical_desc,
                kepribadian: c.personality_backstory?.split("\n")[0] || "",
                latarBelakang: c.personality_backstory?.split("\n")[1] || "",
                image: c.image_url,
              })) || [],
            worldBuilding: {
              lokasi: d.Setting?.location_name || "",
              deskripsi: d.Setting?.description_ambiance || "",
              sejarah: d.Setting?.history_relation || "",
              karakterPenghuni: d.Setting?.resident_characters || "",
            },
            timeline:
              d.Timelines?.map((t: any) => ({
                waktu: t.time_date,
                kejadian: t.event,
                karakter: t.involved_characters,
              })) || [],
            plotColumns: [{ id: "babak-1", title: "Perkenalan" }],
            targetKata: "1000",
            currentChapterId: null,
            currentWordCount: 0,
          });
          setPlotItems(
            d.Plots?.map((p: any) => ({
              id: p.id.toString(),
              babak: "babak-1",
              label: p.title,
              desc: p.description,
              type: p.tag,
            })) || [],
          );
          setOutlineItems(
            d.Outlines?.map((o: any) => ({
              id: o.id.toString(),
              title: o.title,
              sub1: o.summary?.split("\n")[0] || "",
              sub2: o.summary?.split("\n")[1] || "",
            })) || [],
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetail(false);
      }
    };
    if (isOpen && selectedId) fetchDetail();
  }, [selectedId, isOpen]);
  const handleNextStep = async () => {
    if (currentStep === 4) {
      const paper = document.getElementById("paper-revisi");
      if (paper) {
        const dataUrl = await toPng(paper, {
          pixelRatio: 3,
          quality: 1,
          backgroundColor: "#ffffff",
        });
        setPreviewImage(dataUrl);
      }
    }
    setCurrentStep((p) => p + 1);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
      >
        {loadingDetail ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1E4E8C] rounded-full animate-spin mb-4"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest">
              Memuat Data Proyek...
            </p>
          </div>
        ) : (
          <>
            <div className="p-8 border-b bg-slate-50">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                    {formData.title || "Perencanaan Buku"}
                  </h2>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                    Tahap {currentStep}: {STEPS[currentStep - 1].title}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-2">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`h-2 flex-1 rounded-full transition-all ${currentStep >= step.id ? "bg-[#1E4E8C]" : "bg-slate-200"}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {currentStep === 1 && (
                    <StepPramenulis
                      bookId={formData.bookId?.toString()}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      sensors={sensors}
                      outlineItems={outlineItems}
                      setOutlineItems={setOutlineItems}
                      handleOutlineDragEnd={(e) =>
                        setOutlineItems(
                          arrayMove(
                            outlineItems,
                            outlineItems.findIndex((i) => i.id === e.active.id),
                            outlineItems.findIndex((i) => i.id === e.over?.id),
                          ),
                        )
                      }
                    />
                  )}
                  {currentStep === 2 && (
                    <StepPengembangan
                      formData={formData}
                      setFormData={setFormData}
                      handleNestedChange={(p, f, v) =>
                        setFormData((prev) => ({
                          ...prev,
                          [p]: { ...(prev as any)[p], [f]: v },
                        }))
                      }
                      plotItems={plotItems}
                      setPlotItems={setPlotItems}
                      sensors={sensors}
                      handleDragOver={handleDragOver}
                      handleDragEnd={handleDragEnd}
                    />
                  )}
                  {currentStep === 3 && (
                    <StepPenulisan
                      isZenMode={isZenMode}
                      setIsZenMode={setIsZenMode}
                      formData={formData}
                      handleInputChange={handleInputChange}
                    />
                  )}
                  {currentStep === 4 && (
                    <StepRevisi
                      comments={[]}
                      versions={[]}
                      formData={formData}
                      handleInputChange={handleInputChange}
                    />
                  )}
                  {currentStep === 5 && (
                    <StepFinalisasi
                      previewImage={previewImage}
                      previewConfig={previewConfig}
                      setPreviewConfig={setPreviewConfig}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="p-8 border-t bg-slate-50 flex justify-between shrink-0">
              <button
                onClick={() => setCurrentStep((p) => p - 1)}
                disabled={currentStep === 1}
                className={`font-black text-sm uppercase ${currentStep === 1 ? "opacity-0" : "text-slate-400"}`}
              >
                ← Kembali
              </button>
              <button
                onClick={
                  currentStep === 5 ? () => onSave(formData) : handleNextStep
                }
                className="px-10 py-4 bg-[#1E4E8C] text-white font-black rounded-full hover:bg-blue-900 shadow-lg uppercase text-sm active:scale-95 transition-all"
              >
                {currentStep === 5 ? "Simpan Proyek" : "Selanjutnya →"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function ExperimentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/books/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        const mapped = result.data.map((b: any) => ({
          id: b.id,
          title: b.title,
          lastUpdate: new Date(b.updatedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          obstacle: b.QuickIdea?.title || "Belum ada kendala",
        }));
        setProjects(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenModal = (id: number | null) => {
    if (id === null) {
      setIsTitleModalOpen(true);
    } else {
      setSelectedId(id);
      setIsModalOpen(true);
    }
  };

  const handleCreateNewBook = async (title: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      const result = await res.json();
      if (res.ok) {
        setIsTitleModalOpen(false);
        setSelectedId(result.data.bookId);
        setIsModalOpen(true);
        fetchProjects();
      } else {
        alert(result.message || "Gagal membuat buku");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Sidebar>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto space-y-8"
      >
        <header className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            EXPERIMENT
          </h1>
          <p className="text-slate-800 font-bold text-lg italic">
            Klik kartu buku untuk melihat progres penulisan mingguan.
          </p>
        </header>

        <section className="space-y-4 pt-4 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1E4E8C] rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Menyiapkan Rak Buku...
              </p>
            </div>
          ) : projects.length > 0 ? (
            projects.map((proj) => (
              <ExpProjectCard
                key={proj.id}
                id={proj.id}
                title={proj.title}
                lastUpdate={proj.lastUpdate}
                obstacle={proj.obstacle}
                onOpen={() => handleOpenModal(proj.id)}
              />
            ))
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
              <p className="text-slate-400 font-bold italic">
                Belum ada proyek penulisan.
              </p>
            </div>
          )}
        </section>

        <div className="flex justify-end pr-4">
          <button
            onClick={() => handleOpenModal(null)}
            className="text-[#1E4E8C] font-black text-sm italic hover:underline uppercase"
          >
            + Tambah Proyek Baru
          </button>
        </div>

        <ModalInputTitle
          isOpen={isTitleModalOpen}
          onClose={() => setIsTitleModalOpen(false)}
          onSubmit={handleCreateNewBook}
        />
        <AddProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            fetchProjects();
          }}
          selectedId={selectedId}
        />
      </motion.div>
    </Sidebar>
  );
}
