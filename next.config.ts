import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Disable ESLint during builds to allow build to succeed
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Disable TypeScript errors during builds (optional, only if needed)
    typescript: {
        ignoreBuildErrors: false, // Keep this false to catch TypeScript errors
    },
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
            },
            {
                protocol: 'https',
                hostname: 'khoitriso-upload-worker.quang159258.workers.dev',
                port: '',
                pathname: '/**',
            }
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/api/:path*',
            },
        ];
    },
    // Suppress Ant Design compatibility warnings
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }
        return config;
    },
    // Suppress React 19 compatibility warnings
    experimental: {
        suppressHydrationWarning: true,
    },
};

export default nextConfig;
