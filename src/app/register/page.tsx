"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search, Phone } from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";
import Script from "next/script";

declare global {
  interface Window {
    snap: any;
  }
}

export default function Register() {
  const router = useRouter();

  // States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState(""); // State baru untuk No HP
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  
  // State untuk toggle lihat password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

  // Mentor States
  const [mentorId, setMentorId] = useState("");
  const [selectedMentorName, setSelectedMentorName] = useState("");
  const [mentors, setMentors] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mengambil daftar mentor saat halaman dimuat
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/mentors`);
        const result = await response.json();
        if (response.ok && result.success) {
          setMentors(result.data);
        }
      } catch (err) {
        console.error("Koneksi ke API Mentor gagal:", err);
      }
    };
    fetchMentors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validasi No HP sederhana (hanya angka)
    if (noHp && !/^\d+$/.test(noHp)) {
      setError("Nomor HP harus berupa angka saja!");
      setIsLoading(false);
      return;
    }

    if (!mentorId) {
      setError("Silakan pilih mentor pembimbing Anda!");
      setIsLoading(false);
      return;
    }

    if (password !== confPassword) {
      setError("Password dan Konfirmasi Password tidak cocok!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: name,
          email,
          no_hp: noHp,
          password,
          confPassword,
          mentor_id: mentorId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal");
      }

      const userToken = data.token;
      const userId = data.user.id;

      // Simpan sementara ke localStorage agar jika user refresh, session aman
      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // --- LANGKAH 3: REQUEST SNAP TOKEN PEMBAYARAN ---
      const payResponse = await fetch(`${API_BASE_URL}/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          orderId: `LITERA-REG-${Date.now()}-${userId}`,
        }),
      });

      const payData = await payResponse.json();

      if (!payResponse.ok) {
        // Jika gagal panggil payment, arahkan ke login saja (fallback)
        router.push("/login");
        return;
      }

      // --- LANGKAH 4: MUNCULKAN SNAP MIDTRANS ---
      if (window.snap) {
        window.snap.pay(payData.token, {
          onSuccess: function (result: any) {
            alert("Pembayaran Berhasil! Akun Anda telah aktif.");
            window.location.href = "/peserta/dashboard";
          },
          onPending: function (result: any) {
            alert("Silakan selesaikan pembayaran untuk mengaktifkan akun.");
            router.push("/login");
          },
          onError: function (result: any) {
            alert("Pembayaran gagal, silakan login dan coba lagi.");
            router.push("/login");
          },
          onClose: function () {
            alert("Anda belum mengaktifkan akun. Silakan login untuk membayar nanti.");
            router.push("/login");
          },
        });
      }

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  const handleSelectMentor = (mentor: any) => {
    setMentorId(mentor.id);
    setSelectedMentorName(mentor.nama);
    setIsDropdownOpen(false);
    setIsFocused(null);
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden font-sans">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.MIDTRANS_CLIENT_KEY}
      />
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[5%] -right-[5%] w-[35%] h-[35%] bg-red-600/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-[40%] -left-[10%] w-[25%] h-[25%] bg-orange-400/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:rotate-6 transition-transform">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">LITERA</span>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="px-6 py-2.5 text-slate-700 text-sm font-bold hover:bg-slate-50 rounded-xl transition-all">
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-28 pb-12">
        <div className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
          <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900">Pendaftaran</span>
        </div>

        <div className="w-full max-w-[520px]">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white p-8 md:p-10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden group">

            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-600/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Daftar Akun.</h1>
                <p className="text-slate-500 font-medium">Bergabunglah dan mulai asah nalar kritis Anda bersama mentor ahli kami.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-shake">
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setIsFocused('name')}
                    onBlur={() => setIsFocused(null)}
                    className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none text-slate-900 font-bold transition-all ${isFocused === 'name' ? 'border-red-600 bg-white shadow-xl shadow-red-600/5 translate-x-1' : 'border-transparent hover:bg-slate-100'
                      }`}
                    placeholder="Nama lengkap"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused('email')}
                      onBlur={() => setIsFocused(null)}
                      className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none text-slate-900 font-bold transition-all ${isFocused === 'email' ? 'border-red-600 bg-white shadow-xl shadow-red-600/5' : 'border-transparent hover:bg-slate-100'
                        }`}
                      placeholder="email@contoh.com"
                      required
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">No. WhatsApp</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={noHp}
                        onChange={(e) => setNoHp(e.target.value)}
                        onFocus={() => setIsFocused('no_hp')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none text-slate-900 font-bold transition-all ${isFocused === 'no_hp' ? 'border-red-600 bg-white shadow-xl shadow-red-600/5' : 'border-transparent hover:bg-slate-100'
                          }`}
                        placeholder="0812..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* DROPDOWN MENTOR */}
                <div className="space-y-2" ref={dropdownRef}>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Pilih Mentor Pembimbing</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen);
                        setIsFocused(isDropdownOpen ? null : 'mentor');
                      }}
                      className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none text-left transition-all flex justify-between items-center ${isFocused === 'mentor' ? 'border-red-600 bg-white shadow-xl shadow-red-600/5' : 'border-transparent hover:bg-slate-100'
                        }`}
                    >
                      <span className={`font-bold ${selectedMentorName ? 'text-slate-900' : 'text-slate-400'}`}>
                        {selectedMentorName || "Pilih mentor pembimbing..."}
                      </span>
                      <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-[100] w-full mt-2 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl overflow-hidden"
                        >
                          <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {mentors.length > 0 ? (
                              mentors.map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => handleSelectMentor(m)}
                                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group ${mentorId === m.id ? 'bg-red-50' : 'hover:bg-slate-50'
                                    }`}
                                >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${mentorId === m.id ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-red-100 group-hover:text-red-600'
                                    }`}>
                                    {m.nama?.charAt(0).toUpperCase() || 'M'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-black uppercase tracking-tight truncate ${mentorId === m.id ? 'text-red-600' : 'text-slate-700'}`}>
                                      {m.nama}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                      {m.spesialisasi || "Mentor Ahli"}
                                    </p>
                                  </div>
                                  {mentorId === m.id && (
                                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shrink-0">
                                      <Check size={14} className="text-white" />
                                    </div>
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="p-8 text-center">
                                <Search size={24} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-xs font-bold text-slate-400 uppercase">Mentor tidak tersedia</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsFocused('pass')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full pl-6 pr-14 py-4 bg-slate-50 border-2 rounded-2xl outline-none text-slate-900 font-bold transition-all ${isFocused === 'pass' ? 'border-red-600 bg-white shadow-xl shadow-red-600/5' : 'border-transparent hover:bg-slate-100'
                          }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Konfirmasi</label>
                    <div className="relative">
                      <input
                        type={showConfPassword ? "text" : "password"}
                        value={confPassword}
                        onChange={(e) => setConfPassword(e.target.value)}
                        onFocus={() => setIsFocused('conf')}
                        onBlur={() => setIsFocused(null)}
                        className={`w-full pl-6 pr-14 py-4 bg-slate-50 border-2 rounded-2xl outline-none text-slate-900 font-bold transition-all ${isFocused === 'conf' ? 'border-red-600 bg-white shadow-xl shadow-red-600/5' : 'border-transparent hover:bg-slate-100'
                          }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfPassword(!showConfPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      >
                        {showConfPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
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
                        Memproses...
                      </span>
                    ) : (
                      'Daftar Sekarang'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-500 font-medium">
                  Sudah memiliki akun?{' '}
                  <Link href="/login" className="text-red-600 font-black hover:underline decoration-2 underline-offset-4">
                    Masuk di sini
                  </Link>
                </p>
              </div>
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
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}