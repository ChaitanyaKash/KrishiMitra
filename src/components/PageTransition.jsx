import React from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const baseVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18 },
  },
};

export default function PageTransition({ children, className = '' }) {
  const prefersReduced = usePrefersReducedMotion();

  const variants = React.useMemo(() => {
    if (!prefersReduced) {
      return baseVariants;
    }

    return {
      initial: { opacity: 1, y: 0, transition: { duration: 0 } },
      animate: { opacity: 1, y: 0, transition: { duration: 0 } },
      exit: { opacity: 1, y: 0, transition: { duration: 0 } },
    };
  }, [prefersReduced]);

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  );
}
