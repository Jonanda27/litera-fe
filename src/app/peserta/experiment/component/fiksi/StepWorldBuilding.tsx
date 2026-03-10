"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Edit3, Trash2, MapPin, X, Plus, Save, Info, History, Users } from "lucide-react";

interface LocationItem {
  id: string;
  bookId: number;
  name: string;
  type: string;
  physicalDesc: string;
  atmosphere: string;
  weather: string;
  history: string;
  residents: string;
  language: string;
  rules: string;
  scenes: string[];
  relatedCharacters: string[];
  connection: {
    from: string;
    to: string;
    relation: string;
  };
  imageUrl: string;
}

export default function StepWorldBuilding({ formData, onDataChange }: any) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<LocationItem | null>(null); // State untuk Detail Modal
  const [loading, setLoading] = useState(false);

  const bookId = formData?.id || formData?.bookId;

  // State Form Lokasi Baru
  const [newLoc, setNewLoc] = useState<Partial<LocationItem>>({
    name: "",
    type: "Kota/Negara",
    physicalDesc: "",
    atmosphere: "",
    weather: "",
    history: "",
    residents: "",
    language: "",
    rules: "",
    scenes: [""],
    relatedCharacters: [""],
    connection: { from: "", to: "", relation: "" },
    imageUrl: "",
  });

  // 1. FETCH DATA DARI API
  const fetchLocations = async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:4000/api/books/settings/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mappedData = res.data.map((item: any) => ({
        ...item,
        id: item.id.toString(),
      }));
      
      setLocations(mappedData);

      // LOGIKA: Jika data kosong, otomatis buka form input
      if (mappedData.length === 0) {
        setIsAdding(true);
      }
    } catch (err) {
      console.error("Gagal memuat lokasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [bookId]);

  useEffect(() => {
    onDataChange({ ...formData, worldBuildingBase: locations });
  }, [locations]);

  // 2. HANDLE SAVE (CREATE & UPDATE)
  const handleSave = async () => {
    if (!newLoc.name) return alert("Nama Lokasi wajib diisi");
    if (!bookId) return alert("ID Buku tidak ditemukan");

    try {
      const token = localStorage.getItem("token");
      const payload = { ...newLoc, bookId };

      if (editingId) {
        // UPDATE 
        await axios.patch(`http://localhost:4000/api/books/settings/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // CREATE 
        await axios.post(`http://localhost:4000/api/books/settings`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setIsAdding(false);
      resetForm();
      fetchLocations();
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    }
  };

  // 3. HANDLE DELETE
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Mencegah modal detail terbuka
    if (!confirm("Hapus lokasi ini secara permanen?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/books/settings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLocations();
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  // 4. HANDLE EDIT CLICK
  const handleEdit = (e: React.MouseEvent, loc: LocationItem) => {
    e.stopPropagation();
    setEditingId(loc.id);
    setNewLoc(loc);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewLoc({
      name: "", type: "Kota/Negara", physicalDesc: "", atmosphere: "",
      weather: "", history: "", residents: "", language: "", rules: "",
      scenes: [""], relatedCharacters: [""], connection: { from: "", to: "", relation: "" },
      imageUrl: "",
    });
    setEditingId(null);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLoc({ ...newLoc, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const typeOptions = ["Kota/Negara", "Bangunan/Rumah", "Alam", "Dunia Fantasi", "Ruang Spesifik"];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-gradient-to-r from-teal-500 to-emerald-600 p-5 rounded-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white">
            🌍
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">World Builder</h3>
            <p className="text-[10px] font-bold text-teal-100 uppercase opacity-80">Rancang setiap jengkal duniamu</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 ${
            isAdding ? "bg-white text-rose-600 shadow-rose-200" : "bg-white text-teal-700 shadow-teal-900/20"
          }`}
        >
          {isAdding ? "✕ Batal" : "+ Lokasi Baru"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white border-2 border-teal-100 rounded-[2.5rem] p-6 shadow-xl space-y-8">
              <h4 className="text-xs font-black text-teal-600 uppercase tracking-widest px-1">
                {editingId ? "📝 Edit Lokasi" : "✨ Lokasi Baru"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PREVIEW GAMBAR */}
                <div className="flex flex-col items-center space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referensi Visual</label>
                  <div className="relative w-full aspect-video md:aspect-square group">
                    <div className="w-full h-full rounded-[2rem] bg-slate-100 border-4 border-dashed border-teal-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-teal-400">
                      {newLoc.imageUrl ? (
                        <img src={newLoc.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <span className="text-3xl block mb-1">🖼️</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase text-center leading-tight">Upload Gambar / Denah</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                </div>

                {/* INFO DASAR */}
                <div className="md:col-span-2 space-y-4">
                  <InputGroup label="Nama Lokasi">
                    <input type="text" value={newLoc.name} onChange={(e) => setNewLoc({...newLoc, name: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 outline-none text-sm font-bold text-slate-900" placeholder="Misal: Hutan Awan Merah" />
                  </InputGroup>
                  <InputGroup label="Jenis Lokasi">
                    <div className="flex flex-wrap gap-2">
                      {typeOptions.map((t) => (
                        <button key={t} onClick={() => setNewLoc({...newLoc, type: t})} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase border-2 transition-all ${newLoc.type === t ? "bg-teal-600 border-teal-600 text-white shadow-md" : "bg-white border-slate-100 text-slate-400 hover:border-teal-200"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </InputGroup>
                </div>
              </div>

              {/* DESKRIPSI & ATMOSFER */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <div className="md:col-span-2 space-y-4">
                  <InputGroup label="Gambaran Fisik">
                    <textarea value={newLoc.physicalDesc} onChange={(e) => setNewLoc({...newLoc, physicalDesc: e.target.value})} className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-teal-500 outline-none text-xs font-bold text-slate-900 h-28 resize-none shadow-inner" placeholder="Ceritakan detail bangunan, vegetasi, atau arsitektur..." />
                  </InputGroup>
                </div>
                <div className="space-y-4">
                  <MiniInput label="Suasana / Atmosfer" placeholder="Angker, Nyaman, dll" value={newLoc.atmosphere} onChange={(v: any) => setNewLoc({...newLoc, atmosphere: v})} />
                  <MiniInput label="Musim / Cuaca Umum" placeholder="Selalu Hujan, Tropis" value={newLoc.weather} onChange={(v: any) => setNewLoc({...newLoc, weather: v})} />
                </div>
              </div>

              {/* SEJARAH & BUDAYA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Sejarah Singkat">
                  <textarea value={newLoc.history} onChange={(e) => setNewLoc({...newLoc, history: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 outline-none text-xs font-bold text-slate-900 h-24 resize-none" placeholder="Asal usul lokasi ini..." />
                </InputGroup>
                <div className="grid grid-cols-2 gap-4">
                  <MiniInput label="Penghuni / Penduduk" value={newLoc.residents} onChange={(v: any) => setNewLoc({...newLoc, residents: v})} />
                  <MiniInput label="Bahasa / Dialek" value={newLoc.language} onChange={(v: any) => setNewLoc({...newLoc, language: v})} />
                  <div className="col-span-2">
                    <MiniInput label="Kebiasaan / Aturan Unik" value={newLoc.rules} onChange={(v: any) => setNewLoc({...newLoc, rules: v})} />
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-teal-100 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={16}/> {editingId ? "Update Perubahan" : "Simpan Lokasi & Dunia"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY LOCATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em]">Syncing World Data...</div>
        ) : locations.length === 0 && !isAdding ? (
          <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 text-[11px] font-black uppercase italic">
            Belum ada lokasi yang dibuat.
          </div>
        ) : (
          locations.map((loc) => (
            <motion.div 
              layout
              key={loc.id} 
              onClick={() => setSelectedLoc(loc)}
              className="bg-white rounded-[2rem] border-2 border-slate-100 p-4 group relative hover:border-teal-400 transition-all flex gap-4 cursor-pointer shadow-sm hover:shadow-xl"
            >
              <div className="w-24 h-24 bg-teal-50 rounded-2xl flex-shrink-0 overflow-hidden border border-teal-100 shadow-inner">
                {loc.imageUrl ? <img src={loc.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📍</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900 uppercase truncate mb-1">{loc.name}</h4>
                <p className="text-[9px] font-black text-teal-600 uppercase mb-2 bg-teal-50 inline-block px-2 py-0.5 rounded-full">{loc.type}</p>
                <p className="text-[10px] font-bold text-slate-400 line-clamp-2 italic leading-relaxed">"{loc.physicalDesc || 'Tanpa deskripsi fisik...'}"</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={(e) => handleEdit(e, loc)} className="w-8 h-8 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600"><Edit3 size={14}/></button>
                <button onClick={(e) => handleDelete(e, loc.id)} className="w-8 h-8 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-600"><Trash2 size={14}/></button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedLoc && (
          <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative">
              <button onClick={() => setSelectedLoc(null)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all z-10"><X size={20}/></button>
              
              <div className="grid md:grid-cols-5 h-full">
                <div className="md:col-span-2 bg-teal-600 p-8 flex flex-col items-center text-center text-white">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white/20 border-4 border-white/30 overflow-hidden mb-4 shadow-xl">
                    {selectedLoc.imageUrl ? <img src={selectedLoc.imageUrl} className="w-full h-full object-cover" /> : <MapPin size={60} className="m-auto h-full opacity-50"/>}
                  </div>
                  <h3 className="text-xl font-black uppercase leading-tight">{selectedLoc.name}</h3>
                  <span className="mt-4 px-4 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedLoc.type}</span>
                  
                  <div className="mt-8 w-full space-y-4">
                    <DetailItem icon={<Info size={12}/>} label="Atmosfer" value={selectedLoc.atmosphere}/>
                    <DetailItem icon={<Users size={12}/>} label="Penghuni" value={selectedLoc.residents}/>
                  </div>
                </div>

                <div className="md:col-span-3 p-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">Deskripsi Fisik</h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic">{selectedLoc.physicalDesc || "Belum ada deskripsi fisik..."}</p>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3 border-b pb-1 flex items-center gap-2"><History size={12}/> Sejarah & Budaya</h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedLoc.history || "Belum ada riwayat sejarah..."}</p>
                      <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Kebiasaan Unik</p>
                        <p className="text-xs font-bold text-slate-700">{selectedLoc.rules || "Tidak ada aturan khusus."}</p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2 text-left w-full bg-black/10 p-2 rounded-xl">
      <div className="text-teal-200">{icon}</div>
      <div className="min-w-0">
        <p className="text-[7px] uppercase font-black text-teal-300 leading-none">{label}</p>
        <p className="text-[10px] font-bold truncate text-white">{value || "-"}</p>
      </div>
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
        className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:border-teal-400 outline-none transition-all" 
      />
    </div>
  );
}