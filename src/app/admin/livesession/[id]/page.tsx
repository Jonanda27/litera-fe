"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, Radio, StopCircle, ShieldCheck, Layout, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { API_BASE_URL } from "@/lib/constans/constans";
import { useMeetingContext } from '@/lib/constans/context/MeetingContext';

interface LiveSessionData {
    id: string;
    title: string;
    room_name: string;
    status: string;
    speaker_name: string;
    stream_key: string;
}

export default function AdminLiveStudio() {
    const { id } = useParams();
    const router = useRouter();

    // <-- MENGAMBIL FUNGSI DARI CONTEXT GLOBAL -->
    const { startMeeting, endMeeting, activeMeeting, toggleMinimize } = useMeetingContext();

    const [session, setSession] = useState<LiveSessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: any, nama: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchSessionDetail = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/live-session/detail/${id}`);
                const result = await response.json();
                if (result.success) {
                    setSession(result.data);
                }
            } catch (error) {
                console.error("Gagal memuat sesi:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSessionDetail();
    }, [id]);

    const handleEndSession = async () => {
        const confirmEnd = window.confirm("Akhiri siaran ini sekarang? Sesi akan ditutup untuk semua peserta.");

        if (confirmEnd) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/live-session/end-live/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    endMeeting(); // Matikan Jitsi Global
                    router.push('/admin/livesession');
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Fungsi untuk memicu Siaran (Jitsi global)
    const handleStartBroadcast = () => {
        if (!session || !user) return;

        startMeeting({
            roomName: session.room_name,
            userName: user.nama || "Admin Studio",
            isModerator: true,
            title: session.title,
            streamKey: session.stream_key,
            type: 'live'
        });
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 font-black italic text-[#c31a26] animate-pulse uppercase tracking-widest">
            Initializing Studio...
        </div>
    );

    if (!session) return <div className="p-20 text-center font-black">Sesi tidak ditemukan.</div>;

    // Cek apakah studio ini yang sedang aktif di context
    const isCurrentlyStreaming = activeMeeting?.roomName === session.room_name;

    return (
        <Sidebar>
            <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 space-y-6">

                {/* --- STUDIO HEADER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white border-4 border-slate-900 p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-5 text-center lg:text-left">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${isCurrentlyStreaming ? 'bg-red-600 animate-pulse' : 'bg-slate-800'}`}>
                            <Radio size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{session.title}</h1>
                            <div className="flex items-center justify-center lg:justify-start gap-3 mt-2">
                                <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                                    <ShieldCheck size={12} className="text-green-500" /> Studio Mode
                                </span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase italic">Speaker: {session.speaker_name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/admin/livesession')}
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-black uppercase text-[10px] transition-all"
                        >
                            Back to Manager
                        </button>
                        <button
                            onClick={handleEndSession}
                            className="px-6 py-3 bg-red-600 hover:bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex items-center gap-2"
                        >
                            <StopCircle size={16} /> End Session
                        </button>
                    </div>
                </div>

                {/* --- MAIN BROADCAST AREA --- */}
                <div className="grid lg:grid-cols-12 gap-6 h-[70vh] min-h-[550px]">

                    {/* CONTROL PANEL (VIDEO REPLACEMENT) */}
                    <div className="lg:col-span-9 bg-slate-900 p-1.5 rounded-[32px] border-4 border-slate-900 shadow-2xl overflow-hidden">
                        <div className="bg-black rounded-[26px] overflow-hidden h-full relative flex flex-col items-center justify-center">

                            {!isCurrentlyStreaming ? (
                                <div className="text-center flex flex-col items-center z-10 p-10">
                                    <div className="w-24 h-24 bg-[#c31a26]/20 rounded-full flex items-center justify-center mb-6">
                                        <div className="w-16 h-16 bg-[#c31a26] rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/50">
                                            <Video size={32} />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Siap untuk On-Air?</h2>
                                    <p className="text-slate-400 mb-8 max-w-md font-medium uppercase text-xs tracking-widest">
                                        Klik tombol di bawah untuk membuka studio broadcast. Anda bisa meminimalkan layar ini untuk mengelola fitur admin lainnya.
                                    </p>
                                    <button
                                        onClick={handleStartBroadcast}
                                        className="px-10 py-4 bg-[#c31a26] hover:bg-red-700 text-white rounded-2xl font-black shadow-xl transition-all shadow-red-900/50 uppercase tracking-[0.2em] text-sm"
                                    >
                                        Buka Studio Produksi
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center flex flex-col items-center z-10 p-10">
                                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/50">
                                            <Radio size={32} />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Status: Live Broadcaster</h2>
                                    <p className="text-slate-400 mb-8 max-w-md font-medium uppercase text-[10px] tracking-[0.2em]">
                                        Siaran sedang berjalan melayang. Gunakan kontrol di bawah untuk mengatur tampilan jendela studio Anda.
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => toggleMinimize(false)}
                                            className="flex items-center gap-3 px-8 py-4 bg-[#1e4e8c] hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl transition-all uppercase tracking-widest text-xs"
                                        >
                                            <Maximize2 size={18} /> Perbesar Studio
                                        </button>
                                        <button
                                            onClick={() => toggleMinimize(true)}
                                            className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black shadow-xl border border-slate-700 transition-all uppercase tracking-widest text-xs"
                                        >
                                            <Minimize2 size={18} /> Perkecil Layar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                        </div>
                    </div>

                    {/* SIDEBAR INFO */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4">Stream Key Config</h3>
                            <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-100 font-mono text-[11px] text-slate-500 truncate mb-4">
                                {session.stream_key}
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
                                Key ini digunakan otomatis saat Anda menekan tombol "Start Streaming" di dalam Studio.
                            </p>
                        </div>

                        <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] flex-1">
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4">Quick Tips</h3>
                            <ul className="space-y-4 text-[9px] font-bold uppercase leading-relaxed text-slate-300">
                                <li>1. Pastikan koneksi internet stabil (Min 5Mbps upload).</li>
                                <li>2. Minimalkan layar jika ingin memantau daftar hadir peserta.</li>
                                <li>3. Jangan tutup browser selama siaran berlangsung.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}