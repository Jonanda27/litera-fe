// src/lib/services/userService.ts

import { API_BASE_URL } from '../constans/constans';
import { ApiResponse, User, CreateUserPayload, UpdateUserPayload } from '../types/account';

const BASE_URL = API_BASE_URL;
const ENDPOINT = `${BASE_URL}/users`;

/**
 * Helper internal untuk menangani response fetch
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        // Mengambil pesan error dari backend jika ada, jika tidak gunakan status HTTP
        const errorMessage = data?.message || `HTTP Error: ${response.status}`;
        throw new Error(errorMessage);
    }

    return data as ApiResponse<T>;
}

/**
 * Helper untuk memastikan format token bersih sebelum dikirim.
 * Mencegah error "Struktur token tidak valid" akibat 'Bearer Bearer <token>'
 */
function getCleanToken(token: string): string {
    if (!token || token === 'undefined' || token === 'null') {
        throw new Error("Sesi tidak valid. Silakan login kembali.");
    }
    // Jika token sudah mengandung kata 'Bearer ', kita hapus agar tidak double
    return token.replace('Bearer ', '').trim();
}

export const userService = {
    /**
     * Mengambil daftar semua peserta
     */
    async getAll(token: string): Promise<ApiResponse<User[]>> {
        const cleanToken = getCleanToken(token);
        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanToken}`
            },
        });
        return handleResponse<User[]>(response);
    },

    /**
     * Mengambil detail peserta berdasarkan ID
     */
    async getById(id: string, token: string): Promise<ApiResponse<User>> {
        const cleanToken = getCleanToken(token);
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanToken}`
            },
        });
        return handleResponse<User>(response);
    },

    /**
     * Mendaftarkan peserta baru
     */
    async create(payload: CreateUserPayload, token: string): Promise<ApiResponse<User>> {
        const cleanToken = getCleanToken(token);
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanToken}`
            },
            body: JSON.stringify(payload),
        });
        return handleResponse<User>(response);
    },

    /**
     * Memperbarui data peserta
     */
    async update(id: string, payload: UpdateUserPayload, token: string): Promise<ApiResponse<User>> {
        const cleanToken = getCleanToken(token);
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanToken}`
            },
            body: JSON.stringify(payload),
        });
        return handleResponse<User>(response);
    },

    /**
     * Menonaktifkan atau menghapus peserta
     */
    async delete(id: string, token: string): Promise<ApiResponse<null>> {
        const cleanToken = getCleanToken(token);
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanToken}`
            },
        });
        return handleResponse<null>(response);
    }
};