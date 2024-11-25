export function encryptId(id: string): string {
  // Basic encryption - you might want something more secure
  return Buffer.from(id).toString('base64');
}

export function decryptId(encrypted: string): string {
  // Basic decryption
  return Buffer.from(encrypted, 'base64').toString('ascii');
} 