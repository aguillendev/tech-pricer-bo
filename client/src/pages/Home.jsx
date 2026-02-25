import React, { useState } from 'react';
import ProductTable from '../components/ProductTable';
import CartSummary from '../components/CartSummary';
import ExportModal from '../components/ExportModal';
import { useProducts } from '../hooks/useProducts';
import { useConfig } from '../hooks/useConfig.jsx';

export default function Home() {
  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const { config, loading: configLoading } = useConfig();

  const [cartItems, setCartItems] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const dollarRate = config.dollarRate || 0;
  const totalArs = cartItems.reduce(
    (acc, item) => acc + (item.finalPriceArs ?? (item.priceUsd * dollarRate)),
    0
  );

  const handleAddToCart = (product) => {
    if (!cartItems.find(p => p.id === product.id)) {
      setCartItems([...cartItems, product]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const isLoading = productsLoading || configLoading;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full relative">
      {/* Lista de productos */}
      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Listado de Productos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Seleccioná los componentes para armar tu presupuesto.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <ProductTable
            products={products}
            dollarRate={dollarRate}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            onProductsDeleted={fetchProducts}
          />
        )}
      </div>

      {/* Carrito */}
      <CartSummary
        cartItems={cartItems}
        dollarRate={dollarRate}
        onRemoveItem={handleRemoveFromCart}
        onExport={() => setIsExportModalOpen(true)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cartItems={cartItems}
        totalArs={totalArs}
      />
    </div>
  );
}
