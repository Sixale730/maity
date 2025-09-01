-- Create RLS policies for org_uploads bucket
-- Allow authenticated users to upload files to their organization folder
CREATE POLICY "Users can upload files to their org folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'org_uploads' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_company_id()::text
);

-- Allow users to view files in their organization folder
CREATE POLICY "Users can view files in their org folder" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'org_uploads' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_company_id()::text
);

-- Allow users to delete files in their organization folder (org_admin only)
CREATE POLICY "Org admins can delete files in their org folder" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'org_uploads' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_company_id()::text
  AND get_user_role() = 'org_admin'
);