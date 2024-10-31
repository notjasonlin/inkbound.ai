import { headers } from 'next/headers'

export function getNonce() {
  return headers().get('x-nonce') || ''
} 