"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Send, Bot, User, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

export default function JurnalAIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { 
      role: "ai", 
      text: "Halo! Saya Asisten Riset Referensi LITERA. Ada topik buku atau referensi jurnal yang ingin kamu diskusikan hari ini?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Nama state yang benar

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true); // Menggunakan setIsLoading

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/ai/jurnal-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "Maaf, server AI sedang sibuk." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Terjadi kesalahan koneksi jaringan." }]);
    } finally {
      setIsLoading(false); // Perbaikan: tadinya 'setIsProcessing(false)' yang menyebabkan error
    }
  };

  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-red-600 p-6 flex items-center gap-4 text-white shrink-0">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-white/20 rounded-lg transition-colors border border-white/10 shadow-sm"
            title="Kembali"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest">AI Asisten Riset</h1>
            <p className="text-xs font-medium text-red-100">Teman diskusi untuk mencari referensi bukumu</p>
          </div>
        </div>

        {/* Area Chat */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-red-100 text-red-600 border border-red-200"
              }`}>
                {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
              </div>

              <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl shadow-sm ${
                msg.role === "user" 
                  ? "bg-red-600 text-white rounded-tr-none" 
                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
              }`}>
                
                {msg.role === "user" ? (
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap m-0">
                    {msg.text}
                  </p>
                ) : (
                  <div className="markdown-body text-sm leading-relaxed">
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
             <div className="flex flex-row gap-4">
               <div className="w-10 h-10 bg-red-100 text-red-600 border border-red-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                 <Bot size={20} />
               </div>
               <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2 h-[60px]">
                 <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-bounce"></span>
                 <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                 <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></span>
               </div>
             </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya seputar ide riset buku, referensi jurnal ilmiah..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-red-500 transition-colors text-sm font-medium text-slate-700"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-red-600 text-white px-6 rounded-xl hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center shadow-md shadow-red-200"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .markdown-body p { margin-bottom: 1rem; color: #334155; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body strong { font-weight: 800; color: #0f172a; }
        .markdown-body ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1rem; }
        .markdown-body ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1rem; }
        .markdown-body li { margin-bottom: 0.5rem; display: list-item !important; }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { font-weight: 900; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.75rem; }
      `}</style>
    </Sidebar>
  );
}