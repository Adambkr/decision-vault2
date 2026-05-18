import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import HeroOrb from '@/components/three/HeroOrb';
import ParticleField from '@/components/three/ParticleField';
import { Button, Input } from '@/components/ui';
import { ShieldCheck, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signInWithGoogle, authError } = useAuth();
  const mode = searchParams.get('mode') || 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // Redirect happens via useEffect
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('Email/Password authentication is not configured. Please use Google Login.');
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-luxury-surface border-r border-white/5">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <HeroOrb />
            <ParticleField />
          </Canvas>
        </div>
        
        <div className="relative z-10 text-center max-w-md p-12 bg-luxury-bg/40 backdrop-blur-md border border-white/5 rounded-3xl">
          <span className="text-7xl font-display text-gold-accent/20 block mb-[-20px]">"</span>
          <h2 className="text-3xl font-display italic mb-8">
            The mind is its own place, and in itself can make a heaven of hell, a hell of heaven.
          </h2>
          <div className="h-px w-12 bg-gold-accent mx-auto mb-4" />
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest leading-loose">
            Lock your thinking in the vault.<br />Face reality with clarity.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <ShieldCheck className="w-12 h-12 text-gold-accent mx-auto mb-6" />
            <h1 className="text-4xl font-display font-medium mb-2">
              {mode === 'login' ? 'Welcome back' : 'Join the Vault'}
            </h1>
            <p className="text-white/40">
              {mode === 'login' 
                ? 'Sign in to access your decisions.' 
                : 'Start your journey to sharper thinking.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-sm text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input 
              label="Email Address" 
              placeholder="alex@example.com" 
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-mono uppercase tracking-widest text-white/40">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-[10px] text-gold-accent/60 hover:text-gold-accent uppercase tracking-widest font-mono">
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
              {mode === 'signup' && (
                <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-accent w-1/3 transition-all duration-500" />
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="mt-2" disabled={isLoading}>
              {isLoading ? 'Verifying...' : mode === 'login' ? 'Enter the Vault' : 'Create Account'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest"><span className="bg-luxury-bg px-2 text-white/20">Third-party Access</span></div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all font-medium text-sm disabled:opacity-50"
            >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c2.29 0 4.18.8 5.73 2.25L21.1 3.9C18.67 1.59 15.61 0 12 0 7.31 0 3.25 2.67 1.15 6.57L5.3 9.79c1.02-3.1 3.91-4.75 6.7-4.75z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.8-.07-1.56-.19-2.27H12v4.51h6.47c-.28 1.48-1.12 2.74-2.38 3.58l4.15 3.22c2.42-2.24 3.82-5.54 3.82-9.04z"/>
                  <path fill="#34A853" d="M5.3 14.21L1.15 17.43c2.1 3.9 6.16 6.57 10.85 6.57 3.12 0 5.73-1.04 7.64-2.82l-4.15-3.22c-1.06.71-2.42 1.13-3.49 1.13-2.79 0-5.68-1.65-6.7-4.75z"/>
                  <path fill="#FBBC05" d="M5.3 9.79C5.03 10.59 4.89 11.43 4.89 12.3c0 .87.14 1.71.41 2.51l-4.15 3.22C.41 15.89 0 14.14 0 12.3s.41-3.59 1.15-5.13L5.3 9.79z"/>
               </svg>
               Continue with Google
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-white/40">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link to={`/auth?mode=${mode === 'login' ? 'signup' : 'login'}`} className="text-gold-accent hover:text-gold-light font-bold">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
