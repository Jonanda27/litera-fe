"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Send,
  Plus,
  Users,
  Search,
  X,
  Globe,
  BookmarkCheck,
  Lock,
  UserPlus,
  MessageCircle,
  Video,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DiscussionCards from "@/components/experience/DiscussionCards";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isMe: boolean;
  senderId: number;
}

interface DiscussionRoom {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  meeting_id: string | null;
}

const SOCKET_URL = "http://localhost:4000";

export default function Experience() {
  const router = useRouter();

  // --- STATE DASAR (CHAT) ---
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    nama: string;
  } | null>(null);
  const [currentDiscussionId, setCurrentDiscussionId] = useState<string>("");

  // --- STATE FITUR RUANGAN ---
  const [allDiscussions, setAllDiscussions] = useState<DiscussionRoom[]>([]);
  const [myDiscussions, setMyDiscussions] = useState<DiscussionRoom[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "joined">("all");
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [pendingRoom, setPendingRoom] = useState<DiscussionRoom | null>(null);

  const [joinedRoomIds, setJoinedRoomIds] = useState<string[]>([]);
  const [isLoadingSync, setIsLoadingSync] = useState(true);

  // --- STATE NOTIFIKASI & MEETING ---
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [meetings, setMeetings] = useState([]);
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);

  // --- STATE FORM MEETING ---
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDesc, setMeetingDesc] = useState("");
  const [isMeetingLoading, setIsMeetingLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Inisialisasi Data
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const initData = async () => {
      await fetchAllDiscussions();
      await fetchMyJoinedDiscussions();
      await fetchMeetings();
      setIsLoadingSync(false);
    };
    initData();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/meetings/all-meetings");
      const result = await res.json();
      if (result.success || result.data) setMeetings(result.data);
    } catch (err) {
      console.error("Gagal load meeting:", err);
    }
  };

  const fetchAllDiscussions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SOCKET_URL}/api/books/discussions/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) setAllDiscussions(result.data);
    } catch (err) {
      console.error("Gagal load semua diskusi:", err);
    }
  };

  const fetchMyJoinedDiscussions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SOCKET_URL}/api/books/discussions/my-joined`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setMyDiscussions(result.data);
        setJoinedRoomIds(result.data.map((d: any) => d.id.toString()));
      }
    } catch (err) {
      console.error("Gagal load grup saya:", err);
    }
  };

  const fetchRoomMembers = async (roomId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${SOCKET_URL}/api/books/discussions/members/${roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await res.json();
      if (result.success) setRoomMembers(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentDiscussionId) {
      setUnreadCounts((prev) => ({
        ...prev,
        [currentDiscussionId]: 0,
      }));
    }
  }, [currentDiscussionId]);

  // 2. Socket Logic
  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      joinedRoomIds.forEach((id) => {
        newSocket.emit("join_room", { discussionId: id, user: currentUser });
      });
    });

    newSocket.on("online_users_list", (users: any[]) => setOnlineUsers(users));

    newSocket.on("receive_message", (data: any) => {
      const msgRoomId = data.room.toString();
      if (msgRoomId === currentDiscussionId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.id.toString())) return prev;
          return [
            ...prev,
            {
              id: data.id.toString(),
              text: data.text,
              sender: data.sender,
              timestamp: data.timestamp,
              isMe: Number(data.senderId) === currentUser.id,
              senderId: data.senderId,
            },
          ];
        });
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [msgRoomId]: (prev[msgRoomId] || 0) + 1,
        }));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, joinedRoomIds, currentDiscussionId]);

  useEffect(() => {
    if (!currentDiscussionId || !currentUser) return;
    fetchRoomMembers(currentDiscussionId);

    const loadChatHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${SOCKET_URL}/api/books/discussion-history/${currentDiscussionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await response.json();
        if (result.success) {
          setMessages(
            result.data.map((m: any) => ({
              id: m.id.toString(),
              text: m.message,
              sender: m.sender?.nama || "User",
              timestamp: new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isMe: Number(m.senderId) === currentUser.id,
              senderId: m.senderId,
            })),
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadChatHistory();
  }, [currentDiscussionId]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // 3. Handlers
  const handleRoomClick = (room: DiscussionRoom) => {
    setCurrentDiscussionId(room.id.toString());
  };

  const handleConfirmJoin = async () => {
    if (!pendingRoom) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SOCKET_URL}/api/books/discussions/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ discussionId: pendingRoom.id }),
      });

      if (res.ok) {
        const id = pendingRoom.id.toString();
        setJoinedRoomIds((prev) => [...prev, id]);
        setCurrentDiscussionId(id);
        setIsConfirmModalOpen(false);
        setPendingRoom(null);
        await fetchMyJoinedDiscussions();
      }
    } catch (err) {
      alert("Gagal bergabung");
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SOCKET_URL}/api/books/discussions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoomName }),
      });
      const result = await res.json();
      if (result.success) {
        setNewRoomName("");
        setIsCreateModalOpen(false);
        await fetchAllDiscussions();
        await fetchMyJoinedDiscussions();
        setCurrentDiscussionId(result.data.id.toString());
      }
    } catch (err) {
      alert("Gagal membuat ruangan");
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;
    setIsMeetingLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:4000/api/meetings/create-meeting/${currentDiscussionId}/start-meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: meetingTitle,
          description: meetingDesc,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsCreateMeetingModalOpen(false);
        setMeetingTitle("");
        setMeetingDesc("");
        await fetchAllDiscussions();
        router.push(`/peserta/experience/component/${result.data.id}`);
      } else {
        alert("Gagal membuat meeting: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsMeetingLoading(false);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !currentUser) return;

    if (!joinedRoomIds.includes(currentDiscussionId)) {
      const room = allDiscussions.find(
        (d) => d.id.toString() === currentDiscussionId,
      );
      setPendingRoom(room || null);
      setIsConfirmModalOpen(true);
      return;
    }

    socket.emit("send_message", {
      room: currentDiscussionId,
      senderId: currentUser.id,
      text: inputMessage,
    });
    setInputMessage("");
  };

  const triggerJoinModal = () => {
    const room = allDiscussions.find(
      (d) => d.id.toString() === currentDiscussionId,
    );
    setPendingRoom(room || null);
    setIsConfirmModalOpen(true);
  };

  const activeList = viewMode === "all" ? allDiscussions : myDiscussions;

  // Ambil data detail grup yang sedang aktif dibuka
  const currentRoomData = allDiscussions.find(d => d.id.toString() === currentDiscussionId);

  // Cek apakah user yang login adalah pemilik grup ini
  const isOwner = currentRoomData && currentUser && Number(currentRoomData.owner_id) === currentUser.id;

  // Cek apakah grup ini sudah punya meeting aktif
  const hasActiveMeeting = currentRoomData?.meeting_id != null;

  if (isLoadingSync)
    return (
      <div className="h-screen flex items-center justify-center font-black text-[#1e4e8c] animate-pulse">
        SYNCING EXPERIENCE...
      </div>
    );

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-6 flex-shrink-0">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Experience
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase mt-1 tracking-widest">
              Ruang Diskusi & Community Hub
            </p>
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-12 bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden min-h-0">
          {/* 1. Sidebar Kiri (Daftar Diskusi) */}
          <div className="hidden md:flex md:col-span-3 border-r flex-col bg-slate-50/50">
            <div className="p-5 border-b bg-white flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">
                Explore Chat
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="p-2 bg-[#c31a26] text-white rounded-xl hover:scale-110 transition-all shadow-lg"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex p-2 gap-1 bg-white border-b">
              <button
                onClick={() => setViewMode("all")}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 ${viewMode === "all" ? "bg-[#c31a26] text-white shadow-md" : "text-slate-400 hover:bg-slate-50"}`}
              >
                <Globe size={12} /> Semua
              </button>
              <button
                onClick={() => setViewMode("joined")}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 ${viewMode === "joined" ? "bg-[#1e4e8c] text-white shadow-md" : "text-slate-400 hover:bg-slate-50"}`}
              >
                <BookmarkCheck size={12} /> Diikuti
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeList.map((room) => {
                const roomId = room.id.toString();
                const count = unreadCounts[roomId] || 0;
                return (
                  <div
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border-2 relative ${currentDiscussionId === roomId ? "bg-white border-[#c31a26] shadow-md" : "border-transparent hover:bg-white/60"}`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-black text-[12px] text-slate-800 uppercase truncate">
                        # {room.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {count > 0 && (
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                        {joinedRoomIds.includes(roomId) && (
                          <span className="text-[10px] text-green-500 font-black">
                            ✔
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Chat Window Area (Tengah) */}
          <div className="col-span-12 md:col-span-9 lg:col-span-6 flex flex-col bg-white border-r min-h-0">
            {currentDiscussionId ? (
              <>
                <div className="p-5 border-b flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#c31a26] rounded-2xl flex items-center justify-center text-white font-black shadow-lg uppercase">
                      {allDiscussions
                        .find((d) => d.id.toString() === currentDiscussionId)
                        ?.name.charAt(0)}
                    </div>
                    <h3 className="font-black text-slate-800 uppercase text-sm">
                      {allDiscussions.find(
                        (d) => d.id.toString() === currentDiscussionId,
                      )?.name || "Diskusi"}
                    </h3>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden relative bg-[#f1f5f9] flex flex-col min-h-0">
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                  >
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm relative ${msg.isMe ? "bg-[#1e4e8c] text-white rounded-tr-none" : "bg-white text-slate-900 rounded-tl-none border"}`}
                        >
                          {!msg.isMe && (
                            <p className="text-[10px] font-black mb-1 text-[#c31a26] uppercase">
                              {msg.sender}
                            </p>
                          )}
                          <p className="font-medium leading-relaxed">
                            {msg.text}
                          </p>
                          <p
                            className={`text-[8px] font-black mt-2 text-right ${msg.isMe ? "text-white/60" : "text-slate-400"}`}
                          >
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-white border-t">
                  {joinedRoomIds.includes(currentDiscussionId) ? (
                    <form
                      onSubmit={sendMessage}
                      className="flex items-center gap-3 bg-slate-100 rounded-2xl p-1 px-4 border focus-within:border-[#1e4e8c] transition-all"
                    >
                      <input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Tulis pesan kamu..."
                        className="w-full bg-transparent border-none py-3 text-sm outline-none font-bold text-slate-800"
                      />
                      <button
                        type="submit"
                        className="bg-[#c31a26] text-white p-3 rounded-xl shadow-lg active:scale-95 transition-all"
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={triggerJoinModal}
                      className="w-full py-4 bg-[#1e4e8c] hover:bg-[#153a69] text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                      <UserPlus size={18} /> Bergabung ke Grup
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-3xl">
                  💬
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase">
                  Pilih Ruangan
                </h3>
                <p className="text-xs text-slate-400 font-bold max-w-xs mt-2 uppercase">
                  Silakan pilih dari daftar diskusi di samping untuk mulai
                  berinteraksi.
                </p>
              </div>
            )}
          </div>

          {/* 3. Sidebar Kanan (Anggota & Meeting) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col bg-slate-50/30 min-h-0 border-l">
            {currentDiscussionId ? (
              <>
                {/* Bagian Anggota */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-6 border-b bg-white font-black text-slate-800 text-[10px] uppercase tracking-widest flex items-center justify-between">
                    Anggota Grup ({roomMembers.length})
                    <Users size={16} className="text-slate-400" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {roomMembers.map((member) => {
                      const isOnline = onlineUsers.some(
                        (u) => Number(u.id) === Number(member.id),
                      );
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 group"
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-md ${isOnline ? "bg-[#c31a26]" : "bg-slate-300"}`}
                          >
                            {member.nama?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-800 uppercase truncate">
                              {member.nama}{" "}
                              {member.id === currentUser?.id && "(Anda)"}
                            </p>
                            <div className="flex items-center gap-1">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
                              ></span>
                              <span
                                className={`text-[8px] font-black uppercase ${isOnline ? "text-green-600" : "text-slate-400"}`}
                              >
                                {isOnline ? "Connected" : "Offline"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {hasActiveMeeting ? (
                  <button
                    onClick={() => router.push(`/peserta/experience/component/${currentRoomData?.meeting_id}`)}
                    className="mx-4 mb-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 animate-bounce"
                  >
                    <Radio size={16} /> Join Live Meeting
                  </button>
                ) : isOwner ? (
                  <button
                    onClick={() => setIsCreateMeetingModalOpen(true)}
                    className="mx-4 mb-4 bg-[#c31a26] hover:bg-[#a5161f] text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    <Plus size={16} /> Mulai Diskusi
                  </button>
                ) : (
                  <div className="mx-4 mb-4 py-3 text-center border-2 border-dashed border-slate-200 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Tidak ada sesi video
                  </div>
                )}
                {/* Bagian DiscussionCards (Meeting Aktif) */}
                <div className="h-[45%] border-t bg-white flex flex-col min-h-0 overflow-hidden">
                  <DiscussionCards items={meetings} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-20 grayscale">
                <Users size={40} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">
                  Detail akan muncul setelah memilih ruangan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL MULAI DISKUSI (MEETING) - NUANSA MERAH --- */}
      <AnimatePresence>
        {isCreateMeetingModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border-4 border-[#c31a26] relative overflow-hidden"
            >
              {/* Dekorasi Background Halus */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50" />

              <button
                onClick={() => setIsCreateMeetingModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-red-50 rounded-full transition-colors group z-10"
              >
                <X size={20} className="text-slate-400 group-hover:text-[#c31a26]" />
              </button>

              <div className="mb-8 relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-[#c31a26] shadow-inner">
                    <Video size={28} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Radio size={14} className="text-[#c31a26] animate-pulse" />
                      <span className="text-[10px] font-black text-[#c31a26] uppercase tracking-[0.2em]">Live Session</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                      Mulai Diskusi
                    </h2>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hubungkan komunitas Anda dalam ruang tatap muka digital.
                </p>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-5 relative">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 mb-2 uppercase tracking-widest">
                    Judul Diskusi
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] focus:bg-white outline-none font-bold text-slate-800 text-sm transition-all placeholder:text-slate-300"
                    placeholder="CONTOH: SHARING SESSION UI/UX"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-700 mb-2 uppercase tracking-widest">
                    Deskripsi Sesi
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] focus:bg-white outline-none font-bold text-slate-800 text-sm transition-all placeholder:text-slate-300"
                    placeholder="JELASKAN APA YANG AKAN DIBAHAS..."
                    value={meetingDesc}
                    onChange={(e) => setMeetingDesc(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateMeetingModalOpen(false)}
                    className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 uppercase text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isMeetingLoading}
                    className={`flex-[2] py-4 rounded-2xl font-black uppercase text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isMeetingLoading
                      ? "bg-slate-300 text-white cursor-not-allowed"
                      : "bg-[#c31a26] text-white hover:bg-[#a5161f] shadow-red-200"
                      }`}
                  >
                    {isMeetingLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      "Buat & Gabung Sekarang →"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL TERBITKAN TOPIK (CHAT ROOM) --- */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border-4 border-[#1e4e8c]"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">
                Terbitkan Topik
              </h2>
              <form onSubmit={handleCreateRoom} className="space-y-5">
                <input
                  autoFocus
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] outline-none font-black text-slate-800 uppercase text-sm transition-all"
                  placeholder="Nama Ruangan..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 font-black text-slate-400 uppercase text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-[#c31a26] text-white rounded-2xl font-black uppercase text-xs shadow-xl"
                  >
                    Buat Sekarang →
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL KONFIRMASI GABUNG (CHAT ROOM) --- */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center border-4 border-[#c31a26]"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
                🤝
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2 uppercase">
                Ayo Bergabung!
              </h2>
              <p className="text-[10px] text-slate-500 mb-8 font-bold uppercase leading-relaxed tracking-wider">
                Bergabung ke ruang{" "}
                <span className="text-[#c31a26]">"{pendingRoom?.name}"</span>{" "}
                untuk mulai berbagi pengalaman.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 py-3 font-black text-slate-400 uppercase text-[10px]"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmJoin}
                  className="flex-[2] py-4 bg-[#1e4e8c] text-white rounded-2xl font-black uppercase text-[10px] shadow-xl"
                >
                  Ya, Gabung!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Sidebar>
  );
}