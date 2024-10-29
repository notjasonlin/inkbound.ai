/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Dynamic content - requires revalidation
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.openai.com https://*.stripe.com; frame-src 'self' https://*.stripe.com;"
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inkbound.ai'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'ETag',
            value: 'W/"dynamic"'
          }
        ],
      },
      {
        // Static assets with strong validation
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, stale-while-revalidate=86400'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          }
        ],
      },
      {
        // Media files with validation
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, stale-while-revalidate=86400'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          }
        ],
      },
      {
        // CSS and JS with validation
        source: '/_next/static/(css|chunks)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, stale-while-revalidate=86400'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          }
        ],
      }
    ]
  },
  poweredByHeader: false,
  generateEtags: true
}

module.exports = nextConfig
module.exports = nextConfig
module.exports = nextConfig
module.exports = nextConfig