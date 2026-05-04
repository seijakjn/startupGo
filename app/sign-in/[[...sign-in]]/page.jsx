'use client';
import { useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import { Car, Utensils, Package, Key, Shield } from 'lucide-react';

export default function SignInPage() {
  const [tab, setTab] = useState('user'); // 'user' | 'admin'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      gap: '24px',
      padding: '32px 16px',
    }}>
      {/* Brand header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(52,211,153,0.3)',
        }}>
          {tab === 'admin'
            ? <Shield size={28} color="white" />
            : <Car size={28} color="white" />
          }
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)', margin: '0 0 4px' }}>
          Butuan Go
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0 }}>
          {tab === 'admin' ? 'Admin Portal' : 'Your all-in-one super app'}
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--color-surface-container)',
        borderRadius: 'var(--rounded-full)',
        padding: '4px',
        gap: '4px',
        width: '280px',
      }}>
        <button
          onClick={() => setTab('user')}
          style={{
            flex: 1, padding: '10px 0',
            borderRadius: 'var(--rounded-full)',
            border: 'none', cursor: 'pointer',
            fontWeight: '600', fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: tab === 'user' ? 'var(--color-surface-container-lowest)' : 'transparent',
            color: tab === 'user' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            boxShadow: tab === 'user' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          User Login
        </button>
        <button
          onClick={() => setTab('admin')}
          style={{
            flex: 1, padding: '10px 0',
            borderRadius: 'var(--rounded-full)',
            border: 'none', cursor: 'pointer',
            fontWeight: '600', fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: tab === 'admin' ? 'var(--color-surface-container-lowest)' : 'transparent',
            color: tab === 'admin' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            boxShadow: tab === 'admin' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          🔒 Admin
        </button>
      </div>

      {/* Clerk SignIn — different redirect per tab */}
      <div key={tab} style={{ animation: 'fadeSlide 0.2s ease' }}>
        {tab === 'user' ? (
          <SignIn
            afterSignInUrl="/"
            afterSignUpUrl="/"
            signUpUrl="/sign-up"
          />
        ) : (
          <SignIn
            afterSignInUrl="/admin"
            afterSignUpUrl="/admin"
            signUpUrl="/sign-up"
          />
        )}
      </div>

      {tab === 'admin' && (
        <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', textAlign: 'center', maxWidth: '280px', margin: '-8px 0 0' }}>
          Admin access is restricted. Your account must be granted admin privileges by a super admin.
        </p>
      )}

      <style jsx>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
