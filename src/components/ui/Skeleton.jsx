export function Skeleton({ className = '', variant = 'rectangular' }) {
  const baseClasses = 'skeleton';
  
  if (variant === 'circular') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }
  
  if (variant === 'text') {
    return <div className={`${baseClasses} rounded h-4 w-full ${className}`} />;
  }
  
  return <div className={`${baseClasses} rounded-xl ${className}`} />;
}
