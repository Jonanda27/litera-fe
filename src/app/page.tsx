"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-red-100 selection:text-red-600">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-slate-200/50 py-3 shadow-sm"
            : "bg-transparent py-4 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg md:text-xl">L</span>
            </div>
            <span
              className={`text-xl md:text-2xl font-black tracking-tighter transition-colors duration-300 ${
                isScrolled ? "text-slate-900" : "text-white"
              }`}
            >
              LITERA
            </span>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                isScrolled
                  ? "text-slate-700 hover:bg-slate-100"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-red-600 text-white text-sm font-bold hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              Daftar
            </Link>
          </div>

          <button
            className={`md:hidden p-2 rounded-lg ${isScrolled ? "text-slate-600 bg-slate-100" : "text-white bg-white/10"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-6 px-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
            {[
              { label: "Fitur-fitur", href: "#features" },
              { label: "Testimoni", href: "#testimonials" }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-600 hover:text-red-600 font-bold py-2 border-b border-slate-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login" className="w-full text-center py-3 text-slate-700 font-bold border border-slate-200 rounded-xl">Masuk</Link>
              <Link href="/register" className="w-full text-center py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/20">Daftar</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg-landing.png"
            alt="Reading person"
            fill
            className="object-cover scale-105"
            priority
          />
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full pt-32 pb-40 lg:pt-30">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            
            {/* Teks Content: Center di iPad (md), Left di Desktop (lg) */}
            <div className="max-w-4xl text-center lg:text-left mx-auto lg:mx-0">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-6 md:mb-8">
                Tingkatkan <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                  Literasi Anda.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 md:mb-10 font-medium">
                LITERA membantu Anda mengembangkan kemampuan membaca dan menulis
                untuk meningkatkan berpikir kritis dengan standar global.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 sm:gap-5 w-full">
                <Link
                  href="/register"
                  className="group relative w-full sm:w-auto text-center px-8 py-4 bg-red-600 text-white font-bold rounded-2xl overflow-hidden transition-all hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.5)] active:scale-95"
                >
                  <span className="relative z-10">Mulai Sekarang</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
                <Link
                  href="#features"
                  className="w-full sm:w-auto justify-center px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  Jelajahi Fitur
                </Link>
              </div>
            </div>

            {/* Floating Elements: MATIKAN di iPad (md), HIDUPKAN di Desktop (lg) */}
            <div className="hidden lg:relative lg:flex justify-end items-center h-[500px]">
              <div className="absolute top-0 left-0 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl animate-bounce duration-[3000ms]">
                <div className="text-2xl font-black text-white">10K+</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Siswa Aktif</div>
              </div>

              <div className="absolute top-20 left-20 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl">
                <div className="text-2xl font-black text-center text-white">100+</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mentor Aktif</div>
              </div>

              <div className="relative bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(220,38,38,0.3)] w-80 rotate-3 hover:rotate-0 transition-all duration-500 z-20">
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-orange-400 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="h-4 w-20 bg-white/20 rounded-full"></div>
                  <div className="h-8 w-full bg-white/20 rounded-xl"></div>
                  <div className="pt-4 flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-red-700 bg-slate-300 overflow-hidden"><img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" /></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute top-24 -right-4 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] shadow-2xl w-64 group hover:-translate-y-2 transition-transform z-30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Terbaru</div>
                    <div className="text-white font-bold text-sm leading-tight">Materi Selesai</div>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[85%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Card Section */}
      <section className="relative z-30 px-4 md:px-6 -mt-24 md:-mt-32">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { title: "Belajar", desc: "Analisis teks mendalam", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { title: "Latihan", desc: "Asah gaya kepenulisan", icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
              { title: "Sertifikasi", desc: "Sertifikat resmi", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left group">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-all duration-300">
                  <svg className="w-7 h-7 text-red-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 px-4 md:px-6 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-12 lg:mb-20 gap-8">
            <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">Fitur Unggulan</h2>
              <p className="text-lg text-slate-600 font-medium">Ekosistem digital untuk mempercepat intelektual melalui literasi modern.</p>
            </div>
            <Link href="/features" className="text-red-600 font-bold flex items-center gap-2 uppercase tracking-widest text-sm">Lihat Semua Fitur <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Latihan Interaktif", desc: "Metode belajar dua arah dengan feedback AI.", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707" },
              { title: "Live Session", desc: "Tanya jawab langsung dengan para ahli.", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764" },
              { title: "Sertifikat Resmi", desc: "Pengakuan formal berskala nasional.", icon: "M9 12l2 2 4-4" },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-600 transition-all"><svg className="w-7 h-7 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} /></svg></div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-16 md:py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Buku Dibaca", val: "1.2M+" },
              { label: "Komunitas", val: "500+" },
              { label: "Nilai Rata-rata", val: "94%" },
              { label: "Partner Global", val: "25+" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1 md:space-y-2">
                <div className="text-3xl md:text-5xl font-black text-red-600 tracking-tighter">{stat.val}</div>
                <div className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Bento Grid */}
      <section id="testimonials" className="py-20 md:py-32 px-4 md:px-6 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Apa Kata Mereka?</h2>
            <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto italic">"Literasi bukan hanya tentang membaca, tapi tentang membuka jendela dunia baru."</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 h-auto">
            {/* Main Testimonial */}
            <div className="md:col-span-2 lg:col-span-3 bg-red-600 rounded-[2.5rem] p-8 md:p-10 text-white flex flex-col justify-between group transition-transform min-h-[300px]">
              <div className="text-2xl md:text-4xl font-serif italic mb-8">"LITERA memberikan saya akses ke materi praktis yang luar biasa!"</div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-400 overflow-hidden border-2 border-white/20 shrink-0">
                  <img src="https://i.pravatar.cc/150?u=5" alt="user" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-black text-lg">Anindya Putri</div>
                  <div className="text-red-200 text-sm font-bold uppercase tracking-widest">Mahasiswa Sastra</div>
                </div>
              </div>
            </div>
            {/* Side Grid */}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-between group hover:bg-red-600 transition-colors duration-500">
                <p className="text-lg font-medium leading-snug mb-6">"Fitur AI feedback-nya sangat membantu saya memperbaiki gaya bahasa dalam hitungan detik."</p>
                <div className="text-sm font-black uppercase tracking-widest opacity-60">Raka, Copywriter</div>
              </div>
              <div className="bg-slate-100 rounded-[2rem] p-8 text-slate-900 flex flex-col justify-between">
                <p className="text-lg font-medium leading-snug mb-6">"Pilihan live sessionnya luar biasa berbobot."</p>
                <div className="text-sm font-black uppercase tracking-widest text-red-600 tracking-tighter">— Sarah J.</div>
              </div>
              <div className="sm:col-span-2 bg-slate-50 rounded-[2rem] p-8 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3 shrink-0">
                    {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 overflow-hidden"><img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="u" /></div>)}
                  </div>
                  <div className="text-sm font-bold text-slate-600">+10,000 Pelajar Bergabung</div>
                </div>
                <div className="text-red-600 font-black text-base">Rating 4.9/5 ★</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Community Section */}
      <section className="pb-20 md:pb-32 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full md:w-1/3 h-full bg-red-600 opacity-20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left mx-auto lg:mx-0">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">Siap Mengasah<br className="hidden sm:block"/>Taji Intelektual?</h2>
                <p className="text-slate-400 text-lg mb-8 font-medium">Jangan lewatkan pembaruan kurikulum literasi terbaru.</p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto lg:mx-0">
                  <input type="email" placeholder="Alamat email Anda" className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-red-600 flex-grow w-full" />
                  <button className="px-8 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95 whitespace-nowrap">Ikuti Newsletter</button>
                </div>
              </div>
              <div className="hidden lg:flex justify-end">
                <div className="w-64 h-64 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center p-4 rotate-12">
                   <div className="w-full h-full border-4 border-dashed border-white/30 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
                      <span className="text-white text-4xl font-black -rotate-12">NEWS</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 md:px-6 relative bg-red-600">
        <div className="max-w-5xl mx-auto text-center relative z-10 text-white">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Mulailah Sekarang!</h2>
          <p className="text-xl text-red-50 mb-12 opacity-90 max-w-2xl mx-auto font-medium">Daftar sekarang dan nikmati akses penuh materi gratis.</p>
          <div className="flex justify-center">
            <Link href="/register" className="px-10 py-5 bg-white text-red-600 font-black text-xl rounded-2xl hover:scale-105 transition-all shadow-2xl active:scale-95">Mulai Belajar Gratis</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-12 px-4 md:px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white">L</div>
             <span className="text-xl font-black text-slate-900 uppercase">Litera</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center">&copy; 2026 LITERA — INDONESIA DIGITAL LITERACY PLATFORM.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-red-600 text-xs font-bold uppercase tracking-widest">Instagram</Link>
            <Link href="#" className="text-slate-400 hover:text-red-600 text-xs font-bold uppercase tracking-widest">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}