// src/lib/services/adminDashboardService.ts

import {
    DashboardSummaryResponse,
    DashboardSummaryData,
    MentorLogsResponse,
    DashboardChartsResponse,
    DashboardChartsData,
    RetentionResponse
} from '../types/dashboard';

// Mengambil Base URL dari environment variable. Pastikan fallback ke localhost untuk development.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const adminDashboardService = {
    /**
     * 1. Mengambil data metrik agregasi ringkasan dashboard Admin (KPI).
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
     * 2. Mengambil log aktivitas mentor dengan dukungan Paginasi & Filter (Fitur P0).
     * Diperbarui untuk mengembalikan MentorLogsResponse utuh agar metadata paginasi terbaca.
     */
    async getMentorLogs(
        token: string,
        page: number = 1,
        limit: number = 10,
        action?: string
    ): Promise<MentorLogsResponse> {
        if (!token) throw new Error('Otorisasi gagal: Token sesi tidak ditemukan.');

        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (action) queryParams.append('action', action);

            const response = await fetch(`${API_BASE_URL}/admin/dashboard/mentor-logs?${queryParams.toString()}`, {
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

            return result; // Mengembalikan objek MentorLogsResponse { status, message, data, meta }
        } catch (error: any) {
            console.error('[Service Layer] Error fetching Mentor Logs:', error);
            throw new Error(error.message || 'Terjadi kegagalan komunikasi dengan server.');
        }
    },

    /**
     * 3. Mengambil data agregasi untuk visualisasi grafik (Charts).
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
                cache: 'no-store'
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
     * 4. Mengirimkan notifikasi ke mentor atau mencatat log baru secara manual.
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
    },

    /**
     * 5. Mengambil analisis retensi peserta berisiko dan modul sulit.
     */
    async getRetentionAnalysis(token: string): Promise<RetentionResponse['data']> {
        if (!token) throw new Error('Token tidak ditemukan');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard/retention`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                cache: 'no-store'
            });

            const result: RetentionResponse = await response.json();
            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || 'Gagal memuat data retensi');
            }
            return result.data;
        } catch (error: any) {
            console.error('[Service Layer] Error fetching Retention Analysis:', error);
            throw new Error(error.message || 'Gagal terhubung ke server.');
        }
    },

    /**
     * 6. Mengirim pengingat WhatsApp ke peserta (Nudge).
     */
    async sendWhatsAppNudge(token: string, userId: number): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard/nudge-whatsapp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });
            return response.ok;
        } catch (error) {
            console.error('[Service Layer] Error sending WhatsApp Nudge:', error);
            return false;
        }
    }
};