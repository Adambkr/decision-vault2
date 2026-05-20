import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input, GlassPanel } from '@/components/ui';
import { ArrowRight, ArrowLeft, ShieldCheck, Calendar, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { reveal, fadeUp, staggerContainer } from '@/lib/motion';

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
      const { error } = await supabase.from('users').update({
        display_name: formData.name,
        role: formData.role,
        review_default_cadence: parseInt(formData.rhythm) || 30,
        frequency: formData.frequency,
      }).eq('id', user.id);
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      toast.error(err.message || 'Failed to save profile');
      setIsSaving(false);
    }
  };

  const stepIcon = step === 1 ? User : step === 2 ? Calendar : ShieldCheck;
  const StepIcon = stepIcon;

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-5 sm:p-6 lg:p-10 relative">
      {/* Progress rail */}
      <div className="max-w-md w-full mb-14 flex items-center gap-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-3">
            <div className="relative h-1 flex-1 rounded-full overflow-hidden bg-white/[0.045]">
              <motion.div
                initial={false}
                animate={{
                  width: step > s ? '100%' : step === s ? '60%' : '0%',
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  step >= s ? 'from-accent via-accent to-accent/70 shadow-[0_0_8px_rgba(107,138,254,0.4)]' : 'from-transparent to-transparent'
                )}
              />
            </div>
            <span
              className={cn(
                'text-[10px] font-medium tabular-nums tracking-[0.2em]',
                step >= s ? 'text-accent' : 'text-ink-faint/45'
              )}
            >
              0{s}
            </span>
          </div>
        ))}
      </div>

      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={staggerContainer(0.07)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -24, scale: 0.99, transition: { duration: 0.4 } }}
              className="space-y-9"
            >
              <motion.div variants={reveal} className="text-center space-y-5">
                <div className="w-14 h-14 bg-accent/[0.10] rounded-2xl flex items-center justify-center mx-auto border border-accent/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_rgba(107,138,254,0.12)]">
                  <StepIcon className="w-5 h-5 text-accent" strokeWidth={1.6} />
                </div>
                <h1 className="text-display text-display-balanced text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.05] tracking-tight">
                  Who are <span className="font-editorial text-accent/95">you</span>?
                </h1>
                <p className="text-ink-dim/85 text-sm font-light max-w-md mx-auto">
                  We tailor the DecisionVault experience to your professional context.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="grid gap-7">
                <Input
                  label="Full Name"
                  placeholder="Adam Balkar"
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                />

                <div className="flex flex-col gap-3">
                  <label className="kicker text-ink-dim/75">Your Primary Role</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {['Founder', 'Investor', 'Executive', 'Manager', 'Product', 'Other'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({ ...formData, role })}
                        className={cn(
                          'h-11 px-4 rounded-xl border text-sm font-medium tracking-tight transition-colors duration-400',
                          formData.role === role
                            ? 'bg-accent/[0.10] border-accent/55 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_16px_rgba(107,138,254,0.12)]'
                            : 'bg-white/[0.018] border-white/[0.08] text-ink-dim/75 hover:border-white/[0.14] hover:text-ink/90'
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="kicker text-ink-dim/75">Decision Frequency</label>
                  <p className="text-[11px] text-ink-faint/60 italic font-light -mt-1">
                    How often do you make high-stakes, strategic decisions?
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['Daily', 'Weekly', 'Monthly'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormData({ ...formData, frequency: f })}
                        className={cn(
                          'h-14 rounded-xl border text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-400',
                          formData.frequency === f
                            ? 'bg-accent/[0.10] border-accent/55 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_16px_rgba(107,138,254,0.12)]'
                            : 'bg-white/[0.018] border-white/[0.08] text-ink-dim/75 hover:border-white/[0.14] hover:text-ink/90'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Button
                  onClick={nextStep}
                  size="lg"
                  className="w-full"
                  disabled={!formData.name || !formData.role}
                >
                  Next <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={staggerContainer(0.07)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -24, scale: 0.99, transition: { duration: 0.4 } }}
              className="space-y-9"
            >
              <motion.div variants={reveal} className="text-center space-y-5">
                <div className="w-14 h-14 bg-accent/[0.10] rounded-2xl flex items-center justify-center mx-auto border border-accent/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_rgba(107,138,254,0.12)]">
                  <StepIcon className="w-5 h-5 text-accent" strokeWidth={1.6} />
                </div>
                <h1 className="text-display text-display-balanced text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.05] tracking-tight">
                  Your review <span className="font-editorial text-accent/95">rhythm</span>.
                </h1>
                <p className="text-ink-dim/85 text-sm font-light max-w-md mx-auto">
                  When should we remind you to face your predictions?
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="grid gap-3">
                {[
                  { value: '7', label: '7 Days', desc: 'Rapid check-ins' },
                  { value: '30', label: '30 Days', desc: 'Short-term tactical decisions' },
                  { value: '60', label: '60 Days', desc: 'Strategic maneuvers' },
                  { value: '90', label: '90 Days', desc: 'Long-term structural shifts' },
                ].map((item) => {
                  const active = formData.rhythm === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, rhythm: item.value })}
                      className={cn(
                        'group relative p-5 sm:p-6 rounded-2xl border text-left transition-colors duration-400 flex justify-between items-center',
                        active
                          ? 'bg-accent/[0.06] border-accent/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_rgba(107,138,254,0.10)]'
                          : 'bg-white/[0.018] border-white/[0.07] hover:border-white/[0.14]'
                      )}
                    >
                      <div className="min-w-0">
                        <h3 className="text-display text-lg font-semibold mb-1 tracking-tight">{item.label}</h3>
                        <p className="text-sm text-ink-dim/75 font-light">{item.desc}</p>
                      </div>
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-400 shrink-0',
                          active
                            ? 'bg-accent/[0.12] border-accent/55 text-accent'
                            : 'bg-white/[0.02] border-white/[0.08] text-ink-faint/45 group-hover:text-ink-faint/70'
                        )}
                      >
                        {active && <ShieldCheck className="w-4 h-4" strokeWidth={1.8} />}
                      </div>
                    </button>
                  );
                })}
              </motion.div>

              <motion.div variants={fadeUp} className="flex gap-3">
                <Button variant="secondary" size="lg" className="flex-1" onClick={prevStep}>
                  <ArrowLeft className="w-5 h-5" /> Back
                </Button>
                <Button size="lg" className="flex-[2]" onClick={nextStep}>
                  Set Rhythm <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={staggerContainer(0.08)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -24, scale: 0.99, transition: { duration: 0.4 } }}
              className="space-y-9"
            >
              <motion.div variants={reveal} className="text-center space-y-5">
                <div className="w-14 h-14 bg-accent/[0.10] rounded-2xl flex items-center justify-center mx-auto border border-accent/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_rgba(107,138,254,0.12)]">
                  <StepIcon className="w-5 h-5 text-accent" strokeWidth={1.6} />
                </div>
                <h1 className="text-display text-display-balanced text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.05] tracking-tight">
                  Ready to <span className="font-editorial text-accent/95">enter</span>?
                </h1>
                <p className="text-ink-dim/85 text-sm font-light max-w-md mx-auto">
                  Registration complete. Your vault is prepared.
                </p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <GlassPanel elevation="raised" padding="xl" edgeLight className="text-center relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent/[0.06] blur-[80px] rounded-full" />
                  <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-violet/[0.04] blur-[60px] rounded-full" />
                  <div className="relative z-10 space-y-6">
                    <p className="font-editorial italic text-xl sm:text-2xl leading-[1.32] text-ink/95 tracking-tight max-w-lg mx-auto">
                      &ldquo;The most valuable currency in high-stakes environments is not capital, but the
                      quality of your reasoning.&rdquo;
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="h-px w-12 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />
                      <span className="kicker-accent">DecisionVault Philosophy</span>
                      <span className="h-px w-12 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>

              <motion.div variants={fadeUp} className="flex gap-3">
                <Button variant="secondary" size="lg" className="flex-1" onClick={prevStep}>
                  <ArrowLeft className="w-5 h-5" /> Back
                </Button>
                <Button size="lg" className="flex-[2]" onClick={handleComplete} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      Saving... <Loader2 className="w-5 h-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      Open My Vault <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
