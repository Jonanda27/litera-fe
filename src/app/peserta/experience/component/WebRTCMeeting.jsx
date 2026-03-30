"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "@/lib/sockets/socket";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Fullscreen, Minimize } from "lucide-react";

export default function WebRTCMeeting({ roomId, onMeetingEnd }) { // Terima onMeetingEnd sebagai prop
    console.log("ROOM ID:", roomId);
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peersRef = useRef({});
    const videoRefs = useRef({});
    const senderRefs = useRef({});

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    // Fungsi untuk menghentikan local stream
    const stopLocalStream = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop(); // Hentikan setiap track
                console.log(`Track ${track.kind} stopped.`);
            });
            localStreamRef.current = null;
        }
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
    }, []);

    // Fungsi untuk memulai stream
    const startLocalStream = useCallback(async () => {
        try {
            // Hentikan stream yang ada sebelum memulai yang baru (penting untuk reset)
            stopLocalStream();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            localStreamRef.current = stream;

            localStreamRef.current.getVideoTracks().forEach(track => track.enabled = isCameraOn);
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = isMicOn);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Setelah stream didapatkan, perbarui semua peer connection
            Object.entries(peersRef.current).forEach(([peerId, pc]) => {
                // Untuk setiap peer, perbarui track video dan audio
                localStreamRef.current.getTracks().forEach(track => {
                    const sender = senderRefs.current[peerId]?.[track.kind];
                    if (sender) {
                        sender.replaceTrack(track); // Ganti track yang ada
                    } else {
                        // Jika belum ada sender untuk track ini, tambahkan
                        const newSender = pc.addTrack(track, localStreamRef.current);
                        senderRefs.current[peerId] = {
                            ...(senderRefs.current[peerId] || {}),
                            [track.kind]: newSender
                        };
                    }
                });
            });


            // Inisialisasi socket jika belum terhubung atau room ID berubah
            if (!socket.connected || socket.io.opts.query.roomId !== roomId) {
                if (socket.connected) {
                    socket.disconnect(); // Disconnect existing socket
                }
                socket.io.opts.query = { roomId }; // Set query parameter for reconnect
                socket.connect();
                initSocket();
            }

            console.log("✅ Camera & Mic state applied, stream updated for peers.");
        } catch (err) {
            console.error("❌ Error starting stream:", err);
            alert("Gagal mengakses kamera atau mikrofon. Pastikan Anda memberikan izin dan tidak ada aplikasi lain yang menggunakannya.");
            setIsCameraOn(false); // Set to false if camera failed
            setIsMicOn(false);   // Set to false if mic failed
            stopLocalStream(); // Hentikan stream jika gagal
        }
    }, [isCameraOn, isMicOn, roomId, stopLocalStream]);


    // Effect untuk memulai stream saat komponen mount atau roomId berubah
    useEffect(() => {
        if (roomId) {
            startLocalStream();
        }

        // Cleanup function untuk menghentikan stream dan socket saat komponen unmount atau roomId hilang
        return () => {
            console.log("Cleanup WebRTCMeeting for roomId:", roomId);
            Object.values(peersRef.current).forEach(pc => pc.close());
            peersRef.current = {};
            senderRefs.current = {};
            stopLocalStream();

            // Matikan semua listener socket
            socket.off("video_room_users");
            socket.off("video_user_joined");
            socket.off("webrtc_offer");
            socket.off("webrtc_answer");
            socket.off("webrtc_ice_candidate");
            socket.off("video_user_left");

            // Pastikan socket disconnect jika ini adalah akhir meeting
            if (socket.connected) {
                socket.emit("leave_video_room", roomId); // Beri tahu server bahwa user meninggalkan room
                socket.disconnect(); // Putuskan koneksi socket
            }
        };
    }, [roomId, stopLocalStream, startLocalStream]); // Tambahkan startLocalStream sebagai dependency

    useEffect(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => track.enabled = isCameraOn);
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = isMicOn);

            // Perbarui track pada semua sender ke peer lain
            Object.values(senderRefs.current).forEach(peerSenders => {
                if (peerSenders.video && localStreamRef.current.getVideoTracks()[0]) {
                    peerSenders.video.replaceTrack(localStreamRef.current.getVideoTracks()[0])
                        .catch(err => console.error("Error replacing video track:", err));
                }
                if (peerSenders.audio && localStreamRef.current.getAudioTracks()[0]) {
                    peerSenders.audio.replaceTrack(localStreamRef.current.getAudioTracks()[0])
                        .catch(err => console.error("Error replacing audio track:", err));
                }
            });
        }
    }, [isCameraOn, isMicOn]);

    useEffect(() => {
        remoteStreams.forEach(user => {
            const videoEl = videoRefs.current[user.id];
            if (videoEl && user.stream) {
                videoEl.srcObject = user.stream;
                videoEl.onloadedmetadata = () => {
                    videoEl.play().catch(err => {
                        console.log("❌ play error:", err);
                    });
                };
            }
        });
    }, [remoteStreams]);

    // Effect untuk membersihkan state fullscreen jika user keluar fullscreen via ESC
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setFullscreenVideoId(null);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleCamera = () => {
        setIsCameraOn(prev => !prev);
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };

    const toggleMic = () => {
        setIsMicOn(prev => !prev);
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    // ==============================
    // SOCKET EVENTS
    // ==============================
    const initSocket = () => {
        socket.emit("join_video_room", roomId); // Pastikan bergabung ke room ID yang benar

        socket.on("video_room_users", (users) => {
            users.forEach(({ socketId }) => {
                if (socketId !== socket.id) {
                    createPeerConnection(socketId, true);
                }
            });
        });

        socket.on("video_user_joined", (socketId) => {
            console.log("👤 user baru join:", socketId);
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
            console.log("User left:", socketId);
            const pc = peersRef.current[socketId];

            if (pc) {
                pc.close();
                delete peersRef.current[socketId];
                delete senderRefs.current[socketId];
            }

            setRemoteStreams(prev => prev.filter(s => s.id !== socketId));
        });
    };

    // ==============================
    // PEER CONNECTION
    // ==============================
    const createPeerConnection = useCallback(async (targetSocketId, isInitiator) => {
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
        senderRefs.current[targetSocketId] = {};

        // Pastikan localStreamRef.current ada sebelum menambahkan tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        } else {
            console.warn("Local stream not available when creating peer connection for", targetSocketId);
            // Anda mungkin ingin menambahkan logika untuk meminta stream lagi di sini
        }


        pc.ontrack = (event) => {
            console.log("🔥 TRACK MASUK DARI:", targetSocketId);
            console.log("STREAM:", event.streams);

            setRemoteStreams(prev => {
                const exists = prev.find(s => s.id === targetSocketId);
                if (exists) {
                    if (exists.stream !== event.streams[0]) {
                        return prev.map(s => s.id === targetSocketId ? { ...s, stream: event.streams[0] } : s);
                    }
                    return prev;
                }

                const streamToUse = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);

                return [
                    ...prev,
                    { id: targetSocketId, stream: streamToUse }
                ];
            });
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc_ice_candidate", {
                    target: targetSocketId,
                    candidate: event.candidate,
                    senderId: socket.id,
                });
            }
        };

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
    }, []);

    // Helper untuk menentukan kelas grid video yang responsif
    const videoGridClass = () => {
        const totalParticipants = 1 + remoteStreams.length; // Anda + peserta lain

        let classes = "grid-cols-1"; // Default for mobile

        if (totalParticipants === 2) {
            classes = "grid-cols-1 sm:grid-cols-2";
        } else if (totalParticipants === 3 || totalParticipants === 4) {
            classes = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2";
        } else if (totalParticipants > 4) {
            classes = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
        }
        return classes;
    };


    return (
        <div className={`relative flex flex-col w-full h-full bg-black rounded-lg overflow-hidden`}>
            {/* Area Video Utama */}
            <div className={`flex-1 p-2 grid ${videoGridClass()} gap-3 overflow-y-auto`}>
                {/* Video Lokal (Anda) */}
                <div className="relative bg-gray-700 rounded-lg overflow-hidden shadow-md border border-green-500 aspect-video w-full">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {!isCameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-base font-medium">
                            Kamera Mati
                        </div>
                    )}
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 px-2 py-0.5 rounded-md text-xs sm:bottom-2 sm:left-2 sm:px-3 sm:py-1 sm:text-sm">
                        Anda
                    </div>
                    {/* <button
                        onClick={() => toggleFullscreen('local')}
                        className="absolute top-1 right-1 p-1 bg-black/40 hover:bg-black/60 text-white rounded-md transition-all shadow-sm z-10"
                        title={fullscreenVideoId === 'local' ? "Keluar Fullscreen" : "Layar Penuh"}
                    >
                        {fullscreenVideoId === 'local' ? <Minimize size={14} /> : <Fullscreen size={14} />}
                    </button> */}
                </div>

                {/* Video Remote (Peserta Lain) */}
                {remoteStreams.map((user) => (
                    <div key={user.id} className="relative bg-gray-700 rounded-lg overflow-hidden shadow-md border border-blue-500 aspect-video w-full">
                        <video
                            key={user.id} // Tambahkan key di sini juga
                            ref={(el) => {
                                if (el) videoRefs.current[user.id] = el;
                            }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {/* Placeholder jika video tidak ada atau kamera mati */}
                        {(!user.stream || user.stream.getVideoTracks().length === 0 || !user.stream.getVideoTracks()[0].enabled) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-base font-medium">
                                Kamera Mati
                            </div>
                        )}
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 px-2 py-0.5 rounded-md text-xs sm:bottom-2 sm:left-2 sm:px-3 sm:py-1 sm:text-sm">
                            {user.id.substring(0, 8)}...
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer dengan Kontrol Panggilan Lokal */}
            <footer className="p-3 bg-gray-800 flex justify-center items-center gap-3 shadow-inner sm:p-4 sm:gap-4">
                {/* Tombol Toggle Kamera */}
                <button
                    onClick={toggleCamera}
                    className={`p-2 rounded-full text-white ${isCameraOn ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"} transition-colors duration-200 sm:p-3`}
                    title={isCameraOn ? "Matikan Kamera" : "Nyalakan Kamera"}
                >
                    {isCameraOn ? (
                        <Video size={16} />
                    ) : (
                        <VideoOff size={16} /> // Tambah ikon VideoOff jika ada di lucide-react, atau buat sendiri
                    )}
                </button>

                {/* Tombol Toggle Mikrofon */}
                <button
                    onClick={toggleMic}
                    className={`p-2 rounded-full text-white ${isMicOn ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"} transition-colors duration-200 sm:p-3`}
                    title={isMicOn ? "Matikan Mikrofon" : "Nyalakan Mikrofon"}
                >
                    {isMicOn ? (
                        <Mic size={16} />
                    ) : (
                        <MicOff size={16} /> // Tambah ikon MicOff jika ada di lucide-react, atau buat sendiri
                    )}
                </button>

                {/* Tombol Akhiri Panggilan (memanggil prop dari wrapper) */}
                <button
                    onClick={onMeetingEnd}
                    className="p-2 rounded-full bg-red-700 hover:bg-red-800 text-white transition-colors duration-200 sm:p-3"
                    title="Akhiri Panggilan"
                >
                    <PhoneOff size={16} />
                </button>
            </footer>
        </div>
    );
}