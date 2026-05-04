'use client';
import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { Power, Map, CreditCard, LogOut, Loader2, Navigation, Package } from 'lucide-react';

export default function RiderLayout({ children }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const [isOnline, setIsOnline] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  if (!isLoaded) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 size={32} className="animate-spin" color="var(--color-primary)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{
        height: '72px', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'var(--color-surface-container-lowest)',
        borderBottom: '1px solid var(--color-surface-container-highest)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={24} color="white" />
          </div>
          <div>
            <div className="text-headline-sm" style={{ margin: 0 }}>Driver Portal</div>
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              All Services
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Online Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-label-sm" style={{ color: isOnline ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              style={{
                width: '52px', height: '28px', borderRadius: '14px',
                backgroundColor: isOnline ? 'var(--color-primary)' : 'var(--color-surface-container-highest)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'white',
                position: 'absolute', top: '2px', left: isOnline ? '26px' : '2px',
                transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
          
          <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--color-surface-container-highest)' }} />

          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={20} />
            <span className="text-label-sm" style={{ display: 'none' /* hidden on mobile */ }}>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px', position: 'relative' }}>
        {!isOnline && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 5,
            backgroundColor: 'rgba(var(--color-background-rgb, 15,23,42), 0.7)',
            backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Power size={40} color="var(--color-on-surface-variant)" />
            </div>
            <h2 className="text-headline-md">You are offline</h2>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', maxWidth: '300px' }}>
              Go online to start receiving delivery requests in your area.
            </p>
          </div>
        )}
        {children}
      </main>

      {/* Bottom Nav */}
      <nav style={{
        height: '64px', backgroundColor: 'var(--color-surface-container-lowest)',
        borderTop: '1px solid var(--color-surface-container-highest)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0 16px', zIndex: 10
      }}>
        <button 
          onClick={() => router.push('/rider')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: pathname === '/rider' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
        >
          <Package size={24} />
          <span style={{ fontSize: '11px', fontWeight: pathname === '/rider' ? '600' : '500' }}>Jobs</span>
        </button>

        <button 
          onClick={() => router.push('/rider/location')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: pathname === '/rider/location' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
        >
          <Navigation size={24} />
          <span style={{ fontSize: '11px', fontWeight: pathname === '/rider/location' ? '600' : '500' }}>Location</span>
        </button>

        <button 
          onClick={() => router.push('/wallet')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: pathname?.startsWith('/wallet') ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
        >
          <CreditCard size={24} />
          <span style={{ fontSize: '11px', fontWeight: pathname?.startsWith('/wallet') ? '600' : '500' }}>Earnings</span>
        </button>
      </nav>
    </div>
  );
}
