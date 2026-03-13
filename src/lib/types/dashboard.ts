// src/lib/types/dashboard.ts

/**
 * Representasi murni dari data agregasi metrik dashboard.
 */
export interface DashboardSummaryData {
    totalPeserta: number;
    totalMentor: number;
    totalAktivitasModulSelesai: number;
    rataRataProgresSistem: number;
}

/**
 * Representasi standar dari selubung (wrapper) respons JSend API kita.
 */
export interface DashboardSummaryResponse {
    status: 'success' | 'error' | 'fail';
    message: string;
    data: DashboardSummaryData;
}