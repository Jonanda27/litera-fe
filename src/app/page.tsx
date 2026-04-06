"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import axios from "axios";
import { 
  Download, 
  BookOpen, 
  Loader2, 
  FileText, 
  X, 
  Layers3, 
  Bookmark,
  ArrowRight
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

// --- TIPE DATA BUKU ---
interface Book {
  id: number;
  title: string;
  pdf_url: string;
  cover_url?: string;
  downloads: number;
  category: string;
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  // --- STATE UNTUK E-BOOK ---
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingEbooks, setIsLoadingEbooks] = useState(true);
  const [isDownloadingId, setIsDownloadingId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  // --- EFEK SCROLL NAV & FETCH DATA BUKU ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/books/public`);
        setBooks(response.data);
      } catch (error) {
        console.error("Gagal mengambil ebook:", error);
      } finally {
        setIsLoadingEbooks(false);
      }
    };
    
    fetchBooks();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- LOGIKA FILTER E-BOOK (TANPA SEARCH) ---
  const categories = ["Semua", "Fiksi", "Non-Fiksi"];
  const filteredBooks = books.filter((book) => {
    return activeCategory === "Semua" || book.category === activeCategory;
  });

  // --- FUNGSI PREVIEW & DOWNLOAD E-BOOK ---
  const handlePreview = (pdfUrl: string) => {
    if (!pdfUrl) return alert("File PDF tidak ditemukan");
    const fullUrl = `${API_BASE_URL.replace('/api', '')}${pdfUrl}`;
    setSelectedPdf(fullUrl);
  };

  const handleDownload = async (book: Book) => {
    if (!book.pdf_url) return alert("Link unduhan tidak tersedia.");
    
    setIsDownloadingId(book.id);
    try {
      const baseUrl = API_BASE_URL.replace('/api', '');
      const fullUrl = `${baseUrl}${book.pdf_url}`;

      const response = await axios.get(fullUrl, {
        headers: { 'Accept': 'application/pdf' },
        responseType: 'blob',
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
      alert("Gagal mengunduh. Pastikan koneksi stabil.");
    } finally {
      setIsDownloadingId(null);
    }
  };

  // --- VARIAN ANIMASI ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const ebookItemVariants: Variants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  // --- KOMPONEN FLIP CARD ---
  const FlipCard = ({ bgColor, img, title, backTitle, backDesc, delay, rotateDir, imgScale, stepNum }: any) => {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8 }}
        className="relative w-1/3 max-w-[320px] aspect-[4/5.5] group cursor-pointer perspective-1000"
      >
        <motion.div
          className="relative w-full h-full transition-all duration-700 preserve-3d group-hover:rotate-y-180"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 backface-hidden z-10" style={{ backfaceVisibility: "hidden" }}>
            <div className={`absolute inset-0 ${bgColor} rounded-[3rem] md:rounded-[4rem] ${rotateDir} shadow-2xl transition-transform duration-500 group-hover:rotate-0`}></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <span className="text-[180px] font-black text-white italic leading-none">{stepNum}</span>
            </div>
            <img src={img} className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${imgScale} h-auto max-w-none z-20 pointer-events-none group-hover:scale-110 transition-transform duration-500 origin-bottom`} alt={title} />
            <div className="absolute bottom-8 left-0 right-0 text-center z-30 px-4">
              <span className="bg-white/90 backdrop-blur-md px-8 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-[0.2em] border border-slate-100 shadow-xl inline-block text-slate-900 italic">{title}</span>
            </div>
          </div>
          <div
            className={`absolute inset-0 ${bgColor} rounded-[3rem] md:rounded-[4rem] flex flex-col items-center justify-center p-8 text-center rotate-y-180 backface-hidden shadow-2xl`}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-white/40 font-black text-6xl mb-4 italic">0{stepNum}</span>
            <h3 className="text-white font-black text-2xl md:text-3xl uppercase tracking-tighter mb-4">{backTitle}</h3>
            <p className="text-white/95 text-sm font-medium leading-relaxed italic">{backDesc}</p>
            <div className="mt-8 w-12 h-1 bg-white/30 rounded-full"></div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-slate-900 overflow-x-hidden selection:bg-red-600 selection:text-white relative">
      
      {/* --- GLOBAL BG SPLASH --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-red-500/10 blur-[120px] rounded-full opacity-60"></div>
        <div className="absolute top-[40%] -right-[5%] w-[600px] h-[600px] bg-red-300/10 blur-[130px] rounded-full"></div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md py-4 border-b border-slate-100 shadow-sm" : "bg-transparent py-7"}`}>
        <div className="w-full max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:rotate-6 transition-transform">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className={`text-2xl font-black tracking-tighter uppercase transition-colors duration-300 ${isScrolled ? "text-slate-900" : "text-white"}`}>Litera</span>
          </Link>

          <div className={`hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.3em] transition-colors duration-300 ${isScrolled ? "text-gray-500" : "text-white/80"}`}>
            {["Visi", "Metode", "Tujuan", "Mentor", "E-Book"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "")}`} className="hover:text-red-600 transition-colors tracking-[0.4em]">{item}</a>
            ))}
          </div>

          <Link href="/register" className="px-8 py-2.5 bg-red-600 text-white font-black rounded-full hover:bg-white hover:text-red-600 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-red-600/20">
            Daftar Sekarang
          </Link>
        </div>
      </nav>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative pt-32 md:pt-44 pb-32 flex flex-col items-center z-10 min-h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0 z-[-2] bg-cover bg-center bg-no-repeat transition-opacity duration-700" style={{ backgroundImage: "url('/bekgron.png')" }}></div>
        <div className="absolute inset-0 z-[-1] bg-black/60"></div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FFFFFF] to-transparent z-0"></div>

        <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 text-center mb-16">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-[92px] font-black leading-[1.1] tracking-[-0.05em] mb-8 uppercase text-white">
              Bertumbuh Dalam <br className="hidden md:block" />
              <span className="text-red-600 italic font-serif lowercase underline decoration-white/20 decoration-8 underline-offset-[12px]">literasi.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Portal e-learning yang menempatkan manusia, pengalaman, dan proses berpikir sebagai pusat pembelajaran membaca dan menulis secara reflektif.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-5 mb-16">
              <Link href="/login" className="px-10 py-5 bg-red-600 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl uppercase text-sm tracking-widest text-center min-w-[200px]">
                Mulai Menulis
              </Link>
              <a href="#e-book" className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black rounded-2xl hover:bg-white hover:text-black transition-all uppercase text-sm tracking-widest min-w-[200px] shadow-sm flex items-center justify-center text-center">
                E-Book
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: 3E METHODOLOGY --- */}
      <section id="metode" className="relative pt-32 pb-16 bg-white z-10">
        <div className="w-full max-w-[1400px] mx-auto px-6 flex flex-col items-center overflow-visible relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center mb-16 text-center">
            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.5em] px-6 py-2 rounded-full shadow-lg shadow-red-600/20 mb-4">Metode 3E</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Alur Pembelajaran</h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] italic">Exercise • Experience • Experiment</p>
          </motion.div>

          <div className="w-full flex justify-center items-end gap-8 md:gap-16 overflow-visible">
            <FlipCard bgColor="bg-[#E9743F]" img="/orang1.png" title="Exercise" backTitle="Exercise" backDesc="Ruang Belajar untuk memperoleh kerangka berpikir dan pemahaman sistematis tentang literasi." delay={0.1} rotateDir="rotate-[-5deg]" imgScale="w-[240%]" stepNum="1" />
            <FlipCard bgColor="bg-red-600" img="/orang2.png" title="Experience" backTitle="Experience" backDesc="Ruang Diskusi reflektif yang mengakui bahwa pengalaman hidup adalah sumber pembelajaran bernilai tinggi." delay={0.2} rotateDir="rotate-[3deg]" imgScale="w-[240%]" stepNum="2" />
            <FlipCard bgColor="bg-[#59C6D1]" img="/orang3.png" title="Experiment" backTitle="Experiment" backDesc="Ruang penerapan penulisan buku untuk menguji keberanian mencoba dan belajar dari proses." delay={0.3} rotateDir="rotate-[-4deg]" imgScale="w-[115%]" stepNum="3" />
          </div>
        </div>
      </section>

      {/* --- SECTION 3: VISI --- */}
      <section id="visi" className="relative pt-24 pb-32 bg-slate-50 z-30 border-y border-slate-100 -mt-10 md:-mt-20">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center text-slate-900">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-6 italic">Latar Belakang</h2>
              <h3 className="text-4xl md:text-5xl font-black leading-[1.2] tracking-tight mb-8 text-slate-900">Literasi Strategis dalam Membentuk Makna</h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-6 italic">"Literasi yang sehat diyakini memiliki peran strategis dalam membangun keluarga yang tangguh, relasi sosial yang dewasa, serta masyarakat yang mampu mengambil keputusan secara rasional."</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-200 shadow-xl">
              <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6 text-balance font-medium">LITERA adalah platform pembelajaran literasi yang mendukung proses belajar berkelanjutan dengan menumbuhkan kebiasaan membaca dan menulis secara reflektif. Kami mendukung proses belajar yang menempatkan manusia sebagai pusat pembelajaran.</p>
              <div className="flex gap-4 mt-8">
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-2xl">M</div>
                <div className="flex flex-col justify-center">
                  <p className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">Maman Suherman</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Founder LITERA</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: TUJUAN --- */}
      <section id="tujuan" className="py-32 bg-[#0F1115] relative z-10 rounded-[4rem] md:rounded-[6rem] mx-4 my-10 overflow-hidden shadow-2xl">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 text-white">
            <div className="max-w-2xl">
              <h2 className="text-red-500 font-black text-[11px] uppercase tracking-[0.4em] mb-4">Core Mission</h2>
              <h3 className="text-5xl md:text-7xl font-black leading-none tracking-tighter uppercase italic">Misi Utama Kami</h3>
            </div>
            <p className="text-slate-400 text-base md:text-lg max-w-xs font-medium italic border-l-2 border-red-600 pl-6 leading-relaxed">Membangun fondasi literasi yang relevan dengan kehidupan nyata dan ekosistem belajar sepanjang hayat.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 p-12 rounded-[3.5rem] border border-white/5 hover:border-red-600/50 transition-all group relative overflow-hidden h-[400px]">
              <img src="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700" alt="Writing" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-transparent"></div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                <h4 className="text-white text-2xl md:text-3xl font-black mb-4 uppercase tracking-tight">Pemahaman Makna Terstruktur</h4>
                <p className="text-slate-300 text-base leading-relaxed font-medium max-w-md">Memahami hubungan mendalam antara bahasa, pikiran, pengalaman, dan pembentukan makna yang utuh.</p>
              </div>
            </div>
            <div className="md:col-span-5 bg-red-600 p-12 rounded-[3.5rem] flex flex-col justify-between hover:scale-[0.98] transition-transform shadow-xl">
              <h4 className="text-white text-4xl md:text-5xl font-black leading-[1] tracking-tighter uppercase italic text-white">Siklus <br /> Belajar <br /> Abadi.</h4>
              <p className="text-red-100 text-sm md:text-base font-bold mt-12 leading-relaxed">Mengintegrasikan pengetahuan, membaca, dan praktik menulis dalam satu siklus berkelanjutan.</p>
            </div>
            <div className="md:col-span-5 bg-[#1A1D23] p-12 rounded-[3.5rem] border border-white/5 hover:bg-white transition-all group relative overflow-hidden text-white">
              <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-700" alt="Intellectual Responsibility" />
              <div className="relative z-10">
                <div className="text-red-600 text-7xl font-black mb-6 group-hover:scale-110 transition-transform leading-none">"</div>
                <h4 className="group-hover:text-slate-900 text-2xl font-black mb-4 transition-colors uppercase tracking-tight text-white">Tanggung Jawab Intelektual</h4>
                <p className="text-slate-400 group-hover:text-slate-600 text-base md:text-lg font-medium transition-colors leading-relaxed">Menumbuhkan individu yang mampu membaca secara kritis dan menulis secara bertanggung jawab.</p>
              </div>
            </div>
            <div className="md:col-span-7 bg-[#1A1D23] p-12 rounded-[3.5rem] border border-white/5 flex items-center gap-10 group relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:scale-110 transition-transform duration-1000" alt="Learning Foundation" />
              <div className="flex-1 relative z-10 text-white">
                <h4 className="text-2xl md:text-3xl font-black mb-3 uppercase tracking-tight text-white">Fondasi Belajar</h4>
                <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed text-balance">Menjadi ruang belajar yang reflektif dan relevan dengan kehidupan nyata peserta.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: MENTOR --- */}
      <section id="mentor" className="py-32 bg-white relative z-10">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center text-slate-900">
            <div className="lg:w-1/2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-6 italic">Fasilitator</h2>
              <h3 className="text-4xl md:text-5xl font-black mb-8 leading-[1.2] italic uppercase tracking-tighter text-balance">Literacy Learning & Reflection Guide</h3>
              <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-10 font-medium opacity-90">Mentor di LITERA bertindak sebagai Literacy Learning & Reflection Guide, yaitu pendamping proses belajar dan refleksi. Mereka tidak menggantikan suara peserta, melainkan membantu menemukan suara sendiri.</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { t: "Refleksi Tajam", d: "Memantik refleksi atas bacaan dan tulisan." },
                  { t: "Kualitas Berpikir", d: "Menjaga kualitas diskusi dan proses berpikir." },
                  { t: "Umpan Balik", d: "Memberikan feedback reflektif, bukan nilai mutlak." },
                  { t: "Ruang Aman", d: "Menjaga ruang belajar tetap aman dan etis." },
                ].map((item, i) => (
                  <li key={i} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full shadow-md shadow-red-600/30"></div>
                      <span className="font-black text-sm uppercase tracking-widest leading-none text-slate-900">{item.t}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold ml-6 uppercase leading-relaxed tracking-wide">{item.d}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-6 md:gap-8">
              {[
                { n: "Andini Harsono", s: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop" },
                { n: "Yasmin Luthfi", s: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop" },
                { n: "Linda Saragih", s: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" },
                { n: "Robert Davis", s: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" },
              ].map((m, i) => (
                <div key={i} className={`p-8 md:p-10 bg-slate-50 rounded-[3rem] text-center border border-slate-100 shadow-sm ${i % 2 !== 0 ? "translate-y-12" : ""}`}>
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-200 rounded-full mx-auto mb-6 border-4 border-white shadow-md overflow-hidden">
                    <img src={m.s} alt={m.n} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-black text-[10px] md:text-[11px] uppercase text-slate-900 tracking-[0.2em] leading-tight">{m.n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 6: E-BOOK GALLERY --- */}
      <section id="e-book" className="py-32 bg-[#F8FAFC] relative z-10 border-t border-slate-200">
        <div className="w-full max-w-[1300px] mx-auto px-6">
          
          {/* HEADER E-BOOK */}
          <div className="flex flex-col items-center text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-4 italic">Digital Archive</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">
                Koleksi <span className="text-red-600 italic">E-Book</span>
              </h3>
              <p className="text-slate-500 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                Jelajahi berbagai referensi dan karya tulis reflektif yang dapat membantu memperluas wawasan literasi Anda, langsung dari perpustakaan digital kami.
              </p>
            </motion.div>

            {/* CATEGORY FILTER */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-md border border-slate-200 rounded-full shadow-sm">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? "text-white" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {activeCategory === cat && (
                    <motion.div layoutId="activeCategoryBg" className="absolute inset-0 bg-red-600 rounded-full shadow-md shadow-red-600/20" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              ))}
            </motion.div>
          </div>

          {/* E-BOOK GRID */}
          {isLoadingEbooks ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <Loader2 className="animate-spin text-red-600" size={50} />
              <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-xs">Accessing Database...</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      variants={ebookItemVariants}
                      layout
                      whileHover={{ y: -8 }}
                      className="group bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col relative transition-all duration-300"
                    >
                      {/* CATEGORY BADGE */}
                      <div className={`absolute top-8 left-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-md z-30 flex items-center gap-1.5 ${book.category === 'Fiksi' ? "bg-indigo-600" : "bg-teal-600"}`}>
                        <Bookmark size={10} fill="white" /> {book.category}
                      </div>

                      {/* BOOK COVER */}
                      <div className="w-full aspect-[2/2.8] rounded-[1.2rem] overflow-hidden bg-slate-100 relative mb-5 transition-all duration-300 border border-slate-100 group-hover:border-slate-200">
                        {book.pdf_url ? (
                          <div className="w-full h-full relative">
                            {/* Object digunakan sebagai cover generate dari PDF */}
                            <object data={`${API_BASE_URL.replace('/api', '')}${book.pdf_url}#page=1&view=FitH&toolbar=0&navpanes=0`} type="application/pdf" className="w-full h-full scale-[1.3] origin-top object-cover pointer-events-none group-hover:scale-[1.35] transition-transform duration-700">
                              <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-300">
                                <FileText size={40} strokeWidth={1.5} />
                              </div>
                            </object>
                            
                            {/* OVERLAY HOVER */}
                            <div 
                              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/0 group-hover:bg-slate-900/40 backdrop-blur-[0px] group-hover:backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer" 
                              onClick={() => handlePreview(book.pdf_url)}
                            >
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="bg-white/90 p-4 rounded-full shadow-xl mb-3 text-red-600 group-hover:scale-110 transition-transform">
                                <BookOpen size={22} />
                              </motion.div>
                              <p className="text-white font-black uppercase tracking-[0.2em] text-[10px] drop-shadow-md">Baca PDF</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><FileText size={40} strokeWidth={1} /></div>
                        )}
                        
                        {/* Shadow Effect for Book Spine */}
                        <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-black/10 to-transparent z-10 pointer-events-none" />
                      </div>

                      {/* BOOK INFO */}
                      <div className="px-1 flex-1 flex flex-col">
                        <h3 className="text-[17px] font-black text-slate-900 leading-[1.3] tracking-tight line-clamp-2 overflow-hidden mb-4" title={book.title}>
                          {book.title}
                        </h3>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Layers3 size={12} /> E-Book
                          </span>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownload(book); }}
                            disabled={isDownloadingId === book.id}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-wider group/btn"
                          >
                            {isDownloadingId === book.id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <>
                                Download <Download size={12} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                    <Layers3 className="mx-auto text-slate-300 mb-4" size={40} strokeWidth={1} />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Belum ada buku di kategori ini</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-24 px-6 bg-white border-t border-slate-100 relative z-10 text-slate-900">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-2xl font-black tracking-tighter uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center shadow-md shadow-red-600/20"><div className="w-2.5 h-2.5 bg-white rounded-full"></div></div>
              LITERA — 2026
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.5em] text-center md:text-left leading-relaxed mt-2">
              THE NEXT GENERATION OF AUTHOR ECOSYSTEM <br /> BERTUMBUH DALAM LITERASI REPUBLIK INDONESIA
            </p>
          </div>
          <div className="flex gap-12 font-black text-[11px] uppercase tracking-[0.4em] text-slate-400">
            <a href="https://litera.geocitra.com" className="hover:text-red-600 transition-all text-slate-900">litera.geocitra.com</a>
            <a href="#" className="hover:text-red-600 transition-all text-slate-900 uppercase">Instagram</a>
            <a href="#" className="hover:text-red-600 transition-all text-slate-900 uppercase">Twitter</a>
          </div>
        </div>
      </footer>

      {/* --- PDF READER MODAL --- */}
      <AnimatePresence>
        {selectedPdf && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10 bg-slate-900/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full h-full max-w-5xl rounded-[2rem] overflow-hidden relative flex flex-col shadow-2xl border-4 border-white">
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-3 ml-4">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><FileText size={18} className="text-white" /></div>
                  <h2 className="font-black text-slate-800 uppercase tracking-wider text-sm">E-Book Reader</h2>
                </div>
                <button onClick={() => setSelectedPdf(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors mr-2"><X size={24} /></button>
              </div>
              <div className="flex-1 bg-slate-200">
                <iframe src={`${selectedPdf}#toolbar=1&navpanes=0`} className="w-full h-full border-none" title="PDF Preview" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .group:hover .group-hover\\:rotate-y-180 { transform: rotateY(180deg); }
        html { scroll-behavior: smooth; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}