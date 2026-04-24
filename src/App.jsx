import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, HashRouter, useLocation, useNavigate } from 'react-router-dom';
import { FarmerProvider } from './context/FarmerContext';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';
import PageTransition from './components/PageTransition';

// Screens
import SplashScreen from './screens/SplashScreen';
import OnboardingFlow from './screens/OnboardingFlow';
import FarmerDashboard from './screens/FarmerDashboard';
import SatelliteView from './screens/SatelliteView';
import FPOOrderBoard from './screens/FPOOrderBoard';
import FinanceDashboard from './screens/FinanceDashboard';
import SchemesFinder from './screens/SchemesFinder';
import DemoController from './screens/DemoController';
import FarmIntelligence from './screens/FarmIntelligence';

function App() {
  return (
    <HashRouter>
      <FarmerProvider>
        <ToastProvider>
          <AppShell>
            <AnimatedRoutes />
            <DemoOverlay />
          </AppShell>
        </ToastProvider>
      </FarmerProvider>
    </HashRouter>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><SplashScreen /></PageTransition>} />
        <Route path="/onboard" element={<PageTransition><OnboardingFlow /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><FarmerDashboard /></PageTransition>} />
        <Route path="/satellite" element={<PageTransition><SatelliteView /></PageTransition>} />
        <Route path="/orders" element={<PageTransition><FPOOrderBoard /></PageTransition>} />
        <Route path="/finance" element={<PageTransition><FinanceDashboard /></PageTransition>} />
        <Route path="/schemes" element={<PageTransition><SchemesFinder /></PageTransition>} />
        <Route path="/intelligence" element={<PageTransition><FarmIntelligence /></PageTransition>} />
        <Route path="/demo" element={<PageTransition><DemoRoute /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function DemoRoute() {
  const nav = useNavigate();
  React.useEffect(() => {
     nav('/?demo=true', {replace: true});
  }, [nav]);
  return null;
}

function DemoOverlay() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.get('demo') === 'true') {
    return <DemoController />;
  }
  return null;
}

export default App;
