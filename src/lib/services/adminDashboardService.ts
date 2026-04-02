// src/lib/services/adminDashboardService.ts

import {
    DashboardSummaryResponse,
    DashboardSummaryData,
    MentorLogsResponse,
    MentorActivityLogData,
    DashboardChartsResponse,
    DashboardChartsData
} from '../types/dashboard';

// Mengambil Base URL dari environment variable. Pastikan fallback ke localhost untuk development.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const adminDashboardService = {
    /**
     * 1. Mengambil data metrik agregasi ringkasan dashboard Admin (KPI).
     * @param token - JWT Token untuk Bearer Authorization
     * @returns Promise<DashboardSummaryData>
     */
    async getSummary(token: string): Promise<DashboardSummaryData> {
        if (!token) throw new Error('Otorisasi gagal: Token sesi tidak ditemukan.');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Dasbor butuh data presisi tinggi, cache dimatikan
                cache: 'no-store'
            });

            const result: DashboardSummaryResponse = await response.json();

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || `Gagal memuat data (Status HTTP: ${response.status})`);
            }

            return result.data;
        } catch (error: any) {
            console.error('[Service Layer] Error fetching Dashboard Summary:', error);
            throw new Error(error.message || 'Terjadi kegagalan komunikasi dengan server.');
        }
    },

    /**
     * 2. Mengambil log aktivitas dan notifikasi seluruh mentor.
     * @param token - JWT Token untuk Bearer Authorization
     * @returns Promise<MentorActivityLogData[]>
     */
    async getMentorLogs(token: string): Promise<MentorActivityLogData[]> {
        if (!token) throw new Error('Otorisasi gagal: Token sesi tidak ditemukan.');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard/mentor-logs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                cache: 'no-store'
            });

            const result: MentorLogsResponse = await response.json();

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || `Gagal memuat log mentor (Status HTTP: ${response.status})`);
            }

            return result.data;
        } catch (error: any) {
            console.error('[Service Layer] Error fetching Mentor Logs:', error);
            throw new Error(error.message || 'Terjadi kegagalan komunikasi dengan server.');
        }
    },

    /**
     * 3. Mengambil data agregasi untuk visualisasi grafik (Charts).
     * @param token - JWT Token untuk Bearer Authorization
     * @returns Promise<DashboardChartsData>
     */
    async getCharts(token: string): Promise<DashboardChartsData> {
        if (!token) throw new Error('Otorisasi gagal: Token sesi tidak ditemukan.');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard/charts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                cache: 'no-store' // Bisa diubah ke next: { revalidate: 3600 } jika grafik tidak perlu real-time
            });

            const result: DashboardChartsResponse = await response.json();

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || `Gagal memuat data grafik (Status HTTP: ${response.status})`);
            }

            return result.data;
        } catch (error: any) {
            console.error('[Service Layer] Error fetching Dashboard Charts:', error);
            throw new Error(error.message || 'Terjadi kegagalan komunikasi dengan server.');
        }
    },

    /**
     * 4. Mengirimkan notifikasi ke mentor atau mencatat log baru secara manual dari Admin.
     * @param token - JWT Token untuk Bearer Authorization
     * @param payload - Data notifikasi (mentorId opsional untuk broadcast)
     * @returns Promise<boolean> - Mengembalikan true jika berhasil
     */
    async sendMentorNotification(
        token: string,
        payload: { mentorId?: number | null; action: string; description: string }
    ): Promise<boolean> {
        if (!token) throw new Error('Otorisasi gagal: Token sesi tidak ditemukan.');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard/mentor-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || `Gagal mengirim notifikasi (Status HTTP: ${response.status})`);
            }

            return true;
        } catch (error: any) {
            console.error('[Service Layer] Error sending mentor notification:', error);
            throw new Error(error.message || 'Terjadi kegagalan komunikasi dengan server.');
        }
    }
};