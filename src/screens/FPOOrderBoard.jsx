import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFarmer } from '../context/FarmerContext';
import { fpoOrders as allOrders } from '../data/fpoOrders';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { MotionButton } from '../components/ui/MotionButton';
import { CurrencyValue } from '../components/ui/AnimatedValue';
import { useToast } from '../components/ui/Toast';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScreenLoader } from '../hooks/useScreenLoader';

const cropEmojis = {
  tomato: '🍅',
  onion: '🧅',
  wheat: '🌾',
  cotton: '☁️',
  soybean: '🌱',
};

function OrdersSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-km-gray-light">
      <div className="bg-km-green-dark p-5 pb-6 pt-10 text-white">
        <Skeleton className="h-6 w-44 rounded-lg bg-white/20" />
        <Skeleton className="mt-3 h-4 w-36 rounded-lg bg-white/15" />
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-white/10 p-1">
          <Skeleton className="h-9 rounded-lg bg-white/20" />
          <Skeleton className="h-9 rounded-lg bg-white/10" />
        </div>
      </div>
      <div className="hidden-scrollbar sticky top-[140px] z-10 -mt-2 flex gap-2 overflow-x-auto bg-km-gray-light/95 p-4 backdrop-blur">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 min-w-[84px] rounded-full" />
        ))}
      </div>
      <div className="flex flex-col gap-4 px-4 pb-24">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-72 rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}

export default function FPOOrderBoard() {
  const { state, dispatch } = useFarmer();
  const { showToast } = useToast();
  const prefersReduced = usePrefersReducedMotion();
  const isScreenReady = useScreenLoader();
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [isLocking, setIsLocking] = useState(false);

  const filters = ['All', 'tomato', 'onion', 'wheat', 'cotton', 'soybean'];
  const filteredOrders = filter === 'All' ? allOrders : allOrders.filter((order) => order.crop === filter);
  const activeOrders = state.fpoOrders;
  const availableOrders = filteredOrders.filter((order) => !activeOrders.find((activeOrder) => activeOrder.id === order.id));

  const handleAccept = () => {
    if (!selectedOrder || isLocking) {
      return;
    }

    const acceptedOrder = selectedOrder;
    setIsLocking(true);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#1D9E75', '#0F6E56', '#FAC775', '#ffffff', '#E1F5EE'],
    });

    window.setTimeout(() => {
      confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 } });
    }, 400);

    dispatch({ type: 'ACCEPT_ORDER', payload: acceptedOrder });
    showToast('Contract Locked! Your buyer is guaranteed.', 'success');

    window.setTimeout(() => {
      setSelectedOrder(null);
      setActiveTab('active');
      setIsLocking(false);
    }, prefersReduced ? 0 : 320);
  };

  if (!isScreenReady) {
    return <OrdersSkeleton />;
  }

  return (
    <>
      <motion.div
        className="flex min-h-screen flex-col bg-km-gray-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.22 } }}
      >
        <div className="sticky top-0 z-20 bg-km-green-dark p-5 pb-6 pt-10 text-white">
          <h1 className="text-2xl font-bold">Guaranteed Contracts</h1>
          <p className="mt-1 text-sm text-km-green-light">Lock prices before you plant</p>

          <div className="relative mt-6 grid grid-cols-2 gap-4 rounded-xl bg-white/10 p-1">
            {activeTab === 'available' && (
              <motion.div
                layoutId="ordersTab"
                className="absolute inset-y-1 left-1 right-[calc(50%+0.25rem)] rounded-lg bg-white shadow"
                transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
            {activeTab === 'active' && (
              <motion.div
                layoutId="ordersTab"
                className="absolute inset-y-1 left-[calc(50%+0.25rem)] right-1 rounded-lg bg-white shadow"
                transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
            <button
              className={`relative z-10 rounded-lg py-1.5 text-sm font-semibold transition ${
                activeTab === 'available' ? 'text-km-green-dark' : 'text-white/80'
              }`}
              onClick={() => setActiveTab('available')}
            >
              Available
            </button>
            <button
              className={`relative z-10 rounded-lg py-1.5 text-sm font-semibold transition ${
                activeTab === 'active' ? 'text-km-green-dark' : 'text-white/80'
              }`}
              onClick={() => setActiveTab('active')}
            >
              My Active
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'available' ? (
            <motion.div
              key="available"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.2 } }}
              exit={{ opacity: 0, transition: { duration: prefersReduced ? 0 : 0.16 } }}
            >
              <div className="hidden-scrollbar sticky top-[140px] z-10 -mt-2 flex gap-2 overflow-x-auto bg-km-gray-light/95 p-4 backdrop-blur">
                {filters.map((filterName) => (
                  <motion.button
                    key={filterName}
                    onClick={() => setFilter(filterName)}
                    className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                      filter === filterName
                        ? 'border-gray-800 bg-gray-800 text-white'
                        : 'border-gray-200 bg-white text-gray-600 capitalize'
                    }`}
                    whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                    transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 24 }}
                  >
                    {filterName === 'All' ? 'All Crops' : filterName}
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-col gap-4 px-4 pb-24">
                {availableOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: prefersReduced ? { duration: 0 } : { duration: 0.28, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] },
                    }}
                  >
                    <Card className="relative overflow-hidden border border-gray-200 p-0 shadow-sm">
                      {order.crop === state.activeCrop.type && (
                        <div className="absolute right-3 top-3 rounded-full border border-km-green/30 bg-km-green-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-km-green-darker">
                          Perfect Match
                        </div>
                      )}
                      <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50 p-4 md:bg-white">
                        <div className="mt-1 text-3xl">{cropEmojis[order.crop]}</div>
                        <div>
                          <h3 className="pr-16 font-bold capitalize leading-tight text-gray-900">{order.crop} — Grade A</h3>
                          <p className="mt-0.5 text-sm text-gray-600">{order.buyer}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-4 bg-white p-4 text-sm">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quantity</p>
                          <p className="mt-0.5 font-bold text-gray-900">{order.qtyKg.toLocaleString()} kg</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivery</p>
                          <p className="mt-0.5 font-bold text-gray-900">{new Date(order.deliveryStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Market Today</p>
                          <p className="mt-0.5 font-bold text-gray-400 line-through">
                            <CurrencyValue value={order.marketPrice} className="inline-flex" />
                            /kg
                          </p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-km-green-darker">Guaranteed</p>
                          <p className="mt-0.5 text-2xl font-black leading-none text-km-green">
                            <CurrencyValue value={order.pricePerKg} className="inline-flex" />
                            <span className="text-sm">/kg</span>
                          </p>
                        </div>
                      </div>

                      {order.bonusCondition && (
                        <div className="bg-white px-4 pb-3">
                          <div className="rounded-lg border border-km-amber/20 bg-km-amber-light/30 p-2.5 text-xs">
                            <span className="mb-0.5 block font-bold text-km-amber">
                              Bonus: +<CurrencyValue value={order.bonusPerKg} className="inline-flex" />
                              /kg
                            </span>
                            <span className="text-gray-600">{order.bonusCondition}</span>
                          </div>
                        </div>
                      )}

                      <div className="bg-white p-4 pt-0">
                        <MotionButton
                          onClick={() => setSelectedOrder(order)}
                          className="w-full rounded-xl bg-gray-900 py-3.5 font-bold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]"
                        >
                          Review Contract
                        </MotionButton>
                        <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wider text-gray-400">
                          {order.slotsFilled}/{order.slotsTotal} slots remaining
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              className="flex flex-col gap-4 px-4 py-6 pb-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.2 } }}
              exit={{ opacity: 0, transition: { duration: prefersReduced ? 0 : 0.16 } }}
            >
              {activeOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <ClipboardList className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="font-medium text-gray-500">You don't have any active contracts yet.</p>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <motion.div
                    key={`active-${order.id}`}
                    initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.8, y: prefersReduced ? 0 : 20 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: prefersReduced
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 300, damping: 20 },
                    }}
                  >
                    <Card className="overflow-hidden border-2 border-km-green bg-km-green-light p-0">
                      <div className="bg-km-green py-2 text-center text-sm font-bold text-white">
                        LOCKED • {order.buyer}
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-white p-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Crop</p>
                          <p className="text-lg font-bold capitalize text-gray-900">{order.crop}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-500">Guaranteed Price</p>
                          <p className="text-xl font-black text-km-green">
                            <CurrencyValue value={order.pricePerKg} className="inline-flex" />
                            /kg
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Volume</p>
                          <p className="font-bold text-gray-900">{order.qtyKg.toLocaleString()} kg</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-500">Total Value</p>
                          <p className="font-bold text-gray-900">
                            <CurrencyValue value={order.qtyKg * order.pricePerKg} className="inline-flex" />
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Modal isOpen={!!selectedOrder} onClose={() => !isLocking && setSelectedOrder(null)} title="Confirm Contract">
        {selectedOrder && (
          <div className="pb-2">
            <div className="relative -top-4 -mx-4 border-b bg-gray-50 px-4 py-4">
              <h4 className="text-lg font-bold text-gray-900">{selectedOrder.buyer}</h4>
              <p className="text-sm capitalize text-gray-600">Will buy your {selectedOrder.crop}</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-medium text-gray-500">Fixed Price</span>
                <span className="text-xl font-black text-km-green">
                  <CurrencyValue value={selectedOrder.pricePerKg} className="inline-flex" />
                  /kg
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-medium text-gray-500">Quantity Required</span>
                <span className="font-bold text-gray-900">{selectedOrder.qtyKg.toLocaleString()} kg</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-medium text-gray-500">Delivery Window</span>
                <span className="text-right font-bold text-gray-900">
                  {new Date(selectedOrder.deliveryStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} -{' '}
                  {new Date(selectedOrder.deliveryEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="mt-4 flex gap-3 rounded-xl border border-km-green/20 bg-km-green-light p-3 text-sm">
                <CheckCircle className="mt-0.5 shrink-0 text-km-green" size={18} />
                <p className="font-medium text-km-green-darker">
                  By accepting, you agree to deliver the crop to the specified warehouse during the delivery window.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <MotionButton
                  onClick={() => setSelectedOrder(null)}
                  disabled={isLocking}
                  className="rounded-xl bg-gray-100 py-3.5 font-bold text-gray-600"
                >
                  Cancel
                </MotionButton>
                <motion.button
                  layout
                  onClick={handleAccept}
                  disabled={isLocking}
                  className="overflow-hidden rounded-xl py-3.5 font-bold text-white shadow-lg shadow-km-green/30"
                  animate={
                    isLocking
                      ? {
                          scale: prefersReduced ? 1 : [0.95, 1.05, 1],
                          backgroundColor: ['#1D9E75', '#0F6E56', '#0F6E56'],
                        }
                      : {
                          scale: 1,
                          backgroundColor: '#1D9E75',
                        }
                  }
                  transition={prefersReduced ? { duration: 0 } : { duration: 0.3 }}
                  whileHover={prefersReduced || isLocking ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced || isLocking ? undefined : { scale: 0.97 }}
                >
                  <motion.span layout className="flex items-center justify-center gap-2">
                    {isLocking ? '✓ Contract Locked!' : 'Accept Contract'}
                  </motion.span>
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
