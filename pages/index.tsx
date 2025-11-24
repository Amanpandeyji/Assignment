import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
          Simple Tasks App
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Choose your implementation:
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div style={{
            border: '2px solid #667eea',
            borderRadius: '8px',
            padding: '1.5rem',
            background: '#f8f9ff'
          }}>
            <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
              🔒 Clerk + Neon (Production)
            </h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Hosted authentication & PostgreSQL database
            </p>
            <Link href="/sign-in" style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: '#667eea',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Sign In with Clerk →
            </Link>
          </div>

          <div style={{
            border: '2px solid #764ba2',
            borderRadius: '8px',
            padding: '1.5rem',
            background: '#faf8ff'
          }}>
            <h3 style={{ color: '#764ba2', marginBottom: '0.5rem' }}>
              🛠️ Custom Implementation
            </h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
              JWT authentication & JSON file database
            </p>
            <Link href="/login" style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: '#764ba2',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Custom Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
