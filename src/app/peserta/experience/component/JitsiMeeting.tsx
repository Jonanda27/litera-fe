"use client";
import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import { API_BASE_URL } from '@/lib/constans/constans';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

interface JitsiMeetingProps {
    roomName: string;
    userName: string;
    isModerator: boolean;
}

const JitsiMeeting = ({ roomName, userName, isModerator }: JitsiMeetingProps) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);

    const startMeeting = () => {
        if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
            const domain = "meet.jit.si";
            const options = {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: userName
                },
                configOverwrite: {
                    prejoinPageEnabled: false,
                    startWithAudioMuted: true,
                    disableInviteFunctions: true,
                    enableWelcomePage: false,
                    disableDeepLinking: true,

                    disableRemoteMute: !isModerator,
                    remoteVideoMenu: {
                        disableKick: !isModerator,
                    },
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_REMOTE_DISPLAY_NAME: 'Peserta',
                    // Anda bisa kustomisasi tombol yang muncul di sini
                    TOOLBAR_BUTTONS: isModerator
                        ? [
                            'microphone', 'camera', 'desktop', 'fullscreen', 'chat', 'settings',
                            'hangup', 'videoquality', 'tileview', 'mute-everyone', 'security'
                        ]
                        : [
                            'microphone', 'camera', 'desktop', 'fullscreen', 'chat', 'settings',
                            'hangup', 'videoquality', 'tileview', 'raisehand'
                        ],
                }
            };
            apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

            apiRef.current.addEventListeners({
                videoConferenceLeft: async () => {
                    if (isModerator) {
                        console.log("Moderator keluar, mengakhiri meeting di sistem...");
                        await handleEndMeeting();
                    }
                },
                // Jika Moderator menekan tombol merah, Jitsi akan menutup Iframe
                readyToClose: async () => {
                    if (isModerator) {
                        await handleEndMeeting();
                    }
                }
            });
        }
    };

    const handleEndMeeting = async () => {
    try {
        const token = localStorage.getItem('token');
        // Menggunakan API_BASE_URL tanpa tambahan /api jika sudah didefinisikan di konstanta
        await fetch(`${API_BASE_URL}/meetings/end-meeting/${roomName}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        // Redirect moderator kembali ke list experience [cite: 1122]
        window.location.href = '/peserta/experience';
    } catch (err) {
        console.error("Gagal update status meeting di backend:", err);
    }
};

    useEffect(() => {
        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
            }
        };
    }, []);

    return (
        <div className="w-full h-full min-h-[500px] bg-slate-900 overflow-hidden relative">
            {/* Script Loader */}
            <Script
                src="https://meet.jit.si/external_api.js"
                onLoad={startMeeting}
            />

            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white z-0">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Menghubungkan ke Video...</p>
                </div>
            </div>

            <div ref={jitsiContainerRef} className="w-full h-full relative z-10" />
        </div>
    );
};

export default JitsiMeeting;