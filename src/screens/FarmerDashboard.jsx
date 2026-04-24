import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Map as MapIcon, ChevronRight, CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { MotionButton } from '../components/ui/MotionButton';
import { CurrencyValue, DecimalValue, PercentValue } from '../components/ui/AnimatedValue';
import { useFarmer } from '../context/FarmerContext';
import { useToast } from '../components/ui/Toast';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScreenLoader } from '../hooks/useScreenLoader';
import { formatCurrency } from '../utils/formatCurrency';

const circumference = 2 * Math.PI * 52;
const healthToneMap = {
  green: {
    stroke: '#1D9E75',
    title: 'Crop looking strong',
    background: 'rgba(225, 245, 238, 0.78)',
    border: 'rgba(29, 158, 117, 0.18)',
    text: 'text-km-green-darker',
    badge: 'bg-km-green-light text-km-green-darker border-km-green/20',
  },
  amber: {
    stroke: '#BA7517',
    title: 'Stress signals detected',
    background: 'rgba(250, 238, 218, 0.82)',
    border: 'rgba(186, 117, 23, 0.28)',
    text: 'text-km-amber',
    badge: 'bg-km-amber-light text-km-amber border-km-amber/20',
  },
  red: {
    stroke: '#A32D2D',
    title: 'Immediate attention needed',
    background: 'rgba(252, 235, 235, 0.9)',
    border: 'rgba(163, 45, 45, 0.24)',
    text: 'text-km-red-dark',
    badge: 'bg-km-red-light text-km-red border-km-red/20',
  },
  gray: {
    stroke: '#6B7280',
    title: 'Awaiting recent scan',
    background: 'rgba(243, 244, 246, 0.95)',
    border: 'rgba(107, 114, 128, 0.18)',
    text: 'text-gray-600',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 pb-10">
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton variant="circular" className="h-10 w-10" />
      </div>

      <Skeleton className="h-48 rounded-[24px]" />

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-[20px]" />
        ))}
      </div>

      <Skeleton className="h-36 rounded-[24px]" />
      <Skeleton className="h-24 rounded-[24px]" />
      <Skeleton className="h-28 rounded-[24px]" />
    </div>
  );
}

function HealthRing({ healthPercent, prefersReduced, strokeColor }) {
  const progressOffset = circumference * (1 - healthPercent / 100);

  return (
    <div className="relative h-[120px] w-[120px] shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="52"
          stroke="rgba(15, 110, 86, 0.12)"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          stroke={strokeColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={prefersReduced ? { duration: 0 } : { duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <PercentValue
          value={healthPercent}
          asWhole
          className="text-2xl font-black leading-none"
          style={{ color: strokeColor }}
        />
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-km-green-darker/70">
          NDVI
        </span>
      </div>
    </div>
  );
}

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { state, ndviData, farmReport } = useFarmer();
  const { showToast } = useToast();
  const prefersReduced = usePrefersReducedMotion();
  const isScreenReady = useScreenLoader();
  const [showCancelModal, setShowCancelModal] = React.useState(false);

  if (!state.isLoaded || !isScreenReady) {
    return <DashboardSkeleton />;
  }

  const { farmer, farm, activeCrop, fpoOrders, satellite, mandiPrices } = state;
  const activeOrder = fpoOrders.length > 0 ? fpoOrders[0] : null;
  const mandiPrice = mandiPrices[activeCrop.type] || { price: 22 };
  const fpoPrice = activeOrder ? activeOrder.pricePerKg : 48;
  const isMandiBetter = mandiPrice.price > fpoPrice;
  const healthInsight = ndviData?.insight ?? null;
  const usingLiveNDVI = Boolean(ndviData && ndviData.success && !ndviData.isMockData);
  const healthPercent = healthInsight?.healthPercent ?? satellite.healthPercent;
  const healthStatus = healthInsight?.status ?? (satellite.status === 'healthy' ? 'Healthy' : 'Stressed');
  const healthExplanation = healthInsight?.explanation ?? (satellite.status === 'healthy' ? 'Healthy canopy and stable vigor' : 'Stress detected in the latest scan');
  const healthStatusColor = healthInsight?.statusColor ?? (satellite.status === 'healthy' ? 'green' : 'amber');
  const healthTone = healthToneMap[healthStatusColor] ?? healthToneMap.green;
  const intelligenceScore = farmReport?.overallScore ?? null;
  const intelligenceStatus = farmReport?.overallStatus ?? null;
  const topRisk = farmReport?.risks?.[0] ?? null;
  const farmHealthValue = intelligenceScore ?? healthPercent;
  const farmHealthTone =
    intelligenceStatus?.color === 'red'
      ? {
          bg: 'bg-km-red-light',
          heading: 'text-km-red-dark',
          value: 'text-km-red',
          subtext: 'text-km-red-dark/70',
        }
      : intelligenceStatus?.color === 'amber'
        ? {
            bg: 'bg-km-amber-light',
            heading: 'text-km-amber',
            value: 'text-km-amber',
            subtext: 'text-km-amber/80',
          }
        : {
            bg: 'bg-km-green-light',
            heading: 'text-km-green-darker',
            value: 'text-km-green',
            subtext: 'text-km-green-darker/70',
          };
  const topRiskToneClass =
    topRisk?.severity === 'critical'
      ? 'text-km-red'
      : topRisk?.severity === 'warning'
        ? 'text-km-amber'
        : 'text-blue-700';

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.07,
      },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, y: prefersReduced ? 0 : 24, scale: prefersReduced ? 1 : 0.97 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReduced
        ? { duration: 0 }
        : { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const heroMotion = {
    backgroundColor: healthTone.background,
    borderColor: healthTone.border,
  };

  return (
    <>
      <motion.div
        className="flex flex-col gap-4 p-4 pb-10"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={cardVariants} className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-km-green text-lg font-bold text-white shadow-sm">
              {farmer.name.split(' ').map((name) => name[0]).join('')}
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900">{farmer.name}</h1>
              <p className="text-sm text-gray-500">{farmer.village}</p>
              <div className="mt-1 flex items-center gap-1">
                <Badge variant="default" className="text-[10px]">{farmer.kmCardId}</Badge>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(farmer.kmCardId);
                    showToast('KM Card ID copied to clipboard', 'success');
                  }}
                  className="ml-1 rounded-lg p-1 text-gray-400 transition hover:text-km-green"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>
          <motion.button
            className="relative rounded-full bg-white p-2 text-gray-400 shadow-sm"
            whileHover={prefersReduced ? undefined : { y: -1 }}
            whileTap={prefersReduced ? undefined : { scale: 0.95 }}
            transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 22 }}
          >
            <Bell size={22} />
            <span className="absolute right-2 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-km-red"></span>
          </motion.button>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className={`relative overflow-hidden border rounded-[24px] ${
              healthPercent >= 80 && healthStatusColor === 'green' ? 'health-pulse' : ''
            }`}
            animate={heroMotion}
            transition={{ duration: prefersReduced ? 0 : 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-transparent to-white/70" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="max-w-[180px]">
                <h2 className="text-sm font-semibold capitalize text-gray-500">
                  {activeCrop.type} • {activeCrop.variety}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${healthTone.badge}`}>
                    {healthStatus}
                  </div>
                  {usingLiveNDVI ? (
                    <div className="flex items-center gap-2 rounded-full border border-km-green/20 bg-km-green-light px-3 py-1 text-xs font-semibold text-km-green-darker">
                      <span className="h-2 w-2 rounded-full bg-km-green animate-pulse" />
                      🛰️ Live
                    </div>
                  ) : (
                    <div className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                      Demo
                    </div>
                  )}
                </div>
                <p className="mt-3 text-2xl font-black text-gray-900">
                  {healthTone.title}
                </p>
                <p className={`mt-2 font-semibold ${healthTone.text}`}>
                  {healthExplanation}
                </p>
                <p className="mt-3 text-xs font-medium text-gray-500">Days to harvest: 30</p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <HealthRing healthPercent={healthPercent} prefersReduced={prefersReduced} strokeColor={healthTone.stroke} />
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-black shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-600 via-green-500 to-yellow-500 opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapIcon className="h-8 w-8 text-white/70" />
                  </div>
                </div>
              </div>
            </div>
            <div className="relative mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
              <span className="text-gray-500">Last scan: 2 days ago</span>
              <MotionButton
                onClick={() => navigate('/satellite')}
                className="flex items-center leading-none text-km-green font-semibold"
              >
                View Full Satellite Report <ChevronRight size={16} />
              </MotionButton>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div variants={cardVariants}>
            <Card className="p-3">
              <div className="text-xs font-medium text-gray-500">Guaranteed Price</div>
              <div className="mt-1 flex items-baseline gap-1 text-xl font-bold text-gray-900">
                <CurrencyValue value={fpoPrice} />
                <span className="text-xs font-normal text-gray-500">/kg</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1 text-xs text-gray-400">
                <span>vs</span>
                <CurrencyValue value={mandiPrice.price} />
                <span>mandi</span>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-3">
              <div className="text-xs font-medium text-gray-500">Expected Profit</div>
              <div className="mt-1 text-xl font-bold text-km-green">
                <CurrencyValue value={234000} />
              </div>
              <div className="mt-1 text-xs text-gray-400">this season</div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-3">
              <div className="text-xs font-medium text-gray-500">Farm Area</div>
              <div className="mt-1 flex items-baseline gap-1 text-xl font-bold text-gray-900">
                <DecimalValue value={farm.areaAcres} maximumFractionDigits={1} minimumFractionDigits={1} />
                <span className="text-sm font-normal text-gray-500">ac</span>
              </div>
              <div className="mt-1 line-clamp-1 text-[10px] text-gray-400">{farmer.village.split(',')[0]}</div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className={`border-transparent p-3 ${farmHealthTone.bg}`}>
              <div className={`text-xs font-medium ${farmHealthTone.heading}`}>
                {intelligenceScore !== null ? 'Farm Health' : 'Crop Health'}
              </div>
              <div className={`mt-1 text-xl font-bold ${farmHealthTone.value}`}>
                <PercentValue value={farmHealthValue} asWhole />
              </div>
              <div className={`mt-1 text-[10px] ${farmHealthTone.subtext}`}>
                {intelligenceStatus ? intelligenceStatus.label : 'Last scan: 2 days ago'}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} className="col-span-2">
            {farmReport ? (
              <Card
                onClick={() => navigate('/intelligence')}
                interactive
                className="border-blue-100 bg-blue-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-blue-900">🧠 Farm Intel</h3>
                    <p className="mt-1 text-2xl font-black text-blue-700">{farmReport.overallScore}/100</p>
                    <p className={`mt-2 text-xs font-semibold ${topRisk ? topRiskToneClass : 'text-blue-700/80'}`}>
                      {topRisk ? `Top risk: ${topRisk.title}` : `${farmReport.overallStatus.emoji} ${farmReport.overallStatus.label}`}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                    🧠
                  </div>
                </div>
                <p className="mt-3 flex items-center text-xs font-semibold text-blue-700/80">
                  View full analysis <ChevronRight size={14} className="ml-0.5" />
                </p>
              </Card>
            ) : (
              <Card
                onClick={() => navigate('/intelligence')}
                interactive
                className="border-dashed border-km-green/25 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">🧠 Farm Intel</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tap to scan your farm with satellite, weather, soil, and air signals.
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-km-green-light text-xl">
                    📡
                  </div>
                </div>
                <p className="mt-3 flex items-center text-xs font-semibold text-km-green">
                  Tap to scan your farm <ChevronRight size={14} className="ml-0.5" />
                </p>
              </Card>
            )}
          </motion.div>
        </div>

        <motion.div variants={cardVariants}>
          {activeOrder ? (
            <Card className="overflow-hidden border-km-green/30 p-0">
              <div className="flex items-center gap-1.5 bg-km-green px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <CheckCircle size={14} /> Your order is LOCKED
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{activeOrder.buyer}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm capitalize text-gray-600">
                      {activeOrder.crop} — {activeOrder.qtyKg.toLocaleString()} kg
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">Delivery: {activeOrder.deliveryStart}</p>
                  </div>
                  <div className="text-right text-xl font-bold text-km-green">
                    <CurrencyValue value={activeOrder.pricePerKg} />
                    <span className="text-sm font-semibold">/kg</span>
                  </div>
                </div>
                <MotionButton
                  onClick={() => navigate('/orders')}
                  className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-600"
                >
                  View order details →
                </MotionButton>
              </div>
            </Card>
          ) : (
            <Card className="border-transparent bg-gradient-to-br from-km-green to-km-green-dark text-white">
              <h3 className="text-lg font-bold">Secure your price now</h3>
              <p className="mb-4 mt-1 text-sm text-white/80">
                You have 6 contracts available for your {activeCrop.type} crop.
              </p>
              <MotionButton
                onClick={() => navigate('/orders')}
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-km-green"
              >
                Browse Contracts →
              </MotionButton>
            </Card>
          )}
        </motion.div>

        <motion.div variants={cardVariants}>
          {isMandiBetter ? (
            <Card className="border-km-amber/30 bg-km-amber-light/50 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-km-amber" size={20} />
                <div>
                  <p className="text-sm font-bold text-km-amber">
                    🔔 {mandiPrice.market} Mandi offering{' '}
                    <CurrencyValue value={mandiPrice.price} className="inline-flex" />
                    /kg today — higher than your FPO order! Sell at mandi instead?
                  </p>
                  <div className="mt-3 flex gap-2">
                    <MotionButton
                      className="rounded-lg bg-km-amber px-4 py-1.5 text-xs font-bold text-white"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Yes
                    </MotionButton>
                    <MotionButton className="rounded-lg border border-km-amber bg-white px-4 py-1.5 text-xs font-bold text-km-amber">
                      No
                    </MotionButton>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex items-center gap-3 border-km-green-light bg-km-green-light p-3">
              <CheckCircle className="shrink-0 text-km-green" size={20} />
              <p className="text-sm font-medium text-km-green-darker">
                Your FPO order beats the market by{' '}
                <CurrencyValue value={fpoPrice - mandiPrice.price} className="inline-flex" />
                /kg today ✓
              </p>
            </Card>
          )}
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            onClick={() => navigate('/schemes')}
            interactive
            className="bg-blue-50 border-blue-100 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="leading-tight font-bold text-blue-900">
                  You qualify for 2 schemes
                  <br />
                  worth <CurrencyValue value={23500} className="inline-flex" />
                </h3>
                <p className="mt-1 flex items-center text-xs font-semibold text-blue-700/80">
                  Tap to apply <ChevronRight size={14} className="ml-0.5" />
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">🏛️</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel FPO Order?">
        <div className="pb-2">
          <p className="text-sm text-gray-700">
            Are you sure you want to cancel your guaranteed FPO order with <strong>{activeOrder?.buyer}</strong>?
          </p>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-km-red/20 bg-km-red-light p-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-km-red" size={18} />
            <p className="text-xs font-medium leading-snug text-km-red-dark">
              You will lose the guaranteed price of {formatCurrency(fpoPrice)}/kg. Market prices may drop before your delivery date.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <MotionButton
              onClick={() => setShowCancelModal(false)}
              className="rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-800"
            >
              Keep Order
            </MotionButton>
            <MotionButton
              onClick={() => {
                setShowCancelModal(false);
                showToast('FPO Order cancelled.', 'info');
              }}
              className="rounded-xl bg-km-red py-3 text-sm font-bold text-white shadow-md shadow-km-red/20"
            >
              Cancel FPO
            </MotionButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
