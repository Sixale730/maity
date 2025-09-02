
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Users, Download, FileText, CheckCircle, Trash2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
}

const TeamDashboard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [lastObjectPath, setLastObjectPath] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Cargar archivos subidos y company_id al montar el componente
  useEffect(() => {
    loadUserCompany();
    loadUploadedFiles();
  }, []);

  const loadUserCompany = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: companyId, error } = await supabase.rpc('get_user_company_id', {
        user_auth_id: session.user.id
      });

      if (error) {
        console.error('Error loading user company:', error);
        return;
      }

      if (companyId) {
        setCompanyId(companyId);
      }
    } catch (error) {
      console.error('Error loading user company:', error);
    }
  };

  const loadUploadedFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get company_id using RPC
      const { data: companyId } = await supabase.rpc('get_user_company_id', {
        user_auth_id: session.user.id
      });

      if (!companyId) {
        console.error('No company_id found for user');
        return;
      }

      const { data: files, error } = await supabase.storage
        .from('org_uploads')
        .list(companyId, {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error loading files:', error);
        return;
      }

      const fileList = files?.map(file => ({
        name: file.name,
        path: `${companyId}/${file.name}`,
        size: file.metadata?.size || 0,
        uploadedAt: file.created_at
      })) || [];

      setUploadedFiles(fileList);
    } catch (error) {
      console.error('Error loading uploaded files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleUploadClick = () => {
    const picker = document.querySelector('#csvInput') as HTMLInputElement;
    if (picker) {
      picker.value = '';
      picker.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const picker = event.target;
    const file = picker.files?.[0];
    if (!file) return;

    try {
      // Verificar autenticación
      const { data: s } = await supabase.auth.getSession();
      if (!s?.session) {
        throw new Error("No autenticado");
      }

      // Obtener company_id usando RPC
      const { data: companyId, error: companyError } = await supabase.rpc('get_user_company_id', {
        user_auth_id: s.session.user.id
      });
        
      if (companyError || !companyId) {
        throw new Error("Sin company_id");
      }

      // Generar ruta con formato {company_id}/{YYYY-MM}/{UUID}.csv
      const now = new Date();
      const y = now.getUTCFullYear();
      const m = String(now.getUTCMonth() + 1).padStart(2, "0");
      const objectPath = `${companyId}/${y}-${m}/${crypto.randomUUID()}.csv`;

      console.log('Uploading to path:', objectPath);

      // Subir archivo a Storage con contentType específico
      const { error: upErr } = await supabase.storage
        .from("org_uploads")
        .upload(objectPath, file, { 
          contentType: "text/csv" 
        });
        
      if (upErr) {
        console.error('Upload error:', upErr);
        throw upErr;
      }

      // Guardar objectPath en estado
      setLastObjectPath(objectPath);

      // Actualizar lista de archivos
      const newFile: UploadedFile = {
        name: file.name,
        path: objectPath,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      
      setUploadedFiles(prev => [newFile, ...prev]);

      // Mostrar feedback en UI
      toast({
        title: "Archivo subido ✔️",
        description: `${file.name} guardado en ${objectPath}`,
      });

      console.log('Upload result:', { ok: true, objectPath });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error al subir archivo",
        description: error.message || "No se pudo subir el archivo",
        variant: "destructive",
      });
    }
  };

  const deleteFile = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('org_uploads')
        .remove([filePath]);

      if (error) {
        throw error;
      }

      setUploadedFiles(prev => prev.filter(file => file.path !== filePath));
      
      toast({
        title: "Archivo eliminado",
        description: "El archivo se eliminó correctamente",
      });
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el archivo",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('org_uploads')
        .download(filePath);

      if (error || !data) {
        throw error || new Error('No se pudo descargar el archivo');
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Descarga iniciada",
        description: `Descargando ${fileName}`,
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error al descargar",
        description: error.message || "No se pudo descargar el archivo",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subir Archivos CSV</h1>
          <p className="text-muted-foreground">
            Sube archivos CSV al bucket de almacenamiento de forma segura
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            {uploadedFiles.length} archivos
          </Badge>
        </div>
      </div>

      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Archivo CSV
          </CardTitle>
          <CardDescription>
            Selecciona un archivo CSV para subirlo al bucket de almacenamiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden file input */}
          <input
            id="csvInput"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handleUploadClick}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Seleccionar Archivo CSV
            </Button>
            
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar Plantilla
            </Button>
          </div>

          {lastObjectPath && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Último archivo subido: <code className="text-xs bg-green-100 px-1 rounded">{lastObjectPath}</code>
              </p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p><strong>Formato requerido:</strong></p>
            <p>• Archivo CSV (.csv)</p>
            <p>• Encoding: UTF-8</p>
            <p>• Separador: coma (,)</p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Archivos Subidos
          </CardTitle>
          <CardDescription>
            Lista de archivos CSV subidos al bucket
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFiles ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Cargando archivos...
            </div>
          ) : uploadedFiles.length === 0 ? (
            <p className="text-muted-foreground py-4">No hay archivos subidos aún</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Archivo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Fecha de Subida</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedFiles.map((file) => (
                  <TableRow key={file.path}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {file.name}
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      {new Date(file.uploadedAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(file.path, file.name)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Descargar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteFile(file.path)}
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
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

    </div>
  );
};

export default TeamDashboard;
