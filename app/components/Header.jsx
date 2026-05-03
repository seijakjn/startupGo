"use client";
import React from 'react';
import { Wallet, Bell, Sun, Moon } from 'lucide-react';

const Header = ({ toggleTheme, theme }) => {
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
        
        <div className="chip">
          <Wallet size={16} style={{ marginRight: '6px' }} />
          ₱1,250.00
        </div>
        
        <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: 'var(--rounded-full)', border: 'none', cursor: 'pointer' }}>
          <Bell size={20} />
        </button>
      </div>
      <style jsx>{`
        .mobile-only-title {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-only-title {
            display: block;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
