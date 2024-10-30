import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next()

  // Generate a random nonce using Web Crypto API
  const generateNonce = () => {
    const arr = new Uint8Array(16)
    crypto.getRandomValues(arr)
    return Array.from(arr, dec => dec.toString(16).padStart(2, '0')).join('')
  }

  const nonce = generateNonce()

  // Define CSP directives with nonce
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "https://apis.google.com",
      "https://*.stripe.com",
      "https://*.vercel.live",
      "https://*.vercel.app",
      "https://vercel.live",
      // Required for development only
      process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''
    ].filter(Boolean),
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'unsafe-inline'", // Needed for styled-components/emotion
      "https://fonts.googleapis.com",
      "https://*.vercel.live"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com",
      "https://*.vercel.live"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https://*.stripe.com",
      "https://*.vercel.live",
      "https://*.vercel.app",
      "https://vercel.live"
    ],
    'connect-src': [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://api.openai.com",
      "https://*.stripe.com",
      "https://*.vercel.live",
      "https://*.vercel.app",
      "wss://*.vercel.live",
      "https://vercel.live",
      "https://accounts.google.com",
      "https://*.pusher.com",
      "wss://*.pusher.com"
    ],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'report-uri': ["/api/csp-report"]
  }

  // Convert directives object to string
  const csp = Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')

  // Set security headers
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  )

  return response
} 