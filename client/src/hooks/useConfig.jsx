import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    dollarRate: null,      // null = aún no disponible / error de cotización
    profitMargin: 30,
    lastDollarUpdate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dollarError, setDollarError] = useState(null); // error específico de cotización
  const intervalRef = useRef(null);

  /**
   * Obtiene la configuración desde el backend.
   * El backend es la única fuente de la cotización del dólar:
   * llama a dolarapi.com internamente y devuelve { dollarRate, profitMargin }.
   * Si la API del dólar no está disponible el backend responde con HTTP 503
   * y este hook lo convierte en dollarError (por si queres manejarlo en UI).
   */
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setDollarError(null);
    try {
      const response = await api.get('/public/config');
      const { dollarRate, profitMargin } = response.data;

      setConfig({
        dollarRate: dollarRate ?? null,
        profitMargin: profitMargin ?? 30,
        lastDollarUpdate: new Date().toISOString(),
      });

      console.log(`[Config] dollarRate=$${dollarRate} profitMargin=${profitMargin}%`);
    } catch (err) {
      // Si el backend devuelve 503 es porque la API del dólar no responde
      if (err.response?.status === 503) {
        const msg = err.response.data?.error
          ?? 'No se pudo obtener la cotización del dólar. Los precios en ARS no pueden calcularse.';
        setDollarError(msg);
        setConfig(prev => ({ ...prev, dollarRate: null }));
        console.warn('[Config] Dollar API no disponible:', msg);
      } else {
        setError(err);
        console.error('[Config] Error al cargar configuración:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // Auto-refresh cada 1 hora
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log('[Config] Actualizando configuración automáticamente...');
      fetchConfig();
    }, 3_600_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchConfig]);

  const updateConfig = async (newConfig) => {
    try {
      await api.post('/admin/config', newConfig);
      setConfig(prev => ({ ...prev, ...newConfig }));
      return true;
    } catch (err) {
      console.error('[Config] Error al actualizar configuración:', err);
      return false;
    }
  };

  // Permite refrescar manualmente (ej: botón "Reintentar" o tras importar)
  const refreshDollarRate = () => fetchConfig();

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
