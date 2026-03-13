// src/lib/services/mentorService.ts

import { ApiResponse, Mentor, CreateMentorPayload, UpdateMentorPayload } from '../types/account';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const ENDPOINT = `${BASE_URL}/mentors`;

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

export const mentorService = {
    /**
     * Mengambil daftar semua mentor (bisa ditambahkan query params untuk filter spesialisasi nantinya)
     */
    async getAll(params?: URLSearchParams): Promise<ApiResponse<Mentor[]>> {
        const queryString = params ? `?${params.toString()}` : '';
        const response = await fetch(`${ENDPOINT}${queryString}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse<Mentor[]>(response);
    },

    /**
     * Mengambil detail mentor beserta portofolio/rating berdasarkan ID
     */
    async getById(id: string): Promise<ApiResponse<Mentor>> {
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse<Mentor>(response);
    },

    /**
     * Mendaftarkan mentor baru
     */
    async create(payload: CreateMentorPayload): Promise<ApiResponse<Mentor>> {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return handleResponse<Mentor>(response);
    },

    /**
     * Memperbarui profil/spesialisasi mentor
     */
    async update(id: string, payload: UpdateMentorPayload): Promise<ApiResponse<Mentor>> {
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return handleResponse<Mentor>(response);
    },

    /**
     * Menonaktifkan status mentor
     */
    async delete(id: string): Promise<ApiResponse<null>> {
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse<null>(response);
    }
};