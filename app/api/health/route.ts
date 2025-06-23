import { NextRequest } from 'next/server';
import { Pool } from 'pg';

// Database connection (replaces db/index.cjs)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Web Standard API using Request/Response
export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();
    
    // Headers from the request
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const host = request.headers.get('host') || 'unknown';
    
    // Test database connectivity
    let databaseStatus = 'unknown';
    let databaseError = null;
    
    try {
      const dbStart = Date.now();
      const result = await pool.query('SELECT NOW() as current_time, version() as version');
      const dbEnd = Date.now();
      
      databaseStatus = 'connected';
      console.log('[Health API] Database check successful:', {
        responseTime: `${dbEnd - dbStart}ms`,
        currentTime: result.rows[0].current_time,
      });
    } catch (error) {
      databaseStatus = 'error';
      databaseError = error instanceof Error ? error.message : 'Unknown database error';
      console.error('[Health API] Database check failed:', error);
    }
    
    const healthData = {
      status: databaseStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp,
      uptime: `${Math.floor(uptime)}s`,
      version: '2.0.0-vercel',
      stack: {
        nextjs: '15.3.4',
        react: '19.1.0',
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
        status: databaseStatus,
        type: 'postgresql',
        provider: 'neon',
        error: databaseError
      }
    };

    // Return appropriate status code based on health
    const statusCode = databaseStatus === 'connected' ? 200 : 503;

    // Modern Response with proper headers
    return Response.json(healthData, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-API-Version': '2.0.0',
        'X-Powered-By': 'Next.js 15.3 + Vercel Edge'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return Response.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
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

// Edge runtime configuration (removed for database compatibility)
// export const runtime = 'edge'; 