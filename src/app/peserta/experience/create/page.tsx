"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function CreateMeeting() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Simulasi User ID (Ganti dengan ID dari Login/Session Anda)
    const currentUserId = 1;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:4000/api/meetings/create-meeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    moderator_id: currentUserId // Pastikan backend menerima ini
                }),
            });

            const result = await response.json();

            if (response.ok) {
                // Redirect ke halaman meeting yang baru dibuat
                router.push(`/peserta/experience/${result.data.id}`);
            } else {
                alert("Gagal membuat meeting: " + result.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Terjadi kesalahan koneksi ke server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sidebar>
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mulai Diskusi Baru</h1>
                        <p className="text-slate-500">Buat ruang diskusi video dan undang rekan lainnya.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Diskusi</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                                placeholder="Contoh: Belajar Next.js Bersama"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Singkat</label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                                placeholder="Apa yang akan dibahas?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${loading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-blue-600'
                                }`}
                        >
                            {loading ? 'Memproses...' : 'Buat & Gabung Sekarang'}
                        </button>
                    </form>
                </div>
            </div>
        </Sidebar>
    );
}