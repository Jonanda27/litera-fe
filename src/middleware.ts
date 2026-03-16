import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. DISESUAIKAN: Gunakan nama 'token' sesuai dengan Login Page Anda
    const token = request.cookies.get('token')?.value;

    // 2. Proteksi Rute Admin
    if (pathname.startsWith('/admin')) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const payload = decodeJwtPayload(token);

        // 3. DISESUAIKAN: Gunakan 'admin' (huruf kecil) sesuai data Backend/Seeder
        if (!payload || payload.role !== 'admin') {
            const unauthorizedUrl = new URL('/login', request.url);
            unauthorizedUrl.searchParams.set('error', 'unauthorized');
            
            const response = NextResponse.redirect(unauthorizedUrl);
            // Pastikan hapus key yang benar
            response.cookies.delete('token'); 
            return response;
        }
    }

    // 4. Proteksi Rute Peserta (Agar aman)
    if (pathname.startsWith('/peserta')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        const payload = decodeJwtPayload(token);
        if (!payload || (payload.role !== 'peserta' && payload.role !== 'admin')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/peserta/:path*',
    ],
};