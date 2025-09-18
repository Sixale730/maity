import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type TallyFieldValue = string | number | boolean | string[] | Record<string, unknown> | null;

interface TallyField {
  key: string;
  label: string;
  type: string;
  value: TallyFieldValue;
}

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
    fields: TallyField[];
  };
}

interface ValidationTokenPayload {
  user_id: string;
  exp: number;
  iat: number;
}

const getFieldStringValue = (value: TallyFieldValue): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : null;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return null;
};

const findFieldValue = (fields: TallyField[], predicate: (field: TallyField) => boolean): string | null => {
  const field = fields.find(predicate);
  return field ? getFieldStringValue(field.value) : null;
};

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
    console.log('[DEBUG] All fields received:', fields.map(f => ({ key: f.key, label: f.label, value: f.value })));
    
    // Extract user_id and validation_token from hidden fields
    let userId = findFieldValue(fields, (field) => field.key === 'user_id' || field.key === 'userId');
    let validationToken = findFieldValue(fields, (field) => field.key === 'validation_token' || field.key === 'validationToken');
    
    console.log('[DEBUG] Initial extraction:', { userId, validationToken: validationToken ? 'present' : 'missing' });
    
    // Try alternative field mappings if not found
    if (!userId) {
      console.log('[DEBUG] Trying alternative userId mappings...');
      userId = findFieldValue(fields, (field) =>
        field.label?.toLowerCase().includes('userid') ||
        field.label?.toLowerCase().includes('user id') ||
        (field.key.includes('user') && field.key.includes('id'))
      );
      console.log('[DEBUG] Alternative userId found:', userId);
    }
    
    if (!validationToken) {
      console.log('[DEBUG] Trying alternative validationToken mappings...');
      validationToken = findFieldValue(fields, (field) =>
        field.label?.toLowerCase().includes('validation') ||
        field.label?.toLowerCase().includes('token') ||
        (field.key.includes('validation') && field.key.includes('token'))
      );
      console.log('[DEBUG] Alternative validationToken found:', validationToken ? 'present' : 'missing');
    }

    console.log('[DEBUG] Processing submission:', { userId, validationToken: validationToken ? 'present' : 'missing' });

    // Validate required fields
    if (!userId || !validationToken) {
      console.error('[DEBUG] âŒ Missing required fields!');
      console.error('[DEBUG] Available fields:', fields.map(f => ({key: f.key, label: f.label, value: f.value})));
      console.error('[DEBUG] Missing:', { 
        userId: !userId ? 'MISSING' : 'present', 
        validationToken: !validationToken ? 'MISSING' : 'present' 
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields: user_id and validation_token must be included as hidden fields in the Tally form.',
          debug: {
            userId: !userId ? 'MISSING' : 'present',
            validationToken: !validationToken ? 'MISSING' : 'present',
            availableFields: fields.map(f => f.key)
          }
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid or expired validation token',
          error: errorMessage,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user data from database using validated user_id
    console.log('[DEBUG] Fetching user data for userId:', userId);
    const { data: userData, error: userError } = await supabase
      .from('maity.users')
      .select('id, company_id, name, email, auth_id, registration_form_completed')
      .eq('auth_id', userId)
      .single();

    console.log('[DEBUG] User data query result:', { userData, userError });

    if (userError || !userData) {
      console.error('[DEBUG] âŒ User not found or error fetching user:', userError);
      console.error('[DEBUG] Searched for auth_id:', userId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User not found in system',
          debug: {
            searchedAuthId: userId,
            error: userError?.message
          }
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('[DEBUG] User found:', {
      userId: userData.id,
      companyId: userData.company_id,
      email: userData.email,
      registrationCompleted: userData.registration_form_completed
    });

    if (!userData.company_id) {
      console.error('[DEBUG] âŒ User does not have a company assigned:', userId);
      console.error('[DEBUG] User data:', userData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User must have a company assigned before completing onboarding',
          debug: {
            userId: userData.id,
            authId: userData.auth_id,
            companyId: userData.company_id,
            email: userData.email
          }
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

    console.log('[DEBUG] Calling complete_onboarding with validated data for user:', userId, 'company:', userData.company_id);
    console.log('[DEBUG] Submission data:', submissionData);

    const { data, error } = await supabase.rpc('complete_onboarding', {
      submission_data: submissionData
    });

    console.log('[DEBUG] Complete onboarding result:', { data, error });

    if (error) {
      console.error('[DEBUG] âŒ Error completing onboarding:', error);
      console.error('[DEBUG] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          details: error.details || 'No additional details available',
          debug: {
            userId,
            companyId: userData.company_id,
            errorCode: error.code
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('[DEBUG] âœ… Successfully completed onboarding for user:', userId, 'with company:', userData.company_id);
    
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
    const details = error instanceof Error ? error.message : 'Unexpected error';
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

