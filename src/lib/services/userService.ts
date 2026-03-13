// src/lib/services/userService.ts

import { ApiResponse, User, CreateUserPayload, UpdateUserPayload } from '../types/account';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const ENDPOINT = `${BASE_URL}/users`;

/**
 * Helper internal untuk menangani response fetch
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const errorMessage = data?.message || `HTTP Error: ${response.status}`;
        throw new Error(errorMessage, { cause: data?.errors });
    }

    return data as ApiResponse<T>;
}

export const userService = {
    /**
     * Mengambil daftar semua peserta
     */
    async getAll(): Promise<ApiResponse<User[]>> {
        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse<User[]>(response);
    },

    /**
     * Mengambil detail peserta berdasarkan ID
     */
    async getById(id: string): Promise<ApiResponse<User>> {
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse<User>(response);
    },

    /**
     * Mendaftarkan peserta baru
     */
    async create(payload: CreateUserPayload): Promise<ApiResponse<User>> {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return handleResponse<User>(response);
    },

    /**
     * Memperbarui data peserta
     */
    async update(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: 'PUT', // atau PATCH, sesuaikan dengan kontrak backend
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return handleResponse<User>(response);
    },

    /**
     * Menonaktifkan atau menghapus peserta
     */
    async delete(id: string): Promise<ApiResponse<null>> {
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse<null>(response);
    }
};