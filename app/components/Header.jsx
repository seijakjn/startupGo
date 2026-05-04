'use client';
import React, { useState, useEffect } from 'react';
import { Wallet, Bell, Sun, Moon, LogIn } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const Header = ({ toggleTheme, theme }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [balance, setBalance] = useState(0);
  const [freshRole, setFreshRole] = useState(null);

  // Sync role and balance
  useEffect(() => {
    if (!isSignedIn || !user) return;

    // 1. Get role (with fallback)
    if (user.publicMetadata?.role) {
      setFreshRole(String(user.publicMetadata.role).toLowerCase());
    } else {
      fetch('/api/user/metadata')
        .then(res => res.json())
        .then(data => {
          if (data.publicMetadata?.role) {
            setFreshRole(String(data.publicMetadata.role).toLowerCase());
          }
        });
    }

    // 2. Get real wallet balance
    const fetchBalance = async () => {
      const { data, error } = await supabase.rpc('get_or_create_wallet', { target_user_id: user.id });
      if (!error) setBalance(data);
    };
    fetchBalance();

    // 3. Realtime notifications
    const channel = supabase
      .channel('global_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          const newJob = payload.new;
          const oldJob = payload.old;
          const currentRole = freshRole || user.publicMetadata?.role;

          if (payload.eventType === 'INSERT' && currentRole === 'rider') {
            if (newJob.type === user.publicMetadata.subcategory || !user.publicMetadata.subcategory) {
              addNotification(`New ${newJob.type.replace('_', ' ')} request nearby!`);
            }
          }

          if (payload.eventType === 'UPDATE' && newJob.user_id === user.id) {
            if (oldJob.status === 'pending' && newJob.status === 'accepted') {
              addNotification(`Your ${newJob.type} request was accepted by a rider!`);
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isSignedIn, freshRole]);

  const addNotification = (text) => {
    setNotifications(prev => [{ id: Date.now(), text, read: false }, ...prev].slice(0, 5));
  };

  return (
    <header className="header">
      <div className="text-headline-sm" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'var(--color-primary)' }} className="mobile-only-title">Butuan Go</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={toggleTheme}
          style={{ padding: '8px', borderRadius: 'var(--rounded-full)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {isLoaded && isSignedIn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {freshRole && (
              <div className="chip" style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px' }}>
                {freshRole}
              </div>
            )}
            <div className="chip" onClick={() => router.push('/wallet')} style={{ cursor: 'pointer' }}>
              <Wallet size={16} style={{ marginRight: '6px' }} />
              ₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}

        {isLoaded && isSignedIn && (
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowNotifs(!showNotifs)}
              style={{ padding: '8px', borderRadius: 'var(--rounded-full)', border: 'none', cursor: 'pointer', position: 'relative' }}
            >
              <Bell size={20} />
              {notifications.some(n => !n.read) && (
                <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: 'var(--color-error, #dc2626)', borderRadius: '50%', border: '2px solid var(--color-surface)' }} />
              )}
            </button>

            {showNotifs && (
              <div className="card shadow-level-2" style={{
                position: 'absolute', top: '48px', right: '0', width: '280px',
                zIndex: 100, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <div className="text-label-md" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px', marginBottom: '4px' }}>Notifications</div>
                {notifications.length === 0 ? (
                  <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '20px' }}>No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ padding: '8px', borderRadius: 'var(--rounded)', backgroundColor: 'var(--color-surface-container-low)', fontSize: '13px' }}>
                      {n.text}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div className="mobile-only-auth">
          {isLoaded && isSignedIn ? (
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
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => router.push('/wallet')}
            >
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (user.fullName || user.username || '?')[0].toUpperCase()
              )}
            </div>
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
