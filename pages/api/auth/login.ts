import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import DB from '@/lib/db';
import { signToken } from '@/lib/auth';
import { logApiCall } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  if (req.method !== 'POST') {
    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method!, path: '/api/auth/login', statusCode: 405, responseTimeMs: responseTime });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: '/api/auth/login', statusCode: 400, responseTimeMs: responseTime });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = DB.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: '/api/auth/login', statusCode: 401, responseTimeMs: responseTime });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: '/api/auth/login', userId: user.id, statusCode: 401, responseTimeMs: responseTime });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = signToken({ userId: user.id, email: user.email });

    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method, path: '/api/auth/login', userId: user.id, statusCode: 200, responseTimeMs: responseTime });

    res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method!, path: '/api/auth/login', statusCode: 500, responseTimeMs: responseTime });
    res.status(500).json({ error: 'Internal server error' });
  }
}
