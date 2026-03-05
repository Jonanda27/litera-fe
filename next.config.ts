/** @type {import('next').NextConfig} */
const nextConfig = {
  // Matikan Strict Mode untuk mencegah double-render saat development
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