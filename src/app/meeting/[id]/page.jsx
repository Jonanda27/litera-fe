"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const socket = io(API_BASE_URL); // sesuaikan backend kamu

export default function MeetingPage() {
  const { id } = useParams();
  const roomId = id;

  const localVideoRef = useRef(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);

  const [remoteStreams, setRemoteStreams] = useState([]);

  // ==============================
  // INIT
  // ==============================
  useEffect(() => {
    startMedia();

    return () => {
      // cleanup saat keluar halaman
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, []);

  // ==============================
  // START CAMERA
  // ==============================
  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    joinRoom();
  };

  // ==============================
  // JOIN ROOM
  // ==============================
  const joinRoom = () => {
    socket.emit("join_video_room", roomId);

    // dapet user di room
    socket.on("video_room_users", (users) => {
      users.forEach(({ socketId }) => {
        if (socketId !== socket.id) {
          createPeerConnection(socketId, true);
        }
      });
    });

    // user baru join
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
  // CREATE PEER CONNECTION
  // ==============================
  const createPeerConnection = async (targetSocketId, isInitiator) => {
    if (peersRef.current[targetSocketId]) {
      return peersRef.current[targetSocketId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject"
        }
      ],
    });

    peersRef.current[targetSocketId] = pc;

    // kirim stream
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

    // ICE candidate
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", {
          target: targetSocketId,
          candidate: event.candidate,
          senderId: socket.id,
        });
      }
    };

    // kalau initiator → kirim offer
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

  // ==============================
  // UI
  // ==============================
  return (
    <div style={{ padding: "20px" }}>
      <h2>Room: {roomId}</h2>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

        {/* LOCAL VIDEO */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "300px", border: "2px solid green" }}
        />

        {/* REMOTE VIDEOS */}
        {remoteStreams.map((user) => (
          <video
            key={user.id}
            ref={(el) => {
              if (el) el.srcObject = user.stream;
            }}
            autoPlay
            playsInline
            style={{ width: "300px", border: "2px solid blue" }}
          />
        ))}
      </div>
    </div>
  );
}