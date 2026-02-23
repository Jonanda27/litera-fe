"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar - Same as Landing Page */}
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

      {/* Breadcrumb Navigation */}
      <div className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-blue-900 transition-colors">
              Home
            </Link>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-800 font-medium">Login</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        {/* Login Card with Animation */}
        <div 
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 hover:scale-[1.02] border border-slate-100"
          style={{ 
            animation: 'slideUp 0.6s ease-out forwards',
            opacity: 0,
            transform: 'translateY(20px)'
          }}
        >
          <style jsx>{`
            @keyframes slideUp {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-900">Masuk ke LITERA</h1>
            <p className="text-slate-500 text-sm mt-1">Selamat datang kembali!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium ml-1">Email</label>
              <div className={`relative transition-all duration-300 transform ${isFocused === 'email' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isFocused === 'email' ? 'text-blue-500' : 'text-slate-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                  className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl transition-all duration-300 outline-none ${
                    isFocused === 'email' 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50/50' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium ml-1">Password</label>
              <div className={`relative transition-all duration-300 transform ${isFocused === 'password' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isFocused === 'password' ? 'text-blue-500' : 'text-slate-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                  className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl transition-all duration-300 outline-none ${
                    isFocused === 'password' 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50/50' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  placeholder="Masukkan password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                isLoading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memasuki...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              Lupa password?
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
