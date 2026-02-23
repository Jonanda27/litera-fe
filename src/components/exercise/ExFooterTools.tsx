"use client";

export function ExFooterTools() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Tools Pendukung */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 text-lg">Tools Pendukung</h3>
        <div className="flex flex-wrap gap-8 items-center justify-start">
          {['📚', '🏠', '✍️', '📖', '💼'].map((icon, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl mb-2">{icon}</span>
              <div className={`h-3 w-12 rounded-full ${['bg-red-500', 'bg-lime-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'][i]}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Kontak Mentor */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 text-lg">Kontak Mentor Kamu</h3>
        <div className="flex items-center gap-4 border-t pt-4">
          <div className="w-14 h-14 rounded-full border-2 border-slate-200 overflow-hidden shrink-0">
            <img src="https://i.pravatar.cc/150?u=linda" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-black text-slate-800">Linda saragih</p>
            <p className="text-sm text-slate-400 font-bold hover:text-blue-600 cursor-pointer transition-colors">Mulai chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}