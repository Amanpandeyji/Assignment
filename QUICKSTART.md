# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies
```powershell
npm install
```

### 2. Start the Development Server
```powershell
npm run dev
```

### 3. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## First Time User Flow

1. Click "Sign Up" on the landing page
2. Enter your email and password (min 6 characters)
3. You'll be automatically logged in to the dashboard
4. Create your first task!

## Features to Try

### Create Tasks
- Type a task title in the "Create New Task" form
- Click "Add Task"
- Watch the summary counters update

### Update Task Status
- Use the dropdown next to each task to change status
- Options: TODO, IN PROGRESS, DONE
- Summary updates in real-time

### Delete Tasks
- Click the "Delete" button next to any task
- Task is removed instantly

### Check Caching (Advanced)
1. Create a few tasks
2. Reload the page within 30 seconds
3. Check the terminal - you'll see `[CACHE HIT]`
4. Wait 30+ seconds and reload
5. Check the terminal - you'll see `[CACHE MISS]`

### View Logs
All API calls are logged to:
- **Terminal/Console** - Real-time logs with timestamps
- **database.json** - Persistent storage in `api_logs` array

Example log format:
```
[2025-11-23T09:17:15.304Z] POST /api/auth/signup - User: 1 - Status: 201 - 133ms
```

## API Testing with cURL

### Sign Up
```powershell
curl -X POST http://localhost:3000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### Login
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### Get Tasks (requires token)
```powershell
curl http://localhost:3000/api/tasks `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Task (requires token)
```powershell
curl -X POST http://localhost:3000/api/tasks `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{\"title\":\"My new task\",\"status\":\"TODO\"}'
```

### Update Task Status (requires token)
```powershell
curl -X PATCH http://localhost:3000/api/tasks/1 `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{\"status\":\"DONE\"}'
```

### Delete Task (requires token)
```powershell
curl -X DELETE http://localhost:3000/api/tasks/1 `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Port 3000 is already in use
Stop other services using port 3000 or modify the port:
```powershell
npm run dev -- -p 3001
```

### Clear all data
Delete the `database.json` file:
```powershell
rm database.json
```
The database will be recreated on next server start.

### JWT Token expired
Simply log out and log back in to get a fresh token (valid for 7 days).

## Project Structure Overview

```
pages/
├── api/              # Backend API endpoints
│   ├── auth/        # Authentication (login, signup)
│   └── tasks/       # Task CRUD operations
├── login.tsx        # Login page
├── signup.tsx       # Signup page
└── dashboard.tsx    # Main app interface

lib/
├── auth.ts          # JWT utilities
├── cache.ts         # 30-second caching
├── db.ts            # JSON database
└── logger.ts        # API logging
```

## Development Tips

1. **Watch the Terminal** - All logs appear there in real-time
2. **Check database.json** - See your data structure
3. **JWT Secret** - Change it in `.env.local` for production
4. **Auto-reload** - Next.js hot-reloads on file changes

## Next Steps

See the full [README.md](README.md) for:
- Complete feature documentation
- Technical implementation details
- Security considerations
- Production deployment guide

---

**Happy Task Managing! 🎯**
