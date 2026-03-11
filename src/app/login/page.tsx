"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constans/constans';

export default function Login() {
  const router = useRouter();
  
  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<string | null>(null);

  // Cek jika user sudah login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      redirectByRole(user.role);
    }
  }, []);

  const redirectByRole = (role: string) => {
    if (role === 'mentor') {
      router.push('/mentor/dashboard');
    } else if (role === 'user') {
      router.push('/peserta/dashboard');
    } else if (role === 'admin' || role === 'administrator') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email atau password salah');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      redirectByRole(data.user.role);
      router.refresh(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar - Konsisten dengan Register */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">LITERA</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Beranda</Link>
            <Link href="/exercise" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Latihan</Link>
            <Link href="/livesession" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Live Session</Link>
            <Link href="/experiment" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Eksperimen</Link>
            <Link href="/experience" className="text-slate-600 hover:text-red-600 font-medium transition-colors">Pengalaman</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-100">Masuk</Link>
            <Link href="/register" className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb Navigation - SEKARANG SAMA DENGAN REGISTER */}
      <div className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-400 hover:text-red-600 transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-medium">Masuk</span>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        <div 
          className="bg-white rounded-3xl p-8 w-full max-w-md transform transition-all duration-500 border border-slate-100 shadow-[0_20px_50px_rgba(220,_38,_38,_0.15)] hover:shadow-[0_20px_60px_rgba(220,_38,_38,_0.25)]"
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4 border border-red-100">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Selamat Datang</h1>
            <p className="text-slate-500 text-sm mt-1">Silakan masuk untuk melanjutkan belajar</p>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-xl animate-pulse">
                {error}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
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
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
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
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg ${
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
                  Memverifikasi...
                </span>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Belum punya akun? <Link href="/register" className="text-red-600 font-bold hover:text-red-700 transition-colors">Daftar Gratis</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}