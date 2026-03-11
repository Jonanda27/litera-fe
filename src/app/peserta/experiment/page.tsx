"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";

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
      // atau pastikan AddProjectModal tahu cara mengisi formData-nya sendiri
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
           projects.map((proj, index) => (
  <ExpProjectCard
    key={`${proj.id}-${index}`} // Menjamin key unik di mata React
    id={proj.id}
    title={proj.title}
    lastUpdate={proj.lastUpdate}
    obstacle={proj.obstacle}
    onOpen={(fullData) => handleOpenModal(fullData)}
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
          category={selectedCategory} // Prop baru dikirim ke sini
        />
      </motion.div>
    </Sidebar>
  );
}
