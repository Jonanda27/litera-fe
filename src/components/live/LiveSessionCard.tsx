import React from 'react';

interface LiveSessionCardProps {
  imageSrc: string;
  title: string;
  speaker: string;
  status: 'scheduled' | 'active' | 'ended';
  time: string;
}

export const LiveSessionCard = ({ imageSrc, title, speaker, status, time }: LiveSessionCardProps) => {
  return (
    <div className="relative bg-white border-4 border-slate-900 rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1">
      {/* Label Live jika status active */}
      {status === 'active' && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-md animate-pulse border-2 border-slate-900">
          ● LIVE NOW
        </div>
      )}

      <div className="h-48 overflow-hidden border-b-4 border-slate-900">
        <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
      </div>

      <div className="p-5 space-y-2">
        <h3 className="font-black text-slate-900 uppercase italic truncate">{title}</h3>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Speaker: {speaker}</p>
          <p className="text-[10px] font-black text-[#c31a26] uppercase italic">{time}</p>
        </div>
      </div>
    </div>
  );
};