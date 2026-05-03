"use client";
import React from 'react';
import { NavLink } from './NavLink';
import { Home, Car, Utensils, Package, Key, Wallet } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/fetch-me', label: 'Fetch Me', icon: Car },
    { path: '/food', label: 'Food', icon: Utensils },
    { path: '/parcel', label: 'Parcel', icon: Package },
    { path: '/rental', label: 'Rental', icon: Key },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink 
            key={item.path} 
            href={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px',
              color: 'var(--color-on-surface-variant)',
              textDecoration: 'none'
            }}
            activeStyle={{
              color: 'var(--color-primary)',
            }}
          >
            <div className="nav-icon-wrapper">
              <Icon size={20} />
            </div>
            <span className="text-label-sm">{item.label}</span>
          </NavLink>
        );
      })}
      <style jsx>{`
        .nav-icon-wrapper {
          padding: 4px 16px;
          border-radius: 16px;
          transition: background-color 0.2s;
        }
        :global(.active) .nav-icon-wrapper {
          background-color: var(--color-surface-container);
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
