import { createHash } from 'crypto';

export function getAssetHeaders(filePath: string, content: Buffer) {
  const hash = createHash('md5').update(content).digest('hex');
  
  const headers = new Headers();
  headers.set('ETag', `"${hash}"`);
  
  if (filePath.match(/\.(jpg|jpeg|png|gif|ico|svg)$/i)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (filePath.match(/\.(css|js)$/i)) {
    headers.set('Cache-Control', 'public, max-age=31536000, must-revalidate');
  } else if (filePath.match(/\.(woff2|ttf|otf)$/i)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    headers.set('Cache-Control', 'no-cache, must-revalidate');
  }
  
  headers.set('Vary', 'Accept-Encoding');
  return headers;
} 