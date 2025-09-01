import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Users, Download, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  role: string;
  joinDate: string;
}

const TeamDashboard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [teamMembers] = useState<TeamMember[]>([]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: t('dashboard.team.csv_error'),
        variant: "destructive",
      });
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadResults(null);
  };

  const handleImportUsers = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadResults(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch('https://nhlrtflkxoojvhbyocet.functions.supabase.co/csv_import_users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUploadResults(data);
      
      toast({
        title: t('dashboard.team.upload_success'),
        description: `Se procesaron ${data.totalProcessed} registros. ${data.successful} exitosos, ${data.failed} fallidos.`,
      });

      // Reset everything after successful import
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Error importing CSV:', error);
      toast({
        title: t('dashboard.team.upload_error'),
        description: error.message || "Hubo un problema al importar el archivo CSV",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvTemplate = `name,email,phone
Juan Pérez,juan.perez@empresa.com,+52 55 1234 5678
María García,maria.garcia@empresa.com,+52 55 8765 4321
Carlos López,carlos.lopez@empresa.com,+52 55 5555 1234`;

    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'plantilla_usuarios.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: t('dashboard.team.template_downloaded'),
      description: "Se ha descargado la plantilla CSV para cargar usuarios",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-accent text-accent-foreground">{t('dashboard.team.status_active')}</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">{t('dashboard.team.status_pending')}</Badge>;
      case 'SUSPENDED':
        return <Badge variant="destructive">{t('dashboard.team.status_suspended')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.team.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.team.description')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {teamMembers.length} miembros
          </Badge>
        </div>
      </div>

      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('dashboard.team.upload_csv')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.team.upload_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="max-w-sm"
            />
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('dashboard.team.download_template')}
            </Button>
          </div>

          {isUploading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              {t('dashboard.team.processing')}
            </div>
          )}

          {uploadResults && (
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('dashboard.team.results_title')}
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>{t('dashboard.team.successful')}: {uploadResults.successful}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span>{t('dashboard.team.failed')}: {uploadResults.failed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{t('dashboard.team.total')}: {uploadResults.totalProcessed}</span>
                </div>
              </div>
              
              {uploadResults.errors && uploadResults.errors.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-destructive mb-1">{t('dashboard.team.errors')}:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {uploadResults.errors.slice(0, 5).map((error: string, index: number) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-destructive mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                    {uploadResults.errors.length > 5 && (
                      <li className="italic">... y {uploadResults.errors.length - 5} errores más</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {selectedFile && (
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Archivo seleccionado
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                📄 {selectedFile.name}
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleImportUsers}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  {isUploading ? 'Importando...' : 'Importar Usuarios'}
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  variant="outline"
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p><strong>{t('dashboard.team.format_required')}:</strong></p>
            <p>• Columnas: name, email, phone</p>
            <p>• Encoding: UTF-8</p>
            <p>• Separrador: coma (,)</p>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      {teamMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.team.members')}</CardTitle>
            <CardDescription>
              {t('dashboard.team.members_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.team.name')}</TableHead>
                  <TableHead>{t('dashboard.team.email')}</TableHead>
                  <TableHead>{t('dashboard.team.role')}</TableHead>
                  <TableHead>{t('dashboard.team.status')}</TableHead>
                  <TableHead>{t('dashboard.team.join_date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamDashboard;