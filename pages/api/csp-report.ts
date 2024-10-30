import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Log CSP violations - replace with your logging solution
    console.error('CSP Violation:', {
      blockedURI: req.body['csp-report']?.['blocked-uri'],
      violatedDirective: req.body['csp-report']?.['violated-directive'],
      documentURI: req.body['csp-report']?.['document-uri'],
      timestamp: new Date().toISOString()
    })
    
    res.status(204).end()
  } else {
    res.status(405).end()
  }
}
