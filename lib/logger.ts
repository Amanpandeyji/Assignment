import DB from './db';

interface LogEntry {
  method: string;
  path: string;
  userId?: number;
  statusCode?: number;
  responseTimeMs?: number;
}

export function logApiCall(entry: LogEntry): void {
  const timestamp = new Date().toISOString();
  
  // Console logging
  console.log(`[${timestamp}] ${entry.method} ${entry.path} - User: ${entry.userId || 'anonymous'} - Status: ${entry.statusCode || 'N/A'} - ${entry.responseTimeMs || 0}ms`);
  
  // Database logging
  try {
    const stmt = DB.prepare(`
      INSERT INTO api_logs (method, path, timestamp, user_id, status_code, response_time_ms)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      entry.method,
      entry.path,
      timestamp,
      entry.userId || null,
      entry.statusCode || null,
      entry.responseTimeMs || null
    );
  } catch (error) {
    console.error('Failed to log to database:', error);
  }
}
