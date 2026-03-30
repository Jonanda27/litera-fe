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
    const videoRefs = useRef({}); // Koleksi elemen video remote
    
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

    // Fungsi Utama untuk menempelkan stream ke elemen video
    const attachStreamToVideo = useCallback((id, stream) => {
        const el = videoRefs.current[id];
        if (el && stream && el.srcObject !== stream) {
            console.log(`🔗 Menempelkan stream ke video user: ${id}`);
            el.srcObject = stream;
            el.play().catch(e => console.warn("Autoplay ditunda:", e));
        }
    }, []);

    // Sync setiap kali remoteStreams berubah
    useEffect(() => {
        remoteStreams.forEach(s => attachStreamToVideo(s.id, s.stream));
    }, [remoteStreams, attachStreamToVideo]);

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
            // User baru yang bergabung akan menunggu penawaran dari kita (kita initiator)
            createPeerConnection(newUser.id, true);
        });

        socket.on("webrtc_offer", async ({ offer, senderId }) => {
            try {
                const pc = await createPeerConnection(senderId, false);
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                
                if (iceCandidatesQueue.current[senderId]) {
                    for (const candidate of iceCandidatesQueue.current[senderId]) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
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
                if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                    if (iceCandidatesQueue.current[senderId]) {
                        for (const candidate of iceCandidatesQueue.current[senderId]) {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                        delete iceCandidatesQueue.current[senderId];
                    }
                }
            } catch (err) { console.error("Answer Error:", err); }
        });

        socket.on("webrtc_ice_candidate", async ({ candidate, senderId }) => {
            try {
                const pc = peersRef.current[senderId];
                if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } else {
                    if (!iceCandidatesQueue.current[senderId]) iceCandidatesQueue.current[senderId] = [];
                    iceCandidatesQueue.current[senderId].push(candidate);
                }
            } catch (err) { console.error("Error add ICE:", err); }
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
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
        });

        peersRef.current[targetId] = pc;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        }

        pc.ontrack = (event) => {
            console.log("Track masuk dari:", targetId);
            const [remoteStream] = event.streams;
            setRemoteStreams(prev => {
                if (prev.find(s => s.id === targetId)) return prev;
                return [...prev, { id: targetId, stream: remoteStream }];
            });
        };

        pc.onicecandidate = (e) => { 
            if (e.candidate) socket.emit("webrtc_ice_candidate", { target: targetId, candidate: e.candidate, senderId: socket.id }); 
        };

        pc.onnegotiationneeded = async () => {
            if (!isInitiator) return;
            try {
                if (makingOffer.current[targetId]) return;
                makingOffer.current[targetId] = true;
                const offer = await pc.createOffer();
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

    const VideoCard = ({ id, isLocal, name, stream, customClass = "" }) => {
        const showVideo = isLocal ? (isCamOn || isScreenSharing) : true;
        
        return (
            <div className={`relative group rounded-3xl overflow-hidden bg-neutral-900 border border-white/5 transition-all duration-500 w-full h-full shadow-2xl ${customClass}`}>
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-xl px-3 py-1.5 rounded-2xl text-white text-[11px] font-bold z-30 flex items-center gap-2 border border-white/10">
                    <span className="truncate max-w-[120px]">{isLocal ? (isScreenSharing ? "Layar Anda" : `Anda (${name})`) : name}</span>
                    {isLocal && !isMicOn && <span className="text-red-500">🔇</span>}
                </div>
                
                <video 
                    ref={el => {
                        if (isLocal) localVideoRef.current = el;
                        else if (el) {
                            videoRefs.current[id] = el;
                            // Langsung tempel stream saat elemen tersedia
                            if (stream) el.srcObject = stream;
                        }
                    }}
                    autoPlay 
                    muted={isLocal} 
                    playsInline 
                    className={`w-full h-full object-cover transition-opacity duration-700 ${showVideo ? 'opacity-100' : 'opacity-0'}`} 
                />
                
                {!showVideo && isLocal && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 z-[5]">
                        <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center text-3xl font-black text-white/40 uppercase tracking-tighter">
                            {name?.charAt(0)}
                        </div>
                    </div>
                )}

                <button onClick={() => setPinnedId(pinnedId === id ? null : id)} className={`absolute top-4 right-4 p-2.5 rounded-full z-30 transition-all ${pinnedId === id ? 'bg-blue-600 text-white shadow-lg' : 'bg-black/20 text-white opacity-0 group-hover:opacity-100 hover:bg-black/50'}`}>📌</button>
            </div>
        );
    };

    if (!isJoined) {
        return (
            <div className="fixed inset-0 bg-[#080808] flex items-center justify-center p-6 text-white z-[99999]">
                <div className="w-full max-w-md bg-[#121212] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl shadow-2xl shadow-blue-600/30">📹</div>
                        <h1 className="text-3xl font-black tracking-tight">Meet App</h1>
                        <p className="text-white/40 mt-2">Masukkan nama untuk bergabung</p>
                    </div>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nama Anda..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-lg font-medium" required />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-xl shadow-blue-600/20">Mulai Meeting</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-full h-full bg-[#050505] flex flex-col overflow-hidden text-white font-sans">
            <div className="fixed top-6 left-6 z-[10001] flex flex-col gap-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-2xl flex items-center gap-3 animate-slide-right">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> {n.message}
                    </div>
                ))}
            </div>

            <main className="flex-1 flex flex-row overflow-hidden relative p-4 gap-4">
                <div className="flex-1 h-full relative overflow-hidden">
                    <div className={`h-full w-full custom-scrollbar overflow-y-auto pb-24 md:pb-0
                        ${layoutType === 'grid' || layoutType === 'auto' ? 'grid gap-4 content-center justify-center' : ''}
                        ${layoutType === 'auto' && participants.all.length === 1 ? 'grid-cols-1 max-w-5xl mx-auto' : ''}
                        ${layoutType === 'auto' && participants.all.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
                        ${layoutType === 'auto' && participants.all.length > 2 ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}
                        ${layoutType === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : ''}
                    `}>
                        {(layoutType === 'auto' || layoutType === 'grid') && participants.all.map(p => (
                            <div key={p.id} className="aspect-video w-full"><VideoCard id={p.id} isLocal={p.isLocal} name={p.name} stream={p.stream} /></div>
                        ))}
                        
                        {layoutType === 'focus' && <div className="w-full h-full"><VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} stream={participants.pinned.stream} /></div>}
                        
                        {layoutType === 'sidebar' && (
                            <div className="flex flex-col md:flex-row h-full gap-4 w-full">
                                <div className="flex-[4] h-[60%] md:h-full"><VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} stream={participants.pinned.stream} /></div>
                                <div className="flex-1 flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto custom-scrollbar pr-1 min-h-[120px]">
                                    {participants.others.map(p => (
                                        <div key={p.id} className="min-w-[180px] md:min-w-0 aspect-video shrink-0"><VideoCard id={p.id} isLocal={p.isLocal} name={p.name} stream={p.stream} /></div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isParticipantsOpen && (
                    <aside className="hidden lg:flex w-80 h-full bg-[#121212] border border-white/5 rounded-[2.5rem] flex-col z-[100] animate-slide-left shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="font-black text-sm tracking-widest uppercase">Peserta ({participantsList.length + 1})</h3>
                            <button onClick={() => setIsParticipantsOpen(false)} className="hover:rotate-90 transition-transform text-xl">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                            <div className="flex items-center gap-4 bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20">
                                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-bold">A</div>
                                <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{userName} (Anda)</p></div>
                            </div>
                            {participantsList.filter(p => p.id !== socket.id).map((p) => (
                                <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-transparent">
                                    <div className="w-10 h-10 bg-neutral-800 rounded-2xl flex items-center justify-center font-bold uppercase">{p.name?.charAt(0)}</div>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                                </div>
                            ))}
                        </div>
                    </aside>
                )}
            </main>

            {/* Bottom Controls */}
            <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-max">
                <div className="bg-neutral-900/60 backdrop-blur-3xl p-3 px-8 rounded-[3rem] flex items-center gap-4 border border-white/10 shadow-2xl scale-90 sm:scale-100">
                    <button onClick={toggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isMicOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600 shadow-lg shadow-red-600/40'}`}>{isMicOn ? "🎤" : "🔇"}</button>
                    <button onClick={toggleCamera} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isCamOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600 shadow-lg shadow-red-600/40'}`}>{isCamOn ? "📹" : "🚫"}</button>
                    <button onClick={toggleScreenShare} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isScreenSharing ? 'bg-blue-600 shadow-lg shadow-blue-600/40' : 'bg-neutral-800'}`}>{isScreenSharing ? "❌" : "🖥️"}</button>
                    
                    <div className="w-[1px] h-10 bg-white/10 mx-2" />
                    
                    <button onClick={() => setIsParticipantsOpen(!isParticipantsOpen)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isParticipantsOpen ? 'bg-blue-600' : 'bg-neutral-800'}`}>👥</button>
                    <button onClick={() => setIsLayoutModalOpen(true)} className="w-14 h-14 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-all text-white">⋮</button>
                    
                    <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 ml-2 shadow-xl shadow-red-600/20">Keluar</button>
                </div>
            </footer>

            {/* Layout Modal */}
            {isLayoutModalOpen && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsLayoutModalOpen(false)} />
                    <div className="bg-[#121212] text-white w-full max-w-xs rounded-[3rem] p-8 relative shadow-2xl border border-white/5 animate-pop">
                        <h3 className="text-xl font-black mb-6 text-center tracking-tight">Tampilan</h3>
                        <div className="grid gap-3">
                            {['auto', 'grid', 'focus', 'sidebar'].map((type) => (
                                <button key={type} onClick={() => { setLayoutType(type); setIsLayoutModalOpen(false); }} 
                                    className={`py-4 px-6 rounded-2xl font-bold capitalize transition-all border ${layoutType === type ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                @keyframes slide-right { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slide-left { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .animate-slide-right { animation: slide-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-left { animation: slide-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-pop { animation: pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}