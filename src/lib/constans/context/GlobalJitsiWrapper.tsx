"use client";
import React, { useState, useEffect, useRef } from "react";
import { useMeetingContext } from "./MeetingContext"; // Sesuaikan path jika perlu
import WebRTCMeeting from "@/app/peserta/experience/component/WebRTCMeeting"; // Sesuaikan path jika perlu
import { Maximize2, Minimize2, X, GripHorizontal } from "lucide-react"; // <-- Import GripHorizontal

export default function GlobalJitsiWrapper() {
  const { activeMeeting, isMinimized, toggleMinimize, endMeeting } = useMeetingContext();

  // --- STATE UNTUK FITUR DRAG ---
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Reset posisi ketika card dikembalikan ke full screen
  useEffect(() => {
    if (!isMinimized) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isMinimized]);

  // Event Listener pergerakan mouse global
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      // Menghitung posisi baru berdasarkan pergerakan mouse
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  if (!activeMeeting) return null; // Sembunyikan jika tidak ada meeting aktif

  return (
    <div
      className={`z-[9999] fixed ${isMinimized
        ? "bottom-6 right-6 w-[350px] sm:w-[450px] aspect-video bg-slate-900 p-1.5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700"
        : "inset-4 sm:inset-10 bg-slate-900 p-2 rounded-[32px] shadow-2xl border border-slate-700 flex flex-col"
        }`}
      style={{
        // Memindahkan elemen berdasarkan state position
        transform: isMinimized ? `translate(${position.x}px, ${position.y}px)` : "none",
        // Matikan transisi saat di-drag agar pergerakan mouse tidak delay (lag)
        transition: isDragging ? "none" : "all 0.5s ease-in-out",
      }}
    >

      {/* DRAG HANDLE (Pegangan untuk menggeser, hanya muncul saat minimized) */}
      {isMinimized && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-400 p-1 px-5 rounded-t-xl cursor-grab active:cursor-grabbing hover:text-white border border-b-0 border-slate-700 flex items-center justify-center shadow-lg transition-colors z-[101]"
          onMouseDown={handleMouseDown}
          title="Tahan untuk menggeser"
        >
          <GripHorizontal size={20} />
        </div>
      )}

      {/* Tombol Kontrol (Minimize / Close) */}
      <div className="absolute top-4 right-4 z-[100] flex gap-2">
        <button
          onClick={() => toggleMinimize(!isMinimized)}
          className="p-2.5 bg-black/40 hover:bg-[#1e4e8c] text-white rounded-xl backdrop-blur-md transition-all shadow-lg border border-white/10"
        >
          {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
        </button>

        {/* Tombol Close Global (Meninggalkan meeting dari mana saja) */}
        {!isMinimized && (
          <button
            onClick={endMeeting}
            className="p-2.5 bg-black/40 hover:bg-[#c31a26] text-white rounded-xl backdrop-blur-md transition-all shadow-lg border border-white/10"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="w-full h-full bg-black rounded-[18px] overflow-hidden relative">

        {/* OVERLAY PELINDUNG: Menutup iFrame selama proses drag agar mouse tidak terserap ke dalam Jitsi */}
        {isDragging && <div className="absolute inset-0 z-50 bg-transparent cursor-grabbing" />}

        <WebRTCMeeting
          roomId={activeMeeting.roomName}
        />
      </div>
    </div>
  );
}