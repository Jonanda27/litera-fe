"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/sockets/socket"

export default function WebRTCMeeting({ roomId }) {
    console.log("ROOM ID:", roomId);
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peersRef = useRef({});
    const videoRefs = useRef({});

    const [remoteStreams, setRemoteStreams] = useState([]);

    useEffect(() => {
        start();

        return () => {
            Object.values(peersRef.current).forEach(pc => pc.close());

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
            }

            localStreamRef.current = null;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }

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
                console.log("🎬 SET VIDEO STREAM:", user.id);

                videoEl.srcObject = user.stream;

                videoEl.onloadedmetadata = () => {
                    videoEl.play().catch(err => {
                        console.log("❌ play error:", err);
                    });
                };
            }
        });
    }, [remoteStreams]);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            await new Promise(resolve => setTimeout(resolve, 300));

            initSocket();
            console.log("✅ Camera & Mic ON");
        } catch (err) {
            console.error("❌ Error:", err);
        }
    };



    // ==============================
    // SOCKET EVENTS
    // ==============================
    const initSocket = () => {

        // user yang sudah ada di room
        socket.emit("join_video_room", roomId);
        socket.on("video_room_users", (users) => {
            users.forEach(({ socketId }) => {
                if (socketId !== socket.id) {
                    createPeerConnection(socketId, true);
                }
            });
        });

        // user baru join
        socket.on("video_user_joined", (socketId) => {
            createPeerConnection(socketId, true);
        });

        socket.on("webrtc_offer", async ({ offer, senderId }) => {
            const pc = await createPeerConnection(senderId, false);

            await pc.setRemoteDescription(offer);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("webrtc_answer", {
                target: senderId,
                answer,
                senderId: socket.id,
            });
        });

        socket.on("webrtc_answer", async ({ answer, senderId }) => {
            const pc = peersRef.current[senderId];
            if (pc) {
                await pc.setRemoteDescription(answer);
            }
        });

        socket.on("webrtc_ice_candidate", async ({ candidate, senderId }) => {
            const pc = peersRef.current[senderId];
            if (pc) {
                await pc.addIceCandidate(candidate);
            }
        });

        socket.on("video_user_left", (socketId) => {
            const pc = peersRef.current[socketId];

            if (pc) {
                pc.close();
                delete peersRef.current[socketId];
            }

            setRemoteStreams(prev => prev.filter(s => s.id !== socketId));
        });

        socket.on("video_user_joined", (socketId) => {
            console.log("👤 user baru join:", socketId);

            createPeerConnection(socketId, true);
        });
    };

    // ==============================
    // PEER CONNECTION
    // ==============================
    const createPeerConnection = async (targetSocketId, isInitiator) => {
        if (peersRef.current[targetSocketId]) return peersRef.current[targetSocketId];

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                {
                    urls: "turn:openrelay.metered.ca:80",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
            ],
        });

        peersRef.current[targetSocketId] = pc;

        console.log("📤 Kirim tracks:", localStreamRef.current.getTracks());

        localStreamRef.current.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current);
        });

        // terima stream
        pc.ontrack = (event) => {
            console.log("🔥 TRACK MASUK DARI:", targetSocketId);
            console.log("STREAM:", event.streams);

            if (event.streams && event.streams[0]) {
                // normal
            } else {
                const newStream = new MediaStream();
                newStream.addTrack(event.track);
            }

            setRemoteStreams(prev => {
                const exists = prev.find(s => s.id === targetSocketId);
                if (exists) return prev;

                return [
                    ...prev,
                    { id: targetSocketId, stream: event.streams[0] }
                ];
            });
        };

        // ICE
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc_ice_candidate", {
                    target: targetSocketId,
                    candidate: event.candidate,
                    senderId: socket.id,
                });
            }
        };

        // initiator
        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("webrtc_offer", {
                target: targetSocketId,
                offer,
                senderId: socket.id,
            });
        }

        return pc;
    };

    return (
        <div className="w-full h-full bg-black flex flex-wrap gap-2 p-2">

            {/* LOCAL */}
            <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-[300px] rounded-xl border border-green-500"
            />

            {/* REMOTE */}
            {remoteStreams.map((user) => (
                <video
                    key={user.id}
                    ref={(el) => {
                        if (el) videoRefs.current[user.id] = el;
                    }}
                    autoPlay
                    playsInline
                    className="w-[300px] rounded-xl border border-blue-500"
                />
            ))}

        </div>
    );
}