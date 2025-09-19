import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        unoptimized: false, // Enable optimization but allow unoptimized when needed
        formats: ["image/webp", "image/avif"], // Modern formats
    },
};

export default nextConfig;
