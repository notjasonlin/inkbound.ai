import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHash } from 'crypto';
import crypto from 'crypto';

export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const url = request.nextUrl.pathname
  
  // Generate ETag based on content (simplified example)
  const generateETag = (content: string) => {
    return createHash('md5').update(content).digest('hex');
  }
  
  if (url.startsWith('/api/') || url.includes('/dashboard/')) {
    // Dynamic content - requires validation
    response.headers.set('Cache-Control', 'no-cache, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Vary', 'Authorization, Accept-Encoding')
  } else if (url.startsWith('/_next/static/')) {
    // Static assets with validation
    const isImmutableAsset = url.includes('/media/') || url.includes('.woff2');
    response.headers.set('Cache-Control', 
      isImmutableAsset 
        ? 'public, max-age=31536000, immutable' 
        : 'public, max-age=31536000, must-revalidate'
    )
    response.headers.set('Vary', 'Accept-Encoding')
  } else {
    // Default - validate always
    response.headers.set('Cache-Control', 'no-cache, must-revalidate, private')
    response.headers.set('Vary', 'Accept-Encoding')
  }
  
  // Remove server information
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  
  // Generate nonce using Web Crypto API
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);
  const nonce = btoa(Array.from(array).map(byte => String.fromCharCode(byte)).join(''));
  
  response.headers.set('Content-Security-Policy', 
    [
      "default-src 'self'",
      
      // Scripts - add unsafe-inline for production to handle Vercel's inline scripts
      process.env.NODE_ENV === 'production'
        ? "script-src 'self' 'unsafe-inline' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live",
      
      // Styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.live",
      // Add vercel.live/fonts to style-src-elem
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.live https://vercel.live/_next-live/ https://vercel.live/_next-live/feedback/ https://vercel.live/fonts",
      
      "font-src 'self' https://fonts.gstatic.com https://*.vercel.live",
      "img-src 'self' data: https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live",
      // Add Pusher domains to connect-src
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
  );
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
  
  // Set appropriate Content-Type headers based on file extension
  if (url.endsWith('.js')) {
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8')
  } else if (url.endsWith('.css')) {
    response.headers.set('Content-Type', 'text/css; charset=utf-8')
  } else if (url.endsWith('.woff2')) {
    response.headers.set('Content-Type', 'font/woff2')
  } else if (url.endsWith('.json')) {
    response.headers.set('Content-Type', 'application/json; charset=utf-8')
  } else if (url.endsWith('.xml')) {
    response.headers.set('Content-Type', 'application/xml; charset=utf-8')
  } else if (url.endsWith('.txt')) {
    response.headers.set('Content-Type', 'text/plain; charset=utf-8')
  }
  
  return response
} 