import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import DB from '@/lib/db';
import { signToken } from '@/lib/auth';
import { logApiCall } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  if (req.method !== 'POST') {
    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method!, path: '/api/auth/signup', statusCode: 405, responseTimeMs: responseTime });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: '/api/auth/signup', statusCode: 400, responseTimeMs: responseTime });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: '/api/auth/signup', statusCode: 400, responseTimeMs: responseTime });
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = DB.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      const responseTime = Date.now() - startTime;
      logApiCall({ method: req.method, path: '/api/auth/signup', statusCode: 400, responseTimeMs: responseTime });
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = DB.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);
    const userId = result.lastInsertRowid as number;

    // Generate token
    const token = signToken({ userId, email });

    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method, path: '/api/auth/signup', userId, statusCode: 201, responseTimeMs: responseTime });

    res.status(201).json({ token, user: { id: userId, email } });
  } catch (error) {
    console.error('Signup error:', error);
    const responseTime = Date.now() - startTime;
    logApiCall({ method: req.method!, path: '/api/auth/signup', statusCode: 500, responseTimeMs: responseTime });
    res.status(500).json({ error: 'Internal server error' });
  }
}
