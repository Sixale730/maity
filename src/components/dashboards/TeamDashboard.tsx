
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Cargar archivos subidos al montar el componente
  useEffect(() => {
    loadUploadedFiles();
  }, []);

  const loadUploadedFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: files, error } = await supabase.storage
        .from('org_uploads')
        .list('csv_imports', {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error loading files:', error);
        return;
      }

      const fileList = files?.map(file => ({
        name: file.name,
        path: `csv_imports/${file.name}`,
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error de formato",
        description: "Solo se permiten archivos CSV (.csv)",
        variant: "destructive",
      });
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    await uploadToStorage(file);
  };

  const uploadToStorage = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No se encontró usuario autenticado');
      }

      // Crear ruta simple: csv_imports/timestamp_filename.csv
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `csv_imports/${fileName}`;

      // Simular progreso
      setUploadProgress(20);

      // Subir archivo a Storage
      const { error: uploadError } = await supabase.storage
        .from('org_uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      setUploadProgress(80);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(100);
      
      // Agregar archivo a la lista
      const newFile: UploadedFile = {
        name: fileName,
        path: filePath,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      
      setUploadedFiles(prev => [newFile, ...prev]);
      
      toast({
        title: "¡Archivo subido exitosamente!",
        description: `${file.name} se guardó como ${fileName}`,
      });

      // Limpiar selección
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error al subir archivo",
        description: error.message || "No se pudo subir el archivo",
        variant: "destructive",
      });
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
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
              Descargar Plantilla
            </Button>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Subiendo archivo...
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
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
