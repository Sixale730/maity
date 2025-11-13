-- Check interview session details
SELECT 
  id,
  user_id,
  started_at,
  ended_at,
  status,
  evaluation_id,
  LENGTH(raw_transcript) as transcript_length,
  created_at
FROM maity.interview_sessions
WHERE id = '5d96fd9d-1760-4094-a94f-a75e35994bf8';

-- Check if evaluation already exists
SELECT 
  request_id,
  session_id,
  user_id,
  status,
  interviewee_name,
  created_at,
  updated_at,
  LENGTH(analysis_text) as analysis_length
FROM maity.interview_evaluations
WHERE session_id = '5d96fd9d-1760-4094-a94f-a75e35994bf8';

-- Get user details for the session
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.auth_id
FROM maity.interview_sessions s
JOIN maity.users u ON u.id = s.user_id
WHERE s.id = '5d96fd9d-1760-4094-a94f-a75e35994bf8';
