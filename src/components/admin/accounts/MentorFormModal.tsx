// src/components/admin/accounts/MentorFormModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Mentor } from '@/lib/types/account';

interface MentorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: Mentor | null;
    onSubmit: (payload: any, id?: string) => Promise<void>;
}

export function MentorFormModal({ isOpen, onClose, initialData, onSubmit }: MentorFormModalProps) {
    const [formData, setFormData] = useState<Partial<Mentor>>({});
    // Spesialisasi ditangani sebagai string sementara di UI agar mudah diketik user
    const [specializationInput, setSpecializationInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
                setSpecializationInput(initialData.specialization?.join(', ') || '');
            } else {
                setFormData({ role: 'MENTOR', isActive: true });
                setSpecializationInput('');
            }
            setError(null);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Normalisasi string spesialisasi menjadi array (trimming whitespace)
        const normalizedSpecialization = specializationInput
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

        const payload = {
            ...formData,
            specialization: normalizedSpecialization,
        };

        try {
            await onSubmit(payload, initialData?.id);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data mentor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{initialData ? 'Edit Mentor' : 'Tambah Mentor'}</h2>
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Spesialisasi <span className="text-xs text-gray-500">(Pisahkan dengan koma)</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="contoh: React, Node.js, System Design"
                            value={specializationInput}
                            onChange={(e) => setSpecializationInput(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio Singkat</label>
                        <textarea
                            name="bio"
                            rows={3}
                            value={formData.bio || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        ></textarea>
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
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-emerald-300"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}