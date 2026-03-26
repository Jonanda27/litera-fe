"use client";

interface ExModuleItemProps {
  title: string;
  type: 'book' | 'video';
  active?: boolean;
  locked?: boolean;
}

export function ExModuleItem({ title, type, active, locked }: ExModuleItemProps) {
  // URL Icon dari Flaticon (menggunakan Flat Icons yang populer)
  const icons = {
    book: "https://cdn-icons-png.flaticon.com/512/3389/3389081.png", // Icon Buku
    video: "https://cdn-icons-png.flaticon.com/512/1179/1179069.png" // Icon Video/Play
  };

  return (
    <div className={`p-2 sm:p-3 md:p-4 rounded-xl border-2 flex flex-col items-center text-center h-full transition-all ${
      active ? 'bg-[#fff4e5] border-[#ffd9a0] shadow-md' : 'bg-white border-slate-100 shadow-sm'
    } ${locked ? 'opacity-40 grayscale pointer-events-none' : 'cursor-pointer hover:shadow-md hover:-translate-y-1'}`}>
      
      <div className="h-12 sm:h-14 md:h-16 flex items-center justify-center mb-2">
        {type === 'book' ? (
          /* Render Icon Buku */
          <img 
            src={icons.book} 
            alt="Book Icon" 
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
          />
        ) : (
          /* Render Icon Video */
          <div className="relative">
            <img 
              src={icons.video} 
              alt="Video Icon" 
              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain ${active ? 'brightness-110' : 'saturate-50'}`}
            />
          </div>
        )}
      </div>

      <p className="text-[9px] sm:text-[10px] font-bold text-slate-700 leading-tight uppercase tracking-tighter line-clamp-2 w-full">
        {title}
      </p>
    </div>
  );
}