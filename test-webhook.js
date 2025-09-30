#!/usr/bin/env node

/**
 * Test script for webhook integration
 * Sends a test payload to the n8n webhook with a unique request_id
 */

const webhookUrl = 'https://aca-maity.lemonglacier-45d07388.eastus2.azurecontainerapps.io/webhook/transcription';

async function testWebhook() {
  const requestId = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const payload = {
    request_id: requestId,
    session_id: null,
    transcript: "Esta es una transcripción de prueba para verificar que el webhook está recibiendo correctamente el request_id.",
    metadata: {
      user_id: "test-user-123",
      profile: "intermediate",
      scenario: "job_interview",
      difficulty: "medium",
      duration_seconds: 120
    }
  };

  console.log('🔵 Sending test webhook with request_id:', requestId);
  console.log('📦 Full payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    console.log('\n📨 Response:');
    console.log('  Status:', response.status, response.statusText);
    console.log('  Headers:', Object.fromEntries(response.headers.entries()));
    console.log('  Body:', responseText);

    if (response.ok) {
      console.log('\n✅ SUCCESS: Webhook received the request');
      console.log('🔑 Request ID sent:', requestId);
      console.log('\n📝 Next steps:');
      console.log('1. Check n8n workflow execution logs');
      console.log('2. Verify request_id appears in the webhook node');
      console.log('3. Check if evaluation is created in Supabase');
    } else {
      console.error('\n❌ ERROR: Webhook returned error status');
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message);
  }
}

// Run the test
testWebhook();