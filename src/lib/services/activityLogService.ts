// File: src/lib/services/activityLogService.ts

import { ActivityLogResponse, ActivityLogFilters } from '../types/activity';

/**
 * URL basis API. Disesuaikan dengan env aplikasi Anda.
 * Jika Anda menggunakan Vite, gunakan import.meta.env.VITE_API_URL.
 * Jika Next.js, gunakan process.env.NEXT_PUBLIC_API_URL.
 * Untuk sementara di-hardcode ke localhost sesuai konteks backend Anda.
 */
const API_BASE_URL = 'http://localhost:4000/api';

class ActivityLogService {
    /**
     * Mengambil data log aktivitas dari backend dengan parameter filter dan pagination.
     * @param {ActivityLogFilters} filters Objek berisi kriteria filter dan halaman
     * @param {string} token JWT token untuk otorisasi (wajib untuk endpoint admin)
     * @returns {Promise<ActivityLogResponse>}
     */
    static async getLogs(filters: ActivityLogFilters, token: string): Promise<ActivityLogResponse> {
        try {
            // 1. Membangun Query String secara dinamis (High Cohesion)
            const queryParams = new URLSearchParams();

            if (filters.page) queryParams.append('page', filters.page.toString());
            if (filters.limit) queryParams.append('limit', filters.limit.toString());
            if (filters.userId) queryParams.append('userId', filters.userId.toString());
            if (filters.action) queryParams.append('action', filters.action);
            if (filters.resourceType) queryParams.append('resourceType', filters.resourceType);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);

            const queryString = queryParams.toString();
            const endpoint = `${API_BASE_URL}/activity-logs${queryString ? `?${queryString}` : ''}`;

            // 2. Eksekusi HTTP Request
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Endpoint log aktivitas dilindungi
                }
            });

            // 3. Evaluasi Respons HTTP
            if (!response.ok) {
                // Menangkap status 4xx dan 5xx agar dilempar ke catch block
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP Error: ${response.status}`);
            }

            // 4. Konversi dan Validasi Tipe Data Contract
            const responseData: ActivityLogResponse = await response.json();
            return responseData;

        } catch (error: any) {
            console.error('[ActivityLogService] Gagal mengambil data log:', error.message);

            // Re-throw error agar dapat ditangkap oleh State Manager (seperti React Query/Zustand)
            // untuk memicu UI error state (misal: memunculkan toast notification)
            throw new Error(error.message || 'Gagal terhubung ke server');
        }
    }
}

export default ActivityLogService;