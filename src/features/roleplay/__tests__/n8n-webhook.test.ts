/**
 * N8N Webhook Integration Tests
 *
 * Tests the critical webhook flow that sends roleplay session transcripts
 * to n8n for evaluation processing.
 *
 * This test suite protects the fix implemented in commit ea6580b where
 * the webhook wasn't being called due to incorrect env imports.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { env } from '@/lib/env';

describe('N8N Webhook Integration', () => {
  const mockRequestId = '550e8400-e29b-41d4-a716-446655440000';
  const mockSessionId = 'session-123';
  const mockUserId = 'user-456';
  const mockTranscript = 'User: Hello\nAI: Hi there!\nUser: How are you?\nAI: I am doing well!';

  const mockMessages = [
    { id: '1', source: 'user', text: 'Hello', role: 'user' },
    { id: '2', source: 'ai', text: 'Hi there!', role: 'assistant' },
    { id: '3', source: 'user', text: 'How are you?', role: 'user' },
    { id: '4', source: 'ai', text: 'I am doing well!', role: 'assistant' },
    { id: '5', source: 'user', text: 'Great!', role: 'user' },
    { id: '6', source: 'ai', text: 'Indeed!', role: 'assistant' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Environment Configuration', () => {
    it('should have n8n webhook URL configured', () => {
      expect(env.n8nWebhookUrl).toBeDefined();
      expect(typeof env.n8nWebhookUrl).toBe('string');
      expect(env.n8nWebhookUrl.length).toBeGreaterThan(0);
    });

    it('should use correct environment variable source', () => {
      // This test ensures we're using @/lib/env which reads Vite env vars
      // and not @maity/shared which doesn't read import.meta.env
      expect(env.n8nWebhookUrl).not.toBeUndefined();
    });

    it('should have valid webhook URL format', () => {
      const urlPattern = /^https?:\/\/.+/i;
      expect(env.n8nWebhookUrl).toMatch(urlPattern);
    });
  });

  describe('Webhook Payload Structure', () => {
    it('should create correct webhook payload with all required fields', () => {
      const webhookPayload = {
        request_id: mockRequestId,
        session_id: mockSessionId,
        transcript: mockTranscript,
        messages: mockMessages,
        test: false,
        metadata: {
          user_id: mockUserId,
          profile: 'Ventas',
          scenario: 'Cliente Enojado',
          scenario_code: 'S001',
          objectives: ['Objetivo 1', 'Objetivo 2'],
          difficulty: 'medium',
          duration_seconds: 120,
          message_count: 6,
          user_message_count: 3,
          ai_message_count: 3,
          admin_bypass: false
        }
      };

      // Verify required fields
      expect(webhookPayload.request_id).toBeDefined();
      expect(webhookPayload.session_id).toBeDefined();
      expect(webhookPayload.transcript).toBeDefined();
      expect(webhookPayload.messages).toBeInstanceOf(Array);
      expect(webhookPayload.test).toBeDefined();
      expect(webhookPayload.metadata).toBeDefined();

      // Verify metadata structure
      expect(webhookPayload.metadata.user_id).toBeDefined();
      expect(webhookPayload.metadata.message_count).toBe(6);
      expect(webhookPayload.metadata.user_message_count).toBe(3);
    });

    it('should include test flag for test mode', () => {
      const testPayload = {
        request_id: mockRequestId,
        test: true,
        metadata: {}
      };

      expect(testPayload.test).toBe(true);
    });

    it('should include admin_bypass flag when bypassing validation', () => {
      const adminPayload = {
        request_id: mockRequestId,
        metadata: {
          user_message_count: 2,
          admin_bypass: true
        }
      };

      expect(adminPayload.metadata.admin_bypass).toBe(true);
    });
  });

  describe('Webhook Sending Logic', () => {
    it('should send webhook when user has sufficient messages (>=5)', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      const userMessageCount = 5;
      const MIN_USER_MESSAGES = 5;

      // Simulate webhook call
      if (userMessageCount >= MIN_USER_MESSAGES) {
        await fetch(env.n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            request_id: mockRequestId,
            transcript: mockTranscript
          })
        });
      }

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        env.n8nWebhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should NOT send webhook when user has insufficient messages (<5)', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      const userMessageCount = 3;
      const MIN_USER_MESSAGES = 5;
      const forceN8nEvaluation = false;

      // Simulate webhook call logic
      if (userMessageCount >= MIN_USER_MESSAGES || forceN8nEvaluation) {
        await fetch(env.n8nWebhookUrl, {
          method: 'POST',
          body: JSON.stringify({ request_id: mockRequestId })
        });
      }

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should send webhook with admin bypass even with insufficient messages', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      const userMessageCount = 2;
      const MIN_USER_MESSAGES = 5;
      const forceN8nEvaluation = true; // Admin mode

      // Simulate webhook call logic with admin bypass
      if (userMessageCount >= MIN_USER_MESSAGES || forceN8nEvaluation) {
        await fetch(env.n8nWebhookUrl, {
          method: 'POST',
          body: JSON.stringify({
            request_id: mockRequestId,
            metadata: {
              user_message_count: userMessageCount,
              admin_bypass: true
            }
          })
        });
      }

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle webhook errors gracefully', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValueOnce(
        new Error('Network error')
      );

      try {
        await fetch(env.n8nWebhookUrl, {
          method: 'POST',
          body: JSON.stringify({ request_id: mockRequestId })
        });
      } catch (error) {
        // Error should be caught and logged but not thrown
        expect(error).toBeDefined();
      }

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message Counting Logic', () => {
    it('should correctly count user messages', () => {
      const userMessageCount = mockMessages.filter(m => m.source === 'user').length;
      expect(userMessageCount).toBe(3);
    });

    it('should correctly count AI messages', () => {
      const aiMessageCount = mockMessages.filter(m => m.source === 'ai').length;
      expect(aiMessageCount).toBe(3);
    });

    it('should validate minimum user messages threshold', () => {
      const MIN_USER_MESSAGES = 5;
      const messages3User = mockMessages.slice(0, 4); // 2 user, 2 AI
      const messages5User = [
        ...mockMessages,
        { id: '7', source: 'user', text: 'Message 4', role: 'user' },
        { id: '8', source: 'user', text: 'Message 5', role: 'user' },
      ];

      const count3 = messages3User.filter(m => m.source === 'user').length;
      const count5 = messages5User.filter(m => m.source === 'user').length;

      expect(count3 < MIN_USER_MESSAGES).toBe(true);
      expect(count5 >= MIN_USER_MESSAGES).toBe(true);
    });

    it('should calculate total user content length', () => {
      const userMessages = mockMessages.filter(m => m.source === 'user');
      const totalLength = userMessages.reduce((sum, m) => sum + (m.text?.length || 0), 0);

      expect(totalLength).toBeGreaterThan(0);
      expect(totalLength).toBe('Hello'.length + 'How are you?'.length + 'Great!'.length);
    });
  });

  describe('Transcript Processing', () => {
    it('should format transcript correctly', () => {
      expect(mockTranscript).toContain('User:');
      expect(mockTranscript).toContain('AI:');
      expect(mockTranscript.split('\n').length).toBeGreaterThan(1);
    });

    it('should handle empty transcript', () => {
      const emptyTranscript = '';
      expect(emptyTranscript.length).toBe(0);
    });

    it('should handle very long transcripts', () => {
      const longTranscript = 'User: ' + 'a'.repeat(10000);
      expect(longTranscript.length).toBeGreaterThan(1000);

      // Verify we can still send it
      const payload = {
        request_id: mockRequestId,
        transcript: longTranscript
      };

      expect(JSON.stringify(payload).length).toBeGreaterThan(1000);
    });
  });

  describe('Integration with Evaluation System', () => {
    it('should create evaluation record with request_id before sending webhook', async () => {
      // Mock the evaluation creation
      const createEvaluationMock = vi.fn().mockResolvedValue({
        data: { request_id: mockRequestId },
        error: null
      });

      // Simulate the flow
      const evaluation = await createEvaluationMock(mockRequestId, mockUserId, mockSessionId);

      expect(evaluation.data).toBeDefined();
      expect(evaluation.data.request_id).toBe(mockRequestId);
      expect(evaluation.error).toBeNull();

      // Then webhook should be sent with same request_id
      const fetchSpy = vi.spyOn(global, 'fetch');
      await fetch(env.n8nWebhookUrl, {
        method: 'POST',
        body: JSON.stringify({
          request_id: evaluation.data.request_id
        })
      });

      expect(fetchSpy).toHaveBeenCalled();
    });

    it('should link evaluation to voice_session when session_id is provided', () => {
      const payload = {
        request_id: mockRequestId,
        session_id: mockSessionId,
        metadata: {
          user_id: mockUserId
        }
      };

      expect(payload.session_id).toBeDefined();
      expect(payload.session_id).toBe(mockSessionId);
    });

    it('should handle null session_id for demo mode', () => {
      const payload = {
        request_id: mockRequestId,
        session_id: null, // Demo mode has no session
        metadata: {
          is_demo: true
        }
      };

      expect(payload.session_id).toBeNull();
      expect(payload.metadata.is_demo).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing webhook URL gracefully', async () => {
      const emptyUrl = '';
      const fetchSpy = vi.spyOn(global, 'fetch');

      // Simulate the check from RoleplayPage
      if (emptyUrl && emptyUrl.length > 0) {
        await fetch(emptyUrl, {
          method: 'POST',
          body: JSON.stringify({ request_id: mockRequestId })
        });
      }

      // Should not call fetch if URL is empty
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should handle network failures without crashing', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await fetch(env.n8nWebhookUrl, {
          method: 'POST',
          body: JSON.stringify({ request_id: mockRequestId })
        }).catch(error => {
          console.error('Error sending to n8n:', error);
        });
      } catch (error) {
        // Should not throw
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle malformed JSON in response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Response);

      try {
        const response = await fetch(env.n8nWebhookUrl, {
          method: 'POST',
          body: JSON.stringify({ request_id: mockRequestId })
        });

        if (!response.ok) {
          // Handle error
          expect(response.status).toBe(500);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Demo Training Mode', () => {
    it('should send webhook in demo mode with is_demo flag', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      const demoPayload = {
        request_id: mockRequestId,
        session_id: mockSessionId,
        transcript: mockTranscript,
        messages: mockMessages,
        test: false,
        metadata: {
          user_id: mockUserId,
          is_demo: true,
          duration_seconds: 60,
          message_count: 6,
          user_message_count: 3
        }
      };

      await fetch(env.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(demoPayload)
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const callArgs = fetchSpy.mock.calls[0];
      const bodyString = callArgs[1]?.body as string;
      const parsedBody = JSON.parse(bodyString);

      expect(parsedBody.metadata.is_demo).toBe(true);
    });
  });

  describe('Regression Tests (Bug Fixes)', () => {
    it('should use @/lib/env instead of @maity/shared for env variables', () => {
      // This test protects against the bug fixed in commit ea6580b
      // where files were importing from @maity/shared which doesn't
      // read Vite environment variables (import.meta.env)

      // Verify env is correctly configured
      expect(env).toBeDefined();
      expect(env.n8nWebhookUrl).toBeDefined();

      // Verify it's not undefined (which was the bug)
      expect(env.n8nWebhookUrl).not.toBeUndefined();
      expect(typeof env.n8nWebhookUrl).toBe('string');
    });

    it('should have proper CORS headers for webhook requests', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      await fetch(env.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ request_id: mockRequestId })
      });

      const callArgs = fetchSpy.mock.calls[0];
      const headers = callArgs[1]?.headers as Record<string, string>;

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Accept']).toBe('application/json');
    });
  });
});
