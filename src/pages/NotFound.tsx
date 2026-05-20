import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg space-y-8"
      >
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-accent/8 rounded-full blur-2xl" />
          <div className="relative w-full h-full rounded-full border border-white/[0.05] flex items-center justify-center bg-white/[0.02]">
            <Compass className="w-12 h-12 text-accent/30" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl font-display font-bold text-ink-faint/15">404</h1>
          <h2 className="text-2xl font-display font-medium">Lost in the void</h2>
          <p className="text-ink-dim/60 max-w-sm mx-auto">
            This path does not exist in the vault. The decision to navigate here was, perhaps, a learning moment.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4" /> Back to Vault
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary">
              Return Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
