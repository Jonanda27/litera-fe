"use client";

interface PastVideoCardProps {
  title: string;
  thumbnail: string;
}

export function PastVideoCard({ title, thumbnail }: PastVideoCardProps) {
  return (
    <div className="space-y-3 group cursor-pointer">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative aspect-video">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x225/dddddd/666666?text=Video+Recording";
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/20 transition-all">
          <div className="w-12 h-8 bg-[#FF0000] rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-xs">▶️</span>
          </div>
        </div>
      </div>
      <p className="font-bold text-slate-700 text-sm leading-tight px-1">{title}</p>
    </div>
  );
}