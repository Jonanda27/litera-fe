"use client";

import { useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar"; // Sesuaikan path import sidebar Anda
import { API_BASE_URL } from "@/lib/constans/constans"; // Sesuaikan path import konstanta Anda

// Deklarasi Window untuk Midtrans Snap
declare global {
  interface Window {
    snap: any;
  }
}

export default function GetPremiumPage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      // 1. Request Token Transaksi ke Backend
      const response = await axios.post(
        `${API_BASE_URL}/payments/checkout`,
        {
          orderId: `LITERA-PREM-${Date.now()}`,
          amount: 150000,
          itemDetails: [
            {
              id: "PREM-01",
              price: 150000,
              quantity: 1,
              name: "Keanggotaan Litera Premium",
            },
          ],
          customerDetails: {
            nama: storedUser.nama || "User Litera",
            email: storedUser.email || "user@mail.com",
            no_hp: storedUser.no_hp || "08123456789",
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const snapToken = response.data.token;

      // 2. Jalankan Midtrans Snap
      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: function (result: any) {
            alert("Pembayaran Berhasil! Akun Anda segera diperbarui.");
            window.location.href = "/peserta/dashboard";
          },
          onPending: function (result: any) {
            alert("Selesaikan pembayaran Anda segera.");
          },
          onError: function (result: any) {
            alert("Terjadi kesalahan pada sistem pembayaran.");
          },
          onClose: function () {
            alert("Jendela pembayaran ditutup.");
          },
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          {/* Hero Section */}
          <div className="bg-[#C31A26] p-10 text-center text-white">
            <div className="inline-block bg-yellow-400 text-[#C31A26] px-4 py-1 rounded-full text-xs font-black mb-4 uppercase tracking-widest">
              Exclusive Offer
            </div>
            <h1 className="text-4xl font-extrabold mb-3 italic tracking-tight">UPGRADE KE PREMIUM</h1>
            <p className="text-red-100 text-lg">Investasi terbaik untuk masa depan literasimu.</p>
          </div>

          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12 items-center">
            {/* Features */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-slate-800 tracking-tight">Fitur Unggulan Premium:</h2>
              <div className="space-y-4">
                {[
                  "Akses Seluruh Modul & E-Book",
                  "Feedback Prioritas dari Mentor",
                  "Sertifikat Digital Resmi",
                  "Akses Live Session Tanpa Batas",
                  "Konsultasi Langsung via Chat",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1 shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-600 font-semibold">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center shadow-inner">
              <p className="text-slate-400 font-bold uppercase text-xs mb-2">Total Investasi</p>
              <div className="flex justify-center items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-slate-800">Rp</span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter">150.000</span>
              </div>
              <p className="text-slate-400 text-sm mb-8 italic font-medium">Sekali bayar, akses selamanya</p>

              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-xl ${
                  loading 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                  : "bg-yellow-400 text-[#C31A26] hover:bg-yellow-500 hover:shadow-yellow-200 active:scale-95"
                }`}
              >
                {loading ? "MENGHUBUNGKAN..." : "BELI SEKARANG"}
              </button>
              
              <div className="mt-6 flex flex-col items-center gap-2 opacity-50">
                <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                  Secure Checkout via Midtrans
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}