-- Migration: Add admin-only delete for Omi conversations
-- Purpose: Allow admins to soft-delete any conversation (set deleted=true)
-- Security: Double verification - UI checks isAdmin + RPC verifies role

-- RPC Function with admin verification in maity schema
CREATE OR REPLACE FUNCTION maity.admin_delete_conversation(p_conversation_id uuid)
RETURNS void AS $$
BEGIN
  -- Verify that the user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles ur
    JOIN maity.users u ON u.id = ur.user_id
    WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can delete conversations';
  END IF;

  -- Verify conversation exists
  IF NOT EXISTS (
    SELECT 1 FROM maity.omi_conversations WHERE id = p_conversation_id
  ) THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  -- Soft delete: mark as deleted
  UPDATE maity.omi_conversations
  SET deleted = true, updated_at = NOW()
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'maity', 'public';

-- Public wrapper (required pattern for maity schema functions)
CREATE OR REPLACE FUNCTION public.admin_delete_conversation(p_conversation_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM maity.admin_delete_conversation(p_conversation_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'maity', 'public';

-- Grant execute to authenticated users (RPC handles admin check internally)
GRANT EXECUTE ON FUNCTION public.admin_delete_conversation(uuid) TO authenticated;
