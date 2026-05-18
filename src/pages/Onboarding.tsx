import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { ArrowRight, ArrowLeft, ShieldCheck, Mail, Calendar, User, Briefcase, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    frequency: 'Daily',
    rhythm: '30',
    notifications: 'Both'
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const handleComplete = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await supabase.from('users').update({
        display_name: formData.name,
        role: formData.role,
        review_default_cadence: parseInt(formData.rhythm) || 30,
        frequency: formData.frequency,
      }).eq('id', user.id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6">
      {/* Progress */}
      <div className="max-w-md w-full mb-12 flex gap-3">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={cn(
              "h-1.5 flex-1 rounded-full overflow-hidden bg-white/5",
              step >= s ? "bg-gold-accent/20" : ""
            )}
          >
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: step >= s ? '100%' : '0%' }}
              className="h-full bg-gold-accent"
            />
          </div>
        ))}
      </div>

      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gold-accent/10 rounded-full flex items-center justify-center mx-auto border border-gold-accent/20">
                  <User className="text-gold-accent" />
                </div>
                <h1 className="text-4xl font-display font-medium">Who are you?</h1>
                <p className="text-white/40">We tailor the DecisionVault experience to your professional context.</p>
              </div>

              <div className="grid gap-6">
                <Input 
                  label="Full Name" 
                  placeholder="Adam Balkar" 
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-white/40 ml-1">Your Primary Role</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Founder', 'Investor', 'Executive', 'Manager', 'Product', 'Other'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setFormData({ ...formData, role })}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          formData.role === role 
                            ? "bg-gold-accent/10 border-gold-accent text-white" 
                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-white/40 ml-1">Decision Frequency</label>
                  <p className="text-[10px] text-white/20 mb-2 italic px-1">How often do you make high-stakes, strategic decisions?</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {['Daily', 'Weekly', 'Monthly'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormData({ ...formData, frequency: f })}
                        className={cn(
                          "px-6 py-4 rounded-2xl border flex-1 whitespace-nowrap transition-all flex flex-col gap-2",
                          formData.frequency === f 
                            ? "bg-gold-accent border-gold-accent text-luxury-bg font-bold shadow-lg shadow-gold-accent/10" 
                            : "bg-white/5 border-white/10 text-white/40"
                        )}
                      >
                        <span className="text-xs uppercase tracking-tighter">{f}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={nextStep} size="lg" className="w-full" disabled={!formData.name || !formData.role}>
                Next <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gold-accent/10 rounded-full flex items-center justify-center mx-auto border border-gold-accent/20">
                  <Calendar className="text-gold-accent" />
                </div>
                <h1 className="text-4xl font-display font-medium">Your Review Rhythm</h1>
                <p className="text-white/40">When should we remind you to face your predictions?</p>
              </div>

              <div className="grid gap-4">
                {[
                  { value: '30', label: '30 Days', desc: 'Short-term tactical decisions' },
                  { value: '60', label: '60 Days', desc: 'Strategic maneuvers' },
                  { value: '90', label: '90 Days', desc: 'Long-term structural shifts' },
                  { value: 'custom', label: 'Custom', desc: 'Full control over dates' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFormData({ ...formData, rhythm: item.value })}
                    className={cn(
                      "p-6 rounded-2xl border text-left transition-all flex justify-between items-center",
                      formData.rhythm === item.value 
                        ? "bg-gold-accent/5 border-gold-accent gold-glow" 
                        : "bg-white/[0.02] border-white/10 hover:border-white/30"
                    )}
                  >
                    <div>
                      <h3 className="font-bold text-lg">{item.label}</h3>
                      <p className="text-sm text-white/40">{item.desc}</p>
                    </div>
                    {formData.rhythm === item.value && <ShieldCheck className="text-gold-accent" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button variant="secondary" size="lg" className="flex-1" onClick={prevStep}>
                  <ArrowLeft className="w-5 h-5" /> Back
                </Button>
                <Button size="lg" className="flex-2" onClick={nextStep}>
                  Set Rhythm <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gold-accent/10 rounded-full flex items-center justify-center mx-auto border border-gold-accent/20">
                  <ShieldCheck className="text-gold-accent" />
                </div>
                <h1 className="text-4xl font-display font-medium">Ready to enter?</h1>
                <p className="text-white/40">Registration complete. Your vault is prepared.</p>
              </div>

              <Card className="text-center py-12 space-y-6">
                <p className="text-white/60 leading-loose mx-auto max-w-sm">
                  "The most valuable currency in high-stakes environments is not capital, but the quality of your reasoning."
                </p>
                <div className="h-px w-12 bg-white/10 mx-auto" />
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">DecisionVault Philosophy</p>
              </Card>

              <div className="flex gap-4">
                <Button variant="secondary" size="lg" className="flex-1" onClick={prevStep}>
                  <ArrowLeft className="w-5 h-5" /> Back
                </Button>
                <Button size="lg" className="flex-2" onClick={handleComplete} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving... <Loader2 className="w-5 h-5 animate-spin" /></>
                  ) : (
                    <>Open My Vault <ArrowRight className="w-5 h-5" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
