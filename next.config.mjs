/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'https://YOUR_PROJECT_ID.supabase.co/auth/:path*',
      },
    ]
  },
}

export default nextConfig
