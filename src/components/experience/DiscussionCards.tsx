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
      {/* Header - Dibuat sangat rapat ke atas dengan py-1 dan text-xs */}
      <div className="px-3 py-1 md:px-4 md:py-1.5 border-b bg-slate-50/50 shrink-0">
        <h4 className="font-black text-[9px] md:text-[11px] text-[#1e4e8c] uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse shrink-0"></span>
          Live Video Meetings
        </h4>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="py-4 md:py-6 text-center">
             <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase italic">Tidak ada meeting aktif</p>
          </div>
        ) : (
          items.map((item) => (
            <Link 
              href={`/peserta/experience/component/${item.id}`} 
              key={item.id} 
              className="block group"
            >
              <div className="bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98] md:active:scale-100">
                <div className="flex items-center gap-3 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Video size={16} className="md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] md:text-[13px] font-black text-slate-800 uppercase truncate leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-0.5 md:mt-1 truncate">
                      {item.room_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-50">
                   {/* Stacked Avatars */}
                   <div className="flex -space-x-2 md:-space-x-2.5">
                      {[1,2,3].map(i => (
                        <img 
                          key={i} 
                          src={`https://i.pravatar.cc/100?img=${i+10}`} 
                          className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white shadow-sm object-cover" 
                          alt="avatar"
                        />
                      ))}
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[7px] md:text-[8px] font-bold text-slate-500">
                        +5
                      </div>
                   </div>

                   {/* Join Action */}
                   <span className="text-[9px] md:text-[10px] font-black text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      JOIN <ArrowRight size={10} className="md:w-3 md:h-3" />
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