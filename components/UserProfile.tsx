'use client';

import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const applyTheme = useCallback((selectedTheme: 'light' | 'dark' | 'system') => {
    let effectiveTheme: 'light' | 'dark' = 'light';
    
    if (selectedTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = selectedTheme;
    }

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Initial load from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const themeToUse = savedTheme || 'system';
    if (savedTheme) {
      setTheme(themeToUse);
    }
    applyTheme(themeToUse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setShowThemeMenu(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4" style={{ color: 'var(--text-primary)' }}>
      <div className="flex items-center gap-3">
        {user.photo ? (
          <Image
            src={user.photo}
            alt={user.displayName}
            width={40}
            height={40}
            className="rounded-full"
            style={{ borderColor: 'var(--card-border)', borderWidth: '2px' }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-alt)' }}>
            <span className="text-lg font-semibold">
              {user.displayName?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="text-sm">
          <div className="font-semibold">{user.displayName}</div>
          {user.employeeId && (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              รหัสพนักงาน: {user.employeeId}
            </div>
          )}
          {user.jobTitle && (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {user.jobTitle}
            </div>
          )}
        </div>
      </div>
      <div className="ml-auto relative">
        <button
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          className="p-2 rounded-lg text-sm font-medium transition-all"
          style={{ 
            background: 'var(--surface-alt)', 
            color: 'var(--text-primary)',
            border: '1px solid var(--card-border)'
          }}
          title="เปลี่ยน Theme"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        {showThemeMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowThemeMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50 overflow-hidden"
              style={{ background: 'var(--modal-bg)', border: '1px solid var(--card-border)' }}>
              <button
                onClick={() => changeTheme('light')}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                style={{ 
                  color: 'var(--text-primary)',
                  background: theme === 'light' ? 'var(--surface-alt)' : 'transparent'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                Light
              </button>
              <button
                onClick={() => changeTheme('dark')}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                style={{ 
                  color: 'var(--text-primary)',
                  background: theme === 'dark' ? 'var(--surface-alt)' : 'transparent'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Dark
              </button>
              <button
                onClick={() => changeTheme('system')}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                style={{ 
                  color: 'var(--text-primary)',
                  background: theme === 'system' ? 'var(--surface-alt)' : 'transparent'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                </svg>
                System
              </button>
            </div>
          </>
        )}
      </div>
      <button
        onClick={logout}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        style={{ 
          background: 'var(--surface-alt)', 
          color: 'var(--text-primary)',
          border: '1px solid var(--card-border)'
        }}
      >
        ออกจากระบบ
      </button>
    </div>
  );
}
