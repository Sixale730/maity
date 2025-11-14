import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, AuthService } from '@maity/shared';

export type UserRole = 'admin' | 'manager' | 'user' | null;

export interface UserProfile {
  id: string;
  auth_id: string;
  name: string;
  company_id?: string;
  role?: string;
}

interface UserContextType {
  userRole: UserRole;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserData = async () => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // Get user role
      const role = await AuthService.getUserRole();

      // If admin or manager, proceed regardless of phase
      if (role === 'admin' || role === 'manager') {
        console.log('[UserProvider] User is admin/manager, proceeding regardless of phase');
        setUserRole((role as UserRole) || 'user');

        // Fetch maity.users record to get actual id (not auth_id)
        const { data: maityUser, error: maityUserError } = await supabase
          .schema('maity')
          .from('users')
          .select('id, company_id')
          .eq('auth_id', user.id)
          .single();

        if (maityUserError || !maityUser) {
          console.error('[UserProvider] Error fetching maity.users:', maityUserError);
          throw new Error('User not found in maity.users');
        }

        const basicProfile: UserProfile = {
          id: maityUser.id, // maity.users.id (correct for RLS)
          auth_id: user.id, // auth.uid()
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          company_id: maityUser.company_id,
          role: role || 'user'
        };

        setUserProfile(basicProfile);
        setLoading(false);
        return;
      }

      // For regular users, check phase
      const phase = await AuthService.getMyPhase();
      console.log('[UserProvider] User phase:', phase);

      // Only continue if user is ACTIVE
      if (phase !== 'ACTIVE') {
        console.log('[UserProvider] User not active, skipping role fetch');
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // For regular users who are ACTIVE
      setUserRole((role as UserRole) || 'user');

      // Fetch maity.users record to get actual id (not auth_id)
      const { data: maityUser, error: maityUserError } = await supabase
        .schema('maity')
        .from('users')
        .select('id, company_id')
        .eq('auth_id', user.id)
        .single();

      if (maityUserError || !maityUser) {
        console.error('[UserProvider] Error fetching maity.users:', maityUserError);
        throw new Error('User not found in maity.users');
      }

      const basicProfile: UserProfile = {
        id: maityUser.id, // maity.users.id (correct for RLS)
        auth_id: user.id, // auth.uid()
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        company_id: maityUser.company_id,
        role: role || 'user'
      };

      setUserProfile(basicProfile);

    } catch (err) {
      console.error('Error in getUserData:', err);
      setError('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setTimeout(() => {
          getUserData();
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await getUserData();
  };

  const value: UserContextType = {
    userRole,
    userProfile,
    loading,
    error,
    refreshUser,
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isUser: userRole === 'user'
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}