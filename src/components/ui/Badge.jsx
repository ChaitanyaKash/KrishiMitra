const variants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-km-green-light text-km-green-darker',
  warning: 'bg-km-amber-light text-km-amber',
  danger: 'bg-km-red-light text-km-red',
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
