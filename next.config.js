/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['localhost'],
    },
    env: {
        // Remove /api suffix as it's added in the API endpoints
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL 
            ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
            : 'https://savings-2-ckrp.onrender.com',
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: false,
            },
        ];
    },
}

module.exports = nextConfig
