import { Search, Phone, Video, MoreVertical, Send } from 'lucide-react';

export default function ChatWindow() {
  return (
    <div className="md:col-span-6 flex flex-col border-r border-slate-100">
      {/* Header Chat */}
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <h3 className="font-bold text-slate-800">Keuangan Rumah Tangga</h3>
        <div className="flex gap-4 text-slate-400">
          <Search size={20} />
          <Phone size={20} />
          <Video size={20} className="text-red-500" />
          <MoreVertical size={20} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {/* Pesan Kiri */}
        <div className="flex gap-3 max-w-[80%]">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
          <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-red-500 mb-1">Rita Rosita</p>
            <p className="text-sm text-slate-700">Changes have been made on the badges. You can now present the project proudly on Monday. ✌️</p>
          </div>
        </div>

        {/* Pesan Kanan (User) */}
        <div className="flex flex-row-reverse gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500 flex-shrink-0" />
          <div className="bg-red-500 text-white p-4 rounded-2xl rounded-tr-none shadow-md max-w-[70%]">
            <p className="text-sm">Guys, a big congratulation to you all for the promotion! I would be happy to work with you on new projects. 🥳</p>
          </div>
        </div>

        {/* Video Call Mockup Overlay (Seperti gambar kanan) */}
        <div className="relative rounded-xl overflow-hidden aspect-video bg-black mt-4">
           <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60" alt="Video Call" className="w-full h-full object-cover opacity-80" />
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 p-2 rounded-full backdrop-blur-md">
              <div className="p-2 bg-red-500 rounded-full text-white"><Video size={16} /></div>
              <div className="p-2 bg-white/20 rounded-full text-white"><Phone size={16} className="rotate-[135deg]" /></div>
           </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
          <input type="text" placeholder="Your Message..." className="bg-transparent flex-1 text-sm outline-none" />
          <Send size={18} className="text-red-500" />
        </div>
      </div>
    </div>
  );
}