import { useCallback, useEffect, useRef, useState } from 'react';
import { generateFarmReport } from '../services/farmAnalysis';
import { useFarmer } from '../context/FarmerContext';

export function useFarmIntelligence() {
  const { setFarmReport, setNdviData } = useFarmer();
  const timeoutIdsRef = useRef([]);
  const [state, setState] = useState({
    loading: false,
    report: null,
    error: null,
    loadingStep: '',
  });

  const clearStepTimers = useCallback(() => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

  useEffect(() => clearStepTimers, [clearStepTimers]);

  const fetchReport = useCallback(
    async (lat, lon) => {
      clearStepTimers();
      setState({
        loading: true,
        report: null,
        error: null,
        loadingStep: 'Contacting ISRO satellite...',
      });

      const steps = [
        [0, 'Contacting ISRO satellite...'],
        [800, 'Fetching rainfall forecast...'],
        [1600, 'Reading soil moisture levels...'],
        [2400, 'Checking air quality...'],
        [3200, 'Running farm analysis engine...'],
      ];

      steps.forEach(([delay, message]) => {
        const timerId = window.setTimeout(() => {
          setState((prev) => (prev.loading ? { ...prev, loadingStep: message } : prev));
        }, delay);
        timeoutIdsRef.current.push(timerId);
      });

      try {
        const report = await generateFarmReport(lat, lon);
        clearStepTimers();
        setFarmReport(report);
        if (report?.data?.ndvi) {
          setNdviData(report.data.ndvi);
        }
        setState({ loading: false, report, error: null, loadingStep: '' });
        return report;
      } catch (err) {
        clearStepTimers();
        setState({ loading: false, report: null, error: err.message, loadingStep: '' });
        return null;
      }
    },
    [clearStepTimers, setFarmReport, setNdviData],
  );

  return { ...state, fetchReport };
}
