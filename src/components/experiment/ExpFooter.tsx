"use client";

export function ExpFooter() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
      {/* Tools Pendukung */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 text-lg">Tools Pendukung</h3>
        <div className="flex flex-wrap gap-8 items-center justify-start">
          {[
            { icon: '📚', color: 'bg-[#C31A26]' },
            { icon: '🏠', color: 'bg-[#A4C639]' },
            { icon: '✍️', color: 'bg-[#1E4E8C]' },
            { icon: '📖', color: 'bg-[#2E7D32]' },
            { icon: '💼', color: 'bg-[#9C27B0]' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center group cursor-pointer">
              <span className="text-5xl mb-2 transition-transform group-hover:scale-110">{item.icon}</span>
              <div className={`h-4 w-14 rounded-full shadow-inner ${item.color}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Kontak Mentor */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 text-lg">Kontak Mentor Kamu</h3>
        <div className="flex items-center gap-4 border-t pt-6">
          <div className="w-16 h-16 rounded-full border-[3px] border-slate-100 overflow-hidden shadow-sm">
            <img 
              src="https://i.pravatar.cc/150?u=linda" 
              alt="Mentor" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <p className="font-black text-slate-900 text-lg leading-none">Linda saragih</p>
            <p className="text-sm text-slate-400 font-bold mt-2 hover:text-blue-600 cursor-pointer transition-colors">
              Mulai chat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}