import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Button } from "@/ui/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/ui/components/ui/alert-dialog";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Badge } from "@/ui/components/ui/badge";
import { Switch } from "@/ui/components/ui/switch";
import { useToast } from "@/shared/hooks/use-toast";
import { OrganizationService, getAppUrl } from "@maity/shared";
import type { Database, CompanyDeletionImpact } from "@maity/shared";
import { Plus, Trash2, Settings2 } from "lucide-react";

type SupabaseCompany = Database["public"]["Functions"]["get_companies"]["Returns"][number];

type Company = SupabaseCompany & {
  registration_url?: string;
  domain?: string | null;
  auto_join_enabled?: boolean | null;
};

export function OrganizationsManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deletionImpact, setDeletionImpact] = useState<CompanyDeletionImpact | null>(null);

  // Create company autojoin state
  const [createDomain, setCreateDomain] = useState("");
  const [createAutojoinEnabled, setCreateAutojoinEnabled] = useState(false);

  // Autojoin configuration state
  const [isAutojoinDialogOpen, setIsAutojoinDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [autojoinDomain, setAutojoinDomain] = useState("");
  const [autojoinEnabled, setAutojoinEnabled] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const { toast } = useToast();
  const appUrl = getAppUrl();

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await OrganizationService.getAll();

      const companiesWithUrls: Company[] = data.map((company) => ({
        ...company,
        registration_url: `${appUrl}/auth?company=${company.id}`,
      }));

      setCompanies(companiesWithUrls);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las empresas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [appUrl, toast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const createCompany = async () => {
    if (!newCompanyName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la empresa es requerido",
        variant: "destructive",
      });
      return;
    }

    // Validate domain format if provided
    const domainValue = createDomain.trim().toLowerCase();
    if (domainValue && (domainValue.includes("@") || domainValue.includes(" "))) {
      toast({
        title: "Error",
        description: "El dominio no debe incluir @ ni espacios. Ejemplo: acme.com",
        variant: "destructive",
      });
      return;
    }

    try {
      await OrganizationService.createCompany(
        newCompanyName.trim(),
        domainValue || null,
        domainValue ? createAutojoinEnabled : false
      );

      // Refrescar la lista completa para obtener los tokens de invitación
      await fetchCompanies();

      setNewCompanyName("");
      setCreateDomain("");
      setCreateAutojoinEnabled(false);
      setIsDialogOpen(false);

      toast({
        title: "Éxito",
        description: "Empresa creada correctamente",
      });
    } catch (error) {
      console.error("Error creating company:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      toast({
        title: "Error",
        description: errorMessage.toLowerCase().includes("duplicate")
          ? "Ya existe una empresa con ese nombre"
          : errorMessage.toLowerCase().includes("domain")
          ? errorMessage
          : "No se pudo crear la empresa",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = async (company: Company) => {
    try {
      // Get deletion impact
      const impact = await OrganizationService.getCompanyDeletionImpact(company.id);
      setDeletionImpact(impact);
      setCompanyToDelete(company);
      setDeleteDialogOpen(true);

      // Check if company has users
      if (impact && impact.total_users > 0) {
        toast({
          title: "Advertencia",
          description: `Esta empresa tiene ${impact.total_users} usuario${impact.total_users !== 1 ? 's' : ''} asignado${impact.total_users !== 1 ? 's' : ''}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking deletion impact:", error);
      toast({
        title: "Error",
        description: "No se pudo verificar el impacto de la eliminación",
        variant: "destructive",
      });
    }
  };

  const deleteCompany = async () => {
    if (!companyToDelete) return;

    setDeleteLoading(companyToDelete.id);

    try {
      await OrganizationService.deleteCompany(companyToDelete.id);

      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));

      toast({
        title: "Éxito",
        description: "Empresa eliminada correctamente",
      });

      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      setDeletionImpact(null);
    } catch (error) {
      console.error("Error deleting company:", error);
      const message = error instanceof Error ? error.message : "No se pudo eliminar la empresa";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const openAutojoinDialog = (company: Company) => {
    setEditingCompany(company);
    setAutojoinDomain(company.domain || "");
    setAutojoinEnabled(company.auto_join_enabled || false);
    setIsAutojoinDialogOpen(true);
  };

  const saveAutojoinConfig = async () => {
    if (!editingCompany) return;

    // Validate domain format
    const domainValue = autojoinDomain.trim().toLowerCase();
    if (domainValue && (domainValue.includes("@") || domainValue.includes(" "))) {
      toast({
        title: "Error",
        description: "El dominio no debe incluir @ ni espacios. Ejemplo: acme.com",
        variant: "destructive",
      });
      return;
    }

    setSaveLoading(true);

    try {
      await OrganizationService.update(editingCompany.id, {
        domain: domainValue || null,
        auto_join_enabled: domainValue ? autojoinEnabled : false,
      });

      // Update local state
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === editingCompany.id
            ? {
                ...c,
                domain: domainValue || null,
                auto_join_enabled: domainValue ? autojoinEnabled : false,
              }
            : c
        )
      );

      toast({
        title: "Éxito",
        description: "Configuración de autojoin actualizada correctamente",
      });

      setIsAutojoinDialogOpen(false);
    } catch (error) {
      console.error("Error saving autojoin config:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
            <p className="text-muted-foreground">
              Gestiona las empresas y sus links de registro
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Empresa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Ingresa el nombre de la empresa"
                  value={newCompanyName}
                  onChange={(event) => setNewCompanyName(event.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="createDomain">Dominio de Email (Opcional)</Label>
                <Input
                  id="createDomain"
                  placeholder="acme.com"
                  value={createDomain}
                  onChange={(e) => setCreateDomain(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Solo el dominio, sin @ (ejemplo: gmail.com, acme.com)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="create-auto-join-enabled">Habilitar Autojoin</Label>
                  <p className="text-xs text-muted-foreground">
                    Los usuarios con este dominio se unirán automáticamente
                  </p>
                </div>
                <Switch
                  id="create-auto-join-enabled"
                  checked={createAutojoinEnabled}
                  onCheckedChange={setCreateAutojoinEnabled}
                  disabled={!createDomain.trim()}
                />
              </div>

              {createDomain && createAutojoinEnabled && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Vista previa:</strong> Los usuarios con email{" "}
                    <code className="bg-background px-1 py-0.5 rounded">
                      usuario@{createDomain.trim().toLowerCase()}
                    </code>{" "}
                    se unirán automáticamente con rol de usuario.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createCompany} className="flex-1">
                  Crear Empresa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <p className="text-muted-foreground">No hay empresas registradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Autojoin</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="border-b-2 hover:bg-muted/30"
                  >
                    <TableCell className="font-medium py-4">{company.name}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary">{company.plan}</Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={company.is_active ? "default" : "destructive"}>
                        {company.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-2">
                        {company.domain && company.auto_join_enabled ? (
                          <Badge variant="default" className="w-fit">
                            ✓ {company.domain}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No configurado</span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAutojoinDialog(company)}
                        >
                          <Settings2 className="h-3 w-3 mr-1" />
                          Configurar
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {new Date(company.created_at).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="py-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(company)}
                        disabled={deleteLoading === company.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleteLoading === company.id ? "..." : "Eliminar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Autojoin Configuration Dialog */}
      <Dialog open={isAutojoinDialogOpen} onOpenChange={setIsAutojoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Autojoin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="domain">Dominio de Email</Label>
              <Input
                id="domain"
                placeholder="acme.com"
                value={autojoinDomain}
                onChange={(e) => setAutojoinDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Solo el dominio, sin @ (ejemplo: gmail.com, acme.com)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-join-enabled">Habilitar Autojoin</Label>
                <p className="text-xs text-muted-foreground">
                  Los usuarios con este dominio se unirán automáticamente
                </p>
              </div>
              <Switch
                id="auto-join-enabled"
                checked={autojoinEnabled}
                onCheckedChange={setAutojoinEnabled}
                disabled={!autojoinDomain.trim()}
              />
            </div>

            {autojoinDomain && autojoinEnabled && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">
                  <strong>Vista previa:</strong> Los usuarios con email{" "}
                  <code className="bg-background px-1 py-0.5 rounded">
                    usuario@{autojoinDomain.trim().toLowerCase()}
                  </code>{" "}
                  se unirán automáticamente a{" "}
                  <strong>{editingCompany?.name}</strong> con rol de usuario.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAutojoinDialogOpen(false)}
                disabled={saveLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={saveAutojoinConfig}
                disabled={saveLoading}
              >
                {saveLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Company Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Empresa</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                ¿Estás seguro que quieres eliminar <strong>{companyToDelete?.name}</strong>?
              </p>
              {deletionImpact && deletionImpact.total_users > 0 && (
                <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  <p className="font-semibold text-destructive mb-2">
                    Esta empresa tiene usuarios asignados:
                  </p>
                  <ul className="text-sm space-y-1">
                    {deletionImpact.admins > 0 && (
                      <li>• {deletionImpact.admins} administrador{deletionImpact.admins !== 1 ? 'es' : ''}</li>
                    )}
                    {deletionImpact.managers > 0 && (
                      <li>• {deletionImpact.managers} manager{deletionImpact.managers !== 1 ? 's' : ''}</li>
                    )}
                    {deletionImpact.users > 0 && (
                      <li>• {deletionImpact.users} usuario{deletionImpact.users !== 1 ? 's' : ''}</li>
                    )}
                  </ul>
                  <p className="text-sm mt-2 text-destructive font-medium">
                    Estos usuarios perderán su asignación a la empresa pero NO serán eliminados.
                  </p>
                </div>
              )}
              {deletionImpact && deletionImpact.total_users === 0 && (
                <p className="text-sm text-muted-foreground">
                  Esta empresa no tiene usuarios asignados.
                </p>
              )}
              <p className="text-destructive font-medium">
                Esta acción es permanente y no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading === companyToDelete?.id}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCompany}
              disabled={deleteLoading === companyToDelete?.id}
            >
              {deleteLoading === companyToDelete?.id ? "Eliminando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
