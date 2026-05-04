'use client';
import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Car, Utensils, Package, LogOut, Sun, Moon, Shield } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/rides', label: 'Ride Bookings', icon: Car },
    { path: '/admin/food', label: 'Food Orders', icon: Utensils },
    { path: '/admin/parcels', label: 'Parcel Deliveries', icon: Package },
    { path: '/admin/users', label: 'Users', icon: Users },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  if (!isLoaded) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin Portal...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: 'var(--color-surface-container-lowest)',
        borderRight: '1px solid var(--color-surface-container-highest)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <div className="text-headline-sm" style={{ color: 'var(--color-on-surface)' }}>Admin Portal</div>
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Butuan Go</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--rounded-lg)',
                  color: isActive ? 'var(--color-on-error-container)' : 'var(--color-on-surface-variant)',
                  backgroundColor: isActive ? 'var(--color-error-container)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s'
                }}>
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                A
              </div>
              <div>
                <div className="text-label-md">{user?.fullName || 'Admin User'}</div>
                <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Super Admin</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn"
              style={{ width: '100%', border: '1px solid var(--color-error)', color: 'var(--color-error)', backgroundColor: 'transparent', padding: '8px' }}
            >
              <LogOut size={16} style={{ marginRight: '8px' }} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: '72px',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: '1px solid var(--color-surface-container-highest)',
          backgroundColor: 'var(--color-surface-container-lowest)'
        }}>
          <button 
            className="btn btn-secondary" 
            onClick={toggleTheme}
            style={{ padding: '8px', borderRadius: 'var(--rounded-full)', border: 'none', cursor: 'pointer' }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
