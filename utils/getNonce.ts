import { headers } from 'next/headers'

export async function getNonce() {
  const hdrs = await headers();
  return hdrs.get('x-nonce') || "";
}