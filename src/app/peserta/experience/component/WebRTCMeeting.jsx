"use client";

import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { socket } from "@/lib/sockets/socket";

// Komponen VideoCard dipindah ke luar agar tidak di-unmount paksa oleh React
const VideoCard = memo(({ id, isLocal, name, stream, isCamOn, isMicOn, isScreenSharing, pinnedId, setPinnedId, isHandRaised, customClass = "" }) => {
    const videoRef = useRef(null);
    const showVideo = isLocal ? (isCamOn || isScreenSharing) : true;

    // FIX KAMERA KOSONG: Mengikat stream dan memaksa play() saat metadata siap
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play().catch(e => console.error("Autoplay failed for", name, e));
            };
        }
    }, [stream, name]);

    return (
        <div className={`relative group rounded-2xl overflow-hidden bg-neutral-900 border-2 border-white/5 transition-all duration-300 shadow-xl ${customClass}`}>
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/60 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-white text-[10px] sm:text-xs flex items-center gap-2 z-30">
                <span className="font-bold truncate max-w-[80px] sm:max-w-[120px]">
                    {isLocal ? (isScreenSharing ? "Layar Anda" : `Anda (${name})`) : name}
                </span>
                {isLocal && !isMicOn && <span className="text-red-500">🔇</span>}
            </div>
            
            <video 
                ref={videoRef}
                autoPlay 
                muted={isLocal} 
                playsInline 
                className={`w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'}`} 
            />
            
            {/* INDIKATOR RAISE HAND */}
            {isHandRaised && (
                <div className="absolute top-2 right-10 sm:top-3 sm:right-14 bg-yellow-500/90 backdrop-blur-md px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-white z-30 animate-bounce shadow-lg text-[10px] sm:text-base">
                    ✋
                </div>
            )}

            <button 
                onClick={() => setPinnedId(pinnedId === id ? null : id)} 
                className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1 sm:p-1.5 rounded-lg sm:rounded-xl transition-all z-30 text-[10px] sm:text-base ${pinnedId === id ? 'bg-blue-600 text-white' : 'bg-black/40 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-md'}`}
            >
                📌
            </button>
            
            {!showVideo && isLocal && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 z-[5]">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-700 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white/30">
                        {name?.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}
        </div>
    );
});
VideoCard.displayName = "VideoCard";


export default function WebRTCMeeting({ roomId }) {
    const [userName, setUserName] = useState("");
    const [isJoined, setIsJoined] = useState(false);

    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const peersRef = useRef({});
    
    // Antrian Sinyal & ICE
    const makingOffer = useRef({}); 
    const ignoreOffer = useRef({}); 
    const iceCandidatesQueue = useRef({}); 

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // STATE RAISE HAND ✋
    const [isLocalHandRaised, setIsLocalHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState([]);

    const [pinnedId, setPinnedId] = useState(null); 
    const [layoutType, setLayoutType] = useState("auto");
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

    const [participantsList, setParticipantsList] = useState([]); 
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // STATE CHAT
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatOpen) scrollToBottom();
    }, [messages, isChatOpen]);

    const addNotification = useCallback((message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    }, []);

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
            socket.off("new_chat_message");
            socket.off("user_toggled_hand"); 
        };
    }, []);

    const initSocket = () => {
        socket.emit("join_video_room", { roomId, name: userName });
        
        socket.on("video_room_users", (users) => {
            const normalizedUsers = users.map(u => typeof u === 'string' ? { id: u, name: `User_${u.slice(0,4)}` } : u);
            setParticipantsList(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newUsers = normalizedUsers.filter(u => !existingIds.has(u.id));
                return [...prev, ...newUsers];
            });

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

        socket.on("new_chat_message", (msg) => {
            setMessages(prev => [...prev, msg]);
            if (!isChatOpen) addNotification(`Pesan baru dari ${msg.senderName}`);
        });

        // LISTENER RAISE HAND
        socket.on("user_toggled_hand", ({ userId, isRaised, name }) => {
            setRaisedHands(prev => {
                if (isRaised) {
                    if (!prev.includes(userId)) return [...prev, userId];
                    return prev;
                } else {
                    return prev.filter(id => id !== userId);
                }
            });
            if (isRaised) addNotification(`✋ ${name} mengacungkan tangan`);
        });

        socket.on("webrtc_offer", async ({ offer, senderId }) => {
            try {
                const pc = await createPeerConnection(senderId, false);
                
                const readyForOffer = !makingOffer.current[senderId] && (pc.signalingState === "stable" || ignoreOffer.current[senderId]);
                const offerCollision = !readyForOffer;
                ignoreOffer.current[senderId] = offerCollision;

                if (offerCollision) return;

                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                
                if (iceCandidatesQueue.current[senderId]) {
                    iceCandidatesQueue.current[senderId].forEach(candidate => pc.addIceCandidate(candidate).catch(() => {}));
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
                        iceCandidatesQueue.current[senderId].forEach(candidate => pc.addIceCandidate(candidate).catch(() => {}));
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
            setRaisedHands(prev => prev.filter(uid => uid !== id));

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
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" },
                { urls: "stun:stun3.l.google.com:19302" },
                { urls: "stun:stun4.l.google.com:19302" }
            ],
        });

        peersRef.current[targetId] = pc;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        }

        pc.ontrack = (event) => {
            setRemoteStreams(prev => {
                if (prev.find(s => s.id === targetId)) return prev;
                return [...prev, { id: targetId, stream: event.streams[0] }];
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

    const handleToggleRaiseHand = () => {
        const newState = !isLocalHandRaised;
        setIsLocalHandRaised(newState);
        
        setRaisedHands(prev => {
            if (newState) return [...prev, 'local'];
            return prev.filter(id => id !== 'local');
        });

        socket.emit("toggle_raise_hand", { roomId, isRaised: newState, name: userName });
    };

    const sendChat = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const msgData = {
            senderId: socket.id,
            senderName: userName,
            text: chatInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        socket.emit("send_chat_message", { roomId, message: msgData });
        setMessages(prev => [...prev, msgData]);
        setChatInput("");
    };

    const getParticipantStream = useCallback((isLocal, pId) => {
        if (isLocal) return isScreenSharing ? screenStreamRef.current : localStreamRef.current;
        return remoteStreams.find(s => s.id === pId)?.stream || null;
    }, [isScreenSharing, remoteStreams]);

    const participants = useMemo(() => {
        const all = [{ id: 'local', isLocal: true, name: userName || "Anda" }, ...remoteStreams.map(s => {
            const pInfo = participantsList.find(p => p.id === s.id);
            return { ...s, isLocal: false, name: pInfo?.name || `User_${s.id?.slice(0, 4)}` };
        })];
        const pinned = all.find(p => p.id === pinnedId) || all[0];
        const others = all.filter(p => p.id !== pinned.id);
        return { pinned, others, all };
    }, [pinnedId, remoteStreams, participantsList, userName]);

    if (!isJoined) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center p-4 sm:p-6 text-white z-[99999]">
                <div className="w-full max-w-md bg-neutral-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h1 className="text-xl sm:text-2xl font-black mb-6 text-center">Join Meeting</h1>
                    <form onSubmit={handleJoin} className="space-y-4 sm:space-y-6">
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nama Anda" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm sm:text-base" required />
                        <button type="submit" className="w-full bg-blue-600 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg transition-all active:scale-95">Bergabung</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black flex flex-col md:flex-row overflow-hidden text-white font-sans">
            <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                {/* NOTIFIKASI */}
                <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[10001] flex flex-col gap-2 pointer-events-none w-max max-w-[80vw]">
                    {notifications.map(n => (
                        <div key={n.id} className="bg-neutral-900/90 backdrop-blur-md border border-white/10 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold text-white shadow-2xl flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-left duration-500">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" />{n.message}
                        </div>
                    ))}
                </div>

                {/* AREA VIDEO GRID RESPONSIVE */}
                <div className="flex-1 w-full h-full relative p-2 sm:p-4 pb-24 sm:pb-28 overflow-y-auto no-scrollbar">
                    {layoutType === 'auto' && (
                        <div className={`grid gap-2 sm:gap-4 w-full h-full mx-auto transition-all duration-500 content-center ${participants.all.length === 1 ? 'grid-cols-1 max-w-5xl' : participants.all.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 max-w-7xl' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                            {participants.all.map(p => (
                                <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} stream={getParticipantStream(p.isLocal, p.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(p.id)} customClass="w-full h-full min-h-[25vh] sm:min-h-0" />
                            ))}
                        </div>
                    )}
                    {layoutType === 'grid' && (
                        <div className="w-full h-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 content-start">
                            {participants.all.map(p => (
                                <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} stream={getParticipantStream(p.isLocal, p.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(p.id)} customClass="aspect-video w-full h-auto" />
                            ))}
                        </div>
                    )}
                    {layoutType === 'focus' && (
                        <div className="w-full h-full flex items-center justify-center">
                            <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} stream={getParticipantStream(participants.pinned.isLocal, participants.pinned.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(participants.pinned.id)} customClass="w-full h-full max-w-6xl" />
                        </div>
                    )}
                    {layoutType === 'sidebar' && (
                        <div className="w-full h-full flex flex-col md:flex-row gap-2 sm:gap-4">
                            <div className="flex-[3] h-full overflow-hidden">
                                <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} stream={getParticipantStream(participants.pinned.isLocal, participants.pinned.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(participants.pinned.id)} customClass="w-full h-full" />
                            </div>
                            <div className="flex-1 flex flex-row md:flex-col gap-2 sm:gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar">
                                {participants.others.map(p => (
                                    <div key={p.id} className="min-w-[140px] sm:min-w-[180px] md:min-w-0 w-full aspect-video shrink-0">
                                        <VideoCard id={p.id} isLocal={p.isLocal} name={p.name} stream={getParticipantStream(p.isLocal, p.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(p.id)} customClass="w-full h-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* TOOLBAR BAWAH RESPONSIVE */}
                <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[10006] w-max max-w-[95vw]">
                    <div className="bg-[#1e1e1e]/90 backdrop-blur-3xl p-2 sm:p-4 px-4 sm:px-8 rounded-full flex items-center gap-2 sm:gap-3 md:gap-5 border border-white/10 shadow-2xl overflow-x-auto no-scrollbar">
                        <button onClick={toggleMic} className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center transition-all text-sm sm:text-base ${isMicOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600 hover:bg-red-700'}`}>{isMicOn ? "🎤" : "🔇"}</button>
                        <button onClick={toggleCamera} className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center transition-all text-sm sm:text-base ${isCamOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600 hover:bg-red-700'}`}>{isCamOn ? "📹" : "🚫"}</button>
                        <button onClick={toggleScreenShare} className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center transition-all text-sm sm:text-base ${isScreenSharing ? 'bg-blue-600' : 'bg-neutral-800 hover:bg-neutral-700'}`}>{isScreenSharing ? "❌" : "🖥️"}</button>
                        
                        {/* TOMBOL RAISE HAND ✋ */}
                        <button onClick={handleToggleRaiseHand} className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center transition-all text-sm sm:text-base ${isLocalHandRaised ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}>✋</button>

                        <div className="w-[1px] h-6 sm:h-8 bg-white/10 mx-1 shrink-0" />
                        
                        <button onClick={() => { setIsChatOpen(!isChatOpen); setIsParticipantsOpen(false); }} className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center transition-all text-sm sm:text-base ${isChatOpen ? 'bg-blue-600' : 'bg-neutral-800 hover:bg-neutral-700'}`}>💬</button>
                        <button onClick={() => { setIsParticipantsOpen(!isParticipantsOpen); setIsChatOpen(false); }} className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center transition-all text-sm sm:text-base ${isParticipantsOpen ? 'bg-blue-600' : 'bg-neutral-800 hover:bg-neutral-700'}`}>👥</button>
                        <button onClick={() => setIsLayoutModalOpen(true)} className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-sm sm:text-base">⋮</button>
                        
                        <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-90 text-sm shrink-0"><span>📞</span><span className="hidden sm:inline">Keluar</span></button>
                    </div>
                </div>
            </div>

            {/* AREA KANAN: RIGHTBAR (CHAT & PARTICIPANTS) */}
            {/* Pada Mobile: Fixed overlay menutupi layar. Pada Tablet/Desktop: Muncul di samping w-80/w-96 */}
            {(isChatOpen || isParticipantsOpen) && (
                <div className="fixed inset-0 z-[20000] md:relative md:inset-auto w-full md:w-80 lg:w-96 h-full bg-[#1e1e1e] border-l border-white/5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                    {isChatOpen && (
                        <div className="flex flex-col h-full">
                            <div className="p-4 sm:p-5 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                                <h3 className="text-white font-bold text-base sm:text-lg">Pesan Rapat</h3>
                                <button onClick={() => setIsChatOpen(false)} className="text-white/50 hover:text-white p-2">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] sm:text-xs text-white/40 text-center leading-tight">Pesan bersifat sementara dan akan hilang setelah rapat berakhir.</p>
                                </div>
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex flex-col ${msg.senderId === socket.id ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-blue-400">{msg.senderName}</span>
                                            <span className="text-[8px] sm:text-[9px] text-white/20">{msg.timestamp}</span>
                                        </div>
                                        <div className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm max-w-[90%] break-words shadow-lg ${msg.senderId === socket.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-3 sm:p-4 border-t border-white/5 bg-[#1a1a1a] pb-8 md:pb-4">
                                <form onSubmit={sendChat} className="relative">
                                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Tulis pesan..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 sm:py-3.5 pl-4 sm:pl-5 pr-12 text-sm outline-none focus:border-blue-500 transition-all placeholder:text-white/20" />
                                    <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-500 p-2.5 hover:bg-white/5 rounded-full transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {isParticipantsOpen && (
                        <div className="flex flex-col h-full">
                            <div className="p-4 sm:p-5 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                                <h3 className="text-white font-bold text-base sm:text-lg">Peserta ({participantsList.length + 1})</h3>
                                <button onClick={() => setIsParticipantsOpen(false)} className="text-white/50 hover:text-white p-2">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 custom-scrollbar pb-8 md:pb-4">
                                <div className="flex items-center gap-3 sm:gap-4 bg-blue-600/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-500/20">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex shrink-0 items-center justify-center text-white text-[10px] sm:text-xs font-bold">ME</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-bold truncate flex items-center gap-1">
                                            {userName} (Anda)
                                            {isLocalHandRaised && <span className="text-[10px] sm:text-xs">✋</span>}
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] text-white/30 truncate">ID: {socket.id?.slice(0, 8)}</p>
                                    </div>
                                    <div className="flex gap-1 sm:gap-2 text-xs sm:text-sm shrink-0"><span>{isMicOn ? "🎤" : "🔇"}</span><span>{isCamOn ? "📹" : "🚫"}</span></div>
                                </div>
                                {participantsList.filter(p => p.id !== socket.id).map((p) => (
                                    <div key={p.id} className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-800 rounded-full flex shrink-0 items-center justify-center text-white text-[10px] sm:text-xs font-bold">{p.name?.charAt(0).toUpperCase()}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-bold truncate flex items-center gap-1">
                                                {p.name}
                                                {raisedHands.includes(p.id) && <span className="text-[10px] sm:text-xs">✋</span>}
                                            </p>
                                            <p className="text-[9px] sm:text-[10px] text-white/20">Peserta Rapat</p>
                                        </div>
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL GANTI TAMPILAN */}
            {isLayoutModalOpen && (
                <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setIsLayoutModalOpen(false)} />
                    <div className="bg-[#1e1e1e] border border-white/10 w-full max-w-[90vw] sm:max-w-xs rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 text-center">Tampilan Video</h3>
                        <div className="grid grid-cols-1 gap-2 sm:gap-3">
                            {['auto', 'grid', 'focus', 'sidebar'].map((type) => (
                                <button key={type} onClick={() => { setLayoutType(type); setIsLayoutModalOpen(false); }} className={`py-3 sm:py-4 rounded-xl font-bold capitalize transition-all text-sm sm:text-base ${layoutType === type ? 'bg-blue-600 shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}>{type}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                
                /* Class khusus menyembunyikan scrollbar di menu toolbar agar terlihat bersih */
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-in { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}