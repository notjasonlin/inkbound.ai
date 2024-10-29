import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const url = request.nextUrl.pathname
  
  // Set cache control based on route type
  if (url.startsWith('/api/') || url.startsWith('/auth/') || url.includes('/dashboard/')) {
    // No caching for sensitive routes
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  } else if (url.startsWith('/_next/static/')) {
    // Long-term caching for static assets
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (url.startsWith('/images/')) {
    // Short-term caching for images with revalidation
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=31536000')
  } else {
    // Default - no caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  }
  
  // Remove server information
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.openai.com https://*.stripe.com; frame-src 'self' https://*.stripe.com;")
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  
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