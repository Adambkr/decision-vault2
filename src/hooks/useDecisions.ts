import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface Decision {
  id: string;
  user_id: string;
  title: string;
  context: string;
  options: { title: string; pro: string; con: string }[];
  reasoning: string;
  assumptions: string[];
  predicted_outcome: string;
  confidence: number;
  categories: string[];
  status: string;
  review_due_at: string;
  created_at: string;
}

export function useDecisions(user: User | null) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecisions = useCallback(async () => {
    if (!user) {
      setDecisions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('decisions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setDecisions([]);
    } else {
      setDecisions(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('decisions-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'decisions', filter: `user_id=eq.${user.id}` },
        fetchDecisions
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchDecisions]);

  const ongoingDecisions = useMemo(
    () => decisions.filter(d => d.status === 'Awaiting Review' || d.status === 'Ongoing'),
    [decisions]
  );

  const reviewsDue = useMemo(() => {
    const now = new Date();
    return ongoingDecisions.filter(d => d.review_due_at && new Date(d.review_due_at) <= now);
  }, [ongoingDecisions]);

  return { decisions, ongoingDecisions, reviewsDue, loading, error, refetch: fetchDecisions };
}
