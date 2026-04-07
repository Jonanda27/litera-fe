import type { Metadata } from "next";
import "./globals.css";
import { MeetingProvider } from "@/lib/constans/context/MeetingContext";
import GlobalJitsiWrapper from "@/lib/constans/context/GlobalJitsiWrapper";
import Script from "next/script"; // Import Script

export const metadata: Metadata = {
  title: "LITERA - Literasi Untuk Semua",
  description: "Platform pembelajaran literasi membaca dan menulis untuk mengembangkan kemampuan berpikir kritis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Tambahkan Script Midtrans Snap (Sandbox mode) */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="Mid-client-6tlrMY13kNoFhcCt" // Ganti sesuai Client Key Anda
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased">
        <MeetingProvider>
          {children}
          <GlobalJitsiWrapper />
        </MeetingProvider>
      </body>
    </html>
  );
}