// src/app/admin/users/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '@/lib/services/userService';
import { User } from '@/lib/types/account';

// Asumsi: Komponen presentasional (Pure Fabrication) diimpor dari folder UI
// import { DataTable } from '@/components/ui/DataTable';
// import { UserFormModal } from '@/components/admin/UserFormModal';

export default function UsersManagementPage() {
    // State Management
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State untuk kontrol UI (sebagai parameter variasi)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Fungsi Fetching Data yang di-memoize agar stabil sebagai dependency
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await userService.getAll();
            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                throw new Error(response.message || 'Gagal memuat data peserta');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan sistem saat menghubungi server.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Inisialisasi Data pada Mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handler untuk aksi (Akan diteruskan ke komponen presentasional)
    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus peserta ini?')) return;

        try {
            await userService.delete(id);
            fetchUsers(); // Refresh data setelah mutasi berhasil
        } catch (err: any) {
            alert(`Gagal menghapus: ${err.message}`);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Manajemen Peserta</h1>
                <button
                    onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    + Tambah Peserta
                </button>
            </div>

            {/* Handling variasi state */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200">
                    <p><strong>Error:</strong> {error}</p>
                    <button onClick={fetchUsers} className="mt-2 text-sm underline">Coba Lagi</button>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-10">
                    <span className="text-gray-500">Memuat data peserta...</span>
                </div>
            ) : (
                <div className="bg-white rounded shadow overflow-hidden">
                    {/* Protected Variation: Tabel komponen dipisahkan. 
            Di sini kita menggunakan representasi tabel sederhana untuk melihat struktur data.
            Di lingkungan production, Anda akan melempar `users` ke <DataTable data={users} columns={...} />
          */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Lengkap</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institusi</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.institution || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium space-x-3">
                                        <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                        Tidak ada data peserta ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Komponen Form terisolasi (Modal). 
        <UserFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          initialData={selectedUser}
          onSuccess={fetchUsers}
        /> 
      */}
        </div>
    );
}