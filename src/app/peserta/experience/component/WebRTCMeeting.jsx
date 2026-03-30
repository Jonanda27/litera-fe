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
    const [layoutType, setLayoutType] = useState("auto");
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

    const [userName, setUserName] = useState("User-" + Math.floor(Math.random() * 1000));
    const [isEditingName, setIsEditingName] = useState(false);
    const [participantNames, setParticipantNames] = useState({}); 
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    // Initialize Camera & Mic
    useEffect(() => {
        start();

        return () => {
            Object.values(peersRef.current).forEach(pc => pc.close());
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
            if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop());
            socket.off("video_room_users");
            socket.off("video_user_joined");
            socket.off("webrtc_offer");
            socket.off("webrtc_answer");
            socket.off("webrtc_ice_candidate");
            socket.off("video_user_left");
            socket.off("update_user_name");
        };
    }, []);

    // SINKRONISASI STREAM (Memastikan video selalu nempel di setiap render)
    useEffect(() => {
        const syncStreams = () => {
            // Local Sync
            if (localVideoRef.current && localStreamRef.current) {
                const targetStream = isScreenSharing ? screenStreamRef.current : localStreamRef.current;
                if (localVideoRef.current.srcObject !== targetStream) {
                    localVideoRef.current.srcObject = targetStream;
                }
            }
            // Remotes Sync
            remoteStreams.forEach(user => {
                const videoEl = videoRefs.current[user.id];
                if (videoEl && user.stream && videoEl.srcObject !== user.stream) {
                    videoEl.srcObject = user.stream;
                }
            });
        };
        syncStreams();
    }, [remoteStreams, pinnedId, isScreenSharing, layoutType, isCamOn, isMicOn, isParticipantsOpen]);

    const participants = useMemo(() => {
        const all = [{ id: 'local', isLocal: true, stream: localStreamRef.current }, ...remoteStreams.map(s => ({ ...s, isLocal: false }))];
        const pinned = all.find(p => p.id === pinnedId) || all[0];
        const others = all.filter(p => p.id !== (pinnedId || all[0].id));
        return { pinned, others, all };
    }, [pinnedId, remoteStreams]);

    const initSocket = () => {
        socket.emit("join_video_room", { roomId, name: userName });

        socket.on("video_room_users", (users) => {
            const namesMap = {};
            users.forEach(({ socketId, name }) => {
                namesMap[socketId] = name;
                if (socketId !== socket.id) createPeerConnection(socketId, true);
            });
            setParticipantNames(namesMap);
        });

        socket.on("video_user_joined", ({ socketId, name }) => {
            addNotification(`${name || 'Seseorang'} bergabung`);
            setParticipantNames(prev => ({ ...prev, [socketId]: name }));
            createPeerConnection(socketId, true);
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
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("webrtc_ice_candidate", async ({ candidate, senderId }) => {
            const pc = peersRef.current[senderId];
            if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on("video_user_left", (id) => {
            const leftName = participantNames[id] || "Seseorang";
            addNotification(`${leftName} keluar`);
            if (peersRef.current[id]) { peersRef.current[id].close(); delete peersRef.current[id]; }
            if (audioAnalyzersRef.current[id]) { audioAnalyzersRef.current[id].stop(); delete audioAnalyzersRef.current[id]; }
            setRemoteStreams(prev => prev.filter(s => s.id !== id));
            setParticipantNames(prev => { const n = {...prev}; delete n[id]; return n; });
            if (pinnedId === id) setPinnedId(null);
        });

        socket.on("update_user_name", ({ socketId, name }) => {
            setParticipantNames(prev => ({ ...prev, [socketId]: name }));
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
            // PERBAIKAN: Gunakan functional update agar remoteStreams tidak menimpa satu sama lain
            setRemoteStreams(prev => {
                if (prev.find(s => s.id === targetId)) return prev;
                return [...prev, { id: targetId, stream: remoteStream }];
            });

            if (!audioAnalyzersRef.current[targetId]) {
                const monitor = monitorStream(remoteStream, targetId);
                if (monitor) audioAnalyzersRef.current[targetId] = monitor;
            }
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
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const monitor = monitorStream(stream);
            if (monitor) audioAnalyzersRef.current["local"] = monitor;
            
            initSocket();
        } catch (err) { console.error("❌ Media Error:", err); }
    };

    const toggleMic = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) { 
            track.enabled = !track.enabled; 
            setIsMicOn(track.enabled); 
            if (!track.enabled) setIsLocalSpeaking(false); 
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
                    const vs = pc.getSenders().find(s => s.track.kind === "video");
                    if (vs) vs.replaceTrack(screenTrack);
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
            const vs = pc.getSenders().find(s => s.track.kind === "video");
            if (vs) vs.replaceTrack(videoTrack);
        });
        setIsScreenSharing(false);
    };

    const handleUpdateName = (e) => {
        if (e.key === "Enter" || e.type === "blur") {
            setIsEditingName(false);
            socket.emit("change_name", { roomId, name: userName });
        }
    };

    const VideoCard = ({ id, isLocal, isPinned, customClass = "" }) => {
        const isSpeaking = isLocal ? isLocalSpeaking : speakingUsers[id];
        const displayName = isLocal ? userName : (participantNames[id] || "Peserta...");

        return (
            <div className={`relative group rounded-2xl overflow-hidden bg-neutral-900 border-4 transition-all duration-300 ${customClass}
                ${isSpeaking && (isLocal ? isMicOn : true) ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'border-transparent'}`}>
                
                <video 
                    key={`v-el-${id}`}
                    ref={el => {
                        if (isLocal) {
                            localVideoRef.current = el;
                            if (el && localStreamRef.current) el.srcObject = isScreenSharing ? screenStreamRef.current : localStreamRef.current;
                        } else if (el) {
                            videoRefs.current[id] = el;
                            // Tambahkan pengecekan aliran remote di sini
                            const remoteS = remoteStreams.find(s => s.id === id);
                            if (remoteS) el.srcObject = remoteS.stream;
                        }
                    }}
                    autoPlay 
                    muted={isLocal} 
                    playsInline 
                    onLoadedMetadata={(e) => e.target.play().catch(() => {})}
                    className="w-full h-full object-cover bg-neutral-800" 
                />

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[10px] sm:text-xs flex items-center gap-2 z-10">
                    {isLocal && isEditingName ? (
                        <input autoFocus className="bg-transparent border-b border-blue-400 outline-none w-20 sm:w-28 text-white" value={userName} onChange={(e) => setUserName(e.target.value)} onKeyDown={handleUpdateName} onBlur={handleUpdateName} />
                    ) : (
                        <span className={`font-semibold truncate max-w-[100px] sm:max-w-[180px] ${isLocal ? 'cursor-pointer hover:text-blue-300' : ''}`} onClick={() => isLocal && setIsEditingName(true)}>
                            {displayName} {isLocal && "✎"}
                        </span>
                    )}
                    {isLocal && !isMicOn && <span className="text-red-400">🔇</span>}
                    {!isLocal && speakingUsers[id] && <span className="animate-pulse">🔊</span>}
                </div>

                <button onClick={() => setPinnedId(pinnedId === id ? null : id)} className={`absolute top-3 right-3 p-2 rounded-full transition-all z-20 ${pinnedId === id ? 'bg-blue-600 text-white' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'}`}>📌</button>
                
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
            {/* NOTIFICATIONS */}
            <div className="fixed bottom-28 left-6 z-[10001] flex flex-col gap-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className="bg-neutral-900/90 text-white px-4 py-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-left duration-300">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">{n.message}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="flex-1 overflow-hidden p-4 sm:p-6 relative">
                    {layoutType === 'grid' && (
                        <div className="flex flex-wrap content-start justify-center gap-4 h-full overflow-y-auto pb-24">
                            {participants.all.map(p => <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} customClass="w-[300px] h-[220px] sm:w-[350px] sm:h-[250px]" />)}
                        </div>
                    )}
                    {layoutType === 'focus' && (
                        <div className="w-full h-full max-w-5xl mx-auto">
                            <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} customClass="w-full h-full" />
                        </div>
                    )}
                    {layoutType === 'sidebar' && (
                        <div className="flex h-full gap-4">
                            <div className="flex-[3] h-full"><VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} customClass="w-full h-full" /></div>
                            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar hidden md:flex max-w-[280px]">
                                {participants.others.map(p => <div key={p.id} className="w-full aspect-video shrink-0"><VideoCard id={p.id} isLocal={p.isLocal} customClass="w-full h-full" /></div>)}
                            </div>
                        </div>
                    )}
                    {layoutType === 'auto' && (
                        <div className={`grid gap-4 h-full w-full ${participants.all.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : participants.all.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
                            {participants.all.map(p => <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} customClass="w-full h-full" />)}
                        </div>
                    )}
                </div>

                {/* SIDEBAR DAFTAR PESERTA */}
                <div className={`transition-all duration-300 bg-neutral-900 border-l border-white/10 flex flex-col ${isParticipantsOpen ? 'w-80' : 'w-0 overflow-hidden opacity-0'}`}>
                    <div className="p-6 flex items-center justify-between border-b border-white/5">
                        <h3 className="text-white font-bold text-lg">Peserta ({participants.all.length})</h3>
                        <button onClick={() => setIsParticipantsOpen(false)} className="text-neutral-400 hover:text-white text-xl">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">Anda</div>
                                <span className="text-white font-medium truncate max-w-[120px]">{userName}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className={isLocalSpeaking ? 'text-green-400' : 'text-neutral-500'}>🔊</span>
                                {!isMicOn && <span className="text-red-400">🔇</span>}
                            </div>
                        </div>
                        {remoteStreams.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center font-bold text-white">{(participantNames[user.id] || "P").charAt(0).toUpperCase()}</div>
                                    <span className="text-neutral-200 truncate max-w-[120px]">{participantNames[user.id] || `Peserta ${user.id.slice(0,4)}`}</span>
                                </div>
                                <div className="flex gap-2">
                                    {speakingUsers[user.id] && <span className="text-green-400">🔊</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL LAYOUT */}
            {isLayoutModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setIsLayoutModalOpen(false)} />
                    <div className="bg-white text-neutral-900 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Tampilan</h3>
                            <button onClick={() => setIsLayoutModalOpen(false)} className="text-2xl">✕</button>
                        </div>
                        <div className="space-y-4">
                            {[{ id: 'auto', name: 'Otomatis', icon: '✦' }, { id: 'grid', name: 'Kotak', icon: '▦' }, { id: 'focus', name: 'Sorotan', icon: '▢' }, { id: 'sidebar', name: 'Sidebar', icon: '◫' }].map((item) => (
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

            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center z-[9999]">
                <div className="flex items-center gap-2 sm:gap-4 bg-neutral-900/90 backdrop-blur-2xl p-3 sm:p-4 px-6 sm:px-10 rounded-full border border-white/10 shadow-2xl mb-4">
                    <button onClick={toggleMic} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all ${isMicOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600'}`}>{isMicOn ? "🎤" : "🔇"}</button>
                    <button onClick={toggleCamera} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all ${isCamOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600'}`}>{isCamOn ? "📹" : "🚫"}</button>
                    <button onClick={toggleScreenShare} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all ${isScreenSharing ? 'bg-blue-600' : 'bg-neutral-800'}`}>🖥️</button>
                    <div className="w-[1px] h-8 bg-white/10 mx-1" />
                    <button onClick={() => setIsParticipantsOpen(!isParticipantsOpen)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all ${isParticipantsOpen ? 'bg-blue-600' : 'bg-neutral-800'}`}>👥</button>
                    <button onClick={() => setIsLayoutModalOpen(true)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-all text-white"><span className="text-xl font-bold">⋮</span></button>
                    <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"><span className="text-lg">📞</span><span className="hidden sm:inline">Keluar</span></button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
            `}</style>
        </div>
    );
}