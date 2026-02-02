import { useState, useEffect } from 'react';
import api from '../services/api';

export function useConfig() {
  const [config, setConfig] = useState({ dollarRate: 0, profitMargin: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/public/config');
      setConfig(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
      try {
          await api.post('/admin/config', newConfig);
          setConfig(prev => ({ ...prev, ...newConfig }));
          return true;
      } catch (err) {
          console.error(err);
          return false;
      }
  }

  return { config, loading, error, updateConfig, refresh: fetchConfig };
}
