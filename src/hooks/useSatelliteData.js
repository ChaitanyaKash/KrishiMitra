import { useState, useEffect } from 'react';
import { fetchSatelliteData } from '../services/eosda';

export function useSatelliteData(polygon) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchSatelliteData(polygon);
      setData(res);
      setLoading(false);
    }
    load();
  }, [polygon]);

  return { data, loading };
}
