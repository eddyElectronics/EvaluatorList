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
    // Check if access token changed
    if (prevAccessTokenRef.current === session?.accessToken) {
      return;
    }
    prevAccessTokenRef.current = session?.accessToken;

    if (!isAuthenticated || !session?.accessToken) {
      hasFetchedRef.current = false;
      return;
    }

    if (hasFetchedRef.current) {
      return;
    }

    const controller = new AbortController();

    const fetchUserProfile = async () => {
      hasFetchedRef.current = true;

      try {
        // Fetch user profile from MS Graph with employeeId
        const response = await fetch('https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,jobTitle,employeeId', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          signal: controller.signal,
        });

        if (response.ok) {
          const profile = await response.json();

          // Fetch user photo
          let photoUrl: string | undefined;
          try {
            const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
              signal: controller.signal,
            });
            if (photoResponse.ok) {
              const blob = await photoResponse.blob();
              photoUrl = URL.createObjectURL(blob);
            }
          } catch {
            console.log('No photo available');
          }

          setUser({
            id: profile.id,
            displayName: profile.displayName,
            jobTitle: profile.jobTitle,
            mail: profile.mail,
            employeeId: profile.employeeId || session.user?.employeeId,
            photo: photoUrl,
          });
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        console.error('Error fetching user profile:', error);
        // Fallback to session data
        if (session?.user) {
          setUser({
            id: '',
            displayName: session.user.name || '',
            jobTitle: session.user.jobTitle,
            mail: session.user.email || undefined,
            employeeId: session.user.employeeId,
            photo: session.user.image || undefined,
          });
        }
      }
    };

    fetchUserProfile();

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
