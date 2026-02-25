import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    dollarRate: null,      // null = aún no disponible / error
    profitMargin: 30,
    lastDollarUpdate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dollarError, setDollarError] = useState(null); // error específico de cotización
  const intervalRef = useRef(null);

  // Consulta la cotización directamente a dolarapi.com desde el frontend
  const fetchDollarRate = useCallback(async () => {
    setDollarError(null);
    try {
      const dolarApiUrl = import.meta.env.VITE_DOLAR_API_URL ?? 'https://dolarapi.com/v1/dolares/oficial';
      const response = await fetch(dolarApiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data?.venta) throw new Error('La API no devolvió el valor de venta.');

      const dollarRate = data.venta;
      const lastDollarUpdate = new Date().toISOString();
      setConfig(prev => ({ ...prev, dollarRate, lastDollarUpdate }));
      console.log(`[Cotización] Dólar oficial (venta): $${dollarRate}`);
      return dollarRate;
    } catch (err) {
      console.error('[Cotización] Error al obtener cotización:', err.message);
      setDollarError(
        'No se pudo obtener la cotización del dólar desde dolarapi.com. ' +
        'Los precios en ARS no pueden calcularse hasta que la conexión se restaure.'
      );
      setConfig(prev => ({ ...prev, dollarRate: null }));
      return null;
    }
  }, []);

  // Obtiene el margen de ganancia desde el backend
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      await fetchDollarRate();
      const response = await api.get('/public/config');
      setConfig(prev => ({
        ...prev,
        profitMargin: response.data.profitMargin ?? 30,
      }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchDollarRate]);

  // Carga inicial
  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // Auto-refresh de cotización cada 1 hora
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log('[Cotización] Actualizando cotización automáticamente...');
      fetchDollarRate();
    }, 3_600_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchDollarRate]);

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

  // Puede usarse antes de importar/agregar productos
  const refreshDollarRate = async () => {
    console.log('[Cotización] Refresh manual...');
    return fetchDollarRate();
  };

  return (
    <ConfigContext.Provider value={{
      config,
      loading,
      error,
      dollarError,
      updateConfig,
      refresh: fetchConfig,
      refreshDollarRate,
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within a ConfigProvider');
  return context;
}
