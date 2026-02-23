export default function MentorCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-50 overflow-hidden">
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Kontak Mentor Kamu</h3>
        
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="relative">
            <img 
              src="https://i.pravatar.cc/150?u=linda" 
              alt="Mentor" 
              className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover"
            />
          </div>
          
          <div>
            <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Linda saragih</p>
            <p className="text-xs text-slate-500 font-medium">Mulai chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}