"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  ShieldAlert,
  LogOut,
  Info,
  Bot
} from "lucide-react";
import { API_BASE_URL, SOCKET_API_BASE_URL } from "@/lib/constans/constans";

export default function KontakMentor() {
  const [mentor, setMentor] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [isMentorTyping, setIsMentorTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        
        // 1. Ambil data diri dan mentor dari endpoint /auth/me
        const resMe = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataMe = await resMe.json();
        
        if (dataMe) {
          setCurrentUser(dataMe);
          
          // Integrasi data mentor (menggunakan mentorData dari API backend Anda)
          const mentorData = dataMe.mentorData || dataMe.mentor;

          if (mentorData) {
            setMentor(mentorData);
            
            // 2. Generate Room ID unik antara mentor dan peserta
            const generatedRoomId = `private-mentoring-${mentorData.id}-${dataMe.id}`;
            setRoomId(generatedRoomId);

            // 3. Ambil riwayat chat berdasarkan Room ID tersebut
            try {
              const resHistory = await fetch(`${API_BASE_URL}/books/private-history/${generatedRoomId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const historyData = await resHistory.json();
              
              if (historyData.success) {
                const formattedMessages = historyData.data.map((m: any) => ({
                  id: m.id,
                  senderId: m.senderId,
                  sender: m.sender?.nama || (m.senderId === dataMe.id ? dataMe.nama : mentorData.nama),
                  text: m.message,
                  timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(formattedMessages);
              }
            } catch (err) {
              console.error("Gagal mengambil riwayat chat:", err);
            }
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data profil:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (!currentUser || !roomId || !currentUser.nama) return;

    const socketUrl = `${SOCKET_API_BASE_URL}/mentoring-privat`;
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Terhubung ke Socket Privat");
      newSocket.emit("join_mentoring", { roomId, user: currentUser });
    });

    newSocket.on("receive_private_message", (data: any) => {
      setMessages((prev) => [...prev, data]);
    });

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [roomId, currentUser, mentor]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMentorTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !roomId || !currentUser || !mentor) return;

    const token = localStorage.getItem("token");
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const socketPayload = {
      room: roomId,
      senderId: currentUser.id,
      senderName: currentUser.nama, 
      text: inputMessage,
      timestamp: currentTime
    };

    try {
      const response = await fetch(`${API_BASE_URL}/books/private-send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: roomId,
          recipientId: mentor.id,
          recipientRole: 'mentor',
          message: inputMessage
        })
      });

      const result = await response.json();

      if (result.success) {
        socket.emit("send_private_message", socketPayload);

        const newUserMessage = {
          senderId: currentUser.id,
          sender: currentUser.nama,
          text: inputMessage,
          timestamp: currentTime
        };
        
        setMessages((prev) => [...prev, newUserMessage]);
        setInputMessage("");

        if (result.autoReply) {
          setIsMentorTyping(true);

          setTimeout(() => {
            const botPayload = {
              room: roomId,
              senderId: mentor.id, 
              senderName: mentor.nama, 
              text: result.autoReply.message, 
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            socket.emit("send_private_message", botPayload);
            setIsMentorTyping(false);
            
            setMessages((prev) => [...prev, {
              senderId: mentor.id,
              sender: mentor.nama,
              text: result.autoReply.message,
              timestamp: botPayload.timestamp
            }]);
          }, 3000); 
        }
      } else {
        alert("Gagal menyimpan pesan: " + result.message);
      }
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
    }
  };

  const handleEndChat = () => {
    window.location.href = "/peserta/dashboard";
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-[#c31a26] mb-4" size={40} />
      <p className="font-black uppercase tracking-widest text-xs text-slate-400">Mensinkronisasi Riwayat Bimbingan...</p>
    </div>
  );

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
              Flash <span className="text-[#c31a26]">Consultation</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <ShieldAlert size={14} className="text-amber-500" />
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                 Koneksi Terenkripsi: Riwayat bimbingan tersimpan aman
               </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl text-center space-y-4">
              <div className="w-28 h-28 mx-auto rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl rotate-3">
                <img 
                   src={`https://ui-avatars.com/api/?name=${mentor?.nama || "Mentor"}&background=c31a26&color=fff&size=200`} 
                   alt="Mentor" 
                   className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-800 uppercase italic leading-tight">{mentor?.nama}</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{mentor?.spesialisasi || "Mentor Ahli"}</p>
              </div>
              <div className="pt-4 grid grid-cols-2 gap-2">
                 <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                    <p className="text-xs font-bold text-green-600">Terhubung</p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Arsip</p>
                    <p className="text-xs font-bold text-slate-700">Aktif</p>
                 </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-[2rem] p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={16} className="text-blue-600" />
                  <span className="text-[9px] font-black uppercase text-blue-700 tracking-widest">Tips Bimbingan</span>
                </div>
                <p className="text-[11px] font-medium text-blue-800 leading-relaxed italic">
                  Tanyakan kendala teknis atau mintalah feedback langsung mengenai progres naskah Anda di sini.
                </p>
            </div>
          </section>

          <section className="lg:col-span-8 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl overflow-hidden h-[75vh] flex flex-col relative">
            <div className="p-5 border-b bg-slate-50 flex justify-between items-center z-10 shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black uppercase text-lg">
                    {mentor?.nama?.charAt(0) || "M"}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-xs">Private Discussion</h3>
                    <div className="flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                       <span className="text-[9px] font-black text-green-600 uppercase">Live & Secure</span>
                    </div>
                  </div>
               </div>
               <button 
                  onClick={() => setShowConfirmExit(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
               >
                  <LogOut size={14} /> Tutup Sesi
               </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fcfcfc] custom-scrollbar"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                   <MessageCircle size={32} className="text-slate-400" />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Belum ada percakapan</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isSystemMsg = msg.text && msg.text.startsWith("[SYSTEM]");
                  const displayText = isSystemMsg ? msg.text.replace("[SYSTEM]", "").trim() : msg.text;
                  const isMe = msg.senderId === currentUser?.id && !isSystemMsg;

                  return (
                    <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm ${
                        isMe 
                        ? "bg-[#1e4e8c] text-white rounded-tr-none" 
                        : "bg-white text-slate-900 rounded-tl-none border border-slate-100" 
                      }`}>
                        
                        {!isMe && (
                          <div className="flex items-center gap-1 mb-1 text-[9px] font-black uppercase text-[#c31a26]">
                            {mentor?.nama || msg.senderName || msg.sender}
                          </div>
                        )}
                        
                        <p className="font-medium text-sm leading-relaxed">{displayText}</p>
                        <p className={`text-[8px] font-bold mt-2 text-right ${isMe ? "text-white/60" : "text-slate-400"}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              
              {isMentorTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm bg-white text-slate-900 rounded-tl-none border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center gap-1 mb-1 text-[9px] font-black uppercase text-[#c31a26]">
                      {mentor?.nama || "Mentor"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 italic">Mengetik balasan...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t shrink-0">
               <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Tulis pesan untuk mentor..."
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm text-black focus:border-[#1e4e8c] outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="bg-[#1e4e8c] text-white p-4 rounded-2xl shadow-xl hover:brightness-110 disabled:bg-slate-200 transition-all active:scale-95 flex items-center justify-center"
                  >
                    <Send size={20} />
                  </button>
               </form>
            </div>
          </section>
        </div>

        <AnimatePresence>
          {showConfirmExit && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} 
                 animate={{ scale: 1, opacity: 1 }} 
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center"
               >
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic">Tutup Sesi?</h3>
                  <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
                    Riwayat pesan tetap tersimpan di akun Anda.
                  </p>
                  <div className="mt-8 flex flex-col gap-2">
                     <button onClick={handleEndChat} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs">
                       Ya, Keluar
                     </button>
                     <button onClick={() => setShowConfirmExit(false)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs">
                       Tetap di Sini
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </Sidebar>
  );
}