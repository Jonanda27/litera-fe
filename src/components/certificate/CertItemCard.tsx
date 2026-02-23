"use client";

interface CertItemCardProps {
  title: string;
  subtitle: string;
  isLocked?: boolean;
  isSpecial?: boolean;
}

export function CertItemCard({ title, subtitle, isLocked, isSpecial }: CertItemCardProps) {
  return (
    <div className={`relative aspect-[1.4/1] rounded-lg border-2 p-2 flex flex-col items-center justify-center text-center transition-all ${
      isLocked ? 'opacity-30 grayscale' : 'hover:scale-105 cursor-pointer shadow-sm'
    } ${isSpecial ? 'border-[#C31A26] bg-[#FFF5F5]' : 'border-[#D4AF37] bg-white'}`}>
      
      {/* Bingkai Ornamen Emas */}
      <div className={`absolute inset-1 border ${isSpecial ? 'border-[#C31A26]' : 'border-[#D4AF37]'} opacity-40`} />

      {/* Logo Tengah */}
      <div className="mb-2 z-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isSpecial ? 'border-[#C31A26] bg-[#C31A26]' : 'border-[#1E4E8C] bg-white'}`}>
          <span className={`font-black text-lg ${isSpecial ? 'text-white' : 'text-[#D4AF37]'}`}>Q</span>
        </div>
      </div>

      <div className="z-10 px-1">
        <p className="text-[8px] font-black text-slate-900 leading-tight uppercase tracking-tighter">
          {title}
        </p>
        <p className="text-[7px] font-bold text-slate-600 mt-1 leading-none">
          {subtitle}
        </p>
      </div>

      {/* Badge Ribbon untuk Sertifikat Utama */}
      {isSpecial && !isLocked && (
        <div className="absolute top-1 right-1">
          <span className="text-xl">🎖️</span>
        </div>
      )}
    </div>
  );
}