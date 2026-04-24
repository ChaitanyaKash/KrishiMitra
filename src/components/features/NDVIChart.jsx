import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip as RechartsTooltip } from 'recharts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export function NDVIChart({ data }) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div className="w-full h-48 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="week" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#6B7280' }} 
            dy={10}
          />
          <YAxis 
            domain={[0, 1]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#6B7280' }} 
            ticks={[0, 0.4, 0.7, 1.0]}
          />
          <RechartsTooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#111827', fontSize: '12px' }}
            itemStyle={{ color: '#1D9E75', fontSize: '12px', fontWeight: 'bold' }}
          />
          <ReferenceLine y={0.7} stroke="#1D9E75" strokeDasharray="3 3" />
          <ReferenceLine y={0.4} stroke="#BA7517" strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="ndvi" 
            stroke="#1D9E75" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#1D9E75', strokeWidth: 2, stroke: '#fff' }} 
            activeDot={{ r: 6 }}
            isAnimationActive={!prefersReduced}
            animationDuration={prefersReduced ? 0 : 1200}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
