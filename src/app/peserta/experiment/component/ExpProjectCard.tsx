"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// --- SUB-COMPONENT: WeeklyWordCountChart ---
const WeeklyWordCountChart = ({ bookId }: { bookId: number }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<"words" | "pages">("words");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalWords, setTotalWords] = useState<number>(0);

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
          }
        );
        
        const result = await res.json();
        
        if (res.ok) {
          if (result.totalPages !== undefined) setTotalPages(result.totalPages);
          
          const daysOrder = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
          const dayMap: Record<number, string> = {
            1: "Sen", 2: "Sel", 3: "Rab", 4: "Kam", 5: "Jum", 6: "Sab", 0: "Min",
          };

          // Inisialisasi data kosong untuk 7 hari
          const chartData = daysOrder.map((day) => ({ day, words: 0, pages: 0 }));

          // Isi data Kata (Word Count)
          if (result.data && Array.isArray(result.data)) {
            const latestEntry = result.data[result.data.length - 1];
            setTotalWords(latestEntry?.word_count || 0);

            result.data.forEach((item: any) => {
              // Gunakan Date object yang aman untuk parsing YYYY-MM-DD
              const dateObj = new Date(item.date + "T00:00:00");
              const dayName = dayMap[dateObj.getDay()];
              const foundIndex = chartData.findIndex((d) => d.day === dayName);
              if (foundIndex !== -1) chartData[foundIndex].words = item.word_count;
            });
          }

          // Isi data Halaman (Cumulative Pages)
          let runningTotalPages = result.basePageCount || 0;
          const todayNum = new Date().getDay();
          const todayName = dayMap[todayNum];
          const todayIndexInOrder = daysOrder.indexOf(todayName);

          chartData.forEach((dayObj, index) => {
            const dailyAdded = result.pageData?.find((p: any) => {
                const pDate = new Date(p.date + "T00:00:00");
                return dayMap[pDate.getDay()] === dayObj.day;
            });
            
            if (dailyAdded) runningTotalPages += parseInt(dailyAdded.new_pages);
            
            // Hanya tampilkan akumulasi sampai hari ini
            if (index <= todayIndexInOrder) {
                dayObj.pages = runningTotalPages;
            }
          });

          setData(chartData);
        }
      } catch (err) {
        console.error("Gagal mengambil statistik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [bookId]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em]">
              Aktivitas Mingguan
            </p>
          </div>
          <div className="flex bg-blue-100/50 p-1 rounded-lg border border-blue-100">
            <button
              onClick={() => setViewType("words")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewType === "words" ? "bg-white text-blue-700 shadow-sm" : "text-blue-400"}`}
            >
              Kata
            </button>
            <button
              onClick={() => setViewType("pages")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewType === "pages" ? "bg-white text-blue-700 shadow-sm" : "text-blue-400"}`}
            >
              Halaman
            </button>
          </div>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-50 flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase">
            {viewType === "words" ? "Total Kata:" : "Total Draf:"}
          </span>
          <span className="text-xs font-black text-[#1E4E8C]">
            {viewType === "words"
              ? `${totalWords.toLocaleString()} Kata`
              : `${totalPages} Halaman`}
          </span>
        </div>
      </div>
      <div className="h-[120px] w-full py-2">
        {loading ? (
          <div className="h-full flex items-center justify-center text-[10px] text-blue-400 font-bold animate-pulse uppercase tracking-widest">
            Memproses Statistik...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbeafe" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: "900", fill: "#60a5fa" }}
              />
              <YAxis hide />
              <Tooltip cursor={{ fill: "#eff6ff" }} />
              <Bar
                dataKey={viewType}
                fill={viewType === "words" ? "#1E4E8C" : "#3b82f6"}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

interface ExpProjectCardProps {
  id: number;
  title: string;
  lastUpdate: string;
  obstacle: string;
  onOpen: (data?: any) => void;
}

export default function ExpProjectCard({
  id,
  title,
  lastUpdate,
  obstacle,
  onOpen,
}: ExpProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessBook = async (e: React.MouseEvent) => {
  e.stopPropagation();
  setIsProcessing(true);
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`http://localhost:4000/api/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // DEBUG: Intip isi response yang sebenarnya di console
    console.log("Raw Response Axios:", response);

    // Pastikan pengecekan sesuai dengan struktur JSON backend
    const bookData = response.data.data || response.data; // Cek kedua kemungkinan

    if (bookData) {
      onOpen(bookData); 
    } else {
      throw new Error("Struktur response tidak dikenal");
    }
  } catch (error: any) {
    console.error("Error Detail:", error);
    // Jika response kosong/error, tampilkan pesan spesifik
    const message = error.response?.data?.message || error.message || "Gagal memuat data";
    alert(message);
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="flex flex-col mb-6">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-md z-10 ${isExpanded ? "border-blue-600 ring-4 ring-blue-50" : "border-slate-100"}`}
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <span className="text-5xl">📖</span>
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
              <p className="text-sm font-bold text-slate-700">
                <span className="not-italic font-black text-slate-400">
                  Kendala:
                </span>{" "}
                {obstacle}
              </p>
            </div>
          </div>
          <button
            onClick={handleProcessBook}
            disabled={isProcessing}
            className={`bg-[#1E4E8C] text-white px-10 py-2 rounded-xl font-black text-sm shadow-lg hover:bg-blue-800 transition-all active:scale-95 ${isProcessing ? "opacity-50 cursor-wait" : ""}`}
          >
            {isProcessing ? "Memuat..." : "Buka Editor"}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: -20 }}
            animate={{ height: "auto", opacity: 1, marginTop: 0 }}
            exit={{ height: 0, opacity: 0, marginTop: -20 }}
            className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-b-[2rem] border-x-2 border-b-2 border-blue-200 px-8 pt-12 pb-6 -mt-8 shadow-inner"
          >
            <WeeklyWordCountChart bookId={id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}