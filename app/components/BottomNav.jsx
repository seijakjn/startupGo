"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from './NavLink';
import { Home, Car, Utensils, Package, Key, Wallet, Shield } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const BottomNav = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [freshRole, setFreshRole] = useState(null);

  useEffect(() => {
    if (user?.publicMetadata?.role) {
      setFreshRole(String(user.publicMetadata.role).toLowerCase());
    } else if (isSignedIn) {
      fetch('/api/user/metadata')
        .then(res => res.json())
        .then(data => {
          if (data.publicMetadata?.role) {
            setFreshRole(String(data.publicMetadata.role).toLowerCase());
          }
        })
        .catch(err => console.error('Error fetching metadata:', err));
    }
  }, [user, isSignedIn]);

  const role = freshRole;

  const navItems = useMemo(() => {
    if (!isLoaded) return [];

    if (role === 'admin') {
      return [
        { path: '/admin', label: 'Admin', icon: Shield },
        { path: '/wallet', label: 'Wallet', icon: Wallet },
      ];
    } 
    
    if (role === 'rider') {
      return [
        { path: '/rider', label: 'Jobs', icon: Package },
        { path: '/wallet', label: 'Wallet', icon: Wallet },
      ];
    }

    return [
      { path: '/', label: 'Home', icon: Home },
      { path: '/fetch-me', label: 'Fetch Me', icon: Car },
      { path: '/food', label: 'Food', icon: Utensils },
      { path: '/wallet', label: 'Wallet', icon: Wallet },
    ];
  }, [isLoaded, role]);

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
              textDecoration: 'none',
              flex: 1,
              minWidth: 0
            }}
            activeStyle={{
              color: 'var(--color-primary)',
            }}
          >
            <div className="nav-icon-wrapper">
              <Icon size={20} />
            </div>
            <span className="text-label-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
      <style jsx>{`
        .nav-icon-wrapper {
          padding: 4px 12px;
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
