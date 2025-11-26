# Vercel Deployment Guide

## Fixed Issues

The export errors have been resolved by:

1. **Removed import-time throws** in `lib/neon-db.ts` - Database connection errors now only occur at runtime
2. **Added `getServerSideProps`** to all pages - Forces server-side rendering instead of static export
3. **Created `vercel.json`** - Ensures proper Next.js build configuration

## Required Environment Variables

Before deploying to Vercel, set these environment variables in your Vercel project settings:

### For Clerk + Neon (Production Routes)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
DATABASE_URL=postgresql://username:password@project.neon.tech/database?sslmode=require
```

### For Custom Auth (Optional - if using /login, /signup routes)
```
JWT_SECRET=your-random-secret-key-here
```

## Deployment Steps

### 1. Set Environment Variables on Vercel

Go to your Vercel project:
- Settings → Environment Variables
- Add each variable for **Production**, **Preview**, and **Development** environments
- Click "Save"

### 2. Redeploy

Option A: Push to Git (automatic)
```powershell
git add .
git commit -m "Fix: Add SSR to prevent static export errors"
git push
```

Option B: Manual redeploy
- Go to Vercel Dashboard → Deployments
- Click "Redeploy" on the latest deployment

### 3. Verify Build

The build should now succeed with these log entries:
- ✓ Generating static pages (X/X)
- ✓ Collecting page data
- ✓ Finalizing page optimization

### 4. Test Your App

After deployment, test these routes:
- `/` - Home page (choose implementation)
- `/sign-in` - Clerk authentication
- `/clerk-dashboard` - Clerk + Neon dashboard
- `/login` - Custom JWT auth
- `/dashboard` - Custom auth dashboard

## Troubleshooting

### Build still fails?
1. Check that environment variables are set correctly
2. Ensure `DATABASE_URL` uses the correct Neon connection string format
3. Verify Clerk keys match your Clerk application

### Database connection issues?
1. Confirm Neon database is active (not hibernated)
2. Check connection string includes `?sslmode=require`
3. Initialize database by visiting `/api/init-db` after first deployment

### Pages show errors at runtime?
1. Check browser console for specific errors
2. Verify Clerk publishable key is correct (should start with `pk_`)
3. Ensure all environment variables are available in Production environment

## Local Testing

To test the build locally:

```powershell
# Set environment variables
$env:DATABASE_URL='postgresql://...'
$env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='pk_test_...'
$env:CLERK_SECRET_KEY='sk_test_...'
$env:JWT_SECRET='your-secret'

# Build the project
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to test the production build.

## What Changed?

### `lib/neon-db.ts`
- No longer throws at module import time when `DATABASE_URL` is missing
- Provides runtime warnings instead of build-time failures
- Returns stub that throws clear errors if DB operations are attempted without config

### All Page Components
- Added `getServerSideProps` export to force server-side rendering
- Prevents Next.js from attempting static export during build
- Pages now render on each request with authentication/database access

### Configuration Files
- `next.config.js` - Server-side mode, optimized images
- `vercel.json` - Explicit Next.js framework configuration
- `.env.example` - Template for required environment variables

## Architecture

```
┌─────────────────┐
│   Vercel Edge   │
└────────┬────────┘
         │
┌────────▼────────┐
│  Next.js SSR    │ ← All pages use getServerSideProps
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ Clerk │ │  Neon   │
│ Auth  │ │ Postgres│
└───────┘ └─────────┘
```

All pages are rendered server-side, allowing authentication checks and database queries before sending HTML to the client.
