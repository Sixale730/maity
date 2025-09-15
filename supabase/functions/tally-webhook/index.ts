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

    // Extract user information from form fields
    let userId: string | null = null;
    let userEmail: string | null = null;
    let validationToken: string | null = null;

    for (const field of payload.data.fields) {
      if (field.key === 'user_id' || field.label.toLowerCase().includes('user_id')) {
        userId = field.value;
      } else if (field.key === 'email' || field.label.toLowerCase().includes('email')) {
        userEmail = field.value;
      } else if (field.key === 'validation_token' || field.label.toLowerCase().includes('validation_token')) {
        validationToken = field.value;
      }
    }

    if (!userId) {
      console.error('No user_id found in form submission');
      return new Response(
        JSON.stringify({ error: 'User ID not found in submission' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate the token if provided
    if (validationToken) {
      try {
        const tokenData = atob(validationToken);
        const [tokenUserId, timestamp] = tokenData.split(':');
        
        if (tokenUserId !== userId) {
          console.error('Token user ID mismatch');
          return new Response(
            JSON.stringify({ error: 'Invalid validation token' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Check if token is not too old (24 hours)
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > 24 * 60 * 60 * 1000) {
          console.error('Validation token expired');
          return new Response(
            JSON.stringify({ error: 'Validation token expired' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } catch (error) {
        console.error('Error validating token:', error);
        return new Response(
          JSON.stringify({ error: 'Invalid validation token format' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Store the submission and complete onboarding using RPC function
    const { error: completeError } = await supabase
      .rpc('complete_onboarding', { 
        submission_data: payload.data 
      });

    if (completeError) {
      console.error('Error completing onboarding:', completeError);
      return new Response(
        JSON.stringify({ error: 'Failed to complete onboarding' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.log('Onboarding completed successfully for user:', userId);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Webhook processed successfully',
        responseId: payload.data.responseId 
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