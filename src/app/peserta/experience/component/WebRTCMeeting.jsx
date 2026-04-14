"use client";

import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { socket } from "@/lib/sockets/socket";

// Komponen VideoCard tetap dipertahankan dengan Memo untuk performa
const VideoCard = memo(({ id, isLocal, name, stream, isCamOn, isMicOn, isScreenSharing, pinnedId, setPinnedId, isHandRaised, customClass = "" }) => {
    const videoRef = useRef(null);
    const showVideo = isLocal ? (isCamOn || isScreenSharing) : true;

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

    // Pola Perfect Negotiation untuk handle banyak user tanpa tabrakan sinyal
    const makingOffer = useRef({});
    const ignoreOffer = useRef({});

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isLocalHandRaised, setIsLocalHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState([]);
    const [pinnedId, setPinnedId] = useState(null);
    const [layoutType, setLayoutType] = useState("auto");
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
    const [participantsList, setParticipantsList] = useState([]);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatEndRef = useRef(null);

    const addNotification = useCallback((message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    }, []);

    // Logic Peer Connection yang Diperbaiki (Stable Multi-user)
    const createPeerConnection = useCallback(async (targetId, isInitiator) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" }
            ],
        });

        peersRef.current[targetId] = pc;

        // Tambahkan track lokal (Mic & Cam)
        localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                socket.emit("webrtc_ice_candidate", { target: targetId, candidate, senderId: socket.id });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStreams(prev => {
                if (prev.find(s => s.id === targetId)) return prev;
                return [...prev, { id: targetId, stream: event.streams[0] }];
            });
        };

        // Otomatisasi Negosiasi
        pc.onnegotiationneeded = async () => {
            try {
                makingOffer.current[targetId] = true;
                await pc.setLocalDescription(); // Implicitly creates offer
                socket.emit("webrtc_offer", { target: targetId, offer: pc.localDescription, senderId: socket.id });
            } catch (err) {
                console.error("Negotiation error:", err);
            } finally {
                makingOffer.current[targetId] = false;
            }
        };

        return pc;
    }, []);

    const initSocket = useCallback(() => {
        socket.emit("join_video_room", { roomId, name: userName });

        socket.on("video_room_users", (users) => {
            const normalizedUsers = users.map(u => typeof u === 'string' ? { id: u, name: `User_${u.slice(0, 4)}` } : u);
            setParticipantsList(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newUsers = normalizedUsers.filter(u => !existingIds.has(u.id));
                return [...prev, ...newUsers];
            });

            // Hubungi user yang sudah ada
            normalizedUsers.forEach(user => {
                if (user.id !== socket.id) createPeerConnection(user.id, true);
            });
        });

        socket.on("video_user_joined", (data) => {
            const newUser = typeof data === 'string' ? { id: data, name: `User_${data.slice(0, 4)}` } : data;
            addNotification(`${newUser.name} bergabung`);
            setParticipantsList(prev => [...prev.filter(p => p.id !== newUser.id), newUser]);
        });

        socket.on("webrtc_offer", async ({ offer, senderId }) => {
            try {
                const pc = await createPeerConnection(senderId, false);
                const offerCollision = makingOffer.current[senderId] || pc.signalingState !== "stable";

                // Pola Polite Peer (Mencegah collision pada 2 user yang join bersamaan)
                ignoreOffer.current[senderId] = !isInitiator && offerCollision;
                if (ignoreOffer.current[senderId]) return;

                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                await pc.setLocalDescription();
                socket.emit("webrtc_answer", { target: senderId, answer: pc.localDescription, senderId: socket.id });
            } catch (err) { console.error(err); }
        });

        socket.on("webrtc_answer", async ({ answer, senderId }) => {
            try {
                const pc = peersRef.current[senderId];
                if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (err) { console.error(err); }
        });

        socket.on("webrtc_ice_candidate", async ({ candidate, senderId }) => {
            try {
                const pc = peersRef.current[senderId];
                if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) { }
        });

        socket.on("video_user_left", (id) => {
            setParticipantsList(prev => {
                const user = prev.find(p => p.id === id);
                if (user) addNotification(`${user.name} keluar`);
                return prev.filter(p => p.id !== id);
            });
            if (peersRef.current[id]) {
                peersRef.current[id].close();
                delete peersRef.current[id];
            }
            setRemoteStreams(prev => prev.filter(s => s.id !== id));
            setRaisedHands(prev => prev.filter(uid => uid !== id));
        });

        // Fitur Chat & Hand Raise
        socket.on("new_chat_message", (msg) => {
            setMessages(prev => [...prev, msg]);
            if (!isChatOpen) addNotification(`Pesan baru dari ${msg.senderName}`);
        });

        socket.on("user_toggled_hand", ({ userId, isRaised, name }) => {
            setRaisedHands(prev => isRaised ? [...prev, userId] : prev.filter(id => id !== userId));
            if (isRaised) addNotification(`✋ ${name} mengacungkan tangan`);
        });

    }, [userName, roomId, createPeerConnection, addNotification, isChatOpen]);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!userName.trim()) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setIsJoined(true);
            initSocket();
        } catch (err) {
            console.error(err);
            setIsJoined(true); // Tetap join meski kamera gagal
            initSocket();
        }
    };

    const toggleMic = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
    };

    const toggleCamera = () => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) { track.enabled = !track.enabled; setIsCamOn(track.enabled); }
    };

    const handleToggleRaiseHand = () => {
        const newState = !isLocalHandRaised;
        setIsLocalHandRaised(newState);
        setRaisedHands(prev => newState ? [...prev, 'local'] : prev.filter(id => id !== 'local'));
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

    useEffect(() => {
        if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatOpen]);

    if (!isJoined) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center p-4 text-white z-[99999]">
                <div className="w-full max-w-md bg-neutral-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h1 className="text-2xl font-black mb-6 text-center">Join Meeting</h1>
                    <form onSubmit={handleJoin} className="space-y-6">
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nama Anda" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all" required />
                        <button type="submit" className="w-full bg-blue-600 py-4 rounded-xl font-black text-lg transition-all active:scale-95">Bergabung</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black flex flex-col md:flex-row overflow-hidden text-white font-sans">
            <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                {/* NOTIFIKASI */}
                <div className="fixed top-4 left-4 z-[10001] flex flex-col gap-2 pointer-events-none w-max">
                    {notifications.map(n => (
                        <div key={n.id} className="bg-neutral-900/90 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-left">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />{n.message}
                        </div>
                    ))}
                </div>

                {/* AREA VIDEO GRID */}
                <div className="flex-1 w-full h-full relative p-4 pb-28 overflow-y-auto no-scrollbar">
                    {layoutType === 'auto' && (
                        <div className={`grid gap-4 w-full h-full mx-auto content-center ${participants.all.length === 1 ? 'grid-cols-1 max-w-5xl' : participants.all.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 max-w-7xl' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                            {participants.all.map(p => (
                                <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} stream={getParticipantStream(p.isLocal, p.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(p.id)} customClass="w-full h-full min-h-[25vh]" />
                            ))}
                        </div>
                    )}
                    {layoutType === 'grid' && (
                        <div className="w-full h-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                            {participants.all.map(p => (
                                <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} stream={getParticipantStream(p.isLocal, p.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(p.id)} customClass="aspect-video" />
                            ))}
                        </div>
                    )}
                    {/* Focus & Sidebar layout tetap berfungsi sama */}
                    {layoutType === 'focus' && (
                        <div className="w-full h-full flex items-center justify-center">
                            <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} stream={getParticipantStream(participants.pinned.isLocal, participants.pinned.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(participants.pinned.id)} customClass="w-full h-full max-w-6xl" />
                        </div>
                    )}
                    {layoutType === 'sidebar' && (
                        <div className="w-full h-full flex flex-col md:flex-row gap-4">
                            <div className="flex-[3] h-full overflow-hidden">
                                <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} stream={getParticipantStream(participants.pinned.isLocal, participants.pinned.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(participants.pinned.id)} customClass="w-full h-full" />
                            </div>
                            <div className="flex-1 flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar">
                                {participants.others.map(p => (
                                    <div key={p.id} className="min-w-[180px] md:min-w-0 w-full aspect-video shrink-0">
                                        <VideoCard id={p.id} isLocal={p.isLocal} name={p.name} stream={getParticipantStream(p.isLocal, p.id)} isCamOn={isCamOn} isMicOn={isMicOn} isScreenSharing={isScreenSharing} pinnedId={pinnedId} setPinnedId={setPinnedId} isHandRaised={raisedHands.includes(p.id)} customClass="w-full h-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* TOOLBAR */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10006] w-max">
                    <div className="bg-[#1e1e1e]/90 backdrop-blur-3xl p-4 px-8 rounded-full flex items-center gap-5 border border-white/10 shadow-2xl">
                        <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-neutral-800' : 'bg-red-600'}`}>{isMicOn ? "🎤" : "🔇"}</button>
                        <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'bg-neutral-800' : 'bg-red-600'}`}>{isCamOn ? "📹" : "🚫"}</button>
                        <button onClick={handleToggleRaiseHand} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isLocalHandRaised ? 'bg-yellow-500 text-white' : 'bg-neutral-800'}`}>✋</button>
                        <div className="w-[1px] h-8 bg-white/10 mx-1" />
                        <button onClick={() => { setIsChatOpen(!isChatOpen); setIsParticipantsOpen(false); }} className={`w-12 h-12 rounded-full flex items-center justify-center ${isChatOpen ? 'bg-blue-600' : 'bg-neutral-800'}`}>💬</button>
                        <button onClick={() => { setIsParticipantsOpen(!isParticipantsOpen); setIsChatOpen(false); }} className={`w-12 h-12 rounded-full flex items-center justify-center ${isParticipantsOpen ? 'bg-blue-600' : 'bg-neutral-800'}`}>👥</button>
                        <button onClick={() => setIsLayoutModalOpen(true)} className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-xl">⋮</button>
                        <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95"><span>📞</span><span>Keluar</span></button>
                    </div>
                </div>
            </div>

            {/* RIGHTBAR (CHAT & PARTICIPANTS) */}
            {(isChatOpen || isParticipantsOpen) && (
                <div className="fixed inset-0 z-[20000] md:relative md:inset-auto w-full md:w-80 lg:w-96 h-full bg-[#1e1e1e] border-l border-white/5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                    {isChatOpen && (
                        <div className="flex flex-col h-full">
                            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                                <h3 className="text-white font-bold text-lg">Pesan Rapat</h3>
                                <button onClick={() => setIsChatOpen(false)} className="text-white/50 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex flex-col ${msg.senderId === socket.id ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-[10px] font-bold text-blue-400">{msg.senderName}</span>
                                            <span className="text-[9px] text-white/20">{msg.timestamp}</span>
                                        </div>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[90%] break-words shadow-lg ${msg.senderId === socket.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={sendChat} className="p-4 border-t border-white/5 bg-[#1a1a1a]">
                                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Tulis pesan..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-sm outline-none focus:border-blue-500 transition-all" />
                            </form>
                        </div>
                    )}

                    {isParticipantsOpen && (
                        <div className="flex flex-col h-full">
                            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                                <h3 className="text-white font-bold text-lg">Peserta ({participantsList.length + 1})</h3>
                                <button onClick={() => setIsParticipantsOpen(false)} className="text-white/50 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                <div className="flex items-center gap-4 bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex shrink-0 items-center justify-center font-bold">ME</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{userName} (Anda) {isLocalHandRaised && "✋"}</p>
                                        <p className="text-[10px] text-white/30">ID: {socket.id?.slice(0, 8)}</p>
                                    </div>
                                    <div className="flex gap-2 text-sm shrink-0"><span>{isMicOn ? "🎤" : "🔇"}</span><span>{isCamOn ? "📹" : "🚫"}</span></div>
                                </div>
                                {participantsList.filter(p => p.id !== socket.id).map((p) => (
                                    <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="w-10 h-10 bg-neutral-800 rounded-full flex shrink-0 items-center justify-center font-bold">{p.name?.charAt(0).toUpperCase()}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{p.name} {raisedHands.includes(p.id) && "✋"}</p>
                                            <p className="text-[10px] text-white/20">Peserta Rapat</p>
                                        </div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL LAYOUT */}
            {isLayoutModalOpen && (
                <div className="fixed inset-0 z-[30000] flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setIsLayoutModalOpen(false)} />
                    <div className="bg-[#1e1e1e] border border-white/10 w-full max-w-xs rounded-[2rem] p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-black mb-6 text-center">Tampilan Video</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {['auto', 'grid', 'focus', 'sidebar'].map((type) => (
                                <button key={type} onClick={() => { setLayoutType(type); setIsLayoutModalOpen(false); }} className={`py-4 rounded-xl font-bold capitalize transition-all ${layoutType === type ? 'bg-blue-600 shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}>{type}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-in { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}