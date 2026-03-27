"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Download, BookOpen, Search, ArrowLeft, Loader2, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/constans/constans";

interface Book {
  id: number;
  title: string;
  pdf_url: string;
  cover_url?: string;
  downloads: number;
}

export default function EbookPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Modal Preview
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

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePreview = (pdfUrl: string) => {
    if (!pdfUrl) return alert("File PDF tidak ditemukan");
    const fullUrl = `${API_BASE_URL.replace('/api', '')}${pdfUrl}`;
    setSelectedPdf(fullUrl);
  };

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-3 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all border border-transparent hover:border-slate-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                Koleksi E-Book <BookOpen className="text-[#c31a26]" size={28} />
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                Perpustakaan Digital Litera
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c31a26] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Cari judul buku..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-[#c31a26] focus:bg-white transition-all font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid Buku */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={48} />
            <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat Koleksi...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center group transition-all hover:-translate-y-2 hover:shadow-2xl"
                >
                  {/* Container Cover dengan Efek Zoom */}
                  <div className="w-full aspect-[2/3] rounded-[1.8rem] overflow-hidden bg-white shadow-inner relative mb-6 flex items-center justify-center border border-slate-50">
                    {book.pdf_url ? (
                      <div className="w-full h-full relative overflow-hidden">
                        {/* Fitur Zoom: 
                            1. #page=1&view=FitH -> Memaksa PDF fit secara horizontal (menghilangkan ruang kosong samping)
                            2. className scale-110 -> Melakukan zoom manual 10% agar elemen UI tepi PDF terpotong (lebih clean)
                        */}
                        <object
                          data={`${API_BASE_URL.replace('/api', '')}${book.pdf_url}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                          type="application/pdf"
                          className="w-full h-full scale-[1.15] origin-top object-cover pointer-events-none transition-transform duration-500 group-hover:scale-[1.35]"
                        >
                          <div className="flex flex-col items-center justify-center h-full bg-slate-50">
                             <FileText size={40} className="text-slate-200" />
                          </div>
                        </object>
                        {/* Overlay transparan mutlak */}
                        <div className="absolute inset-0 z-20 cursor-pointer" onClick={() => handlePreview(book.pdf_url)} />
                      </div>
                    ) : (
                      <img 
                        src={"https://via.placeholder.com/400x600?text=No+Cover"} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Efek kilau (Shine) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none z-10" />
                  </div>

                  <div className="text-center space-y-2 w-full px-2">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight line-clamp-1">
                      {book.title}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Download size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">
                        Ready to Read
                      </span>
                    </div>

                    <button 
                      onClick={() => handlePreview(book.pdf_url)}
                      className="w-full mt-4 bg-[#b8860b] hover:bg-[#a0760a] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <BookOpen size={14} /> Preview PDF
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                <p className="text-slate-300 font-black uppercase tracking-[0.3em] italic">Belum ada koleksi PDF</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL PREVIEW --- */}
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
              className="bg-white w-full h-full max-w-5xl rounded-[2rem] overflow-hidden relative flex flex-col shadow-2xl"
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
    </Sidebar>
  );
}