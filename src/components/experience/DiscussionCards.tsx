"use client";

import Link from 'next/link';
import { Video, ArrowRight } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  room_name: string;
  description?: string;
}

interface DiscussionCardsProps {
  items: Meeting[];
}

export default function DiscussionCards({ items = [] }: DiscussionCardsProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50/50">
        <h4 className="font-black text-[10px] text-[#1e4e8c] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Video Meetings
        </h4>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="py-4 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase italic">Tidak ada meeting aktif</p>
          </div>
        ) : (
          items.map((item) => (
            <Link 
              href={`/peserta/experience/component/${item.id}`} 
              key={item.id} 
              className="block group"
            >
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-3 hover:border-blue-500 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Video size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-800 uppercase truncate leading-none">
                      {item.title}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                      {item.room_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" />
                      ))}
                      <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[7px] font-bold text-slate-500">+5</div>
                   </div>
                   <span className="text-[9px] font-black text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      JOIN <ArrowRight size={10} />
                   </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}