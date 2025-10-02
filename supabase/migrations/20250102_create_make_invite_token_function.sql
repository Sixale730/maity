-- Create make_invite_token function in maity schema
CREATE OR REPLACE FUNCTION maity.make_invite_token()
RETURNS TEXT
LANGUAGE sql
VOLATILE
AS $$
  SELECT encode(gen_random_bytes(32), 'hex');
$$;

COMMENT ON FUNCTION maity.make_invite_token IS 'Generates a random hexadecimal token for invitation links using pgcrypto';
