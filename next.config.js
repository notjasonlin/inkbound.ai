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
              "default-src 'none'",
              "script-src 'self' 'nonce-{nonce}' 'strict-dynamic'",
              "script-src-elem 'self' 'nonce-{nonce}' 'strict-dynamic'",
              "style-src 'self' 'nonce-{nonce}'",
              "style-src-elem 'self' 'nonce-{nonce}'",
              "img-src 'self' blob: data:",
              "font-src 'self' https://fonts.gstatic.com https://*.vercel.live",
              "connect-src 'self' https://tvjclbhclyozgziixpcp.supabase.co wss://tvjclbhclyozgziixpcp.supabase.co https://api.openai.com https://accounts.google.com https://vitals.vercel-insights.com",
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
