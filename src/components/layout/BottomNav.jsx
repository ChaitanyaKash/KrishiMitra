import { NavLink } from 'react-router-dom';
import { Home, Map as MapIcon, ClipboardList, Wallet, BookOpen, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export function BottomNav() {
  const prefersReduced = usePrefersReducedMotion();
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/satellite', icon: MapIcon, label: 'Satellite' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/finance', icon: Wallet, label: 'Finance' },
    { to: '/schemes', icon: BookOpen, label: 'Schemes' },
    { to: '/intelligence', icon: Cpu, label: 'Intel' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto grid max-w-sm grid-cols-6 items-center border-t border-gray-100 bg-white px-1 py-2 shadow-[0_-6px_24px_rgba(15,23,42,0.08)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="min-w-0"
        >
          {({ isActive }) => (
            <motion.div
              className="relative flex flex-col items-center px-1 py-2"
              whileTap={prefersReduced ? undefined : { scale: 0.85, y: 2 }}
              transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 17 }}
            >
              {isActive && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl border border-km-green/10 bg-km-green-light"
                  transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
              <motion.span
                className={`relative z-10 ${isActive ? 'text-km-green' : 'text-gray-400'}`}
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20 }}
              >
                <item.icon size={20} strokeWidth={2.5} />
              </motion.span>
              <span className={`relative z-10 mt-1 text-[9px] font-semibold ${isActive ? 'text-km-green' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </div>
  );
}
