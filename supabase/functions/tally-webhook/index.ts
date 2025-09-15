import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Extract user information from form fields and URL parameters
    const fields = payload.data.fields;
    console.log('All fields received:', fields.map(f => ({ key: f.key, label: f.label, value: f.value })));
    
    // Try different field mappings (Tally might use different keys)
    let userId = fields.find((f: any) => f.key === 'user_id' || f.key === 'userId')?.value;
    let userEmail = fields.find((f: any) => f.key === 'user_email' || f.key === 'userEmail')?.value;
    let validationToken = fields.find((f: any) => f.key === 'validation_token' || f.key === 'validationToken')?.value;
    
    // If not found in fields, might be in hidden fields or URL params embedded by Tally
    // Tally sometimes embeds URL params as hidden fields with different naming
    if (!userId) {
      userId = fields.find((f: any) => f.label?.toLowerCase().includes('userid') || f.label?.toLowerCase().includes('user id'))?.value;
    }
    if (!userEmail) {
      userEmail = fields.find((f: any) => f.label?.toLowerCase().includes('email') || f.type === 'EMAIL')?.value;
    }

    console.log('Processing submission:', { userId, userEmail, validationToken });

    if (!userId || !userEmail) {
      console.log('Missing required fields, ignoring submission');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields: user_id or user_email' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify that the user already has a company assigned (should have been done at auth time)
    const { data: userData, error: userError } = await supabase
      .from('maity.users')
      .select('company_id, name')
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

    // If validation token is provided, validate it
    let tokenValidationError = null;
    
    if (validationToken) {
      console.log('Validating token...');
      
      try {
        // Parse the token (assuming it's base64 encoded JSON)
        const tokenData = JSON.parse(atob(validationToken));
        const { userId: tokenUserId, expiresAt } = tokenData;
        
        // Check if token matches user and hasn't expired
        if (tokenUserId !== userId) {
          tokenValidationError = 'Token user ID mismatch';
        } else if (new Date(expiresAt) < new Date()) {
          tokenValidationError = 'Token has expired';
        }
        
        console.log('Token validation result:', { 
          valid: !tokenValidationError, 
          error: tokenValidationError 
        });
        
      } catch (error) {
        console.error('Token parsing error:', error);
        tokenValidationError = 'Invalid token format';
      }
    }

    // Call the complete_onboarding function with submission data
    const submissionData = {
      eventId: payload.eventId,
      formId: payload.data.formId,
      responseId: payload.data.responseId,
      fields: fields,
      submittedAt: payload.createdAt,
      validationToken: validationToken,
      tokenValidationError: tokenValidationError,
      userCompanyId: userData.company_id
    };

    console.log('Calling complete_onboarding with data:', submissionData);

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
        companyId: userData.company_id,
        tokenValidated: !tokenValidationError
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing Tally webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});