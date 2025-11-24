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
    logApiCall({ method: req.method!, path: `/api/tasks/${req.query.id}`, statusCode: 401, responseTimeMs: responseTime });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const taskId = req.query.id as string;

  try {
    if (req.method === 'PATCH') {
      const { status, title } = req.body;

      // Verify task belongs to user
      const task = DB.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, user.userId) as any;
      if (!task) {
        const responseTime = Date.now() - startTime;
        logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId: user.userId, statusCode: 404, responseTimeMs: responseTime });
        return res.status(404).json({ error: 'Task not found' });
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (status && ['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
        updates.push('status = ?');
        values.push(status);
      }

      if (title && title.trim() !== '') {
        updates.push('title = ?');
        values.push(title.trim());
      }

      if (updates.length === 0) {
        const responseTime = Date.now() - startTime;
        logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId: user.userId, statusCode: 400, responseTimeMs: responseTime });
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(taskId, user.userId);

      DB.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

      const updatedTask = DB.prepare('SELECT id, title, status, created_at, updated_at FROM tasks WHERE id = ?').get(taskId);

      // Invalidate cache
      taskCache.invalidate(user.userId);

      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId: user.userId, statusCode: 200, responseTimeMs: responseTime });

      return res.status(200).json({ task: updatedTask });
    }

    if (req.method === 'DELETE') {
      // Verify task belongs to user
      const task = DB.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, user.userId);
      if (!task) {
        const responseTime = Date.now() - startTime;
        logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId: user.userId, statusCode: 404, responseTimeMs: responseTime });
        return res.status(404).json({ error: 'Task not found' });
      }

      DB.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(taskId, user.userId);

      // Invalidate cache
      taskCache.invalidate(user.userId);

      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId: user.userId, statusCode: 200, responseTimeMs: responseTime });

      return res.status(200).json({ message: 'Task deleted' });
    }

    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method!, path: `/api/tasks/${taskId}`, userId: user.userId, statusCode: 405, responseTimeMs: responseTime });
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Task update/delete error:', error);
    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method!, path: `/api/tasks/${taskId}`, userId: user.userId, statusCode: 500, responseTimeMs: responseTime });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
