import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  user_id: string;
  company_id: string;
}

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "METHOD_NOT_ALLOWED" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[associate-user-company] Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "MISSING_SUPABASE_CONFIG" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let body: RequestBody;
    try {
      body = await req.json();
    } catch (_error) {
      return new Response(
        JSON.stringify({ success: false, error: "INVALID_JSON" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { user_id, company_id } = body;

    console.log("[associate-user-company] Incoming request", {
      user_id,
      company_id,
    });

    if (!user_id || !company_id) {
      return new Response(
        JSON.stringify({ success: false, error: "MISSING_FIELDS" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!uuidRegex.test(user_id) || !uuidRegex.test(company_id)) {
      return new Response(
        JSON.stringify({ success: false, error: "INVALID_UUID" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: company, error: companyError } = await supabaseClient
      .from("companies")
      .select("id")
      .eq("id", company_id)
      .maybeSingle();

    if (companyError) {
      console.error("[associate-user-company] Error checking company", companyError);
      return new Response(
        JSON.stringify({ success: false, error: "COMPANY_LOOKUP_FAILED" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!company) {
      return new Response(
        JSON.stringify({ success: false, error: "COMPANY_NOT_FOUND" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: existingAssociation, error: lookupError } = await supabaseClient
      .from("user_companies")
      .select("user_id")
      .eq("user_id", user_id)
      .eq("company_id", company_id)
      .maybeSingle();

    if (lookupError) {
      console.error("[associate-user-company] Error checking existing association", lookupError);
      return new Response(
        JSON.stringify({ success: false, error: "ASSOCIATION_LOOKUP_FAILED" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (existingAssociation) {
      console.log("[associate-user-company] Association already exists");
      return new Response(
        JSON.stringify({ success: true, already_associated: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { error: insertError } = await supabaseClient
      .from("user_companies")
      .insert({
        user_id,
        company_id,
      });

    if (insertError) {
      console.error("[associate-user-company] Error inserting association", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "ASSOCIATION_FAILED" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("[associate-user-company] Association created", { user_id, company_id });

    return new Response(
      JSON.stringify({ success: true, company_id, user_id }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[associate-user-company] Unexpected error", error);
    return new Response(
      JSON.stringify({ success: false, error: "UNEXPECTED_ERROR" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
