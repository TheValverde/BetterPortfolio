import { NextRequest, NextResponse } from 'next/server';

// LAN IP ranges that should have access to admin routes
const ALLOWED_IP_RANGES = [
  '192.168.0.0/16',    // Private network
  '10.0.0.0/8',        // Private network
  '172.16.0.0/12',     // Private network
  '127.0.0.1',         // Localhost
  '::1',               // IPv6 localhost
];

function isIPInRange(ip: string, range: string): boolean {
  if (range.includes('/')) {
    // CIDR notation
    const [rangeIP, prefixLength] = range.split('/');
    const ipNum = ipToNumber(ip);
    const rangeNum = ipToNumber(rangeIP);
    const mask = (0xffffffff << (32 - parseInt(prefixLength))) >>> 0;
    
    return (ipNum & mask) === (rangeNum & mask);
  } else {
    // Exact match
    return ip === range;
  }
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

function getClientIP(request: NextRequest): string {
  // Check various headers for the real client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to localhost
  return '127.0.0.1';
}

function isAllowedIP(ip: string): boolean {
  // Handle IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return true;
  }
  
  // Handle IPv4-mapped IPv6 addresses
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  return ALLOWED_IP_RANGES.some(range => isIPInRange(ip, range));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is an admin route
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const clientIP = getClientIP(request);
    
    console.log(`Admin access attempt from IP: ${clientIP} to ${pathname}`);
    
    if (!isAllowedIP(clientIP)) {
      console.log(`Blocked admin access from IP: ${clientIP} to ${pathname}`);
      return new NextResponse('Access Denied: Admin routes are restricted to local network only.', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    console.log(`Allowed admin access from IP: ${clientIP} to ${pathname}`);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
