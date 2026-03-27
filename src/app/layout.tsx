import type { Metadata } from "next";
import "./globals.css";
import { MeetingProvider } from "@/lib/constans/context/MeetingContext";
import GlobalMeetingWrapper from "@/lib/constans/context/GlobalMeetingWrapper";

// IMPORT PROVIDER DAN WRAPPER
// Ingat: Sesuaikan path "@/" di bawah ini dengan lokasi folder tempat kamu menyimpan file-nya!


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
      <body className="antialiased">
        {/* Bungkus seluruh aplikasi dengan MeetingProvider */}
        <MeetingProvider>
          {children}

          {/* Komponen ini akan standby di background dan muncul saat meeting aktif */}
          <GlobalMeetingWrapper />
        </MeetingProvider>
      </body>
    </html>
  );
}