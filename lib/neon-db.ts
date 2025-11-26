import { neon } from '@neondatabase/serverless';

const DB_URL = process.env.DATABASE_URL || '';

// Don't throw at import time — that breaks Next.js static export/build when
// environment variables are not yet configured (for example on preview deploys).
// Warn instead and create a lazy stub that throws at runtime if DB is used.
let sql: any;
if (!DB_URL) {
  console.warn('DATABASE_URL environment variable is not set — DB operations will fail at runtime');
  sql = new Proxy({}, {
    get() {
      return () => {
        throw new Error('DATABASE_URL is not configured. Set DATABASE_URL to enable DB operations.');
      };
    }
  });
} else {
  sql = neon(DB_URL);
}

// Initialize database schema
export async function initializeDatabase() {
  try {
    if (!DB_URL) {
      console.warn('Skipping database initialization: DATABASE_URL not set');
      return;
    }
    // Create users table (Clerk will handle auth, but we store references)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        clerk_user_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'TODO' CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create API logs table
    await sql`
      CREATE TABLE IF NOT EXISTS api_logs (
        id SERIAL PRIMARY KEY,
        method TEXT NOT NULL,
        path TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        status_code INTEGER,
        response_time_ms INTEGER
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id)`;

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export default sql;
