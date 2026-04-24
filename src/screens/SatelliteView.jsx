import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Satellite,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Loader2,
  Smartphone,
  Lock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { MotionButton } from '../components/ui/MotionButton';
import { useNDVI } from '../hooks/useNDVI';
import { useFarmer } from '../context/FarmerContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScreenLoader } from '../hooks/useScreenLoader';

const circumference = 2 * Math.PI * 52;
const FarmMap = React.lazy(() => import('../components/features/FarmMap'));

const statusStyles = {
  green: {
    stroke: '#1D9E75',
    badge: 'bg-km-green-light text-km-green-darker border-km-green/20',
  },
  amber: {
    stroke: '#BA7517',
    badge: 'bg-km-amber-light text-km-amber border-km-amber/20',
  },
  red: {
    stroke: '#A32D2D',
    badge: 'bg-km-red-light text-km-red border-km-red/20',
  },
  gray: {
    stroke: '#6B7280',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

function SatelliteSkeleton() {
  return (
    <div className="min-h-screen bg-km-gray-light p-4 pb-24">
      <Skeleton className="mt-4 h-16 rounded-[24px]" />
      <Skeleton className="mt-5 h-[420px] rounded-[28px]" />
    </div>
  );
}

function HealthRing({ healthPercent, strokeColor, prefersReduced }) {
  const progressOffset = circumference * (1 - healthPercent / 100);

  return (
    <div className="relative h-[120px] w-[120px] shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="52"
          stroke="rgba(17, 24, 39, 0.08)"
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
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-black" style={{ color: strokeColor }}>
          {healthPercent}%
        </span>
      </div>
    </div>
  );
}

function GeoRequestCard({ prefersReduced }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}
      className="mt-5 flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-km-green/15 bg-gradient-to-br from-km-green-light via-white to-white p-8 text-center shadow-sm"
    >
      <div className="rounded-full bg-km-green-light p-5">
        <Satellite size={48} className="animate-pulse text-km-green" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900">Requesting your location...</h2>
      <p className="mt-2 max-w-xs text-sm text-gray-500">
        Allow location access to scan your farm from satellite
      </p>
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/90 px-5 py-4 shadow-sm">
        <div className="rounded-2xl bg-gray-100 p-3">
          <Smartphone size={24} className="text-gray-700" />
        </div>
        <div className="rounded-2xl bg-km-green-light p-3">
          <Lock size={24} className="text-km-green" />
        </div>
      </div>
    </motion.div>
  );
}

function LoadingPanel({ loadingMessage, prefersReduced }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}
      className="mt-5 overflow-hidden rounded-[28px] border border-km-green/20 bg-gradient-to-br from-km-green-light to-white p-5 shadow-sm"
    >
      <div className="relative h-28 overflow-hidden rounded-2xl border border-km-green/10 bg-km-green/5">
        <motion.div
          className="absolute left-0 z-10 h-1 w-full"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(29,158,117,0.4), transparent)' }}
          initial={{ top: '0%', opacity: 0 }}
          animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: prefersReduced ? 0 : 1.5, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.2 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(29,158,117,0.18),transparent_55%)]" />
        <div className="relative z-20 flex h-full flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-km-green" />
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingMessage}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReduced ? 0 : -10 }}
              transition={{ duration: prefersReduced ? 0 : 0.2 }}
              className="text-sm font-semibold text-km-green-darker"
            >
              {loadingMessage}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function SatelliteView() {
  const prefersReduced = usePrefersReducedMotion();
  const isScreenReady = useScreenLoader();
  const { setNdviData } = useFarmer();
  const { loading, data, error, location, fetchForLocation, reset } = useNDVI();
  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [geoState, setGeoState] = React.useState('requesting');
  const [geoError, setGeoError] = React.useState('');
  const [loadingMessage, setLoadingMessage] = React.useState('Contacting ISRO satellite...');
  const geolocationStartedRef = React.useRef(false);

  const runScan = React.useCallback(
    async (lat, lon) => {
      setSelectedLocation({ lat, lon });
      setGeoState('fetching');
      await fetchForLocation(lat, lon);
      setGeoState('done');
    },
    [fetchForLocation],
  );

  React.useEffect(() => {
    if (geolocationStartedRef.current) {
      return;
    }

    geolocationStartedRef.current = true;

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoState('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setSelectedLocation({ lat, lon });
        runScan(lat, lon);
      },
      (geoFailure) => {
        setGeoError(
          geoFailure.code === 1
            ? 'Location access denied. Please pin your farm on the map below.'
            : 'Could not detect location. Please pin your farm on the map.',
        );
        setGeoState('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [runScan]);

  React.useEffect(() => {
    if (!loading) {
      setLoadingMessage('Contacting ISRO satellite...');
      return;
    }

    setLoadingMessage('Contacting ISRO satellite...');
    const timer = window.setTimeout(() => {
      setLoadingMessage('Analyzing crop health data...');
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [loading]);

  React.useEffect(() => {
    if (data) {
      setNdviData(data);
    }
  }, [data, setNdviData]);

  if (!isScreenReady) {
    return <SatelliteSkeleton />;
  }

  const result = data;
  const statusStyle = statusStyles[result?.insight?.statusColor] ?? statusStyles.gray;
  const showResultError = Boolean(error || result?.success === false);
  const activeLocation = location ?? selectedLocation ?? result?.coordinates ?? null;

  const handleManualPin = async (lat, lon) => {
    setGeoError('');
    await runScan(lat, lon);
  };

  const handleRescan = async () => {
    if (!activeLocation) {
      return;
    }

    await runScan(activeLocation.lat, activeLocation.lon);
  };

  const handleChangeLocation = () => {
    setGeoState('error');
    setGeoError('Pin your farm on the map below to scan a different location.');
    reset();
    setNdviData(null);
  };

  return (
    <motion.div
      className="min-h-screen bg-km-gray-light p-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.22 } }}
    >
      <motion.div
        className="rounded-[28px] border border-gray-100 bg-white px-5 py-4 shadow-sm"
        initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Satellite className="h-5 w-5 text-km-green" />
              <h1 className="text-xl font-bold text-gray-900">🛰️ Satellite Monitor</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">Powered by ISRO VEDAS · Real-time crop intelligence</p>
          </div>
          <Badge className="bg-km-green-light text-km-green-darker border border-km-green/20">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-km-green" />
            ISRO Data
          </Badge>
        </div>
      </motion.div>

      {geoState === 'requesting' && <GeoRequestCard prefersReduced={prefersReduced} />}

      {geoState === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}
          className="mt-5"
        >
          <div className="rounded-[24px] border border-km-amber/20 bg-km-amber-light p-4 text-km-amber">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0" size={20} />
              <p className="text-sm font-semibold">{geoError}</p>
            </div>
          </div>

          <div className="mt-4">
            <React.Suspense fallback={<Skeleton className="h-[400px] rounded-[24px]" />}>
              <FarmMap
                onLocationSelect={handleManualPin}
                initialLocation={selectedLocation}
              />
            </React.Suspense>
          </div>
        </motion.div>
      )}

      {(loading || geoState === 'fetching') && <LoadingPanel loadingMessage={loadingMessage} prefersReduced={prefersReduced} />}

      {result && (
        <motion.div
          className="mt-5 flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.2 } }}
        >
          {showResultError && (
            <motion.div
              className="rounded-[24px] border border-km-red/20 bg-km-red-light p-4 text-km-red-dark"
              initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.22 } }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-km-red" size={20} />
                <div className="flex-1">
                  <p className="font-bold">Could not reach ISRO satellite service. Showing cached data.</p>
                  <p className="mt-1 text-sm">{error || result.error}</p>
                </div>
              </div>
              <MotionButton
                onClick={handleRescan}
                className="mt-4 rounded-xl border border-km-red/25 bg-white px-4 py-2.5 text-sm font-bold text-km-red"
              >
                Retry
              </MotionButton>
            </motion.div>
          )}

          <Card className="overflow-hidden rounded-[28px] p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-km-green-darker">
              <MapPin size={16} className="text-km-green" />
              {activeLocation ? (
                <span>
                  📍 Selected: {activeLocation.lat.toFixed(4)}° N, {activeLocation.lon.toFixed(4)}° E
                </span>
              ) : (
                <span>Location locked for scan</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <HealthRing
                  healthPercent={result.insight.healthPercent}
                  strokeColor={statusStyle.stroke}
                  prefersReduced={prefersReduced}
                />
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${statusStyle.badge}`}>
                    <span>{result.insight.emoji}</span>
                    {result.insight.status}
                  </div>
                  <p className="mt-3 font-mono text-sm text-gray-700">
                    NDVI Score: {result.latestNDVI.toFixed(2)}
                  </p>
                  {result.isMockData && (
                    <div className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                      Demo data — place pin on map for live reading
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: prefersReduced ? 0 : 0.3 } }}
          >
            <Card className="rounded-[28px] p-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 text-km-green" size={18} />
                <div>
                  <p className="font-bold text-gray-900">🌾 What this means:</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{result.insight.explanation}</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <CheckCircle className="mt-0.5 text-km-green" size={18} />
                <div>
                  <p className="font-bold text-gray-900">✅ What to do:</p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-km-green-darker">{result.insight.action}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <Card className="rounded-[28px] p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-km-green" />
                <h3 className="font-bold text-gray-900">NDVI Trend — Last 30 Days</h3>
              </div>
              <p className="text-[11px] font-medium text-gray-400">Source: ISRO VEDAS SAC</p>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)' }}
                    formatter={(value) => [`NDVI: ${Number(value).toFixed(2)}`, 'Reading']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <ReferenceLine
                    y={0.5}
                    stroke="#1D9E75"
                    strokeDasharray="4 4"
                    label={{ value: 'Healthy', fill: '#1D9E75', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={0.3}
                    stroke="#BA7517"
                    strokeDasharray="4 4"
                    label={{ value: 'Stress', fill: '#BA7517', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ndvi"
                    stroke="#1D9E75"
                    strokeWidth={2}
                    dot
                    isAnimationActive={!prefersReduced}
                    animationDuration={prefersReduced ? 0 : 1200}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 rounded-[28px] bg-gray-100 p-4 text-sm text-gray-600">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Data Points</p>
              <p className="mt-1 font-bold text-gray-800">{result.dataPoints}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Date Range</p>
              <p className="mt-1 font-bold text-gray-800">{result.fromDate} → {result.toDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Coordinates</p>
              <p className="mt-1 font-bold text-gray-800">
                {result.coordinates.lat.toFixed(4)}°N, {result.coordinates.lon.toFixed(4)}°E
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Source</p>
              <p className="mt-1 font-bold text-gray-800">ISRO VEDAS SAC</p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <MotionButton
              onClick={handleRescan}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-km-green px-4 py-3 text-sm font-bold text-km-green"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
              📡 Re-scan this location
            </MotionButton>
            <MotionButton
              onClick={handleChangeLocation}
              className="rounded-xl border border-km-green/25 bg-white px-4 py-3 text-sm font-semibold text-km-green"
            >
              📍 Change location
            </MotionButton>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
