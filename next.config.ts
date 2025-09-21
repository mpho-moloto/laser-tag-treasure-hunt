/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    // Only add rewrites if API_URL is properly set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl || apiUrl === 'undefined') {
      console.warn('NEXT_PUBLIC_API_URL not set, skipping rewrites');
      return [];
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig