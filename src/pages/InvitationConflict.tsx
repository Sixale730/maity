import React, { useState, useEffect } from 'react';
import { Button } from "@/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Alert, AlertDescription } from "@/ui/components/ui/alert";
import { useToast } from "@/shared/hooks/use-toast";
import { supabase } from "@maity/shared";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, Building2, ArrowRight } from "lucide-react";
import MaityLogo from "@/shared/components/MaityLogo";

interface CompanyInfo {
  id: string;
  name: string;
}

interface ConflictData {
  current_company: CompanyInfo;
  target_company: CompanyInfo;
  invitation_source?: string;
}

interface InvitationResult {
  success: boolean;
  action?: string;
  message?: string;
  error?: string;
  company_name?: string;
  previous_company_name?: string;
}

const InvitationConflict = () => {
  const [loading, setLoading] = useState(false);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get conflict data from URL params or session storage
    const currentCompanyName = searchParams.get('current_company');
    const targetCompanyName = searchParams.get('target_company');
    const invitationSource = searchParams.get('source');

    if (!currentCompanyName || !targetCompanyName) {
      // Try to get from session storage as fallback
      const storedConflict = sessionStorage.getItem('invitation_conflict');
      if (storedConflict) {
        try {
          setConflictData(JSON.parse(storedConflict));
          return;
        } catch (error) {
          console.error('Error parsing stored conflict data:', error);
        }
      }
      
      // No conflict data found, redirect to home
      navigate('/');
      return;
    }

    setConflictData({
      current_company: {
        id: searchParams.get('current_id') || '',
        name: currentCompanyName
      },
      target_company: {
        id: searchParams.get('target_id') || '',
        name: targetCompanyName
      },
      invitation_source: invitationSource || undefined
    });
  }, [searchParams, navigate]);

  const handleAcceptInvitation = async () => {
    if (!conflictData?.target_company.id) {
      toast({
        title: "Error",
        description: "Información de invitación incompleta",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('handle_company_invitation', {
        user_auth_id: (await supabase.auth.getUser()).data.user?.id,
        company_slug: conflictData.target_company.id,
        invitation_source: conflictData.invitation_source || window.location.href,
        force_assign: true
      });

      if (error) {
        throw error;
      }

      const invitationResult = result as unknown as InvitationResult;

      if (invitationResult.success) {
        toast({
          title: "¡Invitación aceptada!",
          description: `Ahora perteneces a ${conflictData.target_company.name}`,
        });
        
        // Clear stored conflict data
        sessionStorage.removeItem('invitation_conflict');
        
        // Redirect to registration or dashboard
        navigate(`/registration?company=${conflictData.target_company.id}`);
      } else {
        throw new Error(invitationResult.message || 'Error al procesar la invitación');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo aceptar la invitación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectInvitation = () => {
    // Clear stored conflict data
    sessionStorage.removeItem('invitation_conflict');
    
    toast({
      title: "Invitación rechazada",
      description: "Permaneces en tu organización actual",
    });
    
    // Redirect to dashboard or current company
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    sessionStorage.removeItem('invitation_conflict');
    navigate('/');
  };

  if (!conflictData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MaityLogo variant="full" size="lg" />
          </div>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-warning" />
          </div>
          <CardTitle className="font-geist text-2xl">
            Conflicto de Invitación
          </CardTitle>
          <CardDescription className="font-inter">
            Ya perteneces a una organización diferente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-inter">
              Has sido invitado a unirte a una nueva organización, pero ya perteneces a otra.
            </AlertDescription>
          </Alert>

          {/* Current vs Target Company */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium font-inter">Organización Actual</p>
                  <p className="text-sm text-muted-foreground font-inter">
                    {conflictData.current_company.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium font-inter">Nueva Invitación</p>
                  <p className="text-sm text-muted-foreground font-inter">
                    {conflictData.target_company.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <p className="text-sm font-inter text-warning-foreground">
              <strong>Advertencia:</strong> Si aceptas esta invitación, serás trasladado a la nueva organización 
              y perderás acceso a tu organización actual.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleAcceptInvitation}
              className="w-full font-inter"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Aceptar Invitación'}
            </Button>
            
            <Button 
              onClick={handleRejectInvitation}
              variant="outline" 
              className="w-full font-inter"
              disabled={loading}
            >
              Mantener Organización Actual
            </Button>
          </div>

          {/* Back to home */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleGoHome}
              className="text-sm text-muted-foreground hover:underline font-inter"
              disabled={loading}
            >
              ← Volver al inicio
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationConflict;