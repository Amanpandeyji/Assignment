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
    await logApiCall({ method: req.method!, path: `/api/tasks/${req.query.id}`, statusCode: 401, responseTimeMs: responseTime });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const taskId = req.query.id as string;

  try {
    if (req.method === 'PATCH') {
      const { status, title } = req.body;

      // Verify task belongs to user
      const existingTask = await sql`
        SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${userId}
      `;

      if (existingTask.length === 0) {
        const responseTime = Date.now() - startTime;
        await logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId, statusCode: 404, responseTimeMs: responseTime });
        return res.status(404).json({ error: 'Task not found' });
      }

      // Build update query
      const updates: string[] = [];
      const values: any[] = [];

      if (status && ['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
        updates.push('status');
        values.push(status);
      }

      if (title && title.trim() !== '') {
        updates.push('title');
        values.push(title.trim());
      }

      if (updates.length === 0) {
        const responseTime = Date.now() - startTime;
        await logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId, statusCode: 400, responseTimeMs: responseTime });
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      // Update the task
      let updatedTask;
      if (updates.includes('status') && updates.includes('title')) {
        updatedTask = await sql`
          UPDATE tasks 
          SET status = ${values[0]}, title = ${values[1]}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${taskId} AND user_id = ${userId}
          RETURNING id, title, status, created_at, updated_at
        `;
      } else if (updates.includes('status')) {
        updatedTask = await sql`
          UPDATE tasks 
          SET status = ${values[0]}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${taskId} AND user_id = ${userId}
          RETURNING id, title, status, created_at, updated_at
        `;
      } else {
        updatedTask = await sql`
          UPDATE tasks 
          SET title = ${values[0]}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${taskId} AND user_id = ${userId}
          RETURNING id, title, status, created_at, updated_at
        `;
      }

      // Invalidate cache
      taskCache.invalidate(userId);

      const responseTime = Date.now() - startTime;
      await logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId, statusCode: 200, responseTimeMs: responseTime });

      return res.status(200).json({ task: updatedTask[0] });
    }

    if (req.method === 'DELETE') {
      // Verify task belongs to user
      const existingTask = await sql`
        SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${userId}
      `;

      if (existingTask.length === 0) {
        const responseTime = Date.now() - startTime;
        await logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId, statusCode: 404, responseTimeMs: responseTime });
        return res.status(404).json({ error: 'Task not found' });
      }

      await sql`DELETE FROM tasks WHERE id = ${taskId} AND user_id = ${userId}`;

      // Invalidate cache
      taskCache.invalidate(userId);

      const responseTime = Date.now() - startTime;
      await logApiCall({ method: req.method, path: `/api/tasks/${taskId}`, userId, statusCode: 200, responseTimeMs: responseTime });

      return res.status(200).json({ message: 'Task deleted' });
    }

    const responseTime = Date.now() - startTime;
    await logApiCall({ method: req.method!, path: `/api/tasks/${taskId}`, userId, statusCode: 405, responseTimeMs: responseTime });
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Task update/delete error:', error);
    const responseTime = Date.now() - startTime;
    await logApiCall({ method: req.method!, path: `/api/tasks/${taskId}`, userId, statusCode: 500, responseTimeMs: responseTime });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
