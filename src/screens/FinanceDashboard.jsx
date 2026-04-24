import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, TrendingUp } from 'lucide-react';
import { useFarmer } from '../context/FarmerContext';
import { formatCurrency } from '../utils/formatCurrency';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { MotionButton } from '../components/ui/MotionButton';
import { CurrencyValue } from '../components/ui/AnimatedValue';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScreenLoader } from '../hooks/useScreenLoader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip as RechartsTooltip } from 'recharts';

function FinanceSkeleton() {
  return (
    <div className="printable flex min-h-screen flex-col bg-km-gray-light">
      <div className="relative z-0 rounded-b-3xl bg-km-green-dark px-4 pb-24 pt-10 text-white shadow-md">
        <Skeleton className="h-4 w-32 rounded-lg bg-white/20" />
        <Skeleton className="mt-3 h-6 w-28 rounded-lg bg-white/20" />
        <Skeleton className="mt-8 h-12 w-52 rounded-lg bg-white/20" />
      </div>
      <div className="relative z-10 -mt-16 flex-1 space-y-4 px-4 pb-24">
        <Skeleton className="h-[420px] rounded-[24px]" />
        <Skeleton className="h-[300px] rounded-[24px]" />
        <Skeleton className="h-[260px] rounded-[24px]" />
      </div>
    </div>
  );
}

function FinanceRow({ index, label, value, valueClassName = '', children }) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <motion.div
      className={`flex items-center justify-between text-sm ${valueClassName}`}
      initial={{ opacity: 0, x: prefersReduced ? 0 : -16 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: prefersReduced ? { duration: 0 } : { duration: 0.22, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <span>{label}</span>
      <span>{children ?? <CurrencyValue value={value} className="inline-flex" />}</span>
    </motion.div>
  );
}

export default function FinanceDashboard() {
  const { state } = useFarmer();
  const prefersReduced = usePrefersReducedMotion();
  const isScreenReady = useScreenLoader();
  const profitTarget = 234006;
  const [loanAmount, setLoanAmount] = useState(40000);
  const [loanSource, setLoanSource] = useState('kcc');

  const loanOptions = {
    moneylender: { name: 'Local Moneylender', rate: 36, months: 6 },
    kcc: { name: 'KCC Bank Loan', rate: 7, months: 6 },
    km: { name: 'KM Kisan Credit', rate: 12, months: 6 },
  };

  const calculateEMI = (principal, ratePerYear, months) => {
    const r = ratePerYear / 12 / 100;
    if (r === 0) {
      return principal / months;
    }

    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  };

  const activeLoan = loanOptions[loanSource];
  const emi = calculateEMI(loanAmount, activeLoan.rate, activeLoan.months);
  const totalInterest = (emi * activeLoan.months) - loanAmount;
  const profitAfterLoan = profitTarget - totalInterest;

  const chartData = [
    { day: 'Day 0', val: -100000 },
    { day: 'Day 20', val: -110000 },
    { day: 'Day 40', val: -119294 },
    { day: 'Day 60', val: 50000 },
    { day: 'Day 80', val: 150000 },
    { day: 'Day 100', val: profitTarget },
  ];

  const revenueRows = [
    { label: <>FPO Contract (10,000 kg × <CurrencyValue value={48} className="inline-flex" />)</>, value: 480000 },
    { label: 'Bonus (early delivery)', value: 30000 },
    { label: 'Govt subsidy received', value: 15500 },
  ];

  const costRows = [
    { label: 'Seeds (certified, Hybrid F1)', value: 18000 },
    { label: 'Fertilizer & pesticides', value: 24000 },
    { label: 'Labor (6 workers × 90 days)', value: 54000 },
    { label: 'Irrigation (electricity)', value: 8000 },
    { label: 'Transport to warehouse', value: 6500 },
    { label: <>Loan EMI (<CurrencyValue value={40000} className="inline-flex" /> @ 12%, 6m)</>, value: 8200 },
    { label: <>Krishi Mitra Premium (<CurrencyValue value={99} className="inline-flex" />×6)</>, value: 594 },
  ];

  const insuranceRows = [
    { label: 'PMFBY premium paid', value: -2200 },
    { label: 'Savings from avoided claim', value: 82000, valueClassName: 'text-km-green font-semibold' },
  ];

  const handlePrint = () => {
    window.print();
  };

  if (!isScreenReady) {
    return <FinanceSkeleton />;
  }

  return (
    <div className="printable flex min-h-screen flex-col bg-km-gray-light">
      <motion.div
        className="relative z-0 rounded-b-3xl bg-km-green-dark px-4 pb-24 pt-10 text-white shadow-md no-print"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: prefersReduced ? 0 : 0.22 } }}
      >
        <h1 className="text-sm font-semibold uppercase tracking-wider text-km-green-light">Season Profit Report</h1>
        <h2 className="mt-1 text-xl font-bold">Kharif 2024</h2>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="mb-1 text-sm text-km-green-light">Your Profit This Season</p>
            <p className="text-5xl font-black text-white">
              <CurrencyValue value={profitTarget} className="inline-flex" />
            </p>
            <p className="mt-1 text-xs text-km-green-light/80">After all costs & loan EMIs</p>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 -mt-16 flex-1 space-y-4 px-4 pb-24">
        <Card className="overflow-hidden border-0 p-0 shadow-lg print:border print:border-gray-200 print:shadow-none">
          <div className="bg-white p-5">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900">P&L Statement</h3>
              <p className="text-xs text-gray-500">{state.farmer.name} • {state.farmer.kmCardId}</p>
            </div>

            <div className="mb-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-km-green">Revenue</h4>
              {revenueRows.map((row, index) => (
                <FinanceRow key={`${row.value}-${index}`} index={index} label={row.label} value={row.value} valueClassName="text-gray-600" />
              ))}
              <FinanceRow
                index={revenueRows.length}
                label="Total Revenue"
                value={525500}
                valueClassName="border-t border-gray-100 pt-2 mt-2 font-bold text-gray-900"
              />
            </div>

            <div className="mb-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-km-red">Costs</h4>
              {costRows.map((row, index) => (
                <FinanceRow key={`${row.value}-${index}`} index={index + revenueRows.length + 1} label={row.label} value={row.value} valueClassName="text-gray-600" />
              ))}
              <FinanceRow
                index={costRows.length + revenueRows.length + 1}
                label="Total Costs"
                value={119294}
                valueClassName="border-t border-gray-100 pt-2 mt-2 font-bold text-gray-900"
              />
            </div>

            <div className="mb-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">Insurance</h4>
              {insuranceRows.map((row, index) => (
                <FinanceRow
                  key={`${row.value}-${index}`}
                  index={index + revenueRows.length + costRows.length + 2}
                  label={row.label}
                  value={row.value}
                  valueClassName={row.valueClassName ?? 'text-gray-600'}
                />
              ))}
            </div>

            <motion.div
              className="relative overflow-hidden rounded-xl bg-km-green-light p-3 text-lg font-black text-km-green"
              initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.24, delay: prefersReduced ? 0 : 0.2 } }}
            >
              <motion.div
                className="absolute inset-0 origin-left bg-[linear-gradient(90deg,rgba(29,158,117,0.18),rgba(29,158,117,0.05))]"
                initial={{ scaleX: prefersReduced ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: prefersReduced ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="relative flex items-center justify-between">
                <span>Net Profit</span>
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: prefersReduced ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: prefersReduced ? 0 : 0.18, delay: prefersReduced ? 0 : 0.42 }}
                  >
                    <CurrencyValue value={profitTarget} className="inline-flex" />
                  </motion.span>
                  <motion.span
                    initial={{ opacity: prefersReduced ? 1 : 0, scale: prefersReduced ? 1 : 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 18, delay: 0.82 }}
                  >
                    ✅
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>

          <MotionButton
            onClick={handlePrint}
            className="no-print flex w-full items-center justify-center gap-2 border-t border-gray-100 bg-gray-50 py-4 text-sm font-bold text-km-green-dark"
          >
            <Download size={18} /> Download Salary Slip
          </MotionButton>
        </Card>

        <Card className="no-print">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
            <FileText size={18} className="text-km-green" /> Loan Simulator
          </h3>

          <div className="mb-6">
            <div className="mb-2 flex justify-between text-sm font-medium">
              <span className="text-gray-600">How much loan do you need?</span>
              <span className="font-bold text-km-green">
                <CurrencyValue value={loanAmount} className="inline-flex" />
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={loanAmount}
              onChange={(event) => setLoanAmount(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-km-green"
            />
            <div className="mt-1 flex justify-between text-[10px] font-mono text-gray-400">
              <span>₹10K</span>
              <span>₹2L</span>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-2">
            {Object.keys(loanOptions).map((id) => (
              <motion.label
                key={id}
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  loanSource === id ? 'border-km-green bg-km-green-light/50' : 'border-gray-200'
                }`}
                whileHover={prefersReduced ? undefined : { y: -1 }}
                whileTap={prefersReduced ? undefined : { scale: 0.99 }}
                transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 28 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${loanSource === id ? 'border-km-green' : 'border-gray-300'}`}>
                      {loanSource === id && <div className="h-2 w-2 rounded-full bg-km-green" />}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {loanOptions[id].name} ({loanOptions[id].rate}%)
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="loanSource"
                  className="sr-only"
                  value={id}
                  checked={loanSource === id}
                  onChange={() => setLoanSource(id)}
                />
              </motion.label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Monthly EMI</p>
              <p className="mt-0.5 text-lg font-bold text-km-red">
                <CurrencyValue value={Math.round(emi)} className="inline-flex" />
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Interest</p>
              <p className="mt-0.5 text-lg font-bold text-km-amber">
                <CurrencyValue value={Math.round(totalInterest)} className="inline-flex" />
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-km-green p-4 text-white shadow-lg shadow-km-green/20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Expected Final Profit</p>
              <motion.p
                key={`${loanSource}-${loanAmount}-${Math.round(profitAfterLoan)}`}
                className="mt-0.5 text-2xl font-black"
                animate={profitAfterLoan < 0 && !prefersReduced ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.4 }}
              >
                <CurrencyValue value={Math.round(profitAfterLoan)} className="inline-flex" />
              </motion.p>
            </div>
            <TrendingUp size={32} strokeWidth={1.5} className="text-white/50" />
          </div>
        </Card>

        <Card className="no-print">
          <h3 className="mb-6 font-bold text-gray-900">Daily Profit & Loss Trend</h3>
          <div className="-ml-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                <YAxis domain={[-150000, 300000]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                />
                <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke="#1D9E75"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={!prefersReduced}
                  animationDuration={prefersReduced ? 0 : 1200}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              .printable, .printable * { visibility: visible; }
              .printable { position: absolute; left: 0; top: 0; width: 100%; background: white; }
              .no-print { display: none !important; }
            }
          `,
        }}
      />
    </div>
  );
}
