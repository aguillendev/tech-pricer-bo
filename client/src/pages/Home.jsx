import React, { useState } from 'react';
import Header from '../components/Header';
import ProductTable from '../components/ProductTable';
import CartSummary from '../components/CartSummary';
import ExportModal from '../components/ExportModal';
import { useProducts } from '../hooks/useProducts';
import { useConfig } from '../hooks/useConfig';

export default function Home() {
  const { products, loading: productsLoading } = useProducts();
  const { config, loading: configLoading } = useConfig();

  const [cartItems, setCartItems] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const dollarRate = config.dollarRate || 0;
  // Calculate total ARS for modal
  const totalArs = cartItems.reduce((acc, item) => acc + (item.priceUsd * dollarRate), 0);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 relative">
        {/* Main Content: Product List */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Listado de Productos</h2>
            <p className="text-slate-500">Selecciona los componentes para armar tu presupuesto.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ProductTable
              products={products}
              dollarRate={dollarRate}
              profitMargin={config.profitMargin || 30}
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
            />
          )}
        </div>

        {/* Sidebar: Cart Summary */}
        <CartSummary
          cartItems={cartItems}
          dollarRate={dollarRate}
          onRemoveItem={handleRemoveFromCart}
          onExport={() => setIsExportModalOpen(true)}
        />
      </main>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cartItems={cartItems}
        dollarRate={dollarRate}
        totalArs={totalArs}
      />
    </div>
  );
}
