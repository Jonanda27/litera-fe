import { X, Image as ImageIcon, FileText, Music, Link2, Mic } from 'lucide-react';

const members = [
  { name: "Titik Puspa", role: "Admin", color: "bg-red-100" },
  { name: "Heri Rosulul", role: "Member", color: "bg-blue-100" },
  { name: "Rita Rosita", role: "Member", color: "bg-green-100" },
  { name: "Samsul Arifin", role: "Member", color: "bg-yellow-100" },
  { name: "Yanti Asmara", role: "Member", color: "bg-purple-100" },
];

export default function RightSidebar() {
  return (
    <div className="md:col-span-3 flex flex-col h-full bg-white">
      {/* Group Info Section */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Group Info</h3>
          <X size={18} className="text-slate-400 cursor-pointer" />
        </div>
        
        {/* Gallery Preview */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&q=60" className="rounded-lg h-20 w-full object-cover" alt="img" />
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=60" className="rounded-lg h-20 w-full object-cover" alt="img" />
        </div>

        {/* Stats */}
        <div className="space-y-2 text-xs text-slate-500 font-medium">
          <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
            <span className="flex items-center gap-2"><ImageIcon size={14} /> 12 photos</span>
            <span>{'>'}</span>
          </div>
          <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
            <span className="flex items-center gap-2"><FileText size={14} /> 215 files</span>
            <span>{'>'}</span>
          </div>
          <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
            <span className="flex items-center gap-2"><Mic size={14} /> 4330 voice messages</span>
            <span>{'>'}</span>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="flex-1 overflow-y-auto p-4 bg-red-50/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-sm">23 members</h3>
          <X size={16} className="text-slate-400" />
        </div>
        
        <div className="space-y-3">
          {members.map((member, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${member.color} border border-white shadow-sm flex-shrink-0 overflow-hidden`}>
                  <img src={`https://i.pravatar.cc/150?u=${member.name}`} alt={member.name} />
                </div>
                <span className="text-xs font-semibold text-slate-700">{member.name}</span>
              </div>
              {member.role === 'Admin' && (
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Admin</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}