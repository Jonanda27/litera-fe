"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Loader2, 
  ClipboardList, 
  AlertCircle, 
  ChevronDown,
  User,
  Check,
  Filter,
  Send,
  X,
  BellRing
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/constans/constans';

export default function AdminMentorLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Custom Dropdown Filter
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State untuk Modal Notifikasi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifTarget, setNotifTarget] = useState<string>("all");
  const [notifMessage, setNotifMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMentors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/mentors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setMentors(result.data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  const fetchAllLogs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/exercise/mentor-logs`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      if (result.status === "success" || result.success) {
        setLogs(result.data);
      } else {
        setError(result.message || "Gagal mengambil data log.");
      }
    } catch (error) {
      setError("Koneksi ke server terputus.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifMessage.trim()) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/exercise/send-notification`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          mentorId: notifTarget === "all" ? null : notifTarget,
          action: "PERINGATAN_ADMIN",
          description: notifMessage
        })
      });

      const result = await res.json();
      if (result.status === "success") {
        setIsModalOpen(false);
        setNotifMessage("");
        fetchAllLogs();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Gagal mengirim notifikasi.");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => { 
    fetchMentors();
    fetchAllLogs(); 
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.mentor?.nama?.toLowerCase().includes(search.toLowerCase()) ||
      log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase());
    
    const matchesMentor = !selectedMentor || log.mentor?.id === selectedMentor.id;
    return matchesSearch && matchesMentor;
  });

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-0">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
                <ClipboardList size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Master Log Mentor</h1>
            </div>
            <p className="text-slate-500 font-medium">Laporan riwayat aktivitas dan pengiriman notifikasi mentor.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3.5 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-slate-900 transition-all duration-300"
          >
            <BellRing size={18} />
            Kirim Notifikasi
          </button>
        </div>

        <div className="flex flex-col sm:flex-row w-full gap-4">
          {/* CUSTOM DROPDOWN MENTOR FILTER */}
          <div className="relative w-full sm:w-64" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-red-600 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-red-600 transition-colors">
                  <User size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {selectedMentor ? selectedMentor.nama : "Semua Mentor"}
                </span>
              </div>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 5, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute z-[100] mt-2 w-full bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden p-2"
                >
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <button
                      onClick={() => { setSelectedMentor(null); setIsOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${!selectedMentor ? 'bg-red-50 text-red-600' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <span className="text-sm font-bold tracking-tight">Semua Mentor</span>
                      {!selectedMentor && <Check size={16} />}
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    {mentors.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedMentor(m); setIsOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${selectedMentor?.id === m.id ? 'bg-red-50 text-red-600' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                            {m.nama.charAt(0)}
                          </div>
                          <div>
                              <p className="text-sm font-bold leading-none mb-1">{m.nama}</p>
                              <p className="text-[10px] opacity-60 font-medium">{m.email}</p>
                          </div>
                        </div>
                        {selectedMentor?.id === m.id && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari aktivitas..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-red-600 transition-all text-sm font-medium shadow-sm text-slate-900"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabel Log */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentor</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas & Info</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode='wait'>
                  {isLoading ? (
                    <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={3} className="py-32 text-center">
                        <Loader2 className="animate-spin mx-auto text-red-600 mb-2" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat log...</p>
                      </td>
                    </motion.tr>
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                      <motion.tr 
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg group-hover:bg-red-600 transition-colors">
                              {log.mentor?.nama?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{log.mentor?.nama || 'Sistem'}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{log.mentor?.email || 'litera@system.com'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-2">
                            <div className="flex">
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm ${
                                log.action?.includes('PERINGATAN') ? 'bg-red-50 text-red-600' :
                                log.action?.includes('DELETE') ? 'bg-orange-50 text-orange-600' : 
                                log.action?.includes('CREATE') ? 'bg-emerald-50 text-emerald-600' : 
                                'bg-blue-50 text-blue-600'
                              }`}>
                                {log.action}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                              {log.description}
                              {log.targetUser && (
                                <span className="ml-2 font-black text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px]">@{log.targetUser.nama}</span>
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={14} />
                            <span className="text-[11px] font-black text-slate-500 tracking-tight">
                              {new Date(log.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-20 text-center">
                        <div className="max-w-xs mx-auto">
                          <Filter className="mx-auto text-slate-200 mb-4" size={48} />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak ada data ditemukan</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL KIRIM NOTIFIKASI */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl text-red-600">
                      <BellRing size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 uppercase">Kirim Notifikasi</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSendNotif} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Penerima</label>
                    <select 
                      className="w-full mt-2 px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-red-600 transition-all appearance-none cursor-pointer text-slate-900"
                      value={notifTarget}
                      onChange={(e) => setNotifTarget(e.target.value)}
                    >
                      <option value="all" className="text-slate-900">Semua Mentor (Broadcast)</option>
                      {mentors.map(m => (
                        <option key={m.id} value={m.id} className="text-slate-900">
                          {m.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Isi Pesan Peringatan</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Contoh: Tolong segera tinjau chapter yang tertunda..."
                      className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-red-600 transition-all resize-none placeholder:text-slate-300 text-slate-900"
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={isSending}
                    type="submit"
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <Send size={16} /> 
                        Kirim Sekarang
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </Sidebar>
  );
}