// src/app/admin/mentors/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { mentorService } from '@/lib/services/mentorService';
import { Mentor } from '@/lib/types/account';

export default function MentorsManagementPage() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

    const fetchMentors = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await mentorService.getAll();
            if (response.success && response.data) {
                setMentors(response.data);
            } else {
                throw new Error(response.message || 'Gagal memuat data mentor');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan sistem saat memuat data mentor.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMentors();
    }, [fetchMentors]);

    const handleEdit = (mentor: Mentor) => {
        setSelectedMentor(mentor);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menonaktifkan mentor ini?')) return;

        try {
            await mentorService.delete(id);
            fetchMentors();
        } catch (err: any) {
            alert(`Gagal menonaktifkan: ${err.message}`);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Manajemen Mentor</h1>
                <button
                    onClick={() => { setSelectedMentor(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                >
                    + Tambah Mentor
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200">
                    <p><strong>Error:</strong> {error}</p>
                    <button onClick={fetchMentors} className="mt-2 text-sm underline">Coba Lagi</button>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-10">
                    <span className="text-gray-500">Memuat data spesialisasi mentor...</span>
                </div>
            ) : (
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Mentor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spesialisasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mentors.map((mentor) => (
                                <tr key={mentor.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="text-xs text-gray-500">{mentor.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            {mentor.specialization.map((spec, index) => (
                                                <span key={index} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {mentor.rating ? `${mentor.rating} / 5.0` : 'Belum dinilai'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium space-x-3">
                                        <button onClick={() => handleEdit(mentor)} className="text-indigo-600 hover:text-indigo-900">Detail & Edit</button>
                                        <button onClick={() => handleDelete(mentor.id)} className="text-red-600 hover:text-red-900">Nonaktifkan</button>
                                    </td>
                                </tr>
                            ))}
                            {mentors.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                        Belum ada mentor yang terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}