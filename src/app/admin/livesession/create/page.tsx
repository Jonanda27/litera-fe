"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Calendar, Clock, User, Video, FileText, ArrowLeft, Send } from 'lucide-react';
import { API_BASE_URL } from "@/lib/constans/constans";

export default function AdminScheduleLive() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        speaker_name: "",
        scheduled_date: "",
        scheduled_time: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/meetings/schedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    is_public: true, // Semua orang bisa lihat
                    status: 'scheduled' // Status awal adalah terjadwal
                }),
            });

            if (response.ok) {
                alert("Sesi Live Berhasil Dijadwalkan!");
                router.push("/admin/live-sessions");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sidebar>
            <div className="max-w-4xl mx-auto py-10 px-6">
                {/* Tombol Kembali */}
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-slate-900 transition-all text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} /> Kembali ke Daftar
                </button>

                <div className="bg-white rounded-[3rem] border-4 border-slate-900 overflow-hidden shadow-[16px_16px_0px_0px_rgba(15,23,42,1)]">
                    <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">Publish New Live</h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sesi Terbuka Untuk Seluruh Peserta</p>
                        </div>
                        <div className="w-16 h-16 bg-[#c31a26] rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
                            <Video size={32} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Judul & Deskripsi (Full Width) */}
                        <div className="md:col-span-2 space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Informasi Utama</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 text-slate-300" size={20} />
                                <input
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] outline-none font-bold text-slate-800"
                                    placeholder="Judul Live Session (Contoh: Masterclass Public Speaking)"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <textarea
                                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] outline-none font-bold text-slate-800 min-h-[120px]"
                                placeholder="Deskripsi pemaparan pembicara..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Pembicara */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pembicara / Narasumber</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] outline-none font-bold text-slate-800"
                                    placeholder="Nama Pembicara"
                                    value={formData.speaker_name}
                                    onChange={(e) => setFormData({ ...formData, speaker_name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Waktu & Tanggal */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] outline-none font-bold text-slate-800"
                                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jam</label>
                                <input
                                    type="time"
                                    required
                                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] outline-none font-bold text-slate-800"
                                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="md:col-span-2 py-5 bg-[#c31a26] hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                        >
                            {loading ? "Menerbitkan..." : <><Send size={18} /> Publikasikan Jadwal Live</>}
                        </button>
                    </form>
                </div>
            </div>
        </Sidebar>
    );
}