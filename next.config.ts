/** @type {import('next').NextConfig} */
const nextConfig = {
  // Wajib untuk Docker agar build efisien
  output: 'standalone',

  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;