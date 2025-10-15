import { supabase } from '../../api/client/supabase';

/**
 * Type for coach conversation message
 */
export interface CoachMessage {
  speaker: 'user' | 'coach';
  content: string;
  timestamp: string;
}

/**
 * Type for conversation update data
 */
export interface ConversationUpdate {
  ended_at?: string;
  messages?: CoachMessage[];
  summary?: string;
}

/**
 * Service for managing coach conversations and voice interactions
 * Works in conjunction with the ElevenLabs hooks for voice functionality
 */
export class CoachService {
  /**
   * Get all coach conversations for a user
   * @param userId - User's UUID from maity.users table
   * @param limit - Optional limit for results
   * @returns Promise with array of conversations
   */
  static async getConversations(userId: string, limit?: number): Promise<unknown[] | null> {
    let query = supabase
      .from('maity.coach_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching coach conversations:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get a specific conversation by ID
   * @param conversationId - Conversation UUID
   * @returns Promise with conversation data
   */
  static async getConversationById(conversationId: string): Promise<any> {
    const { data, error } = await supabase
      .from('maity.coach_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new coach conversation
   * @param userId - User's UUID from maity.users table
   * @param topic - Optional conversation topic
   * @returns Promise with created conversation
   */
  static async createConversation(userId: string, topic?: string): Promise<unknown> {
    const { data, error } = await supabase
      .from('maity.coach_conversations')
      .insert({
        user_id: userId,
        topic: topic ?? null,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a conversation
   * @param conversationId - Conversation UUID
   * @param updates - Fields to update
   * @returns Promise with updated conversation
   */
  static async updateConversation(
    conversationId: string,
    updates: ConversationUpdate
  ): Promise<unknown> {
    const { data, error } = await supabase
      .from('maity.coach_conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }

    return data;
  }

  /**
   * End a coach conversation
   * @param conversationId - Conversation UUID
   * @param summary - Optional conversation summary
   * @returns Promise with updated conversation
   */
  static async endConversation(conversationId: string, summary?: string): Promise<unknown> {
    return this.updateConversation(conversationId, {
      ended_at: new Date().toISOString(),
      summary: summary ?? undefined
    });
  }

  /**
   * Add a message to a conversation
   * @param conversationId - Conversation UUID
   * @param message - Message object with speaker and content
   * @returns Promise with updated conversation
   */
  static async addMessage(
    conversationId: string,
    message: CoachMessage
  ): Promise<unknown> {
    // First get the current conversation
    const conversation = await this.getConversationById(conversationId);

    // Add the new message
    const existingMessages: CoachMessage[] = Array.isArray(conversation.messages)
      ? conversation.messages
      : [];
    const updatedMessages = [...existingMessages, message];

    return this.updateConversation(conversationId, {
      messages: updatedMessages
    });
  }

  /**
   * Get conversation history with pagination
   * @param userId - User's UUID
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of results per page
   * @returns Promise with paginated conversations
   */
  static async getHistory(userId: string, page: number = 1, pageSize: number = 10): Promise<{
    conversations: unknown[] | null;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('maity.coach_conversations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }

    const totalCount = count ?? 0;

    return {
      conversations: data,
      total: totalCount,
      page,
      pageSize,
      totalPages: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0
    };
  }

  /**
   * Search conversations by topic or content
   * @param userId - User's UUID
   * @param searchTerm - Term to search for
   * @returns Promise with matching conversations
   */
  static async searchConversations(userId: string, searchTerm: string): Promise<unknown[] | null> {
    const { data, error } = await supabase
      .from('maity.coach_conversations')
      .select('*')
      .eq('user_id', userId)
      .or(`topic.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a conversation
   * @param conversationId - Conversation UUID
   * @returns Promise with deletion result
   */
  static async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('maity.coach_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }

    return { success: true };
  }
}
