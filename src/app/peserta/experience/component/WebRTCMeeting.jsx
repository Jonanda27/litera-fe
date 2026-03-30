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
    
    // Antrian Sinyal & ICE
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
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    }, []);

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
                videoEl.play().catch(() => {});
            }
        });
    }, [remoteStreams, isScreenSharing]);

    useEffect(() => {
        if (isJoined) syncAllVideos();
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
        };
    }, []);

    const initSocket = () => {
        socket.emit("join_video_room", { roomId, name: userName });
        
        socket.on("video_room_users", (users) => {
            const normalizedUsers = users.map(u => typeof u === 'string' ? { id: u, name: `User_${u.slice(0,4)}` } : u);
            setParticipantsList(normalizedUsers);
            normalizedUsers.forEach((user) => { 
                if (user.id !== socket.id) {
                    // Kita membuat koneksi ke mereka
                    createPeerConnection(user.id, true); 
                }
            });
        });

        socket.on("video_user_joined", (data) => {
            const newUser = typeof data === 'string' ? { id: data, name: `User_${data.slice(0,4)}` } : data;
            addNotification(`${newUser.name} bergabung`);
            setParticipantsList(prev => {
                if (prev.find(p => p.id === newUser.id)) return prev;
                return [...prev, newUser];
            });
            // PERBAIKAN: Saat orang baru masuk, kita (yang lama) harus jadi Initiator kirim Offer
            createPeerConnection(newUser.id, true);
        });

        socket.on("new_chat_message", (msg) => {
            setMessages(prev => [...prev, msg]);
            if (!isChatOpen) addNotification(`Pesan baru dari ${msg.senderName}`);
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
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
        });

        peersRef.current[targetId] = pc;

        // Tambahkan track lokal ke koneksi baru
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        }

        // Tangkap track dari remote
        pc.ontrack = (event) => {
            setRemoteStreams(prev => {
                const existing = prev.find(s => s.id === targetId);
                if (existing) return prev;
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
            <div className={`relative group rounded-2xl overflow-hidden bg-neutral-900 border-2 border-white/5 transition-all duration-300 shadow-xl ${customClass}`}>
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/60 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-white text-[10px] flex items-center gap-2 z-30">
                    <span className="font-bold truncate max-w-[120px]">{isLocal ? (isScreenSharing ? "Layar Anda" : `Anda (${name})`) : name}</span>
                    {isLocal && !isMicOn && <span className="text-red-500">🔇</span>}
                </div>
                <video autoPlay muted={isLocal} playsInline ref={el => {
                    if (isLocal) {
                        localVideoRef.current = el;
                    } else if (el) {
                        videoRefs.current[id] = el;
                    }
                    if (el) {
                        const stream = isLocal ? (isScreenSharing ? screenStreamRef.current : localStreamRef.current) : remoteStreams.find(s => s.id === id)?.stream;
                        if (stream && el.srcObject !== stream) el.srcObject = stream;
                    }
                }} className={`w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'}`} />
                <button onClick={() => setPinnedId(pinnedId === id ? null : id)} className={`absolute top-2 right-2 p-1.5 rounded-xl transition-all z-30 ${pinnedId === id ? 'bg-blue-600 text-white' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 backdrop-blur-md'}`}>📌</button>
                {!showVideo && isLocal && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 z-[5]">
                        <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center text-2xl font-bold text-white/30">{name?.charAt(0).toUpperCase()}</div>
                    </div>
                )}
            </div>
        );
    };

    if (!isJoined) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center p-6 text-white z-[99999]">
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
        <div className="fixed inset-0 bg-black flex flex-row overflow-hidden text-white font-sans">
            <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                <div className="fixed top-6 left-6 z-[10001] flex flex-col gap-2 pointer-events-none">
                    {notifications.map(n => (
                        <div key={n.id} className="bg-neutral-900/90 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-left duration-500">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />{n.message}
                        </div>
                    ))}
                </div>

                <div className="flex-1 w-full h-full relative p-4 pb-28">
                    {layoutType === 'auto' && (
                        <div className={`grid gap-4 w-full h-full mx-auto transition-all duration-500 ${participants.all.length === 1 ? 'grid-cols-1 max-w-5xl' : participants.all.length <= 4 ? 'grid-cols-2 max-w-7xl' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                            {participants.all.map(p => <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} customClass="w-full h-full" />)}
                        </div>
                    )}
                    {layoutType === 'grid' && (
                        <div className="w-full h-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar content-start">
                            {participants.all.map(p => <VideoCard key={p.id} id={p.id} isLocal={p.isLocal} name={p.name} customClass="aspect-video w-full h-auto" />)}
                        </div>
                    )}
                    {layoutType === 'focus' && (
                        <div className="w-full h-full flex items-center justify-center">
                            <VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} customClass="w-full h-full max-w-6xl" />
                        </div>
                    )}
                    {layoutType === 'sidebar' && (
                        <div className="w-full h-full flex flex-col md:flex-row gap-4">
                            <div className="flex-[3] h-full overflow-hidden"><VideoCard id={participants.pinned.id} isLocal={participants.pinned.isLocal} name={participants.pinned.name} customClass="w-full h-full" /></div>
                            <div className="flex-1 flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto custom-scrollbar">
                                {participants.others.map(p => <div key={p.id} className="min-w-[180px] md:min-w-0 w-full aspect-video shrink-0"><VideoCard id={p.id} isLocal={p.isLocal} name={p.name} customClass="w-full h-full" /></div>)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10006]">
                    <div className="bg-[#1e1e1e]/80 backdrop-blur-3xl p-4 px-8 rounded-full flex items-center gap-5 border border-white/10 shadow-2xl md:scale-110">
                        <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600 hover:bg-red-700'}`}>{isMicOn ? "🎤" : "🔇"}</button>
                        <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600 hover:bg-red-700'}`}>{isCamOn ? "📹" : "🚫"}</button>
                        <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isScreenSharing ? 'bg-blue-600' : 'bg-neutral-800 hover:bg-neutral-700'}`}>{isScreenSharing ? "❌" : "🖥️"}</button>
                        <div className="w-[1px] h-8 bg-white/10 mx-1" />
                        <button onClick={() => { setIsChatOpen(!isChatOpen); setIsParticipantsOpen(false); }} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isChatOpen ? 'bg-blue-600' : 'bg-neutral-800 hover:bg-neutral-700'}`}>💬</button>
                        <button onClick={() => { setIsParticipantsOpen(!isParticipantsOpen); setIsChatOpen(false); }} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isParticipantsOpen ? 'bg-blue-600' : 'bg-neutral-800 hover:bg-neutral-700'}`}>👥</button>
                        <button onClick={() => setIsLayoutModalOpen(true)} className="w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center">⋮</button>
                        <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all active:scale-90 text-sm"><span>📞</span><span className="hidden sm:inline">Keluar</span></button>
                    </div>
                </div>
            </div>

            {(isChatOpen || isParticipantsOpen) && (
                <div className="w-80 md:w-96 h-full bg-[#1e1e1e] border-l border-white/5 flex flex-col z-[10005] animate-in slide-in-from-right duration-300 shadow-2xl">
                    {isChatOpen && (
                        <div className="flex flex-col h-full">
                            <div className="p-5 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-white font-bold text-lg">Pesan Rapat</h3>
                                <button onClick={() => setIsChatOpen(false)} className="text-white/50 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                    <p className="text-[10px] text-white/40">Pesan tidak akan disimpan setelah rapat berakhir.</p>
                                </div>
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex flex-col ${msg.senderId === socket.id ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-[9px] font-bold text-blue-400">{msg.senderName}</span>
                                            <span className="text-[8px] text-white/20">{msg.timestamp}</span>
                                        </div>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[90%] break-words shadow-lg ${msg.senderId === socket.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="p-4 border-t border-white/5">
                                <form onSubmit={sendChat} className="relative">
                                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Tulis pesan..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-sm outline-none focus:border-blue-500 transition-all placeholder:text-white/20" />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 p-2 hover:bg-white/5 rounded-full transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                    {isParticipantsOpen && (
                        <div className="flex flex-col h-full">
                            <div className="p-5 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-white font-bold text-lg">Peserta ({participantsList.length + 1})</h3>
                                <button onClick={() => setIsParticipantsOpen(false)} className="text-white/50 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                <div className="flex items-center gap-4 bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">ME</div>
                                    <div className="flex-1 truncate"><p className="text-xs font-bold truncate">{userName} (Anda)</p><p className="text-[10px] text-white/30 truncate">ID: {socket.id?.slice(0, 8)}</p></div>
                                    <div className="flex gap-2 text-sm"><span>{isMicOn ? "🎤" : "🔇"}</span><span>{isCamOn ? "📹" : "🚫"}</span></div>
                                </div>
                                {participantsList.filter(p => p.id !== socket.id).map((p) => (
                                    <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                        <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-white text-xs font-bold">{p.name?.charAt(0).toUpperCase()}</div>
                                        <div className="flex-1 truncate"><p className="text-xs font-bold truncate">{p.name}</p><p className="text-[10px] text-white/20">Peserta Rapat</p></div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isLayoutModalOpen && (
                <div className="fixed inset-0 z-[20000] flex items-center justify-center p-6 backdrop-blur-sm">
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
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-in { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}