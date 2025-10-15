import { useState, useEffect } from 'react';
import { supabase, AuthService } from '@maity/shared';
import { getAppUrl } from "@maity/shared";
import { useLocation, useNavigate } from "react-router-dom";

export type UserRole = 'admin' | 'manager' | 'user' | null;

export interface UserProfile {
  id: string;
  auth_id: string;
  name: string;
  company_id?: string;
  role?: string;
}

// Simple cache to avoid unnecessary API calls
let roleCache: { role: UserRole; profile: UserProfile | null; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 seconds

export const useUserRole = () => {
  // Initialize loading based on cache availability
  const hasValidCache = roleCache && (Date.now() - roleCache.timestamp) < CACHE_DURATION;

  const [userRole, setUserRole] = useState<UserRole>(hasValidCache ? roleCache.role : null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(hasValidCache ? roleCache.profile : null);
  const [loading, setLoading] = useState(!hasValidCache);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const appUrl = getAppUrl();

  const getUserRole = async (skipLoading = false) => {
    try {
      // Check cache first
      const now = Date.now();
      if (roleCache && (now - roleCache.timestamp) < CACHE_DURATION) {
        console.log('[useUserRole] Using cached data');
        setUserRole(roleCache.role);
        setUserProfile(roleCache.profile);
        setError(null);
        setLoading(false);
        return;
      }

      if (!skipLoading) {
        setLoading(true);
      }
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserRole(null);
        setUserProfile(null);
        return;
      }

      // Primero obtener el rol del usuario
      const role = await AuthService.getUserRole();

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

        // Update cache for admin/manager
        roleCache = {
          role: (role as UserRole) || 'user',
          profile: basicProfile,
          timestamp: Date.now()
        };
        return;
      }

      // Para usuarios regulares, verificar fase - use my_status instead
      const statusData = await AuthService.getMyStatus();

      if (!statusData) {
        console.error('[useUserRole] my_status error: no data returned');
        setError('Error al verificar el estado del usuario');
        return;
      }

      const hasCompany = statusData?.[0]?.company_id;
      console.log('[useUserRole] User has company:', hasCompany);

      // Solo continuar si el usuario tiene company_id
      if (!hasCompany) {
        console.log('[useUserRole] User has no company, skipping role fetch');
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

      // Update cache
      roleCache = {
        role: (role as UserRole) || 'user',
        profile: basicProfile,
        timestamp: Date.now()
      };

    } catch (err) {
      console.error('Error in getUserRole:', err);
      setError('Error al cargar datos del usuario');
      // Clear cache on error
      roleCache = null;
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getUserRole();

    // Listen for auth changes and revalidate status
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        // Clear cache on auth changes
        roleCache = null;
        setTimeout(() => {
          getUserRole();
        }, 0);
      }
    });

    // Revalidate status on window focus (when user returns to tab) - but less frequently
    const handleWindowFocus = () => {
      // Only revalidate if cache is older than 2 minutes
      const now = Date.now();
      if (!roleCache || (now - roleCache.timestamp) > 120000) {
        getUserRole(true); // Skip loading state for focus revalidation
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const clearCache = () => {
    roleCache = null;
  };

  const refreshRole = () => {
    clearCache();
    return getUserRole();
  };

  return {
    userRole,
    userProfile,
    loading,
    error,
    refreshRole,
    clearCache,
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isUser: userRole === 'user'
  };
};
