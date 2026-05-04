'use client';
import { useState, useEffect } from 'react';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { ClerkProvider } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <ClerkProvider>
      <html lang="en" data-theme={theme}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
        </head>
        <body>
          <div className="app-container">
            {!isAuthRoute && <Sidebar />}
            <main className="main-content" style={isAuthRoute ? { padding: 0 } : {}}>
              {!isAuthRoute && <Header toggleTheme={toggleTheme} theme={theme} />}
              <div className="content-area" style={isAuthRoute ? { padding: 0, height: '100%' } : {}}>
                {children}
              </div>
            </main>
            {!isAuthRoute && <BottomNav />}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
