/**
 * Zod Validation Schemas for API Endpoints
 *
 * Request and response validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Common schemas
 */
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const urlSchema = z.string().url();

/**
 * Evaluation Complete Request Schema (from n8n)
 */
export const evaluationCompleteRequestSchema = z.object({
  request_id: uuidSchema,
  status: z.enum(['complete', 'failed']).optional(),
  result: z
    .object({
      score: z.number().min(0).max(100).optional(),
      feedback: z.string().optional(),
      areas: z.record(z.number()).optional(),
      Evaluacion: z
        .object({
          Claridad: z.record(z.union([z.number(), z.string()])).optional(),
          Estructura: z.record(z.union([z.number(), z.string()])).optional(),
          Alineacion_Emocional: z.record(z.union([z.number(), z.string()])).optional(),
          Influencia: z.record(z.union([z.number(), z.string()])).optional(),
        })
        .passthrough()
        .optional(),
      Fortalezas: z.object({
        Cita: z.string().optional(),
        Feedback: z.string().optional(),
      }).passthrough().optional(),
      Errores: z.object({
        Cita: z.string().optional(),
        Feedback: z.string().optional(),
      }).passthrough().optional(),
      Recomendaciones: z.object({
        Cita: z.string().optional(),
        Feedback: z.string().optional(),
      }).passthrough().optional(),
      Resumen: z.string().optional(),
      objective_feedback: z.string().optional(),
    })
    .passthrough()
    .optional(),
  error: z.string().optional(),
});

export type EvaluationCompleteRequest = z.infer<typeof evaluationCompleteRequestSchema>;

/**
 * Finalize Invite Request Schema
 */
export const finalizeInviteRequestSchema = z.object({
  // No body fields - uses Authorization header and invite cookie
});

/**
 * Tally Link Request Schema
 */
export const tallyLinkRequestSchema = z.object({
  // No body fields - uses Authorization header
});

/**
 * Accept Invite Request Schema
 */
export const acceptInviteRequestSchema = z.object({
  token: z.string().min(1),
});

/**
 * ElevenLabs Signed URL Request Schema
 */
export const elevenlabsSignedUrlRequestSchema = z.object({
  agent_id: z.string().optional(), // Optional, uses env var if not provided
});

/**
 * Tally Webhook Request Schema
 */
export const tallyWebhookRequestSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  createdAt: z.string(),
  data: z.object({
    formId: z.string(),
    formName: z.string().optional(),
    respondentId: z.string().optional(),
    fields: z.array(
      z.object({
        key: z.string(),
        label: z.string().optional(),
        type: z.string().optional(),
        value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
      })
    ),
  }),
});

export type TallyWebhookRequest = z.infer<typeof tallyWebhookRequestSchema>;

/**
 * ElevenLabs Conversation Token Request Schema
 */
export const elevenlabsConversationTokenRequestSchema = z.object({
  agent_id: z.string().optional(),
});

/**
 * Complete Short Evaluation Request Schema
 */
export const completeShortEvaluationRequestSchema = z.object({
  request_id: uuidSchema,
  score: z.number().min(0).max(100),
  feedback: z.string().optional(),
  result: z.record(z.unknown()).optional(),
});

export type CompleteShortEvaluationRequest = z.infer<typeof completeShortEvaluationRequestSchema>;

/**
 * Decode Opus Request Schema
 */
export const decodeOpusRequestSchema = z.object({
  opusData: z.string().min(1),
});

export type DecodeOpusRequest = z.infer<typeof decodeOpusRequestSchema>;

/**
 * Success response schema
 */
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown().optional(),
  message: z.string().optional(),
});

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.unknown().optional(),
});

/**
 * Helper to validate request body against schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Helper to create validated response
 */
export function createSuccessResponse<T>(data?: T, message?: string) {
  return {
    success: true as const,
    data,
    message,
  };
}
