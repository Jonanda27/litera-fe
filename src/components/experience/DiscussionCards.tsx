export default function DiscussionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      {/* Lanjutkan Diskusi */}
      <div className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between mb-4">
          <h4 className="font-bold text-blue-900 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Lanjutkan Diskusi
          </h4>
        </div>
        <div className="space-y-4">
          {[
            { 
              title: "Goal Setting Challenge", 
              progress: 24, 
              image: "https://i.pravatar.cc/150?u=goal" 
            },
            { 
              title: "Belajar Mengatur Keuangan Keluarga", 
              progress: 20, 
              image: "https://i.pravatar.cc/150?u=finance" 
            }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
               {/* Gambar profil dari online */}
               <img 
                 src={item.image} 
                 alt={item.title} 
                 className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200"
               />
               <div className="flex-1">
                 <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                 <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1">
                   <div 
                     className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                     style={{ width: `${item.progress}%` }} 
                   />
                 </div>
               </div>
               <span className="text-xs font-bold text-slate-400">{item.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Diskusi Terbaru Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Diskusi Terbaru</h4>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden border border-blue-50">
            <img src="https://i.pravatar.cc/150?u=dewi" alt="Dewi" className="object-cover" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Dewi Malam</p>
            <p className="text-[11px] text-slate-500 leading-tight">Menghadapi Anak-anak Gen-Z yang Susah Diatur</p>
          </div>
        </div>
      </div>

      {/* Tombol Buat Topik */}
      <button className="mt-12 mb-12 ml-8 mr-8  bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-blue-200 transition-transform active:scale-95 px-6 py-4 md:py-0">
        Buat Topik Baru
      </button>
    </div>
  );
}