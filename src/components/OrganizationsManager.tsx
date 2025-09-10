import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Plus, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Organization {
  id: string;
  name: string;
  slug: string;
  registration_url: string;
  created_at: string;
}

export function OrganizationsManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las organizaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setNewOrgName(name);
    setNewOrgSlug(generateSlug(name));
  };

  const createOrganization = async () => {
    if (!newOrgName.trim() || !newOrgSlug.trim()) {
      toast({
        title: "Error",
        description: "El nombre y el slug son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      const registrationUrl = `${window.location.origin}/registration?org=${newOrgSlug}`;
      
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: newOrgName.trim(),
          slug: newOrgSlug.trim(),
          registration_url: registrationUrl
        }])
        .select()
        .single();

      if (error) throw error;

      setOrganizations([data, ...organizations]);
      setNewOrgName("");
      setNewOrgSlug("");
      setIsDialogOpen(false);
      
      toast({
        title: "Éxito",
        description: "Organización creada correctamente",
      });
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "Ya existe una organización con ese nombre o slug"
          : "No se pudo crear la organización",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Link copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el link",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Organizaciones</h1>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Organizaciones</h1>
            <p className="text-muted-foreground">
              Gestiona las organizaciones y sus links de registro
            </p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Organización
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Organización</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Nombre de la Organización</Label>
                <Input
                  id="orgName"
                  value={newOrgName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Mi Empresa S.A."
                />
              </div>
              <div>
                <Label htmlFor="orgSlug">Slug (URL)</Label>
                <Input
                  id="orgSlug"
                  value={newOrgSlug}
                  onChange={(e) => setNewOrgSlug(e.target.value)}
                  placeholder="mi-empresa-sa"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se usará en la URL de registro: /registration?org={newOrgSlug}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={createOrganization} className="flex-1">
                  Crear Organización
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Organizaciones ({organizations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay organizaciones registradas</p>
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="mt-4"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primera organización
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Link de Registro</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {org.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-sm">
                        <code className="bg-muted px-2 py-1 rounded text-xs truncate flex-1">
                          {org.registration_url}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(org.registration_url)}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(org.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(org.registration_url)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(org.registration_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Abrir
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
    </main>
  );
}