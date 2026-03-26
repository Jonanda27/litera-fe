/** @type {import('next').NextConfig} */
const nextConfig = {
  // Matikan Strict Mode untuk mencegah double-render saat development
  reactStrictMode: false, 
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;