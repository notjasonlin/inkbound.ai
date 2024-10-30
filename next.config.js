/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              process.env.NODE_ENV === 'production'
                ? "script-src 'self' 'unsafe-inline' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.live",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.live https://vercel.live/_next-live/ https://vercel.live/_next-live/feedback/ https://vercel.live/fonts",
              "font-src 'self' https://fonts.gstatic.com https://*.vercel.live",
              "img-src 'self' data: https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.stripe.com https://*.vercel.live https://*.vercel.app wss://*.vercel.live https://vercel.live https://accounts.google.com https://*.pusher.com wss://*.pusher.com",
              "frame-src 'self' https://*.stripe.com https://*.vercel.live https://vercel.live https://accounts.google.com",
              "frame-ancestors 'none'",
              "media-src 'self' https://*.vercel.live",
              "form-action 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "manifest-src 'self'",
              "worker-src 'self'"
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
