"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
// Lucide tetap diimport untuk fallback jika diperlukan, tapi kita gunakan Flaticon di UI
import { Plus } from "lucide-react"; 

import AddProjectModal from "./component/AddProjectModal";
import ExpProjectCard from "./component/ExpProjectCard";
import ModalInputTitle from "./component/ModalInputTitle";
import { API_BASE_URL } from "@/lib/constans/constans";

export default function ExperimentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // State baru untuk melacak kategori aktif
  const [selectedCategory, setSelectedCategory] = useState<string>("Fiksi");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Gunakan endpoint list buku milik user, bukan 'all'
      const res = await fetch(`${API_BASE_URL}/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result = await res.json();
      if (res.ok && result.data) {
        // Mapping data langsung dari hasil database
        setProjects(
          result.data.map((b: any) => ({
            id: b.id,
            title: b.title,
            category: b.category || "Fiksi",
            lastUpdate: new Date(b.updatedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            obstacle: b.obstacle || "Belum ada kendala",
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenModal = (bookData: any | null) => {
    if (bookData === null) {
      setIsTitleModalOpen(true);
    } else {
      // bookData adalah objek { id: 1, title: "aaa", ... } dari ExpProjectCard
      setSelectedId(bookData.id);
      setSelectedCategory(bookData.category || "Fiksi");

      // PENTING: Kita perlu mengirimkan data ini ke state modal nantinya
      setIsModalOpen(true);
    }
  };

  const handleCreateNewBook = async (title: string, category: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, category }),
      });
      const result = await res.json();
      if (res.ok) {
        setSelectedCategory(category); // Simpan kategori untuk modal selanjutnya
        setIsTitleModalOpen(false);
        setSelectedId(result.data.bookId);
        setIsModalOpen(true);
        fetchProjects();
      } else {
        alert(result.message || "Gagal membuat proyek");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi");
    }
  };

  return (
    <Sidebar>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto h-[calc(100dvh-80px)] md:h-[calc(100vh-120px)] flex flex-col px-2 md:px-4 lg:px-0"
      >
        <header className="space-y-2 pt-4 md:pt-0">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">
            EXPERIMENT
          </h1>
          <p className="text-slate-700 md:text-slate-800 font-bold text-base md:text-lg  leading-tight">
            Klik kartu buku untuk melihat progres penulisan mingguan.
          </p>
        </header>

        {/* Grid Section Responsif */}
        <section className="space-y-4 pt-2 md:pt-4 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              {/* Flaticon: Animated Loading / Bookshelf */}
              <img 
                src="https://cdn-icons-png.flaticon.com/512/5903/5903572.png" 
                alt="Loading Projects" 
                className="w-16 h-16 animate-bounce mb-4"
              />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Menyiapkan Rak Buku...
              </p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
               {projects.map((proj, index) => (
                <ExpProjectCard
                  key={`${proj.id}-${index}`}
                  id={proj.id}
                  title={proj.title}
                  lastUpdate={proj.lastUpdate}
                  obstacle={proj.obstacle}
                  onOpen={(fullData) => handleOpenModal(fullData)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-[3rem] p-10 md:p-20 text-center flex flex-col items-center">
              {/* Flaticon: Empty Box / Open Book */}
              <img 
                src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" 
                alt="No Projects" 
                className="w-20 h-20 opacity-20 mb-4 grayscale"
              />
              <p className="text-slate-400 font-bold italic">
                Belum ada proyek penulisan.
              </p>
            </div>
          )}
        </section>

        {/* Tombol Desktop (Laptop/iPad) */}
        <div className="hidden md:flex justify-end pr-4">
          <button
            onClick={() => handleOpenModal(null)}
            className="flex items-center gap-2 text-[#1E4E8C] font-black text-sm italic hover:underline uppercase transition-all"
          >
            {/* Flaticon: Plus Icon Blue */}
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1004/1004733.png" 
              alt="Add" 
              className="w-4 h-4"
              style={{ filter: "invert(21%) sepia(82%) saturate(1370%) hue-rotate(195deg) brightness(91%) contrast(92%)" }}
            />
            Tambah Proyek Baru
          </button>
        </div>

        {/* Floating Action Button (FAB) khusus Mobile */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleOpenModal(null)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#1E4E8C] text-white rounded-full flex items-center justify-center shadow-2xl z-50 border-2 border-white"
        >
          {/* Flaticon: Plus Icon White */}
          <img 
            src="https://cdn-icons-png.flaticon.com/512/1004/1004733.png" 
            alt="Plus" 
            className="w-7 h-7 invert"
          />
        </motion.button>

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
          category={selectedCategory} 
        />
      </motion.div>
    </Sidebar>
  );
}