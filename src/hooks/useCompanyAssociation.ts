import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyAssociationResult {
  success: boolean;
  message?: string;
  error?: string;
  company_name?: string;
}

export const useCompanyAssociation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const associateUserWithCompany = async (
    userId: string,
    companyId: string,
    userEmail: string
  ): Promise<CompanyAssociationResult> => {
    setLoading(true);

    try {
      console.log('[DEBUG] useCompanyAssociation: Starting association', {
        userId,
        companyId,
        userEmail
      });

      // Use the existing provision_user_with_company function
      const { data: result, error } = await supabase.rpc('provision_user_with_company', {
        company_slug: companyId,
        invitation_source: window.location.href
      });

      if (error) {
        console.error('[DEBUG] useCompanyAssociation: Function error', error);
        return {
          success: false,
          error: 'FUNCTION_ERROR',
          message: 'Error al asociar usuario con empresa'
        };
      }

      console.log('[DEBUG] useCompanyAssociation: Function result', result);

      if (!error && result && (result as any)?.success) {
        toast({
          title: 'Éxito',
          description: 'Usuario asociado con empresa exitosamente',
        });

        return {
          success: true,
          message: 'Usuario asociado con empresa exitosamente'
        };
      } else {
        console.error('[DEBUG] useCompanyAssociation: Association failed', result, error);
        toast({
          title: 'Error',
          description: error?.message || 'No se pudo asociar el usuario con la empresa',
          variant: 'destructive',
        });

        return {
          success: false,
          error: error?.message || 'ASSOCIATION_FAILED',
          message: error?.message || 'No se pudo asociar el usuario con la empresa'
        };
      }

    } catch (error) {
      console.error('[DEBUG] useCompanyAssociation: Unexpected error', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado al asociar el usuario',
        variant: 'destructive',
      });

      return {
        success: false,
        error: 'UNEXPECTED_ERROR',
        message: 'Ocurrió un error inesperado'
      };
    } finally {
      setLoading(false);
    }
  };

  const associateUserFromMetadata = async (
    userId: string,
    userEmail: string
  ): Promise<CompanyAssociationResult | null> => {
    try {
      console.log('[DEBUG] useCompanyAssociation: Checking user metadata for company_id');

      // Get user metadata to check for company_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('[DEBUG] useCompanyAssociation: User error', userError);
        return null;
      }

      const companyId = user.user_metadata?.company_id;
      
      if (!companyId) {
        console.log('[DEBUG] useCompanyAssociation: No company_id in metadata');
        return null;
      }

      console.log('[DEBUG] useCompanyAssociation: Found company_id in metadata', companyId);

      // Associate user with company
      return await associateUserWithCompany(userId, companyId, userEmail);

    } catch (error) {
      console.error('[DEBUG] useCompanyAssociation: Metadata check error', error);
      return null;
    }
  };

  return {
    associateUserWithCompany,
    associateUserFromMetadata,
    loading
  };
};
