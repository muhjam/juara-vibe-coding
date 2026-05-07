/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
    transpilePackages: ["@untitledui/icons"],
};

export default nextConfig;
