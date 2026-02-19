import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const ConfigContext = createContext(null);

// API for official dollar rate (Banco Nación)
const DOLAR_API_URL = 'https://dolarapi.com/v1/dolares/oficial';

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    dollarRate: 0,
    profitMargin: 30,
    lastDollarUpdate: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Fetch dollar rate from external API
  const fetchDollarRate = useCallback(async () => {
    try {
      const response = await fetch(DOLAR_API_URL);
      const data = await response.json();
      // Use "venta" (selling price) for customer-facing calculations
      const dollarRate = data.venta;
      // Use current time to show when WE last checked/updated the rate
      const lastDollarUpdate = new Date().toISOString();

      setConfig(prev => ({
        ...prev,
        dollarRate,
        lastDollarUpdate
      }));

      console.log(`[Cotización] Dólar actualizado: $${dollarRate} (${new Date(lastDollarUpdate).toLocaleString()})`);
      return dollarRate;
    } catch (err) {
      console.error('Error fetching dollar rate:', err);
      // Fallback to a default if API fails
      setConfig(prev => ({ ...prev, dollarRate: prev.dollarRate || 1250 }));
      return null;
    }
  }, []);

  // Fetch local config (profit margin)
  const fetchConfig = useCallback(async () => {
    console.log('[useConfig] Fetching config...');
    setLoading(true);
    try {
      // Get dollar rate from external API
      await fetchDollarRate();

      // Get local config (profit margin) from our mock/backend
      const response = await api.get('/public/config');
      setConfig(prev => ({
        ...prev,
        profitMargin: response.data.profitMargin || 30,
        profitRules: response.data.profitRules || []
      }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchDollarRate]);

  // Initial load - only once
  useEffect(() => {
    console.log('[useConfig] Initial mount, fetching config once');
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Auto-refresh dollar rate every hour (3600000 ms)
  useEffect(() => {
    // Set up interval for hourly updates
    intervalRef.current = setInterval(() => {
      console.log('[Cotización] Actualizando cotización automáticamente (cada 1 hora)...');
      fetchDollarRate();
    }, 3600000); // 1 hour = 3600000 ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchDollarRate]);

  // Update config (profit margin)
  const updateConfig = async (newConfig) => {
    try {
      await api.post('/admin/config', newConfig);
      setConfig(prev => ({ ...prev, ...newConfig }));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Refresh dollar rate (can be called manually or on import)
  const refreshDollarRate = async () => {
    console.log('[Cotización] Actualizando cotización manualmente...');
    return await fetchDollarRate();
  };

  return (
    <ConfigContext.Provider value={{
      config,
      loading,
      error,
      updateConfig,
      refresh: fetchConfig,
      refreshDollarRate
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
