import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import HeroOrb from '@/components/three/HeroOrb';
import ParticleField from '@/components/three/ParticleField';
import { Button, Input, GlassPanel } from '@/components/ui';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { reveal, fadeUp, staggerContainer } from '@/lib/motion';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'bg-white/5' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-rose/70', 'bg-amber/70', 'bg-accent/80', 'bg-emerald/80'];
  return { score, label: labels[score - 1] || 'Weak', color: colors[score - 1] || 'bg-rose/70' };
}

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, authError } = useAuth();
  const mode = searchParams.get('mode') || 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  useEffect(() => {
    setError('');
    setPassword('');
  }, [mode]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setIsLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth?mode=login`,
    });
    setIsLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setError('Password reset email sent. Check your inbox.');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(password);

  return (
    <div className="flex min-h-[calc(100dvh-80px)]">
      {/* Visual Side — editorial quote pinned over orb */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center border-r border-white/[0.045]">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#6b8afe" />
            <pointLight position={[-5, -3, 2]} intensity={0.5} color="#a78bfa" />
            <HeroOrb />
            <ParticleField />
          </Canvas>
        </div>

        {/* Atmospheric vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_25%,rgba(6,8,15,0.6)_90%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative z-10 max-w-md mx-8"
        >
          <GlassPanel elevation="raised" padding="lg" edgeLight className="text-center">
            <span className="font-editorial text-6xl text-accent/[0.18] block leading-none mb-[-12px]">&ldquo;</span>
            <h2 className="font-editorial italic text-2xl lg:text-[26px] leading-[1.32] text-ink/95 mb-7 tracking-tight">
              The mind is its own place, and in itself can make a heaven of hell, a hell of heaven.
            </h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-gradient-to-r from-transparent via-accent/55 to-transparent" />
              <span className="text-[9px] font-medium text-accent/65 uppercase tracking-[0.32em]">Milton</span>
              <span className="h-px w-10 bg-gradient-to-r from-transparent via-accent/55 to-transparent" />
            </div>
            <p className="text-[10px] font-medium text-ink-faint/55 uppercase tracking-[0.28em] leading-loose">
              Lock your thinking in the vault.
              <br />
              Face reality with clarity.
            </p>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-start sm:items-center justify-center p-5 sm:p-6 lg:p-10 overflow-y-auto">
        <motion.div
          key={mode}
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={reveal} className="text-center mb-10">
            <div className="w-12 h-12 rounded-2xl bg-accent/[0.08] flex items-center justify-center mx-auto mb-7 border border-accent/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_20px_rgba(107,138,254,0.10)]">
              <ShieldCheck className="w-5 h-5 text-accent" strokeWidth={1.6} />
            </div>
            <h1 className="text-display text-display-balanced text-3xl lg:text-[40px] font-semibold mb-3 leading-[1.05] tracking-tight">
              {mode === 'login' ? (
                <>
                  Welcome <span className="font-editorial text-accent/95">back</span>
                </>
              ) : (
                <>
                  Join the <span className="font-editorial text-accent/95">vault</span>
                </>
              )}
            </h1>
            <p className="text-ink-dim/80 text-sm font-light">
              {mode === 'login'
                ? 'Sign in to access your decisions.'
                : 'Start your journey to sharper thinking.'}
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose/[0.08] border border-rose/[0.22] rounded-xl flex items-start gap-3 text-sm text-rose/90"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.6} />
              <span className="font-light leading-relaxed">{error}</span>
            </motion.div>
          )}

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              placeholder="alex@example.com"
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-0.5">
                <label className="kicker text-ink-dim/75">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isLoading}
                    className="text-[10px] text-accent/75 hover:text-accent uppercase tracking-[0.22em] font-medium transition-colors duration-400 disabled:opacity-40"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <Input
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required
              />
              {mode === 'signup' && password && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-1.5 flex items-center gap-3"
                >
                  <div className="h-1 flex-1 bg-white/[0.045] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${pwStrength.color} shadow-[0_0_8px_currentColor]`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(pwStrength.score / 4) * 100}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-ink-faint/70 uppercase tracking-[0.2em] min-w-[40px]">
                    {pwStrength.label}
                  </span>
                </motion.div>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-1"
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'login' ? (
                'Enter the Vault'
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-medium tracking-[0.28em]">
                <span className="bg-void px-3 text-ink-faint/45">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border border-white/[0.08] bg-white/[0.018] hover:bg-white/[0.04] hover:border-white/[0.14] transition-colors duration-400 font-medium text-sm tracking-tight disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c2.29 0 4.18.8 5.73 2.25L21.1 3.9C18.67 1.59 15.61 0 12 0 7.31 0 3.25 2.67 1.15 6.57L5.3 9.79c1.02-3.1 3.91-4.75 6.7-4.75z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.8-.07-1.56-.19-2.27H12v4.51h6.47c-.28 1.48-1.12 2.74-2.38 3.58l4.15 3.22c2.42-2.24 3.82-5.54 3.82-9.04z" />
                <path fill="#34A853" d="M5.3 14.21L1.15 17.43c2.1 3.9 6.16 6.57 10.85 6.57 3.12 0 5.73-1.04 7.64-2.82l-4.15-3.22c-1.06.71-2.42 1.13-3.49 1.13-2.79 0-5.68-1.65-6.7-4.75z" />
                <path fill="#FBBC05" d="M5.3 9.79C5.03 10.59 4.89 11.43 4.89 12.3c0 .87.14 1.71.41 2.51l-4.15 3.22C.41 15.89 0 14.14 0 12.3s.41-3.59 1.15-5.13L5.3 9.79z" />
              </svg>
              Continue with Google
            </button>
          </motion.form>

          <motion.p variants={fadeUp} className="text-center mt-8 text-sm text-ink-dim/70 font-light">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              to={`/auth?mode=${mode === 'login' ? 'signup' : 'login'}`}
              className="text-accent hover:text-accent/80 font-semibold transition-colors duration-400 tracking-tight"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
