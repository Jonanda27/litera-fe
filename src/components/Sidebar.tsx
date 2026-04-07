"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "./Navbar";

interface SidebarProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  isPending?: boolean;
  isSpecial?: boolean; // Tambahan untuk styling khusus (Get Premium)
}

export default function Sidebar({ children }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [rolePrefix, setRolePrefix] = useState("peserta");
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === "mentor") {
          setRolePrefix("mentor");
        } else if (user.role === "administrator" || user.role === "admin") {
          setRolePrefix("admin");
        } else {
          setRolePrefix("peserta");
        }
      } catch (e) {
        console.error("Gagal parse data user", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getMenuItems = (): MenuItem[] => {
    if (rolePrefix === "admin") {
      return [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/users", label: "Manajemen Akun" },
        { path: "/livesession", label: "Atur Live Session" },
        { path: "/exercise", label: "Manajemen Modul" },
        { path: "/log-mentor", label: "Log Mentor" },
      ];
    }

    if (rolePrefix === "mentor") {
      return [
        { path: "/dashboard", label: "Dashboard Ringkasan" },
        { path: "/feedback-proyek", label: "Antrean Feedback (SLA)" },
        { path: "/daftar-peserta", label: "Monitoring Peserta" },
        { path: "/profile", label: "Profil Saya", isPending: true },
      ];
    }

    // Role Peserta
    return [
      { path: "/dashboard", label: "Dashboard" },
      // [BARU] Menu Get Premium diletakkan di posisi strategis
      { path: "/get-premium", label: "⭐ Get Premium", isSpecial: true }, 
      { path: "/exercise", label: "Exercise" },
      { path: "/experience", label: "Experience" },
      { path: "/experiment", label: "Experiment" },
      { path: "/livesession", label: "Live Session" },
      { path: "/sertifikat", label: "Sertifikasi" },
      { path: "/tools", label: "Tools Pendukung" },
      { path: "/e-book", label: "E-book" },
      { path: "/riwayat", label: "Riwayat Kegiatan", isPending: true },
      { path: "/pengaturan", label: "Pengaturan", isPending: true },
      { path: "/mentor", label: "Kontak Mentor Kamu", isPending: false },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <main className="min-h-screen bg-[#f8fafc] relative overflow-x-hidden">
      <Navbar />

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-20 h-[calc(100vh-80px)] bg-[#C31A26] transition-all duration-300 z-40 ${
          sidebarOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full lg:w-0 lg:translate-x-0"
        }`}
      >
        <div className="py-8 px-4 flex flex-col gap-2 overflow-y-auto h-full">
          {menuItems.map((item) => {
            if (item.isPending) {
              return (
                <div
                  key={item.path}
                  className="px-4 py-3 md:py-2 rounded-lg font-bold text-sm text-white/40 cursor-not-allowed flex items-center justify-between"
                  title="Segera Hadir"
                >
                  {item.label}
                </div>
              );
            }

            const fullHref = `/${rolePrefix}${item.path}`;
            const isActive = pathname === fullHref;

            return (
              <Link
                key={fullHref}
                href={fullHref}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`px-4 py-3 md:py-2 rounded-lg transition-all duration-200 font-bold text-sm flex items-center gap-2 ${
                  item.isSpecial 
                    ? "bg-yellow-400 text-[#C31A26] hover:bg-yellow-300 shadow-lg mb-2 animate-pulse" // Style khusus Premium
                    : isActive
                      ? "bg-white text-[#C31A26]"
                      : "text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Button toggle sidebar tetap sama */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-24 bg-white border border-slate-200 rounded-r-lg p-2 z-50 shadow-md transition-all duration-300 ${
          sidebarOpen ? "left-64" : "left-0"
        }`}
      >
        <svg
          className={`w-4 h-4 text-slate-600 transition-transform ${
            sidebarOpen ? "rotate-0" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
          />
        </svg>
      </button>

      <div
        className={`pt-20 transition-all duration-300 min-h-screen ${
          sidebarOpen && !isMobile ? "lg:ml-64" : "ml-0"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </div>
    </main>
  );
}