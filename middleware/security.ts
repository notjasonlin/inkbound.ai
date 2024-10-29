import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.openai.com https://*.stripe.com; frame-src 'self' https://*.stripe.com;")
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  
  // Set appropriate Content-Type headers based on file extension
  const url = request.nextUrl.pathname
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