import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { corsMiddleware } from "./middleware/cors";
import { securityMiddleware } from "./middleware/security";

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Define Content Security Policy with template strings and nonces
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
  requestHeaders.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue,
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue,
  );

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