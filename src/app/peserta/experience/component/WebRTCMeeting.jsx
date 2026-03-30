"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { socket } from "@/lib/sockets/socket";

export default function WebRTCMeeting({ roomId }) {
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const peersRef = useRef({});
    const videoRefs = useRef({});
    const audioAnalyzersRef = useRef({});

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const [speakingUsers, setSpeakingUsers] = useState({});
    const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);

    const [pinnedId, setPinnedId] = useState(null); 
    const [layoutType, setLayoutType] = useState("auto"); // auto, grid, focus, sidebar
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

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

    // PERBAIKAN: Fungsi penempelan stream yang lebih stabil untuk mencegah flickering
    useEffect(() => {
        const syncStreams = () => {
            // Sync Local
            if (localVideoRef.current) {
                const targetStream = isScreenSharing ? screenStreamRef.current : localStreamRef.current;
                if (localVideoRef.current.srcObject !== targetStream) {
                    localVideoRef.current.srcObject = targetStream;
                }
            }
            // Sync Remotes
            remoteStreams.forEach(user => {
                const videoEl = videoRefs.current[user.id];
                if (videoEl && user.stream && videoEl.srcObject !== user.stream) {
                    videoEl.srcObject = user.stream;
                }
            });
        };
        syncStreams();
    }, [remoteStreams, pinnedId, isScreenSharing, layoutType]);

    const participants = useMemo(() => {
        const all = [{ id: 'local', isLocal: true, stream: localStreamRef.current }, ...remoteStreams.map(s => ({ ...s, isLocal: false }))];
        const pinned = all.find(p => p.id === pinnedId) || all[0];
        const others = all.filter(p => p.id !== (pinnedId || all[0].id));
        return { pinned, others, all };
    }, [pinnedId, remoteStreams]);

    const monitorStream = (stream, socketId = null) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            analyser.fftSize = 256;
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let isSpeaking = false;

            const checkVolume = () => {
                if (!analyser) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const average = sum / dataArray.length;
                const currentlySpeaking = average > 30;

                if (currentlySpeaking !== isSpeaking) {
                    isSpeaking = currentlySpeaking;
                    if (socketId === null) setIsLocalSpeaking(isSpeaking);
                    else setSpeakingUsers(prev => ({ ...prev, [socketId]: isSpeaking }));
                }
                requestAnimationFrame(checkVolume);
            };
            checkVolume();
            return { stop: () => { source.disconnect(); analyser.disconnect(); audioContext.close(); } };
        } catch (e) { console.error(e); }
    };

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            const monitor = monitorStream(stream);
            if (monitor) audioAnalyzersRef.current["local"] = monitor;
            initSocket();
        } catch (err) { console.error("❌ Error:", err); }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];
                Object.values(peersRef.current).forEach(pc => {
                    const vs = pc.getSenders().find(s => s.track.kind === "video");
                    if (vs) vs.replaceTrack(screenTrack);
                });
                screenTrack.onended = () => stopScreenSharing();
                setIsScreenSharing(true);
                setPinnedId('local');
                setLayoutType('sidebar');
            } else {
                stopScreenSharing();
            }
        } catch (err) { console.error(err); }
    };

    const stopScreenSharing = () => {
        if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(pc => {
            const vs = pc.getSenders().find(s => s.track.kind === "video");
            if (vs) vs.replaceTrack(videoTrack);
        });
        setIsScreenSharing(false);
    };

    const initSocket = () => {
        socket.emit("join_video_room", roomId);
        socket.on("video_room_users", (users) => {
            users.forEach(({ socketId }) => { if (socketId !== socket.id) createPeerConnection(socketId, true); });
        });
        socket.on("video_user_joined", (id) => createPeerConnection(id, true));
        socket.on("webrtc_offer", async ({ offer, senderId }) => {
            const pc = await createPeerConnection(senderId, false);
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("webrtc_answer", { target: senderId, answer, senderId: socket.id });
        });
        socket.on("webrtc_answer", async ({ answer, senderId }) => {
            const pc = peersRef.current[senderId];
            if (pc) await pc.setRemoteDescription(answer);
        });
        socket.on("webrtc_ice_candidate", async ({ candidate, senderId }) => {
            const pc = peersRef.current[senderId];
            if (pc) await pc.addIceCandidate(candidate);
        });
        socket.on("video_user_left", (id) => {
            if (peersRef.current[id]) { peersRef.current[id].close(); delete peersRef.current[id]; }
            if (audioAnalyzersRef.current[id]) { audioAnalyzersRef.current[id].stop(); delete audioAnalyzersRef.current[id]; }
            setRemoteStreams(prev => prev.filter(s => s.id !== id));
            if (pinnedId === id) setPinnedId(null);
        });
    };

    const createPeerConnection = async (targetId, isInitiator) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }],
        });
        peersRef.current[targetId] = pc;
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];
            if (!audioAnalyzersRef.current[targetId]) {
                const monitor = monitorStream(remoteStream, targetId);
                if (monitor) audioAnalyzersRef.current[targetId] = monitor;
            }
            setRemoteStreams(prev => {
                if (prev.find(s => s.id === targetId)) return prev;
                return [...prev, { id: targetId, stream: remoteStream }];
            });
        };
        pc.onicecandidate = (e) => { if (e.candidate) socket.emit("webrtc_ice_candidate", { target: targetId, candidate: e.candidate, senderId: socket.id }); };
        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("webrtc_offer", { target: targetId, offer, senderId: socket.id });
        }
        return pc;
    };

    const toggleMic = () => {
        const track = localStreamRef.current.getAudioTracks()[0];
        if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); if (!track.enabled) setIsLocalSpeaking(false); }
    };

    const toggleCamera = () => {
        const track = localStreamRef.current.getVideoTracks()[0];
        if (track) { track.enabled = !track.enabled; setIsCamOn(track.enabled); }
    };

    // PERBAIKAN: Komponen VideoCard dipisahkan atau dioptimasi agar tidak re-mount
    const VideoCard = ({ id, isLocal, isPinned, customClass = "" }) => {
        const isSpeaking = isLocal ? isLocalSpeaking : speakingUsers[id];
        
        return (
            <div className={`relative group rounded-2xl overflow-hidden bg-neutral-900 border-4 transition-all duration-300 ${customClass}
                ${isSpeaking && (isLocal ? isMicOn : true) ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'border-transparent'}`}>
                
                {/* Gunakan key yang stabil untuk mencegah re-mount video element */}
                <video
                    key={`video-${id}`}
                    ref={el => { if (isLocal) localVideoRef.current = el; else if (el) videoRefs.current[id] = el; }}
                    autoPlay muted={isLocal} playsInline className="w-full h-full object-cover"
                />

                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[10px] sm:text-xs flex items-center gap-2 z-10 pointer-events-none">
                    <span className="font-semibold truncate max-w-[80px] sm:max-w-[150px]">{isLocal ? (isScreenSharing ? "Layar Anda" : "Anda") : `Peserta: ${id.slice(0, 6)}`}</span>
                    {isLocal && !isMicOn && <span className="text-red-400">🔇</span>}
                    {!isLocal && speakingUsers[id] && <span className="animate-pulse">🔊</span>}
                </div>

                <button 
                    onClick={() => setPinnedId(pinnedId === id ? null : id)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all z-20 
                    ${pinnedId === id ? 'bg-blue-600 text-white' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60'}`}
                >
                    📌
                </button>

                {isLocal && !isCamOn && !isScreenSharing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 z-[5]">
                        <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center text-2xl">👤</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full h-screen bg-black flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-hidden p-4 sm:p-6 relative">
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
                                <div key={p.id} className="w-full aspect-video shrink-0"><VideoCard id={p.id} isLocal={p.isLocal} customClass="w-full h-full" /></div>
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

            {/* MODAL PENGATURAN (SAMA SEPERTI SEBELUMNYA) */}
            {isLayoutModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setIsLayoutModalOpen(false)} />
                    <div className="bg-white text-neutral-900 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Sesuaikan tampilan</h3>
                            <button onClick={() => setIsLayoutModalOpen(false)} className="text-2xl">✕</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'auto', name: 'Otomatis (dinamis)', icon: '✦' },
                                { id: 'grid', name: 'Kotak (lama)', icon: '▦' },
                                { id: 'focus', name: 'Sorotan', icon: '▢' },
                                { id: 'sidebar', name: 'Sidebar', icon: '◫' }
                            ].map((item) => (
                                <label key={item.id} className="flex items-center justify-between p-4 rounded-2xl border hover:bg-neutral-50 cursor-pointer border-neutral-100">
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="layout" checked={layoutType === item.id} onChange={() => { setLayoutType(item.id); setIsLayoutModalOpen(false); }} className="w-5 h-5 accent-blue-600" />
                                        <p className="font-medium">{item.name}</p>
                                    </div>
                                    <div className="w-10 h-8 bg-neutral-100 rounded flex items-center justify-center text-neutral-400">{item.icon}</div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTROL BAR */}
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center z-[9999]">
                <div className="flex items-center gap-2 sm:gap-4 bg-neutral-900/90 backdrop-blur-2xl p-3 sm:p-4 px-6 sm:px-10 rounded-full border border-white/10 shadow-2xl mb-4">
                    <button onClick={toggleMic} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all ${isMicOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600'}`}>
                        {isMicOn ? "🎤" : "🔇"}
                    </button>
                    <button onClick={toggleCamera} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all ${isCamOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600'}`}>
                        {isCamOn ? "📹" : "🚫"}
                    </button>
                    <button onClick={toggleScreenShare} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all ${isScreenSharing ? 'bg-blue-600' : 'bg-neutral-800'}`}>
                        🖥️
                    </button>
                    <div className="w-[1px] h-8 bg-white/10 mx-1" />
                    <button onClick={() => setIsLayoutModalOpen(true)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-all">
                        <span className="text-xl font-bold text-white">⋮</span>
                    </button>
                    <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
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