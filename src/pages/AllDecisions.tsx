import { Card, Badge, Button, Input } from '@/components/ui';
import { 
  Search, 
  Filter, 
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AllDecisions() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const showReviewsOnly = searchParams.get('filter') === 'reviews';

  useEffect(() => {
    if (!user) return;

    const fetchDecisions = async () => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Fetch error:', error);
      } else {
        setDecisions(
          (data || []).map((d: any) => ({
            ...d,
            userId: d.user_id,
            createdAt: d.created_at,
            reviewDueAt: d.review_due_at,
            predictedOutcome: d.predicted_outcome,
            createdAtDate: new Date(d.created_at),
          }))
        );
      }
      setLoading(false);
    };

    fetchDecisions();

    const channel = supabase
      .channel('all_decisions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'decisions', filter: `user_id=eq.${user.id}` },
        () => fetchDecisions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || d.categories?.includes(categoryFilter);
      const matchesReviewFilter = !showReviewsOnly || (d.status === 'Awaiting Review' && new Date() >= new Date(d.reviewDueAt));
      return matchesSearch && matchesCategory && matchesReviewFilter;
    });
  }, [decisions, search, categoryFilter, showReviewsOnly]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    decisions.forEach(d => d.categories?.forEach((c: string) => cats.add(c)));
    return ['All', ...Array.from(cats)];
  }, [decisions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold-accent" />
        <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Opening Archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">{showReviewsOnly ? 'Reviews Due' : 'Decision Archive'}</h1>
          <p className="text-white/40 font-sans">{showReviewsOnly ? 'Decisions ready for outcome review.' : 'Every path taken, recorded for future wisdom.'}</p>
        </div>
        <div className="flex w-full md:w-auto gap-4">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search legacy decisions..." 
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-gold-accent/40 transition-colors"
              />
           </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest whitespace-nowrap transition-all border ${
              categoryFilter === cat 
                ? "bg-gold-accent text-luxury-bg border-gold-accent" 
                : "bg-white/[0.02] text-white/40 border-white/5 hover:border-gold-accent/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-white/30 text-[10px] font-mono uppercase tracking-[0.2em]">
                <th className="px-8 py-5 font-medium">Decision</th>
                <th className="px-8 py-5 font-medium">Category</th>
                <th className="px-8 py-5 font-medium">Status</th>
                <th className="px-8 py-5 font-medium">Confidence</th>
                <th className="px-8 py-5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDecisions.length > 0 ? filteredDecisions.map((decision) => (
                <tr key={decision.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 rounded-full bg-transparent group-hover:bg-gold-accent transition-all -ml-8 mr-4" />
                      <div>
                        <span className="font-bold block">{decision.title}</span>
                        <span className="text-[10px] font-mono text-white/30 uppercase">{decision.createdAtDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6"><Badge>{decision.categories?.[0] || 'General'}</Badge></td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${decision.status === 'Reviewed' ? 'bg-emerald-400' : 'bg-gold-accent'}`} />
                       <span className="text-xs uppercase tracking-widest font-mono text-white/60">{decision.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono">{decision.confidence}%</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link to={`/decision/${decision.id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-gold-accent hover:text-gold-accent transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-white/20">
                      <AlertCircle className="w-8 h-8" />
                      <p className="italic">No decisions match your search parameters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
    </div>
  );
}
