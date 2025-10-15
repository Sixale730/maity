/**
 * Represents a coach conversation session
 */
export interface Conversation {
  id: string;
  user_id: string;
  topic?: string | null;
  started_at: string;
  ended_at?: string | null;
  messages?: Message[];
  summary?: string | null;
  created_at: string;
}

/**
 * Represents a single message in a coach conversation
 */
export interface Message {
  speaker: 'user' | 'coach';
  content: string;
  timestamp: string;
}

/**
 * Result of conversation history query
 */
export interface ConversationHistory {
  conversations: Conversation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Data for creating a new conversation
 */
export interface CreateConversationData {
  userId: string;
  topic?: string;
}
