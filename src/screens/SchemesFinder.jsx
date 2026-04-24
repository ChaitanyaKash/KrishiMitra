import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { useFarmer } from '../context/FarmerContext';
import { schemes as allSchemes } from '../data/schemes';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { MotionButton } from '../components/ui/MotionButton';
import { CurrencyValue } from '../components/ui/AnimatedValue';
import { useToast } from '../components/ui/Toast';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScreenLoader } from '../hooks/useScreenLoader';

function SchemesSkeleton() {
  return (
    <div className="min-h-screen bg-km-gray-light pb-24">
      <div className="sticky top-0 z-20 bg-blue-600 p-5 pt-10 text-white shadow-md">
        <Skeleton className="h-6 w-44 rounded-lg bg-white/20" />
        <Skeleton className="mt-3 h-4 w-40 rounded-lg bg-white/20" />
        <Skeleton className="mt-6 h-12 rounded-xl bg-white/15" />
      </div>
      <div className="mt-6 px-4">
        <Skeleton className="mb-6 h-32 rounded-[24px]" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[24px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SchemeAmount({ scheme }) {
  if (scheme.id === 'PM-KISAN') {
    return (
      <>
        <CurrencyValue value={scheme.amountNum} className="inline-flex" />/year
      </>
    );
  }

  if (scheme.id === 'PMFBY') {
    return (
      <>
        Up to <CurrencyValue value={scheme.amountNum} className="inline-flex" /> claim
      </>
    );
  }

  if (scheme.id === 'KCC') {
    return (
      <>
        <CurrencyValue value={scheme.amountNum} className="inline-flex" /> credit limit
      </>
    );
  }

  if (scheme.id === 'MNREGA-LAND') {
    return (
      <>
        <CurrencyValue value={scheme.amountNum} className="inline-flex" /> labour subsidy
      </>
    );
  }

  return (
    <>
      <CurrencyValue value={scheme.amountNum} className="inline-flex" /> subsidy
    </>
  );
}

export default function SchemesFinder() {
  const { state } = useFarmer();
  const { showToast } = useToast();
  const prefersReduced = usePrefersReducedMotion();
  const isScreenReady = useScreenLoader();
  const [expandedId, setExpandedId] = useState(null);
  const [schemes, setSchemes] = useState(allSchemes);

  const totalBenefits = schemes.reduce((acc, scheme) => acc + scheme.amountNum, 0);
  const appliedAmount = schemes.filter((scheme) => scheme.applied).reduce((acc, scheme) => acc + scheme.amountNum, 0);
  const pendingAmount = totalBenefits - appliedAmount;

  const handleApply = (id) => {
    setSchemes((previous) => previous.map((scheme) => (scheme.id === id ? { ...scheme, applied: true } : scheme)));
    showToast('Application submitted! Track status in 7 days.', 'success');
  };

  if (!isScreenReady) {
    return <SchemesSkeleton />;
  }

  return (
    <motion.div
      className="min-h-screen bg-km-gray-light pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.22 } }}
    >
      <div className="sticky top-0 z-20 bg-blue-600 p-5 pt-10 text-white shadow-md">
        <h1 className="text-2xl font-bold">Government Benefits</h1>
        <p className="mt-1 text-sm text-blue-100">Based on your KM Card profile</p>

        <div className="mt-6 flex justify-between rounded-xl bg-black/20 p-3 text-xs font-semibold backdrop-blur-sm">
          <span>{state.farmer.village.split(',')[1]?.trim() || 'Maharashtra'}</span>
          <span className="capitalize">{state.activeCrop.type}</span>
          <span>{state.farm.areaAcres} ac</span>
          <span>Small Farmer</span>
        </div>
      </div>

      <div className="mt-6 px-4">
        <motion.div initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }} animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24 } }}>
          <Card className="mb-6 border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm">
            <p className="mb-1 text-sm font-semibold text-blue-900">Total benefits available</p>
            <p className="text-3xl font-black text-blue-600">
              <CurrencyValue value={totalBenefits} className="inline-flex" />
            </p>
            <div className="mt-3 flex gap-4 border-t border-blue-100/50 pt-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Applied</p>
                <p className="text-sm font-bold text-gray-800">
                  <CurrencyValue value={appliedAmount} className="inline-flex" />
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pending</p>
                <p className="text-sm font-bold text-km-amber">
                  <CurrencyValue value={pendingAmount} className="inline-flex" />
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="flex flex-col gap-4">
          {schemes.map((scheme, index) => {
            const isExpanded = expandedId === scheme.id;

            return (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: prefersReduced ? 0 : 14 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: prefersReduced ? { duration: 0 } : { duration: 0.24, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                <Card className="overflow-hidden border border-gray-200 p-0 shadow-sm transition-all">
                  <button
                    className={`flex w-full items-start justify-between p-4 text-left ${isExpanded ? 'bg-gray-50' : 'bg-white'}`}
                    onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                  >
                    <div className="flex-1 pr-4">
                      <div className="mb-1.5 flex items-center gap-2">
                        <Badge variant="default" className="bg-blue-100 text-[10px] text-blue-700">{scheme.ministry}</Badge>
                        {scheme.deadline && (
                          <Badge variant="warning" className="text-[10px]">
                            Exp: {new Date(scheme.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </Badge>
                        )}
                      </div>
                      <h3 className="leading-tight font-bold text-gray-900">{scheme.name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-lg font-bold text-km-green">
                          <SchemeAmount scheme={scheme} />
                        </p>
                        {scheme.applied ? (
                          <div className="flex items-center gap-1 rounded-full bg-km-green-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-km-green">
                            <CheckCircle size={12} /> Applied
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 rounded-full bg-km-amber-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-km-amber">
                            <CheckCircle size={12} /> Eligible
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 text-gray-400">
                      {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { duration: prefersReduced ? 0 : 0.2 } }}
                        exit={{ height: 0, opacity: 0, transition: { duration: prefersReduced ? 0 : 0.18 } }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 bg-white p-4">
                          <p className="mb-4 text-sm text-gray-600">{scheme.description}</p>

                          <div className="mb-5 rounded-xl border border-gray-200 bg-km-gray-light p-3">
                            <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500">
                              <ShieldAlert size={14} /> Required Documents
                            </p>
                            <ul className="ml-1 space-y-1 text-sm text-gray-700">
                              {scheme.documents.map((doc, docIndex) => (
                                <li key={docIndex} className="flex items-center gap-2 font-medium">
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                            <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3 text-xs font-medium text-km-green-darker">
                              <CheckCircle size={16} className="text-km-green" />
                              Your KM Card already contains these records.
                            </div>
                          </div>

                          {scheme.applied ? (
                            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3.5 text-sm font-bold uppercase tracking-wider text-gray-400" disabled>
                              Already Applied
                            </button>
                          ) : (
                            <MotionButton
                              onClick={() => handleApply(scheme.id)}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/30"
                            >
                              Apply Now <ExternalLink size={18} />
                            </MotionButton>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
