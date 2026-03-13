// File: src/lib/types/activity.ts

/**
 * Representasi entitas ActivityLog dari Backend.
 */
export interface ActivityLog {
    id: number;
    userId: string | number; // Menyesuaikan tipe ID di tabel User Anda
    action: string;
    resourceType: string;
    resourceId?: string | number | null;
    details?: Record<string, any>; // Mengakomodasi JSONB/Object dinamis
    createdAt: string; // Direpresentasikan sebagai ISO string dari backend
    updatedAt?: string;
}

/**
 * Representasi metadata paginasi yang dikembalikan oleh Backend.
 */
export interface PaginationMeta {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Struktur kontrak balikan (Response Contract) dari endpoint GET /api/activity-logs.
 */
export interface ActivityLogResponse {
    success: boolean;
    message: string;
    data: ActivityLog[];
    meta: PaginationMeta;
}

/**
 * Parameter dinamis yang diizinkan untuk dikirim sebagai Query String ke API.
 */
export interface ActivityLogFilters {
    page?: number;
    limit?: number;
    userId?: string | number;
    action?: string;
    resourceType?: string;
    startDate?: string; // Format: YYYY-MM-DD
    endDate?: string;   // Format: YYYY-MM-DD
}