import React from 'react';
import { Play } from 'lucide-react';

interface PastVideoCardProps {
  title: string;
  thumbnail: string;
  url?: string;
}

export const PastVideoCard = ({ title, thumbnail, url }: PastVideoCardProps) => {
  const handleWatch = () => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert("Rekaman belum tersedia untuk sesi ini.");
    }
  };

  return (
    <div
      onClick={handleWatch}
      className="group cursor-pointer bg-white border-4 border-slate-900 rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(30,78,140,1)] hover:-translate-y-1 transition-all"
    >
      <div className="relative h-40 bg-slate-200">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        {/* Overlay Play Button */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white p-3 rounded-full shadow-xl">
            <Play size={24} className="text-[#1E4E8C] fill-current" />
          </div>
        </div>
      </div>
      <div className="p-4 bg-white">
        <h4 className="font-black text-slate-900 text-sm uppercase leading-tight line-clamp-2 italic">
          {title}
        </h4>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
          Klik untuk menonton
        </p>
      </div>
    </div>
  );
};