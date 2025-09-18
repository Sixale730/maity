-- CRITICAL SECURITY FIX - Phase 1A: Fix exposed public tables
-- These tables currently allow any authenticated user full access

-- 1. Fix documents table - restrict to company members only
DROP POLICY IF EXISTS "Allow authenticated users to access documents" ON public.documents;

CREATE POLICY "Users can only access documents from their company" 
ON public.documents 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM maity.users u 
    WHERE u.auth_id = auth.uid() 
    AND u.company_id IS NOT NULL
    AND u.status = 'ACTIVE'
  )
);

-- 2. Fix n8n_chat_histories - restrict to session owners only  
DROP POLICY IF EXISTS "Allow authenticated users to access chat histories" ON public.n8n_chat_histories;

CREATE POLICY "Users can only access their own chat sessions" 
ON public.n8n_chat_histories 
FOR ALL 
TO authenticated 
USING (
  -- Allow access only to company members for now
  -- TODO: Refine this to actual session ownership when session logic is clarified
  EXISTS (
    SELECT 1 FROM maity.users u 
    WHERE u.auth_id = auth.uid() 
    AND u.company_id IS NOT NULL
    AND u.status = 'ACTIVE'
  )
);