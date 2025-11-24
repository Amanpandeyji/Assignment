# Project Structure - Visual Overview

## Complete File Tree

```
VQ/ (Simple Tasks App)
│
├── 📁 pages/                          # Next.js pages and API routes
│   ├── 📁 api/                        # Backend API endpoints
│   │   ├── 📁 auth/                   # Authentication endpoints
│   │   │   ├── 📄 login.ts           # POST /api/auth/login
│   │   │   └── 📄 signup.ts          # POST /api/auth/signup
│   │   └── 📁 tasks/                  # Task management endpoints
│   │       ├── 📄 index.ts            # GET/POST /api/tasks
│   │       └── 📄 [id].ts             # PATCH/DELETE /api/tasks/:id
│   │
│   ├── 📄 _app.tsx                    # Next.js app wrapper (global config)
│   ├── 📄 index.tsx                   # Home page (auto-redirects)
│   ├── 📄 login.tsx                   # Login page (/login)
│   ├── 📄 signup.tsx                  # Signup page (/signup)
│   └── 📄 dashboard.tsx               # Main task management UI (/dashboard)
│
├── 📁 lib/                            # Shared utilities and libraries
│   ├── 📄 auth.ts                     # JWT sign/verify, token validation
│   ├── 📄 cache.ts                    # 30-second in-memory caching
│   ├── 📄 db.ts                       # JSON database implementation
│   └── 📄 logger.ts                   # API request logging utility
│
├── 📁 styles/                         # CSS stylesheets
│   └── 📄 globals.css                 # Global styles (all components)
│
├── 📁 .next/                          # Next.js build output (auto-generated)
├── 📁 node_modules/                   # NPM dependencies (auto-generated)
│
├── 📄 .env.local                      # Environment variables (JWT_SECRET)
├── 📄 .gitignore                      # Git ignore rules
├── 📄 database.json                   # JSON database file (auto-generated)
├── 📄 next.config.js                  # Next.js configuration
├── 📄 next-env.d.ts                   # Next.js TypeScript declarations
├── 📄 package.json                    # NPM package configuration
├── 📄 package-lock.json               # NPM dependency lock file
├── 📄 tsconfig.json                   # TypeScript configuration
│
├── 📄 README.md                       # Complete documentation (290+ lines)
├── 📄 QUICKSTART.md                   # Quick start guide (140+ lines)
├── 📄 SUMMARY.md                      # Assignment completion summary (420+ lines)
├── 📄 TESTING.md                      # Testing guide (480+ lines)
└── 📄 PROJECT_TREE.md                 # This file

Total: 24 files (excluding auto-generated build files)
```

## File Descriptions

### Frontend Pages (User-Facing)

| File | Route | Purpose | Key Features |
|------|-------|---------|-------------|
| `pages/index.tsx` | `/` | Landing page | Auto-redirects based on auth state |
| `pages/login.tsx` | `/login` | Login form | Email/password authentication |
| `pages/signup.tsx` | `/signup` | Registration form | Account creation |
| `pages/dashboard.tsx` | `/dashboard` | Main app | Task list, CRUD, summary counters |

### Backend API Endpoints

| File | Method | Route | Purpose |
|------|--------|-------|---------|
| `api/auth/signup.ts` | POST | `/api/auth/signup` | Create new user account |
| `api/auth/login.ts` | POST | `/api/auth/login` | Authenticate user |
| `api/tasks/index.ts` | GET | `/api/tasks` | List user's tasks (cached) |
| `api/tasks/index.ts` | POST | `/api/tasks` | Create new task |
| `api/tasks/[id].ts` | PATCH | `/api/tasks/:id` | Update task status/title |
| `api/tasks/[id].ts` | DELETE | `/api/tasks/:id` | Delete task |

### Core Libraries

| File | Lines | Purpose | Key Exports |
|------|-------|---------|-------------|
| `lib/auth.ts` | ~40 | JWT utilities | `signToken()`, `verifyToken()`, `getUserFromRequest()` |
| `lib/cache.ts` | ~50 | Caching logic | `taskCache` (set/get/invalidate/clear) |
| `lib/db.ts` | ~200 | Database | `DB` class with SQL-like interface |
| `lib/logger.ts` | ~40 | API logging | `logApiCall()` |

### Configuration Files

| File | Purpose | Key Settings |
|------|---------|--------------|
| `package.json` | NPM dependencies | next, react, typescript, bcryptjs, jsonwebtoken |
| `tsconfig.json` | TypeScript config | Strict mode, path aliases (@/*) |
| `next.config.js` | Next.js config | React strict mode enabled |
| `.env.local` | Environment vars | JWT_SECRET |
| `.gitignore` | Git exclusions | node_modules, .next, database.json |

### Documentation

| File | Lines | Purpose |
|------|-------|---------|
| `README.md` | 290+ | Complete technical documentation |
| `QUICKSTART.md` | 140+ | Quick start guide for users |
| `SUMMARY.md` | 420+ | Assignment completion summary |
| `TESTING.md` | 480+ | Comprehensive testing guide |
| `PROJECT_TREE.md` | This file | Visual project structure |

## Code Statistics

### Backend (API Routes)
- **Files**: 6
- **Lines**: ~650
- **Languages**: TypeScript
- **Endpoints**: 6 (2 auth + 4 tasks)

### Frontend (Pages)
- **Files**: 5
- **Lines**: ~450
- **Languages**: TypeScript, TSX
- **Pages**: 4 (home, login, signup, dashboard)

### Libraries
- **Files**: 4
- **Lines**: ~330
- **Languages**: TypeScript
- **Functions**: 15+

### Styles
- **Files**: 1
- **Lines**: ~280
- **CSS Classes**: 30+

### Documentation
- **Files**: 5
- **Lines**: 1,330+
- **Language**: Markdown

### Total Project
- **Source Files**: 16
- **Total Lines of Code**: ~1,710
- **Total Documentation**: ~1,330 lines
- **Grand Total**: ~3,040 lines

## Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│ (Frontend)  │
└──────┬──────┘
       │
       │ HTTP Requests (with JWT token)
       │
       ▼
┌─────────────────────────────────┐
│      Next.js API Routes         │
│         (Backend)               │
├─────────────────────────────────┤
│ 1. Logger (start timer)         │
│ 2. Auth (verify JWT)            │
│ 3. Cache check (if GET tasks)   │
│ 4. Database query (if needed)   │
│ 5. Cache set (if GET tasks)     │
│ 6. Logger (end timer, save log) │
└──────┬──────────────────────────┘
       │
       │ Read/Write
       │
       ▼
┌─────────────────┐
│  database.json  │
├─────────────────┤
│ - users         │
│ - tasks         │
│ - api_logs      │
└─────────────────┘

┌─────────────────┐
│   Task Cache    │
│   (In-Memory)   │
├─────────────────┤
│ Map<userId,     │
│  {data, ts}>    │
│ TTL: 30 seconds │
└─────────────────┘
```

## Request Flow Examples

### 1. User Login
```
1. Browser → POST /api/auth/login
2. API → Validate email/password
3. API → Query users from database.json
4. API → Compare bcrypt hash
5. API → Generate JWT token
6. API → Log request to console & database
7. API → Return token
8. Browser → Store token in localStorage
```

### 2. Get Tasks (First Time - Cache Miss)
```
1. Browser → GET /api/tasks (with Bearer token)
2. API → Verify JWT
3. API → Check cache for user
4. Cache → Return null (miss)
5. API → Query database.json
6. API → Set cache for user
7. API → Log "[CACHE MISS]" to console
8. API → Log request to database
9. API → Return tasks
```

### 3. Get Tasks (Within 30s - Cache Hit)
```
1. Browser → GET /api/tasks
2. API → Verify JWT
3. API → Check cache for user
4. Cache → Return cached data (hit)
5. API → Log "[CACHE HIT]" to console
6. API → Log request to database
7. API → Return cached tasks (no DB query)
```

### 4. Create Task
```
1. Browser → POST /api/tasks {title: "..."}
2. API → Verify JWT
3. API → Validate input
4. API → Insert into database.json
5. API → Invalidate cache for user
6. API → Log request to console & database
7. API → Return new task
8. Browser → Update UI immediately
```

## Security Layers

```
┌────────────────────────────────────┐
│    Input Validation                │
│    (Required fields, types)        │
└───────────────┬────────────────────┘
                │
┌───────────────▼────────────────────┐
│    JWT Authentication              │
│    (Bearer token verification)     │
└───────────────┬────────────────────┘
                │
┌───────────────▼────────────────────┐
│    User Isolation                  │
│    (Query filters by user_id)      │
└───────────────┬────────────────────┘
                │
┌───────────────▼────────────────────┐
│    Password Hashing                │
│    (bcrypt, 10 rounds)             │
└───────────────┬────────────────────┘
                │
┌───────────────▼────────────────────┐
│    React XSS Protection            │
│    (Auto-escaping)                 │
└────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────┐
│        Browser Level                │
│  - localStorage caching (JWT)       │
│  - React virtual DOM diffing        │
│  - Client-side state management     │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│        API Level                    │
│  - 30-second result caching         │
│  - Automatic cache invalidation     │
│  - Fast response times (<10ms)      │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│        Database Level               │
│  - In-memory JSON structure         │
│  - No network latency               │
│  - Fast file I/O                    │
└─────────────────────────────────────┘
```

## Development Workflow

```
1. Write code
   ↓
2. TypeScript compilation (automatic)
   ↓
3. Next.js hot reload (automatic)
   ↓
4. Test in browser
   ↓
5. Check terminal logs
   ↓
6. Inspect database.json
   ↓
7. Repeat
```

## Deployment Checklist

When deploying to production:

```
[ ] Change JWT_SECRET to secure random value
[ ] Enable HTTPS
[ ] Switch to production database (PostgreSQL)
[ ] Add rate limiting
[ ] Enable CORS properly
[ ] Set up monitoring
[ ] Configure error tracking
[ ] Add health check endpoint
[ ] Set up CI/CD pipeline
[ ] Configure environment variables
[ ] Enable compression
[ ] Add CDN for static assets
[ ] Set up backup strategy
[ ] Configure logging aggregation
[ ] Add security headers
[ ] Enable CSRF protection
```

---

**This project structure is designed for:**
- ✅ Rapid development
- ✅ Easy understanding
- ✅ Simple debugging
- ✅ Clear separation of concerns
- ✅ Scalability foundation
