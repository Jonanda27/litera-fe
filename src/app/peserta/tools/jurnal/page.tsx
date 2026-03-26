"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { Bot, User, ArrowLeft, MessageSquare, ChevronRight, BookOpen, HelpCircle, Sparkles, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { FAQ_DATA, FAQItem } from "./Data/faqData";

export default function JurnalFAQPage() {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSelectFAQ = (item: FAQItem, index: number) => {
    if (isLoading) return;

    setSelectedId(index);
    setMessages((prev) => [...prev, { role: "user", text: item.question }]);
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: item.answer }]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* LEFT PANEL: Menu Navigasi FAQ */}
        <div className="w-80 border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0 hidden md:flex">
          <div className="p-6 border-b border-slate-100 bg-white">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle size={18} className="text-red-500" />
              TOPIK POPULER
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {FAQ_DATA.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSelectFAQ(item, index)}
                disabled={isLoading}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-start gap-3 group ${
                  selectedId === index 
                  ? "bg-red-600 text-white shadow-lg shadow-red-200 scale-[1.02]" 
                  : "bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-100"
                }`}
              >
                <BookOpen size={16} className={`mt-0.5 shrink-0 ${selectedId === index ? "text-white" : "text-slate-400 group-hover:text-red-500"}`} />
                <span className="text-xs font-semibold leading-relaxed">{item.question}</span>
              </button>
            ))}
          </div>
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Sparkles size={12} /> Tips Riset
              </p>
              <p className="text-[11px] text-red-800 leading-relaxed font-medium">
                Gunakan kata kunci spesifik saat mencari jurnal.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header Internal */}
          <div className="p-6 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-4">
              {/* Button Kembali */}
              <button 
                onClick={() => router.back()} 
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-600 border border-slate-100 active:scale-95 group"
                title="Kembali"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              
              <div>
                <h1 className="text-lg font-black text-slate-800 tracking-tight">ASISTEN LITERA</h1>
              </div>
            </div>
            <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
               <div className="w-8 h-8 rounded-full border-2 border-white bg-red-100 flex items-center justify-center">
                  <Bot size={14} className="text-red-600" />
               </div>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-red-200 rotate-3">
                  <MessageSquare size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800">Ada yang bisa dibantu?</h2>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Pilih salah satu topik di panel kiri untuk memulai diskusi mengenai riset atau penulisan buku Anda.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-5 duration-500`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg mt-1 ${
                    msg.role === "user" ? "bg-slate-800 text-white" : "bg-red-600 text-white"
                  }`}>
                    {msg.role === "user" ? <User size={22} /> : <Bot size={22} />}
                  </div>

                  {/* Card Jawaban AI */}
                  <div className={`max-w-[80%] p-6 md:p-7 rounded-[2rem] border ${
                    msg.role === "user" 
                      ? "bg-slate-800 text-white rounded-tr-none shadow-xl border-slate-700" 
                      : "bg-slate-50 text-slate-800 rounded-tl-none border-slate-200 shadow-sm" 
                  }`}>
                    <div className="markdown-body text-[14px] md:text-[15px] leading-relaxed tracking-wide">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
               <div className="flex items-start gap-4 animate-in fade-in duration-300">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg mt-1">
                   <Bot size={22} />
                 </div>
                 <div className="bg-slate-50 border border-slate-200 p-6 rounded-[2rem] rounded-tl-none shadow-sm flex items-center gap-2">
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                 </div>
               </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Internal */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              &copy; 2026 Powered by Litera Knowledge Base
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .markdown-body p { margin-bottom: 1.2rem; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .markdown-body li { margin-bottom: 0.5rem; }
        .markdown-body strong { font-weight: 900; color: inherit; }
      `}</style>
    </Sidebar>
  );
}