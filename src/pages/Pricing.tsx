import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '@/components/ui';
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
    <div className="max-w-7xl mx-auto space-y-24 py-12 px-6">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-display font-medium">Invest in your process.</h1>
        <p className="text-xl text-white/40 max-w-2xl mx-auto">
          Better decisions lead to better outcomes. Lock in your future self's advantage.
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-10">
          <span className={cn("text-sm font-mono uppercase tracking-widest transition-opacity", !isAnnual ? "text-white" : "text-white/30")}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-white/5 border border-white/10 rounded-full relative p-1"
          >
            <motion.div 
              animate={{ x: isAnnual ? 24 : 0 }}
              className="w-6 h-6 bg-gold-accent rounded-full gold-glow"
            />
          </button>
          <div className="flex items-center gap-3">
             <span className={cn("text-sm font-mono uppercase tracking-widest transition-opacity", isAnnual ? "text-white" : "text-white/30")}>Annual</span>
             <Badge variant="gold">SAVE 30%</Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch pt-12">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -8 }}
            className={cn(
              "glass-card p-12 flex flex-col gap-10 relative overflow-hidden",
              plan.popular ? "border-gold-accent/40 gold-glow" : ""
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 py-1.5 px-6 bg-gold-accent text-luxury-bg font-bold text-[10px] uppercase tracking-widest rounded-bl-xl">
                Most Popular
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-3xl font-display font-medium">{plan.name}</h2>
              <p className="text-sm text-white/40 leading-relaxed min-h-[40px] italic">"{plan.tagline}"</p>
            </div>

            <div className="flex items-baseline gap-1">
              {plan.price !== 'Coming Soon' && <span className="text-sm text-white/30 font-mono italic">$</span>}
              <span className="text-6xl font-display font-medium">{plan.price}</span>
              {plan.price !== 'Coming Soon' && <span className="text-xs text-white/30 font-mono">/MO</span>}
            </div>

            <div className="flex-1 space-y-6">
               <div className="h-px w-full bg-white/5" />
               <ul className="space-y-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex gap-3 text-sm text-white/60">
                       <Check className="w-4 h-4 text-gold-accent shrink-0" />
                       {f}
                    </li>
                  ))}
               </ul>
            </div>

            <Link to={plan.name === 'Vault' ? '/auth?mode=signup' : '/auth?mode=signup'} className="w-full mt-auto">
              <Button variant={plan.variant as any} size="lg" className="w-full">
                {plan.cta}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <section className="pt-24 border-t border-white/5 max-w-3xl mx-auto space-y-12">
         <h2 className="text-3xl font-display text-center">Frequently Asked</h2>
         <div className="space-y-6">
            {[
              { q: 'Why is there no AI feature?', a: 'Because relying on AI for critical reasoning is the opposite of sharpening your own mind. We believe the struggle of thinking is where the value lies.' },
              { q: 'Can I export my data?', a: 'Yes, Pro members can export their entire Decision Vault as CSV at any time. Your thinking belongs to you.' },
              { q: 'Is it really private?', a: 'Completely. Your entries are yours. We do not use your data for marketing or training any external models.' }
            ].map(faq => (
              <Card key={faq.q} className="p-8 space-y-4">
                 <h4 className="font-bold text-lg">{faq.q}</h4>
                 <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
              </Card>
            ))}
         </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center py-20">
         <h3 className="text-2xl font-display mb-8">Still thinking about it?</h3>
         <Link to="/">
           <Button variant="ghost" className="group">
              Read our Manifesto <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Button>
         </Link>
      </section>
    </div>
  );
}
