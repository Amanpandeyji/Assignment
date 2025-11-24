import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import sql from '@/lib/neon-db';
import { logApiCall } from '@/lib/neon-logger';
import { taskCache } from '@/lib/neon-cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  
  // Authenticate user with Clerk
  const { userId } = getAuth(req);
  if (!userId) {
    const responseTime = Date.now() - startTime;
    await logApiCall({ method: req.method!, path: '/api/tasks', statusCode: 401, responseTimeMs: responseTime });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      // Check cache first
      const cachedTasks = taskCache.get(userId);
      if (cachedTasks) {
        const responseTime = Date.now() - startTime;
        await logApiCall({ method: req.method, path: '/api/tasks', userId, statusCode: 200, responseTimeMs: responseTime });
        console.log(`[CACHE HIT] User ${userId} - Served from cache`);
        return res.status(200).json({ tasks: cachedTasks, fromCache: true });
      }

      // Fetch from database
      const tasks = await sql`
        SELECT id, title, status, created_at, updated_at 
        FROM tasks 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC
      `;
      
      // Cache the result
      taskCache.set(userId, tasks);
      console.log(`[CACHE MISS] User ${userId} - Fetched from DB and cached`);

      const responseTime = Date.now() - startTime;
      await logApiCall({ method: req.method, path: '/api/tasks', userId, statusCode: 200, responseTimeMs: responseTime });
      
      return res.status(200).json({ tasks, fromCache: false });
    }

    if (req.method === 'POST') {
      const { title, status = 'TODO' } = req.body;

      if (!title || title.trim() === '') {
        const responseTime = Date.now() - startTime;
        await logApiCall({ method: req.method, path: '/api/tasks', userId, statusCode: 400, responseTimeMs: responseTime });
        return res.status(400).json({ error: 'Title is required' });
      }

      if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
        const responseTime = Date.now() - startTime;
        await logApiCall({ method: req.method, path: '/api/tasks', userId, statusCode: 400, responseTimeMs: responseTime });
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Ensure user exists in our database
      await sql`
        INSERT INTO users (id, clerk_user_id, email)
        VALUES (${userId}, ${userId}, 'clerk_user')
        ON CONFLICT (clerk_user_id) DO NOTHING
      `;

      const result = await sql`
        INSERT INTO tasks (user_id, title, status)
        VALUES (${userId}, ${title.trim()}, ${status})
        RETURNING id, title, status, created_at, updated_at
      `;

      const newTask = result[0];

      // Invalidate cache
      taskCache.invalidate(userId);

      const responseTime = Date.now() - startTime;
      await logApiCall({ method: req.method, path: '/api/tasks', userId, statusCode: 201, responseTimeMs: responseTime });

      return res.status(201).json({ task: newTask });
    }

    const responseTime = Date.now() - startTime;
    await logApiCall({ method: req.method!, path: '/api/tasks', userId, statusCode: 405, responseTimeMs: responseTime });
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Tasks API error:', error);
    const responseTime = Date.now() - startTime;
    await logApiCall({ method: req.method!, path: '/api/tasks', userId, statusCode: 500, responseTimeMs: responseTime });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
