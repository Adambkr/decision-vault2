import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Crown,
  Users,
  Briefcase
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Thinker',
      price: '0',
      tagline: 'Basic discipline for the curious.',
      features: [
        '10 decisions logged',
        '30-day reviews only',
        'Basic insights',
        'Mobile access'
      ],
      cta: 'Start Free',
      variant: 'secondary'
    },
    {
      name: 'Strategist',
      price: isAnnual ? '13' : '19',
      popular: true,
      tagline: 'Precision for high-stakes thinkers.',
      features: [
        'Unlimited decisions',
        '30/60/90 day & custom reviews',
        'Full Decision DNA suite',
        'CSV Export',
        'Priority human support'
      ],
      cta: 'Go Pro',
      variant: 'primary'
    },
    {
      name: 'Vault',
      price: 'Coming Soon',
      tagline: 'Institutional clarity for partners.',
      features: [
        'Shared group workspace',
        'Admin audit logs',
        'Bulk decision export',
        'White-glove onboarding',
        'Unlimited collaborators'
      ],
      cta: 'Join Waitlist',
      variant: 'outline'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 sm:space-y-24 py-8 sm:py-12 px-4 sm:px-6">
      <div className="text-center space-y-4 sm:space-y-6">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-medium text-ink">Invest in your process.</h1>
        <p className="text-base sm:text-xl text-ink-dim/60 max-w-2xl mx-auto">
          Better decisions lead to better outcomes. Lock in your future self's advantage.
        </p>
        
        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-8 sm:pt-10">
          <span className={cn("text-xs sm:text-sm font-medium uppercase tracking-widest transition-opacity", !isAnnual ? "text-ink" : "text-ink-faint/40")}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-7 sm:w-14 sm:h-8 bg-white/5 border border-white/10 rounded-full relative p-1 shrink-0"
          >
            <motion.div
              animate={{ x: isAnnual ? 20 : 0 }}
              className="w-5 h-5 sm:w-6 sm:h-6 bg-accent rounded-full"
            />
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
             <span className={cn("text-xs sm:text-sm font-medium uppercase tracking-widest transition-opacity", isAnnual ? "text-ink" : "text-ink-faint/40")}>Annual</span>
             <Badge variant="accent" className="text-[10px]">SAVE 30%</Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 sm:gap-8 items-stretch pt-8 sm:pt-12">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            className={cn(
              "glass-card p-6 sm:p-8 lg:p-12 flex flex-col gap-6 sm:gap-8 lg:gap-10 relative",
              plan.popular ? "border-accent/30 accent-glow" : ""
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 py-1.5 px-6 bg-accent text-void font-bold text-[10px] uppercase tracking-widest rounded-bl-xl">
                Most Popular
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl font-display font-medium text-ink">{plan.name}</h2>
              <p className="text-sm text-ink-dim/60 leading-relaxed min-h-[40px] italic">"{plan.tagline}"</p>
            </div>

            <div className="flex items-baseline gap-1">
              {plan.price !== 'Coming Soon' && <span className="text-sm text-ink-dim/40 font-mono italic">$</span>}
              <span className="text-5xl sm:text-6xl font-display font-medium text-ink">{plan.price}</span>
              {plan.price !== 'Coming Soon' && <span className="text-xs text-ink-dim/40 font-mono">/MO</span>}
            </div>

            <div className="flex-1 space-y-4 sm:space-y-6">
               <div className="h-px w-full bg-white/5" />
               <ul className="space-y-3 sm:space-y-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex gap-3 text-sm text-ink-dim/70">
                       <Check className="w-4 h-4 text-accent/60 shrink-0 mt-0.5" strokeWidth={2} />
                       {f}
                    </li>
                  ))}
               </ul>
            </div>

            <button
              onClick={async () => {
                if (!user) { navigate('/auth?mode=signup'); return; }
                if (plan.name === 'Vault') { toast.success('You are on the waitlist'); return; }
                const { error } = await supabase.from('users').update({ plan: plan.name }).eq('id', user.id);
                if (error) toast.error(error.message);
                else { toast.success(`Plan updated to ${plan.name}`); navigate('/dashboard'); }
              }}
              className="w-full mt-auto"
            >
              <Button variant={plan.variant as any} size="lg" className="w-full">
                {plan.cta}
              </Button>
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <section className="pt-16 sm:pt-24 border-t border-white/5 max-w-3xl mx-auto space-y-8 sm:space-y-12 px-4 sm:px-0">
         <h2 className="text-2xl sm:text-3xl font-display text-center text-ink">Frequently Asked</h2>
         <div className="space-y-4 sm:space-y-6">
            {[
              { q: 'Why is there no AI feature?', a: 'Because relying on AI for critical reasoning is the opposite of sharpening your own mind. We believe the struggle of thinking is where the value lies.' },
              { q: 'Can I export my data?', a: 'Yes, Pro members can export their entire Decision Vault as CSV at any time. Your thinking belongs to you.' },
              { q: 'Is it really private?', a: 'Completely. Your entries are yours. We do not use your data for marketing or training any external models.' }
            ].map(faq => (
              <Card key={faq.q} className="p-5 sm:p-8 space-y-3 sm:space-y-4 edge-light">
                 <h4 className="font-semibold text-base sm:text-lg text-ink">{faq.q}</h4>
                 <p className="text-sm text-ink-dim/60 leading-relaxed">{faq.a}</p>
              </Card>
            ))}
         </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center py-12 sm:py-20">
         <h3 className="text-xl sm:text-2xl font-display mb-6 sm:mb-8 text-ink">Still thinking about it?</h3>
         <Link to="/">
           <Button variant="ghost" className="group">
              Read our Manifesto <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
           </Button>
         </Link>
      </section>
    </div>
  );
}
