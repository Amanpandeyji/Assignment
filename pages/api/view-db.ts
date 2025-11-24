import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import sql from '@/lib/neon-db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const tasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
    const users = await sql`SELECT id, clerk_user_id, email, created_at FROM users`;
    const logs = await sql`SELECT * FROM api_logs ORDER BY timestamp DESC LIMIT 50`;

    res.status(200).json({
      tasks,
      users,
      recentLogs: logs,
      stats: {
        totalTasks: tasks.length,
        totalUsers: users.length,
        totalLogs: logs.length
      }
    });
  } catch (error) {
    console.error('Database view error:', error);
    res.status(500).json({ error: 'Failed to fetch database data' });
  }
}
