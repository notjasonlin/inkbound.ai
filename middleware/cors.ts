import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'https://inkbound.ai',
  // Add any other trusted domains here
];

export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Return early if it's not an allowed origin and it's not a preflight request
  if (!isAllowedOrigin && request.method !== 'OPTIONS') {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Set CORS headers only for allowed origins
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}