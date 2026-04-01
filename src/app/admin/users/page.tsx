'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { userService } from '@/lib/services/userService';
import { mentorService } from '@/lib/services/mentorService';
import { User } from '@/lib/types/account';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, Edit3, Trash2, Mail, Shield, 
    Search, RefreshCw, X, Save, Key, User as UserIcon,
    Phone, Filter as FilterIcon, Check
} from 'lucide-react';

// --- KOMPONEN MODAL (UserFormModal) ---
interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: User | null;
    onSuccess: () => void;
}

function UserFormModal({ isOpen, onClose, initialData, onSuccess }: UserFormModalProps) {
    const [formData, setFormData] = useState<any>({
        nama: '',
        email: '',
        password: '',
        no_hp: '', 
        role: 'peserta',
        spesialisasi: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nama: initialData.nama,
                email: initialData.email,
                no_hp: (initialData as any).no_hp || '', 
                role: initialData.role,
                spesialisasi: (initialData as any).spesialisasi || '',
                password: '' 
            });
        } else {
            setFormData({ nama: '', email: '', password: '', no_hp: '', role: 'peserta', spesialisasi: '' });
        }
    }, [initialData, isOpen]);

    // Hanya angka yang diperbolehkan
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ''); 
        setFormData({ ...formData, no_hp: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = Cookies.get('token') || '';
            const payload = { ...formData };
            
            // Aturan Bisnis: Hanya peserta yang punya no_hp
            if (payload.role !== 'peserta') {
                payload.no_hp = null;
            }

            if (initialData) {
                const dbId = (initialData as any).originalId || initialData.id;
                await userService.update(dbId.toString(), payload, token);
            } else {
                await userService.create(payload, token);
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
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">
                                {initialData ? '📝 Edit Member' : '✨ New Member'}
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 text-black max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                                <div className="relative">
                                    <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input required type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-[#C31A26] focus:bg-white transition-all text-xs font-bold"
                                        placeholder="Full Name" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alamat Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input required type="email" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-[#C31A26] focus:bg-white transition-all text-xs font-bold"
                                        placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>

                            {/* NO HP KHUSUS PESERTA */}
                            <AnimatePresence>
                                {formData.role === 'peserta' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                                        <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Nomor WhatsApp</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                                            <input required type="text" inputMode="numeric" className="w-full pl-10 pr-4 py-2.5 bg-blue-50/30 border-2 border-blue-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold"
                                                placeholder="0812345678" value={formData.no_hp} onChange={handlePhoneChange} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                <div className="relative">
                                    <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input required={!initialData} type="password" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-[#C31A26] focus:bg-white transition-all text-xs font-bold"
                                        placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Role Akses</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['peserta', 'mentor', 'admin'].map((r) => (
                                        <button key={r} type="button" onClick={() => setFormData({...formData, role: r as any})}
                                            className={`py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${formData.role === r ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence>
                                {formData.role === 'mentor' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                                        <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Spesialisasi Mentor</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 text-xs">🎓</div>
                                            <input required type="text" className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/30 border-2 border-emerald-100 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs font-bold text-black"
                                                placeholder="Contoh: Menulis Fiksi" value={formData.spesialisasi} onChange={(e) => setFormData({...formData, spesialisasi: e.target.value})} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button type="submit" disabled={isSubmitting} className={`w-full py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 mt-2 text-white ${formData.role === 'mentor' ? 'bg-emerald-600' : formData.role === 'admin' ? 'bg-slate-900' : 'bg-[#C31A26]'}`}>
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
    const [searchTerm, setSearchTerm] = useState('');
    const [activeRoleFilter, setActiveRoleFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Sesi Anda telah berakhir.');
            const response = await userService.getAll(token);
            if (response.success && response.data) {
                setUsers(response.data);
            }
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (user: User) => {
        const dbId = (user as any).originalId || user.id;
        const role = String(user.role).toLowerCase();
        if (!confirm(`Hapus ${role} "${user.nama}"?`)) return;
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Token tidak ditemukan');
            if (role === 'mentor') await mentorService.delete(dbId.toString());
            else await userService.delete(dbId.toString(), token);
            fetchUsers();
        } catch (err: any) { alert(`Gagal: ${err.message}`); }
    };

    // FILTER LOGIC
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.nama.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = activeRoleFilter === 'all' || u.role.toLowerCase() === activeRoleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeStyle = (role: string) => {
        const r = role.toLowerCase();
        if (r === 'admin') return 'bg-red-50 border-red-100 text-[#C31A26]';
        if (r === 'mentor') return 'bg-emerald-50 border-emerald-100 text-emerald-600';
        return 'bg-indigo-50 border-indigo-100 text-indigo-600';
    };

    return (
        <Sidebar>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto space-y-6 px-2 md:px-0 pb-10">
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 text-black">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Akun</h1>
                        <p className="text-slate-500 font-bold text-xs md:text-sm">Kelola akses Pengguna LITERA.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                        <button onClick={() => { setSelectedUser(null); setIsModalOpen(true); }} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-black transition-all active:scale-95">
                            <UserPlus size={16} /> Add Member
                        </button>
                    </div>
                </header>

                {/* FILTER TOOLBAR */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="relative group flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C31A26] transition-colors" size={16} />
                        <input type="text" placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-[#C31A26] focus:bg-white transition-all font-bold text-xs text-black" />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-full md:w-auto overflow-x-auto">
                        {['all', 'peserta', 'mentor', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setActiveRoleFilter(role)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeRoleFilter === role ? 'bg-white text-[#C31A26] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {activeRoleFilter === role && <div className="w-1 h-1 bg-[#C31A26] rounded-full" />}
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] md:border md:border-slate-100 md:shadow-xl overflow-hidden text-black font-bold">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-[#C31A26] rounded-full animate-spin"></div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Syncing Cloud Database</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="min-w-full divide-y divide-slate-50">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                                        <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact & HP</th>
                                        <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[#C31A26] border-2 border-white shadow-sm uppercase text-xs">
                                                        {user.nama?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{user.nama}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">UID-{(user as any).originalId || user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Mail size={12} className="text-blue-400" />
                                                        <span className="text-[11px] font-bold">{user.email}</span>
                                                    </div>
                                                    {user.role === 'peserta' && (user as any).no_hp && (
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Phone size={12} className="text-emerald-400" />
                                                            <span className="text-[11px] font-bold">{(user as any).no_hp}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[8px] font-black uppercase border-2 ${getRoleBadgeStyle(String(user.role))}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button onClick={() => handleEdit(user)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"><Edit3 size={14} /></button>
                                                    <button onClick={() => handleDelete(user)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-[#C31A26] hover:text-white transition-all shadow-sm border border-slate-100"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <FilterIcon size={40} className="mx-auto text-slate-200 mb-4" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada user dengan role {activeRoleFilter}</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>

            <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedUser} onSuccess={fetchUsers} />
        </Sidebar>
    );
}