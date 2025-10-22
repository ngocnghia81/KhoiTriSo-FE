import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        unoptimized: false, // Enable optimization but allow unoptimized when needed
        formats: ["image/webp", "image/avif"], // Modern formats
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'platform-lookaside.fbsbx.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
                port: '',
                pathname: '/**',
            }
        ],
    },
};

export default nextConfig;
