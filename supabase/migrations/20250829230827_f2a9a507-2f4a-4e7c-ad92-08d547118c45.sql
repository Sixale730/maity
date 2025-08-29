-- Add basic policies for documents table
CREATE POLICY "Allow authenticated users to access documents" 
ON public.documents FOR ALL 
USING (true);

-- Add basic policies for n8n_chat_histories table  
CREATE POLICY "Allow authenticated users to access chat histories" 
ON public.n8n_chat_histories FOR ALL 
USING (true);

-- Fix remaining function search paths
CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
LANGUAGE plpgsql
SET search_path = public
AS $function$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$function$;