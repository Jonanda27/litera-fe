"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: number | undefined;
}

export default function CreateMeetingModal({ isOpen, onClose, currentUserId }: CreateMeetingModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
                    moderator_id: currentUserId
                }),
            });

            const result = await response.json();

            if (response.ok) {
                onClose(); // Tutup modal
                router.push(`/peserta/experience/component/${result.data.id}`);
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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border-4 border-slate-900 relative"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>

                        <div className="mb-8">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                                <Video size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Mulai Diskusi Video</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buat ruang tatap muka komunitas baru</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-700 mb-2 uppercase tracking-widest">Judul Diskusi</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 text-sm transition-all"
                                    placeholder="CONTOH: BRAINSTORMING UI/UX"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-700 mb-2 uppercase tracking-widest">Deskripsi</label>
                                <textarea
                                    rows={3}
                                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 text-sm transition-all"
                                    placeholder="APA YANG AKAN DIBAHAS?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 font-black text-slate-400 uppercase text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-[2] py-4 rounded-2xl font-black uppercase text-xs shadow-xl transition-all active:scale-95 ${
                                        loading ? 'bg-slate-300' : 'bg-slate-900 text-white hover:bg-blue-600'
                                    }`}
                                >
                                    {loading ? 'MEMPROSES...' : 'BUAT & GABUNG SEKARANG →'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}