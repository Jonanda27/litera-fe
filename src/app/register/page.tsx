"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constans/constans';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State untuk menu mobile

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confPassword) {
      setError("Password dan Konfirmasi Password tidak cocok!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: name, email, password, confPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registrasi gagal');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar - Merah Putih */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-200 shrink-0">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">LITERA</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Beranda</Link>
            <Link href="/exercise" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Latihan</Link>
            <Link href="/livesession" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Live Session</Link>
            <Link href="/experiment" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Eksperimen</Link>
            <Link href="/experience" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Pengalaman</Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors">Masuk</Link>
            <Link href="/register" className="px-5 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-100">Daftar</Link>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <button 
            className="lg:hidden p-2 text-slate-600 hover:text-red-600 transition-colors"
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

        {/* Mobile & Tablet Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl py-4 px-6 flex flex-col gap-4">
            <Link href="/" className="text-slate-600 hover:text-red-600 font-medium py-2">Beranda</Link>
            <Link href="/exercise" className="text-slate-600 hover:text-red-600 font-medium py-2">Latihan</Link>
            <Link href="/livesession" className="text-slate-600 hover:text-red-600 font-medium py-2">Live Session</Link>
            <Link href="/experiment" className="text-slate-600 hover:text-red-600 font-medium py-2">Eksperimen</Link>
            <Link href="/experience" className="text-slate-600 hover:text-red-600 font-medium py-2">Pengalaman</Link>
            
            <div className="h-px bg-slate-100 my-2"></div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/login" 
                className="w-full sm:w-auto text-center px-5 py-2.5 text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Masuk
              </Link>
              <Link 
                href="/register" 
                className="w-full sm:w-auto text-center px-5 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-all"
              >
                Daftar
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumb Navigation */}
      <div className="pt-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-400 hover:text-red-600 transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-medium">Daftar Akun</span>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-8 md:py-12">
        <div 
          className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md transform transition-all duration-500 border border-slate-100 shadow-[0_20px_50px_rgba(220,_38,_38,_0.15)] hover:shadow-[0_20px_60px_rgba(220,_38,_38,_0.25)]"
          style={{ 
            animation: 'slideUp 0.6s ease-out forwards',
            opacity: 0,
            transform: 'translateY(20px)'
          }}
        >
          <style jsx>{`
            @keyframes slideUp {
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-red-50 rounded-2xl mb-4 border border-red-100">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Buat Akun Baru</h1>
            <p className="text-slate-500 text-sm mt-2">Mulai perjalanan literasimu hari ini</p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-xl">
                {error}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field Nama */}
            <div className="space-y-1.5">
              <label className="block text-sm text-slate-700 font-semibold ml-1">Nama Lengkap</label>
              <div className={`relative transition-all duration-300 ${isFocused === 'name' ? 'scale-[1.01]' : ''}`}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setIsFocused('name')}
                  onBlur={() => setIsFocused(null)}
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-slate-900 font-medium transition-all duration-300 ${
                    isFocused === 'name' 
                    ? 'border-red-600 shadow-lg shadow-red-100 bg-white' 
                    : 'border-slate-100 bg-slate-50/50'
                  }`}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            </div>

            {/* Field Email */}
            <div className="space-y-1.5">
              <label className="block text-sm text-slate-700 font-semibold ml-1">Email</label>
              <div className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.01]' : ''}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-slate-900 font-medium transition-all duration-300 ${
                    isFocused === 'email' 
                    ? 'border-red-600 shadow-lg shadow-red-100 bg-white' 
                    : 'border-slate-100 bg-slate-50/50'
                  }`}
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>
            
            {/* Field Password */}
            <div className="space-y-1.5">
              <label className="block text-sm text-slate-700 font-semibold ml-1">Password</label>
              <div className={`relative transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.01]' : ''}`}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-slate-900 font-medium transition-all duration-300 ${
                    isFocused === 'password' 
                    ? 'border-red-600 shadow-lg shadow-red-100 bg-white' 
                    : 'border-slate-100 bg-slate-50/50'
                  }`}
                  placeholder="Buat password minimal 6 karakter"
                  required
                />
              </div>
            </div>

            {/* Field Konfirmasi Password */}
            <div className="space-y-1.5">
              <label className="block text-sm text-slate-700 font-semibold ml-1">Konfirmasi Password</label>
              <div className={`relative transition-all duration-300 ${isFocused === 'conf' ? 'scale-[1.01]' : ''}`}>
                <input
                  type="password"
                  value={confPassword}
                  onChange={(e) => setConfPassword(e.target.value)}
                  onFocus={() => setIsFocused('conf')}
                  onBlur={() => setIsFocused(null)}
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-slate-900 font-medium transition-all duration-300 ${
                    isFocused === 'conf' 
                    ? 'border-red-600 shadow-lg shadow-red-100 bg-white' 
                    : 'border-slate-100 bg-slate-50/50'
                  }`}
                  placeholder="Ulangi password Anda"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 md:py-4 mt-2 rounded-xl font-bold text-white transition-all duration-300 shadow-lg ${
                isLoading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 shadow-red-200 active:scale-95'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="text-red-600 font-bold hover:text-red-700 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}