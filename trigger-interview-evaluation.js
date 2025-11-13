/**
 * Manual Interview Evaluation Trigger Script
 * 
 * This script manually triggers OpenAI evaluation for an interview session.
 * 
 * Usage:
 *   node trigger-interview-evaluation.js <session_id> <bearer_token>
 * 
 * Example:
 *   node trigger-interview-evaluation.js 5d96fd9d-1760-4094-a94f-a75e35994bf8 eyJhbGc...
 */

const SESSION_ID = process.argv[2];
const BEARER_TOKEN = process.argv[3];

if (!SESSION_ID || !BEARER_TOKEN) {
  console.error('Usage: node trigger-interview-evaluation.js <session_id> <bearer_token>');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

async function main() {
  console.log('Interview Evaluation Trigger');
  console.log('Session ID:', SESSION_ID);
  console.log('API URL:', API_URL);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    db: { schema: 'maity' }
  });

  console.log('\nStep 1: Checking session...');
  const sessionResult = await supabase
    .schema('maity')
    .from('interview_sessions')
    .select('*')
    .eq('id', SESSION_ID)
    .single();

  if (sessionResult.error || !sessionResult.data) {
    console.error('Session not found:', sessionResult.error);
    process.exit(1);
  }

  const session = sessionResult.data;
  console.log('Session found');
  console.log('User ID:', session.user_id);
  console.log('Has transcript:', !!session.raw_transcript);

  console.log('\nStep 2: Creating evaluation record...');
  const rpcResult = await supabase.rpc('create_interview_evaluation', {
    p_session_id: SESSION_ID,
    p_user_id: session.user_id
  });

  if (rpcResult.error) {
    console.error('Failed to create evaluation:', rpcResult.error);
    process.exit(1);
  }

  const requestId = rpcResult.data;
  console.log('Evaluation record created');
  console.log('Request ID:', requestId);

  console.log('\nStep 3: Calling evaluation API...');
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch(API_URL + '/api/evaluate-interview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + BEARER_TOKEN
    },
    body: JSON.stringify({
      session_id: SESSION_ID,
      request_id: requestId
    })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('API Error:', result);
    process.exit(1);
  }

  console.log('\nEvaluation completed!');
  console.log('Status:', result.evaluation.status);
  console.log('Is Complete:', result.evaluation.is_complete);
  console.log('\nDone!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
