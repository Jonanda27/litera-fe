"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
    ArrowLeft,
    Video,
    User,
    Calendar,
    Clock,
    FileText,
    ImageIcon,
    Upload,
    X,
    Send,
    Youtube
} from 'lucide-react';
import { API_BASE_URL } from "@/lib/constans/constans";

export default function AdminCreateLive() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // State Form
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        speaker_name: "",
        scheduled_date: "",
        scheduled_time: "",
        stream_key: "default-litera-key-2024", // Default key organisasi
    });

    // State File Poster
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPosterFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemovePoster = () => {
        setPosterFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!posterFile) return alert("Harap unggah poster terlebih dahulu!");

        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('speaker_name', formData.speaker_name);
        data.append('scheduled_at', `${formData.scheduled_date} ${formData.scheduled_time}`);
        data.append('stream_key', formData.stream_key);
        data.append('poster_url', posterFile);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/live-session/create-live`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                const result = await res.json();
                const liveId = result.data?.id || result.id;
                router.push(`/admin/livesession/${liveId}`);
            } else {
                alert("Gagal menerbitkan sesi live.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sidebar>
            <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">

                {/* Tombol Kembali */}
                <button
                    onClick={() => router.push('/admin/livesession')}
                    className="group flex items-center gap-2 text-slate-400 font-black mb-8 hover:text-slate-900 transition-all text-[10px] uppercase tracking-[0.3em]"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Manager
                </button>

                <div className="bg-white border-4 border-slate-900 rounded-[3rem] overflow-hidden shadow-[16px_16px_0px_0px_rgba(15,23,42,1)]">
                    {/* Header Biru Gelap */}
                    <div className="bg-slate-900 p-8 text-white flex justify-between items-center border-b-4 border-slate-900">
                        <div>
                            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Setup <span className="text-[#c31a26]">Broadcast</span></h1>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Konfigurasi Sesi Live & Jadwal Tayang</p>
                        </div>
                        <div className="w-14 h-14 bg-[#c31a26] rounded-2xl flex items-center justify-center rotate-3">
                            <Video size={28} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                            {/* KOLOM KIRI: VISUAL/POSTER */}
                            <div className="lg:col-span-5 space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Session Poster (16:9)</label>

                                <div className={`relative h-[350px] rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${previewUrl ? 'border-slate-900' : 'border-slate-200 bg-slate-50 hover:border-[#c31a26]'}`}>
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={handleRemovePoster}
                                                className="absolute top-4 right-4 bg-white text-red-600 p-3 rounded-full shadow-xl hover:scale-110 transition-all border-2 border-slate-900"
                                            >
                                                <X size={20} strokeWidth={3} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            <div className="w-20 h-20 bg-white border-4 border-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-[#c31a26]">
                                                <ImageIcon size={32} className="text-slate-900" />
                                            </div>
                                            <p className="font-black text-slate-900 uppercase text-xs">Pilih Gambar Poster</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 tracking-widest">PNG, JPG up to 2MB</p>
                                        </div>
                                    )}
                                </div>

                                {/* Info Tambahan */}
                                <div className="bg-blue-50 border-2 border-[#1e4e8c] p-6 rounded-[2rem]">
                                    <h4 className="text-[10px] font-black text-[#1e4e8c] uppercase mb-2">💡 Tips Siaran</h4>
                                    <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase">
                                        Gunakan poster dengan resolusi tinggi. Poster ini akan muncul di halaman utama seluruh peserta sebagai thumbnail utama.
                                    </p>
                                </div>
                            </div>

                            {/* KOLOM KANAN: DATA TEKNIS */}
                            <div className="lg:col-span-7 space-y-8">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Judul Sesi */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Sesi Live</label>
                                        <div className="relative">
                                            <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                required
                                                className="w-full pl-14 pr-5 py-5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-[#c31a26] outline-none font-bold text-slate-800 transition-all italic"
                                                placeholder="CONTOH: MASTERCLASS LITERASI DIGITAL"
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Pembicara */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Pembicara</label>
                                        <div className="relative">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                required
                                                className="w-full pl-14 pr-5 py-5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-[#c31a26] outline-none font-bold text-slate-800 transition-all uppercase"
                                                placeholder="NAMA LENGKAP NARASUMBER"
                                                onChange={(e) => setFormData({ ...formData, speaker_name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Waktu Pelaksanaan */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input type="date" required className="w-full pl-14 pr-5 py-5 rounded-2xl bg-slate-50 border-2 border-slate-200 font-bold text-xs" onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jam</label>
                                            <div className="relative">
                                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input type="time" required className="w-full pl-14 pr-5 py-5 rounded-2xl bg-slate-50 border-2 border-slate-200 font-bold text-xs" onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* YouTube Stream Key */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#c31a26] uppercase tracking-widest flex items-center gap-2">
                                            <Youtube size={14} /> YouTube Stream Key
                                        </label>
                                        <input
                                            required
                                            value={formData.stream_key}
                                            className="w-full p-5 rounded-2xl bg-slate-100 border-2 border-slate-200 font-mono text-[10px] text-slate-500 outline-none"
                                            onChange={(e) => setFormData({ ...formData, stream_key: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Materi</label>
                                    <textarea
                                        rows={4} required
                                        className="w-full p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-200 focus:border-[#c31a26] outline-none font-bold text-slate-800 text-sm"
                                        placeholder="Apa yang akan dibahas dalam sesi ini?"
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        disabled={loading}
                                        className="w-full py-6 bg-[#c31a26] text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-[8px_8px_0px_0px_rgba(30,78,140,1)] hover:bg-slate-900 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>TERBITKAN JADWAL LIVE <Send size={20} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Sidebar>
    );
}