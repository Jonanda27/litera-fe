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
  ArrowLeft,
  Image as ImageIcon,
  Loader2, // Icon untuk loading
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DiscussionCards from "@/components/experience/DiscussionCards";
import {
  API_BASE_URL,
  SOCKET_API_BASE_URL,
} from "../../../lib/constans/constans";

interface Message {
  id: string;
  text: string;
  image?: string;
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

const SOCKET_URL = SOCKET_API_BASE_URL;

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

  // --- STATE FITUR GAMBAR ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false); // State untuk loading kirim
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] =
    useState(false);
  const [isMobileMembersOpen, setIsMobileMembersOpen] = useState(false);
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
      const res = await fetch(`${API_BASE_URL}/meetings/all-meetings`);
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
      setUnreadCounts((prev) => ({ ...prev, [currentDiscussionId]: 0 }));
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
              image: data.image,
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
              image: m.imageUrl,
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

  // Handle auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const timeoutId = setTimeout(() => {
        scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
      }, 100); // Sedikit delay agar gambar yang dirender sempat mengambil space
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  // --- HELPERS GAMBAR ---
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi Ukuran (Maks 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar terlalu besar! Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ""; // Reset agar bisa pilih file yang sama
  };

  // --- HELPER LINK CLICKABLE ---
  const renderMessageText = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold text-blue-200 hover:text-white break-all transition-colors"
            onClick={(e) => e.stopPropagation()} // Agar tidak trigger preview message
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

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
      const response = await fetch(
        `${API_BASE_URL}/meetings/create-meeting/${currentDiscussionId}/start-meeting`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: meetingTitle,
            description: meetingDesc,
          }),
        },
      );
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
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsMeetingLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      isSending ||
      (!inputMessage.trim() && !selectedImage) ||
      !socket ||
      !currentUser
    )
      return;

    if (!joinedRoomIds.includes(currentDiscussionId)) {
      const room = allDiscussions.find(
        (d) => d.id.toString() === currentDiscussionId,
      );
      setPendingRoom(room || null);
      setIsConfirmModalOpen(true);
      return;
    }

    setIsSending(true);
    try {
      socket.emit("send_message", {
        room: currentDiscussionId,
        senderId: currentUser.id,
        text: inputMessage,
        image: selectedImage,
      });
      setInputMessage("");
      setSelectedImage(null);
    } catch (err) {
      console.error("Gagal mengirim:", err);
    } finally {
      setIsSending(false);
    }
  };

  const triggerJoinModal = () => {
    const room = allDiscussions.find(
      (d) => d.id.toString() === currentDiscussionId,
    );
    setPendingRoom(room || null);
    setIsConfirmModalOpen(true);
  };

  const activeList = viewMode === "all" ? allDiscussions : myDiscussions;
  const currentRoomData = allDiscussions.find(
    (d) => d.id.toString() === currentDiscussionId,
  );
  const isOwner =
    currentRoomData &&
    currentUser &&
    Number(currentRoomData.owner_id) === currentUser.id;
  const hasActiveMeeting = currentRoomData?.meeting_id != null;
  const filteredMeetings = meetings.filter(
    (m: any) => m.id.toString() === currentRoomData?.meeting_id?.toString(),
  );

  if (isLoadingSync)
    return (
      <div className="h-screen flex items-center justify-center font-black text-[#1e4e8c] animate-pulse">
        SYNCING EXPERIENCE...
      </div>
    );

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto h-[calc(100dvh-80px)] md:h-[calc(100vh-120px)] flex flex-col px-2 md:px-4 lg:px-0">
        <div className="flex justify-between items-end mb-3 md:mb-6 flex-shrink-0 pt-4 md:pt-0 px-2 md:px-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Experience
            </h1>
            <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase mt-0.5 md:mt-1 tracking-widest">
              Ruang Diskusi & Community Hub
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 bg-white rounded-2xl md:rounded-[2.5rem] border shadow-xl overflow-hidden min-h-0 relative">
          {/* 1. Sidebar Kiri (List Diskusi) */}
          <div
            className={`${currentDiscussionId ? "hidden md:flex" : "flex"} col-span-12 md:col-span-4 lg:col-span-3 border-r flex-col bg-slate-50/50 z-10`}
          >
            <div className="p-4 md:p-5 border-b bg-white flex justify-between items-center shrink-0">
              <h3 className="font-black text-slate-800 text-[10px] md:text-[11px] uppercase tracking-widest">
                Explore Chat
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="p-2 md:p-2.5 bg-[#c31a26] text-white rounded-xl hover:scale-110 transition-all shadow-lg"
              >
                <Plus size={14} className="md:w-4 md:h-4" />
              </button>
            </div>
            <div className="flex p-2 gap-1 bg-white border-b shrink-0">
              <button
                onClick={() => setViewMode("all")}
                className={`flex-1 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${viewMode === "all" ? "bg-[#c31a26] text-white shadow-md" : "text-slate-400 hover:bg-slate-50"}`}
              >
                <Globe size={12} className="md:w-3.5 md:h-3.5" /> Semua
              </button>
              <button
                onClick={() => setViewMode("joined")}
                className={`flex-1 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${viewMode === "joined" ? "bg-[#1e4e8c] text-white shadow-md" : "text-slate-400 hover:bg-slate-50"}`}
              >
                <BookmarkCheck size={12} className="md:w-3.5 md:h-3.5" />{" "}
                Diikuti
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 md:p-3 space-y-2 custom-scrollbar">
              {activeList.map((room) => {
                const roomId = room.id.toString();
                const count = unreadCounts[roomId] || 0;
                return (
                  <div
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`p-3 md:p-4 rounded-[1rem] cursor-pointer transition-all border-2 relative ${currentDiscussionId === roomId ? "bg-white border-[#c31a26] shadow-sm" : "border-transparent hover:bg-white/60"}`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-black text-[11px] md:text-[12px] text-slate-800 uppercase truncate">
                        # {room.name}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {count > 0 && (
                          <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full">
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
          <div
            className={`${!currentDiscussionId ? "hidden md:flex" : "flex"} col-span-12 md:col-span-8 lg:col-span-6 flex-col bg-white lg:border-r min-h-0 relative z-10`}
          >
            {currentDiscussionId ? (
              <>
                <div className="p-3 md:p-4 border-b flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentDiscussionId("")}
                      className="md:hidden p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#c31a26] rounded-xl flex items-center justify-center text-white font-black shadow-md uppercase text-sm md:text-base shrink-0">
                      {allDiscussions
                        .find((d) => d.id.toString() === currentDiscussionId)
                        ?.name.charAt(0)}
                    </div>
                    <h3 className="font-black text-slate-800 uppercase text-xs md:text-sm truncate max-w-[140px] sm:max-w-[200px]">
                      {allDiscussions.find(
                        (d) => d.id.toString() === currentDiscussionId,
                      )?.name || "Diskusi"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsMobileMembersOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 p-2 md:px-3 bg-blue-50 text-[#1e4e8c] rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Users size={16} className="md:w-4 md:h-4" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase hidden sm:block tracking-widest">
                      Detail
                    </span>
                  </button>
                </div>

                <div className="flex-1 overflow-hidden relative bg-[#f8fafc] flex flex-col min-h-0">
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth custom-scrollbar"
                  >
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] text-xs md:text-sm shadow-sm relative ${msg.isMe ? "bg-[#1e4e8c] text-white rounded-tr-sm" : "bg-white text-slate-900 rounded-tl-sm border border-slate-100"}`}
                        >
                          {!msg.isMe && (
                            <p className="text-[9px] md:text-[10px] font-black mb-1 text-[#c31a26] uppercase tracking-wider">
                              {msg.sender}
                            </p>
                          )}

                          {msg.image && (
                            <div className="mb-2 overflow-hidden rounded-lg border border-white/20 bg-black/5">
                              <img
                                src={msg.image}
                                alt="Sent image"
                                className="max-w-full h-auto cursor-zoom-in hover:scale-[1.02] transition-transform"
                                loading="lazy"
                                onClick={() => window.open(msg.image, "_blank")}
                              />
                            </div>
                          )}

                          <div className="font-medium leading-relaxed text-sm break-words">
                            {renderMessageText(msg.text)}
                          </div>
                          <p
                            className={`text-[8px] md:text-[9px] font-bold mt-2 text-right ${msg.isMe ? "text-white/60" : "text-slate-400"}`}
                          >
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 md:p-4 bg-white border-t shrink-0">
                  <AnimatePresence>
                    {selectedImage && (
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        className="mb-3 relative w-24 h-24 group"
                      >
                        <img
                          src={selectedImage}
                          className="w-full h-full object-cover rounded-xl border-2 border-[#1e4e8c]"
                        />
                        <button
                          disabled={isSending}
                          onClick={() => setSelectedImage(null)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-all"
                        >
                          <X size={12} />
                        </button>
                        {isSending && (
                          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                            <Loader2
                              className="text-white animate-spin"
                              size={20}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {joinedRoomIds.includes(currentDiscussionId) ? (
                    <form
                      onSubmit={sendMessage}
                      className="flex items-center gap-2 md:gap-3 bg-slate-50 rounded-xl md:rounded-2xl p-1.5 px-3 md:px-4 border border-slate-200 focus-within:border-[#1e4e8c] focus-within:bg-white transition-all shadow-inner"
                    >
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-slate-400 hover:text-[#1e4e8c] disabled:opacity-50 transition-colors"
                      >
                        <ImageIcon size={20} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                      <input
                        disabled={isSending}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={
                          isSending
                            ? "Mengirim..."
                            : "Ketik pesan atau lampirkan link..."
                        }
                        className="w-full bg-transparent border-none py-2 md:py-3 text-xs md:text-sm outline-none font-medium text-slate-800 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={
                          isSending || (!inputMessage.trim() && !selectedImage)
                        }
                        className="bg-[#c31a26] text-white p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-md hover:shadow-lg active:scale-95 disabled:bg-slate-300 disabled:shadow-none transition-all shrink-0"
                      >
                        {isSending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Send size={16} className="md:w-5 md:h-5" />
                        )}
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={triggerJoinModal}
                      className="w-full py-3.5 md:py-4 bg-[#1e4e8c] hover:bg-[#153a69] text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                      <UserPlus size={16} className="md:w-4 md:h-4" /> Bergabung
                      ke Grup
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center bg-slate-50/50">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[2rem] flex items-center justify-center mb-4 text-2xl md:text-3xl shadow-sm border border-slate-100">
                  💬
                </div>
                <h3 className="text-base md:text-lg font-black text-slate-800 uppercase">
                  Pilih Ruangan
                </h3>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold max-w-[200px] md:max-w-xs mt-2 uppercase leading-relaxed">
                  Silakan pilih dari daftar diskusi di samping untuk mulai
                  berinteraksi.
                </p>
              </div>
            )}
          </div>

          {/* 3. Sidebar Kanan (Info Members & Meeting) */}
          {isMobileMembersOpen && (
            <div
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[40] lg:hidden transition-opacity"
              onClick={() => setIsMobileMembersOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 right-0 z-[50] w-[85%] sm:w-[380px] bg-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out lg:static lg:w-auto lg:transform-none lg:shadow-none lg:flex lg:col-span-3 lg:bg-slate-50/30 min-h-0 lg:border-l ${isMobileMembersOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
          >
            <div className="lg:hidden p-4 md:p-5 border-b bg-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 text-[#1e4e8c] rounded-lg flex items-center justify-center">
                  <Users size={16} />
                </div>
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">
                  Info Ruangan
                </h3>
              </div>
              <button
                onClick={() => setIsMobileMembersOpen(false)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {currentDiscussionId ? (
              <>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="p-4 md:p-5 border-b bg-white/50 font-black text-slate-800 text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-between shrink-0">
                    Anggota Grup ({roomMembers.length})
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 custom-scrollbar">
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
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white text-[10px] md:text-xs font-black shadow-sm ${isOnline ? "bg-[#c31a26]" : "bg-slate-300"}`}
                          >
                            {member.nama?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] md:text-xs font-black text-slate-800 uppercase truncate">
                              {member.nama}{" "}
                              {member.id === currentUser?.id && (
                                <span className="text-slate-400 font-bold">
                                  (Anda)
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
                              ></span>
                              <span
                                className={`text-[8px] md:text-[9px] font-black uppercase tracking-wider ${isOnline ? "text-green-600" : "text-slate-400"}`}
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
                <div className="shrink-0 bg-slate-50/50 border-t border-slate-100 flex flex-col min-h-0">
                  <div className="px-4 py-3 md:px-5 md:py-4">
                    {hasActiveMeeting ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/peserta/experience/component/${currentRoomData?.meeting_id}`,
                          )
                        }
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 md:py-3 rounded-xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 animate-bounce"
                      >
                        <Radio size={16} /> Join Live Meeting
                      </button>
                    ) : isOwner ? (
                      <button
                        onClick={() => setIsCreateMeetingModalOpen(true)}
                        className="w-full bg-[#c31a26] hover:bg-[#a5161f] text-white px-4 py-2.5 md:py-3 rounded-xl font-black uppercase text-[10px] md:text-[11px] tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Mulai Diskusi Video
                      </button>
                    ) : (
                      <div className="w-full py-2.5 text-center border-2 border-dashed border-slate-200 bg-white rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Belum Ada Sesi Video
                      </div>
                    )}
                  </div>
                  <div className="flex-1 max-h-[250px] md:max-h-[300px] overflow-hidden bg-white/50">
                    {filteredMeetings.length > 0 ? (
                      <DiscussionCards items={filteredMeetings} />
                    ) : (
                      <div className="h-24 flex flex-col items-center justify-center p-4 text-center opacity-40">
                        <p className="text-[9px] font-black uppercase tracking-widest">
                          Tidak ada info meeting
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-20 grayscale">
                <Users size={40} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
                  Detail akan muncul setelah memilih ruangan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS SECTION */}
      <AnimatePresence>
        {isCreateMeetingModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 w-full max-w-lg shadow-2xl border-4 border-[#c31a26] relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50" />
              <button
                onClick={() => setIsCreateMeetingModalOpen(false)}
                className="absolute top-4 md:top-6 right-4 md:right-6 p-2 hover:bg-red-50 rounded-full transition-colors group z-10"
              >
                <X
                  size={20}
                  className="text-slate-400 group-hover:text-[#c31a26]"
                />
              </button>
              <div className="mb-6 md:mb-8 relative text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-red-50 rounded-xl md:rounded-2xl flex items-center justify-center text-[#c31a26] shadow-inner shrink-0">
                    <Video size={24} className="md:w-7 md:h-7" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <Radio
                        size={12}
                        className="text-[#c31a26] animate-pulse md:w-3.5 md:h-3.5"
                      />
                      <span className="text-[9px] md:text-[10px] font-black text-[#c31a26] uppercase tracking-[0.2em]">
                        Live Session
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">
                      Mulai Diskusi
                    </h2>
                  </div>
                </div>
              </div>
              <form
                onSubmit={handleCreateMeeting}
                className="space-y-4 md:space-y-5 relative"
              >
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-700 mb-2 uppercase tracking-widest">
                    Judul Diskusi
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] focus:bg-white outline-none font-bold text-slate-800 text-xs md:text-sm transition-all placeholder:text-slate-300"
                    placeholder="CONTOH: SHARING SESSION UI/UX"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-700 mb-2 uppercase tracking-widest">
                    Deskripsi Sesi
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] focus:bg-white outline-none font-bold text-slate-800 text-xs md:text-sm transition-all placeholder:text-slate-300 custom-scrollbar"
                    placeholder="JELASKAN APA YANG AKAN DIBAHAS..."
                    value={meetingDesc}
                    onChange={(e) => setMeetingDesc(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 md:gap-3 pt-2 md:pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateMeetingModalOpen(false)}
                    className="flex-1 py-3 md:py-4 font-black text-slate-400 hover:text-slate-600 uppercase text-[10px] md:text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isMeetingLoading}
                    className={`flex-[2] py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isMeetingLoading ? "bg-slate-300 text-white cursor-not-allowed" : "bg-[#c31a26] text-white hover:bg-[#a5161f] shadow-red-200"}`}
                  >
                    {isMeetingLoading ? (
                      <>
                        <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      "Buat & Gabung →"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 w-full max-w-md shadow-2xl border-4 border-[#1e4e8c] relative"
            >
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 md:mb-6 uppercase tracking-tighter">
                Terbitkan Topik
              </h2>
              <form
                onSubmit={handleCreateRoom}
                className="space-y-4 md:space-y-5"
              >
                <input
                  autoFocus
                  className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#c31a26] outline-none font-black text-slate-800 uppercase text-xs md:text-sm transition-all"
                  placeholder="Nama Ruangan..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <div className="flex gap-2 md:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 font-black text-slate-400 uppercase text-[10px] md:text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 md:py-4 bg-[#c31a26] text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs shadow-xl active:scale-95 transition-transform"
                  >
                    Buat Sekarang →
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 w-full max-w-sm shadow-2xl text-center border-4 border-[#c31a26]"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-5 text-2xl md:text-3xl shadow-inner">
                🤝
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 mb-2 uppercase">
                Ayo Bergabung!
              </h2>
              <p className="text-[9px] md:text-[10px] text-slate-500 mb-6 md:mb-8 font-bold uppercase leading-relaxed tracking-wider">
                Bergabung ke ruang{" "}
                <span className="text-[#c31a26]">"{pendingRoom?.name}"</span>{" "}
                untuk mulai berbagi pengalaman.
              </p>
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 py-3 font-black text-slate-400 uppercase text-[9px] md:text-[10px]"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmJoin}
                  className="flex-[2] py-3 md:py-4 bg-[#1e4e8c] text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] shadow-xl active:scale-95 transition-transform"
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
