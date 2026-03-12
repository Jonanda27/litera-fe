"use client";
import React, { useEffect, useRef } from "react";
import Script from "next/script";
import { API_BASE_URL } from "@/lib/constans/constans";

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

const JitsiMeeting = ({
  roomName,
  userName,
  isModerator,
}: JitsiMeetingProps) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const startMeeting = () => {
    // Hapus instance lama jika ada sebelum membuat baru
    if (apiRef.current) {
      apiRef.current.dispose();
    }

    if (window.JitsiMeetExternalAPI && jitsiContainerRef.current && roomName) {
      const domain = "meet.jit.si";
      const options = {
        roomName: roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName,
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
          DEFAULT_REMOTE_DISPLAY_NAME: "Peserta",
          TOOLBAR_BUTTONS: isModerator
            ? [
                "microphone",
                "camera",
                "desktop",
                "fullscreen",
                "chat",
                "settings",
                "hangup",
                "videoquality",
                "tileview",
                "mute-everyone",
                "security",
              ]
            : [
                "microphone",
                "camera",
                "desktop",
                "fullscreen",
                "chat",
                "settings",
                "hangup",
                "videoquality",
                "tileview",
                "raisehand",
              ],
        },
      };
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      // Event listener lainnya tetap sama...
    }
  };

  // TRICK: Jalankan startMeeting jika script sudah ada di window (kasus navigasi balik)
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      startMeeting();
    }
  }, [roomName]); // Jalankan ulang jika roomName berubah

  useEffect(() => {
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
      <Script
        src="https://meet.jit.si/external_api.js"
        strategy="afterInteractive"
        onLoad={startMeeting}
      />

      {/* Loading Indicator */}
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
