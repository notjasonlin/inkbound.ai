import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { corsMiddleware } from './middleware/cors'
import { securityMiddleware } from './middleware/security'

export async function middleware(request: NextRequest) {
  // Apply security headers first
  const securityResponse = securityMiddleware(request)
  
  // Apply CORS middleware
  const corsResponse = corsMiddleware(request)
  if (corsResponse.headers.get('Access-Control-Allow-Origin')) {
    return corsResponse
  }
  
  // Continue with session update
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}