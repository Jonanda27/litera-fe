"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { socket } from "@/lib/sockets/socket";

export default function WebRTCMeeting({ roomId }) {
    const [userName, setUserName] = useState("");
    const [isJoined, setIsJoined] = useState(false);

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

    const [participantsList, setParticipantsList] = useState([]); 
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

    // Fungsi sinkronisasi video element dengan stream
    const syncAllVideos = useCallback(() => {
        if (localVideoRef.current && localStreamRef.current) {
            const targetStream = isScreenSharing ? screenStreamRef.current : localStreamRef.current;
            if (localVideoRef.current.srcObject !== targetStream) {
                localVideoRef.current.srcObject = targetStream;
            }
        }

        remoteStreams.forEach(user => {
            const videoEl = videoRefs.current[user.id];
            if (videoEl && user.stream && videoEl.srcObject !== user.stream) {
                videoEl.srcObject = user.stream;
                videoEl.play().catch(e => console.warn("Autoplay blocked:", e));
            }
        });
    }, [remoteStreams, isScreenSharing]);

    useEffect(() => {
        if (isJoined) syncAllVideos();
    }, [syncAllVideos, isJoined, remoteStreams.length]);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!userName.trim()) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setIsJoined(true);
            
            // Inisialisasi socket SETELAH stream didapat
            initSocket();
        } catch (err) { 
            console.error("❌ Media Error:", err); 
            alert("Gagal mengakses kamera/mikrofon. Pastikan izin diberikan.");
            // Tetap join meski tanpa kamera jika diizinkan
            setIsJoined(true);
            initSocket();
        }
    };

    useEffect(() => {
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
        // Kirim object ke server sesuai update backend sebelumnya
        socket.emit("join_video_room", { roomId, name: userName });
        
        socket.on("video_room_users", (users) => {
            const normalizedUsers = users.map(u => typeof u === 'string' ? { id: u, name: `User_${u.slice(0,4)}` } : u);
            setParticipantsList(normalizedUsers);

            // Kita yang baru join, maka kita yang buat penawaran (Offer) ke user lama
            normalizedUsers.forEach((user) => { 
                if (user.id !== socket.id) {
                    createPeerConnection(user.id, true); 
                }
            });
        });

        socket.on("video_user_joined", (data) => {
            const newUser = typeof data === 'string' ? { id: data, name: `User_${data.slice(0,4)}` } : data;
            setParticipantsList(prev => {
                if (prev.find(p => p.id === newUser.id)) return prev;
                return [...prev, newUser];
            });
            // User baru yang join akan mengirim offer, kita tunggu saja webrtc_offer
        });

        socket.on("webrtc_offer", async ({ offer, senderId }) => {
            const pc = await createPeerConnection(senderId, false);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("webrtc_answer", { target: senderId, answer, senderId: socket.id });
        });

        socket.on("webrtc_answer", async ({ answer, senderId }) => {
            const pc = peersRef.current[senderId];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on("webrtc_ice_candidate", async ({ candidate, senderId }) => {
            const pc = peersRef.current[senderId];
            if (pc && candidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) { console.error("Error adding ice candidate", e); }
            }
        });

        socket.on("video_user_left", (id) => {
            setParticipantsList(prev => prev.filter(p => p.id !== id));
            if (peersRef.current[id]) { 
                peersRef.current[id].close(); 
                delete peersRef.current[id]; 
            }
            setRemoteStreams(prev => prev.filter(s => s.id !== id));
            if (pinnedId === id) setPinnedId(null);
        });
    };

    const createPeerConnection = async (targetId, isInitiator) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
            ],
        });

        peersRef.current[targetId] = pc;

        // Tambahkan track lokal ke koneksi peer
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Saat menerima stream dari orang lain
        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];
            setRemoteStreams(prev => {
                if (prev.find(s => s.id === targetId)) return prev;
                return [...prev, { id: targetId, stream: remoteStream }];
            });
        };

        pc.onicecandidate = (e) => { 
            if (e.candidate) {
                socket.emit("webrtc_ice_candidate", { 
                    target: targetId, 
                    candidate: e.candidate, 
                    senderId: socket.id 
                }); 
            }
        };

        // Jika kita yang memulai koneksi
        if (isInitiator) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("webrtc_offer", { target: targetId, offer, senderId: socket.id });
            } catch (e) { console.error("Offer Error:", e); }
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
            } else { stopScreenSharing(); }
        } catch (err) { console.error(err); }
    };

    const stopScreenSharing = () => {
        if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (videoTrack) {
            Object.values(peersRef.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === "video");
                if (sender) sender.replaceTrack(videoTrack);
            });
        }
        setIsScreenSharing(false);
    };

    const participants = useMemo(() => {
        const all = [{ id: 'local', isLocal: true, name: userName || "Anda" }, ...remoteStreams.map(s => {
            const pInfo = participantsList.find(p => p.id === s.id);
            return { ...s, isLocal: false, name: pInfo?.name || `User_${s.id?.slice(0, 4)}` };
        })];
        const pinned = all.find(p => p.id === pinnedId) || all[0];
        const others = all.filter(p => p.id !== pinned.id);
        return { pinned, others, all };
    }, [pinnedId, remoteStreams, participantsList, userName]);

    const VideoCard = ({ id, isLocal, name, customClass = "" }) => {
        const showVideo = isLocal ? (isCamOn || isScreenSharing) : true;

        return (
            <div className={`relative group rounded-2xl overflow-hidden bg-neutral-900 border-4 border-transparent transition-all duration-300 ${customClass}`}>
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/60 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-white text-[10px] sm:text-xs flex items-center gap-2 z-30">
                    <span className="font-semibold truncate max-w-[120px]">{name}</span>
                    {isLocal && !isMicOn && <span>🔇</span>}
                </div>

                <video
                    autoPlay
                    muted={isLocal}
                    playsInline
                    ref={el => {
                        if (isLocal) localVideoRef.current = el;
                        else if (el) videoRefs.current[id] = el;
                        
                        if (el) {
                            const stream = isLocal 
                                ? (isScreenSharing ? screenStreamRef.current : localStreamRef.current)
                                : remoteStreams.find(s => s.id === id)?.stream;
                            if (stream && el.srcObject !== stream) el.srcObject = stream;
                        }
                    }}
                    className={`w-full h-full object-cover ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                />

                <button 
                    onClick={() => setPinnedId(pinnedId === id ? null : id)}
                    className={`absolute top-2 right-2 p-2 rounded-full z-30 ${pinnedId === id ? 'bg-blue-600' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}
                >📌</button>

                {!showVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                        <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center text-2xl text-white">
                            {name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!isJoined) {
        return (
            <div className="w-full h-[100dvh] bg-black flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-neutral-900 p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
                    <h1 className="text-2xl font-bold text-white mb-6">Siap untuk bergabung?</h1>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <input 
                            type="text" 
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Ketik nama Anda..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                            required
                        />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">
                            Masuk ke Meeting
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[100dvh] bg-black flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-hidden p-2 sm:p-4 relative flex flex-row">
                <div className="flex-1 h-full">
                    {layoutType === 'auto' && (
                        <div className={`grid gap-4 h-full w-full mx-auto 
                            ${participants.all.length === 1 ? 'grid-cols-1 max-w-4xl' : 
                              participants.all.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                            {participants.all.map(p => (
                                <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} customClass="w-full h-full aspect-video" />
                            ))}
                        </div>
                    )}
                    {/* Render layout lainnya (grid, focus, sidebar) tetap sama seperti sebelumnya... */}
                    {layoutType === 'sidebar' && (
                        <div className="flex flex-col md:flex-row h-full gap-4">
                            <div className="flex-[3] h-[60%] md:h-full">
                                <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} customClass="w-full h-full" />
                            </div>
                            <div className="flex-1 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
                                {participants.others.map(p => (
                                    <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} customClass="min-w-[150px] aspect-video" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {isParticipantsOpen && (
                    <div className="w-72 h-full bg-neutral-900 border-l border-white/10 p-4 flex flex-col animate-in">
                        <div className="flex justify-between mb-4"><h3 className="text-white font-bold">Peserta</h3><button onClick={() => setIsParticipantsOpen(false)} className="text-white">✕</button></div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {participants.all.map(p => (
                                <div key={p.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">{p.name.charAt(0)}</div>
                                    <span className="text-white text-sm truncate">{p.name} {p.isLocal && "(Anda)"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
                <div className="flex items-center gap-4 bg-neutral-900/90 backdrop-blur-xl p-4 rounded-full border border-white/10 shadow-2xl">
                    <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center ${isMicOn ? 'bg-neutral-800' : 'bg-red-600'}`}>{isMicOn ? "🎤" : "🔇"}</button>
                    <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center ${isCamOn ? 'bg-neutral-800' : 'bg-red-600'}`}>{isCamOn ? "📹" : "🚫"}</button>
                    <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-full flex items-center justify-center ${isScreenSharing ? 'bg-blue-600' : 'bg-neutral-800'}`}>🖥️</button>
                    <button onClick={() => setIsParticipantsOpen(!isParticipantsOpen)} className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">👥</button>
                    <button onClick={() => window.location.reload()} className="bg-red-600 px-6 py-3 rounded-full text-white font-bold">Keluar</button>
                </div>
            </div>
        </div>
    );
}