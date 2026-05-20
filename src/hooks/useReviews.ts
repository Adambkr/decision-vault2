import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface Review {
  id: string;
  user_id: string;
  decision_id: string;
  what_happened: string;
  outcome_match: 'yes' | 'no' | 'partial';
  what_right: string;
  what_wrong: string;
  updated_confidence: number;
  completed_at: string;
}

export function useReviews(user: User | null) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!user) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id);

    if (err) {
      setError(err.message);
      setReviews([]);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('reviews-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews', filter: `user_id=eq.${user.id}` },
        fetchReviews
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}
