import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { corsMiddleware } from "./middleware/cors";
import { securityMiddleware } from "./middleware/security";

export async function middleware(request: NextRequest) {
  //   // Apply security headers first
  //   const securityResponse = securityMiddleware(request)

  //   // Apply CORS middleware
  //   const corsResponse = corsMiddleware(request)
  //   if (corsResponse.headers.get('Access-Control-Allow-Origin')) {
  //     return corsResponse
  //   }

  //   // Continue with session update
  //   return await updateSession(request)
  // }

  // export const config = {
  //   matcher: [
  //     '/((?!_next/static|_next/image|favicon.ico).*)',
  //   ],

  // img-src 'self'
  //     "data:",
      // "https://*.stripe.com",
      // "https://*.vercel.live",
      // "https://*.vercel.app",
      // "https://vercel.live",

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspHeader = `
      default-src 'self';
      script-src 'self' 'https://apis.google.com', 'https://*.stripe.com', 'https://*.vercel.live', 'https://*.vercel.app', 'https://vercel.live' 'nonce-${nonce}';
      script-src-elem 'self' 'https://apis.google.com', 'https://*.stripe.com', 'https://*.vercel.live', 'https://*.vercel.app', 'https://vercel.live' 'nonce-${nonce}';
      style-src 'self' 'https://apis.google.com', 'https://*.stripe.com', 'https://*.vercel.live', 'https://*.vercel.app', 'https://vercel.live' 'nonce-${nonce}';
      img-src 'self' data: 'https://*.stripe.com', 'https://*.vercel.live', 'https://*.vercel.app', 'https://vercel.live';
      font-src 'self' 'https://fonts.gstatic.com', 'https://*.vercel.live';
      connect-src 'self' 'https://*.supabase.co', 'wss://*.supabase.co', 'https://api.openai.com', 'https://*.stripe.com','https://*.vercel.live', 'https://*.vercel.app', 'wss://*.vercel.live', 'https://vercel.live', 'https://accounts.google.com', 'https://*.pusher.com', 'wss://*.pusher.com';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      media-src 'self' 'https://*.vercel.live';
      upgrade-insecure-requests;
    `;

  // const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, " ");
  const contentSecurityPolicyHeaderValue = cspHeader.trim();


  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // requestHeaders.set(
  //   "Content-Security-Policy-Report-Only",
  //   contentSecurityPolicyHeaderValue
  // );

  requestHeaders.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  return response;
}