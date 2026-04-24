import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { mockFarmer } from '../data/mockFarmer';

const FarmerContext = createContext(null);
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const initialState = {
  ...mockFarmer,
  fpoOrders: [],
  isLoaded: false
};

function farmerReducer(state, action) {
  switch (action.type) {
    case 'LOAD_FARMER':
      return { ...state, ...action.payload, isLoaded: true };
    case 'REGISTER_FARMER':
      return { ...state, ...action.payload, isLoaded: true };
    case 'ACCEPT_ORDER':
      return {
        ...state,
        fpoOrders: [...state.fpoOrders, action.payload]
      };
    case 'UPDATE_FINANCIALS':
      return {
        ...state,
        financials: { ...state.financials, ...action.payload }
      };
    default:
      return state;
  }
}

export function FarmerProvider({ children }) {
  const [state, dispatch] = useReducer(farmerReducer, initialState);
  const [ndviData, setNdviData] = useState(null);
  const [farmReport, setFarmReport] = useState(null);

  const getOrCreateDemoUUID = () => {
    let uuid = localStorage.getItem('km_demo_uuid');
    if (!uuid) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        const fullUuid = crypto.randomUUID().replace(/-/g, '');
        uuid = `KM-2024-${fullUuid.slice(-6).toUpperCase()}`;
      } else {
        uuid = `KM-2024-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }
      localStorage.setItem('km_demo_uuid', uuid);
    }
    return uuid;
  };

  useEffect(() => {
    // Try to load from local storage
    const saved = localStorage.getItem('km_farmer_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.farmer?.kmCardId === 'KM-CARD-UUID-HERE' || !parsed?.farmer?.kmCardId) {
        parsed.farmer.kmCardId = getOrCreateDemoUUID();
      }
      dispatch({ type: 'LOAD_FARMER', payload: parsed });
      return;
    }

    if (DEMO_MODE) {
      dispatch({
        type: 'LOAD_FARMER',
        payload: {
          ...mockFarmer,
          farmer: {
            ...mockFarmer.farmer,
            kmCardId: getOrCreateDemoUUID(),
          },
        },
      });
    }
  }, []);

  // Save to localStorage on state changes when loaded
  useEffect(() => {
    if (state.isLoaded) {
      localStorage.setItem('km_farmer_state', JSON.stringify(state));
    }
  }, [state]);

  const loadDemoFarmer = () => {
    const demoPayload = {
      ...mockFarmer,
      farmer: {
        ...mockFarmer.farmer,
        kmCardId: getOrCreateDemoUUID()
      }
    };
    setNdviData(null);
    setFarmReport(null);
    dispatch({ type: 'LOAD_FARMER', payload: demoPayload });
  };

  return (
    <FarmerContext.Provider
      value={{
        state,
        dispatch,
        loadDemoFarmer,
        ndviData,
        setNdviData,
        farmReport,
        setFarmReport,
      }}
    >
      {children}
    </FarmerContext.Provider>
  );
}

export function useFarmer() {
  const context = useContext(FarmerContext);
  if (!context) {
    throw new Error('useFarmer must be used within a FarmerProvider');
  }
  return context;
}
