/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
    transpilePackages: ["@untitledui/icons"],
};

export default nextConfig;
