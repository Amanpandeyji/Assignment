import type { NextApiRequest, NextApiResponse } from 'next';
import DB from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { logApiCall } from '@/lib/logger';
import { taskCache } from '@/lib/cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  
  // Authenticate user
  const user = getUserFromRequest(req);
  if (!user) {
    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method!, path: '/api/tasks', statusCode: 401, responseTimeMs: responseTime });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      // Check cache first
      const cachedTasks = taskCache.get(user.userId);
      if (cachedTasks) {
        const responseTime = Date.now() - startTime;
        logApiCall({ method: req.method, path: '/api/tasks', userId: user.userId, statusCode: 200, responseTimeMs: responseTime });
        console.log(`[CACHE HIT] User ${user.userId} - Served from cache`);
        return res.status(200).json({ tasks: cachedTasks, fromCache: true });
      }

      // Fetch from database
      const tasks = DB.prepare('SELECT id, title, status, created_at, updated_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(user.userId);
      
      // Cache the result
      taskCache.set(user.userId, tasks);
      console.log(`[CACHE MISS] User ${user.userId} - Fetched from DB and cached`);

      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: '/api/tasks', userId: user.userId, statusCode: 200, responseTimeMs: responseTime });
      
      return res.status(200).json({ tasks, fromCache: false });
    }

    if (req.method === 'POST') {
      const { title, status = 'TODO' } = req.body;

      if (!title || title.trim() === '') {
        const responseTime = Date.now() - startTime;
        logApiCall({ method: req.method, path: '/api/tasks', userId: user.userId, statusCode: 400, responseTimeMs: responseTime });
        return res.status(400).json({ error: 'Title is required' });
      }

      if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
        const responseTime = Date.now() - startTime;
        logApiCall({ method: req.method, path: '/api/tasks', userId: user.userId, statusCode: 400, responseTimeMs: responseTime });
        return res.status(400).json({ error: 'Invalid status' });
      }

      const result = DB.prepare(
        'INSERT INTO tasks (user_id, title, status) VALUES (?, ?, ?)'
      ).run(user.userId, title.trim(), status);

      const taskId = result.lastInsertRowid;
      const newTask = DB.prepare('SELECT id, title, status, created_at, updated_at FROM tasks WHERE id = ?').get(taskId);

      // Invalidate cache
      taskCache.invalidate(user.userId);

      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: '/api/tasks', userId: user.userId, statusCode: 201, responseTimeMs: responseTime });

      return res.status(201).json({ task: newTask });
    }

    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method!, path: '/api/tasks', userId: user.userId, statusCode: 405, responseTimeMs: responseTime });
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Tasks API error:', error);
    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method!, path: '/api/tasks', userId: user.userId, statusCode: 500, responseTimeMs: responseTime });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
