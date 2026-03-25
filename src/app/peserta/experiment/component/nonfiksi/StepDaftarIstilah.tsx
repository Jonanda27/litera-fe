"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Save,
  X,
  Plus,
  Trash2,
  Info,
  BookOpen,
  Edit3,
  ExternalLink,
  Hash,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constans/constans";

interface GlossaryItem {
  id: string;
  bookId: number;
  term: string;
  category: string;
  shortDef: string;
  fullDef: string;
  example: string;
  bab: string;
  hal: string;
  relatedTerms: string[];
}

interface StepGlossaryProps {
  formData: any;
  onDataChange: (data: any) => void;
}

export default function StepGlossary({
  formData,
  onDataChange,
}: StepGlossaryProps) {
  const [items, setItems] = useState<GlossaryItem[]>(formData.glossary || []);

  /** * FIX: Menggunakan tipe data <boolean> eksplisit untuk menghindari error 
   * "Argument of type 'false' is not assignable to parameter of type 'SetStateAction<true>'"
   */
  const [isAdding, setIsAdding] = useState<boolean>(items.length === 0);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GlossaryItem | null>(null);

  // Ref untuk proteksi infinite loop dan sinkronisasi
  const hasFetchedRef = useRef<number | null>(null);
  const lastSentDataRef = useRef("");

  const [newItem, setNewItem] = useState<Partial<GlossaryItem>>({
    term: "",
    category: "Istilah Teknis",
    shortDef: "",
    fullDef: "",
    example: "",
    bab: "",
    hal: "",
    relatedTerms: ["", "", ""],
  });

  // --- 1. FETCH DATA DARI DATABASE (READ) ---
  useEffect(() => {
    const fetchGlossary = async () => {
      const bookId = formData?.bookId || formData?.id;
      if (!bookId || hasFetchedRef.current === bookId) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/books/glossary/${bookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data && res.data.length > 0) {
          hasFetchedRef.current = bookId;
          const dbItems = res.data.map((item: any) => ({
            ...item,
            id: item.id.toString(),
            relatedTerms: item.relatedTerms || ["", "", ""],
          }));
          setItems(dbItems);
          setIsAdding(false); // Sembunyikan form jika data ditemukan
        } else {
          // Jika data benar-benar kosong dari database, tampilkan form
          setIsAdding(true);
        }
      } catch (err) {
        console.error("Gagal memuat glosarium:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlossary();
  }, [formData?.bookId, formData?.id]);

  // --- 2. SINKRONISASI KE PARENT MODAL ---
  useEffect(() => {
    const currentDataString = JSON.stringify(items);
    if (lastSentDataRef.current !== currentDataString) {
      lastSentDataRef.current = currentDataString;
      onDataChange({ ...formData, glossary: items });
    }
  }, [items, onDataChange, formData]);

  const categories = [
    "Istilah Teknis",
    "Singkatan/Akronim",
    "Nama Tokoh/Figur",
    "Nama Metode",
    "Istilah Asing",
    "Lainnya",
  ];

  // --- 3. HANDLE SIMPAN (CREATE ATAU UPDATE) ---
  const handleSave = async () => {
    if (!newItem.term?.trim()) return alert("Istilah wajib diisi!");
    const bookId = formData?.bookId || formData?.id;
    if (!bookId) return alert("ID Buku tidak ditemukan");

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { ...newItem, bookId };

      if (editingId) {
        // UPDATE API
        await axios.patch(
          `${API_BASE_URL}/books/glossary/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // CREATE API
        await axios.post(`${API_BASE_URL}/books/glossary`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Reset status fetch agar data terbaru ditarik kembali
      hasFetchedRef.current = null;
      setEditingId(null);
      setIsAdding(false);
      resetForm();

      const res = await axios.get(
        `${API_BASE_URL}/books/glossary/${bookId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(
        res.data.map((item: any) => ({ ...item, id: item.id.toString() })),
      );
    } catch (error) {
      alert("Gagal menyimpan data ke database");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. HANDLE HAPUS (DELETE) ---
  const removeItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Hapus istilah ini dari database?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/books/glossary/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedItems = items.filter((i) => i.id !== id);
      setItems(updatedItems);

      // Jika data menjadi kosong setelah dihapus, tampilkan form otomatis
      if (updatedItems.length === 0) setIsAdding(true);
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const handleEdit = (e: React.MouseEvent, item: GlossaryItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setNewItem(item);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewItem({
      term: "",
      category: "Istilah Teknis",
      shortDef: "",
      fullDef: "",
      example: "",
      bab: "",
      hal: "",
      relatedTerms: ["", "", ""],
    });
  };

  return (
    <div className="px-1 md:px-0space-y-8 pb-10 text-slate-800 relative">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-blue-700 to-indigo-800 p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-lg border-b-4 border-blue-900/20 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl text-white shadow-inner">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Glossary
            </h3>
            {isLoading ? (
              <p className="text-[10px] font-bold text-blue-200 animate-pulse uppercase">
                Mensinkronkan Data...
              </p>
            ) : (
              <p className="text-[10px] font-bold text-blue-100 uppercase opacity-80 italic">
                Katalog terminologi ceritamu
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase transition-all shadow-md active:scale-95 flex items-center gap-2 ${isAdding
              ? "bg-rose-500 text-white"
              : "bg-white text-indigo-700 hover:bg-blue-50"
            }`}
        >
          {isAdding ? (
            <>
              <X size={16} /> Tutup
            </>
          ) : (
            <>
              <Plus size={16} /> Tambah Istilah
            </>
          )}
        </button>
      </div>

      {/* FORM INPUT - Tampil Otomatis jika data kosong atau isAdding true */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-4 border-blue-50 rounded-2xl md:rounded-[3rem] p-4 md:p-8 shadow-2xl space-y-6 md:space-y-8">
              <div className="flex items-center gap-2 text-blue-600">
                <Edit3 size={18} />
                <h4 className="font-black uppercase tracking-widest text-xs">
                  {editingId ? "Ubah Istilah" : "Rekam Istilah Baru"}
                </h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <InputWrapper label="Nama Istilah">
                    <input
                      type="text"
                      className="form-input-custom"
                      placeholder="Misal: Quantum Entanglement"
                      value={newItem.term}
                      onChange={(e) =>
                        setNewItem({ ...newItem, term: e.target.value })
                      }
                    />
                  </InputWrapper>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Kategori
                    </label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setNewItem({ ...newItem, category: cat })
                          }
                          className={`py-3 px-4 rounded-xl text-[9px] font-black uppercase border-2 transition-all text-left ${newItem.category === cat
                              ? "bg-blue-600 border-blue-600 text-white shadow-md"
                              : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                            }`}
                        >
                          {newItem.category === cat ? "● " : "○ "} {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputWrapper label="Bab Muncul">
                      <input
                        type="text"
                        placeholder="Bab 01"
                        className="form-input-custom text-center"
                        value={newItem.bab}
                        onChange={(e) =>
                          setNewItem({ ...newItem, bab: e.target.value })
                        }
                      />
                    </InputWrapper>
                    <InputWrapper label="Halaman">
                      <input
                        type="text"
                        placeholder="Hal 42"
                        className="form-input-custom text-center"
                        value={newItem.hal}
                        onChange={(e) =>
                          setNewItem({ ...newItem, hal: e.target.value })
                        }
                      />
                    </InputWrapper>
                  </div>
                </div>

                <div className="space-y-6">
                  <InputWrapper label="Definisi Singkat">
                    <textarea
                      className="form-textarea-custom h-24"
                      placeholder="Definisi 1 kalimat untuk Glosarium..."
                      value={newItem.shortDef}
                      onChange={(e) =>
                        setNewItem({ ...newItem, shortDef: e.target.value })
                      }
                    ></textarea>
                  </InputWrapper>
                  <InputWrapper label="Definisi Lengkap (Uraian)">
                    <textarea
                      className="form-textarea-custom h-32"
                      placeholder="Penjelasan mendalam untuk isi buku..."
                      value={newItem.fullDef}
                      onChange={(e) =>
                        setNewItem({ ...newItem, fullDef: e.target.value })
                      }
                    ></textarea>
                  </InputWrapper>
                </div>
              </div>

              <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 border-slate-100 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Sinonim / Istilah Terkait
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {[0, 1, 2].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-400 outline-none"
                      placeholder="..."
                      value={newItem.relatedTerms?.[idx]}
                      onChange={(e) => {
                        const updated = [
                          ...(newItem.relatedTerms || ["", "", ""]),
                        ];
                        updated[idx] = e.target.value;
                        setNewItem({ ...newItem, relatedTerms: updated });
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-5 bg-slate-900 text-blue-400 rounded-[1.5rem] text-xs font-black uppercase shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
              >
                {isSaving ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                {editingId
                  ? "Perbarui Istilah ke Database"
                  : "Simpan Istilah Baru"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID DAFTAR ISTILAH (CARD VIEW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map((item) => (
          <motion.div
            layout
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all group relative overflow-hidden cursor-pointer"
          >
            <div className="mb-4 flex justify-between items-start">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">
                {item.category}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleEdit(e, item)}
                  className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => removeItem(e, item.id)}
                  className="p-2 bg-slate-100 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">
              {item.term}
            </h4>
            <p className="text-xs font-bold text-slate-500 mb-4 line-clamp-2 italic">
              "{item.shortDef}"
            </p>
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                <Hash size={10} /> Bab {item.bab || "-"} / Hal {item.hal || "-"}
              </span>
              <ExternalLink
                size={14}
                className="text-slate-300 group-hover:text-blue-500 transition-colors"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL DETAIL (VIEW MODE) */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-[3rem] shadow-2xl overflow-hidden text-black max-h-[95vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-blue-700 p-6 md:p-8 text-white relative shrink-0">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">
                  {selectedItem.category}
                </span>
                <h2 className="text-4xl font-black uppercase tracking-tighter mt-4">
                  {selectedItem.term}
                </h2>
              </div>
              <div className="p-5 md:p-8 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  <h5 className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    <Info size={14} /> Definisi Lengkap
                  </h5>
                  <p className="text-sm leading-relaxed text-slate-600 font-medium bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 italic">
                    "{selectedItem.fullDef || selectedItem.shortDef}"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Contoh Penggunaan
                    </h5>
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-xs font-bold text-blue-800">
                      {selectedItem.example || "Belum ada contoh."}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Istilah Terkait
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.relatedTerms
                        ?.filter((t) => t !== "")
                        .map((term, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase"
                          >
                            {term}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase">
                      Lokasi Referensi
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      Bab {selectedItem.bab} / Hal {selectedItem.hal}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-black transition-all"
                  >
                    Tutup Detail
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .form-input-custom {
          width: 100%;
          padding: 12px 16px;
          background-color: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          outline: none;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .form-input-custom:focus {
          border-color: #3b82f6;
          background-color: white;
        }
        .form-textarea-custom {
          width: 100%;
          padding: 16px;
          background-color: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
          font-weight: 500;
          resize: none;
          line-height: 1.6;
          transition: all 0.2s;
        }
        .form-textarea-custom:focus {
          border-color: #3b82f6;
          background-color: white;
        }
      `}</style>
    </div>
  );
}

function InputWrapper({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}