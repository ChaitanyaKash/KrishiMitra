import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export function Card({ children, className = '', onClick, interactive = false, ...props }) {
  const prefersReduced = usePrefersReducedMotion();
  const isInteractive = interactive || Boolean(onClick);

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${isInteractive ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      whileHover={
        isInteractive && !prefersReduced
          ? { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
          : undefined
      }
      whileTap={isInteractive && !prefersReduced ? { scale: 0.98, y: 0 } : undefined}
      transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
