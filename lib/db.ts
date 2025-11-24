import fs from 'fs';
import path from 'path';

interface User {
  id: number;
  email: string;
  password: string;
  created_at: string;
}

interface Task {
  id: number;
  user_id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  created_at: string;
  updated_at: string;
}

interface ApiLog {
  id: number;
  method: string;
  path: string;
  timestamp: string;
  user_id?: number;
  status_code?: number;
  response_time_ms?: number;
}

interface Database {
  users: User[];
  tasks: Task[];
  api_logs: ApiLog[];
  nextUserId: number;
  nextTaskId: number;
  nextLogId: number;
}

const dbPath = path.join(process.cwd(), 'database.json');

// Initialize database
function initDb(): Database {
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  }
  
  const initialDb: Database = {
    users: [],
    tasks: [],
    api_logs: [],
    nextUserId: 1,
    nextTaskId: 1,
    nextLogId: 1,
  };
  
  saveDb(initialDb);
  return initialDb;
}

function saveDb(db: Database): void {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export class DB {
  private static instance: Database;

  static getInstance(): Database {
    if (!DB.instance) {
      DB.instance = initDb();
    }
    return DB.instance;
  }

  static save(): void {
    saveDb(DB.instance);
  }

  static prepare(query: string) {
    return {
      get: (param?: any, param2?: any): any => {
        const db = DB.getInstance();
        
        // SELECT * FROM users WHERE email = ?
        if (query.includes('SELECT * FROM users WHERE email')) {
          return db.users.find(u => u.email === param);
        }
        
        // SELECT id FROM users WHERE email = ?
        if (query.includes('SELECT id FROM users WHERE email')) {
          const user = db.users.find(u => u.email === param);
          return user ? { id: user.id } : undefined;
        }
        
        // SELECT * FROM tasks WHERE id = ? AND user_id = ?
        if (query.includes('SELECT * FROM tasks WHERE id = ? AND user_id')) {
          return db.tasks.find(t => t.id === Number(param) && t.user_id === Number(param2));
        }
        
        // SELECT FROM tasks WHERE id = ?
        if (query.includes('SELECT id, title, status, created_at, updated_at FROM tasks WHERE id')) {
          return db.tasks.find(t => t.id === Number(param));
        }
        
        return undefined;
      },
      
      all: (param?: any): any[] => {
        const db = DB.getInstance();
        
        // SELECT FROM tasks WHERE user_id = ?
        if (query.includes('SELECT id, title, status, created_at, updated_at FROM tasks WHERE user_id')) {
          return db.tasks.filter(t => t.user_id === Number(param));
        }
        
        return [];
      },
      
      run: (...params: any[]): { lastInsertRowid: number } => {
        const db = DB.getInstance();
        
        // INSERT INTO users
        if (query.includes('INSERT INTO users')) {
          const [email, password] = params;
          const newUser: User = {
            id: db.nextUserId++,
            email,
            password,
            created_at: new Date().toISOString(),
          };
          db.users.push(newUser);
          DB.save();
          return { lastInsertRowid: newUser.id };
        }
        
        // INSERT INTO tasks
        if (query.includes('INSERT INTO tasks')) {
          const [userId, title, status] = params;
          const newTask: Task = {
            id: db.nextTaskId++,
            user_id: Number(userId),
            title,
            status: status || 'TODO',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          db.tasks.push(newTask);
          DB.save();
          return { lastInsertRowid: newTask.id };
        }
        
        // INSERT INTO api_logs
        if (query.includes('INSERT INTO api_logs')) {
          const [method, path, timestamp, userId, statusCode, responseTimeMs] = params;
          const newLog: ApiLog = {
            id: db.nextLogId++,
            method,
            path,
            timestamp,
            user_id: userId,
            status_code: statusCode,
            response_time_ms: responseTimeMs,
          };
          db.api_logs.push(newLog);
          DB.save();
          return { lastInsertRowid: newLog.id };
        }
        
        // UPDATE tasks
        if (query.includes('UPDATE tasks')) {
          const taskId = params[params.length - 2];
          const userId = params[params.length - 1];
          const taskIndex = db.tasks.findIndex(t => t.id === Number(taskId) && t.user_id === Number(userId));
          
          if (taskIndex !== -1) {
            // Parse the SET clause to update fields
            if (params[0]) db.tasks[taskIndex].status = params[0];
            if (params[1] && typeof params[1] === 'string' && !params[1].includes('CURRENT_TIMESTAMP')) {
              db.tasks[taskIndex].title = params[1];
            }
            db.tasks[taskIndex].updated_at = new Date().toISOString();
            DB.save();
          }
          return { lastInsertRowid: 0 };
        }
        
        // DELETE FROM tasks
        if (query.includes('DELETE FROM tasks')) {
          const [taskId, userId] = params;
          const taskIndex = db.tasks.findIndex(t => t.id === Number(taskId) && t.user_id === Number(userId));
          if (taskIndex !== -1) {
            db.tasks.splice(taskIndex, 1);
            DB.save();
          }
          return { lastInsertRowid: 0 };
        }
        
        return { lastInsertRowid: 0 };
      },
    };
  }
}

export default DB;
