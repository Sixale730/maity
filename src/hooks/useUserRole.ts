import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

export type UserRole = 'platform_admin' | 'org_admin' | 'user' | null;

export interface UserProfile {
  id: string;
  auth_id: string;
  name: string;
  company_id?: string;
  role?: string;
}

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const getUserRole = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserRole(null);
        setUserProfile(null);
        return;
      }

      // Check user status first, but don't redirect if we're on auth page
      const { data: status } = await supabase.rpc('my_status' as any);
      if (status !== 'ACTIVE' && !location.pathname.startsWith('/auth')) {
        // Redirect to pending if user is not active (but not if we're on auth page)
        window.location.href = '/pending';
        return;
      }

      // Get user role using the RPC function
      const { data: role, error: roleError } = await supabase.rpc('get_user_role');

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        setError('Error al obtener el rol del usuario');
        return;
      }

      setUserRole((role as UserRole) || 'user');
      
      // Get user info to get company_id and other data
      const { data: userInfo } = await supabase.rpc('get_user_info');
      
      // Create a profile from user info data
      const basicProfile: UserProfile = {
        id: user.id,
        auth_id: user.id,
        name: userInfo?.[0]?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        company_id: userInfo?.[0]?.company_id,
        role: role || 'user'
      };
      
      setUserProfile(basicProfile);

    } catch (err) {
      console.error('Error in getUserRole:', err);
      setError('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserRole();

    // Listen for auth changes and revalidate status
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setTimeout(() => {
          getUserRole();
        }, 0);
      }
    });

    // Revalidate status on window focus (when user returns to tab)
    const handleWindowFocus = () => {
      getUserRole();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  return {
    userRole,
    userProfile,
    loading,
    error,
    refreshRole: getUserRole,
    isAdmin: userRole === 'platform_admin',
    isOrgAdmin: userRole === 'org_admin',
    isUser: userRole === 'user'
  };
};