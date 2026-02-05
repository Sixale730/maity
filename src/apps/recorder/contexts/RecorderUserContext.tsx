/**
 * RecorderUserContext
 *
 * Simplified user context for the Recorder App.
 * Only fetches basic user info from Supabase, no role/phase checks.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@maity/shared';
import type { User } from '@supabase/supabase-js';

export interface RecorderUserProfile {
  id: string;        // maity.users.id
  authId: string;    // auth.uid()
  email: string;
  name: string;
}

interface RecorderUserContextType {
  user: User | null;
  userProfile: RecorderUserProfile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const RecorderUserContext = createContext<RecorderUserContextType | undefined>(undefined);

interface RecorderUserProviderProps {
  children: ReactNode;
}

export function RecorderUserProvider({ children }: RecorderUserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<RecorderUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserData = async () => {
    try {
      setError(null);

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setUser(authUser);

      // Fetch maity.users record to get the internal user ID
      const { data: maityUser, error: maityUserError } = await supabase
        .schema('maity')
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single();

      if (maityUserError || !maityUser) {
        // User might not have a maity.users record yet (first login via recorder)
        // Try to create one via ensureUser RPC
        console.log('[RecorderUser] No maity user found, attempting to create...');

        const { data: ensureResult, error: ensureError } = await supabase.rpc('ensure_user');

        if (ensureError) {
          console.error('[RecorderUser] Error ensuring user:', ensureError);
          // Still allow access even without maity.users record
          setUserProfile({
            id: authUser.id, // Use auth ID as fallback
            authId: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
          });
          setLoading(false);
          return;
        }

        // Fetch again after ensure
        const { data: newMaityUser } = await supabase
          .schema('maity')
          .from('users')
          .select('id')
          .eq('auth_id', authUser.id)
          .single();

        setUserProfile({
          id: newMaityUser?.id || authUser.id,
          authId: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
        });
      } else {
        setUserProfile({
          id: maityUser.id,
          authId: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
        });
      }

    } catch (err) {
      console.error('[RecorderUser] Error in getUserData:', err);
      setError('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const refreshUser = async () => {
    setLoading(true);
    await getUserData();
  };

  useEffect(() => {
    getUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        getUserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: RecorderUserContextType = {
    user,
    userProfile,
    loading,
    error,
    signOut,
    refreshUser,
  };

  return (
    <RecorderUserContext.Provider value={value}>
      {children}
    </RecorderUserContext.Provider>
  );
}

export function useRecorderUser() {
  const context = useContext(RecorderUserContext);
  if (context === undefined) {
    throw new Error('useRecorderUser must be used within a RecorderUserProvider');
  }
  return context;
}
