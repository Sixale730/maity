import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MaityLogo from "@/components/MaityLogo";
import { Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InvitationResult {
  success: boolean;
  action?: string;
  message?: string;
  error?: string;
  company_name?: string;
  current_company?: {
    id: string;
    name: string;
  };
  target_company?: {
    id: string;
    name: string;
    slug: string;
  };
  invitation_source?: string;
}

const Pending = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingInvitation, setProcessingInvitation] = useState(false);

  // Handle company invitation if present, then check status periodically
  useEffect(() => {
    const handleCompanyInvitation = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const companyId = urlParams.get('company');
      
      if (!companyId || processingInvitation) {
        return false; // No company invitation to process
      }

      setProcessingInvitation(true);
      
      try {
        console.log('Processing company invitation from Pending page:', companyId);
        
        // Get company info by ID to get the slug
        const { data: companyData, error: companyError } = await supabase
          .rpc('get_company_by_id', { company_id: companyId });

        if (companyError || !companyData || companyData.length === 0) {
          console.error('Company not found:', companyError);
          toast({
            title: "Error",
            description: "Empresa no encontrada o inactiva",
            variant: "destructive",
          });
          return false;
        }

        const company = companyData[0];
        console.log('Found company:', company);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return false;
        }

        // Use handle_company_invitation
        const { data: result, error } = await supabase.rpc('handle_company_invitation', {
          user_auth_id: user.id,
          company_slug: company.slug,
          invitation_source: window.location.href,
          force_assign: false
        });

        if (error) {
          console.error('Error processing company invitation:', error);
          toast({
            title: "Error",
            description: "No se pudo procesar la invitación de empresa",
            variant: "destructive",
          });
          return false;
        }

        const invitationResult = result as unknown as InvitationResult;
        console.log('Company invitation result:', invitationResult);

        if (invitationResult.success) {
          if (invitationResult.action === 'ASSIGNED' || invitationResult.action === 'NO_CHANGE') {
            toast({
              title: "¡Asignado a empresa!",
              description: `Has sido asignado a ${invitationResult.company_name}`,
            });
            // Redirect to registration
            navigate(`/registration?company=${companyId}`);
            return true;
          } else if (invitationResult.action === 'CONFIRMATION_REQUIRED') {
            // Store conflict data and redirect to confirmation
            const conflictData = {
              current_company: invitationResult.current_company,
              target_company: invitationResult.target_company,
              invitation_source: invitationResult.invitation_source
            };
            sessionStorage.setItem('invitation_conflict', JSON.stringify(conflictData));
            navigate('/invitation-confirm');
            return true;
          }
        }
      } catch (error) {
        console.error('Error processing company invitation:', error);
        toast({
          title: "Error",
          description: "No se pudo procesar la invitación de empresa",
          variant: "destructive",
        });
      } finally {
        setProcessingInvitation(false);
      }
      
      return false;
    };

    const checkStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        // First try to handle company invitation if present
        const invitationProcessed = await handleCompanyInvitation();
        if (invitationProcessed) {
          return; // Don't continue with status check if invitation was processed
        }

        const { data: status } = await supabase.rpc('my_status' as any);
        if (status === 'ACTIVE') {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    checkStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    // Also check on window focus
    const handleWindowFocus = () => {
      checkStatus();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [navigate]);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MaityLogo variant="full" size="lg" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-orange-100 p-3">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="font-geist text-2xl">
            Cuenta en Proceso
          </CardTitle>
          <CardDescription className="font-inter">
            Tu cuenta está siendo activada. Te notificaremos cuando esté lista.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {processingInvitation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mt-0.5 flex-shrink-0"></div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Procesando invitación</p>
                  <p>Estamos procesando tu invitación a la empresa...</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Estado de la cuenta</p>
                <p>
                  Tu cuenta está en proceso de activación. Este proceso puede tomar hasta 24 horas. 
                  Recibirás una notificación por correo electrónico cuando tu cuenta esté lista para usar.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToHome}
              className="font-inter"
            >
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pending;