"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import JitsiMeeting from '@/app/peserta/experience/JitsiMeeting'; // Sesuaikan path ini

interface MeetingData {
    id: string;
    title: string;
    room_name: string;
    moderator_id: string | number;
    status: string;
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
                // Pastikan port 4000 sesuai dengan backend Anda
                const response = await fetch(`http://localhost:4000/api/meetings/get-meeting/${meetingId}`);
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
    const isModerator = user && String(user.id) === String(meeting.moderator_id);

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
                        onClick={() => router.push('/peserta/experience')}
                        className="group flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl font-bold transition-all duration-300 border border-red-100 shadow-sm"
                    >
                        <span>Keluar Ruangan</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                {/* Interface Meeting Full Width */}
                <div className="bg-slate-900 p-1.5 rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden">
                    <div className="bg-black rounded-[26px] overflow-hidden h-[75vh] min-h-[600px] relative">
                        <JitsiMeeting
                            roomName={meeting.title}
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