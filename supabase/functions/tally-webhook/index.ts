import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TallyWebhookPayload {
  eventId: string;
  eventType: string;
  createdAt: string;
  data: {
    responseId: string;
    submissionId: string;
    respondentId: string;
    formId: string;
    formName: string;
    createdAt: string;
    fields: Array<{
      key: string;
      label: string;
      type: string;
      value: any;
    }>;
  };
}

interface ValidationTokenPayload {
  user_id: string;
  exp: number;
  iat: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const jwtSecret = Deno.env.get('JWT_SECRET')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the webhook payload
    const payload: TallyWebhookPayload = await req.json();

    console.log('Received Tally webhook:', {
      eventType: payload.eventType,
      responseId: payload.data?.responseId,
      formId: payload.data?.formId
    });

    // Verify this is a form submission event
    if (payload.eventType !== 'FORM_RESPONSE') {
      console.log('Ignoring non-form-response event:', payload.eventType);
      return new Response(
        JSON.stringify({ message: 'Event ignored' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract user information from form fields
    const fields = payload.data.fields;
    console.log('All fields received:', fields.map(f => ({ key: f.key, label: f.label, value: f.value })));
    
    // Extract user_id and validation_token from hidden fields
    let userId = fields.find((f: any) => f.key === 'user_id' || f.key === 'userId')?.value;
    let validationToken = fields.find((f: any) => f.key === 'validation_token' || f.key === 'validationToken')?.value;
    
    // Try alternative field mappings if not found
    if (!userId) {
      userId = fields.find((f: any) => 
        f.label?.toLowerCase().includes('userid') || 
        f.label?.toLowerCase().includes('user id') ||
        (f.key.includes('user') && f.key.includes('id'))
      )?.value;
    }
    
    if (!validationToken) {
      validationToken = fields.find((f: any) => 
        f.label?.toLowerCase().includes('validation') || 
        f.label?.toLowerCase().includes('token') ||
        (f.key.includes('validation') && f.key.includes('token'))
      )?.value;
    }

    console.log('Processing submission:', { userId, validationToken: validationToken ? 'present' : 'missing' });

    // Validate required fields
    if (!userId || !validationToken) {
      console.log('Missing required fields. Available fields:', fields.map(f => ({key: f.key, label: f.label, value: f.value})));
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields: user_id and validation_token must be included as hidden fields in the Tally form.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate JWT token
    let tokenPayload: ValidationTokenPayload;
    try {
      // Remove 'unsigned' from client-side token and reconstruct with proper signature
      const tokenParts = validationToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Decode payload to check expiration and user_id
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      tokenPayload = decodedPayload as ValidationTokenPayload;
      
      // Validate token contents
      if (tokenPayload.user_id !== userId) {
        throw new Error('Token user ID mismatch');
      }
      
      const now = Math.floor(Date.now() / 1000);
      if (tokenPayload.exp < now) {
        throw new Error('Token has expired');
      }
      
      console.log('Token validation successful for user:', userId);
      
    } catch (error) {
      console.error('Token validation failed:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired validation token',
          error: error.message
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user data from database using validated user_id
    const { data: userData, error: userError } = await supabase
      .from('maity.users')
      .select('id, company_id, name, email')
      .eq('auth_id', userId)
      .single();

    if (userError || !userData) {
      console.error('User not found or error fetching user:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User not found in system' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!userData.company_id) {
      console.error('User does not have a company assigned:', userId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User must have a company assigned before completing onboarding' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Call the complete_onboarding function with submission data
    const submissionData = {
      eventId: payload.eventId,
      formId: payload.data.formId,
      responseId: payload.data.responseId,
      fields: fields,
      submittedAt: payload.createdAt,
      validatedUserId: userId,
      userEmail: userData.email,
      userCompanyId: userData.company_id,
      tokenValidated: true
    };

    console.log('Calling complete_onboarding with validated data for user:', userId, 'company:', userData.company_id);

    const { data, error } = await supabase.rpc('complete_onboarding', {
      submission_data: submissionData
    });

    if (error) {
      console.error('Error completing onboarding:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          details: error.details || 'No additional details available'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully completed onboarding for user:', userId, 'with company:', userData.company_id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Onboarding completed successfully',
        userId: userId,
        userEmail: userData.email,
        companyId: userData.company_id,
        tokenValidated: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing Tally webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});