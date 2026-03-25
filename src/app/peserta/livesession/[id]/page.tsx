"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, Radio, User, Calendar, ArrowLeft, Play, Maximize2, Minimize2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { API_BASE_URL } from "@/lib/constans/constans";
import { useMeetingContext } from '@/lib/constans/context/MeetingContext';

interface LiveSessionData {
    id: string;
    title: string;
    room_name: string;
    status: 'active' | 'scheduled' | 'ended';
    speaker_name: string;
    description: string;
    poster_url: string;
    scheduled_at: string;
}

export default function ParticipantLiveView() {
    const { id } = useParams();
    const router = useRouter();

    // Ambil fungsi dari Context Global
    const { startMeeting, activeMeeting, toggleMinimize } = useMeetingContext();

    const [session, setSession] = useState<LiveSessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: any, nama: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchDetail = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/live-session/detail/${id}`);
                const result = await response.json();
                if (result.success) {
                    setSession(result.data);
                }
            } catch (error) {
                console.error("Gagal memuat detail live:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    const handleJoinLive = () => {
        if (!session || !user) return;

        startMeeting({
            roomName: session.room_name,
            userName: user.nama || "Peserta",
            isModerator: false, // Peserta bukan moderator
            title: session.title,
            type: 'live' // Identifikasi tipe live broadcast
        });
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center font-black text-[#1e4e8c] animate-pulse uppercase tracking-widest">
            Menyiapkan Sesi Live...
        </div>
    );

    if (!session) return <div className="p-20 text-center font-black uppercase">Sesi tidak ditemukan.</div>;

    const isCurrentlyWatching = activeMeeting?.roomName === session.room_name;

    return (
        <Sidebar>
            <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-8">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <button
                        onClick={() => router.push('/peserta/livesession')}
                        className="flex items-center gap-2 text-slate-400 font-black hover:text-slate-900 transition-all text-[10px] uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Kembali ke Jadwal
                    </button>

                    <div className="flex items-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border-2 ${session.status === 'active' ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                            {session.status === 'active' ? '● Live Now' : 'Scheduled'}
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* --- KIRI: PLAYER CONTROL PANEL --- */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-slate-900 p-1.5 rounded-[32px] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(30,78,140,0.1)] overflow-hidden aspect-video">
                            <div className="bg-black rounded-[26px] overflow-hidden h-full relative flex flex-col items-center justify-center border-2 border-slate-800">

                                {!isCurrentlyWatching ? (
                                    <div className="text-center p-8 z-10">
                                        {/* Tampilan Poster Sebelum Gabung */}
                                        <div className="absolute inset-0 opacity-30 grayscale blur-sm">
                                            <img src={`${API_BASE_URL}${session.poster_url}`} className="w-full h-full object-cover" alt="" />
                                        </div>

                                        <div className="relative">
                                            <div className="w-20 h-20 bg-white border-4 border-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_0px_rgba(195,26,38,1)]">
                                                <Play size={32} className="text-[#c31a26] ml-1" />
                                            </div>
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                                                {session.status === 'active' ? "Sesi Live Telah Dimulai" : "Sesi Belum Dimulai"}
                                            </h2>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                                                {session.status === 'active'
                                                    ? "Klik tombol di bawah untuk bergabung menonton siaran."
                                                    : `Siaran dijadwalkan pada ${session.scheduled_at}`}
                                            </p>

                                            {session.status === 'active' && (
                                                <button
                                                    onClick={handleJoinLive}
                                                    className="px-10 py-4 bg-[#c31a26] text-white rounded-2xl font-black shadow-xl hover:bg-red-700 transition-all uppercase tracking-[0.2em] text-xs border-2 border-slate-900"
                                                >
                                                    Gabung Siaran Sekarang
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 z-10">
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                            <Video size={32} className="text-green-500" />
                                        </div>
                                        <h2 className="text-xl font-black text-white uppercase italic">Streaming Aktif</h2>
                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={() => toggleMinimize(false)}
                                                className="flex items-center gap-2 px-6 py-3 bg-[#1e4e8c] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                            >
                                                <Maximize2 size={14} /> Full Screen
                                            </button>
                                            <button
                                                onClick={() => toggleMinimize(true)}
                                                className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-700"
                                            >
                                                <Minimize2 size={14} /> Minimize
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                            </div>
                        </div>

                        {/* Deskripsi Materi */}
                        <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Informasi Pemaparan</h3>
                            <p className="text-slate-700 font-bold leading-relaxed">
                                {session.description || "Tidak ada deskripsi untuk sesi ini."}
                            </p>
                        </div>
                    </div>

                    {/* --- KANAN: SIDEBAR INFO --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Speaker Card */}
                        <div className="bg-[#1e4e8c] text-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(30,78,140,0.1)]">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white rounded-3xl border-4 border-slate-900 overflow-hidden mb-4 rotate-3 shadow-lg">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${session.speaker_name}&background=random`}
                                        className="w-full h-full object-cover"
                                        alt={session.speaker_name}
                                    />
                                </div>
                                <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Narasumber Utama</h4>
                                <h2 className="text-xl font-black uppercase italic tracking-tighter">{session.speaker_name}</h2>
                            </div>

                            <div className="mt-8 space-y-4 pt-6 border-t border-blue-800">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-blue-300" size={18} />
                                    <div>
                                        <p className="text-[9px] font-black text-blue-300 uppercase">Jadwal Siaran</p>
                                        <p className="text-[11px] font-bold uppercase">{session.scheduled_at}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Banner Iklan/Info */}
                        <div className="bg-amber-400 border-4 border-slate-900 rounded-[2.5rem] p-6 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="font-black text-slate-900 uppercase italic leading-tight mb-2">Gunakan Earphone!</h4>
                                <p className="text-[10px] font-bold text-slate-800 uppercase leading-relaxed">
                                    Untuk kualitas suara maksimal selama pemaparan materi berlangsung.
                                </p>
                            </div>
                            <Video className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-900 opacity-10 group-hover:rotate-12 transition-transform" />
                        </div>

                    </div>
                </div>
            </div>
        </Sidebar>
    );
}