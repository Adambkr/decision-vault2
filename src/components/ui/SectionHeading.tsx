import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { reveal, staggerContainer } from '@/lib/motion';

interface SectionHeadingProps {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** When true, animates on scroll; otherwise renders static */
  animate?: boolean;
}

const sizeMap = {
  sm: 'text-2xl sm:text-3xl md:text-4xl',
  md: 'text-3xl sm:text-4xl md:text-5xl',
  lg: 'text-4xl sm:text-5xl md:text-6xl',
  xl: 'text-5xl sm:text-6xl md:text-7xl lg:text-[88px]',
};

/**
 * Editorial section heading — kicker + headline + optional description.
 * Animates in on scroll using the shared reveal motion language.
 */
export function SectionHeading({
  kicker,
  title,
  description,
  align = 'center',
  size = 'md',
  className,
  animate = true,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const maxW = align === 'center' ? 'max-w-2xl' : 'max-w-3xl';

  const content = (
    <>
      {kicker && (
        <motion.div variants={reveal} className="mb-5 sm:mb-6">
          {typeof kicker === 'string' ? (
            <span className="kicker-accent">{kicker}</span>
          ) : (
            kicker
          )}
        </motion.div>
      )}
      <motion.h2
        variants={reveal}
        className={cn(
          'text-display text-display-balanced font-semibold mb-5 leading-[1.04]',
          sizeMap[size]
        )}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={reveal}
          className={cn(
            'text-ink-dim/75 leading-relaxed text-base sm:text-lg font-light',
            align === 'center' && 'mx-auto'
          )}
        >
          {description}
        </motion.p>
      )}
    </>
  );

  if (!animate) {
    return (
      <div className={cn(alignClass, maxW, className)}>
        {kicker && (
          <div className="mb-5 sm:mb-6">
            {typeof kicker === 'string' ? <span className="kicker-accent">{kicker}</span> : kicker}
          </div>
        )}
        <h2 className={cn('text-display text-display-balanced font-semibold mb-5 leading-[1.04]', sizeMap[size])}>
          {title}
        </h2>
        {description && (
          <p className={cn('text-ink-dim/75 leading-relaxed text-base sm:text-lg font-light', align === 'center' && 'mx-auto')}>
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.12)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={cn(alignClass, maxW, className)}
    >
      {content}
    </motion.div>
  );
}
