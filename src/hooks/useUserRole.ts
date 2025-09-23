import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAppUrl } from "@/lib/appUrl";
import { useLocation, useNavigate } from "react-router-dom";

export type UserRole = 'admin' | 'manager' | 'user' | null;

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
  const navigate = useNavigate();
  const appUrl = getAppUrl();

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

      // Primero obtener el rol del usuario
      const { data: role, error: roleError } = await supabase.rpc('get_user_role');

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        setError('Error al obtener el rol del usuario');
        return;
      }

      // Si es admin o manager, proceder independientemente de la fase
      if (role === 'admin' || role === 'manager') {
        console.log('[useUserRole] User is admin/manager, proceeding regardless of phase');
        setUserRole((role as UserRole) || 'user');

        // Create a profile from basic user data
        const basicProfile: UserProfile = {
          id: user.id,
          auth_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          role: role || 'user'
        };

        setUserProfile(basicProfile);
        return;
      }

      // Para usuarios regulares, verificar fase
      const { data: phaseData, error: phaseError } = await supabase.rpc('my_phase');

      if (phaseError) {
        console.error('[useUserRole] my_phase error:', phaseError);
        setError('Error al verificar el estado del usuario');
        return;
      }

      const phase = String(phaseData || '').toUpperCase();
      console.log('[useUserRole] User phase:', phase);

      // Solo continuar si el usuario está ACTIVE
      if (phase !== 'ACTIVE') {
        console.log('[useUserRole] User not active, skipping role fetch');
        setUserRole(null);
        setUserProfile(null);
        return;
      }

      // Para usuarios regulares que llegaron aquí (fase ACTIVE)
      setUserRole((role as UserRole) || 'user');

      // Create a profile from basic user data
      const basicProfile: UserProfile = {
        id: user.id,
        auth_id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
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
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isUser: userRole === 'user'
  };
};
