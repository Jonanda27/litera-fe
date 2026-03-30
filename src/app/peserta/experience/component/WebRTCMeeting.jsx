"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/sockets/socket"

export default function WebRTCMeeting({ roomId }) {
    console.log("ROOM ID:", roomId);
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null); // Ref khusus untuk screen share
    const peersRef = useRef({});
    const videoRefs = useRef({});
    const audioAnalyzersRef = useRef({});

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false); // State screen share

    const [speakingUsers, setSpeakingUsers] = useState({});
    const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);

    useEffect(() => {
        start();

        return () => {
            Object.values(peersRef.current).forEach(pc => pc.close());

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
            }

            localStreamRef.current = null;
            socket.off("video_room_users");
            socket.off("video_user_joined");
            socket.off("webrtc_offer");
            socket.off("webrtc_answer");
            socket.off("webrtc_ice_candidate");
            socket.off("video_user_left");
        };
    }, []);

    useEffect(() => {
        remoteStreams.forEach(user => {
            const videoEl = videoRefs.current[user.id];
            if (videoEl && user.stream) {
                videoEl.srcObject = user.stream;
                videoEl.onloadedmetadata = () => {
                    videoEl.play().catch(err => console.log("❌ play error:", err));
                };
            }
        });
    }, [remoteStreams]);

    // ==============================
    // LOGIKA DETEKSI SUARA
    // ==============================
    const monitorStream = (stream, socketId = null) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            if (audioContext.state === 'suspended') audioContext.resume();

            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            let isSpeaking = false;
            const threshold = 30; 

            const checkVolume = () => {
                if (!analyser) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const average = sum / bufferLength;
                const currentlySpeaking = average > threshold;

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
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const monitor = monitorStream(stream);
            if (monitor) audioAnalyzersRef.current["local"] = monitor;

            await new Promise(resolve => setTimeout(resolve, 300));
            initSocket();
        } catch (err) { console.error("❌ Error:", err); }
    };

    // ==============================
    // FITUR SHARE SCREEN (NEW)
    // ==============================
    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                // Mulai Share Screen
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                // Ganti track video di semua Peer Connections
                Object.values(peersRef.current).forEach(pc => {
                    const senders = pc.getSenders();
                    const videoSender = senders.find(s => s.track.kind === "video");
                    if (videoSender) videoSender.replaceTrack(screenTrack);
                });

                // Update tampilan lokal
                if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

                // Handle jika user klik "Stop Sharing" bawaan browser
                screenTrack.onended = () => stopScreenSharing();

                setIsScreenSharing(true);
            } else {
                stopScreenSharing();
            }
        } catch (err) {
            console.error("Error screen sharing:", err);
        }
    };

    const stopScreenSharing = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }

        const videoTrack = localStreamRef.current.getVideoTracks()[0];

        // Kembalikan ke kamera di semua Peer Connections
        Object.values(peersRef.current).forEach(pc => {
            const senders = pc.getSenders();
            const videoSender = senders.find(s => s.track.kind === "video");
            if (videoSender) videoSender.replaceTrack(videoTrack);
        });

        // Kembalikan tampilan lokal ke kamera
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        
        setIsScreenSharing(false);
    };

    // ==============================
    // KONTROL MEDIA
    // ==============================
    const toggleMic = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
                if (!audioTrack.enabled) setIsLocalSpeaking(false);
            }
        }
    };

    const toggleCamera = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCamOn(videoTrack.enabled);
            }
        }
    };

    // ==============================
    // SOCKET & WEBRTC LOGIC
    // ==============================
    const initSocket = () => {
        socket.emit("join_video_room", roomId);
        socket.on("video_room_users", (users) => {
            users.forEach(({ socketId }) => {
                if (socketId !== socket.id) createPeerConnection(socketId, true);
            });
        });
        socket.on("video_user_joined", (socketId) => createPeerConnection(socketId, true));
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
        socket.on("video_user_left", (socketId) => {
            const pc = peersRef.current[socketId];
            if (pc) { pc.close(); delete peersRef.current[socketId]; }
            if (audioAnalyzersRef.current[socketId]) { audioAnalyzersRef.current[socketId].stop(); delete audioAnalyzersRef.current[socketId]; }
            setRemoteStreams(prev => prev.filter(s => s.id !== socketId));
        });
    };

    const createPeerConnection = async (targetSocketId, isInitiator) => {
        if (peersRef.current[targetSocketId]) return peersRef.current[targetSocketId];
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }],
        });
        peersRef.current[targetSocketId] = pc;

        // Gunakan stream yang sedang aktif (screen atau camera)
        const currentStream = isScreenSharing ? screenStreamRef.current : localStreamRef.current;
        localStreamRef.current.getAudioTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        currentStream.getVideoTracks().forEach(track => pc.addTrack(track, currentStream));

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                const remoteStream = event.streams[0];
                if (!audioAnalyzersRef.current[targetSocketId]) {
                    const monitor = monitorStream(remoteStream, targetSocketId);
                    if (monitor) audioAnalyzersRef.current[targetSocketId] = monitor;
                }
                setRemoteStreams(prev => {
                    if (prev.find(s => s.id === targetSocketId)) return prev;
                    return [...prev, { id: targetSocketId, stream: remoteStream }];
                });
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) socket.emit("webrtc_ice_candidate", { target: targetSocketId, candidate: event.candidate, senderId: socket.id });
        };

        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("webrtc_offer", { target: targetSocketId, offer, senderId: socket.id });
        }
        return pc;
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 flex flex-wrap content-start justify-start gap-4 pb-32">
                {/* VIDEO LOKAL */}
                <div className="relative w-[300px] h-[220px] sm:w-[350px] sm:h-[250px]">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full rounded-2xl object-cover border-4 border-solid transition-all duration-300
                            ${isLocalSpeaking && isMicOn ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'border-transparent'}`}
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs flex items-center gap-2">
                        <span className="font-semibold">{isScreenSharing ? "Anda (Sharing Layar)" : "Anda (Host)"}</span>
                        {!isMicOn && <span className="text-red-400">🔇</span>}
                    </div>
                    {!isCamOn && !isScreenSharing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 rounded-2xl">
                            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center">👤</div>
                        </div>
                    )}
                </div>

                {/* VIDEO REMOTE */}
                {remoteStreams.map((user) => (
                    <div key={user.id} className="relative w-[300px] h-[220px] sm:w-[350px] sm:h-[250px]">
                        <video
                            ref={(el) => { if (el) videoRefs.current[user.id] = el; }}
                            autoPlay
                            playsInline
                            className={`w-full h-full rounded-2xl bg-neutral-800 object-cover border-4 border-solid transition-all duration-300
                                ${speakingUsers[user.id] ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'border-transparent'}`}
                        />
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs flex items-center gap-2">
                            <span>Peserta: {user.id.slice(0, 6)}</span>
                            {speakingUsers[user.id] && <span className="animate-pulse">🔊</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* BAR KONTROL */}
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center z-[9999]">
                <div className="flex items-center gap-4 bg-neutral-900/90 backdrop-blur-2xl p-4 px-10 rounded-full border border-white/10 shadow-2xl mb-4">
                    <button onClick={toggleMic} className={`w-12 h-12 rounded-full transition-all active:scale-90 ${isMicOn ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-red-600 hover:bg-red-700'}`}>
                        <span className="text-xl">{isMicOn ? "🎤" : "🔇"}</span>
                    </button>

                    <button onClick={toggleCamera} className={`w-12 h-12 rounded-full transition-all active:scale-90 ${isCamOn ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-red-600 hover:bg-red-700'}`}>
                        <span className="text-xl">{isCamOn ? "📹" : "🚫"}</span>
                    </button>

                    {/* TOMBOL SHARE SCREEN (NEW) */}
                    <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-full transition-all active:scale-90 ${isScreenSharing ? 'bg-green-600 hover:bg-green-700 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-neutral-700 hover:bg-neutral-600'}`}>
                        <span className="text-xl">🖥️</span>
                    </button>

                    <div className="w-[1px] h-8 bg-white/10 mx-2" />

                    <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
                        <span className="text-lg">📞</span> Keluar
                    </button>
                </div>
            </div>
        </div>
    );
}