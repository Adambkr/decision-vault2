import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'motion/react';
import { gsap } from '@/lib/gsap';
import HeroOrb from '@/components/three/HeroOrb';
import ParticleField from '@/components/three/ParticleField';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headlineRef.current) return;

    const words = headlineRef.current.innerText.split(' ');
    headlineRef.current.innerHTML = words
      .map(word => `<span class="inline-block overflow-hidden"><span class="reveal-word inline-block">${word}</span></span>`)
      .join(' ');

    gsap.fromTo('.reveal-word', 
      { y: '100%' },
      { 
        y: '0%', 
        duration: 1, 
        stagger: 0.1, 
        ease: 'power4.out',
        delay: 0.5
      }
    );

    gsap.from('.hero-content-fade', {
      opacity: 0,
      y: 20,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 1.2
    });
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-12 w-full">
          <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full hero-content-fade">
          <div className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#F5A623]">The Human Decision Layer</span>
        </div>
        
        <h1 ref={headlineRef} className="text-7xl lg:text-[100px] font-serif leading-[0.95] tracking-tight mb-8">
          Your best <span className="italic font-light">decisions</span> live in your own mind.
        </h1>
        
        <p className="hero-content-fade text-xl text-white/50 max-w-lg mb-10 leading-relaxed font-light">
          DecisionVault is the high-fidelity journal that holds your thinking accountable. No AI shortcuts. No digital noise. Just pure executive clarity.
        </p>
        
        <div className="hero-content-fade flex flex-wrap gap-8 items-center mt-4">
          <Link to="/auth?mode=signup" className="bg-[#F5A623] text-[#080C14] px-10 py-5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-amber-500/20 active:scale-95">
            Start Journaling Free
          </Link>
          <button className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 hover:text-white group">
            <span className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#F5A623] transition-colors bg-white/[0.02]">
              <Play className="w-4 h-4 fill-white group-hover:fill-[#F5A623]" />
            </span>
            Watch the logic
          </button>
        </div>

        <div className="hero-content-fade mt-16 pt-12 border-t border-white/5 flex items-center gap-12">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Status</span>
            <span className="text-xs font-mono text-amber-100/60 uppercase">2 min setup</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Access</span>
            <span className="text-xs font-mono text-amber-100/60 uppercase">No Credit Card</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Philosophy</span>
            <span className="text-xs font-mono text-amber-100/60 uppercase">Human-only</span>
          </div>
        </div>
      </div>

          <div className="relative h-[600px] w-full hidden md:block">
            <div className="absolute inset-0 z-0">
               <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <HeroOrb />
                <ParticleField />
              </Canvas>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-display mb-6">Three steps. A lifetime of clarity.</h2>
            <div className="w-24 h-0.5 bg-gold-accent mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                title: 'Log It', 
                desc: 'Write your decision, your reasoning, and your prediction before you commit. Lock it in the vault.' 
              },
              { 
                step: '02', 
                title: 'Live It', 
                desc: 'Make the call. Take action. DecisionVault waits in the background as reality unfolds.' 
              },
              { 
                step: '03', 
                title: 'Face It', 
                desc: '30, 60, 90 days later—we resurface your entry. Compare your prediction to reality. Get sharper.' 
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-10 relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-8 text-[120px] font-mono font-bold text-white/[0.02] leading-none select-none transition-all duration-500 group-hover:text-gold-accent/[0.05] group-hover:-translate-y-4">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-display font-bold mb-4">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <span className="block text-5xl font-display font-medium text-gold-accent mb-2">14,000+</span>
            <span className="text-sm font-mono text-white/40 uppercase tracking-widest">Decisions Logged</span>
          </div>
          <div>
            <span className="block text-5xl font-display font-medium text-gold-accent mb-2">89%</span>
            <span className="text-sm font-mono text-white/40 uppercase tracking-widest">Accuracy Improvement</span>
          </div>
          <div>
            <span className="block text-5xl font-display font-medium text-gold-accent mb-2">Zero</span>
            <span className="text-sm font-mono text-white/40 uppercase tracking-widest">AI Intervention</span>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-7xl font-display text-gold-accent/20 block mb-[-20px]">"</span>
          <h2 className="text-3xl md:text-5xl font-display leading-tight italic px-12">
            In a world where AI makes every decision easier, we believe the hardest—and most valuable—thing you can do is think for yourself.
          </h2>
          <span className="text-7xl font-display text-gold-accent/20 block mt-4 leading-none inline-block transform rotate-180">"</span>
          
          <div className="mt-12 flex flex-col items-center gap-4">
            <span className="h-px w-20 bg-white/20" />
            <span className="font-mono text-xs text-white/40 uppercase tracking-[0.4em]">The DecisionVault Manifesto</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 md:p-24 text-center overflow-hidden relative">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold-accent/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-display mb-8">Ready to lock in your next move?</h2>
              <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 bg-white text-luxury-bg px-10 py-5 rounded-full font-bold text-lg hover:bg-gold-accent transition-all active:scale-95">
                Join the Elite thinkers <ArrowRight className="w-5 h-5" />
              </Link>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
