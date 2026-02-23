import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
