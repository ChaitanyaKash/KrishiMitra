import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export function MotionButton({
  children,
  className = '',
  whileHover,
  whileTap,
  transition,
  ...props
}) {
  const prefersReduced = usePrefersReducedMotion();

  const resolvedTransition = prefersReduced
    ? { duration: 0 }
    : transition ?? { type: 'spring', stiffness: 500, damping: 20 };

  return (
    <motion.button
      className={className}
      whileHover={prefersReduced ? undefined : whileHover ?? { scale: 1.02 }}
      whileTap={prefersReduced ? undefined : whileTap ?? { scale: 0.97 }}
      transition={resolvedTransition}
      {...props}
    >
      {children}
    </motion.button>
  );
}
