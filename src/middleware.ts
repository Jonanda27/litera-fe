// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Helper internal untuk men-dekode payload JWT di lingkungan Edge.
 * Diperlukan karena library seperti 'jsonwebtoken' tidak berjalan di Edge Runtime Next.js.
 */
function decodeJwtPayload(token: string) {
    try {
        // Memisahkan header, payload, dan signature
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        // Normalisasi base64 url
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // Decode base64 dan escape karakter URI
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Gagal men-dekode token:', error);
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // 1. Identifikasi cookie token (Sesuaikan dengan key cookie yang diset saat login)
    const token = request.cookies.get('accessToken')?.value;

    // 2. Proteksi Rute: Semua rute di bawah /admin
    if (pathname.startsWith('/admin')) {

        // Skenario A: Tidak ada token sama sekali
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            // Menyimpan niat awal user agar bisa di-redirect kembali setelah login sukses
            loginUrl.searchParams.set('callbackUrl', encodeURI(pathname));
            return NextResponse.redirect(loginUrl);
        }

        // Skenario B: Token ada, ekstraksi klaim/payload
        const payload = decodeJwtPayload(token);

        // Skenario C: Token tidak valid atau Role bukan ADMIN
        if (!payload || payload.role !== 'ADMIN') {
            // Catatan Analis: Arahkan ke /login dengan flag error, atau ke halaman 403 Forbidden.
            // Di sini kita arahkan ke login dan paksa pembersihan sesi di klien.
            const unauthorizedUrl = new URL('/login', request.url);
            unauthorizedUrl.searchParams.set('error', 'unauthorized');

            // Mengembalikan response redirect sekaligus menghapus cookie yang tidak valid/tidak berhak
            const response = NextResponse.redirect(unauthorizedUrl);
            response.cookies.delete('accessToken');
            return response;
        }
    }

    // 3. Jika bukan rute yang diproteksi atau validasi lolos, lanjutkan request
    return NextResponse.next();
}

/**
 * Konfigurasi Matcher:
 * Menerapkan prinsip efisiensi. Middleware HANYA akan dieksekusi oleh Next.js 
 * jika request path cocok dengan pola di bawah ini. Hal ini mencegah overhead 
 * pada pemanggilan aset statis (gambar, css) atau halaman publik.
 */
export const config = {
    matcher: [
        /*
         * Match semua request paths di bawah /admin/
         * Contoh: /admin/users, /admin/mentors, dll.
         */
        '/admin/:path*',
    ],
};