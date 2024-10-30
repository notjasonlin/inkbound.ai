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
  
  // Use nonces for inline scripts and styles in production
  const nonce = crypto.randomBytes(16).toString('base64');
  
  response.headers.set('Content-Security-Policy', 
    [
      // Default fallback
      "default-src 'self'",
      
      // Scripts - remove unsafe-inline in production
      process.env.NODE_ENV === 'production'
        ? `script-src 'self' 'nonce-${nonce}' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live`
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live",
      
      // Styles - use hashes instead of unsafe-inline
      "style-src 'self' https://fonts.googleapis.com https://*.vercel.live",
      "style-src-elem 'self' https://fonts.googleapis.com https://*.vercel.live",
      
      // Fonts
      "font-src 'self' https://fonts.gstatic.com https://*.vercel.live",
      
      // Images - more specific than wildcard
      "img-src 'self' data: https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live",
      
      // Connect sources
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.stripe.com https://*.vercel.live https://*.vercel.app wss://*.vercel.live https://vercel.live https://accounts.google.com",
      
      // Frames
      "frame-src 'self' https://*.stripe.com https://*.vercel.live https://vercel.live https://accounts.google.com",
      "frame-ancestors 'none'",
      
      // Media
      "media-src 'self' https://*.vercel.live",
      
      // Forms
      "form-action 'self'",
      
      // Object sources
      "object-src 'none'",
      
      // Base URI
      "base-uri 'self'",
      
      // Manifest
      "manifest-src 'self'",
      
      // Worker sources
      "worker-src 'self'",
      
      // Prefetch
      "prefetch-src 'self'",
      
      // Navigation
      "navigate-to 'self'"
    ].join('; ')
  );
  
  // Add other security headers
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