// src/lib/types/dashboard.ts

// ============================================================================
// 1. ENTITAS: KPI & DASHBOARD SUMMARY
// ============================================================================

/**
 * Representasi murni dari data agregasi metrik dashboard (KPI).
 */
export interface DashboardSummaryData {
    totalPeserta: number;
    totalMentor: number;
    totalAktivitasModulSelesai: number;
    rataRataProgresSistem: number;
}

/**
 * Representasi standar dari selubung (wrapper) respons JSend API untuk Summary.
 */
export interface DashboardSummaryResponse {
    status: 'success' | 'error' | 'fail';
    message: string;
    data: DashboardSummaryData;
}


// ============================================================================
// 2. ENTITAS: MENTOR OVERSIGHT & LOGS
// ============================================================================

/**
 * Representasi relasi data Mentor di dalam log.
 */
export interface MentorInfo {
    id: number;
    nama: string;
    email: string;
}

/**
 * Representasi relasi data User (Peserta) target di dalam log.
 */
export interface TargetUserInfo {
    id: number;
    nama: string;
}

/**
 * Representasi data tunggal untuk log aktivitas mentor.
 */
export interface MentorActivityLogData {
    id: number;
    mentor_id: number | null; // Nullable karena log bisa berupa notifikasi sistem global
    action: string;
    description: string;
    createdAt: string; // ISO 8601 Date String dari database
    updatedAt: string;
    mentor?: MentorInfo; // Optional jika di-include dari relasi ORM
    targetUser?: TargetUserInfo; // Optional jika di-include dari relasi ORM
}

/**
 * Representasi standar respons JSend API untuk daftar Log Mentor.
 */
export interface MentorLogsResponse {
    status: 'success' | 'error' | 'fail';
    message: string;
    data: MentorActivityLogData[];
}


// ============================================================================
// 3. ENTITAS: VISUALISASI DATA (CHARTS)
// ============================================================================

/**
 * Representasi perbandingan interaksi teks dan video.
 */
export interface MentoringRatio {
    textDiscussion: number;
    faceToFace: number;
}

/**
 * Representasi data time-series untuk tren pendaftaran per bulan.
 */
export interface RegistrationTrend {
    month: number; // Tergantung query BE, bisa berupa angka bulan (1-12) atau string nama bulan
    count: number;
}

/**
 * Representasi murni dari payload data grafik dashboard.
 */
export interface DashboardChartsData {
    mentoringRatio: MentoringRatio;
    registrationTrend: RegistrationTrend[];
}

/**
 * Representasi standar respons JSend API untuk Visualisasi Grafik.
 */
export interface DashboardChartsResponse {
    status: 'success' | 'error' | 'fail';
    message: string;
    data: DashboardChartsData;
}