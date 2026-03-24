"use client";
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Youtube, Radio } from "lucide-react"; // Tambahkan icon untuk UI

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetingProps {
  roomName: string;
  userName: string;
  isModerator: boolean;
  streamKey?: string; // TAMBAHKAN INI: Untuk menyimpan key YouTube dari DB
  onLeave?: () => void;
}

const JitsiMeeting = ({
  roomName,
  userName,
  isModerator,
  streamKey,
  onLeave,
}: JitsiMeetingProps) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [isStreaming, setIsStreaming] = useState(false); // State untuk UI tombol

  const startMeeting = () => {
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
              "livestreaming", // TAMBAHKAN INI: Tombol stream bawaan Jitsi
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

      apiRef.current.addEventListeners({
        videoConferenceLeft: () => {
          if (onLeave) onLeave();
        },
        readyToClose: () => {
          if (onLeave) onLeave();
        }
      });
    }
  };

  // --- LOGIC START STREAMING ---
  const handleStartStreaming = () => {
    if (apiRef.current && streamKey) {
      // Perintah Jitsi untuk mulai streaming menggunakan key dari props
      apiRef.current.executeCommand('startLiveStreaming', {
        data: {
          streamKey: streamKey, // Key otomatis dari DB
        },
        mode: 'stream'
      });
      setIsStreaming(true);
      alert("Permintaan Live Streaming dikirim ke YouTube...");
    } else {
      alert("Stream Key tidak ditemukan atau API Jitsi belum siap.");
    }
  };

  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      startMeeting();
    }
  }, [roomName]);

  useEffect(() => {
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
      {/* TOMBOL GO LIVE KHUSUS ADMIN (Hanya muncul jika isModerator & ada streamKey) */}
      {isModerator && streamKey && (
        <div className="absolute top-4 left-4 z-[100] flex gap-2">
          <button
            onClick={handleStartStreaming}
            disabled={isStreaming}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl border-2 border-slate-900 ${isStreaming
                ? "bg-green-500 text-white cursor-not-allowed"
                : "bg-[#c31a26] text-white hover:bg-slate-900 active:scale-95"
              }`}
          >
            {isStreaming ? (
              <><Radio size={14} className="animate-pulse" /> On Air to YouTube</>
            ) : (
              <><Youtube size={14} /> Start Live Stream</>
            )}
          </button>
        </div>
      )}

      <Script
        src="https://meet.jit.si/external_api.js"
        strategy="afterInteractive"
        onLoad={startMeeting}
      />

      <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white z-0">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium italic">Establishing Secure Connection...</p>
        </div>
      </div>

      <div ref={jitsiContainerRef} className="w-full h-full relative z-10" />
    </div>
  );
};

export default JitsiMeeting;