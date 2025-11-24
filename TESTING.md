# Testing Guide

This document provides step-by-step instructions to verify all features of the Simple Tasks App.

## Prerequisites
- Application is running at http://localhost:3000
- Terminal visible to see logs

## Test Suite

### Test 1: User Authentication

#### 1.1 Sign Up - Happy Path ✅
1. Navigate to http://localhost:3000
2. Click "Don't have an account? Sign up"
3. Enter email: `test1@example.com`
4. Enter password: `password123`
5. Click "Sign Up"

**Expected Result:**
- Redirect to dashboard
- Terminal shows: `POST /api/auth/signup - User: 1 - Status: 201`

#### 1.2 Sign Up - Duplicate Email ❌
1. Log out
2. Try to sign up with same email: `test1@example.com`
3. Enter password: `password123`
4. Click "Sign Up"

**Expected Result:**
- Error message: "User already exists"
- Terminal shows: `POST /api/auth/signup - Status: 400`

#### 1.3 Sign Up - Short Password ❌
1. Try email: `test2@example.com`
2. Enter password: `12345` (only 5 characters)
3. Click "Sign Up"

**Expected Result:**
- Error message: "Password must be at least 6 characters"
- Terminal shows: `POST /api/auth/signup - Status: 400`

#### 1.4 Login - Success ✅
1. Navigate to login page
2. Enter email: `test1@example.com`
3. Enter password: `password123`
4. Click "Login"

**Expected Result:**
- Redirect to dashboard
- Terminal shows: `POST /api/auth/login - User: 1 - Status: 200`

#### 1.5 Login - Wrong Password ❌
1. Try to login with wrong password
2. Enter email: `test1@example.com`
3. Enter password: `wrongpassword`
4. Click "Login"

**Expected Result:**
- Error message: "Invalid credentials"
- Terminal shows: `POST /api/auth/login - Status: 401`

### Test 2: Task Creation

#### 2.1 Create Task - Success ✅
1. Ensure you're logged in and on dashboard
2. Enter task title: "Complete testing"
3. Click "Add Task"

**Expected Result:**
- Task appears in list
- TODO counter increases by 1
- Terminal shows: `POST /api/tasks - User: 1 - Status: 201`
- Cache invalidated for user

#### 2.2 Create Multiple Tasks ✅
1. Create task: "Write documentation"
2. Create task: "Review code"
3. Create task: "Deploy application"

**Expected Result:**
- All tasks appear in list
- TODO counter shows 4
- Each task logged separately

#### 2.3 Create Task - Empty Title ❌
1. Leave task title empty
2. Click "Add Task"

**Expected Result:**
- Browser validation prevents submission (required field)

### Test 3: Task Status Updates

#### 3.1 Update to IN_PROGRESS ✅
1. Find task "Complete testing"
2. Change dropdown from "TODO" to "IN PROGRESS"

**Expected Result:**
- Status updates immediately
- TODO counter decreases by 1
- IN_PROGRESS counter increases by 1
- Terminal shows: `PATCH /api/tasks/1 - User: 1 - Status: 200`
- Cache invalidated

#### 3.2 Update to DONE ✅
1. Find task "Write documentation"
2. Change dropdown from "TODO" to "DONE"

**Expected Result:**
- Status updates immediately
- TODO counter decreases by 1
- DONE counter increases by 1
- Terminal shows: `PATCH /api/tasks/2 - User: 1 - Status: 200`

#### 3.3 Multiple Status Changes ✅
1. Change "Review code" to IN_PROGRESS
2. Change "Deploy application" to IN_PROGRESS
3. Change "Complete testing" to DONE

**Expected Result:**
- All status changes reflected
- Counters update correctly:
  - TODO: 0
  - IN_PROGRESS: 2
  - DONE: 2

### Test 4: Task Deletion

#### 4.1 Delete Task ✅
1. Find task "Deploy application"
2. Click "Delete" button

**Expected Result:**
- Task removed from list
- IN_PROGRESS counter decreases by 1
- Terminal shows: `DELETE /api/tasks/4 - User: 1 - Status: 200`
- Cache invalidated

#### 4.2 Delete Multiple Tasks ✅
1. Delete "Review code"
2. Delete "Write documentation"

**Expected Result:**
- Both tasks removed
- Counters updated accordingly
- Each deletion logged

### Test 5: Summary Dashboard

#### 5.1 Verify Counters ✅
1. Create 3 new tasks (all TODO)
2. Move 1 to IN_PROGRESS
3. Move 1 to DONE
4. Delete 1 TODO task

**Expected Result:**
Summary shows:
- TODO: 1
- IN_PROGRESS: 2
- DONE: 2

#### 5.2 Real-time Updates ✅
1. Watch summary as you create a task
2. Watch summary as you update status
3. Watch summary as you delete a task

**Expected Result:**
- All counters update instantly
- No page reload needed

### Test 6: 30-Second Caching

#### 6.1 Cache Miss (First Load) ✅
1. Reload the dashboard page
2. Check terminal immediately

**Expected Result:**
- Terminal shows: `[CACHE MISS] User 1 - Fetched from DB and cached`
- Terminal shows: `GET /api/tasks - User: 1 - Status: 200 - Xms`

#### 6.2 Cache Hit (Within 30 Seconds) ✅
1. Reload page again immediately (within 30 seconds)
2. Check terminal

**Expected Result:**
- Terminal shows: `[CACHE HIT] User 1 - Served from cache`
- Response time should be faster (~1-2ms)

#### 6.3 Cache Expiry (After 30 Seconds) ✅
1. Wait 30+ seconds without touching the page
2. Reload the page
3. Check terminal

**Expected Result:**
- Terminal shows: `[CACHE MISS] User 1 - Fetched from DB and cached`
- Cache was expired and refetched

#### 6.4 Cache Invalidation on Create ✅
1. Wait for a cache hit (reload within 30s)
2. Create a new task
3. Page automatically refreshes task list
4. Check terminal

**Expected Result:**
- After task creation, next GET shows: `[CACHE MISS]`
- Cache was invalidated due to data change

#### 6.5 Cache Invalidation on Update ✅
1. Wait for a cache hit
2. Update a task status
3. Check terminal

**Expected Result:**
- Cache invalidated
- Next request will be cache miss

#### 6.6 Cache Invalidation on Delete ✅
1. Wait for a cache hit
2. Delete a task
3. Check terminal

**Expected Result:**
- Cache invalidated
- Next request will be cache miss

### Test 7: API Logging

#### 7.1 Console Logging ✅
1. Perform any action (create task, login, etc.)
2. Check terminal output

**Expected Result:**
- Every API call logged with format:
  ```
  [TIMESTAMP] METHOD PATH - User: ID - Status: CODE - Xms
  ```
- Example: `[2025-11-23T09:17:15.304Z] POST /api/tasks - User: 1 - Status: 201 - 5ms`

#### 7.2 Database Logging ✅
1. Perform several actions
2. Open `database.json` file
3. Look at `api_logs` array

**Expected Result:**
- All API calls stored in database
- Each log entry contains:
  - id
  - method
  - path
  - timestamp
  - user_id (if authenticated)
  - status_code
  - response_time_ms

Example:
```json
{
  "id": 1,
  "method": "POST",
  "path": "/api/auth/signup",
  "timestamp": "2025-11-23T09:17:15.304Z",
  "user_id": 1,
  "status_code": 201,
  "response_time_ms": 133
}
```

#### 7.3 Response Time Tracking ✅
1. Check multiple log entries
2. Compare response times

**Expected Result:**
- Cached requests: 1-3ms
- Uncached requests: 2-10ms
- Authentication: 100-150ms (bcrypt hashing)
- All times tracked accurately

### Test 8: User Isolation

#### 8.1 Multi-User Test ✅
1. Log out from test1@example.com
2. Sign up as test2@example.com
3. Create 2 tasks for test2
4. Log out
5. Log in as test1@example.com
6. Check dashboard

**Expected Result:**
- test1 only sees their own tasks
- test2's tasks are NOT visible
- Each user has independent task list

#### 8.2 Unauthorized Access ❌
1. Log out
2. Try to access: http://localhost:3000/api/tasks
   (without Authorization header)

**Expected Result:**
- 401 Unauthorized error
- Cannot access tasks without authentication

### Test 9: Edge Cases

#### 9.1 Very Long Task Title ✅
1. Create task with 200+ character title
2. Submit

**Expected Result:**
- Task created successfully
- Title fully stored
- UI may truncate for display

#### 9.2 Special Characters in Task Title ✅
1. Create task: `Test <script>alert('xss')</script>`
2. Create task: `Test & "quotes" & 'apostrophes'`

**Expected Result:**
- Tasks created safely
- No script execution (XSS prevention)
- Special characters displayed correctly

#### 9.3 Rapid Task Creation ✅
1. Create 10 tasks rapidly
2. Check all appear correctly

**Expected Result:**
- All tasks created with unique IDs
- No race conditions
- All tasks visible

#### 9.4 Empty Task List ✅
1. Delete all tasks
2. View dashboard

**Expected Result:**
- Message: "No tasks yet. Create one above!"
- Summary shows 0/0/0
- No errors

### Test 10: Performance

#### 10.1 Load Time ✅
1. Reload dashboard with 20+ tasks
2. Note load time

**Expected Result:**
- Page loads in < 100ms (cached)
- Page loads in < 200ms (uncached)

#### 10.2 Interaction Responsiveness ✅
1. Click through various actions quickly
2. Check UI responsiveness

**Expected Result:**
- No lag or freezing
- Immediate visual feedback
- Status updates reflect instantly

## API Testing with cURL

### Test Authentication Endpoints

#### Signup
```powershell
curl -X POST http://localhost:3000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"api@test.com\",\"password\":\"apitest123\"}'
```

Expected: 201 Created with token

#### Login
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"api@test.com\",\"password\":\"apitest123\"}'
```

Expected: 200 OK with token

### Test Task Endpoints

Save your token first:
```powershell
$token = "YOUR_TOKEN_HERE"
```

#### Get Tasks
```powershell
curl http://localhost:3000/api/tasks `
  -H "Authorization: Bearer $token"
```

Expected: 200 OK with tasks array

#### Create Task
```powershell
curl -X POST http://localhost:3000/api/tasks `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{\"title\":\"API created task\",\"status\":\"TODO\"}'
```

Expected: 201 Created with task object

#### Update Task
```powershell
curl -X PATCH http://localhost:3000/api/tasks/1 `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{\"status\":\"DONE\"}'
```

Expected: 200 OK with updated task

#### Delete Task
```powershell
curl -X DELETE http://localhost:3000/api/tasks/1 `
  -H "Authorization: Bearer $token"
```

Expected: 200 OK with deletion confirmation

## Test Results Template

Use this checklist to track your testing:

```
[ ] 1.1 Sign Up - Happy Path
[ ] 1.2 Sign Up - Duplicate Email
[ ] 1.3 Sign Up - Short Password
[ ] 1.4 Login - Success
[ ] 1.5 Login - Wrong Password
[ ] 2.1 Create Task - Success
[ ] 2.2 Create Multiple Tasks
[ ] 2.3 Create Task - Empty Title
[ ] 3.1 Update to IN_PROGRESS
[ ] 3.2 Update to DONE
[ ] 3.3 Multiple Status Changes
[ ] 4.1 Delete Task
[ ] 4.2 Delete Multiple Tasks
[ ] 5.1 Verify Counters
[ ] 5.2 Real-time Updates
[ ] 6.1 Cache Miss
[ ] 6.2 Cache Hit
[ ] 6.3 Cache Expiry
[ ] 6.4 Cache Invalidation on Create
[ ] 6.5 Cache Invalidation on Update
[ ] 6.6 Cache Invalidation on Delete
[ ] 7.1 Console Logging
[ ] 7.2 Database Logging
[ ] 7.3 Response Time Tracking
[ ] 8.1 Multi-User Test
[ ] 8.2 Unauthorized Access
[ ] 9.1 Very Long Task Title
[ ] 9.2 Special Characters
[ ] 9.3 Rapid Task Creation
[ ] 9.4 Empty Task List
[ ] 10.1 Load Time
[ ] 10.2 Interaction Responsiveness
```

## Automated Testing (Future)

For production, implement:
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for user workflows
- Performance tests for load handling
- Security tests for vulnerabilities

---

**All tests should pass for the application to be considered fully functional.**
