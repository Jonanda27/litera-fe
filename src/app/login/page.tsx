"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constans/constans";
import Cookies from "js-cookie";

export default function Login() {
  const router = useRouter();

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cek jika user sudah login
  useEffect(() => {
    const token = Cookies.get("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        redirectByRole(user.role, user.status);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const redirectByRole = (role: string, status: string) => {
    let targetPath = "/dashboard";
    const normalizedRole = role.toLowerCase();
    const normalizedStatus = status;

    if (normalizedRole === "mentor") {
      targetPath = "/mentor/dashboard";
    } else if (normalizedRole === "peserta") {
      if (normalizedStatus === "Non-Aktif") {
        targetPath = "/peserta/upgrade";
      } else {
        targetPath = "/peserta/dashboard";
      }
    } else if (normalizedRole === "admin" || normalizedRole === "administrator") {
      targetPath = "/admin/dashboard";
    }

    window.location.href = targetPath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email atau password salah");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      Cookies.set("token", data.token, { expires: 1, path: "/" });

      redirectByRole(data.user.role, data.user.status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden font-sans">
      {/* Background Ornaments - Selaras dengan Landing Page */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-orange-400/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation - Konsisten dengan Landing Page */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:rotate-6 transition-transform">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">LITERA</span>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/register" className="px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 rounded-xl transition-all">
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
            <Link href="/" className="font-bold text-slate-600">Beranda</Link>
            <Link href="/register" className="font-bold text-red-600">Daftar Akun Baru</Link>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20">

        {/* Breadcrumb - Subtle & Clean */}
        <div className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900">Login</span>
        </div>

        <div className="w-full max-w-[480px]">
          {/* Login Card */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white p-8 md:p-12 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden group">

            {/* Hover Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Selamat Datang.</h1>
                <p className="text-slate-500 font-medium">Masuk untuk melanjutkan perjalanan literasi Anda bersama 10K+ siswa lainnya.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-shake">
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Email</label>
                  <div className={`group relative transition-all duration-300 ${isFocused === 'email' ? 'translate-x-1' : ''}`}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused('email')}
                      onBlur={() => setIsFocused(null)}
                      className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none text-slate-900 font-bold transition-all ${isFocused === 'email' ? 'border-red-600 bg-white shadow-xl shadow-red-600/5' : 'border-transparent hover:bg-slate-100'
                        }`}
                      placeholder="Masukkan email Anda"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                    <Link href="#" className="text-xs font-bold text-red-600 hover:underline">Lupa Password?</Link>
                  </div>
                  <div className={`group relative transition-all duration-300 ${isFocused === 'password' ? 'translate-x-1' : ''}`}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused('password')}
                      onBlur={() => setIsFocused(null)}
                      className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none text-slate-900 font-bold transition-all ${isFocused === 'password' ? 'border-red-600 bg-white shadow-xl shadow-red-600/5' : 'border-transparent hover:bg-slate-100'
                        }`}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-5 rounded-[1.5rem] font-black text-lg text-white transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] ${isLoading ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-red-600 hover:bg-red-700 active:scale-[0.98] hover:shadow-red-600/40'
                    }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyambungkan...
                    </span>
                  ) : (
                    'Masuk ke Dashboard'
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-slate-500 font-medium">
                  Belum punya akun?{' '}
                  <Link href="/register" className="text-red-600 font-black hover:underline decoration-2 underline-offset-4">
                    Daftar Sekarang
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Footer Info */}
          <div className="mt-8 flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </main>
  );
}