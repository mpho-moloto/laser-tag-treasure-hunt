/** @type {import('next').NextConfig} */

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}
const nextConfig = {
  turbopack: {
    root: process.cwd(), // Set root to project directory
  },
};

export default nextConfig;
