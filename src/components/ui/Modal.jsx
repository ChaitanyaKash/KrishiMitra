import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export function Modal({ isOpen, onClose, title, children }) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: prefersReduced ? 1 : 0 }}
          animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.18 } }}
          exit={{ opacity: 0, transition: { duration: prefersReduced ? 0 : 0.16 } }}
        >
          <motion.div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
            initial={prefersReduced ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: prefersReduced
                ? { duration: 0 }
                : { type: 'spring', stiffness: 360, damping: 28 },
            }}
            exit={{
              opacity: 0,
              y: prefersReduced ? 0 : 8,
              scale: prefersReduced ? 1 : 0.98,
              transition: { duration: prefersReduced ? 0 : 0.16 },
            }}
          >
            <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
              <h3 className="font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
