"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { socket } from "@/lib/sockets/socket";

export default function WebRTCMeeting({ roomId }) {
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const peersRef = useRef({});
    const videoRefs = useRef({});

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const [pinnedId, setPinnedId] = useState(null); 
    const [layoutType, setLayoutType] = useState("auto");
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

    // --- FUNGSI SINKRONISASI VIDEO: Memastikan Stream Selalu Terpasang ---
    const syncAllVideos = useCallback(() => {
        // 1. Sinkronisasi Video Lokal
        if (localVideoRef.current) {
            const targetStream = isScreenSharing ? screenStreamRef.current : localStreamRef.current;
            if (targetStream && localVideoRef.current.srcObject !== targetStream) {
                localVideoRef.current.srcObject = targetStream;
                localVideoRef.current.play().catch(() => {});
            }
        }

        // 2. Sinkronisasi Video Peserta Lain
        remoteStreams.forEach(user => {
            const videoEl = videoRefs.current[user.id];
            if (videoEl && user.stream && videoEl.srcObject !== user.stream) {
                videoEl.srcObject = user.stream;
                videoEl.play().catch(() => {});
            }
        });
    }, [remoteStreams, isScreenSharing]);

    // Jalankan setiap kali ada perubahan state UI
    useEffect(() => {
        syncAllVideos();
    }, [syncAllVideos, layoutType, pinnedId, isCamOn, isMicOn]);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            initSocket();
        } catch (err) { 
            console.error("❌ Media Error:", err); 
            initSocket(); 
        }
    };

    useEffect(() => {
        start();
        return () => {
            Object.values(peersRef.current).forEach(pc => pc.close());
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
            if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
            socket.off("video_room_users");
            socket.off("video_user_joined");
            socket.off("webrtc_offer");
            socket.off("webrtc_answer");
            socket.off("webrtc_ice_candidate");
            socket.off("video_user_left");
        };
    }, []);

    const initSocket = () => {
        socket.emit("join_video_room", roomId);
        socket.on("video_room_users", (users) => {
            users.forEach(({ socketId }) => { 
                if (socketId !== socket.id) createPeerConnection(socketId, true); 
            });
        });
        socket.on("video_user_joined", (id) => createPeerConnection(id, true));
        socket.on("webrtc_offer", async ({ offer, senderId }) => {
            const pc = await createPeerConnection(senderId, false);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("webrtc_answer", { target: senderId, answer, senderId: socket.id });
        });
        socket.on("webrtc_answer", async ({ answer, senderId }) => {
            const pc = peersRef.current[senderId];
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });
        socket.on("webrtc_ice_candidate", async ({ candidate, senderId }) => {
            const pc = peersRef.current[senderId];
            if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
        socket.on("video_user_left", (id) => {
            if (peersRef.current[id]) { peersRef.current[id].close(); delete peersRef.current[id]; }
            setRemoteStreams(prev => prev.filter(s => s.id !== id));
            if (pinnedId === id) setPinnedId(null);
        });
    };

    const createPeerConnection = async (targetId, isInitiator) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }, 
                { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }
            ],
        });
        peersRef.current[targetId] = pc;
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        }
        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];
            setRemoteStreams(prev => {
                if (prev.find(s => s.id === targetId)) return prev;
                return [...prev, { id: targetId, stream: remoteStream }];
            });
        };
        pc.onicecandidate = (e) => { 
            if (e.candidate) socket.emit("webrtc_ice_candidate", { target: targetId, candidate: e.candidate, senderId: socket.id }); 
        };
        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("webrtc_offer", { target: targetId, offer, senderId: socket.id });
        }
        return pc;
    };

    const toggleMic = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) { 
            track.enabled = !track.enabled; 
            setIsMicOn(track.enabled); 
        }
    };

    const toggleCamera = () => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) { 
            track.enabled = !track.enabled; 
            setIsCamOn(track.enabled); 
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];
                Object.values(peersRef.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === "video");
                    if (sender) sender.replaceTrack(screenTrack);
                });
                screenTrack.onended = () => stopScreenSharing();
                setIsScreenSharing(true);
                setPinnedId('local');
                setLayoutType('sidebar');
            } else { stopScreenSharing(); }
        } catch (err) { console.error(err); }
    };

    const stopScreenSharing = () => {
        if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === "video");
            if (sender) sender.replaceTrack(videoTrack);
        });
        setIsScreenSharing(false);
    };

    const participants = useMemo(() => {
        const all = [{ id: 'local', isLocal: true }, ...remoteStreams.map(s => ({ ...s, isLocal: false }))];
        const pinned = all.find(p => p.id === pinnedId) || all[0];
        const others = all.filter(p => p.id !== pinned.id);
        return { pinned, others, all };
    }, [pinnedId, remoteStreams]);

    // --- KOMPONEN VIDEO CARD (Clean & Stable) ---
    const VideoCard = ({ id, isLocal, customClass = "" }) => {
        const showVideo = isLocal ? (isCamOn || isScreenSharing) : true;

        return (
            <div className={`relative group rounded-2xl overflow-hidden bg-neutral-900 border-4 border-transparent transition-all duration-300 ${customClass}`}>
                
                {/* LABEL NAMA DI KIRI ATAS */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[10px] sm:text-xs flex items-center gap-2 z-30">
                    <span className="font-semibold truncate max-w-[120px]">
                        {isLocal ? (isScreenSharing ? "Layar Anda" : "Anda") : `User: ${id.slice(0, 6)}`}
                    </span>
                    {isLocal && !isMicOn && <span className="text-red-400">🔇</span>}
                </div>

                <video
                    autoPlay
                    muted={isLocal}
                    playsInline
                    ref={el => {
                        if (isLocal) localVideoRef.current = el;
                        else if (el) videoRefs.current[id] = el;
                        
                        // Pasang stream saat elemen di-mount
                        if (el) {
                            const stream = isLocal 
                                ? (isScreenSharing ? screenStreamRef.current : localStreamRef.current)
                                : remoteStreams.find(s => s.id === id)?.stream;
                            if (stream && el.srcObject !== stream) el.srcObject = stream;
                        }
                    }}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                />

                <button 
                    onClick={() => setPinnedId(pinnedId === id ? null : id)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all z-30 
                    ${pinnedId === id ? 'bg-blue-600 text-white' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'}`}
                >
                    📌
                </button>

                {!showVideo && isLocal && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 z-[5]">
                        <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center text-3xl text-white/50">👤</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full h-screen bg-black flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-hidden p-4 sm:p-6 relative">
                {/* Switch Layout Logic */}
                {layoutType === 'grid' && (
                    <div className="flex flex-wrap content-start justify-center gap-4 h-full overflow-y-auto pb-24">
                        {participants.all.map(p => (
                            <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} customClass="w-[300px] h-[220px] sm:w-[350px] sm:h-[250px]" />
                        ))}
                    </div>
                )}
                {layoutType === 'focus' && (
                    <div className="w-full h-full max-w-5xl mx-auto">
                        <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} customClass="w-full h-full" />
                    </div>
                )}
                {layoutType === 'sidebar' && (
                    <div className="flex h-full gap-4">
                        <div className="flex-[3] h-full">
                            <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} customClass="w-full h-full" />
                        </div>
                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar hidden md:flex max-w-[280px]">
                            {participants.others.map(p => (
                                <div key={p.id} className="w-full aspect-video shrink-0">
                                    <VideoCard id={p.id} isLocal={p.isLocal} customClass="w-full h-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {layoutType === 'auto' && (
                    <div className={`grid gap-4 h-full w-full 
                        ${participants.all.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 
                          participants.all.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                          'grid-cols-2 lg:grid-cols-3'}`}>
                        {participants.all.map(p => (
                            <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} customClass="w-full h-full" />
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL LAYOUT */}
            {isLayoutModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setIsLayoutModalOpen(false)} />
                    <div className="bg-white text-neutral-900 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
                        <h3 className="text-xl font-semibold mb-6">Tampilan Rapat</h3>
                        <div className="space-y-4">
                            {['auto', 'grid', 'focus', 'sidebar'].map((type) => (
                                <label key={type} className="flex items-center justify-between p-4 rounded-2xl border hover:bg-neutral-50 cursor-pointer border-neutral-100">
                                    <div className="flex items-center gap-4">
                                        <input type="radio" checked={layoutType === type} onChange={() => { setLayoutType(type); setIsLayoutModalOpen(false); }} className="w-5 h-5 accent-blue-600" />
                                        <p className="font-medium capitalize">{type}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTROL BAR */}
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center z-[9999]">
                <div className="flex items-center gap-3 bg-neutral-900/95 backdrop-blur-2xl p-4 px-8 rounded-full border border-white/10 shadow-2xl mb-4">
                    <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-neutral-800' : 'bg-red-600'}`}>
                        {isMicOn ? "🎤" : "🔇"}
                    </button>
                    <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'bg-neutral-800' : 'bg-red-600'}`}>
                        {isCamOn ? "📹" : "🚫"}
                    </button>
                    <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isScreenSharing ? 'bg-blue-600' : 'bg-neutral-800'}`}>
                        🖥️
                    </button>
                    <div className="w-[1px] h-8 bg-white/10 mx-1" />
                    <button onClick={() => setIsLayoutModalOpen(true)} className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-white">⋮</button>
                    <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                        <span className="text-lg">📞</span>
                        <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
            `}</style>
        </div>
    );
}