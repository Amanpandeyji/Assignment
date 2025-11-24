import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userStr));
    fetchTasks(token);
  }, [router]);

  const fetchTasks = async (token: string) => {
    try {
      const response = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.clear();
        router.push('/login');
        return;
      }

      const data = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks([data.task, ...tasks]);
        setNewTaskTitle('');
        setError('');
      }
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map((t) => (t.id === taskId ? data.task : t)));
      }
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const summary = {
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter((t) => t.status === 'DONE').length,
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Tasks App</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="summary">
        <div className="summary-card todo">
          <h3>TODO</h3>
          <div className="count">{summary.TODO}</div>
        </div>
        <div className="summary-card in-progress">
          <h3>IN PROGRESS</h3>
          <div className="count">{summary.IN_PROGRESS}</div>
        </div>
        <div className="summary-card done">
          <h3>DONE</h3>
          <div className="count">{summary.DONE}</div>
        </div>
      </div>

      <div className="task-form">
        <h2>Create New Task</h2>
        <form onSubmit={handleCreateTask}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
            <button type="submit" className="btn">
              Add Task
            </button>
          </div>
        </form>
      </div>

      <div className="tasks-list">
        <h2>Your Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <div className="empty-state">No tasks yet. Create one above!</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-title">{task.title}</div>
              <select
                value={task.status}
                onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
              <button
                className="btn-delete"
                onClick={() => handleDeleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
