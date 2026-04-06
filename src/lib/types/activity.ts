// src/lib/types/activity.ts

/**
 * Representasi entitas ActivityLog dari Backend.
 */
export interface ActivityLog {
    id: number;
    userId: string | number;
    action: string;
    resourceType: string;
    resourceId?: string | number | null;
    details?: Record<string, any>; // Mengakomodasi JSONB/Object dinamis
    createdAt: string; // Direpresentasikan sebagai ISO string dari backend
    updatedAt?: string;
}

/**
 * Representasi metadata paginasi yang dikembalikan oleh Backend.
 * Skema ini sedikit lebih mendetail dari PaginationMeta di dashboard.ts
 * untuk mempermudah rendering tombol "Next" dan "Previous" di UI.
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
 * Diselaraskan menggunakan standar JSend API Format.
 */
export interface ActivityLogResponse {
    status: 'success' | 'error' | 'fail';
    message: string;
    data: ActivityLog[];
    meta: PaginationMeta;
}

/**
 * Parameter dinamis yang diizinkan untuk dikirim sebagai Query String ke API (Fitur P0).
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