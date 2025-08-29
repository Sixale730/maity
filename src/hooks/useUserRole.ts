import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

      // Get user role from public.user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error fetching user role:', roleError);
        setError('Error al obtener el rol del usuario');
        return;
      }

      // Get user profile from maity.users using RPC function or direct schema access
      // Since maity schema is not exposed by default, we'll use a simpler approach
      // and store basic user info from auth.users until we set up proper schema access
      
      setUserRole((roleData?.role as UserRole) || 'user');
      
      // Create a basic profile from auth user data
      const basicProfile: UserProfile = {
        id: user.id,
        auth_id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        company_id: user.user_metadata?.company_id,
        role: roleData?.role || 'user'
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        getUserRole();
      }
    });

    return () => subscription.unsubscribe();
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