"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Download, 
  BookOpen, 
  Search, 
  ArrowLeft, 
  Loader2, 
  FileText, 
  X, 
  Layers3, 
  Sparkles,
  ArrowRight,
  Bookmark
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/constans/constans";

interface Book {
  id: number;
  title: string;
  pdf_url: string;
  cover_url?: string;
  downloads: number;
  category: string;
}

export default function EbookPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingId, setIsDownloadingId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/books/all-published`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooks(response.data);
      } catch (error) {
        console.error("Gagal mengambil ebook:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const categories = ["Semua", "Fiksi", "Non-Fiksi"];

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || book.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePreview = (pdfUrl: string) => {
    if (!pdfUrl) return alert("File PDF tidak ditemukan");
    // Pastikan URL preview menggunakan alamat server statis (tanpa /api)
    const fullUrl = `${API_BASE_URL.replace('/api', '')}${pdfUrl}`;
    setSelectedPdf(fullUrl);
  };

  // --- FUNGSI DOWNLOAD PDF (DIPERBAIKI) ---
  const handleDownload = async (book: Book) => {
    if (!book.pdf_url) return alert("Link unduhan tidak tersedia.");
    
    setIsDownloadingId(book.id);
    try {
      const token = localStorage.getItem("token");
      
      // PERBAIKAN URL: Pastikan menunjuk ke folder statis backend, bukan route API
      // Contoh: http://localhost:4000/uploads/pdf/file.pdf
      const baseUrl = API_BASE_URL.replace('/api', '');
      const fullUrl = `${baseUrl}${book.pdf_url}`;

      const response = await axios.get(fullUrl, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/pdf'
        },
        responseType: 'blob',
        // Tambahkan timeout agar tidak menggantung jika server lambat
        timeout: 30000 
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${book.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Download Error:", error);
      // Jika Network Error terjadi, biasanya karena CORS di backend belum mengizinkan akses ke file statis
      alert("Gagal mengunduh. Pastikan koneksi stabil atau periksa konfigurasi CORS server.");
    } finally {
      setIsDownloadingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 100 
      } 
    }
  };

  return (
    <Sidebar>
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#F1F5F9]">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#c31a26]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1500px] mx-auto space-y-12 pb-20 px-4 md:px-8">
        
        <div className="flex flex-col gap-10 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: "#fff" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.back()}
                className="p-4 bg-white border-2 border-slate-200 rounded-3xl text-slate-800 shadow-md transition-all"
              >
                <ArrowLeft size={22} />
              </motion.button>
              <div>
                <div className="flex items-center gap-3 text-[#c31a26] font-black text-xs uppercase tracking-[0.4em]">
                  <Sparkles size={14} /> Digital Archive
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mt-1 drop-shadow-sm">
                  Koleksi <span className="text-[#c31a26] italic">E-Book</span>
                </h1>
              </div>
            </div>

            <div className="relative group w-full md:w-[450px]">
              <div className="absolute inset-0 bg-[#c31a26]/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c31a26] transition-colors z-10" size={20} />
              <input 
                type="text"
                placeholder="Cari referensi naskah..."
                className="relative w-full bg-white border-2 border-slate-200 rounded-full py-5 pl-16 pr-8 outline-none focus:border-[#c31a26] focus:ring-0 transition-all font-bold text-slate-700 shadow-lg z-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 bg-slate-200/50 backdrop-blur-md border-2 border-white w-fit rounded-3xl shadow-inner">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-10 py-3 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat ? "text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {activeCategory === cat && (
                  <motion.div 
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-slate-900 rounded-[1.2rem] shadow-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <Loader2 className="animate-spin text-[#c31a26]" size={60} />
            <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-xs">Accessing Database...</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12"
          >
            <AnimatePresence mode="popLayout">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -15 }}
                    className="group bg-white rounded-[3.5rem] p-6 border-2 border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col relative transition-all duration-500"
                  >
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-3xl -z-10" />

                    <div className={`absolute top-0 right-0 px-8 py-3 rounded-tr-[3.5rem] rounded-bl-[2rem] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl z-30 flex items-center gap-2 ${
                      book.category === 'Fiksi' 
                      ? "bg-gradient-to-br from-indigo-600 to-purple-700" 
                      : "bg-gradient-to-br from-emerald-600 to-teal-700"
                    }`}>
                      <Bookmark size={12} fill="white" />
                      {book.category}
                    </div>

                    <div className="w-full aspect-[3/4.2] rounded-[2.8rem] overflow-hidden bg-slate-200 relative mb-8 border-[6px] border-white shadow-xl group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] transition-all duration-500">
                      {book.pdf_url ? (
                        <div className="w-full h-full relative">
                          <object
                            data={`${API_BASE_URL.replace('/api', '')}${book.pdf_url}#page=1&view=FitH&toolbar=0&navpanes=0`}
                            type="application/pdf"
                            className="w-full h-full scale-[1.3] origin-top object-cover pointer-events-none transition-transform duration-1000 group-hover:scale-[1.5]"
                          >
                            <div className="flex flex-col items-center justify-center h-full bg-slate-100 text-slate-300">
                               <FileText size={60} strokeWidth={1} />
                            </div>
                          </object>
                          
                          <div 
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/0 group-hover:bg-slate-950/60 transition-all duration-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                            onClick={() => handlePreview(book.pdf_url)}
                          >
                             <motion.div 
                               initial={{ scale: 0.8, opacity: 0 }}
                               whileInView={{ scale: 1, opacity: 1 }}
                               className="bg-white p-5 rounded-full shadow-2xl mb-4"
                             >
                               <BookOpen size={30} className="text-slate-900" />
                             </motion.div>
                             <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Klik Untuk Membaca</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <img src="/placeholder-cover.png" className="w-full h-full object-cover opacity-20" alt="No Cover" />
                        </div>
                      )}
                      
                      <div className="absolute top-0 left-0 bottom-0 w-10 bg-gradient-to-r from-black/40 via-black/10 to-transparent z-10 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent z-10 pointer-events-none" />
                    </div>

                    <div className="px-2 space-y-5 flex-1 flex flex-col">
                      <h3 className="text-2xl font-black text-slate-900 leading-[1.1] tracking-tighter line-clamp-2 min-h-[4.4rem] uppercase">
                        {book.title}
                      </h3>
                      
                      <div className="flex items-center justify-between border-t-2 border-slate-100 pt-6 mt-auto">
                        <div className="flex items-center gap-2 text-slate-400">
                           <BookOpen size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">E-Book</span>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: "#000", color: "#fff" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDownload(book)}
                          disabled={isDownloadingId === book.id}
                          className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-slate-200 disabled:opacity-50"
                        >
                          {isDownloadingId === book.id ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Download size={20} />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-40 text-center bg-white/50 border-4 border-dashed border-slate-200 rounded-[4rem]"
                >
                  <Layers3 className="mx-auto text-slate-300 mb-6 animate-bounce" size={80} strokeWidth={1} />
                  <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-sm">No Documents Found</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* --- MODAL PREVIEW (REDUCED SIZE - CONSISTENT) --- */}
      <AnimatePresence>
        {selectedPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10 bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full h-full max-w-5xl rounded-[2rem] overflow-hidden relative flex flex-col shadow-2xl border-4 border-white"
            >
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-3 ml-4">
                  <div className="w-8 h-8 bg-[#c31a26] rounded-lg flex items-center justify-center">
                    <FileText size={18} className="text-white" />
                  </div>
                  <h2 className="font-black text-slate-800 uppercase tracking-wider">E-Book Reader</h2>
                </div>
                <button 
                  onClick={() => setSelectedPdf(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors mr-2"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="flex-1 bg-slate-200">
                <iframe 
                  src={`${selectedPdf}#toolbar=1&navpanes=0`}
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </Sidebar>
  );
}