import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const toneMap = {
  success: {
    container: 'border-km-green/15 bg-white text-km-green-dark shadow-[0_18px_36px_rgba(15,110,86,0.12)]',
    iconBg: 'bg-km-green-light text-km-green',
  },
  warning: {
    container: 'border-km-amber/20 bg-white text-km-amber shadow-[0_18px_36px_rgba(186,117,23,0.12)]',
    iconBg: 'bg-km-amber-light text-km-amber',
  },
  info: {
    container: 'border-blue-200 bg-white text-blue-600 shadow-[0_18px_36px_rgba(37,99,235,0.12)]',
    iconBg: 'bg-blue-50 text-blue-600',
  },
};

function SuccessIcon() {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-km-green-light text-km-green">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <motion.path
          d="M5 12.5L9.2 16.7L19 7.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: prefersReduced ? 1 : 0, opacity: prefersReduced ? 1 : 0.4 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.38, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}

function ToastIcon({ type }) {
  if (type === 'success') {
    return <SuccessIcon />;
  }

  if (type === 'warning') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-km-amber-light text-km-amber">
        <AlertTriangle size={18} />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
      <Info size={18} />
    </div>
  );
}

function ToastCard({ toast, onDismiss }) {
  const prefersReduced = usePrefersReducedMotion();
  const tone = toneMap[toast.type] ?? toneMap.info;

  React.useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 3000);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  return (
    <motion.div
      layout
      initial={prefersReduced ? { opacity: 1, y: 0 } : { y: 80, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        transition: prefersReduced
          ? { duration: 0 }
          : { type: 'spring', stiffness: 300, damping: 25 },
      }}
      exit={prefersReduced ? { opacity: 0 } : { y: 24, opacity: 0, transition: { duration: 0.18 } }}
      className={`pointer-events-auto flex w-full items-center gap-3 rounded-2xl border px-4 py-3 ${tone.container}`}
    >
      <ToastIcon type={toast.type} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{toast.message}</p>
      </div>
    </motion.div>
  );
}

export function ToastManager({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex w-full max-w-sm flex-col gap-2 px-4">
      <AnimatePresence initial={false}>
        {toasts.slice(0, 3).map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
