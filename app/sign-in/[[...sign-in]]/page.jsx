'use client';
import { useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import { Car, Utensils, Package, Key, Shield } from 'lucide-react';

export default function SignInPage() {
  const [tab, setTab] = useState('user'); // 'user' | 'rider' | 'admin'

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
            : tab === 'rider' ? <Package size={28} color="white" />
            : <Car size={28} color="white" />
          }
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)', margin: '0 0 4px' }}>
          Butuan Go
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0 }}>
          {tab === 'admin' ? 'Admin Portal' : tab === 'rider' ? 'Driver Portal' : 'Your all-in-one super app'}
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--color-surface-container)',
        borderRadius: 'var(--rounded-full)',
        padding: '4px',
        gap: '4px',
        width: '100%',
        maxWidth: '340px',
      }}>
        {['user', 'rider', 'admin'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 'var(--rounded-full)',
              border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '14px', textTransform: 'capitalize',
              transition: 'all 0.2s',
              backgroundColor: tab === t ? 'var(--color-surface-container-lowest)' : 'transparent',
              color: tab === t ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t === 'admin' ? '🔒 Admin' : t}
          </button>
        ))}
      </div>

      {/* Clerk SignIn — different redirect per tab */}
      <div key={tab} style={{ animation: 'fadeSlide 0.2s ease' }}>
        <SignIn
          afterSignInUrl={tab === 'admin' ? "/admin" : tab === 'rider' ? "/rider" : "/"}
          afterSignUpUrl={tab === 'admin' ? "/admin" : tab === 'rider' ? "/rider-signup" : "/"}
          signUpUrl="/sign-up"
        />
      </div>

      {tab === 'admin' && (
        <div style={{ textAlign: 'center', maxWidth: '300px', margin: '-8px 0 0' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>
            Admin access is restricted to accounts with the 'admin' role.
          </p>
          <a href="/admin-setup" style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
            [Dev Tool] Promote my account to Admin
          </a>
        </div>
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
