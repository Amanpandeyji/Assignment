import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DatabaseViewer() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'users' | 'logs'>('tasks');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, isLoaded, router]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/view-db');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to load database data');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return <div className="container"><div className="loading">Loading...</div></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Database Viewer</h1>
        <Link href="/clerk-dashboard" style={{ color: '#667eea', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {data && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '8px', flex: 1 }}>
              <h3 style={{ margin: 0, color: '#0369a1' }}>Total Tasks</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>
                {data.stats.totalTasks}
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', flex: 1 }}>
              <h3 style={{ margin: 0, color: '#15803d' }}>Total Users</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>
                {data.stats.totalUsers}
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', flex: 1 }}>
              <h3 style={{ margin: 0, color: '#a16207' }}>API Logs</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0' }}>
                {data.stats.totalLogs}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: activeTab === 'tasks' ? '#667eea' : 'transparent',
                color: activeTab === 'tasks' ? 'white' : '#6b7280',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '8px 8px 0 0'
              }}
            >
              Tasks Table
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: activeTab === 'users' ? '#667eea' : 'transparent',
                color: activeTab === 'users' ? 'white' : '#6b7280',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '8px 8px 0 0'
              }}
            >
              Users Table
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: activeTab === 'logs' ? '#667eea' : 'transparent',
                color: activeTab === 'logs' ? 'white' : '#6b7280',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '8px 8px 0 0'
              }}
            >
              API Logs (50 recent)
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {activeTab === 'tasks' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>ID</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Title</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>User ID</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tasks.map((task: any) => (
                    <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>{task.id}</td>
                      <td style={{ padding: '0.75rem' }}>{task.title}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          background: task.status === 'DONE' ? '#d1fae5' : task.status === 'IN_PROGRESS' ? '#fef3c7' : '#dbeafe',
                          color: task.status === 'DONE' ? '#065f46' : task.status === 'IN_PROGRESS' ? '#92400e' : '#1e40af'
                        }}>
                          {task.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {task.user_id.substring(0, 20)}...
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {new Date(task.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'users' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>ID</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Clerk User ID</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Email</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user: any) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>{user.id}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{user.clerk_user_id}</td>
                      <td style={{ padding: '0.75rem' }}>{user.email}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'logs' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Method</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Path</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Response Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLogs.map((log: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          background: log.method === 'GET' ? '#dbeafe' : log.method === 'POST' ? '#d1fae5' : '#fef3c7',
                          color: log.method === 'GET' ? '#1e40af' : log.method === 'POST' ? '#065f46' : '#92400e',
                          fontWeight: 'bold'
                        }}>
                          {log.method}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{log.path}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          color: log.status_code >= 200 && log.status_code < 300 ? '#059669' : '#dc2626',
                          fontWeight: 'bold'
                        }}>
                          {log.status_code}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{log.response_time_ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
