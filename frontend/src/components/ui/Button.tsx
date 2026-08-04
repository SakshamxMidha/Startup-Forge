import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-crimson-fill text-white hover:opacity-90 shadow-glow',
  secondary: 'bg-bg-elev border border-border text-fg hover:bg-bg-soft',
  ghost: 'text-fg-muted hover:text-fg hover:bg-bg-soft',
  danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
  gradient: 'text-white bg-gradient-to-r from-crimson via-crimson-bright to-gold bg-[length:200%_auto] animate-gradient-move shadow-glow',
};

// Primary/gradient CTAs get the animated sheen sweep on hover — the quieter variants
// (secondary/ghost/danger) stay restrained so the sheen reads as a "primary action" cue.
const sheenVariants: Variant[] = ['primary', 'gradient'];

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...rest }, ref) => {
    const interactive = !disabled && !loading;
    return (
      <motion.button
        ref={ref}
        whileTap={interactive ? { scale: 0.93 } : undefined}
        whileHover={interactive ? {
          scale: 1.05,
          boxShadow: [
            '0 0 22px -4px rgb(var(--glow) / 0.55)',
            '0 0 40px -2px rgb(var(--glow) / 0.85)',
            '0 0 22px -4px rgb(var(--glow) / 0.55)',
          ],
        } : undefined}
        transition={{
          scale: { type: 'spring', stiffness: 420, damping: 22 },
          boxShadow: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
        }}
        disabled={disabled || loading}
        className={`relative overflow-hidden inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none ${variants[variant]} ${sizes[size]} ${className}`}
        {...rest}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
        {interactive && sheenVariants.includes(variant) && (
          <motion.span
            aria-hidden
            className="absolute inset-y-0 -left-1/3 w-1/3 pointer-events-none"
            style={{
              background: 'linear-gradient(115deg, transparent, rgba(255,255,255,.6), transparent)',
              transform: 'skewX(-20deg)',
            }}
            initial={{ x: '-30%' }}
            whileHover={{ x: '420%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
