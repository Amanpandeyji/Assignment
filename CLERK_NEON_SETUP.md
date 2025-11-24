# Clerk + Neon Integration Guide

This guide shows how to set up the application with **Clerk** (authentication) and **Neon** (PostgreSQL database).

## Prerequisites

1. **Clerk Account** - Sign up at [clerk.com](https://clerk.com)
2. **Neon Account** - Sign up at [neon.tech](https://neon.tech)

## Step 1: Set Up Clerk

### 1.1 Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Add application"
3. Name it "Simple Tasks App"
4. Select authentication methods (Email, Google, etc.)
5. Click "Create application"

### 1.2 Get Clerk API Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

### 1.3 Configure Clerk

1. Go to "Paths" in Clerk dashboard
2. Set these paths:
   - Sign-in page: `/sign-in`
   - Sign-up page: `/sign-up`
   - After sign-in redirect: `/clerk-dashboard`
   - After sign-up redirect: `/clerk-dashboard`

## Step 2: Set Up Neon Database

### 2.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click "Create Project"
3. Choose:
   - **Project name**: Simple Tasks DB
   - **Region**: Choose closest to you
   - **PostgreSQL version**: 15 (default)
4. Click "Create Project"

### 2.2 Get Database Connection String

1. In your Neon project dashboard
2. Click "Connection Details"
3. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

## Step 3: Configure Environment Variables

Edit `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Neon Database
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

⚠️ **Important**: Replace the placeholder values with your actual keys!

## Step 4: Initialize Database Schema

### Option 1: Using the API Endpoint

1. Start the development server:
   ```powershell
   npm run dev
   ```

2. Initialize the database:
   ```powershell
   curl -X POST http://localhost:3000/api/init-db
   ```

### Option 2: Using Neon SQL Editor

1. Go to your Neon project dashboard
2. Click "SQL Editor"
3. Run this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'TODO' CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create API logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id SERIAL PRIMARY KEY,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT,
  status_code INTEGER,
  response_time_ms INTEGER
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
```

## Step 5: Start the Application

```powershell
npm run dev
```

Open http://localhost:3000

## Step 6: Test the Integration

### 6.1 Sign Up

1. Navigate to http://localhost:3000
2. Click "Sign up"
3. Create an account using:
   - Email + password, or
   - Google/GitHub (if configured in Clerk)
4. Verify your email if required
5. You'll be redirected to `/clerk-dashboard`

### 6.2 Create Tasks

1. Enter a task title
2. Click "Add Task"
3. Task appears in the list
4. Check Neon dashboard to see data in `tasks` table

### 6.3 Verify Database

Go to Neon SQL Editor and run:
```sql
SELECT * FROM users;
SELECT * FROM tasks;
SELECT * FROM api_logs;
```

You should see your data!

## Architecture Overview

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │
       │ Clerk handles authentication
       │
       ▼
┌─────────────────────┐
│  Clerk Middleware   │
│  (Authentication)   │
└──────┬──────────────┘
       │
       │ userId passed to API
       │
       ▼
┌─────────────────────┐
│  Next.js API Routes │
│  (Backend Logic)    │
└──────┬──────────────┘
       │
       │ SQL queries
       │
       ▼
┌─────────────────────┐
│  Neon PostgreSQL    │
│  (Cloud Database)   │
└─────────────────────┘
```

## API Endpoints (New)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/init-db` | POST | No | Initialize database schema |
| `/api/neon-tasks` | GET | Yes | List user's tasks (cached 30s) |
| `/api/neon-tasks` | POST | Yes | Create new task |
| `/api/neon-tasks/[id]` | PATCH | Yes | Update task status/title |
| `/api/neon-tasks/[id]` | DELETE | Yes | Delete task |

## Key Features

### Authentication (Clerk)
- ✅ Email + password authentication
- ✅ Social login (Google, GitHub, etc.)
- ✅ Email verification
- ✅ Password reset
- ✅ User profile management
- ✅ Session management
- ✅ Multi-factor authentication (optional)

### Database (Neon)
- ✅ PostgreSQL 15
- ✅ Serverless architecture
- ✅ Auto-scaling
- ✅ Connection pooling
- ✅ Daily backups
- ✅ Point-in-time recovery
- ✅ Free tier: 0.5 GB storage

### Performance
- ✅ 30-second task list caching
- ✅ Automatic cache invalidation
- ✅ Fast serverless queries (<50ms)
- ✅ Connection pooling

## Comparison: Custom vs Clerk + Neon

| Feature | Custom (JSON) | Clerk + Neon |
|---------|---------------|--------------|
| **Setup Time** | 5 minutes | 15 minutes |
| **Auth Security** | Basic JWT | Enterprise-grade |
| **Database** | JSON file | PostgreSQL |
| **Scalability** | Limited | Production-ready |
| **User Management** | Manual | Full dashboard |
| **Social Login** | ❌ | ✅ |
| **Email Verification** | ❌ | ✅ |
| **Password Reset** | ❌ | ✅ |
| **MFA** | ❌ | ✅ |
| **Backups** | Manual | Automatic |
| **Concurrent Users** | 1-10 | Unlimited |
| **Cost** | Free | Free tier available |

## Troubleshooting

### Error: "Clerk API key missing"
- Ensure `.env.local` has both Clerk keys
- Restart the dev server after adding keys

### Error: "Database connection failed"
- Check DATABASE_URL is correct
- Ensure IP is whitelisted in Neon (usually auto-allowed)
- Verify database exists

### Error: "Table does not exist"
- Run the database initialization (Step 4)
- Check Neon SQL Editor to verify tables

### Clerk redirect issues
- Verify paths in Clerk dashboard match your routes
- Check middleware.ts is configured correctly

## Migration from Old System

If you want to keep using the old custom auth + JSON system:
- Use routes: `/login`, `/signup`, `/dashboard`
- API endpoints: `/api/auth/*`, `/api/tasks/*`

To use the new Clerk + Neon system:
- Use routes: `/sign-in`, `/sign-up`, `/clerk-dashboard`
- API endpoints: `/api/neon-tasks/*`

**Both systems can coexist** in the same codebase!

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`
4. Deploy!

### Environment Variables Checklist
```
[ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
[ ] CLERK_SECRET_KEY
[ ] DATABASE_URL
```

## Security Considerations

✅ **Already Implemented:**
- Clerk handles authentication securely
- HTTPS enforced by Clerk
- JWT tokens with short expiry
- Database connection SSL required
- User isolation at query level
- Prepared statements (SQL injection protection)

⚠️ **Additional Recommendations:**
- Enable Clerk MFA for production
- Set up Neon IP allowlist if needed
- Configure CORS properly
- Add rate limiting
- Enable Clerk webhooks for audit logs

## Cost Estimates

### Free Tier (Perfect for demo/small projects)
- **Clerk**: 5,000 monthly active users
- **Neon**: 0.5 GB storage, 100 compute hours
- **Vercel**: 100 GB bandwidth

### Paid Tier (If you scale)
- **Clerk Pro**: $25/month + $0.02/MAU
- **Neon**: $19/month (unlimited)
- **Vercel Pro**: $20/month

## Support

- **Clerk Docs**: https://clerk.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Clerk Discord**: https://clerk.com/discord
- **Neon Discord**: https://discord.gg/neon

---

**You now have a production-ready task management app with enterprise authentication and a scalable database! 🎉**
