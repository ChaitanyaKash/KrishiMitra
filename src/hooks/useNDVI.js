import { useState, useCallback } from 'react';
import { analyzeNDVI } from '../services/vedas';

export function useNDVI() {
  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null,
    location: null,
  });

  const fetchForLocation = useCallback(async (lat, lon) => {
    setState((prev) => ({ ...prev, loading: true, error: null, location: { lat, lon } }));
    try {
      const result = await analyzeNDVI(lat, lon);
      setState((prev) => ({ ...prev, loading: false, data: result }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, data: null, error: null, location: null });
  }, []);

  return { ...state, fetchForLocation, reset };
}
