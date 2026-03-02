import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Box - Merah Solid */}
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              LITERA
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Beranda</Link>
            <Link href="/exercise" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Latihan</Link>
            <Link href="/livesession" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Live Session</Link>
            <Link href="/experiment" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Eksperimen</Link>
            <Link href="/experience" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Pengalaman</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-100"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-red-50/50 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative">
              {/* Decorative Blur Merah Halus */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-200/20 rounded-full blur-3xl -z-10"></div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                Tingkatkan <span className="text-red-600">Kemampuan Literasi</span> Anda Sekarang
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                LITERA membantu Anda mengembangkan kemampuan membaca dan menulis 
                untuk meningkatkan berpikir kritis dan kreatif dengan standar global.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/register" 
                  className="px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Mulai Sekarang
                </Link>
                <Link 
                  href="/exercise" 
                  className="px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-red-600 hover:text-red-600 transition-all"
                >
                  Jelajahi Fitur
                </Link>
                {/* TOMBOL E-BOOK BARU */}
                <a 
                  href="https://theleaders.id/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2"
                >
                  E-book
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">10K+</div>
                  <div className="text-sm text-slate-500 font-medium">Siswa Aktif</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-500 font-medium">Materi</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-500 font-medium">Mentor</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Card Merah Putih */}
              <div className="absolute inset-0 bg-red-600 rounded-3xl rotate-3 blur-[2px] opacity-5"></div>
              <div className="relative bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Belajar Membaca</div>
                      <div className="text-sm text-slate-500">Analisis teks mendalam dan komprehensif</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Latihan Menulis</div>
                      <div className="text-sm text-slate-500">Asah gaya kepenulisan yang berkarakter</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Sertifikasi</div>
                      <div className="text-sm text-slate-500">Sertifikat resmi tanda kecakapan literasi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Platform modern untuk mendukung perjalanan literasi Anda secara terstruktur.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card Item */}
            {[
              { title: "Latihan Interaktif", desc: "Metode belajar dua arah yang tidak membosankan.", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707" },
              { title: "Live Session", desc: "Interaksi langsung dengan para ahli di bidangnya.", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764" },
              { title: "Sertifikat Resmi", desc: "Dapatkan pengakuan formal atas pencapaian Anda.", icon: "M9 12l2 2 4-4" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition-all group">
                <div className="w-14 h-14 bg-red-50 group-hover:bg-red-600 rounded-xl flex items-center justify-center mb-6 transition-colors">
                  <svg className="w-7 h-7 text-red-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Merah Solid */}
      <section className="py-20 px-6 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Menjadi Lebih Literat?
          </h2>
          <p className="text-xl text-red-50 mb-8 opacity-90">
            Daftar sekarang dan nikmati akses penuh ke ribuan materi belajar eksklusif secara gratis.
          </p>
          <Link 
            href="/register" 
            className="inline-block px-10 py-5 bg-white text-red-600 font-bold text-lg rounded-xl hover:bg-red-50 transition-all shadow-xl shadow-black/10"
          >
            Mulai Belajar Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-slate-100 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 LITERA. Dirancang untuk kemajuan bangsa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}