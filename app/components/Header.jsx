'use client';
import React from 'react';
import { Wallet, Bell, Sun, Moon, LogIn } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const Header = ({ toggleTheme, theme }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  return (
    <header className="header">
      <div className="text-headline-sm" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'var(--color-primary)' }} className="mobile-only-title">Butuan Go</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme toggle */}
        <button 
          className="btn btn-secondary" 
          onClick={toggleTheme}
          style={{ padding: '8px', borderRadius: 'var(--rounded-full)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Wallet balance — only show when signed in */}
        {isLoaded && isSignedIn && (
          <div className="chip">
            <Wallet size={16} style={{ marginRight: '6px' }} />
            ₱1,250.00
          </div>
        )}

        {/* Notifications — only show when signed in */}
        {isLoaded && isSignedIn && (
          <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: 'var(--rounded-full)', border: 'none', cursor: 'pointer' }}>
            <Bell size={20} />
          </button>
        )}

        {/* Mobile: user avatar or sign-in button */}
        <div className="mobile-only-auth">
          {isLoaded && isSignedIn ? (
            user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-primary)',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/profile')}
              />
            ) : (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/profile')}
              >
                {(user.fullName || user.username || '?')[0].toUpperCase()}
              </div>
            )
          ) : isLoaded && !isSignedIn ? (
            <button
              onClick={() => router.push('/sign-in')}
              className="btn btn-primary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <LogIn size={16} />
              Sign In
            </button>
          ) : null}
        </div>
      </div>
      <style jsx>{`
        .mobile-only-title,
        .mobile-only-auth {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-only-title,
          .mobile-only-auth {
            display: flex;
            align-items: center;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
