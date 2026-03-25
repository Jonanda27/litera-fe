"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Download, BookOpen, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Data Dummy sesuai gambar
const EBOOK_DATA = [
  {
    id: 1,
    title: "Arsitektur Kepemimpinan",
    downloads: 102,
    image: "https://picsum.photos/id/101/400/600", // Ganti dengan path asli jika ada
  },
  {
    id: 2,
    title: "Transformasi Ekonomi Hijau",
    downloads: 74,
    image: "https://picsum.photos/id/102/400/600",
  },
  {
    id: 3,
    title: "Generasi Z",
    downloads: 891,
    image: "https://picsum.photos/id/103/400/600",
  },
  {
    id: 4,
    title: "Digital Statecraft",
    downloads: 891,
    image: "https://picsum.photos/id/104/400/600",
  },
];

export default function EbookPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBooks = EBOOK_DATA.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
        
        {/* Header & Navigasi */}
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

          {/* Search Bar */}
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
                {/* Cover Buku */}
                <div className="w-full aspect-[2/3] rounded-[1.8rem] overflow-hidden bg-slate-100 shadow-inner relative mb-6">
                  <img 
                    src={book.image} 
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </div>

                {/* Info Buku */}
                <div className="text-center space-y-2 w-full px-2">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight line-clamp-1">
                    {book.title}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Download size={14} className="animate-bounce" />
                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none">
                      {book.downloads} Downloads
                    </span>
                  </div>

                  {/* Tombol Baca */}
                  <button className="w-full mt-4 bg-[#b8860b] hover:bg-[#a0760a] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-yellow-900/10 transition-all active:scale-95">
                    Read
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
              <p className="text-slate-300 font-black uppercase tracking-[0.3em] italic">Buku tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}