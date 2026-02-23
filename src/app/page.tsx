import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold text-slate-800">LITERA</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-600 hover:text-blue-900 font-medium transition-colors">Beranda</Link>
            <Link href="/exercise" className="text-slate-600 hover:text-blue-900 font-medium transition-colors">Latihan</Link>
            <Link href="/livesession" className="text-slate-600 hover:text-blue-900 font-medium transition-colors">Live Session</Link>
            <Link href="/experiment" className="text-slate-600 hover:text-blue-900 font-medium transition-colors">Eksperimen</Link>
            <Link href="/experience" className="text-slate-600 hover:text-blue-900 font-medium transition-colors">Pengalaman</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-5 py-2.5 text-blue-900 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 bg-blue-900 text-white font-medium hover:bg-blue-800 rounded-lg transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2  rounded-full">
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                Tingkatkan <span className="text-blue-900">Kemampuan Literasi</span> Anda Sekarang
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                LITERA membantu Anda mengembangkan kemampuan membaca dan menulis 
                untuk meningkatkan berpikir kritis dan kreatif.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/register" 
                  className="px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25"
                >
                  Mulai Sekarang
                </Link>
                <Link 
                  href="/exercise" 
                  className="px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-blue-900 hover:text-blue-900 transition-all"
                >
                  Jelajahi Fitur
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-900">10K+</div>
                  <div className="text-sm text-slate-500">Siswa Aktif</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-900">500+</div>
                  <div className="text-sm text-slate-500">Materi</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-900">50+</div>
                  <div className="text-sm text-slate-500">Mentor</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-orange-500 rounded-3xl rotate-3"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Belajar Membaca</div>
                      <div className="text-sm text-slate-500">Kembangkan kemampuan memahami teks</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Latihan Menulis</div>
                      <div className="text-sm text-slate-500">Praktek menulis kreatif setiap hari</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Sertifikasi</div>
                      <div className="text-sm text-slate-500">Dapatkan sertifikat resmi</div>
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
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Temukan berbagai fitur yang akan membantu Anda meningkatkan kemampuan literasi dengan mudah
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Latihan Interaktif</h3>
              <p className="text-slate-600">
                Berbagai jenis latihan yang dirancang untuk meningkatkan kemampuan membaca dan menulis Anda secara sistematis.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Live Session</h3>
              <p className="text-slate-600">
                Ikuti sesi langsung dengan mentor berpengalaman untuk belajar secara langsung dan interaktif.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Sertifikat Resmi</h3>
              <p className="text-slate-600">
                Dapatkan sertifikat resmi setelah menyelesaikan program untuk membuktikan kemampuan literasi Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Meningkatkan Kemampuan Literasi?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabunglah dengan ribuan siswa yang telah meningkatkan kemampuan membaca dan menulis mereka bersama LITERA
          </p>
          <Link 
            href="/register" 
            className="inline-block px-10 py-5 bg-orange-500 text-white font-semibold text-lg rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
          >
            Daftar Sekarang - Gratis!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-xl font-bold text-white">LITERA</span>
              </div>
              <p className="text-slate-400">
                Platform pembelajaran literasi untuk semua kalangan.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Fitur</h4>
              <ul className="space-y-2">
                <li><Link href="/exercise" className="text-slate-400 hover:text-white transition-colors">Latihan</Link></li>
                <li><Link href="/livesession" className="text-slate-400 hover:text-white transition-colors">Live Session</Link></li>
                <li><Link href="/experiment" className="text-slate-400 hover:text-white transition-colors">Eksperimen</Link></li>
                <li><Link href="/sertifikat" className="text-slate-400 hover:text-white transition-colors">Sertifikat</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Karir</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Kontak</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Hubungi Kami</h4>
              <ul className="space-y-2 text-slate-400">
                <li>info@litera.id</li>
                <li>+62 812 3456 7890</li>
                <li>Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 LITERA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
