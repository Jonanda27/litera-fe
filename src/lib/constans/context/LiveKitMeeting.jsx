"use client";

import { useEffect, useRef, useState } from "react"; // Import useState
import { Room, RemoteParticipant, LocalParticipant, Track, RoomEvent, ParticipantEvent, TrackEvent } from "livekit-client";
import { useMeetingContext } from "./MeetingContext";
import { API_BASE_URL } from "../constans";

// --- Komponen Pembantu: VideoTile ---
function VideoTile({ participant, track, isLocal }) {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false); // State untuk status mute

    useEffect(() => {
        if (videoRef.current && track) {
            // Attach track ke elemen video
            const videoElement = track.attach();
            if (videoRef.current.firstChild) {
                videoRef.current.removeChild(videoRef.current.firstChild);
            }
            videoRef.current.appendChild(videoElement);

            // Update status mute (hanya untuk audio track jika ada)
            const handleMute = () => {
                setIsMuted(!track.isMuted);
            };
            track.on(TrackEvent.Muted, handleMute);
            track.on(TrackEvent.Unmuted, handleMute);
            setIsMuted(track.isMuted); // Set initial state

            return () => {
                track.detach(videoElement);
                track.off(TrackEvent.Muted, handleMute);
                track.off(TrackEvent.Unmuted, handleMute);
            };
        }
    }, [track]);

    if (!track) return null;

    // Tambahkan indikator visual untuk nama dan status mute
    return (
        <div
            className={`relative flex-1 min-w-[200px] max-w-[calc(50%-8px)] sm:max-w-[calc(33.333%-8px)] md:max-w-[calc(25%-8px)] aspect-video rounded-lg overflow-hidden border-2 
                        ${isLocal ? "border-blue-500" : "border-gray-700"} bg-gray-800`}
            style={{ flexBasis: "auto" }} // Memungkinkan flexbox untuk mengatur ukuran
        >
            <div ref={videoRef} className="w-full h-full">
                {/* Video akan dilampirkan di sini */}
            </div>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                {participant.identity} {isMuted ? "🔇" : "🎤"}
            </div>
            {/* Overlay jika kamera mati */}
            {!track.isMuted && track.kind === 'video' && !track.isEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-lg">
                    Kamera Mati
                </div>
            )}
        </div>
    );
}

// --- Komponen Utama: LiveKitMeeting ---
export default function LiveKitMeeting() {
    const { activeMeeting } = useMeetingContext();
    const roomRef = useRef(null);
    const [participants, setParticipants] = useState([]); // State untuk semua peserta (termasuk lokal)

    useEffect(() => {
        if (!activeMeeting) return;

        const joinRoom = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/livekit/token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        roomName: activeMeeting.roomName,
                        userName: activeMeeting.userName,
                    }),
                });

                if (!res.ok) {
                    throw new Error(`Failed to get LiveKit token: ${res.statusText}`);
                }

                const { token } = await res.json();

                const newRoom = new Room();
                roomRef.current = newRoom;

                await newRoom.connect("ws://localhost:7880", token);
                console.log("Berhasil terhubung ke LiveKit room:", newRoom.name);

                await newRoom.localParticipant.setCameraEnabled(true);
                await newRoom.localParticipant.setMicrophoneEnabled(true);
                console.log("🎤 mic:", newRoom.localParticipant.isMicrophoneEnabled);
                console.log("📷 cam:", newRoom.localParticipant.isCameraEnabled);

                // --- Manajamen Peserta ---
                // --- Manajamen Peserta ---
                const updateParticipants = () => {
                    // Pastikan newRoom.participants ada sebelum mencoba mengaksesnya
                    const remoteParticipants = newRoom.participants
                        ? Array.from(newRoom.participants.values())
                        : [];

                    const allParticipants = [
                        newRoom.localParticipant,
                        ...remoteParticipants
                    ].map(p => ({
                        participant: p,
                        // Pastikan p.videoTrackPublications dan p.audioTrackPublications juga dicheck
                        videoTrack: Array.from(p.videoTrackPublications.values()).find(pub => pub.isSubscribed && pub.track),
                        audioTrack: Array.from(p.audioTrackPublications.values()).find(pub => pub.isSubscribed && pub.track),
                        isLocal: p === newRoom.localParticipant,
                    }));
                    setParticipants(allParticipants);
                };

                // Panggil sekali saat inisialisasi
                updateParticipants();

                // Listeners untuk event peserta dan track
                newRoom.on(RoomEvent.ParticipantConnected, updateParticipants);
                newRoom.on(RoomEvent.ParticipantDisconnected, updateParticipants);
                newRoom.on(RoomEvent.TrackPublished, updateParticipants);
                newRoom.on(RoomEvent.TrackUnpublished, updateParticipants);
                newRoom.on(RoomEvent.TrackSubscribed, updateParticipants);
                newRoom.on(RoomEvent.TrackUnsubscribed, updateParticipants);

                // Event listener untuk local participant
                newRoom.localParticipant.on(ParticipantEvent.TrackPublished, updateParticipants);
                newRoom.localParticipant.on(ParticipantEvent.TrackUnpublished, updateParticipants);
                newRoom.localParticipant.on(ParticipantEvent.TrackMuted, updateParticipants);
                newRoom.localParticipant.on(ParticipantEvent.TrackUnmuted, updateParticipants);


            } catch (error) {
                console.error("Gagal bergabung atau mengaktifkan media:", error);
                alert(`Gagal bergabung ke meeting: ${error.message}. Periksa izin kamera/mikrofon dan server LiveKit.`);
            }
        };

        joinRoom();

        return () => {
            if (roomRef.current) {
                console.log("Memutuskan koneksi dari LiveKit room.");
                roomRef.current.disconnect();
                roomRef.current = null;
            }
            // Kosongkan peserta saat unmount
            setParticipants([]);
        };
    }, [activeMeeting]);

    // Menghitung kelas grid berdasarkan jumlah peserta untuk tampilan yang lebih dinamis
    const getGridClass = () => {
        const count = participants.filter(p => p.videoTrack).length; // Hanya hitung yang punya video
        if (count === 0) return "grid-cols-1"; // Tidak ada video, mungkin loading
        if (count === 1) return "grid-cols-1";
        if (count === 2) return "grid-cols-1 sm:grid-cols-2";
        if (count === 3) return "grid-cols-1 sm:grid-cols-3"; // Atau 2x2 dengan 1 besar
        if (count === 4) return "grid-cols-2";
        if (count <= 6) return "grid-cols-2 sm:grid-cols-3";
        if (count <= 9) return "grid-cols-3";
        return "grid-cols-3 md:grid-cols-4"; // Untuk jumlah lebih banyak
    };


    return (
        <div
            id="video-container"
            className={`w-full h-full grid ${getGridClass()} gap-2 p-2 bg-black overflow-y-auto`}
            style={{ gridAutoRows: 'minmax(0, 1fr)' }} // Memastikan baris mengisi tinggi
        >
            {participants.map((pData) => (
                <VideoTile
                    key={pData.participant.sid}
                    participant={pData.participant}
                    track={pData.videoTrack?.track}
                    isLocal={pData.isLocal}
                />
            ))}
            {/* Tampilkan overlay jika tidak ada video */}
            {participants.filter(p => p.videoTrack).length === 0 && (
                <div className="col-span-full row-span-full flex items-center justify-center text-gray-500 text-lg">
                    Menunggu peserta atau mengaktifkan kamera...
                </div>
            )}
        </div>
    );
}