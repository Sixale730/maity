/**
 * AdminViewRoleSelector
 * Dropdown component that allows admins to preview UI as different roles
 * Only visible to users with actualRole = 'admin'
 */

import { useViewRole } from '@/contexts/ViewRoleContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { Badge } from '@/ui/components/ui/badge';
import { Eye, User, Users, Shield } from 'lucide-react';
import type { UserRole } from '@maity/shared';

export function AdminViewRoleSelector() {
  const { actualRole, viewRole, setViewRole, isViewingAsOtherRole } = useViewRole();

  // Only show for admins (wait for role to load)
  if (!actualRole || actualRole !== 'admin') {
    return null;
  }

  const getRoleIcon = (role: UserRole | null) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'manager':
        return <Users className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: UserRole | null) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'user':
        return 'Usuario';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isViewingAsOtherRole && (
        <Badge variant="secondary" className="gap-1">
          <Eye className="h-3 w-3" />
          Vista previa
        </Badge>
      )}
      <Select
        value={viewRole || 'admin'}
        onValueChange={(value) => setViewRole(value as UserRole)}
      >
        <SelectTrigger className="w-[140px]">
          <div className="flex items-center gap-2">
            {getRoleIcon(viewRole)}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </div>
          </SelectItem>
          <SelectItem value="manager">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manager
            </div>
          </SelectItem>
          <SelectItem value="user">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Usuario
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
