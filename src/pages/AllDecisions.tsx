import { motion } from 'motion/react';
import { Card, Badge, Input } from '@/components/ui';
import { Search, ArrowUpRight, BookOpen, SlidersHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AllDecisions() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Business', 'Hiring', 'Investment', 'Product', 'Personal'];

  useEffect(() => {
    if (!user) return;
    async function fetchDecisions() {
      const { data, error } = await supabase.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) console.error('Error fetching decisions:', error);
      else setDecisions(data || []);
      setLoading(false);
    }
    fetchDecisions();
  }, [user]);

  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      const matchesSearch = d.title?.toLowerCase().includes(searchQuery.toLowerCase()) || d.context?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || (d.categories && d.categories.includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [decisions, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-white/10 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-sm font-mono text-ink-dim/75 uppercase tracking-widest">Loading Decisions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex flex-col gap-5 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold">Decision Archive</h1>
          <p className="text-sm text-ink-faint/70 mt-1">{decisions.length} total decisions in your vault</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint/60" />
            <Input placeholder="Search your decisions..." value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} className="pl-10" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint/60 hover:text-ink-dim/70">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 items-center">
            <SlidersHorizontal className="w-4 h-4 text-ink-faint/60 mr-1" />
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-accent text-void border-accent' : 'bg-white/5 border-white/10 text-ink-dim/75 hover:text-ink hover:border-white/20'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="p-0 overflow-hidden glass-card">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-ink-faint/60 text-[10px] font-mono uppercase tracking-[0.3em]">
                <th className="px-6 lg:px-8 py-5">Decision</th>
                <th className="px-6 lg:px-8 py-5">Category</th>
                <th className="px-6 lg:px-8 py-5">Status</th>
                <th className="px-6 lg:px-8 py-5">Date</th>
                <th className="px-6 lg:px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDecisions.length > 0 ? filteredDecisions.map((d) => (
                <tr key={d.id} className="group hover:bg-accent/[0.02] transition-colors">
                  <td className="px-6 lg:px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-ink group-hover:text-accent transition-colors">{d.title}</span>
                      <span className="text-[10px] font-mono text-ink-faint/60 uppercase tracking-widest">{d.id.substring(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-5"><Badge variant="outline">{d.categories?.[0] || 'General'}</Badge></td>
                  <td className="px-6 lg:px-8 py-5"><Badge variant={d.status === 'Reviewed' ? 'secondary' : d.status === 'Archived' ? 'outline' : 'accent'}>{d.status}</Badge></td>
                  <td className="px-6 lg:px-8 py-5 text-xs text-ink-dim/75 font-mono">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="px-6 lg:px-8 py-5 text-right">
                    <Link to={`/decision/${d.id}`} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all text-ink-dim/75 hover:text-accent">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-ink-faint/20">
                      <BookOpen className="w-10 h-10" />
                      <p className="font-display italic text-lg text-ink-faint/60">No decisions match your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden grid gap-3">
        {filteredDecisions.length > 0 ? filteredDecisions.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-bold text-sm truncate">{d.title}</span>
                  <span className="text-[10px] font-mono text-ink-faint/60 uppercase">{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
                <Link to={`/decision/${d.id}`} className="shrink-0 ml-2">
                  <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-ink-faint/70 hover:text-accent hover:border-accent/40 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{d.categories?.[0] || 'General'}</Badge>
                <Badge variant={d.status === 'Reviewed' ? 'secondary' : d.status === 'Archived' ? 'outline' : 'accent'}>{d.status}</Badge>
              </div>
            </Card>
          </motion.div>
        )) : (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 text-ink-faint/20 mx-auto mb-4" />
            <p className="font-display italic text-ink-faint/60">No decisions match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
