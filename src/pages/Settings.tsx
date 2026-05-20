import { useState } from 'react';
import { motion } from 'motion/react';
import { Button, Card, Input, Badge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  User,
  Bell,
  Shield,
  Trash2,
  AlertTriangle,
  Loader2,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.display_name || '');
  const [role, setRole] = useState(profile?.role || '');
  const [cadence, setCadence] = useState(profile?.review_default_cadence?.toString() || '30');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({
        display_name: name,
        role,
        review_default_cadence: parseInt(cadence) || 30,
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) toast.error('Failed to save: ' + error.message);
    else toast.success('Profile updated');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('reviews').delete().eq('user_id', user.id);
      await supabase.from('decisions').delete().eq('user_id', user.id);
      await supabase.from('users').delete().eq('id', user.id);
      await supabase.auth.signOut();
      toast.success('Account data removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="border-b border-white/5 pb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-medium mb-2">Settings</h1>
        <p className="text-ink-dim/60">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-display font-medium">Profile</h2>
        </div>
        <Card className="space-y-6">
          <Input
            label="Display Name"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
          />
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
          />
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-ink-dim/60 ml-1 mb-2 block">Primary Role</label>
            <div className="flex flex-wrap gap-2">
              {['Founder', 'Investor', 'Executive', 'Manager', 'Product', 'Other'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                    role === r
                      ? 'bg-accent text-void border-accent'
                      : 'bg-white/5 border-white/10 text-ink-dim/60 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Review Cadence */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-display font-medium">Review Rhythm</h2>
        </div>
        <Card className="space-y-6">
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-ink-dim/60 ml-1 mb-3 block">Default Review Cadence</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { val: '7', label: '7 Days', desc: 'Rapid iteration' },
                { val: '30', label: '30 Days', desc: 'Tactical review' },
                { val: '60', label: '60 Days', desc: 'Strategic check' },
                { val: '90', label: '90 Days', desc: 'Deep reflection' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setCadence(item.val)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    cadence === item.val
                      ? 'bg-accent/5 border-accent/40 accent-glow'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm font-bold block">{item.label}</span>
                  <span className="text-[10px] font-mono text-ink-faint/50">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      {/* Danger Zone */}
      <section className="space-y-6 pt-8 border-t border-white/5">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-display font-medium text-red-400">Danger Zone</h2>
        </div>
        <Card className="border-red-500/10 bg-red-500/[0.02]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold">Delete Account</h3>
              <p className="text-xs text-ink-dim/60 mt-1">This will permanently remove all your decisions and reviews.</p>
            </div>
            <Button variant="destructive" size="md" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </Card>
      </section>

      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface border border-red-500/20 rounded-2xl p-8 max-w-md w-full space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-display font-medium mb-2">Are you sure?</h3>
              <p className="text-sm text-ink-dim/70">This action cannot be undone. All your data will be permanently deleted.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4" /> Yes, Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
