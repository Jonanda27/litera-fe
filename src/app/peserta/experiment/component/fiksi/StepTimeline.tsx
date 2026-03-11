"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Edit3, Trash2, Clock, MapPin, Save, Plus, X, 
  Info, ArrowDown, Users, BookOpen, Layers 
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface TimelineEvent {
  id: string;
  bookId: number;
  order: string;
  eventName: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  involvedCharacters: string[];
  location: string;
  relatedChapters: string;
  cause: string;
  effect: string;
  importance: "Krusial" | "Biasa" | "Detail";
}

export default function StepTimeline({ formData, onDataChange }: any) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<TimelineEvent | null>(null); // State untuk Modal Detail
  const [loading, setLoading] = useState(false);

  const bookId = formData?.id || formData?.bookId;

  // State Form
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    order: "",
    eventName: "",
    date: "",
    time: "",
    duration: "",
    description: "",
    involvedCharacters: [],
    location: "",
    relatedChapters: "",
    cause: "",
    effect: "",
    importance: "Biasa",
  });

  // 1. FETCH DATA DARI API
  const fetchTimeline = async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
     const res = await axios.get(`${API_BASE_URL}/books/timeline/${bookId}`, {
  headers: { Authorization: `Bearer ${token}` }
});

      const mappedData = res.data.data.map((item: any) => ({
        id: item.id.toString(),
        order: item.event_order?.toString() || "",
        eventName: item.event_name,
        date: item.date_time || "",
        time: item.time_clock || "",
        duration: item.duration || "",
        description: item.description || "",
        involvedCharacters: item.involved_characters_list || [],
        location: item.location || "",
        related_chapters: item.related_chapters || "",
        cause: item.consequence_of || "",
        effect: item.leading_to || "",
        importance: item.importance_level || "Biasa",
      }));

      const sorted = mappedData.sort((a: any, b: any) => parseInt(a.order) - parseInt(b.order));
      setEvents(sorted);

      // LOGIKA: Jika data kosong, otomatis buka form input
      if (sorted.length === 0) {
        setIsAdding(true);
        setNewEvent(prev => ({ ...prev, order: "1" }));
      }
    } catch (err) {
      console.error("Gagal memuat timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [bookId]);

  useEffect(() => {
    onDataChange({ ...formData, timelineBase: events });
  }, [events]);

  // 2. HANDLE SAVE (CREATE & UPDATE)
  const handleSave = async () => {
    if (!newEvent.eventName) return alert("Nama Peristiwa wajib diisi");
    if (!bookId) return alert("ID Buku tidak ditemukan");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        bookId: bookId,
        event_order: parseInt(newEvent.order || "0"),
        event_name: newEvent.eventName,
        date_time: newEvent.date,
        time_clock: newEvent.time,
        duration: newEvent.duration,
        description: newEvent.description,
        involved_characters_list: newEvent.involvedCharacters,
        location: newEvent.location,
        related_chapters: newEvent.relatedChapters,
        consequence_of: newEvent.cause,
        leading_to: newEvent.effect,
        importance_level: newEvent.importance
      };

      if (editingId) {
  await axios.patch(`${API_BASE_URL}/books/timeline/${editingId}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
} else {
  await axios.post(`${API_BASE_URL}/books/timeline`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

      setIsAdding(false);
      resetForm();
      fetchTimeline();
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    }
  };

  // 3. HANDLE DELETE
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus peristiwa ini dari garis waktu?")) return;
    try {
      const token = localStorage.getItem("token");
     await axios.delete(`${API_BASE_URL}/books/timeline/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
      fetchTimeline();
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  // 4. HANDLE EDIT CLICK
  const handleEdit = (e: React.MouseEvent, ev: TimelineEvent) => {
    e.stopPropagation();
    setEditingId(ev.id);
    setNewEvent(ev);
    setIsAdding(true);
    setViewingEvent(null); // Tutup detail jika sedang terbuka
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setNewEvent({
      order: (events.length + 1).toString(),
      eventName: "", date: "", time: "", duration: "",
      description: "", involvedCharacters: [], location: "",
      relatedChapters: "", cause: "", effect: "", importance: "Biasa"
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-700 to-cyan-800 p-5 rounded-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white">
            🕒
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Timeline Tracker</h3>
            <p className="text-[10px] font-bold text-cyan-100 uppercase opacity-80">Pantau urutan kronologi ceritamu</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 ${
            isAdding ? "bg-white text-rose-600 shadow-rose-200" : "bg-white text-slate-800 shadow-slate-900/20"
          }`}
        >
          {isAdding ? <span className="flex items-center gap-2"><X size={14}/> Batal</span> : <span className="flex items-center gap-2"><Plus size={14}/> Tambah Peristiwa</span>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 shadow-xl space-y-6">
              <h4 className="text-xs font-black text-cyan-600 uppercase tracking-widest px-1">
                {editingId ? "📝 Edit Titik Waktu" : "✨ Peristiwa Baru"}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputGroup label="Kejadian ke-">
                  <input type="number" value={newEvent.order} onChange={(e) => setNewEvent({...newEvent, order: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 outline-none text-sm font-bold text-slate-900 text-center" placeholder="1" />
                </InputGroup>
                <div className="md:col-span-3">
                  <InputGroup label="Nama Peristiwa">
                    <input type="text" value={newEvent.eventName} onChange={(e) => setNewEvent({...newEvent, eventName: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 outline-none text-sm font-bold text-slate-900" placeholder="Misal: Penemuan Peta Kuno di Loteng" />
                  </InputGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-cyan-50/30 p-5 rounded-3xl border border-cyan-100">
                <MiniInput label="Tanggal / Hari ke-" placeholder="DD/MM/YYYY atau Hari ke-1" value={newEvent.date} onChange={(v: any) => setNewEvent({...newEvent, date: v})} />
                <MiniInput label="Jam (Opsional)" placeholder="10:00" value={newEvent.time} onChange={(v: any) => setNewEvent({...newEvent, time: v})} />
                <MiniInput label="Durasi Kejadian" placeholder="30 Menit / 2 Jam" value={newEvent.duration} onChange={(v: any) => setNewEvent({...newEvent, duration: v})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Deskripsi Singkat Peristiwa">
                  <textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 outline-none text-xs font-bold text-slate-900 h-24 resize-none shadow-inner" placeholder="Apa yang terjadi secara ringkas?" />
                </InputGroup>
                <div className="space-y-4">
                  <InputGroup label="Karakter Terlibat (Pisah koma)">
                    <input type="text" value={newEvent.involvedCharacters?.join(",")} placeholder="Alya, Budi" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-cyan-500" onChange={(e) => setNewEvent({...newEvent, involvedCharacters: e.target.value.split(",")})} />
                  </InputGroup>
                  <MiniInput label="Lokasi Kejadian" placeholder="Misal: Perpustakaan Kota" value={newEvent.location} onChange={(v: any) => setNewEvent({...newEvent, location: v})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border-2 border-dashed border-slate-100 rounded-3xl">
                <div className="space-y-3">
                   <MiniInput label="Bab Terkait" placeholder="Bab 1, 2" value={newEvent.relatedChapters} onChange={(v: any) => setNewEvent({...newEvent, relatedChapters: v})} />
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-300 uppercase w-16 italic">Sebab:</span>
                      <input type="text" value={newEvent.cause} placeholder="Efek dari peristiwa sebelumnya..." className="flex-1 bg-transparent border-b border-slate-200 outline-none text-[11px] font-bold text-slate-900" onChange={(e) => setNewEvent({...newEvent, cause: e.target.value})} />
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-300 uppercase w-16 italic">Akibat:</span>
                      <input type="text" value={newEvent.effect} placeholder="Akan menyebabkan peristiwa..." className="flex-1 bg-transparent border-b border-slate-200 outline-none text-[11px] font-bold text-slate-900" onChange={(e) => setNewEvent({...newEvent, effect: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tingkat Penting</label>
                  <div className="grid grid-cols-1 gap-2">
                    {["Krusial", "Biasa", "Detail"].map((imp) => (
                      <button key={imp} onClick={() => setNewEvent({...newEvent, importance: imp as any})} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${newEvent.importance === imp ? "bg-slate-900 border-slate-900 text-cyan-400 shadow-md" : "bg-white border-slate-100 text-slate-400"}`}>
                        {imp === 'Krusial' ? '⭐' : imp === 'Biasa' ? '📌' : '🔍'} {imp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-slate-800 to-cyan-900 text-white rounded-2xl text-xs font-black uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={16}/> {editingId ? "Update Peristiwa" : "Simpan ke Timeline"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY TIMELINE LIST */}
      <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-1 before:bg-slate-100 before:rounded-full">
        {loading ? (
           <div className="py-16 text-center text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em] ml-[-20px]">Syncing Timeline...</div>
        ) : events.length === 0 && !isAdding ? (
          <div className="py-16 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 text-[11px] font-black uppercase italic ml-[-20px]">
            Timeline masih kosong. Rancang kronologi pertamamu.
          </div>
        ) : (
          events.map((ev, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              key={ev.id} 
              onClick={() => setViewingEvent(ev)} // Klik kartu untuk lihat detail
              className="relative bg-white p-5 rounded-3xl border-2 border-slate-100 group hover:border-cyan-400 transition-all shadow-sm cursor-pointer"
            >
              <div className={`absolute -left-[23px] top-6 w-4 h-4 rounded-full bg-white border-4 ${ev.importance === 'Krusial' ? 'border-rose-500 scale-125' : 'border-cyan-500'} z-10 group-hover:scale-150 transition-transform`} />
              
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${ev.importance === 'Krusial' ? 'bg-rose-100 text-rose-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      KEJADIAN {ev.order || idx + 1}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 uppercase truncate leading-none">{ev.eventName}</h4>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Clock size={10}/> {ev.date || "-"} • {ev.time || "-"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                       <MapPin size={10}/> {ev.location || "Tanpa Lokasi"}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end justify-between shrink-0">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Klik untuk Detail</span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => handleEdit(e, ev)} className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 shadow-md"><Edit3 size={14}/></button>
                    <button onClick={(e) => handleDelete(e, ev.id)} className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-md"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* MODAL DETAIL PERISTIWA */}
      <AnimatePresence>
        {viewingEvent && (
          <div className="fixed inset-0 bg-slate-900/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-cyan-100"
            >
              <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-cyan-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">Kejadian #{viewingEvent.order}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${viewingEvent.importance === 'Krusial' ? 'border-rose-500 text-rose-500' : 'border-cyan-400 text-cyan-400'}`}>
                      {viewingEvent.importance}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{viewingEvent.eventName}</h2>
                </div>
                <button onClick={() => setViewingEvent(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-rose-500 transition-all">
                  <X size={20}/>
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="relative space-y-6 before:content-[''] before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                  <div className="relative pl-10">
                    <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-slate-200 border-2 border-white" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dipicu Oleh (Sebab):</p>
                    <p className="text-sm font-bold text-slate-500 italic">
                      {viewingEvent.cause || "Tidak ada peristiwa pemicu spesifik."}
                    </p>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-1.5 top-1 w-5 h-5 rounded-full bg-cyan-500 border-4 border-white shadow-md" />
                    <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-1">Inti Peristiwa:</p>
                    <div className="bg-cyan-50/50 p-5 rounded-3xl border border-cyan-100">
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {viewingEvent.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-rose-400 border-2 border-white" />
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Dampaknya (Akibat):</p>
                    <p className="text-sm font-bold text-slate-500 italic">
                      {viewingEvent.effect || "Belum ada dampak yang tercatat."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-8">
                  <DetailBox icon={<Clock size={14}/>} label="Waktu" value={`${viewingEvent.date} @ ${viewingEvent.time}`}/>
                  <DetailBox icon={<Layers size={14}/>} label="Durasi" value={viewingEvent.duration || "-"}/>
                  <DetailBox icon={<MapPin size={14}/>} label="Lokasi" value={viewingEvent.location || "-"}/>
                  <DetailBox icon={<BookOpen size={14}/>} label="Bab" value={`Bab ${viewingEvent.relatedChapters}`}/>
                </div>

                {viewingEvent.involvedCharacters.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Users size={14}/> Karakter Terlibat
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingEvent.involvedCharacters.map((char, i) => (
                        <span key={i} className="bg-white border px-4 py-1.5 rounded-xl text-xs font-black text-slate-700 shadow-sm">
                          {char.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={(e) => handleEdit(e, viewingEvent)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Edit Peristiwa
                </button>
                <button 
                  onClick={() => setViewingEvent(null)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl font-black text-[10px] uppercase hover:bg-slate-100 transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function DetailBox({ icon, label, value }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
      </div>
      <p className="text-[10px] font-black text-slate-700 truncate">{value || "-"}</p>
    </div>
  );
}

function InputGroup({ label, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">{label}</label>
      {children}
    </div>
  );
}

function MiniInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase pl-1">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:border-cyan-400 outline-none transition-all shadow-sm" 
      />
    </div>
  );
}