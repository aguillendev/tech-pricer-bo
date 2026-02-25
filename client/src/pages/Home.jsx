import React, { useState } from 'react';
import ProductTable from '../components/ProductTable';
import CartSummary from '../components/CartSummary';
import ExportModal from '../components/ExportModal';
import { useProducts } from '../hooks/useProducts';
import { useConfig } from '../hooks/useConfig.jsx';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function Home() {
  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const { config, loading: configLoading, dollarError, refreshDollarRate } = useConfig();

  const [cartItems, setCartItems] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const dollarRate = config.dollarRate; // null si no disponible
  const totalArs = cartItems.reduce(
    (acc, item) => acc + (item.finalPriceArs ?? (dollarRate ? item.priceUsd * dollarRate : 0)),
    0
  );

  const handleAddToCart = (product) => {
    if (!cartItems.find(p => p.id === product.id)) setCartItems([...cartItems, product]);
  };
  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleRetryDollar = async () => {
    setRetrying(true);
    await refreshDollarRate();
    setRetrying(false);
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

        {/* ── Banner de error de cotización ── */}
        {dollarError && (
          <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-4 py-3.5 text-sm">
            <WifiOff className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold mb-0.5">No se puede calcular precios en ARS</p>
              <p className="text-amber-700">{dollarError}</p>
            </div>
            <button
              onClick={handleRetryDollar}
              disabled={retrying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg text-xs font-medium transition disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Reintentando...' : 'Reintentar'}
            </button>
          </div>
        )}

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
