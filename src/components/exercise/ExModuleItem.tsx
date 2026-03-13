"use client";

interface ExModuleItemProps {
  title: string;
  type: 'book' | 'video';
  active?: boolean;
  locked?: boolean;
}

export function ExModuleItem({ title, type, active, locked }: ExModuleItemProps) {
  return (
    <div className={`p-2 sm:p-3 md:p-4 rounded-xl border-2 flex flex-col items-center text-center h-full transition-all ${
      active ? 'bg-[#fff4e5] border-[#ffd9a0] shadow-md' : 'bg-white border-slate-100 shadow-sm'
    } ${locked ? 'opacity-40 grayscale' : 'cursor-pointer hover:shadow-md'}`}>
      
      <div className="h-12 sm:h-14 md:h-16 flex items-center justify-center mb-2">
        {type === 'book' ? (
          <span className="text-3xl sm:text-4xl md:text-5xl">📚</span>
        ) : (
          <div className={`w-10 h-7 sm:w-12 sm:h-8 md:w-14 md:h-10 rounded-md sm:rounded-lg flex items-center justify-center ${active ? 'bg-red-600' : 'bg-slate-500'}`}>
            <span className="text-white text-sm sm:text-lg md:text-xl">▶️</span>
          </div>
        )}
      </div>

      <p className="text-[9px] sm:text-[10px] font-bold text-slate-700 leading-tight uppercase tracking-tighter line-clamp-2 w-full">
        {title}
      </p>
    </div>
  );
}