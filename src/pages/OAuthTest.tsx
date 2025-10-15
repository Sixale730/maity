import React, { useState } from 'react';
import { Button } from "@/ui/components/ui/button";
import { getAppUrl } from "@maity/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { supabase } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';
import MaityLogo from '@/shared/components/MaityLogo';

console.log('[DEBUG] OAuthTest: Component loaded');

const OAuthTest = () => {
  console.log('[DEBUG] OAuthTest: Component rendering');
  
  const [companyId, setCompanyId] = useState('9368d119-ec44-4d9a-a94f-b1a4bff39d6d');
  const appUrl = getAppUrl();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testOAuth = async (provider: 'google' | 'azure') => {
    setLoading(true);
    
    try {
      console.log('[DEBUG] OAuthTest: Testing OAuth with provider', provider);
      
      // Simple redirect URL without query parameters first
      const redirectUrl = `${appUrl}/auth/callback`;
      
      console.log('[DEBUG] OAuthTest: Redirect URL', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('[DEBUG] OAuthTest: OAuth error', error);
        toast({
          title: "Error",
          description: error.message || "Error en OAuth",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('[DEBUG] OAuthTest: Unexpected error', error);
      toast({
        title: "Error",
        description: "Error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testOAuthWithCompany = async (provider: 'google' | 'azure') => {
    setLoading(true);
    
    try {
      console.log('[DEBUG] OAuthTest: Testing OAuth with company', { provider, companyId });
      
      // Redirect URL with company_id as query parameter
      const redirectUrl = `${appUrl}/auth/callback?company_id=${companyId}&return_to=/dashboard`;
      
      console.log('[DEBUG] OAuthTest: Redirect URL with company', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('[DEBUG] OAuthTest: OAuth error', error);
        toast({
          title: "Error",
          description: error.message || "Error en OAuth",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('[DEBUG] OAuthTest: Unexpected error', error);
      toast({
        title: "Error",
        description: "Error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MaityLogo variant="full" size="lg" />
          </div>
          <CardTitle className="font-geist text-2xl">Prueba OAuth</CardTitle>
          <CardDescription className="font-inter">
            Prueba la configuración de OAuth con diferentes URLs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyId" className="font-inter">Company ID</Label>
            <Input
              id="companyId"
              type="text"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="font-inter"
              placeholder="UUID de la empresa"
            />
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full font-inter"
              onClick={() => testOAuth('google')}
              disabled={loading}
            >
              Probar Google (sin company)
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full font-inter"
              onClick={() => testOAuth('azure')}
              disabled={loading}
            >
              Probar Azure (sin company)
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-inter">
                Con Company ID
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full font-inter"
              onClick={() => testOAuthWithCompany('google')}
              disabled={loading}
            >
              Probar Google (con company)
            </Button>
            
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full font-inter"
              onClick={() => testOAuthWithCompany('azure')}
              disabled={loading}
            >
              Probar Azure (con company)
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground font-inter">
              URL actual: <code className="bg-muted px-1 rounded">{appUrl}</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthTest;
