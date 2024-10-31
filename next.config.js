/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    // Disable React Refresh in development
    if (dev) {
      config.plugins = config.plugins.filter(
        (plugin) => 
          plugin.constructor.name !== 'ReactFreshWebpackPlugin' &&
          plugin.constructor.name !== 'HotModuleReplacementPlugin'
      );
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live 'nonce-{nonce}' 'strict-dynamic'",
              "script-src-elem 'self' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live 'nonce-{nonce}' 'strict-dynamic'",
              "style-src 'self' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live 'nonce-{nonce}'",
              "style-src-elem 'self' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live 'nonce-{nonce}'",
              "img-src 'self' data: https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live",
              "font-src 'self' https://fonts.gstatic.com https://*.vercel.live",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.stripe.com https://*.vercel.live https://*.vercel.app wss://*.vercel.live https://vercel.live https://accounts.google.com https://*.pusher.com wss://*.pusher.com http://localhost:3000",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "media-src 'self' https://*.vercel.live",
              "upgrade-insecure-requests"
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
  },
};

module.exports = nextConfig;
