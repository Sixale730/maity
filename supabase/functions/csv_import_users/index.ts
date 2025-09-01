import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData, fileName } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the requesting user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Verify the user is authenticated and get their info
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    // Check if user is org_admin
    const { data: userRole, error: roleError } = await supabase.rpc('get_user_role', {
      user_auth_id: user.id
    });

    if (roleError || userRole !== 'org_admin') {
      throw new Error('Insufficient permissions. Only organization administrators can import users.');
    }

    // Get the user's company_id
    const { data: companyId, error: companyError } = await supabase.rpc('get_user_company_id', {
      user_auth_id: user.id
    });

    if (companyError || !companyId) {
      throw new Error('Could not determine user company');
    }

    console.log(`Processing CSV import for user ${user.id}, company ${companyId}, file: ${fileName}`);

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'email', 'role'];
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const results = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((cell: string) => cell.trim());
      
      if (row.length !== headers.length) {
        results.errors.push(`Row ${i + 1}: Column count mismatch`);
        results.failed++;
        results.totalProcessed++;
        continue;
      }

      const userData: any = {};
      headers.forEach((header, index) => {
        userData[header] = row[index];
      });

      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          throw new Error('Invalid email format');
        }

        // Validate required fields
        if (!userData.name || !userData.email || !userData.role) {
          throw new Error('Missing required fields (name, email, or role)');
        }

        // Create auth user with a temporary password
        const tempPassword = generateRandomPassword();
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            imported_via_csv: true,
            imported_by: user.id,
            imported_at: new Date().toISOString()
          }
        });

        if (authError) {
          throw new Error(`Auth creation failed: ${authError.message}`);
        }

        // Insert user into maity.users table
        const { error: insertError } = await supabase
          .from('maity.users')
          .insert({
            auth_id: authUser.user.id,
            name: userData.name,
            email: userData.email,
            company_id: companyId,
            role: userData.role,
            status: 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          // If user insertion fails, clean up the auth user
          await supabase.auth.admin.deleteUser(authUser.user.id);
          throw new Error(`User insertion failed: ${insertError.message}`);
        }

        results.successful++;
        console.log(`Successfully created user: ${userData.email}`);

      } catch (error: any) {
        results.errors.push(`Row ${i + 1} (${userData.email || 'invalid email'}): ${error.message}`);
        results.failed++;
        console.error(`Failed to create user from row ${i + 1}:`, error);
      }

      results.totalProcessed++;
    }

    console.log(`CSV import completed. Processed: ${results.totalProcessed}, Successful: ${results.successful}, Failed: ${results.failed}`);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in csv_import_users function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: [error.message]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to generate a random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}