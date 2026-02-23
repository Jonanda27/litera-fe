import { Search, MessageSquare, Users, Settings, LogOut } from 'lucide-react';

const contacts = [
  { id: 1, name: "QRRelevant", msg: "status: Active", active: true },
  { id: 2, name: "Yanti Asmara", msg: "Hey, how are you done...", active: false },
  { id: 3, name: "Gatot Sunyoto", msg: "I think it's good...", active: false },
  { id: 4, name: "Rita Rosita", msg: "Have a wonderful day", active: false },
  { id: 5, name: "Samsul Arifin", msg: "Wait, let me check...", active: false },
];

export default function ChatList() {
  return (
    <div className="md:col-span-3 flex border-r border-slate-100 h-full">
      {/* Mini Icon Sidebar (Paling Kiri) */}
      <div className="w-16 bg-slate-900 flex flex-col items-center py-6 gap-6 text-slate-400">
        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold">L</div>
        <MessageSquare size={22} className="text-white" />
        <Users size={22} />
        <Settings size={22} />
        <div className="mt-auto">
          <LogOut size={22} />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-slate-100 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${contact.active ? 'bg-red-50 border-r-2 border-red-500' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${contact.id}`} alt={contact.name} />
              </div>
              <div className="overflow-hidden">
                <p className={`text-sm font-bold truncate ${contact.active ? 'text-red-600' : 'text-slate-800'}`}>
                  {contact.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{contact.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}