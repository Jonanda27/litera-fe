"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video } from 'lucide-react'; // <-- Import icon tambahan
import Sidebar from '@/components/Sidebar';
import { API_BASE_URL } from "../../../../../lib/constans/constans";
import { useMeetingContext } from '@/lib/constans/context/MeetingContext';
// PASTIKAN PATH INI SESUAI DENGAN LOKASI FILE CONTEXT KAMU:

interface MeetingData {
    id: string;
    title: string;
    room_name: string;
    status: string;
    Discussion: {
        id: string | number;
        owner_id: number;
        name: string;
    };
}

export default function MeetingRoomPage() {
    const params = useParams();
    const router = useRouter();
    const meetingId = params.id;

    const [meeting, setMeeting] = useState<MeetingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: any, name: string } | null>(null);

    // <-- MENGAMBIL FUNGSI DARI CONTEXT GLOBAL -->
    const { startMeeting, endMeeting, activeMeeting, toggleMinimize } = useMeetingContext();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser({ id: 'guest', name: 'Guest User' });
        }

        const fetchMeetingDetail = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/meetings/get-meeting/${meetingId}`);
                const result = await response.json();

                if (response.ok && result.data) {
                    setMeeting(result.data);
                } else {
                    console.error("Meeting tidak ditemukan");
                }
            } catch (error) {
                console.error("Error fetching meeting:", error);
            } finally {
                setLoading(false);
            }
        };

        if (meetingId) fetchMeetingDetail();
    }, [meetingId]);

    const isModerator = !!(
        user &&
        meeting?.Discussion &&
        String(user.id) === String(meeting.Discussion.owner_id)
    );

    useEffect(() => {
        if (user && meeting) {
            console.log("User ID:", user.id, "Type:", typeof user.id);
            console.log("Owner ID:", meeting.Discussion?.owner_id, "Type:", typeof meeting.Discussion?.owner_id);
            console.log("Is Moderator?", String(user.id) === String(meeting.Discussion?.owner_id));
        }
    }, [user, meeting]);

    const handleExit = async () => {
        console.log("Tombol Exit diklik. Status isModerator:", isModerator);

        if (isModerator) {
            const confirmEnd = window.confirm(
                "Anda adalah pemilik grup. Keluar akan mengakhiri diskusi ini untuk semua orang agar tidak bisa diakses lagi. Lanjutkan?"
            );

            if (confirmEnd) {
                try {
                    const token = localStorage.getItem('token');
                    console.log("Mengirim request PATCH ke backend...");
                    const res = await fetch(`${API_BASE_URL}/meetings/discussions/${meeting?.Discussion.id}/end-meeting`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (res.ok) {
                        endMeeting(); // <-- Menutup Jitsi global saat moderator mengakhiri meeting
                        router.push('/peserta/experience');
                        return;
                    }
                } catch (err) {
                    console.error("Gagal mengakhiri meeting", err);
                }
            } else {
                return;
            }
        } else {
            // Jika hanya peserta biasa, matikan jitsi dan pindah halaman
            endMeeting();
            router.push('/peserta/experience');
        }
    };

    // Fungsi untuk memicu Jitsi global
    const handleJoinGlobalMeeting = () => {
        if (!meeting || !user) return;

        startMeeting({
            roomName: meeting.room_name,
            userName: user.name || "Anonymous",
            isModerator: isModerator,
            title: meeting.title,
            discussionId: meeting.Discussion.id,
            type: 'discussion'
        });
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold">Menyiapkan Ruangan...</div>;
    if (!meeting) return <div className="h-screen flex items-center justify-center text-red-500">Ruang diskusi tidak ditemukan atau telah berakhir.</div>;

    // Pengecekan apakah user sedang membuka jendela meeting untuk ID ini
    const isCurrentlyInThisMeeting = activeMeeting?.roomName === meeting.room_name;

    return (
        <Sidebar>
            <div className="max-w-[1400px] mx-auto space-y-6">
                {/* Header Ruangan */}
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{meeting.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-slate-500 text-sm font-medium">Sesi Diskusi Aktif • ID: {meeting.id}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleExit}
                        className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg ${isModerator
                            ? "bg-[#c31a26] text-white hover:bg-red-700 shadow-red-100"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                            }`}
                    >
                        {isModerator ? "Akhiri Sesi (Owner)" : "Keluar Ruangan"}
                    </button>
                </div>

                {/* Panel Kontrol Meeting */}
                <div className="bg-slate-900 p-1.5 rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden">
                    <div className="bg-black rounded-[26px] overflow-hidden h-[75vh] min-h-[600px] relative flex flex-col items-center justify-center">

                        {!isCurrentlyInThisMeeting ? (
                            // Tampilan jika pengguna belum mengklik Join
                            <div className="text-center flex flex-col items-center z-10">
                                <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/50">
                                        <Video size={32} />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Siap Bergabung?</h2>
                                <p className="text-slate-400 mb-8 max-w-md font-medium">
                                    Klik tombol di bawah untuk masuk ke ruang video. Sesi ini akan tetap berjalan melayang meskipun Anda berpindah halaman.
                                </p>
                                <button
                                    onClick={handleJoinGlobalMeeting}
                                    className="px-10 py-4 bg-[#c31a26] hover:bg-red-700 text-white rounded-2xl font-black shadow-xl transition-all shadow-red-900/50 uppercase tracking-widest"
                                >
                                    Mulai Video Sesi
                                </button>
                            </div>
                        ) : (
                            // Tampilan Panel jika Jitsi sedang aktif
                            <div className="text-center flex flex-col items-center z-10">
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/50">
                                        <Video size={32} />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Anda Terhubung</h2>
                                <p className="text-slate-400 mb-8 max-w-md font-medium">
                                    Video sedang berjalan. Anda bebas membuka halaman modul lain tanpa terputus.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => toggleMinimize(false)}
                                        className="px-8 py-4 bg-[#1e4e8c] hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl transition-all uppercase tracking-widest"
                                    >
                                        Buka Layar Penuh
                                    </button>
                                    <button
                                        onClick={() => toggleMinimize(true)}
                                        className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black shadow-xl border border-slate-700 transition-all uppercase tracking-widest"
                                    >
                                        Perkecil ke Sudut
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Efek visual titik-titik (Background Pattern) */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                    </div>
                </div>

                {/* Info Footer Sederhana */}
                <div className="flex justify-center">
                    <p className="text-slate-400 text-xs font-medium bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                        Terhubung dengan server Jitsi Secure Video
                    </p>
                </div>
            </div>
        </Sidebar>
    );
}