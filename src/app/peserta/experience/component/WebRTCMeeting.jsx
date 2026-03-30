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
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
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
            socket.off("update_user_name");
        };
    }, []);

    // Sinkronisasi Video Stream agar tidak flicker saat re-render
    useEffect(() => {
        const syncStreams = () => {
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
                }
            });
        };
        syncStreams();
    }, [remoteStreams, pinnedId, isScreenSharing, layoutType, isParticipantsOpen]);

    const participants = useMemo(() => {
        const all = [{ id: 'local', isLocal: true }, ...remoteStreams.map(s => ({ id: s.id, isLocal: false }))];
        const pinned = all.find(p => p.id === pinnedId) || all[0];
        const others = all.filter(p => p.id !== pinned.id);
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
            addNotification(`${participantNames[id] || 'Seseorang'} keluar`);
            if (peersRef.current[id]) { peersRef.current[id].close(); delete peersRef.current[id]; }
            setRemoteStreams(prev => prev.filter(s => s.id !== id));
            setParticipantNames(prev => { const n = {...prev}; delete n[id]; return n; });
        });

        socket.on("update_user_name", ({ socketId, name }) => {
            setParticipantNames(prev => ({ ...prev, [socketId]: name }));
        });
    };

    const createPeerConnection = async (targetId, isInitiator) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        peersRef.current[targetId] = pc;

        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            // PENTING: Gunakan Functional Update (prev => ...) agar user lain tidak hilang
            setRemoteStreams(prev => {
                if (prev.find(s => s.id === targetId)) return prev;
                return [...prev, { id: targetId, stream: remoteStream }];
            });
            monitorStream(remoteStream, targetId);
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
            
            const checkVolume = () => {
                if (!analyser) return;
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
                const speaking = average > 30;
                if (socketId === null) setIsLocalSpeaking(speaking);
                else setSpeakingUsers(prev => ({ ...prev, [socketId]: speaking }));
                requestAnimationFrame(checkVolume);
            };
            checkVolume();
        } catch (e) {}
    };

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            initSocket();
        } catch (err) { console.error("Media Error:", err); }
    };

    const toggleMic = () => {
        const t = localStreamRef.current?.getAudioTracks()[0];
        if (t) { t.enabled = !t.enabled; setIsMicOn(t.enabled); }
    };

    const toggleCamera = () => {
        const t = localStreamRef.current?.getVideoTracks()[0];
        if (t) { t.enabled = !t.enabled; setIsCamOn(t.enabled); }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenStreamRef.current = stream;
            setIsScreenSharing(true);
            Object.values(peersRef.current).forEach(pc => {
                const vs = pc.getSenders().find(s => s.track.kind === "video");
                vs.replaceTrack(stream.getVideoTracks()[0]);
            });
            stream.getVideoTracks()[0].onended = () => stopScreenSharing();
        } else { stopScreenSharing(); }
    };

    const stopScreenSharing = () => {
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        setIsScreenSharing(false);
        Object.values(peersRef.current).forEach(pc => {
            const vs = pc.getSenders().find(s => s.track.kind === "video");
            vs.replaceTrack(localStreamRef.current.getVideoTracks()[0]);
        });
    };

    const VideoCard = ({ id, isLocal, customClass = "" }) => {
        const isSpeaking = isLocal ? isLocalSpeaking : speakingUsers[id];
        const nameLabel = isLocal ? userName : (participantNames[id] || "Peserta");

        return (
            <div className={`relative group rounded-2xl overflow-hidden bg-neutral-900 border-4 transition-all duration-300 ${customClass}
                ${isSpeaking && (isLocal ? isMicOn : true) ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'border-transparent'}`}>
                
                <video
                    key={`vid-${id}`}
                    ref={el => { if (isLocal) localVideoRef.current = el; else if (el) videoRefs.current[id] = el; }}
                    autoPlay muted={isLocal} playsInline className="w-full h-full object-cover bg-neutral-800"
                />

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[11px] z-10 flex items-center gap-2">
                    <span onClick={() => isLocal && setIsEditingName(true)} className={isLocal ? "cursor-pointer hover:text-blue-300" : ""}>
                        {isLocal && isEditingName ? "" : nameLabel} {isLocal && !isEditingName && "✎"}
                    </span>
                    {isLocal && isEditingName && (
                        <input autoFocus className="bg-transparent border-b outline-none w-20" value={userName} 
                        onChange={(e) => setUserName(e.target.value)} onBlur={() => {setIsEditingName(false); socket.emit("change_name", {roomId, name: userName})}} />
                    )}
                    {isLocal && !isMicOn && <span>🔇</span>}
                </div>

                <button onClick={() => setPinnedId(pinnedId === id ? null : id)} className={`absolute top-3 right-3 p-2 rounded-full z-20 ${pinnedId === id ? 'bg-blue-600' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>📌</button>
                
                {isLocal && !isCamOn && !isScreenSharing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-3xl">👤</div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col text-white overflow-hidden">
            <div className="flex flex-1 overflow-hidden relative">
                <div className="flex-1 p-4 pb-28 relative overflow-y-auto">
                    {pinnedId ? (
                        <div className="flex h-full gap-4 lg:flex-row flex-col">
                            <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} customClass="flex-[3] h-full" />
                            <div className="flex-1 flex lg:flex-col flex-row gap-4 overflow-auto lg:max-w-[280px]">
                                {participants.others.map(p => <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} customClass="aspect-video shrink-0 w-[200px] lg:w-full" />)}
                            </div>
                        </div>
                    ) : (
                        <div className={`grid gap-4 w-full h-full content-center justify-center ${participants.all.length <= 1 ? 'grid-cols-1 max-w-2xl mx-auto' : participants.all.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
                            {participants.all.map(p => <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} customClass="aspect-video w-full" />)}
                        </div>
                    )}
                </div>

                {isParticipantsOpen && (
                    <div className="w-80 bg-neutral-900 border-l border-white/10 p-6 z-50">
                        <h3 className="text-xl font-bold mb-4 flex justify-between">Peserta <button onClick={() => setIsParticipantsOpen(false)}>✕</button></h3>
                        {participants.all.map(p => (
                            <div key={p.id} className="flex justify-between p-3 bg-white/5 rounded-xl mb-2 italic">
                                {p.isLocal ? userName + " (Anda)" : (participantNames[p.id] || "Peserta")}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-28 left-6 space-y-2 z-50">
                {notifications.map(n => <div key={n.id} className="bg-blue-600 px-4 py-2 rounded-xl animate-in slide-in-from-left">{n.message}</div>)}
            </div>

            <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-xl flex items-center justify-center gap-4 z-[1000] border-t border-white/10">
                <button onClick={toggleMic} className={`p-4 rounded-full ${isMicOn ? 'bg-neutral-800' : 'bg-red-600'}`}>🎤</button>
                <button onClick={toggleCamera} className={`p-4 rounded-full ${isCamOn ? 'bg-neutral-800' : 'bg-red-600'}`}>📹</button>
                <button onClick={toggleScreenShare} className={`p-4 rounded-full ${isScreenSharing ? 'bg-blue-600' : 'bg-neutral-800'}`}>🖥️</button>
                <button onClick={() => setIsParticipantsOpen(!isParticipantsOpen)} className="p-4 rounded-full bg-neutral-800">👥</button>
                <button onClick={() => setIsLayoutModalOpen(true)} className="p-4 rounded-full bg-neutral-800">⋮</button>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 rounded-full font-bold">Keluar</button>
            </div>

            {isLayoutModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000]">
                    <div className="bg-white text-black p-8 rounded-3xl w-80 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Layout</h3>
                        <button onClick={() => {setPinnedId(null); setIsLayoutModalOpen(false)}} className="w-full p-3 border rounded-xl mb-2">Otomatis</button>
                        <button onClick={() => {setPinnedId('local'); setIsLayoutModalOpen(false)}} className="w-full p-3 border rounded-xl">Fokus</button>
                        <button onClick={() => setIsLayoutModalOpen(false)} className="w-full mt-4 text-neutral-400">Batal</button>
                    </div>
                </div>
            )}
        </div>
    );
}