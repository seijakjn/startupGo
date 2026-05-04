'use client';
import React from 'react';
import { NavLink } from './NavLink';
import { Home, Car, Utensils, Package, Key, Wallet, LogOut, LogIn } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const Sidebar = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/fetch-me', label: 'Fetch Me', icon: Car },
    { path: '/food', label: 'Food', icon: Utensils },
    { path: '/parcel', label: 'Parcel', icon: Package },
    { path: '/rental', label: 'Rental', icon: Key },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '40px', padding: '0 12px' }}>
        <h1 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>Butuan Go</h1>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 16px',
                borderRadius: 'var(--rounded-lg)',
                color: 'var(--color-on-surface-variant)',
                backgroundColor: 'transparent',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              activeStyle={{
                color: 'var(--color-on-primary-container)',
                backgroundColor: 'var(--color-primary-container)',
                fontWeight: '600',
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '20px 12px' }}>
        {isLoaded && isSignedIn ? (
          <div className="card glass" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'User'}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--rounded-full)',
                    objectFit: 'cover',
                    border: '2px solid var(--color-primary)'
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--rounded-full)',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '16px'
                }}>
                  {(user.fullName || user.username || '?')[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-label-md" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.fullName || user.username || 'User'}
                </div>
                <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.primaryEmailAddress?.emailAddress || ''}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--rounded)',
                border: '1px solid var(--color-outline)',
                backgroundColor: 'transparent',
                color: 'var(--color-on-surface-variant)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-error-container, #fee2e2)';
                e.currentTarget.style.color = 'var(--color-error, #dc2626)';
                e.currentTarget.style.borderColor = 'var(--color-error, #dc2626)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-on-surface-variant)';
                e.currentTarget.style.borderColor = 'var(--color-outline)';
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        ) : isLoaded && !isSignedIn ? (
          <button
            onClick={handleSignIn}
            className="btn btn-primary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <LogIn size={18} />
            Sign In
          </button>
        ) : null}
      </div>
    </aside>
  );
};

export default Sidebar;
