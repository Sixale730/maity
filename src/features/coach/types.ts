/**
 * Shared types for coach feature
 */

export type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface CoachMessage {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'agent';
}
