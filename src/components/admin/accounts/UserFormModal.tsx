// src/components/admin/accounts/UserFormModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User, Mentor, CreateUserPayload, UpdateUserPayload } from '@/lib/types/account';
import { mentorService } from '@/lib/services/mentorService';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: User | null;
    onSubmit: (payload: any, id?: string) => Promise<void>;
}

export function UserFormModal({ isOpen, onClose, initialData, onSubmit }: UserFormModalProps) {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inisialisasi data form ketika modal dibuka
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({ role: 'PESERTA', isActive: true });
            }
            setError(null);
            fetchMentors();
        }
    }, [isOpen, initialData]);

    const fetchMentors = async () => {
        try {
            const res = await mentorService.getAll();
            if (res.success && res.data) setMentors(res.data);
        } catch (err) {
            console.error("Gagal memuat daftar mentor", err);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Pendelegasian aksi submit ke komponen parent (Controller)
            await onSubmit(formData, initialData?.id);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data peserta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{initialData ? 'Edit Peserta' : 'Tambah Peserta'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Institusi / Perusahaan</label>
                        <input
                            type="text"
                            name="institution"
                            value={formData.institution || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pilih Mentor Pembimbing</label>
                        <select
                            name="mentorId" // Asumsi ada relasi mentorId di backend
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Tidak ada (atau pilih mentor) --</option>
                            {mentors.map((mentor) => (
                                <option key={mentor.id} value={mentor.id}>
                                    {mentor.fullName} ({mentor.specialization.join(', ')})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}