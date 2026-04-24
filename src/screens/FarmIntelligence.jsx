import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Cpu,
  Droplets,
  Info,
  Loader2,
  Lock,
  MapPin,
  RefreshCw,
  Smartphone,
  Thermometer,
  Wind,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MotionButton } from '../components/ui/MotionButton';
import { Skeleton } from '../components/ui/Skeleton';
import { useFarmer } from '../context/FarmerContext';
import { useFarmIntelligence } from '../hooks/useFarmIntelligence';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const FarmMap = React.lazy(() => import('../components/features/FarmMap'));
const circumference = 2 * Math.PI * 58;

const scoreToneMap = {
  green: {
    stroke: '#1D9E75',
    track: 'rgba(29, 158, 117, 0.12)',
    bg: 'bg-km-green-light',
    text: 'text-km-green-darker',
    badge: 'bg-km-green-light text-km-green-darker border-km-green/20',
  },
  amber: {
    stroke: '#BA7517',
    track: 'rgba(186, 117, 23, 0.16)',
    bg: 'bg-km-amber-light',
    text: 'text-km-amber',
    badge: 'bg-km-amber-light text-km-amber border-km-amber/20',
  },
  red: {
    stroke: '#A32D2D',
    track: 'rgba(163, 45, 45, 0.12)',
    bg: 'bg-km-red-light',
    text: 'text-km-red-dark',
    badge: 'bg-km-red-light text-km-red border-km-red/20',
  },
  blue: {
    stroke: '#2563eb',
    track: 'rgba(37, 99, 235, 0.12)',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  gray: {
    stroke: '#6B7280',
    track: 'rgba(107, 114, 128, 0.16)',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

const riskToneMap = {
  critical: {
    border: 'border-km-red/30',
    accent: 'bg-km-red',
    badge: 'bg-km-red-light text-km-red border-km-red/20',
    text: 'text-km-red-dark',
  },
  warning: {
    border: 'border-km-amber/30',
    accent: 'bg-km-amber',
    badge: 'bg-km-amber-light text-km-amber border-km-amber/20',
    text: 'text-km-amber',
  },
  info: {
    border: 'border-blue-200',
    accent: 'bg-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-700',
  },
};

const irrigationToneMap = {
  green: {
    bg: 'bg-km-green-light',
    text: 'text-km-green-darker',
    border: 'border-km-green/20',
  },
  amber: {
    bg: 'bg-km-amber-light',
    text: 'text-km-amber',
    border: 'border-km-amber/20',
  },
  red: {
    bg: 'bg-km-red-light',
    text: 'text-km-red-dark',
    border: 'border-km-red/20',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
};

function getScoreTone(score) {
  if (score >= 70) return scoreToneMap.green;
  if (score >= 40) return scoreToneMap.amber;
  return scoreToneMap.red;
}

function formatUpdatedAt(timestamp) {
  if (!timestamp) {
    return 'Waiting for analysis';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const timeLabel = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (sameDay) {
    return `Today, ${timeLabel}`;
  }

  return date.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatCoordinate(value) {
  return typeof value === 'number' ? value.toFixed(4) : '--';
}

function formatSourceMode(mode) {
  if (mode === 'live') return 'Live';
  if (mode === 'mock') return 'Mock';
  return 'Unavailable';
}

function OverallScoreRing({ score, tone, emoji, prefersReduced }) {
  const progressOffset = circumference * (1 - score / 100);

  return (
    <div className="relative h-[164px] w-[164px] shrink-0">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r="58"
          stroke={tone.track}
          strokeWidth="10"
          fill="none"
        />
        <motion.circle
          cx="70"
          cy="70"
          r="58"
          stroke={tone.stroke}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={prefersReduced ? { duration: 0 } : { duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black text-gray-900">{score}</span>
        <span className="mt-1 text-xl">{emoji}</span>
      </div>
    </div>
  );
}

function ScoreBreakdownCard({ label, icon, score, prefersReduced, className = '' }) {
  const tone = getScoreTone(score);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gray-800">
          {icon} {label}
        </span>
        <span className={`text-sm font-black ${tone.text}`}>{score}</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className={`h-full rounded-full ${tone.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="h-full rounded-full"
            style={{ backgroundColor: tone.stroke }}
          />
        </motion.div>
      </div>
    </Card>
  );
}

function GeoRequestCard({ prefersReduced }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}
      className="mt-5 flex min-h-[56vh] flex-col items-center justify-center rounded-[32px] border border-km-green/15 bg-gradient-to-br from-km-green-light via-white to-white p-8 text-center shadow-sm"
    >
      <div className="rounded-full bg-km-green-light p-5 text-km-green">
        <Cpu size={48} />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900">Preparing farm intelligence...</h2>
      <p className="mt-2 max-w-xs text-sm text-gray-500">
        Allow location access so we can combine satellite, weather, soil, and air signals for your field.
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

function LoadingPanel({ loadingStep, prefersReduced }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}
      className="mt-5 overflow-hidden rounded-[28px] border border-km-green/20 bg-gradient-to-br from-km-green-light to-white p-5 shadow-sm"
    >
      <div className="relative h-32 overflow-hidden rounded-2xl border border-km-green/10 bg-km-green/5">
        <motion.div
          className="absolute left-0 z-10 h-1 w-full"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(29,158,117,0.4), transparent)' }}
          initial={{ top: '0%', opacity: 0 }}
          animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: prefersReduced ? 0 : 1.5, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.2 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(29,158,117,0.18),transparent_55%)]" />
        <div className="relative z-20 flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-km-green" />
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReduced ? 0 : -10 }}
              transition={{ duration: prefersReduced ? 0 : 0.2 }}
              className="text-sm font-semibold text-km-green-darker"
            >
              {loadingStep}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function SourceCard({ title, source, summary, expanded, onToggle, children, prefersReduced }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}
    >
      <Card className="overflow-hidden p-0">
        <button
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-3 p-4 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-bold text-gray-900">{title}</h3>
              <Badge className="border border-gray-200 bg-gray-50 text-[10px] text-gray-600">
                {source}
              </Badge>
            </div>
            {summary}
          </div>
          <div className="pt-1 text-gray-400">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1, transition: { duration: prefersReduced ? 0 : 0.2 } }}
              exit={{ height: 0, opacity: 0, transition: { duration: prefersReduced ? 0 : 0.18 } }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 bg-white p-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function FarmIntelligence() {
  const prefersReduced = usePrefersReducedMotion();
  const { farmReport } = useFarmer();
  const { loading, report, error, loadingStep, fetchReport } = useFarmIntelligence();
  const [selectedLocation, setSelectedLocation] = React.useState(farmReport?.coordinates ?? null);
  const [geoState, setGeoState] = React.useState('requesting');
  const [geoError, setGeoError] = React.useState('');
  const [expandedSources, setExpandedSources] = React.useState({
    weather: true,
    rainfall: true,
    aqi: true,
    soil: true,
  });
  const geolocationStartedRef = React.useRef(false);

  const activeReport = report ?? farmReport;
  const activeLocation = selectedLocation ?? activeReport?.coordinates ?? null;

  const fetchForPinnedLocation = React.useCallback(
    async (lat, lon) => {
      setSelectedLocation({ lat, lon });
      setGeoError('');
      setGeoState('ready');
      await fetchReport(lat, lon);
    },
    [fetchReport],
  );

  const requestCurrentLocation = React.useCallback(() => {
    setGeoState('requesting');
    setGeoError('');

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Pin your farm below instead.');
      setGeoState('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await fetchForPinnedLocation(lat, lon);
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
  }, [fetchForPinnedLocation]);

  React.useEffect(() => {
    if (geolocationStartedRef.current) {
      return;
    }

    geolocationStartedRef.current = true;
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  const containerVariants = React.useMemo(
    () => ({
      animate: {
        transition: {
          staggerChildren: prefersReduced ? 0 : 0.06,
        },
      },
    }),
    [prefersReduced],
  );

  const cardVariants = React.useMemo(
    () => ({
      initial: { opacity: 0, y: prefersReduced ? 0 : 18, scale: prefersReduced ? 1 : 0.98 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: prefersReduced
          ? { duration: 0 }
          : { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      },
    }),
    [prefersReduced],
  );

  const overallTone = scoreToneMap[activeReport?.overallStatus?.color ?? 'gray'];
  const irrigationTone = irrigationToneMap[activeReport?.irrigationAdvice?.color ?? 'gray'];
  const sourceModes = activeReport?.sourceModes ?? {};
  const weatherForecast = activeReport?.data?.weather?.forecast ?? [];
  const rainfallSeries = activeReport?.data?.weather?.rainfall?.rainForecast ?? [];

  const toggleSource = (key) => {
    setExpandedSources((previous) => ({ ...previous, [key]: !previous[key] }));
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
              <Cpu className="h-5 w-5 text-km-green" />
              <h1 className="text-xl font-bold text-gray-900">🧠 Farm Intelligence</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">ISRO + Weather + Soil + Air — unified analysis</p>
            <p className="mt-2 text-xs font-medium text-gray-400">
              Last updated: {formatUpdatedAt(activeReport?.generatedAt)}
            </p>
          </div>
          <Badge className="border border-km-green/20 bg-km-green-light text-km-green-darker">
            Unified Scan
          </Badge>
        </div>
      </motion.div>

      {loading && !activeReport && <LoadingPanel loadingStep={loadingStep} prefersReduced={prefersReduced} />}
      {geoState === 'requesting' && !loading && !activeReport && <GeoRequestCard prefersReduced={prefersReduced} />}

      {error && !activeReport && (
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}
          className="mt-5 rounded-[24px] border border-km-red/20 bg-km-red-light p-4 text-km-red-dark"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-bold">Could not complete farm analysis.</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

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
              <FarmMap onLocationSelect={fetchForPinnedLocation} initialLocation={selectedLocation} />
            </React.Suspense>
          </div>
        </motion.div>
      )}

      {loading && activeReport && (
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.2 } }}
          className="mt-5 rounded-[24px] border border-km-green/15 bg-white px-4 py-3 text-sm font-semibold text-km-green-darker shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-km-green" />
            {loadingStep || 'Refreshing farm analysis...'}
          </div>
        </motion.div>
      )}

      {activeReport && (
        <motion.div
          className="mt-5 flex flex-col gap-4"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={cardVariants}>
            <Card className="overflow-hidden rounded-[28px] p-5">
              <div className="flex flex-col items-center text-center">
                <OverallScoreRing
                  score={activeReport.overallScore}
                  tone={overallTone}
                  emoji={activeReport.overallStatus.emoji}
                  prefersReduced={prefersReduced}
                />
                <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${overallTone.badge}`}>
                  {activeReport.overallStatus.emoji} {activeReport.overallStatus.label}
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Based on satellite + weather + soil + air data
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBreakdownCard
                label="Crop Health"
                icon="🌿"
                score={activeReport.scores.ndvi}
                prefersReduced={prefersReduced}
              />
              <ScoreBreakdownCard
                label="Soil Moisture"
                icon="💧"
                score={activeReport.scores.soil}
                prefersReduced={prefersReduced}
              />
              <ScoreBreakdownCard
                label="Rainfall Outlook"
                icon="🌧️"
                score={activeReport.scores.rain}
                prefersReduced={prefersReduced}
              />
              <ScoreBreakdownCard
                label="Weather Conditions"
                icon="🌤️"
                score={activeReport.scores.weather}
                prefersReduced={prefersReduced}
              />
              <ScoreBreakdownCard
                label="Air Quality"
                icon="💨"
                score={activeReport.scores.aqi}
                prefersReduced={prefersReduced}
                className="col-span-2"
              />
            </div>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-km-amber" />
                <h2 className="font-bold text-gray-900">⚠️ Active Risk Alerts</h2>
              </div>

              {activeReport.risks.length === 0 ? (
                <div className="rounded-2xl border border-km-green/15 bg-km-green-light p-4 text-km-green-darker">
                  <p className="font-semibold">No risks detected — farm is stable</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeReport.risks.map((risk, index) => {
                    const tone = riskToneMap[risk.severity] ?? riskToneMap.info;

                    return (
                      <motion.div
                        key={risk.id}
                        initial={{ opacity: 0, x: prefersReduced ? 0 : 18 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: prefersReduced ? { duration: 0 } : { duration: 0.26, delay: index * 0.06 },
                        }}
                        className={`overflow-hidden rounded-2xl border bg-white ${tone.border}`}
                      >
                        <div className="flex items-start gap-3 p-4">
                          <div className={`mt-1 h-10 w-1.5 rounded-full ${tone.accent}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className={`font-bold ${tone.text}`}>
                                {risk.icon} {risk.title}
                              </p>
                              <Badge className={`border text-[10px] uppercase tracking-wide ${tone.badge}`}>
                                {risk.severity}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{risk.detail}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-km-green" />
                <h2 className="font-bold text-gray-900">✅ What To Do Today</h2>
              </div>
              <div className="flex flex-col gap-3">
                {activeReport.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={`${recommendation.title}-${index}`}
                    initial={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: prefersReduced ? { duration: 0 } : { duration: 0.24, delay: index * 0.08 },
                    }}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-km-green text-sm font-black text-white">
                        {recommendation.priority}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {recommendation.icon} {recommendation.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">{recommendation.detail}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className={`border ${irrigationTone.border} ${irrigationTone.bg} p-5`}>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                  {activeReport.irrigationAdvice.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Irrigation Decision</p>
                  <p className={`mt-1 text-xl font-black ${irrigationTone.text}`}>
                    {activeReport.irrigationAdvice.message}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-km-green" />
                <h2 className="font-bold text-gray-900">Spray Window Today</h2>
              </div>
              <div className={`rounded-2xl border p-4 ${activeReport.sprayWindow.isGood ? 'border-km-green/20 bg-km-green-light' : 'border-km-amber/20 bg-km-amber-light'}`}>
                <p className={`font-semibold ${activeReport.sprayWindow.isGood ? 'text-km-green-darker' : 'text-km-amber'}`}>
                  {activeReport.sprayWindow.advice}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Wind</p>
                    <p className="mt-1 font-bold text-gray-900">{activeReport.data.weather?.current?.windSpeed ?? '--'} m/s</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Humidity</p>
                    <p className="mt-1 font-bold text-gray-900">{activeReport.data.weather?.current?.humidity ?? '--'}%</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Temp</p>
                    <p className="mt-1 font-bold text-gray-900">{activeReport.data.weather?.current?.temp ?? '--'}°C</p>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-bold text-gray-700">
                  Best time: {activeReport.sprayWindow.bestTime}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-km-green" />
                <h2 className="font-bold text-gray-900">7-Day Weather Outlook</h2>
              </div>
              <div className="hidden-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                {weatherForecast.map((day) => (
                  <div
                    key={day.dateKey}
                    className="w-20 shrink-0 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-center shadow-sm"
                  >
                    <p className="text-[11px] font-semibold text-gray-500">{day.day.split(',')[0]}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                      alt={day.condition}
                      className="mx-auto h-12 w-12"
                      loading="lazy"
                    />
                    <p className="text-sm font-bold text-gray-900">
                      {day.maxTemp}° / {day.minTemp}°
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-km-green-darker">{day.rainMM} mm</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <div className="grid grid-cols-2 gap-3">
              <SourceCard
                title="WEATHER"
                source="OpenWeatherMap"
                expanded={expandedSources.weather}
                onToggle={() => toggleSource('weather')}
                prefersReduced={prefersReduced}
                summary={(
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">
                      {activeReport.data.weather?.current?.temp ?? '--'}°C · {activeReport.data.weather?.current?.condition ?? 'Unknown'}
                    </p>
                    <p>{activeReport.data.weather?.current?.humidity ?? '--'}% humidity · {activeReport.data.weather?.current?.windSpeed ?? '--'} m/s wind</p>
                  </div>
                )}
              >
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Feels Like</p>
                      <p className="mt-1 font-bold text-gray-900">{activeReport.data.weather?.current?.feelsLike ?? '--'}°C</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Cloud Cover</p>
                      <p className="mt-1 font-bold text-gray-900">{activeReport.data.weather?.current?.cloudCover ?? '--'}%</p>
                    </div>
                  </div>
                  <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                    {activeReport.data.weather?.current?.description ?? 'Weather description unavailable'}
                  </p>
                </div>
              </SourceCard>

              <SourceCard
                title="RAINFALL"
                source="OpenWeatherMap"
                expanded={expandedSources.rainfall}
                onToggle={() => toggleSource('rainfall')}
                prefersReduced={prefersReduced}
                summary={(
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">
                      Today: {activeReport.data.weather?.rainfall?.todayMM ?? '--'} mm
                    </p>
                    <p>Next 7 days: {activeReport.data.weather?.rainfall?.next7DaysMM ?? '--'} mm</p>
                  </div>
                )}
              >
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rainfallSeries}>
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                        formatter={(value) => [`${value} mm`, 'Rain']}
                      />
                      <Bar dataKey="rainMM" fill="#1D9E75" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SourceCard>

              <SourceCard
                title="AQI"
                source="WAQI"
                expanded={expandedSources.aqi}
                onToggle={() => toggleSource('aqi')}
                prefersReduced={prefersReduced}
                summary={(
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">
                      AQI {activeReport.data.aqi?.aqi ?? '--'} · {activeReport.data.aqi?.level ?? 'Unknown'}
                    </p>
                    <p>Dominant pollutant: {activeReport.data.aqi?.dominantPollutant ?? 'Unknown'}</p>
                  </div>
                )}
              >
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">PM2.5</p>
                      <p className="mt-1 font-bold text-gray-900">{activeReport.data.aqi?.pm25 ?? '--'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">PM10</p>
                      <p className="mt-1 font-bold text-gray-900">{activeReport.data.aqi?.pm10 ?? '--'}</p>
                    </div>
                  </div>
                  <p className="rounded-xl bg-gray-50 p-3 text-gray-700">
                    Crop impact: {activeReport.data.aqi?.cropImpact ?? 'Unknown'}
                  </p>
                </div>
              </SourceCard>

              <SourceCard
                title="SOIL"
                source="Open-Meteo"
                expanded={expandedSources.soil}
                onToggle={() => toggleSource('soil')}
                prefersReduced={prefersReduced}
                summary={(
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">
                      {activeReport.data.soil?.soilMoisturePercent ?? '--'}% · {activeReport.data.soil?.interpretation?.status ?? 'Unknown'}
                    </p>
                    <p>{activeReport.data.soil?.soilTemp ?? '--'}°C soil temp</p>
                  </div>
                )}
              >
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Evapotranspiration</p>
                      <p className="mt-1 font-bold text-gray-900">{activeReport.data.soil?.evapotranspiration ?? '--'} mm</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">7-Day Rain</p>
                      <p className="mt-1 font-bold text-gray-900">{activeReport.data.soil?.totalRainfall7Days ?? '--'} mm</p>
                    </div>
                  </div>
                  <p className="rounded-xl bg-gray-50 p-3 text-gray-700">
                    {activeReport.data.soil?.interpretation?.advice ?? 'Soil interpretation unavailable'}
                  </p>
                </div>
              </SourceCard>
            </div>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                  <span>
                    Data fetched at {formatUpdatedAt(activeReport.generatedAt)} · Coordinates: {formatCoordinate(activeLocation?.lat)},{' '}
                    {formatCoordinate(activeLocation?.lon)}
                  </span>
                  <MotionButton
                    onClick={() => {
                      if (activeLocation) {
                        fetchForPinnedLocation(activeLocation.lat, activeLocation.lon);
                      } else {
                        requestCurrentLocation();
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-km-green px-4 py-2 text-sm font-bold text-km-green"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    📡 Re-analyze
                  </MotionButton>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-600">
                  {[
                    ['NDVI', sourceModes.ndvi],
                    ['Weather', sourceModes.weather],
                    ['AQI', sourceModes.aqi],
                    ['Soil', sourceModes.soil],
                  ].map(([label, mode]) => (
                    <div key={label} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${mode === 'live' ? 'bg-km-green' : 'bg-gray-300'}`} />
                      <span>{label}</span>
                      <span className="text-gray-400">{formatSourceMode(mode)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {activeReport?.data?.weather?.current && (
        <div className="sr-only">
          <CloudRain />
          <Droplets />
          <Wind />
          <Thermometer />
          <MapPin />
        </div>
      )}
    </motion.div>
  );
}
