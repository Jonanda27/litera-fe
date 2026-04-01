"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { API_BASE_URL } from '@/lib/constans/constans';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Send, X, Smartphone, 
  ChevronDown, ChevronUp, Layers, Clock, AlertTriangle, UserCheck, Loader2
} from 'lucide-react';

export default function MonitoringStrategis() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [notifMessage, setNotifMessage] = useState("");
  const [isSendingWA, setIsSendingWA] = useState(false);

  const fetchMyStudents = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/mentors/my-students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setStudents(result.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchMyStudents(); 
    // Opsional: Auto refresh setiap 5 detik untuk melihat perubahan status inaktif secara realtime
    const interval = setInterval(fetchMyStudents, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSendReminder = async () => {
    if (!notifMessage.trim()) return alert("Pesan tidak boleh kosong!");
    if (!selectedStudent) return;

    setIsSendingWA(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/mentors/send-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          message: notifMessage,
          type: 'whatsapp'
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert("Pesan WhatsApp berhasil dikirim!");
        setIsModalOpen(false);
        setNotifMessage("");
      } else {
        alert("Gagal mengirim WA: " + (result.message || result.error));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSendingWA(false);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Daftar & Monitoring Peserta</h1>
            <p className="text-slate-500 font-medium mt-1">
              Memantau aktivitas belajar peserta (Mode Testing: <span className="text-[#C31A26] font-bold underline decoration-2 underline-offset-4">Alert 3 Hari</span>).
            </p>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-[#C31A26]"/>
                <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">Total Peserta: {students.length}</p>
              </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading && students.length === 0 ? (
              <div className="p-20 text-center animate-pulse text-slate-300 font-black italic uppercase">Syncing Student Data...</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil Peserta</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level Aktif</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Terakhir</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map((student) => (
                    <React.Fragment key={student.id}>
                      <tr className="group hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase shadow-lg group-hover:scale-105 transition-transform">
                              {student.nama.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-none mb-1">{student.nama}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            {student.currentLevelDisplay}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                               <Clock size={12} className={student.secondsInactive >= 10 ? 'text-rose-500' : 'text-slate-400'}/>
                               <span className={`text-[11px] font-black uppercase ${student.secondsInactive >= 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                                 {student.inactivityLabel}
                               </span>
                            </div>
                            {/* Peringatan muncul jika inaktif >= 10 detik */}
                            {student.secondsInactive >= 10 && (
                               <div className="flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-tighter animate-pulse">
                                 <AlertTriangle size={10}/> Perlu Atensi (Inaktif &gt; 10 Detik)
                               </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}
                              className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            >
                              <Smartphone size={18} />
                            </button>
                            <button 
                              onClick={() => toggleExpand(student.id)}
                              className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-[#C31A26] transition-all"
                            >
                              {expandedId === student.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} Detail Progres
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      <AnimatePresence>
                        {expandedId === student.id && (
                          <tr>
                            <td colSpan={4} className="bg-slate-50/50 p-0 border-b border-slate-100">
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {student.detailedProgress?.map((lvl: any) => (
                                    <div key={lvl.levelId} className={`bg-white p-5 rounded-3xl border shadow-sm space-y-4 ${lvl.levelName === student.currentLevelDisplay ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-100'}`}>
                                      <div className="flex items-center justify-between border-b pb-2">
                                        <div className="flex items-center gap-2 text-slate-800 font-black text-[10px] uppercase">
                                          <Layers size={14} className="text-[#C31A26]"/> {lvl.levelName}
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        {lvl.modules.map((mod: any) => (
                                          <div key={mod.moduleId} className="space-y-1">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                                              <span className="truncate max-w-[120px]">{mod.moduleName}</span>
                                              <span className={mod.progress === 100 ? "text-green-600" : "text-amber-600"}>{mod.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                              <motion.div initial={{ width: 0 }} animate={{ width: `${mod.progress}%` }} className={`h-full transition-all duration-700 ${mod.progress === 100 ? 'bg-green-500' : 'bg-amber-400'}`} />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal WhatsApp Reminder */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm text-black">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border-t-8 border-[#C31A26]">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
                
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-rose-50 rounded-2xl text-[#C31A26]"><Bell size={24}/></div>
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter">Dorong Progres</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase">Peserta: {selectedStudent?.nama}</p>
                   </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6">
                   <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase">
                      ⚠️ Status: Belum beraktivitas selama <span className="font-black underline">{selectedStudent?.inactivityLabel}</span>.
                   </p>
                </div>

                <textarea 
                  className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#C31A26] font-medium text-sm mb-6 resize-none transition-all"
                  placeholder="Ketik pesan motivasi..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                />
                
                <button 
                  onClick={handleSendReminder}
                  disabled={isSendingWA}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isSendingWA ? "bg-slate-300 text-white cursor-not-allowed" : "bg-[#C31A26] text-white hover:brightness-110 active:scale-95"
                  }`}
                >
                  {isSendingWA ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isSendingWA ? "Sedang Mengirim..." : "Kirim Langsung ke WhatsApp"}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer Insight Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><Clock size={120}/></div>
              <h4 className="text-lg font-bold mb-2 flex items-center gap-2">💡 Mode Testing Aktif</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Sistem saat ini dikonfigurasi untuk memberikan alert merah jika peserta inaktif lebih dari <span className="text-rose-400 font-bold uppercase">3 Hari </span>.
              </p>
           </div>
           <div className="bg-[#C31A26]/5 border border-[#C31A26]/10 rounded-[2rem] p-8">
              <h4 className="text-lg font-bold text-[#C31A26] mb-2">🎯 Misi Mentor</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                "Pantau setiap 3 hari perkembangan mereka demi literasi yang lebih baik."
              </p>
           </div>
        </div>
      </div>
    </Sidebar>
  );
}