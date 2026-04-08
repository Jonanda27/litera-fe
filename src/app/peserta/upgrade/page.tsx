"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { API_BASE_URL } from "@/lib/constans/constans";

export default function UpgradePage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Load Script Snap Midtrans secara dinamis
    useEffect(() => {
        // Pastikan menggunakan Client Key yang benar di Dashboard Midtrans (Sandbox/Production)
        const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = process.env.MIDTRANS_CLIENT_KEY;

        let script = document.createElement("script");
        script.src = midtransScriptUrl;
        script.setAttribute("data-client-key", clientKey || "");
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const token = localStorage.getItem("token");

            // Request token ke backend Anda
            const response = await axios.post(
                `${API_BASE_URL}/payments/checkout`,
                {
                    orderId: `LITERA-PREM-${Date.now()}-${storedUser.id}`,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const snapToken = response.data.token;

            if (window.snap) {
                window.snap.pay(snapToken, {
                    onSuccess: function (result: any) {
                        alert("Pembayaran Berhasil!");
                        // Update local storage agar status jadi Aktif (Opsional, lebih baik relogin)
                        storedUser.status = "Aktif";
                        localStorage.setItem("user", JSON.stringify(storedUser));
                        window.location.href = "/peserta/dashboard";
                    },
                    onPending: function (result: any) {
                        alert("Menunggu pembayaran Anda.");
                    },
                    onError: function (result: any) {
                        alert("Pembayaran gagal.");
                    },
                    onClose: function () {
                        alert("Anda belum menyelesaikan pembayaran.");
                    },
                });
            }
        } catch (error: any) {
            alert("Gagal memproses pembayaran. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            {/* Script tag dari Next.js sebagai alternatif jika useEffect di atas tidak dipakai */}
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.MIDTRANS_CLIENT_KEY}
            />

            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">Aktivasi Akun</h1>
                <p className="text-slate-500 font-medium mb-8">
                    Akun Anda saat ini belum aktif. Silakan lakukan pembayaran satu kali untuk mengakses seluruh fitur dashboard.
                </p>

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Biaya Aktivasi</span>
                    <div className="text-4xl font-black text-slate-900 mt-1">Rp 150.000</div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-red-600/30 active:scale-95 disabled:bg-slate-300"
                >
                    {loading ? "PROSES..." : "BAYAR SEKARANG"}
                </button>

                <button
                    onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
                    className="mt-6 text-slate-400 font-bold text-sm hover:text-slate-600"
                >
                    Keluar dan Login Akun Lain
                </button>
            </div>
        </div>
    );
}