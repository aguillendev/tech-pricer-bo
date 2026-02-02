import { useState, useEffect } from 'react';
import api from '../services/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/public/products');
      setProducts(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
      try {
          await api.post('/admin/product', productData);
          await fetchProducts(); // Refresh list
          return true;
      } catch (err) {
          console.error(err);
          return false;
      }
  }

  const importProducts = async (rawData) => {
      try {
          await api.post('/admin/import', { data: rawData });
          // In a real app we might reload products
          return true;
      } catch (err) {
          console.error(err);
          return false;
      }
  }

  return { products, loading, error, fetchProducts, addProduct, importProducts };
}
