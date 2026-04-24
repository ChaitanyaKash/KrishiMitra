import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFarmer } from '../context/FarmerContext';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { generateKMCard } from '../utils/generateKMCard';
import { mockFarmer } from '../data/mockFarmer';
import { Skeleton } from '../components/ui/Skeleton';
import { MotionButton } from '../components/ui/MotionButton';
import { DecimalValue } from '../components/ui/AnimatedValue';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScreenLoader } from '../hooks/useScreenLoader';

function OnboardingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-white pb-20">
      <div className="relative bg-km-green-dark p-6 pb-8 pt-10 text-white">
        <Skeleton className="h-4 w-16 rounded-lg bg-white/20" />
        <Skeleton className="mt-10 h-7 w-48 rounded-lg bg-white/20" />
        <div className="mt-6 flex gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-1.5 flex-1 rounded-full bg-white/15" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="h-7 w-44 rounded-lg" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      </div>
      <div className="p-6 pt-0">
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  );
}

const stepTransition = (prefersReduced) => ({
  initial: { opacity: 0, x: prefersReduced ? 0 : 28 },
  animate: { opacity: 1, x: 0, transition: { duration: prefersReduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: prefersReduced ? 0 : -18, transition: { duration: prefersReduced ? 0 : 0.18 } },
});

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { dispatch, setFarmReport, setNdviData } = useFarmer();
  const prefersReduced = usePrefersReducedMotion();
  const isScreenReady = useScreenLoader();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: '',
    aadhaar: '',
    soilType: 'black cotton',
    irrigationType: 'drip',
    crop: null,
  });

  const crops = [
    { id: 'tomato', emoji: '🍅', duration: '90-120 days', yield: '15-20 tonnes/ac' },
    { id: 'onion', emoji: '🧅', duration: '120-150 days', yield: '10-12 tonnes/ac' },
    { id: 'wheat', emoji: '🌾', duration: '120-130 days', yield: '1.5-2 tonnes/ac' },
    { id: 'rice', emoji: '🌾', duration: '120-150 days', yield: '1.5-2.5 tonnes/ac' },
  ];

  const handleNext = () => setStep((current) => Math.min(current + 1, 3));
  const handlePrev = () => setStep((current) => Math.max(current - 1, 1));

  const handleComplete = () => {
    const newId = generateKMCard();
    const newState = {
      farmer: {
        id: `KM-2024-${Math.floor(Math.random() * 90000 + 10000)}`,
        name: formData.name || 'New Farmer',
        phone: formData.phone || '+91-XXXXXXXXXX',
        village: `${formData.district}, Maharashtra`,
        aadhaarHash: 'masked',
        kmCardId: newId,
        registeredAt: new Date().toISOString().split('T')[0],
      },
      farm: {
        id: 'FARM-NEW',
        areaAcres: 2.4,
        polygon: mockFarmer.farm.polygon,
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
      },
      activeCrop: {
        type: formData.crop || 'tomato',
        variety: 'Hybrid',
        plantedDate: new Date().toISOString().split('T')[0],
        totalPlantedKg: 0,
        expectedYieldKg: 4800,
      },
      satellite: mockFarmer.satellite,
      fpoOrders: [],
      financials: { totalRevenue: 0, totalCosts: 0, netProfit: 0 },
      mandiPrices: mockFarmer.mandiPrices,
    };

    setNdviData(null);
    setFarmReport(null);
    dispatch({ type: 'REGISTER_FARMER', payload: newState });
    navigate('/dashboard');
  };

  if (!isScreenReady) {
    return <OnboardingSkeleton />;
  }

  return (
    <motion.div
      className="flex min-h-screen flex-col bg-white pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.22 } }}
    >
      <div className="relative bg-km-green-dark p-6 pb-8 pt-10 text-white">
        <button onClick={() => (step > 1 ? handlePrev() : navigate('/'))} className="absolute left-4 top-10 text-white/80 hover:text-white">
          ← Back
        </button>
        <h1 className="mt-8 text-2xl font-bold">Register for KM Card</h1>

        <div className="mt-6 flex gap-2">
          {[1, 2, 3].map((stepIndex) => (
            <motion.div
              key={stepIndex}
              className={`h-1.5 flex-1 rounded-full ${step >= stepIndex ? 'bg-km-green' : 'bg-white/20'}`}
              animate={{ opacity: step >= stepIndex ? 1 : 0.55 }}
              transition={{ duration: prefersReduced ? 0 : 0.2 }}
            />
          ))}
        </div>
      </div>

      <div className="relative flex-1 p-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step-1" {...stepTransition(prefersReduced)}>
              <h2 className="mb-6 text-xl font-bold text-gray-900">Step 1: Your Identity</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                  <input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900" placeholder="e.g. Rajan Kumar" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900" placeholder="+91" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">District</label>
                  <select value={formData.district} onChange={(event) => setFormData({ ...formData, district: event.target.value })} className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900">
                    <option value="">Select District</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Pune">Pune</option>
                    <option value="Nagpur">Nagpur</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Aadhaar Number <span className="ml-2 text-xs font-normal text-km-green">(Stored as encrypted hash)</span>
                  </label>
                  <input type="text" value={formData.aadhaar} onChange={(event) => setFormData({ ...formData, aadhaar: event.target.value })} className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-900" placeholder="XXXX XXXX XXXX" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" {...stepTransition(prefersReduced)}>
              <h2 className="mb-2 text-xl font-bold text-gray-900">Step 2: Land Registration</h2>
              <p className="mb-6 text-sm text-gray-500">Draw your farm boundaries to enable satellite monitoring.</p>

              <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl bg-gray-200">
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 p-4 text-center">
                  <MotionButton className="rounded-xl bg-white px-6 py-3 font-bold text-gray-900 shadow-lg">
                    Use demo farm polygon
                  </MotionButton>
                </div>
                <MapContainer center={[19.9975, 73.7898]} zoom={15} zoomControl={false} className="h-full w-full">
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </MapContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Soil Type</label>
                  <select value={formData.soilType} onChange={(event) => setFormData({ ...formData, soilType: event.target.value })} className="w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                    <option value="black cotton">Black Cotton</option>
                    <option value="red">Red Soil</option>
                    <option value="alluvial">Alluvial</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Irrigation</label>
                  <select value={formData.irrigationType} onChange={(event) => setFormData({ ...formData, irrigationType: event.target.value })} className="w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                    <option value="drip">Drip</option>
                    <option value="sprinkler">Sprinkler</option>
                    <option value="borewell">Borewell</option>
                    <option value="rainfed">Rainfed</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl border border-km-green/20 bg-km-green-light p-3">
                <span className="text-sm font-medium text-km-green-darker">Calculated Area:</span>
                <span className="text-lg font-bold text-km-green">
                  <DecimalValue value={2.4} maximumFractionDigits={1} minimumFractionDigits={1} className="inline-flex" /> acres
                </span>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step-3" {...stepTransition(prefersReduced)}>
              <h2 className="mb-2 text-xl font-bold text-gray-900">Step 3: First Crop</h2>
              <p className="mb-6 text-sm text-gray-500">Select what you are planting to see FPO orders.</p>

              <div className="grid grid-cols-2 gap-3">
                {crops.map((crop) => (
                  <motion.div
                    key={crop.id}
                    onClick={() => setFormData({ ...formData, crop: crop.id })}
                    className={`cursor-pointer rounded-xl border-2 p-3 transition ${formData.crop === crop.id ? 'border-km-green bg-km-green-light/30' : 'border-gray-200'}`}
                    whileHover={prefersReduced ? undefined : { y: -2 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 28 }}
                  >
                    <div className="mb-2 text-3xl">{crop.emoji}</div>
                    <h3 className="font-bold capitalize text-gray-900">{crop.id}</h3>
                    <p className="mt-1 text-[10px] text-gray-500">{crop.duration}</p>
                    <p className="text-[10px] text-gray-500">{crop.yield}</p>
                    {['tomato', 'onion'].includes(crop.id) && (
                      <div className="mt-2 inline-block rounded-sm bg-km-amber px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                        Guaranteed Orders
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="z-20 bg-white p-6 pt-0">
        <MotionButton
          onClick={step === 3 ? handleComplete : handleNext}
          className="w-full rounded-xl bg-km-green py-4 font-bold text-white shadow-lg shadow-km-green/20"
        >
          {step === 3 ? 'Complete Registration' : 'Continue'}
        </MotionButton>
      </div>
    </motion.div>
  );
}
