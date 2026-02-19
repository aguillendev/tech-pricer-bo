import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Settings } from 'lucide-react';
import Header from '../components/Header';
import ProductTable from '../components/ProductTable';
import CartSummary from '../components/CartSummary';
import ExportModal from '../components/ExportModal';
import { useProducts } from '../hooks/useProducts';
import { useConfig } from '../hooks/useConfig.jsx';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { products, loading: productsLoading } = useProducts();
  const { config, loading: configLoading } = useConfig();
  const { isLoggedIn } = useAuth();

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

  const handleProductDeleted = (productId) => {
    // Eliminar también del carrito si estaba ahí
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const isLoading = productsLoading || configLoading;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Navegación Móvil - Solo si está logueado */}
      {isLoggedIn && (
        <div className="lg:hidden bg-white border-b border-slate-200 sticky top-16 z-40">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center bg-[#d4af37] text-[#1e3a5f] font-semibold"
              >
                <List className="w-4 h-4" />
                <span>Lista de Precios</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-100"
              >
                <Settings className="w-4 h-4" />
                <span>Administración</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Título + Botones en la misma línea - TODO EL ANCHO */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Listado de Productos</h2>
            <p className="text-slate-500">Selecciona los componentes para armar tu presupuesto.</p>
          </div>
          {/* Botones de navegación desktop */}
          {isLoggedIn && (
            <nav className="hidden lg:flex items-center space-x-2">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-[#d4af37] text-[#1e3a5f] font-semibold"
              >
                <List className="w-4 h-4" />
                <span>Lista de Precios</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-100"
              >
                <Settings className="w-4 h-4" />
                <span>Administración</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Contenido en dos columnas */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content: Product List */}
          <div className="flex-1 min-w-0">

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
          ) : (
            <ProductTable
              products={products}
              dollarRate={dollarRate}
              profitMargin={config.profitMargin || 30}
              profitRules={config.profitRules || []}
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
              onProductDeleted={handleProductDeleted}
            />
          )}
          </div>

          {/* Sidebar: Cart Summary */}
          <CartSummary
            cartItems={cartItems}
            dollarRate={dollarRate}
            onRemoveItem={handleRemoveFromCart}
            onExport={() => setIsExportModalOpen(true)}
            onClearCart={handleClearCart}
          />
        </div>
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
