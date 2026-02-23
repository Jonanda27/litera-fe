"use client";

interface LiveSessionCardProps {
  imageSrc: string;
}

export function LiveSessionCard({ imageSrc }: LiveSessionCardProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 w-full aspect-[3/4]">
        <img 
          src={imageSrc} 
          alt="Live Session Poster" 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/300x400/eeeeee/999999?text=Poster+Session";
          }}
        />
      </div>
      
      <button className="mt-4 bg-[#C31A26] text-white px-8 py-2 rounded-xl font-black text-[10px] shadow-lg hover:bg-red-700 transition-colors uppercase tracking-widest">
        Link Zoom
      </button>
    </div>
  );
}