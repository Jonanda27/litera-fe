// src/lib/types/account.ts

/**
 * Standard API Response Wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>; // Untuk validasi error dari server
}

/**
 * Base Account Interface
 */
export interface BaseAccount {
    id: string;
    email: string;
    nama: string;
    role: 'admin' | 'peserta' | 'mentor';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Peserta (User) Entity
 */
export interface User extends BaseAccount {
    role: 'admin' | 'peserta';
    institution?: string;
    phoneNumber?: string;
}

/**
 * Mentor Entity
 */
export interface Mentor extends BaseAccount {
    role: 'mentor';
    specialization: string[];
    bio?: string;
    rating?: number;
}

/**
 * Payloads for User (Peserta)
 */
export type CreateUserPayload = Omit<User, 'id' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'> & {
    password?: string; // Optional if using OAuth, required if local auth
    role: 'admin' | 'peserta';
};

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>>;

/**
 * Payloads for Mentor
 */
export type CreateMentorPayload = Omit<Mentor, 'id' | 'role' | 'isActive' | 'createdAt' | 'updatedAt' | 'rating'> & {
    password?: string;
};

export type UpdateMentorPayload = Partial<Omit<CreateMentorPayload, 'password'>>;