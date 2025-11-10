/**
 * ViewRoleContext
 * Allows admins to preview the UI as different roles
 *
 * IMPORTANT SECURITY NOTES:
 * - actualRole: The user's real role from the database (immutable, used for security)
 * - viewRole: The role the UI is rendering as (mutable, UI-only)
 * - AdminRoute and other security checks MUST use actualRole
 * - UI components (sidebar, dashboard) should use viewRole for display
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import type { UserRole } from '@maity/shared';

interface ViewRoleContextType {
  actualRole: UserRole | null;
  viewRole: UserRole | null;
  setViewRole: (role: UserRole) => void;
  resetViewRole: () => void;
  isViewingAsOtherRole: boolean;
}

const ViewRoleContext = createContext<ViewRoleContextType | undefined>(undefined);

export function ViewRoleProvider({ children }: { children: React.ReactNode }) {
  const { role: actualRole } = useUser();
  const [viewRole, setViewRoleState] = useState<UserRole | null>(actualRole);

  // Sync viewRole with actualRole when actualRole changes
  useEffect(() => {
    setViewRoleState(actualRole);
  }, [actualRole]);

  const setViewRole = (role: UserRole) => {
    // Only admins can change view role
    if (actualRole === 'admin') {
      setViewRoleState(role);
    }
  };

  const resetViewRole = () => {
    setViewRoleState(actualRole);
  };

  const isViewingAsOtherRole = actualRole !== viewRole;

  return (
    <ViewRoleContext.Provider
      value={{
        actualRole,
        viewRole,
        setViewRole,
        resetViewRole,
        isViewingAsOtherRole,
      }}
    >
      {children}
    </ViewRoleContext.Provider>
  );
}

export function useViewRole() {
  const context = useContext(ViewRoleContext);
  if (context === undefined) {
    throw new Error('useViewRole must be used within a ViewRoleProvider');
  }
  return context;
}
