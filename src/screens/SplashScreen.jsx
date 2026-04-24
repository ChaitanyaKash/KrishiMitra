import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { MotionButton } from '../components/ui/MotionButton';
import { KMCardScanner } from '../components/features/KMCardScanner';
import { useFarmer } from '../context/FarmerContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScreenLoader } from '../hooks/useScreenLoader';

function SplashSkeleton() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-km-green-dark p-6 text-white">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Skeleton variant="circular" className="h-24 w-24 bg-white/20" />
        <Skeleton className="mt-6 h-10 w-24 rounded-lg bg-white/20" />
        <Skeleton className="mt-3 h-6 w-44 rounded-lg bg-white/20" />
        <Skeleton className="mt-8 h-4 w-56 rounded-lg bg-white/15" />
      </div>
      <div className="w-full flex-none pb-8">
        <Skeleton className="h-14 rounded-xl bg-white/20" />
        <Skeleton className="mt-4 h-12 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

export default function SplashScreen() {
  const navigate = useNavigate();
  const { loadDemoFarmer } = useFarmer();
  const prefersReduced = usePrefersReducedMotion();
  const isScreenReady = useScreenLoader();
  const [showScanner, setShowScanner] = React.useState(false);
  const [manualId, setManualId] = React.useState('');

  const handleScan = (text) => {
    setShowScanner(false);
    if (text === 'KM2024DEMO') {
      loadDemoFarmer();
      navigate('/dashboard');
    } else {
      loadDemoFarmer();
      navigate('/dashboard');
    }
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    if (manualId === 'KM2024DEMO') {
      loadDemoFarmer();
      navigate('/dashboard');
    } else if (manualId.trim()) {
      loadDemoFarmer();
      navigate('/dashboard');
    }
  };

  if (!isScreenReady) {
    return <SplashSkeleton />;
  }

  return (
    <>
      <motion.div
        className="relative flex min-h-screen flex-col items-center justify-center bg-km-green-dark p-6 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.22 } }}
      >
        <div className="flex flex-1 flex-col items-center justify-center">
          <motion.div
            className="mb-4 rounded-full bg-white p-6 text-km-green"
            animate={prefersReduced ? undefined : { y: [0, -4, 0] }}
            transition={prefersReduced ? { duration: 0 } : { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          >
            <Leaf size={64} strokeWidth={2.5} />
          </motion.div>
          <motion.h1
            className="mb-2 text-5xl font-bold"
            initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}
          >
            KM
          </motion.h1>
          <motion.h2
            className="text-xl font-medium tracking-wide"
            initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24, delay: prefersReduced ? 0 : 0.08 } }}
          >
            Krishi Mitra
          </motion.h2>
          <motion.p
            className="mt-8 text-km-green-light"
            initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24, delay: prefersReduced ? 0 : 0.16 } }}
          >
            खेती अब पेशा है — Farming is now a profession
          </motion.p>
        </div>

        <motion.div
          className="w-full flex-none pb-8"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.3, delay: prefersReduced ? 0 : 0.12 } }}
        >
          <MotionButton
            onClick={() => setShowScanner(true)}
            className="w-full rounded-xl bg-white px-6 py-4 text-lg font-bold text-km-green-dark shadow-lg shadow-black/20"
          >
            Scan KM Card
          </MotionButton>
          <MotionButton
            onClick={() => navigate('/onboard')}
            className="mt-4 w-full rounded-xl border-2 border-white/30 bg-transparent px-6 py-3 text-base font-semibold text-white"
          >
            New farmer? Register
          </MotionButton>
          <p className="mt-6 text-center font-mono text-xs text-white/50">[Demo] Use ID: KM2024DEMO</p>
        </motion.div>
      </motion.div>

      <Modal isOpen={showScanner} onClose={() => setShowScanner(false)} title="Scan KM Card">
        <div className="mx-auto mt-2">
          <p className="mb-4 text-center text-sm text-gray-500">Point your camera at the KM Card QR code</p>
          <KMCardScanner onScan={handleScan} />

          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-sm font-medium text-gray-600">Or enter ID manually:</p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(event) => setManualId(event.target.value)}
                placeholder="KM-2024-..."
                className="flex-1 rounded-lg border px-3 py-2 text-gray-800"
              />
              <MotionButton type="submit" className="rounded-lg bg-km-green px-4 py-2 font-medium text-white">
                Enter
              </MotionButton>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
