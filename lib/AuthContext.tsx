'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { UserProfile } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const hasFetchedRef = useRef(false);
  const prevAccessTokenRef = useRef<string | undefined>(undefined);

  // Reset user when not authenticated
  const effectiveUser = useMemo(() => {
    if (!isAuthenticated) {
      return null;
    }
    return user;
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !session?.user) {
      hasFetchedRef.current = false;
      setUser(null);
      return;
    }

    // Check if session data changed
    const currentToken = session.accessToken;
    if (prevAccessTokenRef.current === currentToken && hasFetchedRef.current) {
      return;
    }
    prevAccessTokenRef.current = currentToken;
    hasFetchedRef.current = true;

    // Use session data directly (already fetched server-side in JWT callback)
    const sessionUser: UserProfile = {
      id: '',
      displayName: session.user.name || '',
      jobTitle: session.user.jobTitle,
      mail: session.user.email || undefined,
      employeeId: session.user.employeeId,
      photo: session.user.image || undefined,
    };

    setUser(sessionUser);

    // Try to fetch photo separately (optional, may fail if token expired)
    if (!currentToken) return;

    const controller = new AbortController();

    const fetchPhoto = async () => {
      try {
        const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
          signal: controller.signal,
        });
        if (photoResponse.ok) {
          const blob = await photoResponse.blob();
          const photoUrl = URL.createObjectURL(blob);
          setUser(prev => prev ? { ...prev, photo: photoUrl } : prev);
        }
      } catch {
        // Photo fetch failed (token expired or no photo) - ignore
      }
    };

    fetchPhoto();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, session]);

  const login = async () => {
    await signIn('azure-ad', { callbackUrl: '/' });
  };

  const logout = () => {
    signOut({ callbackUrl: '/' });
    hasFetchedRef.current = false;
  };

  const getAccessToken = async (): Promise<string | null> => {
    return session?.accessToken || null;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user: effectiveUser, login, logout, getAccessToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
