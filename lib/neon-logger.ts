import sql from './neon-db';

interface LogEntry {
  method: string;
  path: string;
  userId?: string;
  statusCode?: number;
  responseTimeMs?: number;
}

export async function logApiCall(entry: LogEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Console logging
  console.log(`[${timestamp}] ${entry.method} ${entry.path} - User: ${entry.userId || 'anonymous'} - Status: ${entry.statusCode || 'N/A'} - ${entry.responseTimeMs || 0}ms`);
  
  // Database logging
  try {
    await sql`
      INSERT INTO api_logs (method, path, timestamp, user_id, status_code, response_time_ms)
      VALUES (${entry.method}, ${entry.path}, ${timestamp}, ${entry.userId || null}, ${entry.statusCode || null}, ${entry.responseTimeMs || null})
    `;
  } catch (error) {
    console.error('Failed to log to database:', error);
  }
}
