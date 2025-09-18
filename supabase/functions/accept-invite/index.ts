import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('invite');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing invite token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Validate invite token
    const { data: invite, error } = await supabase
      .from('maity.invite_links')
      .select('*')
      .eq('token', token)
      .eq('is_revoked', false)
      .single();

    if (error || !invite) {
      console.log('Invite not found or error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid invite token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if invite is expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Invite token has expired' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if invite has reached max uses
    if (invite.max_uses && invite.used_count >= invite.max_uses) {
      return new Response(
        JSON.stringify({ error: 'Invite token has reached maximum uses' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set cookie and redirect
    const cookieValue = `invite_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1800; Domain=maity.com.mx`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Set-Cookie': cookieValue,
        'Location': 'https://maity.com.mx/auth'
      }
    });

  } catch (error) {
    console.error('Error in accept-invite function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});