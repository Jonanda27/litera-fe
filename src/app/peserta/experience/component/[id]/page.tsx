"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import JitsiMeeting from '@/app/peserta/experience/component/JitsiMeeting'; // Sesuaikan path ini
import { API_BASE_URL } from "../../../../../lib/constans/constans";

interface MeetingData {
    id: string;
    title: string;
    room_name: string;
    moderator_id: string | number;
    status: string;
    discussion: {
        id: string | number;
        owner_id: string | number;
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

    if (loading) return <div className="h-screen flex items-center justify-center font-bold">Menyiapkan Ruangan...</div>;
    if (!meeting) return <div className="h-screen flex items-center justify-center text-red-500">Ruang diskusi tidak ditemukan atau telah berakhir.</div>;

    // Cek apakah user yang sedang buka adalah moderatornya
    const isModerator = !!(
        user &&
        meeting?.discussion &&
        String(user.id) === String(meeting.discussion.owner_id)
    );

    const handleExit = async () => {
        if (isModerator) {
            const confirmEnd = window.confirm(
                "Anda adalah pemilik grup. Keluar akan mengakhiri diskusi ini untuk semua orang agar tidak bisa diakses lagi. Lanjutkan?"
            );

            if (confirmEnd) {
                try {
                    const token = localStorage.getItem('token');
                    // Panggil API End Meeting menggunakan ID Discussion
                    const res = await fetch(`${API_BASE_URL}/discussions/${meeting?.discussion.id}/end-meeting`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (res.ok) {
                        router.push('/peserta/experience');
                        return;
                    }
                } catch (err) {
                    console.error("Gagal mengakhiri meeting", err);
                }
            } else {
                return;
            }
        }

        // Jika hanya peserta biasa, cukup pindah halaman
        router.push('/peserta/experience');
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold">Menyiapkan Ruangan...</div>;
    if (!meeting) return <div className="h-screen flex items-center justify-center text-red-500">Ruang diskusi tidak ditemukan atau telah berakhir.</div>;

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

                {/* Interface Meeting Full Width */}
                <div className="bg-slate-900 p-1.5 rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden">
                    <div className="bg-black rounded-[26px] overflow-hidden h-[75vh] min-h-[600px] relative">
                        <JitsiMeeting
                            roomName={meeting.room_name}
                            userName={user?.name || "Anonymous"}
                            isModerator={!!isModerator}
                        />
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