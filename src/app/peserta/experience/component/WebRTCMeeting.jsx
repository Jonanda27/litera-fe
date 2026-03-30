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
    const videoRefs = useRef({}); // Menyimpan referensi elemen video remote
    
    const makingOffer = useRef({}); 
    const iceCandidatesQueue = useRef({}); 

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const [pinnedId, setPinnedId] = useState(null); 
    const [layoutType, setLayoutType] = useState("auto");
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

    const [participantsList, setParticipantsList] = useState([]); 
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    }, []);

    // PERBAIKAN: Fungsi sinkronisasi yang lebih agresif
    const syncAllVideos = useCallback(() => {
        // Sinkronisasi Local
        if (localVideoRef.current) {
            const targetStream = isScreenSharing ? screenStreamRef.current : localStreamRef.current;
            if (targetStream && localVideoRef.current.srcObject !== targetStream) {
                localVideoRef.current.srcObject = targetStream;
            }
        }
        
        // Sinkronisasi Remote
        remoteStreams.forEach(user => {
            const videoEl = videoRefs.current[user.id];
            if (videoEl && user.stream) {
                if (videoEl.srcObject !== user.stream) {
                    videoEl.srcObject = user.stream;
                }
                // Pastikan video dimainkan (mengatasi auto-play block)
                videoEl.play().catch(e => console.warn("Autoplay ditunda:", e));
            }
        });
    }, [remoteStreams, isScreenSharing]);

    useEffect(() => {
        if (isJoined) {
            syncAllVideos();
        }
    }, [syncAllVideos, isJoined, remoteStreams]);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!userName.trim()) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setIsJoined(true);
            initSocket();
        } catch (err) { 
            console.error("❌ Media Error:", err); 
            setIsJoined(true); // Tetap join tanpa kamera jika gagal
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
        socket.emit("join_video_room", { roomId, name: userName });
        
        socket.on("video_room_users", (users) => {
            const normalizedUsers = users.map(u => typeof u === 'string' ? { id: u, name: `User_${u.slice(0,4)}` } : u);
            setParticipantsList(normalizedUsers);
            normalizedUsers.forEach((user) => { 
                if (user.id !== socket.id) createPeerConnection(user.id, true); 
            });
        });

        socket.on("video_user_joined", (data) => {
            const newUser = typeof data === 'string' ? { id: data, name: `User_${data.slice(0,4)}` } : data;
            addNotification(`${newUser.name} bergabung`);
            setParticipantsList(prev => {
                if (prev.find(p => p.id === newUser.id)) return prev;
                return [...prev, newUser];
            });
        });

        socket.on("webrtc_offer", async ({ offer, senderId }) => {
            try {
                const pc = await createPeerConnection(senderId, false);
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                
                if (iceCandidatesQueue.current[senderId]) {
                    iceCandidatesQueue.current[senderId].forEach(candidate => pc.addIceCandidate(candidate));
                    delete iceCandidatesQueue.current[senderId];
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("webrtc_answer", { target: senderId, answer, senderId: socket.id });
            } catch (err) { console.error("Offer Error:", err); }
        });

        socket.on("webrtc_answer", async ({ answer, senderId }) => {
            try {
                const pc = peersRef.current[senderId];
                if (pc && pc.signalingState !== "stable") {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                    if (iceCandidatesQueue.current[senderId]) {
                        iceCandidatesQueue.current[senderId].forEach(candidate => pc.addIceCandidate(candidate));
                        delete iceCandidatesQueue.current[senderId];
                    }
                }
            } catch (err) { console.error("Answer Error:", err); }
        });

        socket.on("webrtc_ice_candidate", async ({ candidate, senderId }) => {
            try {
                const pc = peersRef.current[senderId];
                const rtcCandidate = new RTCIceCandidate(candidate);
                if (!pc || !pc.remoteDescription) {
                    if (!iceCandidatesQueue.current[senderId]) iceCandidatesQueue.current[senderId] = [];
                    iceCandidatesQueue.current[senderId].push(rtcCandidate);
                } else {
                    await pc.addIceCandidate(rtcCandidate);
                }
            } catch (err) { console.error("Error add ICE:", err); }
        });

        socket.on("video_user_left", (id) => {
            setParticipantsList(prev => {
                const exitingUser = prev.find(p => p.id === id);
                if (exitingUser) addNotification(`${exitingUser.name} keluar`);
                return prev.filter(p => p.id !== id);
            });
            if (peersRef.current[id]) { 
                peersRef.current[id].close(); 
                delete peersRef.current[id]; 
                delete makingOffer.current[id];
                delete iceCandidatesQueue.current[id];
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
                { urls: "stun:stun1.l.google.com:19302" }
            ],
        });

        peersRef.current[targetId] = pc;

        // Tambahkan track lokal ke PC
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        }

        // PERBAIKAN: Tangkap stream remote
        pc.ontrack = (event) => {
            console.log(`Menerima track dari: ${targetId}`);
            const remoteStream = event.streams[0];
            setRemoteStreams(prev => {
                const exists = prev.find(s => s.id === targetId);
                if (exists) {
                    // Update stream jika sudah ada (misal ganti dari cam ke screen)
                    return prev.map(s => s.id === targetId ? { ...s, stream: remoteStream } : s);
                }
                return [...prev, { id: targetId, stream: remoteStream }];
            });
        };

        pc.onicecandidate = (e) => { 
            if (e.candidate) socket.emit("webrtc_ice_candidate", { target: targetId, candidate: e.candidate, senderId: socket.id }); 
        };

        pc.onnegotiationneeded = async () => {
            if (!isInitiator) return;
            try {
                makingOffer.current[targetId] = true;
                const offer = await pc.createOffer();
                if (pc.signalingState !== "stable") return;
                await pc.setLocalDescription(offer);
                socket.emit("webrtc_offer", { target: targetId, offer, senderId: socket.id });
            } catch (err) { console.error("Negotiation error:", err); } 
            finally { makingOffer.current[targetId] = false; }
        };

        return pc;
    };

    const toggleMic = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
    };

    const toggleCamera = () => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) { track.enabled = !track.enabled; setIsCamOn(track.enabled); }
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

    // PERBAIKAN: VideoCard dengan logic attachment stream yang lebih aman
    const VideoCard = ({ id, isLocal, name, customClass = "" }) => {
        const videoRef = useRef(null);
        const showVideo = isLocal ? (isCamOn || isScreenSharing) : true;

        useEffect(() => {
            const stream = isLocal 
                ? (isScreenSharing ? screenStreamRef.current : localStreamRef.current) 
                : remoteStreams.find(s => s.id === id)?.stream;

            if (videoRef.current && stream) {
                if (videoRef.current.srcObject !== stream) {
                    videoRef.current.srcObject = stream;
                }
            }
        }, [isLocal, isScreenSharing, remoteStreams, id]);

        return (
            <div className={`relative group rounded-2xl overflow-hidden bg-neutral-900 border-2 border-white/5 transition-all duration-300 w-full h-full ${customClass}`}>
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[10px] sm:text-xs flex items-center gap-2 z-30">
                    <span className="font-semibold truncate max-w-[100px] sm:max-w-[150px]">
                        {isLocal ? (isScreenSharing ? "Layar Anda" : `Anda (${name})`) : name}
                    </span>
                    {isLocal && !isMicOn && <span className="text-red-400">🔇</span>}
                </div>
                
                <video 
                    ref={(el) => {
                        videoRef.current = el;
                        if (isLocal) localVideoRef.current = el;
                        else if (el) videoRefs.current[id] = el;
                    }}
                    autoPlay 
                    muted={isLocal} 
                    playsInline 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${showVideo ? 'opacity-100' : 'opacity-0'}`} 
                />
                
                <button 
                    onClick={() => setPinnedId(pinnedId === id ? null : id)} 
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all z-30 ${pinnedId === id ? 'bg-blue-600 text-white' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'}`}
                >
                    📌
                </button>
                
                {!showVideo && isLocal && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 z-[5]">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-700 rounded-full flex items-center justify-center text-2xl sm:text-3xl text-white/50 uppercase font-bold">
                            {name?.charAt(0) || "U"}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!isJoined) {
        return (
            <div className="fixed inset-0 w-full h-full bg-[#0a0a0a] flex items-center justify-center p-6 text-white z-[99999]">
                <div className="w-full max-w-md bg-neutral-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h1 className="text-2xl font-bold mb-6 text-center">Video Meeting</h1>
                    <form onSubmit={handleJoin} className="space-y-6">
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nama Lengkap" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-lg" required />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95">Bergabung Sekarang</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-full h-full bg-black flex flex-col overflow-hidden text-white">
            {/* Notification Bar */}
            <div className="fixed top-6 left-6 z-[10001] flex flex-col gap-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl text-sm font-medium text-white shadow-2xl flex items-center gap-3 animate-slide-in">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{n.message}
                    </div>
                ))}
            </div>

            {/* Main Fullscreen Stage */}
            <div className="flex-1 flex flex-row overflow-hidden relative p-3 sm:p-4 gap-4">
                <div className="flex-1 h-full relative overflow-hidden">
                    {layoutType === 'auto' && (
                        <div className={`grid gap-3 h-full w-full mx-auto pb-24 md:pb-2
                            ${participants.all.length === 1 ? 'grid-cols-1 max-w-5xl' : 
                              participants.all.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 
                              participants.all.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                            {participants.all.map(p => <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} />)}
                        </div>
                    )}
                    
                    {layoutType === 'grid' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-full w-full overflow-y-auto pb-24 custom-scrollbar">
                            {participants.all.map(p => <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} />)}
                        </div>
                    )}

                    {layoutType === 'focus' && (
                        <div className="w-full h-full pb-24 md:pb-2">
                            <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} />
                        </div>
                    )}

                    {layoutType === 'sidebar' && (
                        <div className="flex flex-col md:flex-row h-full gap-4 overflow-hidden pb-24 md:pb-0">
                            <div className="flex-[4] h-[60%] md:h-full"><VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} /></div>
                            <div className="flex-1 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto custom-scrollbar min-h-[150px]">
                                {participants.others.map(p => (
                                    <div key={p.id} className="min-w-[200px] md:min-w-0 aspect-video shrink-0"><VideoCard id={p.id} isLocal={p.isLocal} name={p.name} /></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Peserta */}
                {isParticipantsOpen && (
                    <div className="hidden lg:flex w-80 h-full bg-neutral-900 border border-white/10 rounded-[2rem] flex-col z-[100] animate-slide-in shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold">Peserta ({participantsList.length + 1})</h3>
                            <button onClick={() => setIsParticipantsOpen(false)} className="text-white/40 hover:text-white">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                            <div className="flex items-center gap-3 bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">ME</div>
                                <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{userName} (Anda)</p></div>
                                {isMicOn ? "🎤" : "🔇"}
                            </div>
                            {participantsList.filter(p => p.id !== socket.id).map((p) => (
                                <div key={p.id} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-transparent">
                                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center text-xs font-bold uppercase">{p.name?.charAt(0)}</div>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Layout Picker Modal */}
            {isLayoutModalOpen && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsLayoutModalOpen(false)} />
                    <div className="bg-neutral-900 text-white w-full max-w-xs rounded-[2.5rem] p-6 relative shadow-2xl border border-white/10 animate-scale-up">
                        <h3 className="text-xl font-bold mb-6 text-center">Ganti Tampilan</h3>
                        <div className="grid gap-2">
                            {['auto', 'grid', 'focus', 'sidebar'].map((type) => (
                                <button key={type} onClick={() => { setLayoutType(type); setIsLayoutModalOpen(false); }} 
                                    className={`py-4 px-6 rounded-2xl font-semibold capitalize transition-all ${layoutType === type ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Bottom Control Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]">
                <div className="bg-neutral-900/90 backdrop-blur-2xl p-3 px-6 rounded-full flex items-center gap-3 border border-white/10 shadow-2xl">
                    <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-neutral-800' : 'bg-red-600'}`}>{isMicOn ? "🎤" : "🔇"}</button>
                    <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'bg-neutral-800' : 'bg-red-600'}`}>{isCamOn ? "📹" : "🚫"}</button>
                    <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isScreenSharing ? 'bg-blue-600' : 'bg-neutral-800'}`}>{isScreenSharing ? "❌" : "🖥️"}</button>
                    
                    <div className="w-[1px] h-8 bg-white/10 mx-1" />
                    
                    <button onClick={() => setIsParticipantsOpen(!isParticipantsOpen)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isParticipantsOpen ? 'bg-blue-600' : 'bg-neutral-800'}`}>👥</button>
                    <button onClick={() => setIsLayoutModalOpen(true)} className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-white">⋮</button>
                    
                    <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all active:scale-95 ml-2">
                        <span>📞</span><span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                @keyframes slide-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .animate-slide-in { animation: slide-in 0.4s ease-out forwards; }
                @keyframes scale-up { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}