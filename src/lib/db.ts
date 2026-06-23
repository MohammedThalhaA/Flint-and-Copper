import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Make sure you have an .env or .env.local file.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  // Give Neon enough time to wake up from a cold start (can take ~5s)
  connectionTimeoutMillis: 30_000,
  // Retire idle connections before Neon's server-side timeout kills them
  idleTimeoutMillis: 20_000,
});

// Swallow pool-level ECONNRESET so it doesn't crash the process
pool.on('error', (err) => {
  const code = (err as NodeJS.ErrnoException).code;
  if (code === 'ECONNRESET' || code === 'EPIPE') return;
  console.error('Unexpected DB pool error:', err);
});

export async function query(text: string, params?: any[], retries = 2): Promise<any> {
  try {
    const client = await pool.connect();
    try {
      return await client.query(text, params);
    } catch (queryErr: any) {
      // If the socket died mid-query, destroy it so it's not reused
      if (queryErr.code === 'ECONNRESET' || queryErr.code === 'EPIPE') {
        client.release(true);
      } else {
        client.release();
      }
      throw queryErr;
    } finally {
      // release() is idempotent — safe to call even if already called above
      try { client.release(); } catch {}
    }
  } catch (err: any) {
    const retryable = ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'EPIPE', 'timeout exceeded'];
    const isRetryable = retryable.some(c => err.code === c || err.message?.includes(c));
    if (retries > 0 && isRetryable) {
      console.warn(`DB query failed (${err.code ?? err.message}), retrying... (${retries} left)`);
      await new Promise((r) => setTimeout(r, 500));
      return query(text, params, retries - 1);
    }
    throw err;
  }
}
