import { useState, useEffect } from 'react';
import { useEvaluationRealtime, createEvaluation } from '@/hooks/useEvaluationRealtime';
import { supabase } from '@/integrations/supabase/client';

/**
 * Example component showing how to:
 * 1. Get maity user_id from auth
 * 2. Create evaluation record
 * 3. Send transcript to n8n with request_id
 * 4. Listen for realtime updates
 */
export function VoiceEvaluationExample() {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [maityUserId, setMaityUserId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get maity user_id from auth
  useEffect(() => {
    async function fetchMaityUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get maity.users.id from auth_id
      const { data, error } = await supabase
        .schema('maity')
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!error && data) {
        setMaityUserId(data.id);
      }
    }

    fetchMaityUserId();
  }, []);

  // Subscribe to realtime updates for this evaluation
  const { evaluation, isLoading, error } = useEvaluationRealtime({
    requestId: requestId || '',
    onComplete: (result) => {
      console.log('✅ Evaluation complete!', result);
      setIsProcessing(false);
      alert(`Score: ${result.score}/100\n\n${result.feedback}`);
    },
    onError: (errorMessage) => {
      console.error('❌ Evaluation error:', errorMessage);
      setIsProcessing(false);
      alert(`Error: ${errorMessage}`);
    },
  });

  const handleStartEvaluation = async () => {
    if (!maityUserId) {
      alert('User not authenticated');
      return;
    }

    if (!transcript.trim()) {
      alert('Please enter a transcript');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Generate unique request_id
      const newRequestId = crypto.randomUUID();
      console.log('📝 Generated request_id:', newRequestId);

      // 2. Create pending evaluation in database (optionally linked to a session)
      // If you have a sessionId from voice_sessions, pass it as the third parameter
      const sessionId = undefined; // Replace with actual sessionId if available
      const { data, error: createError } = await createEvaluation(
        newRequestId,
        maityUserId,
        sessionId
      );

      if (createError) {
        console.error('Failed to create evaluation:', createError);
        alert('Failed to create evaluation: ' + createError.message);
        setIsProcessing(false);
        return;
      }

      console.log('✅ Evaluation record created:', data);

      // 3. Start listening for realtime updates
      setRequestId(newRequestId);

      // 4. Send transcript + request_id to n8n webhook
      const n8nWebhookUrl = 'https://your-n8n-instance.com/webhook/voice-transcript';

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: newRequestId, // ⚠️ CRITICAL: Must be included
          transcript: transcript,
          metadata: {
            user_id: maityUserId,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.statusText}`);
      }

      console.log('✅ Transcript sent to n8n with request_id:', newRequestId);
      console.log('⏳ Waiting for n8n to process and POST back...');

    } catch (err) {
      console.error('❌ Error:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Voice Evaluation Test</h2>

      {/* Transcript Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Transcript
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Enter conversation transcript here..."
          className="w-full h-32 p-3 border rounded-md"
          disabled={isProcessing}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleStartEvaluation}
        disabled={isProcessing || !maityUserId || !transcript.trim()}
        className="w-full py-3 bg-blue-600 text-white rounded-md font-medium
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   hover:bg-blue-700 transition"
      >
        {isProcessing ? 'Processing...' : 'Start Evaluation'}
      </button>

      {/* Status Display */}
      {requestId && (
        <div className="p-4 border rounded-md bg-gray-50 space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Request ID:</strong> {requestId}
          </p>

          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>Waiting for evaluation...</span>
            </div>
          )}

          {error && (
            <div className="text-red-600">
              <strong>Error:</strong> {error}
            </div>
          )}

          {evaluation && evaluation.status === 'complete' && evaluation.result && (
            <div className="space-y-2">
              <div className="text-green-600 font-medium">
                ✅ Evaluation Complete!
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-lg font-bold mb-2">
                  Score: {evaluation.result.score}/100
                </div>
                {evaluation.result.feedback && (
                  <p className="text-sm text-gray-700 mb-2">
                    {evaluation.result.feedback}
                  </p>
                )}
                {evaluation.result.strengths && (
                  <div className="mb-2">
                    <strong className="text-sm">Strengths:</strong>
                    <ul className="list-disc list-inside text-sm">
                      {evaluation.result.strengths.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evaluation.result.weaknesses && (
                  <div>
                    <strong className="text-sm">Areas for Improvement:</strong>
                    <ul className="list-disc list-inside text-sm">
                      {evaluation.result.weaknesses.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug Info */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer">Debug Info</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
          {JSON.stringify({ maityUserId, requestId, evaluation }, null, 2)}
        </pre>
      </details>
    </div>
  );
}