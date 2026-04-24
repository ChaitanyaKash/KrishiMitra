export function ProgressBar({ progress, className = '', color = 'bg-km-green' }) {
  // Clamp between 0 and 100
  const clamped = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div 
        className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`} 
        style={{ width: `${clamped}%` }}
      ></div>
    </div>
  );
}
