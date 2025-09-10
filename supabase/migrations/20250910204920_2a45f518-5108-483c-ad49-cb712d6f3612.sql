-- Add DELETE policy for platform admins on maity.companies
CREATE POLICY "Platform admins can delete companies" ON maity.companies
FOR DELETE USING (get_user_role() = 'platform_admin'::app_role);

-- Add INSERT policy for platform admins on maity.companies
CREATE POLICY "Platform admins can insert companies" ON maity.companies
FOR INSERT WITH CHECK (get_user_role() = 'platform_admin'::app_role);

-- Add UPDATE policy for platform admins on maity.companies
CREATE POLICY "Platform admins can update companies" ON maity.companies
FOR UPDATE USING (get_user_role() = 'platform_admin'::app_role);