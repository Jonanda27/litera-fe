// src/lib/types/dashboard.ts

// ============================================================================
// 1. ENTITAS: KPI & DASHBOARD SUMMARY
// ============================================================================

/**
 * Representasi murni dari data agregasi metrik dashboard (KPI).
 * Ditambahkan properti distribusiBuku untuk mendukung analitik Writing Workspace.
 */
export interface DashboardSummaryData {
    totalPeserta: number;
    totalMentor: number;
    totalAktivitasModulSelesai: number;
    rataRataProgresSistem: number;
    distribusiBuku: {
        fiksi: number;
        nonFiksi: number;
    };
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
 * Representasi metadata paginasi (Pagination).
 */
export interface PaginationMeta {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
}

/**
 * Representasi standar respons JSend API untuk daftar Log Mentor.
 * Diperbarui dengan dukungan properti meta untuk Pagination.
 */
export interface MentorLogsResponse {
    status: 'success' | 'error' | 'fail';
    message: string;
    data: MentorActivityLogData[];
    meta: PaginationMeta;
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


// ============================================================================
// 4. ENTITAS: RETENTION & RISK ANALYSIS
// ============================================================================

export interface RiskyUser {
    id: number;
    nama: string;
    no_hp: string;
    persentase_progres: number;
    createdAt: string;
}

export interface DifficultModule {
    module_id: number;
    total_stuck: number;
    module: {
        nama_modul: string;
    };
}

export interface RetentionResponse {
    message: string;
    status: 'success' | 'error';
    data: {
        riskyUsers: RiskyUser[];
        difficultModules: DifficultModule[];
    };
}