import { NextRequest } from 'next/server';

// Web Standard API using Request/Response
export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();
    
    // Headers from the request
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const host = request.headers.get('host') || 'unknown';
    
    const healthData = {
      status: 'healthy',
      timestamp,
      uptime: `${Math.floor(uptime)}s`,
      version: '2.0.0-vercel',
      stack: {
        nextjs: '15.2',
        react: '19.0',
        typescript: '5.7',
        nodejs: process.version,
        runtime: 'vercel-edge'
      },
      request: {
        host,
        userAgent: userAgent.substring(0, 50) + '...',
        method: request.method,
        url: request.url
      },
      database: {
        status: 'connected', // TODO: Add real DB check
        type: 'postgresql'
      }
    };

    // Modern Response with proper headers
    return Response.json(healthData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-API-Version': '2.0.0',
        'X-Powered-By': 'Next.js 15.2 + Vercel Edge'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return Response.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': '2.0.0'
        }
      }
    );
  }
}

// Support other HTTP methods
export async function POST(request: NextRequest) {
  return Response.json(
    { message: 'Health endpoint supports GET only' },
    { status: 405 }
  );
}

// Edge runtime configuration
export const runtime = 'edge'; 