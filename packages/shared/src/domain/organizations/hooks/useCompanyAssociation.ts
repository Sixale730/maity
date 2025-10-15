import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

interface CompanyAssociationResult {
  success: boolean;
  message?: string;
  error?: string;
  company_name?: string;
}

type ProvisionUserResponse = Database['public']['Functions']['provision_user_with_company']['Returns'];

type ParsedProvisionResult = Partial<CompanyAssociationResult>;

const parseProvisionResult = (data: ProvisionUserResponse): ParsedProvisionResult => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const record = data as Record<string, unknown>;
  const result: ParsedProvisionResult = {};

  if ('success' in record && typeof record.success === 'boolean') {
    result.success = record.success;
  }

  if ('message' in record && typeof record.message === 'string') {
    result.message = record.message;
  }

  if ('error' in record && typeof record.error === 'string') {
    result.error = record.error;
  }

  if ('company_name' in record && typeof record.company_name === 'string') {
    result.company_name = record.company_name;
  }

  return result;
};

export const useCompanyAssociation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const associateUserWithCompany = async (
    userId: string,
    companySlug: string,
    userEmail: string
  ): Promise<CompanyAssociationResult> => {
    setLoading(true);

    try {
      console.log('[DEBUG] useCompanyAssociation: Starting association', {
        userId,
        companySlug,
        userEmail
      });

      const { data: result, error } = await supabase.rpc('provision_user_with_company', {
        company_slug: companySlug,
        invitation_source: window.location.href
      });

      const parsedResult = parseProvisionResult(result);

      if (error) {
        console.error('[DEBUG] useCompanyAssociation: Function error', error);
        const failureMessage = error.message ?? 'Error al asociar usuario con empresa';
        return {
          success: false,
          error: error.message,
          message: failureMessage
        };
      }

      console.log('[DEBUG] useCompanyAssociation: Function result', parsedResult);

      if (parsedResult.success) {
        toast({
          title: 'A%xito',
          description: 'Usuario asociado con empresa exitosamente',
        });

        return {
          success: true,
          message: parsedResult.message ?? 'Usuario asociado con empresa exitosamente',
          company_name: parsedResult.company_name,
        };
      }

      console.error('[DEBUG] useCompanyAssociation: Association failed', parsedResult, error);
      const errorMessage = parsedResult.error ?? error?.message ?? 'No se pudo asociar el usuario con la empresa';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        error: parsedResult.error ?? 'ASSOCIATION_FAILED',
        message: errorMessage,
      };
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

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
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
