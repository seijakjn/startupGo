"use client";
import React from 'react';
import { NavLink } from './NavLink';
import { Home, Car, Utensils, Package, Key, Wallet, User } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/fetch-me', label: 'Fetch Me', icon: Car },
    { path: '/food', label: 'Food', icon: Utensils },
    { path: '/parcel', label: 'Parcel', icon: Package },
    { path: '/rental', label: 'Rental', icon: Key },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
  ];

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
        <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--rounded-full)', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={20} />
          </div>
          <div>
            <div className="text-label-md">Juan Dela Cruz</div>
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>User Account</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
