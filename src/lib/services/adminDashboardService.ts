// src/lib/services/adminDashboardService.ts

import { DashboardSummaryResponse, DashboardSummaryData } from '../types/dashboard';

// Mengambil Base URL dari environment variable. Pastikan fallback ke localhost untuk development.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const adminDashboardService = {
    /**
     * Mengambil data metrik agregasi ringkasan dashboard Admin.
     * Fungsi ini terisolasi murni untuk tugas pengumpulan data (High Cohesion).
     * * @param token - JWT Token untuk Bearer Authorization (Didapatkan dari state auth/cookie saat pemanggilan)
     * @returns Promise<DashboardSummaryData>
     * @throws Error dengan pesan aman untuk dikonsumsi UI
     */
    async getSummary(token: string): Promise<DashboardSummaryData> {
        // Validasi level layanan sebelum membebani jaringan
        if (!token) {
            throw new Error('Otorisasi gagal: Token sesi tidak ditemukan.');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Analisis Performa Next.js: 
                // Karena ini dashboard admin yang butuh akurasi data nyaris real-time,
                // kita menonaktifkan cache statis. Setiap request akan mengenai server.
                // Jika ingin sedikit meringankan beban db, bisa ubah ke: next: { revalidate: 60 } (Cache 1 menit)
                cache: 'no-store'
            });

            // Melakukan parsing JSON secara asinkron
            const result: DashboardSummaryResponse = await response.json();

            // Menangkap HTTP Error (4xx, 5xx) atau respons 'error' dari struktur JSend
            if (!response.ok || result.status !== 'success') {
                // Melempar pesan error spesifik dari backend jika ada, atau pesan standar
                throw new Error(result.message || `Gagal memuat data (Status HTTP: ${response.status})`);
            }

            // Mengembalikan secara spesifik bagian "data" agar komponen UI tidak perlu tahu menahu soal format JSend
            return result.data;

        } catch (error: any) {
            // Isolasi error log: Menyembunyikan stack trace asli dari layar pengguna 
            // tetapi tetap mencatatnya di konsol untuk keperluan penelusuran (debugging) analis.
            console.error('[Service Layer] Error fetching Dashboard Summary:', error);

            // Normalisasi error yang akan ditangkap oleh blok try-catch di UI Component
            throw new Error(error.message || 'Terjadi kegagalan komunikasi dengan server.');
        }
    }
};