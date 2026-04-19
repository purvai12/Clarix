import { supabase } from './supabase';

export interface UserFeedback {
  id?: string;
  user_id: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}

export const feedbackService = {
  async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert(feedback);

      if (error) {
        // Fallback or ignore if table doesn't exist
        console.warn('Feedback table not found or error:', error.message);
        // We could also store it in a generic 'logs' or something, 
        // but for now, we'll just log it.
      }
    } catch (err) {
      console.error('Feedback service error:', err);
    }
  }
};
