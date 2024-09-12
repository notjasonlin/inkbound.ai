/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
