import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useFarmer } from '../context/FarmerContext';

const demoSteps = [
  { time: 0, route: '/', desc: 'SplashScreen loads, waiting to scan KM Card' },
  { time: 5, route: '/', desc: 'Scanning KM Card...', action: 'SCAN' },
  { time: 10, route: '/dashboard', desc: 'Dashboard loads with farmer profile' },
  { time: 18, route: '/dashboard', desc: 'Highlighting crop health section', highlight: 'crop-health' },
  { time: 25, route: '/satellite', desc: 'Viewing detailed satellite report' },
  { time: 40, route: '/orders', desc: 'Browsing guaranteed FPO contracts' },
  { time: 55, route: '/orders', desc: 'Accepting FPO contract for Tomato', action: 'ACCEPT_FPO' },
  { time: 70, route: '/finance', desc: 'Viewing Season Profit & Loss statement' },
  { time: 85, route: '/dashboard', desc: 'Broker Alert: Mandi price spikes to ₹52/kg' },
  { time: 100, route: '/schemes', desc: 'Finding eligible Government Schemes' },
  { time: 115, route: '/dashboard', desc: 'Mission Complete: Full Risk-Free cycle' }
];

export default function DemoController() {
  const navigate = useNavigate();
  const { loadDemoFarmer } = useFarmer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(t => {
          const nextT = t + 1;
          const nextStepIdx = demoSteps.findIndex(s => s.time === nextT);
          
          if (nextStepIdx !== -1) {
            setCurrentStepIndex(nextStepIdx);
            const step = demoSteps[nextStepIdx];
            
            if (step.action === 'SCAN') {
              // Simulate scan delay then navigate
              setTimeout(() => {
                loadDemoFarmer();
                navigate('/dashboard');
              }, 1500);
            } else if (step.action === 'ACCEPT_FPO') {
               // Assuming manual intervention isn't strictly needed if we just mock action
               // The demo flow just navigates
               navigate(step.route);
            } else {
              navigate(step.route);
            }
          }
          
          if (nextT > 120) {
            setIsPlaying(false);
          }
          
          return nextT;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, navigate, loadDemoFarmer]);

  const step = demoSteps[currentStepIndex];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-gray-900/90 backdrop-blur text-white p-3 rounded-2xl shadow-2xl border border-gray-700 pointer-events-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-km-green-light">Demo Mode</span>
        <span className="text-xs font-mono bg-black/50 px-2 py-0.5 rounded">{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
      </div>
      
      <p className="text-sm font-medium mb-3 min-h-[40px] leading-snug">{step?.desc}</p>
      
      <div className="w-full h-1 bg-gray-700 rounded-full mb-3 overflow-hidden">
         <div className="h-full bg-km-green transition-all" style={{ width: `${(currentTime / 120) * 100}%` }} />
      </div>

      <div className="flex justify-center items-center gap-4">
        <button 
          onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
          className="p-1 hover:bg-white/10 rounded"
        >
          <SkipBack size={16} />
        </button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-km-green text-white p-2 flex items-center justify-center rounded-full hover:bg-km-green-dark transition"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        <button 
          onClick={() => setCurrentTime(Math.min(120, currentTime + 5))}
          className="p-1 hover:bg-white/10 rounded"
        >
          <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
}
