"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Edit3, Trash2, User, X, Plus, Save, Briefcase, MapPin, Info } from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface Relationship {
  name: string;
  type: string;
}

interface Character {
  id: string;
  bookId: number;
  fullName: string;
  nickname: string;
  role: string;
  imageUrl: string;
  age: string;
  dob: string;
  gender: string;
  job: string;
  address: string;
  status: string;
  height: string;
  hair: string;
  eyes: string;
  physicalTrait: string;
  clothing: string;
  goodTraits: string[];
  badTraits: string[];
  fear: string;
  dream: string;
  habit: string;
  speakingStyle: string;
  past: string;
  turningPoint: string;
  relationships: Relationship[];
  arcStart: string;
  arcEnd: string;
}

export default function StepCharacter({ formData, onDataChange }: any) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);

  const bookId = formData?.id || formData?.bookId;

  const [newChar, setNewChar] = useState<Partial<Character>>({
    fullName: "", nickname: "", role: "Protagonist",
    imageUrl: "", gender: "L", goodTraits: [], badTraits: [],
    relationships: [{ name: "", type: "" }],
    age: "", dob: "", job: "", address: "", status: "Lajang",
    height: "", hair: "", eyes: "", physicalTrait: "", clothing: "",
    fear: "", dream: "", habit: "", speakingStyle: "",
    past: "", turningPoint: "", arcStart: "", arcEnd: "",
  });

  // 1. FETCH DATA DARI API
  const fetchCharacters = async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
     const res = await axios.get(`${API_BASE_URL}/books/characters/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data;
      setCharacters(data);

      // --- PERBAIKAN LOGIKA OTOMATISASI FORM ---
      if (data.length === 0) {
        setIsAdding(true); // Tampilkan field jika data masih kosong
      } else if (!editingId) {
        setIsAdding(false); // Sembunyikan jika sudah ada data (dan tidak sedang edit)
      }
      // -----------------------------------------

    } catch (err) {
      console.error("Gagal memuat karakter:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [bookId]);

  useEffect(() => {
    onDataChange({ ...formData, characters: characters });
  }, [characters]);

  // 2. HANDLE SAVE (CREATE & UPDATE)
  const handleSave = async () => {
    if (!newChar.fullName) return alert("Nama Lengkap wajib diisi");
    if (!bookId) return alert("ID Buku tidak ditemukan");

    try {
      const token = localStorage.getItem("token");
      const payload = { ...newChar, bookId };

     if (editingId) {
  await axios.patch(`${API_BASE_URL}/books/characters/${editingId}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
} else {
  await axios.post(`${API_BASE_URL}/books/characters`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

      setEditingId(null);
      resetForm();
      await fetchCharacters(); // Fetch ulang akan memicu logika isAdding di atas
    } catch (err) {
      alert("Gagal menyimpan karakter.");
    }
  };

  // 3. HANDLE DELETE
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus karakter ini secara permanen?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/books/characters/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCharacters();
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  // 4. HANDLE EDIT CLICK
  const handleEdit = (e: React.MouseEvent, char: Character) => {
    e.stopPropagation();
    setEditingId(char.id);
    setNewChar(char);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewChar({
      fullName: "", nickname: "", role: "Protagonist", imageUrl: "",
      goodTraits: [], badTraits: [],
      relationships: [{ name: "", type: "" }],
      age: "", dob: "", job: "", address: "", status: "Lajang",
      height: "", hair: "", eyes: "", physicalTrait: "", clothing: "",
      fear: "", dream: "", habit: "", speakingStyle: "",
      past: "", turningPoint: "", arcStart: "", arcEnd: "",
    });
    setEditingId(null);
    
    // Jika masih ada karakter tersisa, tutup form saat reset/batal
    if (characters.length > 0) {
      setIsAdding(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewChar({ ...newChar, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-gradient-to-r from-violet-600 to-fuchsia-600 p-5 rounded-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white">
            👤
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Galeri Karakter</h3>
            <p className="text-[10px] font-bold text-violet-100 uppercase opacity-80">Hidupkan tokoh-tokoh dalam ceritamu</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding && (editingId || characters.length > 0)) resetForm();
            else setIsAdding(!isAdding);
          }}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 ${
            isAdding ? "bg-white text-rose-600 shadow-rose-200" : "bg-white text-violet-700 shadow-violet-900/20"
          }`}
        >
          {isAdding ? <span className="flex items-center gap-2"><X size={14}/> Batal</span> : <span className="flex items-center gap-2"><Plus size={14}/> Karakter Baru</span>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-violet-100 rounded-[2.5rem] p-6 shadow-xl space-y-8">
              <h4 className="text-xs font-black text-violet-600 uppercase tracking-widest px-1">
                {editingId ? "📝 Edit Karakter" : "✨ Karakter Baru"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* UPLOAD GAMBAR SECTION */}
                <div className="flex flex-col items-center space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto Referensi</label>
                  <div className="relative w-40 h-40 group">
                    <div className="w-full h-full rounded-[2.5rem] bg-slate-100 border-4 border-dashed border-violet-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-violet-400">
                      {newChar.imageUrl ? (
                        <img src={newChar.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <span className="text-3xl block mb-1">📸</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase">Klik untuk upload</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Nama Lengkap">
                      <input type="text" value={newChar.fullName} onChange={(e) => setNewChar({...newChar, fullName: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 outline-none text-sm font-bold text-slate-900" placeholder="Misal: Alya Maheswari" />
                    </InputGroup>
                    <InputGroup label="Nama Panggilan">
                      <input type="text" value={newChar.nickname} onChange={(e) => setNewChar({...newChar, nickname: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 outline-none text-sm font-bold text-slate-900" placeholder="Misal: Alya" />
                    </InputGroup>
                  </div>
                  <InputGroup label="Peran dalam Cerita">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {["Protagonist", "Antagonist", "Deuteragonist", "Figuran"].map((r) => (
                        <button key={r} onClick={() => setNewChar({...newChar, role: r})} className={`py-2 rounded-lg text-[9px] font-black uppercase border-2 transition-all ${newChar.role === r ? "bg-violet-600 border-violet-600 text-white shadow-md" : "bg-white border-slate-100 text-slate-400 hover:border-violet-200"}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </InputGroup>
                </div>
              </div>

              {/* GRID DATA DIRI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-2"><span>📋</span> Data Diri</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniInput label="Usia" placeholder="25" value={newChar.age} onChange={(v: any) => setNewChar({...newChar, age: v})} />
                    <MiniInput label="Lahir" placeholder="DD/MM" value={newChar.dob} onChange={(v: any) => setNewChar({...newChar, dob: v})} />
                  </div>
                  <MiniInput label="Pekerjaan" value={newChar.job} onChange={(v: any) => setNewChar({...newChar, job: v})} />
                </div>
                <div className="space-y-4 border-x border-slate-200 px-4">
                  <h4 className="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest flex items-center gap-2"><span>💪</span> Fisik</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniInput label="Tinggi (cm)" value={newChar.height} onChange={(v: any) => setNewChar({...newChar, height: v})} />
                    <MiniInput label="Mata" value={newChar.eyes} onChange={(v: any) => setNewChar({...newChar, eyes: v})} />
                  </div>
                  <MiniInput label="Rambut" value={newChar.hair} onChange={(v: any) => setNewChar({...newChar, hair: v})} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2"><span>🧠</span> Sifat</h4>
                  <InputGroup label="Sifat Baik (Pisah koma)">
                    <input type="text" value={newChar.goodTraits?.join(",")} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-900" placeholder="Ramah, Jujur..." onChange={(e) => setNewChar({...newChar, goodTraits: e.target.value.split(",").map(t => t.trim())})} />
                  </InputGroup>
                  <InputGroup label="Sifat Buruk (Pisah koma)">
                    <input type="text" value={newChar.badTraits?.join(",")} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-900" placeholder="Keras Kepala..." onChange={(e) => setNewChar({...newChar, badTraits: e.target.value.split(",").map(t => t.trim())})} />
                  </InputGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Masa Lalu Karakter">
                  <textarea value={newChar.past} onChange={(e) => setNewChar({...newChar, past: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 outline-none text-xs font-bold text-slate-900 h-24 resize-none" placeholder="Ceritakan sejarah hidupnya..." />
                </InputGroup>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arc Perkembangan</label>
                  <div className="bg-violet-50 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-violet-400 uppercase w-12">Mulai</span>
                      <input type="text" value={newChar.arcStart} onChange={(e) => setNewChar({...newChar, arcStart: e.target.value})} className="flex-1 bg-transparent border-b border-violet-200 outline-none text-xs font-bold text-slate-900" placeholder="Status awal..." />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-fuchsia-400 uppercase w-12">Akhir</span>
                      <input type="text" value={newChar.arcEnd} onChange={(e) => setNewChar({...newChar, arcEnd: e.target.value})} className="flex-1 bg-transparent border-b border-fuchsia-200 outline-none text-xs font-bold text-slate-900" placeholder="Perubahan..." />
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-violet-100 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={16}/> {editingId ? "Update Karakter" : "Simpan Profil Karakter"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISPLAY CHARACTERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em]">Loading Characters...</div>
        ) : characters.length === 0 && !isAdding ? (
          <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 text-[11px] font-black uppercase italic">
            Belum ada karakter yang dibuat.
          </div>
        ) : (
          characters.map((char) => (
            <motion.div 
              layout
              key={char.id} 
              onClick={() => setSelectedChar(char)}
              className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-5 group relative hover:border-violet-400 transition-all shadow-sm hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-violet-100 rounded-[1.5rem] flex items-center justify-center text-2xl overflow-hidden border-2 border-violet-50">
                  {char.imageUrl ? <img src={char.imageUrl} alt={char.fullName} className="w-full h-full object-cover" /> : <User size={30} className="text-violet-300"/>}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-slate-900 uppercase truncate leading-none mb-1">{char.fullName}</h4>
                  <span className="text-[9px] font-black bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full uppercase">{char.role}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-3">
                 <div className="flex flex-col"><span className="text-[8px] font-bold text-slate-300 uppercase">Usia</span><span className="text-[10px] font-black text-slate-600">{char.age || "-"} Tahun</span></div>
                 <div className="flex flex-col text-right"><span className="text-[8px] font-bold text-slate-300 uppercase">Sifat Utama</span><span className="text-[10px] font-black text-slate-600 truncate">{char.goodTraits?.[0] || "-"}</span></div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={(e) => handleEdit(e, char)} className="w-8 h-8 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600"><Edit3 size={14}/></button>
                <button onClick={(e) => handleDelete(e, char.id)} className="w-8 h-8 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-600"><Trash2 size={14}/></button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* MODAL DETAIL KARAKTER (Tetap Sama) */}
      <AnimatePresence>
        {selectedChar && (
          <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative">
              <button onClick={() => setSelectedChar(null)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all z-10"><X size={20}/></button>
              
              <div className="grid md:grid-cols-5 h-full">
                <div className="md:col-span-2 bg-violet-600 p-8 flex flex-col items-center text-center text-white">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white/20 border-4 border-white/30 overflow-hidden mb-4 shadow-xl">
                    {selectedChar.imageUrl ? <img src={selectedChar.imageUrl} className="w-full h-full object-cover" /> : <User size={60} className="m-auto h-full opacity-50"/>}
                  </div>
                  <h3 className="text-xl font-black uppercase leading-tight">{selectedChar.fullName}</h3>
                  <p className="text-xs font-bold text-violet-200 uppercase tracking-widest mt-1 italic">"{selectedChar.nickname}"</p>
                  <span className="mt-4 px-4 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase">{selectedChar.role}</span>
                  
                  <div className="mt-8 w-full space-y-3">
                    <DetailItem icon={<Briefcase size={12}/>} label="Pekerjaan" value={selectedChar.job}/>
                  </div>
                </div>

                <div className="md:col-span-3 p-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">Biografi & Masa Lalu</h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic">{selectedChar.past || "Belum ada riwayat masa lalu..."}</p>
                    </section>

                    <section className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Sifat Baik</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedChar.goodTraits?.map((t, i) => t && <span key={i} className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold">#{t.trim()}</span>)}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Sifat Buruk</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedChar.badTraits?.map((t, i) => t && <span key={i} className="text-[9px] bg-rose-50 text-rose-600 px-2 py-1 rounded-md font-bold">#{t.trim()}</span>)}
                        </div>
                      </div>
                    </section>

                    <section className="bg-slate-50 p-4 rounded-2xl">
                      <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Info size={12}/> Perkembangan Arc</h4>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-slate-400 uppercase">Mulai:</span>
                        <p className="font-black text-slate-700">{selectedChar.arcStart || "-"}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="font-bold text-slate-400 uppercase">Akhir:</span>
                        <p className="font-black text-fuchsia-600">{selectedChar.arcEnd || "-"}</p>
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

// --- HELPER COMPONENTS (Tetap Sama) ---
function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2 text-left w-full bg-black/10 p-2 rounded-xl">
      <div className="text-violet-200">{icon}</div>
      <div className="min-w-0">
        <p className="text-[7px] uppercase font-black text-violet-300 leading-none">{label}</p>
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
        className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:border-violet-400 outline-none transition-all" 
      />
    </div>
  );
}