import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { corsMiddleware } from './middleware/cors'

export async function middleware(request: NextRequest) {
  // Apply CORS middleware first
  const corsResponse = corsMiddleware(request);
  if (corsResponse.headers.get('Access-Control-Allow-Origin')) {
    return corsResponse;
  }
  
  // Continue with session update
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/:path* (API routes)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/:path*'
  ],
}