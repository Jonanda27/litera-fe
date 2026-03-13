"use client";

export function ExFooterTools() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
      {/* Tools Pendukung */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 mb-5 md:mb-6 text-base md:text-lg">Tools Pendukung</h3>
        <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 items-center justify-between sm:justify-start">
          {['📚', '🏠', '✍️', '📖', '💼'].map((icon, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl mb-2">{icon}</span>
              <div className={`h-2 md:h-3 w-8 md:w-12 rounded-full ${['bg-red-500', 'bg-lime-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'][i]}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Kontak Mentor */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
        <h3 className="font-black text-slate-800 mb-4 md:mb-6 text-base md:text-lg">Kontak Mentor Kamu</h3>
        <div className="flex items-center gap-3 md:gap-4 border-t border-slate-100 pt-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-200 overflow-hidden shrink-0">
            <img src="https://i.pravatar.cc/150?u=linda" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-800 text-sm md:text-base truncate">Linda Saragih</p>
            <p className="text-xs md:text-sm text-slate-400 font-bold hover:text-blue-600 cursor-pointer transition-colors mt-0.5">Mulai chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}