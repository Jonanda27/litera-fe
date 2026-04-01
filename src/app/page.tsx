"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } 
    }
  };

  // Komponen Reusable Flip Card
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
          {/* SISI DEPAN (FRONT) */}
          <div className="absolute inset-0 backface-hidden z-10" style={{ backfaceVisibility: "hidden" }}>
            <div className={`absolute inset-0 ${bgColor} rounded-[3rem] md:rounded-[4rem] ${rotateDir} shadow-2xl transition-transform duration-500 group-hover:rotate-0`}></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <span className="text-[180px] font-black text-white italic leading-none">{stepNum}</span>
            </div>
            <img 
              src={img} 
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${imgScale} h-auto max-w-none z-20 pointer-events-none group-hover:scale-110 transition-transform duration-500 origin-bottom`}
              alt={title}
            />
            <div className="absolute bottom-8 left-0 right-0 text-center z-30 px-4">
              <span className="bg-white/90 backdrop-blur-md px-8 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-[0.2em] border border-slate-100 shadow-xl inline-block text-slate-900 italic">
                {title}
              </span>
            </div>
          </div>
          {/* SISI BELAKANG (BACK) */}
          <div 
            className={`absolute inset-0 ${bgColor} rounded-[3rem] md:rounded-[4rem] flex flex-col items-center justify-center p-8 text-center rotate-y-180 backface-hidden shadow-2xl`}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-white/40 font-black text-6xl mb-4 italic">0{stepNum}</span>
            <h3 className="text-white font-black text-2xl md:text-3xl uppercase tracking-tighter mb-4">{backTitle}</h3>
            <p className="text-white/95 text-sm font-medium leading-relaxed italic">
              {backDesc}
            </p>
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
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md py-4 border-b border-slate-100 shadow-sm" : "bg-transparent py-7"
      }`}>
        <div className="w-full max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:rotate-6 transition-transform">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className={`text-2xl font-black tracking-tighter uppercase transition-colors duration-300 ${isScrolled ? "text-slate-900" : "text-white"}`}>Litera</span>
          </Link>

          <div className={`hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.3em] transition-colors duration-300 ${isScrolled ? "text-gray-500" : "text-white/80"}`}>
            {["Visi", "Metode", "Tujuan", "Mentor"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-red-600 transition-colors tracking-[0.4em]">{item}</a>
            ))}
          </div>

          <Link href="/register" className="px-8 py-2.5 bg-red-600 text-white font-black rounded-full hover:bg-white hover:text-red-600 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-red-600/20">
            Daftar Sekarang
          </Link>
        </div>
      </nav>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative pt-32 md:pt-44 pb-32 flex flex-col items-center z-10 min-h-[90vh] flex items-center justify-center">
        <div 
          className="absolute inset-0 z-[-2] bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ backgroundImage: "url('/bekgron.png')" }}
        ></div>
        <div className="absolute inset-0 z-[-1] bg-black/60"></div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FFFFFF] to-transparent z-0"></div>

        <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 text-center mb-16">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-[92px] font-black leading-[1.1] tracking-[-0.05em] mb-8 uppercase text-white">
              Bertumbuh Dalam <br className="hidden md:block"/>
              <span className="text-red-600 italic font-serif lowercase underline decoration-white/20 decoration-8 underline-offset-[12px]">literasi.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Portal e-learning yang menempatkan manusia, pengalaman, dan proses berpikir sebagai pusat pembelajaran membaca dan menulis secara reflektif.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-5 mb-16">
              <Link href="/register" className="px-10 py-5 bg-red-600 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl uppercase text-sm tracking-widest text-center min-w-[200px]">
                Mulai Menulis
              </Link>
              <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black rounded-2xl hover:bg-white hover:text-black transition-all uppercase text-sm tracking-widest min-w-[200px] shadow-sm">
                E-Book
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: 3E METHODOLOGY (z-index: 10) --- */}
      <section id="metode" className="relative pt-32 pb-16 bg-white z-10">
        <div className="w-full max-w-[1400px] mx-auto px-6 flex flex-col items-center overflow-visible relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-16 text-center"
          >
             <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.5em] px-6 py-2 rounded-full shadow-lg shadow-red-600/20 mb-4">
                Metode 3E
             </span>
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

      {/* --- SECTION 3: VISI & PENDAHULUAN (OVERLAP SEDIKIT) --- */}
      {/* Margin negatif -mt-4 agar menutupi kartu sangat sedikit saja */}
      <section id="visi" className="relative pt-24 pb-32 bg-slate-50 z-30 border-y border-slate-100 -mt-10 md:-mt-20">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center text-slate-900">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-6 italic">Latar Belakang</h2>
              <h3 className="text-4xl md:text-5xl font-black leading-[1.2] tracking-tight mb-8 text-slate-900">Literasi Strategis dalam Membentuk Makna</h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-6 italic">
                "Literasi yang sehat diyakini memiliki peran strategis dalam membangun keluarga yang tangguh, relasi sosial yang dewasa, serta masyarakat yang mampu mengambil keputusan secara rasional."
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-200 shadow-xl">
              <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6 text-balance font-medium">
                LITERA adalah platform pembelajaran literasi yang mendukung proses belajar berkelanjutan dengan menumbuhkan kebiasaan membaca dan menulis secara reflektif. Kami mendukung proses belajar yang menempatkan manusia sebagai pusat pembelajaran.
              </p>
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

      {/* --- SECTION 4: CORE MISSION (BENTO GRID WITH IMAGES) --- */}
      <section id="tujuan" className="py-32 bg-[#0F1115] relative z-10 rounded-[4rem] md:rounded-[6rem] mx-4 my-10 overflow-hidden shadow-2xl">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 text-white">
            <div className="max-w-2xl">
              <h2 className="text-red-500 font-black text-[11px] uppercase tracking-[0.4em] mb-4">Core Mission</h2>
              <h3 className="text-5xl md:text-7xl font-black leading-none tracking-tighter uppercase italic">Misi Utama Kami</h3>
            </div>
            <p className="text-slate-400 text-base md:text-lg max-w-xs font-medium italic border-l-2 border-red-600 pl-6 leading-relaxed">
              Membangun fondasi literasi yang relevan dengan kehidupan nyata dan ekosistem belajar sepanjang hayat.
            </p>
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
               <h4 className="text-white text-4xl md:text-5xl font-black leading-[1] tracking-tighter uppercase italic text-white">Siklus <br/> Belajar <br/> Abadi.</h4>
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
               <div className="hidden sm:flex w-28 h-28 bg-white/5 rounded-full items-center justify-center group-hover:rotate-45 transition-transform duration-700 relative z-10 backdrop-blur-sm border border-white/10">
                 <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: FASILITATOR (MENTOR) --- */}
      <section id="mentor" className="py-32 bg-white relative z-10">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center text-slate-900">
            <div className="lg:w-1/2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-6 italic">Fasilitator</h2>
              <h3 className="text-4xl md:text-5xl font-black mb-8 leading-[1.2] italic uppercase tracking-tighter text-balance">Literacy Learning & Reflection Guide</h3>
              <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-10 font-medium opacity-90">
                Mentor di LITERA bertindak sebagai Literacy Learning & Reflection Guide, yaitu pendamping proses belajar dan refleksi. Mereka tidak menggantikan suara peserta, melainkan membantu menemukan suara sendiri.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { t: "Refleksi Tajam", d: "Memantik refleksi atas bacaan dan tulisan." },
                  { t: "Kualitas Berpikir", d: "Menjaga kualitas diskusi dan proses berpikir." },
                  { t: "Umpan Balik", d: "Memberikan feedback reflektif, bukan nilai mutlak." },
                  { t: "Ruang Aman", d: "Menjaga ruang belajar tetap aman dan etis." }
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
                 { n: "Robert Davis", s: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" }
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

      {/* --- FOOTER --- */}
      <footer className="py-24 px-6 bg-white border-t border-slate-100 relative z-10 text-slate-900">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="text-2xl font-black tracking-tighter uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center shadow-md shadow-red-600/20">
                   <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                </div>
                LITERA — 2026
             </div>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.5em] text-center md:text-left leading-relaxed mt-2">
               THE NEXT GENERATION OF AUTHOR ECOSYSTEM <br/>
               BERTUMBUH DALAM LITERASI REPUBLIK INDONESIA
             </p>
          </div>
          <div className="flex gap-12 font-black text-[11px] uppercase tracking-[0.4em] text-slate-400">
            <a href="https://litera.geocitra.com" className="hover:text-red-600 transition-all text-slate-900">litera.geocitra.com</a>
            <a href="#" className="hover:text-red-600 transition-all text-slate-900 uppercase">Instagram</a>
            <a href="#" className="hover:text-red-600 transition-all text-slate-900 uppercase">Twitter</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .group:hover .group-hover\:rotate-y-180 { transform: rotateY(180deg); }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}