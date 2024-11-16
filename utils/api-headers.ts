import { NextResponse } from 'next/server';

// Standard API headers for security and caching
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

// Webhook-specific headers (no CORS needed)
export const webhookHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

// OPTIONS handler for CORS preflight requests
export async function handleOptions() {
  return NextResponse.json({}, { headers: corsHeaders });
} 