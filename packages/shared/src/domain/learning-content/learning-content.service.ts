import { supabase } from '../../api/client/supabase';

export interface LearningContent {
  id: string;
  title: string;
  description: string | null;
  url: string;
  content_type: 'video' | 'podcast' | 'pdf' | 'article';
  thumbnail_url: string | null;
  duration: string | null;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateLearningContentInput {
  title: string;
  description?: string;
  url: string;
  content_type: 'video' | 'podcast' | 'pdf' | 'article';
  thumbnail_url?: string;
  duration?: string;
  icon?: string;
  color?: string;
}

export class LearningContentService {
  static async getAllContent(): Promise<LearningContent[]> {
    const { data, error } = await supabase.rpc('get_all_learning_content');
    if (error) {
      console.error('Error fetching learning content:', error);
      throw error;
    }
    return data || [];
  }

  static async createContent(input: CreateLearningContentInput): Promise<LearningContent> {
    const { data, error } = await supabase.rpc('create_learning_content', {
      p_title: input.title,
      p_description: input.description || null,
      p_url: input.url,
      p_content_type: input.content_type,
      p_thumbnail_url: input.thumbnail_url || null,
      p_duration: input.duration || null,
      p_icon: input.icon || 'book-open',
      p_color: input.color || 'blue',
    });
    if (error) {
      console.error('Error creating learning content:', error);
      throw error;
    }
    return data;
  }

  static async deleteContent(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_learning_content', {
      p_id: id,
    });
    if (error) {
      console.error('Error deleting learning content:', error);
      throw error;
    }
  }
}
