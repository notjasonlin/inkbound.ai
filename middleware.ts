import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const allowedOrigins = [
  'https://inkbound.ai',
  'https://www.inkbound.ai',
  'https://staging.inkbound.ai',
  'https://app.inkbound.ai',
  'https://*.inkbound.ai',          // Covers all subdomains
  'https://*.vercel.app',           // For Vercel preview deployments
  'http://localhost:3000',          // Local development
  'http://localhost:3001',          // Alternative local port
  process.env.NEXT_PUBLIC_FRONTEND_URL,
  process.env.NEXT_PUBLIC_API_URL
].filter(Boolean) as string[];

export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Generate nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Define Content Security Policy
  let cspHeader = `
    default-src 'self';
    script-src 'self' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live 'nonce-${nonce}' 'strict-dynamic';
    script-src-elem 'self' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live 'nonce-${nonce}';
    style-src-elem 'self' https://apis.google.com https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live 'nonce-${nonce}';
    img-src 'self' data: https://*.stripe.com https://*.vercel.live https://*.vercel.app https://vercel.live;
    font-src 'self' https://fonts.gstatic.com https://*.vercel.live;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.stripe.com https://*.vercel.live https://*.vercel.app wss://*.vercel.live https://vercel.live https://accounts.google.com https://*.pusher.com wss://*.pusher.com http://localhost:3000;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    media-src 'self' https://*.vercel.live;
    upgrade-insecure-requests;
  `;

  // Remove any extra spaces or newline characters
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s+/g, " ").trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set all security headers
  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
  );

  // Handle CORS for actual requests
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};