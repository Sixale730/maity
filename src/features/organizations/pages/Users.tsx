import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/ui/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { Badge } from '@/ui/components/ui/badge';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { UserService, OrganizationService, AuthService, type UserManagement, type UserRole, type UserStatusType, type UserDeletionImpact } from '@maity/shared';
import { Users as UsersIcon, Edit, Trash2, Building2, Shield, Search, AlertTriangle } from 'lucide-react';

type Company = {
  id: string;
  name: string;
};

export default function Users() {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Edit dialogs
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagement | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [deletionImpact, setDeletionImpact] = useState<UserDeletionImpact | null>(null);

  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await OrganizationService.getAll();
      setCompanies((data as Company[]) || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, [fetchUsers, fetchCompanies]);

  useEffect(() => {
    // Get current user to prevent self-deletion
    const getCurrentUser = async () => {
      try {
        const user = await AuthService.getUser();
        if (user) {
          // Find user in maity.users by auth_id
          const maityUser = users.find(u => u.auth_id === user.id);
          if (maityUser) {
            setCurrentUserId(maityUser.id);
          }
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    if (users.length > 0) {
      getCurrentUser();
    }
  }, [users]);

  const openRoleDialog = (user: UserManagement) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setRoleDialogOpen(true);
  };

  const openCompanyDialog = (user: UserManagement) => {
    setEditingUser(user);
    setSelectedCompanyId(user.company_id);
    setCompanyDialogOpen(true);
  };

  const openDeleteDialog = async (user: UserManagement) => {
    // Check if trying to delete own account
    if (currentUserId && user.id === currentUserId) {
      toast({
        title: 'No permitido',
        description: 'No puedes eliminar tu propia cuenta. Pide a otro administrador que lo haga.',
        variant: 'destructive',
      });
      return;
    }

    setEditingUser(user);
    setOperationLoading(true);

    try {
      // Get deletion impact
      const impact = await UserService.getDeletionImpact(user.id);
      setDeletionImpact(impact);
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error('Error getting deletion impact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo obtener información de eliminación',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    setOperationLoading(true);
    try {
      const result = await UserService.updateRole(editingUser.id, selectedRole);

      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id ? { ...u, role: selectedRole } : u
          )
        );
        toast({
          title: 'Éxito',
          description: 'Rol actualizado correctamente',
        });
        setRoleDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'No se pudo actualizar el rol',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el rol',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!editingUser) return;

    setOperationLoading(true);
    try {
      const result = await UserService.updateCompany(editingUser.id, selectedCompanyId);

      if (result.success) {
        const companyName = companies.find((c) => c.id === selectedCompanyId)?.name || null;
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, company_id: selectedCompanyId, company_name: companyName }
              : u
          )
        );
        toast({
          title: 'Éxito',
          description: 'Empresa actualizada correctamente',
        });
        setCompanyDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'No se pudo actualizar la empresa',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la empresa',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserManagement) => {
    const newStatus: UserStatusType = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const result = await UserService.updateStatus(user.id, newStatus);

      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
        );
        toast({
          title: 'Éxito',
          description: `Usuario ${newStatus === 'ACTIVE' ? 'activado' : 'desactivado'} correctamente`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'No se pudo actualizar el estado',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!editingUser) return;

    setOperationLoading(true);
    try {
      const result = await UserService.deleteUser(editingUser.id);

      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.id !== editingUser.id));
        toast({
          title: 'Éxito',
          description: 'Usuario eliminado correctamente',
        });
        setDeleteDialogOpen(false);
        setDeletionImpact(null);
      } else {
        // Handle specific error cases
        let errorTitle = 'Error';
        let errorDesc = result.message || 'No se pudo eliminar el usuario';

        if (result.error === 'SELF_DELETION_NOT_ALLOWED') {
          errorTitle = 'No permitido';
          errorDesc = 'No puedes eliminar tu propia cuenta';
        } else if (result.error === 'LAST_ADMIN') {
          errorTitle = 'No permitido';
          errorDesc = 'No puedes eliminar el último administrador. Asigna el rol de admin a otro usuario primero.';
        }

        toast({
          title: errorTitle,
          description: errorDesc,
          variant: 'destructive',
        });
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: UserStatusType) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany =
      companyFilter === 'all' || user.company_id === companyFilter;
    return matchesSearch && matchesCompany;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UsersIcon className="w-8 h-8" />
              Usuarios
            </h1>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UsersIcon className="w-8 h-8" />
              Usuarios
            </h1>
            <p className="text-muted-foreground">
              Gestión de usuarios de la plataforma
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-64">
            <Label htmlFor="company-filter">Empresa</Label>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger id="company-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay usuarios que coincidan con los filtros
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="w-[200px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b-2 hover:bg-muted/30">
                    <TableCell className="font-medium py-4">{user.name}</TableCell>
                    <TableCell className="py-4">{user.email}</TableCell>
                    <TableCell className="py-4">
                      {user.company_name || (
                        <span className="text-muted-foreground">Sin empresa</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'Usuario'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleDialog(user)}
                          title="Cambiar rol"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCompanyDialog(user)}
                          title="Cambiar empresa"
                        >
                          <Building2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.status === 'ACTIVE' ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                        >
                          {user.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                          disabled={currentUserId === user.id}
                          title={currentUserId === user.id ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Usuario</Label>
              <Input id="user-name" value={editingUser?.name || ''} disabled />
            </div>
            <div>
              <Label htmlFor="role-select">Nuevo Rol</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger id="role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={operationLoading}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateRole} disabled={operationLoading}>
                {operationLoading ? 'Actualizando...' : 'Actualizar Rol'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Dialog */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Empresa del Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name-company">Usuario</Label>
              <Input id="user-name-company" value={editingUser?.name || ''} disabled />
            </div>
            <div>
              <Label htmlFor="company-select">Nueva Empresa</Label>
              <Select
                value={selectedCompanyId || 'none'}
                onValueChange={(value) => setSelectedCompanyId(value === 'none' ? null : value)}
              >
                <SelectTrigger id="company-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin empresa</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCompanyDialogOpen(false)} disabled={operationLoading}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateCompany} disabled={operationLoading}>
                {operationLoading ? 'Actualizando...' : 'Actualizar Empresa'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                ¿Estás seguro que quieres eliminar a <strong>{editingUser?.name}</strong>?
              </p>
              {deletionImpact && (
                <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  <p className="font-semibold text-destructive mb-2">
                    Se eliminarán los siguientes registros:
                  </p>
                  <ul className="text-sm space-y-1">
                    {deletionImpact.sessions > 0 && (
                      <li>• {deletionImpact.sessions} sesión{deletionImpact.sessions !== 1 ? 'es' : ''} de roleplay</li>
                    )}
                    {deletionImpact.evaluations > 0 && (
                      <li>• {deletionImpact.evaluations} evaluación{deletionImpact.evaluations !== 1 ? 'es' : ''}</li>
                    )}
                    {deletionImpact.voice_sessions > 0 && (
                      <li>• {deletionImpact.voice_sessions} sesión{deletionImpact.voice_sessions !== 1 ? 'es' : ''} de voz</li>
                    )}
                    {deletionImpact.form_responses > 0 && (
                      <li>• {deletionImpact.form_responses} respuesta{deletionImpact.form_responses !== 1 ? 's' : ''} de formulario</li>
                    )}
                    {deletionImpact.tally_submissions > 0 && (
                      <li>• {deletionImpact.tally_submissions} envío{deletionImpact.tally_submissions !== 1 ? 's' : ''} de Tally</li>
                    )}
                    {deletionImpact.voice_progress > 0 && (
                      <li>• {deletionImpact.voice_progress} registro{deletionImpact.voice_progress !== 1 ? 's' : ''} de progreso de voz</li>
                    )}
                    {deletionImpact.user_roles > 0 && (
                      <li>• {deletionImpact.user_roles} rol{deletionImpact.user_roles !== 1 ? 'es' : ''} de usuario</li>
                    )}
                    {deletionImpact.user_company_history > 0 && (
                      <li>• {deletionImpact.user_company_history} registro{deletionImpact.user_company_history !== 1 ? 's' : ''} de historial de empresa</li>
                    )}
                  </ul>
                </div>
              )}
              <p className="text-destructive font-medium">
                Esta acción es permanente y no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={operationLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={operationLoading}>
              {operationLoading ? 'Eliminando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
