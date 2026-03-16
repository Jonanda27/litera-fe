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
  const [viewingEvent, setViewingEvent] = useState<TimelineEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const bookId = formData?.id || formData?.bookId;

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
        relatedChapters: item.related_chapters || "",
        cause: item.consequence_of || "",
        effect: item.leading_to || "",
        importance: item.importance_level || "Biasa",
      }));

      const sorted = mappedData.sort((a: any, b: any) => parseInt(a.order) - parseInt(b.order));
      setEvents(sorted);

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

  const handleEdit = (e: React.MouseEvent, ev: TimelineEvent) => {
    e.stopPropagation();
    setEditingId(ev.id);
    setNewEvent(ev);
    setIsAdding(true);
    setViewingEvent(null);
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
    <div className="space-y-6 px-1">
      {/* HEADER SECTION - Responsive Padding & Direction */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-slate-700 to-cyan-800 p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-md gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white shrink-0">
            🕒
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">Timeline Tracker</h3>
            <p className="text-[9px] sm:text-[10px] font-bold text-cyan-100 uppercase opacity-80 leading-tight">Pantau urutan kronologi ceritamu</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
            isAdding ? "bg-white text-rose-600 shadow-rose-200" : "bg-white text-slate-800 shadow-slate-900/20"
          }`}
        >
          {isAdding ? <><X size={14}/> Batal</> : <><Plus size={14}/> Tambah Peristiwa</>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white border-2 border-slate-100 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl space-y-6">
              <h4 className="text-[10px] sm:text-xs font-black text-cyan-600 uppercase tracking-widest px-1">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-cyan-50/30 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-cyan-100">
                <MiniInput label="Tanggal / Hari ke-" placeholder="Hari ke-1" value={newEvent.date} onChange={(v: any) => setNewEvent({...newEvent, date: v})} />
                <MiniInput label="Jam (Opsional)" placeholder="10:00" value={newEvent.time} onChange={(v: any) => setNewEvent({...newEvent, time: v})} />
                <MiniInput label="Durasi Kejadian" placeholder="2 Jam" value={newEvent.duration} onChange={(v: any) => setNewEvent({...newEvent, duration: v})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Deskripsi Singkat Peristiwa">
                  <textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-cyan-500 outline-none text-xs font-bold text-slate-900 h-24 sm:h-32 resize-none shadow-inner" placeholder="Apa yang terjadi secara ringkas?" />
                </InputGroup>
                <div className="space-y-4">
                  <InputGroup label="Karakter Terlibat (Pisah koma)">
                    <input type="text" value={newEvent.involvedCharacters?.join(",")} placeholder="Alya, Budi" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-cyan-500" onChange={(e) => setNewEvent({...newEvent, involvedCharacters: e.target.value.split(",")})} />
                  </InputGroup>
                  <MiniInput label="Lokasi Kejadian" placeholder="Misal: Perpustakaan Kota" value={newEvent.location} onChange={(v: any) => setNewEvent({...newEvent, location: v})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-5 border-2 border-dashed border-slate-100 rounded-2xl sm:rounded-3xl">
                <div className="space-y-3">
                   <MiniInput label="Bab Terkait" placeholder="Bab 1, 2" value={newEvent.relatedChapters} onChange={(v: any) => setNewEvent({...newEvent, relatedChapters: v})} />
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-300 uppercase w-14 italic shrink-0">Sebab:</span>
                      <input type="text" value={newEvent.cause} placeholder="Efek peristiwa sebelumnya..." className="flex-1 bg-transparent border-b border-slate-200 outline-none text-[10px] font-bold text-slate-900 pb-1" onChange={(e) => setNewEvent({...newEvent, cause: e.target.value})} />
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-300 uppercase w-14 italic shrink-0">Akibat:</span>
                      <input type="text" value={newEvent.effect} placeholder="Akan menyebabkan..." className="flex-1 bg-transparent border-b border-slate-200 outline-none text-[10px] font-bold text-slate-900 pb-1" onChange={(e) => setNewEvent({...newEvent, effect: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tingkat Penting</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-1 gap-2">
                    {(["Krusial", "Biasa", "Detail"] as const).map((imp) => (
                      <button key={imp} onClick={() => setNewEvent({...newEvent, importance: imp})} className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${newEvent.importance === imp ? "bg-slate-900 border-slate-900 text-cyan-400 shadow-md" : "bg-white border-slate-100 text-slate-400"}`}>
                        <span>{imp === 'Krusial' ? '⭐' : imp === 'Biasa' ? '📌' : '🔍'}</span> {imp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-slate-800 to-cyan-900 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={16}/> {editingId ? "Update Peristiwa" : "Simpan ke Timeline"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY TIMELINE LIST - Responsive visual system */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] sm:left-[15px] before:top-0 before:bottom-0 before:w-1 before:bg-slate-100 before:rounded-full">
        {loading ? (
           <div className="py-16 text-center text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] ml-[-20px] text-xs">Syncing Timeline...</div>
        ) : events.length === 0 && !isAdding ? (
          <div className="py-16 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 text-[10px] sm:text-[11px] font-black uppercase italic ml-[-20px] px-4">
            Timeline masih kosong. Rancang kronologi pertamamu.
          </div>
        ) : (
          events.map((ev, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              key={ev.id} 
              onClick={() => setViewingEvent(ev)}
              className="relative bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-slate-100 group hover:border-cyan-400 transition-all shadow-sm cursor-pointer text-left"
            >
              <div className={`absolute -left-[20px] sm:-left-[23px] top-6 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border-4 ${ev.importance === 'Krusial' ? 'border-rose-500 scale-110 sm:scale-125' : 'border-cyan-500'} z-10 group-hover:scale-150 transition-transform`} />
              
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${ev.importance === 'Krusial' ? 'bg-rose-100 text-rose-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      #{ev.order || idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase truncate leading-none">{ev.eventName}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Clock size={10} className="shrink-0"/> {ev.date || "-"}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1 truncate">
                       <MapPin size={10} className="shrink-0"/> {ev.location || "Tanpa Lokasi"}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between shrink-0 gap-2">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic hidden sm:block">Detail →</span>
                  
                  <div className="flex gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => handleEdit(e, ev)} className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 shadow-md active:scale-90"><Edit3 size={12}/></button>
                    <button onClick={(e) => handleDelete(e, ev.id)} className="w-7 h-7 sm:w-8 sm:h-8 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-md active:scale-90"><Trash2 size={12}/></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* MODAL DETAIL PERISTIWA - Fully Responsive Layout */}
      <AnimatePresence>
        {viewingEvent && (
          <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-cyan-100 flex flex-col max-h-[92vh]"
            >
              <div className="bg-slate-900 p-6 sm:p-8 text-white flex justify-between items-start shrink-0">
                <div className="text-left">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span className="bg-cyan-500 text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full uppercase">Kejadian #{viewingEvent.order}</span>
                    <span className={`text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full uppercase border ${viewingEvent.importance === 'Krusial' ? 'border-rose-500 text-rose-500' : 'border-cyan-400 text-cyan-400'}`}>
                      {viewingEvent.importance}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight leading-tight">{viewingEvent.eventName}</h2>
                </div>
                <button onClick={() => setViewingEvent(null)} className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-rose-500 transition-all shrink-0">
                  <X size={18}/>
                </button>
              </div>

              <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar flex-1 text-left">
                {/* Visual Connector Logic Diagram */}
                
                
                <div className="relative space-y-6 before:content-[''] before:absolute before:left-3 sm:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                  <div className="relative pl-8 sm:pl-10">
                    <div className="absolute left-[7px] sm:left-[10px] top-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white" />
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dipicu Oleh (Sebab):</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 italic">
                      {viewingEvent.cause || "Tidak ada peristiwa pemicu spesifik."}
                    </p>
                  </div>

                  <div className="relative pl-8 sm:pl-10">
                    <div className="absolute left-[3px] sm:left-[6px] top-1 w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-cyan-500 border-4 border-white shadow-md" />
                    <p className="text-[8px] sm:text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-1">Inti Peristiwa:</p>
                    <div className="bg-cyan-50/50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-cyan-100">
                      <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed italic">
                        "{viewingEvent.description}"
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-8 sm:pl-10">
                    <div className="absolute left-[7px] sm:left-[10px] top-1 w-2.5 h-2.5 rounded-full bg-rose-400 border-2 border-white" />
                    <p className="text-[8px] sm:text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Dampaknya (Akibat):</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 italic">
                      {viewingEvent.effect || "Belum ada dampak yang tercatat."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-6 sm:pt-8">
                  <DetailBox icon={<Clock size={12}/>} label="Waktu" value={`${viewingEvent.date}`}/>
                  <DetailBox icon={<Layers size={12}/>} label="Durasi" value={viewingEvent.duration || "-"}/>
                  <DetailBox icon={<MapPin size={12}/>} label="Lokasi" value={viewingEvent.location || "-"}/>
                  <DetailBox icon={<BookOpen size={12}/>} label="Bab" value={viewingEvent.relatedChapters || "-"}/>
                </div>

                {viewingEvent.involvedCharacters.length > 0 && (
                  <div className="bg-slate-50 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100">
                    <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Users size={14}/> Karakter Terlibat
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingEvent.involvedCharacters.map((char, i) => (
                        <span key={i} className="bg-white border px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black text-slate-700 shadow-sm">
                          {char.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 border-t bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 shrink-0">
                <button 
                  onClick={(e) => handleEdit(e, viewingEvent)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Edit Peristiwa
                </button>
                <button 
                  onClick={() => setViewingEvent(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl font-black text-[9px] sm:text-[10px] uppercase hover:bg-slate-100 transition-all"
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
    <div className="space-y-1 min-w-0">
      <div className="flex items-center gap-1.5 text-slate-400">
        <span className="shrink-0">{icon}</span>
        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter truncate">{label}</span>
      </div>
      <p className="text-[9px] sm:text-[10px] font-black text-slate-700 truncate">{value || "-"}</p>
    </div>
  );
}

function InputGroup({ label, children }: any) {
  return (
    <div className="space-y-1.5 text-left w-full">
      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">{label}</label>
      {children}
    </div>
  );
}

function MiniInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase pl-1">{label}</label>
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