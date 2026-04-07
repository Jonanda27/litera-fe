"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "@/components/Sidebar";
import { 
  Send, 
  Loader2, 
  MessageSquare, 
  Search, 
  Clock, 
  AlertCircle, 
  Bot,
  CheckCircle2
} from "lucide-react";
import { API_BASE_URL, SOCKET_API_BASE_URL } from "@/lib/constans/constans";
import { io, Socket } from "socket.io-client";

export default function MentorChat() {
  const [students, setStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const roomIdRef = useRef<string | null>(null);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // --- 1. LOAD INITIAL DATA & HITUNG UNHANDLED MESSAGES ---
  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const resMe = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataMe = await resMe.json();
        setCurrentUser(dataMe);

        const resStudents = await fetch(`${API_BASE_URL}/mentors/my-students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const studentData = await resStudents.json();

        if (studentData.success) {
          const studentsWithUnread = await Promise.all(studentData.data.map(async (student: any) => {
            const generatedRoom = `private-mentoring-${dataMe.id}-${student.id}`;
            let unhandledCount = 0;

            try {
              const resHistory = await fetch(`${API_BASE_URL}/books/private-history/${generatedRoom}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const historyData = await resHistory.json();
              
              if (historyData.success) {
                const msgs = historyData.data;
                let studentMsgs = 0;
                let systemMsgs = 0;

                for (let i = msgs.length - 1; i >= 0; i--) {
                  const m = msgs[i];
                  const isSystem = m.message.startsWith("[SYSTEM]");
                  const isMentor = m.senderId === dataMe.id && !isSystem;

                  if (isMentor) break;

                  if (isSystem) {
                    systemMsgs++;
                  } else if (m.senderId === student.id) {
                    studentMsgs++;
                  }
                }
                
                unhandledCount = Math.max(0, studentMsgs - systemMsgs);
              }
            } catch (err) {
              console.error("Gagal kalkulasi unread:", err);
            }

            return { ...student, unhandledCount };
          }));

          setStudents(studentsWithUnread);
        }
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // --- 2. SOCKET CONNECTION ---
  useEffect(() => {
    if (!currentUser || students.length === 0) return;

    const newSocket = io(`${SOCKET_API_BASE_URL}/mentoring-privat`, {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Mentor Terhubung ke Socket Privat");
      students.forEach(student => {
        const room = `private-mentoring-${currentUser.id}-${student.id}`;
        newSocket.emit("join_mentoring", { roomId: room, user: currentUser });
      });
    });

    newSocket.on("receive_private_message", (data: any) => {
      const isSystemMsg = data.text && data.text.startsWith("[SYSTEM]");
      const isMentor = data.senderId === currentUser.id && !isSystemMsg;

      if (data.room === roomIdRef.current) {
        setMessages((prev) => {
          const isDuplicate = prev.some(m => m.text === data.text && m.timestamp === data.timestamp);
          if (isDuplicate) return prev;
          return [...prev, data];
        });
      }

      setStudents((prevStudents) => prevStudents.map(s => {
        const sRoom = `private-mentoring-${currentUser.id}-${s.id}`;
        if (sRoom === data.room) {
          if (data.senderId === s.id) {
            return { ...s, unhandledCount: (s.unhandledCount || 0) + 1 };
          } else if (isSystemMsg) {
            return { ...s, unhandledCount: Math.max(0, (s.unhandledCount || 0) - 1) };
          } else if (isMentor) {
            return { ...s, unhandledCount: 0 };
          }
        }
        return s;
      }));
    });

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [currentUser, students.length]);

  // --- 3. SELECT STUDENT ---
  const selectStudent = async (student: any) => {
    const generatedRoom = `private-mentoring-${currentUser.id}-${student.id}`;
    setRoomId(generatedRoom);
    setSelectedUser(student);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/books/private-history/${generatedRoom}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        const formatted = result.data.map((m: any) => ({
          senderId: m.senderId,
          senderRole: m.senderRole, 
          sender: m.sender?.nama || (m.senderId === student.id ? student.nama : currentUser.nama),
          text: m.message,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 4. SEND MESSAGE ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !roomId) return;

    const token = localStorage.getItem("token");
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const response = await fetch(`${API_BASE_URL}/books/private-send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: roomId,
          recipientId: selectedUser.id,
          recipientRole: 'peserta',
          message: inputMessage
        })
      });

      if ((await response.json()).success) {
        socket.emit("send_private_message", {
          room: roomId,
          senderId: currentUser.id,
          senderName: currentUser.nama,
          text: inputMessage,
          timestamp: timestamp
        });

        setMessages((prev) => {
          const isDuplicate = prev.some(m => m.text === inputMessage && m.timestamp === timestamp);
          if (isDuplicate) return prev;
          return [...prev, {
            senderId: currentUser.id,
            sender: currentUser.nama,
            text: inputMessage,
            timestamp: timestamp
          }];
        });

        setStudents(prev => prev.map(s => s.id === selectedUser.id ? { ...s, unhandledCount: 0 } : s));
        setInputMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          {/* PERBAIKAN: Teks Mentor sekarang berwarna hitam/slate-900 agar terlihat */}
          <h1 className="text-2xl font-black italic uppercase">
            <span className="text-slate-900">Mentor</span> <span className="text-blue-600">Console</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SLA Response Limit: 48 Hours</p>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* LIST SISWA */}
          <aside className="col-span-4 bg-white rounded-3xl p-4 shadow-sm border h-[75vh] overflow-hidden flex flex-col">
            <div className="relative mb-4">
              {/* PERBAIKAN: Input warna teks lebih tegas & placeholder terlihat */}
              <input 
                type="text" 
                placeholder="Cari Peserta..." 
                className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 custom-scrollbar p-1">
              {students.filter(s => s.nama.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => {
                const isSelected = selectedUser?.id === student.id;
                return (
                  <button 
                    key={student.id} 
                    onClick={() => selectStudent(student)}
                    className={`w-full transition-all relative border flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl ${
                      isSelected 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                      : "bg-white text-slate-900 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg uppercase flex-shrink-0 ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}> 
                      {student.nama[0]} 
                    </div>
                    <div className="flex flex-col flex-1 items-start text-left">
                      {/* PERBAIKAN: Teks nama terang saat di select, gelap saat tidak */}
                      <p className={`text-xs font-bold uppercase truncate w-full ${isSelected ? "text-white" : "text-slate-800"}`}>
                        {student.nama}
                      </p>
                      
                      <div className={`flex items-center gap-1.5 mt-2 ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                        {student.unhandledCount > 0 ? (
                          <><MessageSquare size={12} className={isSelected ? "text-white" : "text-rose-500"}/> <span className="text-[9px] font-black uppercase tracking-wider">{student.unhandledCount} Pesan Baru</span></>
                        ) : (
                          <><CheckCircle2 size={12} className={isSelected ? "text-white" : "text-green-500"}/> <span className="text-[9px] font-black uppercase tracking-wider">Terbalas</span></>
                        )}
                      </div>
                    </div>
                    {/* Badge Angka Notifikasi Mengambang */}
                    {student.unhandledCount > 0 && !isSelected && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white"> 
                        {student.unhandledCount} 
                      </span>
                    )}
                  </button>
                )
              })}
              {students.length === 0 && !isLoading && (
                 <div className="text-center py-10 opacity-50">
                    <p className="text-xs font-bold text-slate-500">Tidak ada peserta</p>
                 </div>
              )}
            </div>
          </aside>

          {/* CHAT AREA */}
          <main className="col-span-8 bg-white rounded-3xl border shadow-xl h-[75vh] flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                <div className="p-4 border-b flex justify-between items-center bg-white z-10 shadow-sm shrink-0">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black uppercase">{selectedUser.nama[0]}</div>
                      <div>
                        {/* PERBAIKAN: Nama User di header jelas terbaca */}
                        <p className="text-sm font-bold text-slate-900 uppercase truncate">{selectedUser.nama}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                           <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Live & Secure</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end shrink-0 hidden md:flex">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full bg-orange-50 tracking-wider uppercase">
                        <Clock size={14}/> SLA 48H ACTIVE
                      </div>
                   </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
                  {messages.map((msg, i) => {
                    const isSystemMsg = msg.text && msg.text.startsWith("[SYSTEM]");
                    const displayText = isSystemMsg ? msg.text.replace("[SYSTEM]", "").trim() : msg.text;
                    const isMe = msg.senderId === currentUser.id && !isSystemMsg;
                    const isRightAlign = isMe || isSystemMsg;

                    return (
                      <div key={i} className={`flex ${isRightAlign ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                          isSystemMsg 
                          ? "bg-white text-slate-700 border-dashed border-2 border-slate-300 rounded-br-none" 
                          : isMe 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                        }`}>
                          
                          {isSystemMsg && (
                            <div className="flex items-center justify-end gap-1.5 mb-2 text-[9px] font-black uppercase text-slate-400">
                              <Bot size={12}/> Auto Response System
                            </div>
                          )}

                          {!isRightAlign && (
                            <div className="flex items-center gap-1.5 mb-2 text-[9px] font-black uppercase text-slate-500">
                              <span className="w-4 h-4 bg-slate-200 rounded text-[8px] flex items-center justify-center text-slate-600">{msg.sender?.[0] || "U"}</span>
                              {msg.sender || msg.senderName || "Peserta"}
                            </div>
                          )}

                          {/* PERBAIKAN: Teks lebih terbaca dan responsif */}
                          <p className={`text-sm font-medium leading-relaxed ${isMe ? 'text-white' : 'text-slate-800'}`}>
                            {displayText}
                          </p>
                          
                          <p className={`text-[9px] mt-2 text-right font-bold tracking-tight ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AREA INPUT CHAT */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                   <form onSubmit={handleSendMessage} className="flex gap-3">
                      {/* PERBAIKAN: Field input lebih terang, placeholder jelas */}
                      <input 
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Tulis balasan untuk peserta..."
                        className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 placeholder-slate-400 font-medium"
                      />
                      <button 
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center"
                      >
                        <Send size={20} />
                      </button>
                   </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40 gap-4 bg-slate-50/50">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                  <MessageSquare size={32}/>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500">Pilih Peserta</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">Mulai bimbingan dari daftar di sebelah kiri</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1; 
        }
      `}</style>
    </Sidebar>
  );
}