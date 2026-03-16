// src/app/admin/users/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { userService } from '@/lib/services/userService';
import { User, CreateUserPayload } from '@/lib/types/account';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, Edit3, Trash2, Mail, Shield, 
    Search, RefreshCw, X, Save, Key, User as UserIcon
} from 'lucide-react';

// --- KOMPONEN MODAL (UserFormModal) ---
interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: User | null;
    onSuccess: () => void;
}

function UserFormModal({ isOpen, onClose, initialData, onSuccess }: UserFormModalProps) {
    const [formData, setFormData] = useState<Partial<CreateUserPayload>>({
        nama: '',
        email: '',
        password: '',
        role: 'peserta'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nama: initialData.nama,
                email: initialData.email,
                role: initialData.role,
                password: '' 
            });
        } else {
            setFormData({ nama: '', email: '', password: '', role: 'peserta' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = Cookies.get('token') || '';
            if (initialData) {
                await userService.update(initialData.id.toString(), formData, token);
            } else {
                await userService.create(formData as CreateUserPayload, token);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-black">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">
                                {initialData ? '📝 Edit Member' : '✨ New Member'}
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 text-black">
                            <div className="space-y-1.5 text-black">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 text-black">Nama Lengkap</label>
                                <div className="relative text-black">
                                    <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-[#C31A26] focus:bg-white transition-all text-xs font-bold text-black"
                                        placeholder="Full Name"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input 
                                        required
                                        type="email" 
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#C31A26] focus:bg-white transition-all text-xs font-bold text-black"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative">
                                    <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input 
                                        required={!initialData}
                                        type="password" 
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#C31A26] focus:bg-white transition-all text-xs font-bold text-black"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Akses</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['peserta', 'admin'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setFormData({...formData, role: r as any})}
                                            className={`py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${formData.role === r ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-[#C31A26] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 mt-2 active:scale-95"
                            >
                                {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                                {initialData ? 'Update Profile' : 'Create Account'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// --- KOMPONEN UTAMA (UsersManagementPage) ---
export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Sesi Anda telah berakhir.');

            const response = await userService.getAll(token);
            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                throw new Error(response.message || 'Gagal memuat data');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan sistem.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus peserta ini?')) return;
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Token tidak ditemukan');
            await userService.delete(id, token);
            fetchUsers();
        } catch (err: any) {
            alert(`Gagal: ${err.message}`);
        }
    };

    const filteredUsers = users.filter(u => 
        u.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Sidebar>
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1400px] mx-auto space-y-6 px-2 md:px-0 pb-10"
            >
                {/* Header Section */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            Manajemen Akun
                        </h1>
                        <p className="text-slate-500 font-bold text-xs md:text-sm">
                            Otoritas penuh untuk mengelola akses pengguna LITERA.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                        <div className="relative group flex-1 sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C31A26] transition-colors" size={16} />
                            <input 
                                type="text"
                                placeholder="Cari nama atau email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-[#C31A26] transition-all font-bold text-xs shadow-sm text-black"
                            />
                        </div>
                        <button
                            onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-black transition-all active:scale-95 whitespace-nowrap"
                        >
                            <UserPlus size={16} />
                            Add Member
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 text-red-700">
                            <Shield size={16} />
                            <p className="font-bold text-[10px] uppercase tracking-tight">{error}</p>
                        </div>
                        <button onClick={fetchUsers} className="p-1.5 hover:bg-red-100 rounded-full transition-colors text-red-600">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                )}

                {/* Table Container - Mobile Friendly Layout */}
                <div className="bg-white rounded-[2rem] md:border md:border-slate-100 md:shadow-xl md:shadow-slate-200/50 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-[#C31A26] rounded-full animate-spin"></div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Syncing Cloud Database</p>
                        </div>
                    ) : (
                        <>
                            {/* --- MOBILE VIEW (Card-based, No Horizontal Scroll) --- */}
                            <div className="md:hidden space-y-3 p-2">
                                {filteredUsers.map((user) => (
                                    <div key={user.id} className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-[#C31A26] border border-white shadow-sm uppercase text-xs">
                                                    {user.nama?.charAt(0) || 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate max-w-[150px]">{user.nama}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">UID-{user.id}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-2 ${
                                                String(user.role).toLowerCase() === 'admin' 
                                                    ? 'bg-red-50 border-red-100 text-[#C31A26]' 
                                                    : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100">
                                            <Mail size={12} className="text-blue-400" />
                                            <span className="text-[10px] font-bold text-slate-600 truncate">{user.email}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEdit(user)} 
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-slate-400 rounded-xl border border-slate-200 font-black text-[9px] uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.id.toString())} 
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-slate-400 rounded-xl border border-slate-200 font-black text-[9px] uppercase hover:bg-[#C31A26] hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- DESKTOP VIEW (Standard Table) --- */}
                            <div className="hidden md:block overflow-x-auto custom-scrollbar">
                                <table className="min-w-full divide-y divide-slate-50 text-black font-bold">
                                    <thead className="bg-slate-50/80">
                                        <tr>
                                            <th className="px-6 md:px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                                            <th className="px-6 md:px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                                            <th className="px-6 md:px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                            <th className="px-6 md:px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-50">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-[#C31A26] border-2 border-white shadow-sm uppercase text-xs">
                                                            {user.nama?.charAt(0) || 'U'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate max-w-[150px] md:max-w-none">{user.nama}</p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">UID-{user.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-400"><Mail size={12} /></div>
                                                        <span className="text-[11px] font-bold">{user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-[0.1em] border-2 ${
                                                        String(user.role).toLowerCase() === 'admin' 
                                                            ? 'bg-red-50 border-red-100 text-[#C31A26]' 
                                                            : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                                    }`}>
                                                        <div className={`w-1 h-1 rounded-full animate-pulse ${String(user.role).toLowerCase() === 'admin' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 md:px-8 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button 
                                                            onClick={() => handleEdit(user)} 
                                                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(user.id.toString())} 
                                                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-[#C31A26] hover:text-white transition-all shadow-sm border border-slate-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {filteredUsers.length === 0 && !isLoading && (
                        <div className="px-8 py-24 text-center bg-white">
                            <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Search size={32} className="text-slate-400" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-black">No Users Found</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <UserFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                initialData={selectedUser}
                onSuccess={fetchUsers}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </Sidebar>
    );
}