#!/usr/bin/env node

/**
 * Test script for /api/evaluations/{request_id}/complete endpoint
 */

const API_URL = 'https://api.maity.cloud';
const N8N_SECRET = 'secret'; // Tu secreto real aquí

async function testEvaluationComplete() {
  const requestId = 'test-' + Date.now();

  const payload = {
    status: 'complete',
    result: {
      score: 85,
      feedback: 'Test evaluation',
      areas: {
        clarity: 90,
        confidence: 80,
        empathy: 85
      }
    }
  };

  const url = `${API_URL}/api/evaluations/${requestId}/complete`;

  console.log('🔵 Testing endpoint:', url);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));
  console.log('🔑 Headers:', {
    'Content-Type': 'application/json',
    'X-N8N-Secret': '***SECRET***'
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-Secret': N8N_SECRET
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    console.log('\n📨 Response:');
    console.log('  Status:', response.status, response.statusText);
    console.log('  Headers:', Object.fromEntries(response.headers.entries()));
    console.log('  Body:', responseText);

    // Intentar parsear como JSON
    try {
      const json = JSON.parse(responseText);
      console.log('  Parsed JSON:', json);
    } catch (e) {
      console.log('  (Not valid JSON)');
    }

    if (response.status === 405) {
      console.error('\n❌ ERROR 405: Method Not Allowed');
      console.log('Posibles causas:');
      console.log('1. La ruta no existe en api.maity.cloud');
      console.log('2. El método HTTP no es POST');
      console.log('3. CORS está bloqueando la solicitud');
    } else if (response.status === 404) {
      console.error('\n❌ ERROR 404: Not Found');
      console.log('El evaluation con request_id', requestId, 'no existe');
    } else if (response.status === 401) {
      console.error('\n❌ ERROR 401: Unauthorized');
      console.log('El secreto X-N8N-Secret es incorrecto');
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message);
  }
}

// Run the test
testEvaluationComplete();