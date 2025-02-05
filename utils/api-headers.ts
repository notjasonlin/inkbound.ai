import { NextResponse } from 'next/server';

const allowedOrigins = [
  'https://inkbound.ai',
  'https://www.inkbound.ai',
  'https://staging.inkbound.ai',
  'https://app.inkbound.ai',
  'https://*.inkbound.ai',
  'https://*.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

export function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '';
  const isAllowed = allowedOrigins.some((allowed) =>
    allowed.includes('*')
      ? new RegExp(`^${allowed.replace('*', '.*')}$`).test(origin)
      : allowed === origin
  );

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'null', // Ensure it always returns a string
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Credentials': 'true', // Optional: Add if credentials are needed
  };
}


// Webhook-specific headers (no CORS needed)
export const webhookHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

// OPTIONS handler for CORS preflight requests
export async function handleOptions(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  return NextResponse.json({}, { headers: corsHeaders });
}
