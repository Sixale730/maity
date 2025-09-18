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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get access token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing or invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create client with access token to get current user
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid user token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get invite token from cookie
    const cookieHeader = req.headers.get('Cookie');
    if (!cookieHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing invite cookie' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const inviteTokenMatch = cookieHeader.match(/invite_token=([^;]+)/);
    if (!inviteTokenMatch) {
      return new Response(
        JSON.stringify({ error: 'Missing invite cookie' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const inviteToken = inviteTokenMatch[1];

    // Create admin client for database operations
    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Re-validate invite token
    const { data: invite, error: inviteError } = await adminSupabase
      .from('maity.invite_links')
      .select('*')
      .eq('token', inviteToken)
      .eq('is_revoked', false)
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ error: 'Invalid or revoked invite token' }),
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

    let assigned = false;

    // Check current user's company assignment
    const { data: currentUser } = await adminSupabase
      .from('maity.users')
      .select('company_id, role')
      .eq('auth_id', user.id)
      .single();

    // Only assign company if user doesn't have one
    if (!currentUser?.company_id) {
      // Update user with company_id and optionally role
      const updateData: any = { company_id: invite.company_id };
      
      // Check if role column exists by trying to update
      try {
        updateData.role = invite.audience;
      } catch {
        // Role column doesn't exist, ignore
      }

      const { error: updateError } = await adminSupabase
        .from('maity.users')
        .update(updateData)
        .eq('auth_id', user.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to assign company' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      assigned = true;

      // Increment used_count only if company was assigned
      await adminSupabase
        .from('maity.invite_links')
        .update({ used_count: invite.used_count + 1 })
        .eq('id', invite.id);
    }

    // Determine redirect URL based on audience
    const redirectUrl = invite.audience === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard';

    // Clear the invite cookie
    const clearCookieValue = `invite_token=; Max-Age=0; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=maity.com.mx`;

    return new Response(
      JSON.stringify({
        success: true,
        audience: invite.audience,
        assigned,
        redirect: redirectUrl
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': clearCookieValue
        }
      }
    );

  } catch (error) {
    console.error('Error in finalize-invite function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});