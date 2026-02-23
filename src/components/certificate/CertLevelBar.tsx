"use client";

interface CertLevelBarProps {
  level: number;
  progress: number;
  barColor: string;
}

export function CertLevelBar({ level, progress, barColor }: CertLevelBarProps) {
  return (
    <div className="flex items-center gap-4 mb-2">
      <span className="font-black text-slate-800 text-xl min-w-[80px]">Level-{level}</span>
      <div className="flex-1 bg-[#1E4E8C] h-6 rounded-full overflow-hidden relative shadow-inner border-2 border-white">
        <div 
          className={`h-full ${barColor} flex items-center justify-end pr-4 transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        >
          <span className="text-white font-black text-[10px] whitespace-nowrap">
            Progres kamu {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}