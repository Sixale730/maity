# Evaluation System - Logs Guide

## Overview

This guide explains what logs you'll see at each stage of the voice transcript evaluation flow.

---

## 🎯 Complete Flow with Expected Logs

### 1. **Frontend: Create Evaluation**

When the user clicks "Start Evaluation", you'll see:

```
[createEvaluation] 🚀 Creating evaluation { requestId: '550e8400-...', maityUserId: 'abc-123-...' }
[createEvaluation] ✅ User authenticated: def-456-...
[createEvaluation] 💾 Inserting evaluation into maity.evaluations... { user_id: 'abc-123-...', request_id: '550e8400-...', status: 'pending' }
[createEvaluation] ✅ Evaluation created successfully: { id: 'xyz-789-...', request_id: '550e8400-...', status: 'pending', created_at: '2025-09-29T...' }
```

**What it means**: Frontend successfully created a `pending` evaluation record in the database.

---

### 2. **Frontend: Subscribe to Realtime Updates**

After creating the evaluation, the Realtime subscription starts:

```
[useEvaluationRealtime] 🚀 Initializing subscription for request_id: 550e8400-...
[useEvaluationRealtime] 🔍 Fetching initial evaluation state...
[useEvaluationRealtime] ✅ Initial evaluation fetched: { id: 'xyz-789-...', status: 'pending', hasResult: false, created_at: '...' }
[useEvaluationRealtime] 📡 Setting up realtime subscription...
[useEvaluationRealtime] 📡 Subscription status changed: SUBSCRIBED
[useEvaluationRealtime] ✅ Successfully subscribed to updates for: 550e8400-...
```

**What it means**: Frontend is now listening for updates to this specific evaluation via Supabase Realtime.

---

### 3. **Frontend: Send Transcript to n8n**

When the transcript is sent to n8n webhook:

```
✅ Transcript sent to n8n with request_id: 550e8400-...
⏳ Waiting for n8n to process and POST back...
```

**What it means**: The transcript + request_id were successfully sent to the n8n webhook.

---

### 4. **n8n: Process Transcript (n8n logs)**

In n8n logs (not in your app), you should see:

```
Webhook received: { request_id: '550e8400-...', transcript: '...' }
Processing with LLM...
LLM response received, score: 85
Sending POST to backend...
```

---

### 5. **Backend: Receive Update from n8n**

When n8n POSTs the result, the backend logs:

```
[evaluations/complete] 🚀 Request received { method: 'POST', url: '/api/evaluations-550e8400-...-complete', headers: { ... } }
[evaluations/complete] 🌐 CORS check { origin: 'https://your-n8n.com', allowed: true, configuredOrigins: [...] }
[evaluations/complete] ✅ Environment validated
[evaluations/complete] ✅ Secret validated
[evaluations/complete] 📝 Request ID: 550e8400-...
[evaluations/complete] 📦 Payload received { status: 'complete', hasResult: true, resultKeys: ['score', 'strengths', 'weaknesses', 'feedback', 'metrics'], bodySize: 542 }
[evaluations/complete] ✅ Payload validated
[evaluations/complete] 🔍 Fetching evaluation from database... { request_id: '550e8400-...' }
[evaluations/complete] ✅ Evaluation found { id: 'xyz-789-...', currentStatus: 'pending', user_id: 'abc-123-...' }
[evaluations/complete] ✅ Idempotency check passed, updating...
[evaluations/complete] 💾 Update payload prepared { status: 'complete', hasResult: true, hasErrorMessage: false }
[evaluations/complete] ✅ Successfully updated evaluation { request_id: '550e8400-...', status: 'complete', updated_at: '...', durationMs: 142 }
```

**What it means**: Backend successfully validated the request, found the evaluation, and updated it to `complete` status.

---

### 6. **Frontend: Receive Realtime Update**

When Supabase broadcasts the UPDATE event:

```
[useEvaluationRealtime] 🔔 Received realtime update! { eventType: 'UPDATE', old: {...}, new: {...} }
[useEvaluationRealtime] 📝 Evaluation updated: { status: 'complete', hasResult: true, hasError: false }
[useEvaluationRealtime] ✅ Status complete, triggering onComplete callback
```

**What it means**: Frontend received the update in real-time and triggered the `onComplete` callback to show results to the user.

---

## 🚨 Error Scenarios

### Frontend: User Not Authenticated

```
[createEvaluation] ❌ User not authenticated
```

**Fix**: Make sure the user is logged in via Supabase Auth.

---

### Frontend: Failed to Create Evaluation

```
[createEvaluation] ❌ Failed to create evaluation: { code: '42501', message: 'new row violates row-level security policy' }
```

**Fix**: Check RLS policies on `maity.evaluations` table. User must have INSERT permission.

---

### Frontend: Evaluation Not Found

```
[useEvaluationRealtime] ⚠️ Evaluation not found for request_id: 550e8400-...
```

**Fix**: The evaluation was never created or was deleted. Check `createEvaluation()` call.

---

### Frontend: Realtime Subscription Failed

```
[useEvaluationRealtime] ❌ Subscription error: { ... }
[useEvaluationRealtime] ⏱️ Subscription timed out
```

**Fix**: Check Supabase Realtime is enabled for `maity.evaluations` table.

---

### Backend: Missing Secret

```
[evaluations/complete] ❌ Invalid secret { provided: 'MISSING', matches: false }
```

**Fix**: Ensure n8n sends `X-N8N-Secret` header matching `process.env.N8N_BACKEND_SECRET`.

---

### Backend: Evaluation Not Found

```
[evaluations/complete] ❌ Evaluation not found { request_id: '550e8400-...' }
```

**Fix**: Frontend didn't create the evaluation before sending to n8n, or wrong `request_id` was used.

---

### Backend: Already Finalized (Idempotency)

```
[evaluations/complete] ⚠️ Attempted to update already finalized evaluation { request_id: '...', currentStatus: 'complete', newStatus: 'complete' }
```

**What it means**: n8n tried to update an evaluation that's already `complete` or `error`. This is expected behavior for duplicate requests and is blocked by idempotency check.

---

### Backend: Database Error

```
[evaluations/complete] ❌ Database fetch error: { code: '42P01', message: 'relation "maity.evaluations" does not exist' }
```

**Fix**: Run the migration to create `maity.evaluations` table.

---

## 🔧 Troubleshooting Commands

### Check if evaluation was created

```bash
# In Supabase SQL Editor
SELECT * FROM maity.evaluations WHERE request_id = '550e8400-...';
```

### Check Realtime publication

```bash
# In Supabase SQL Editor
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'evaluations';
```

Expected output:
```
pubname            | schemaname | tablename
-------------------|------------|------------
supabase_realtime  | maity      | evaluations
```

### Test backend endpoint manually

```bash
curl -X POST "https://api.maity.com.mx/api/evaluations-550e8400-e29b-41d4-a716-446655440000-complete" \
  -H "Content-Type: application/json" \
  -H "X-N8N-Secret: your-secret-here" \
  -d '{
    "status": "complete",
    "result": {
      "score": 90,
      "feedback": "Test feedback"
    }
  }'
```

---

## 📊 Performance Metrics

### Typical Timings

- **Frontend: Create evaluation**: 50-150ms
- **Frontend: Subscribe to Realtime**: 100-300ms
- **Backend: Process update**: 100-200ms (see `durationMs` in logs)
- **Realtime: Broadcast to frontend**: 50-100ms

### Total End-to-End

From "Start Evaluation" to displaying results:
- **Excluding LLM processing**: ~300-750ms
- **Including LLM processing**: Depends on n8n/LLM (typically 2-10 seconds)

---

## 🎓 Log Levels

| Emoji | Level | Meaning |
|-------|-------|---------|
| 🚀 | INFO | Process started |
| ✅ | SUCCESS | Operation completed successfully |
| 📝 | INFO | Data logged |
| 🔍 | INFO | Fetching/querying data |
| 📡 | INFO | Realtime/network operation |
| 🔔 | INFO | Realtime event received |
| 🌐 | INFO | CORS/network check |
| 💾 | INFO | Database operation |
| ⚠️ | WARNING | Non-critical issue |
| ❌ | ERROR | Operation failed |
| 🔌 | INFO | Cleanup/disconnection |

---

## 🧪 Testing Checklist

- [ ] Frontend creates evaluation (see `[createEvaluation]` logs)
- [ ] Frontend subscribes to Realtime (see `[useEvaluationRealtime]` logs)
- [ ] Frontend sends transcript to n8n (see `✅ Transcript sent` log)
- [ ] Backend receives n8n POST (see `[evaluations/complete]` logs)
- [ ] Backend validates secret (see `✅ Secret validated`)
- [ ] Backend finds evaluation (see `✅ Evaluation found`)
- [ ] Backend updates evaluation (see `✅ Successfully updated`)
- [ ] Frontend receives Realtime update (see `🔔 Received realtime update`)
- [ ] Frontend triggers callback (see `✅ Status complete, triggering onComplete`)

If any step fails, check logs for the corresponding emoji to identify the issue.