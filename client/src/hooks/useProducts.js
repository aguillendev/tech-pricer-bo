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
      const response = await api.post('/admin/import', { data: rawData });
      await fetchProducts(); // Refresh products list
      return response.data; // Returns { success, message, products }
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Error en la importación', products: [] };
    }
  }

  const deleteProduct = async (productId) => {
    try {
      const response = await api.delete(`/admin/product/${productId}`);
      await fetchProducts(); // Refresh products list
      return response.data; // Returns { success, message }
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Error al eliminar producto' };
    }
  }

  const deleteAllProducts = async () => {
    try {
      const response = await api.delete('/admin/products');
      await fetchProducts(); // Refresh products list
      return response.data; // Returns { success, message, count }
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Error al eliminar productos' };
    }
  }

  return { products, loading, error, fetchProducts, addProduct, importProducts, deleteProduct, deleteAllProducts };
}
