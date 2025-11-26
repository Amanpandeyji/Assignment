import { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/router';

interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  created_at: string;
  updated_at: string;
}

export default function ClerkDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [error, setError] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (user) {
      fetchTasks();
    }
  }, [user, isLoaded, router]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/neon-tasks');

      if (response.status === 401) {
        router.push('/sign-in');
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

    try {
      const response = await fetch('/api/neon-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    try {
      const response = await fetch(`/api/neon-tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleSaveEdit = async (taskId: number) => {
    if (!editingTitle.trim()) return;

    try {
      const response = await fetch(`/api/neon-tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map((t) => (t.id === taskId ? data.task : t)));
        setEditingTaskId(null);
        setEditingTitle('');
        setError('');
      }
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/neon-tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const summary = {
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter((t) => t.status === 'DONE').length,
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Tasks App (Clerk + Neon)</h1>
        <div className="user-info">
          <span>{user.primaryEmailAddress?.emailAddress}</span>
          <UserButton afterSignOutUrl="/sign-in" />
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
              {editingTaskId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
                    autoFocus
                  />
                  <button
                    className="btn"
                    onClick={() => handleSaveEdit(task.id)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Save
                  </button>
                  <button
                    className="btn-delete"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
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
                    className="btn"
                    onClick={() => handleEditTask(task)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Force server-side rendering to prevent static export
export async function getServerSideProps() {
  return { props: {} };
}
