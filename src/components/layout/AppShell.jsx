import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell({ children }) {
  const location = useLocation();
  const hideNavRoutes = ['/', '/onboard', '/demo'];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-km-gray-light pb-20 font-sans text-gray-800 sm:bg-gray-100">
      <div className="relative mx-auto min-h-screen max-w-sm overflow-hidden bg-km-gray-light shadow-sm">
        {children}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
