import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import ConfirmModal from './ConfirmModal';

export default function ProductTable({ products, dollarRate, onAddToCart, cartItems, profitMargin = 30, profitRules = [], onProductDeleted }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const { isLoggedIn } = useAuth();
  const { deleteProduct } = useProducts();
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

  const handleDeleteProduct = async () => {
    if (!confirmDelete) return;
    
    const { id, name } = confirmDelete;
    setDeletingId(id);
    const result = await deleteProduct(id);
    setDeletingId(null);
    setConfirmDelete(null);
    
    if (!result.success) {
      alert(result.message || 'Error al eliminar producto');
    } else {
      // Notificar al componente padre que se eliminó el producto
      if (onProductDeleted) {
        onProductDeleted(id);
      }
    }
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['Todas', ...Array.from(cats).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Helper to check if item is in cart
  const isInCart = (productId) => cartItems.some(item => item.id === productId);

  // Apply profit rules to determine profit margin for a product
  const getApplicableProfitMargin = (priceUsd) => {
    if (!profitRules || profitRules.length === 0) {
      return profitMargin; // Use global profit margin if no rules
    }

    // Check if any rule applies
    for (const rule of profitRules) {
      const priceToCompare = rule.currency === 'USD' ? priceUsd : priceUsd * dollarRate;
      const threshold = rule.priceThreshold;
      
      let matches = false;
      if (rule.operator === 'mayor' && priceToCompare > threshold) matches = true;
      if (rule.operator === 'menor' && priceToCompare < threshold) matches = true;
      if (rule.operator === 'igual' && Math.abs(priceToCompare - threshold) < 0.01) matches = true;
      
      if (matches) {
        return rule.profitPercent;
      }
    }

    // If no rule matches, use global profit margin
    return profitMargin;
  };

  // Calculate prices
  const calculatePrices = (priceUsd) => {
    const costArs = priceUsd * dollarRate;
    const applicableProfit = getApplicableProfitMargin(priceUsd);
    const finalPrice = costArs * (1 + applicableProfit / 100);
    return { costArs, finalPrice, appliedProfit: applicableProfit };
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-slate-700 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Admin info badge */}
        {isLoggedIn && (
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="bg-[#f5e6c3] text-[#1e3a5f] px-2 py-1 rounded-full font-semibold">
              Vista Admin
            </span>
            <span className="text-slate-500">
              Cotización: <span className="font-mono font-bold">${dollarRate.toFixed(2)}</span>
            </span>
            <span className="text-slate-500">
              Ganancia: <span className="font-mono font-bold text-green-600">{profitMargin}%</span>
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="p-4 font-semibold">Producto</th>
              {isLoggedIn && (
                <>
                  <th className="p-4 font-semibold text-right">Costo USD</th>
                  <th className="p-4 font-semibold text-right">Costo ARS</th>
                </>
              )}
              <th className="p-4 font-semibold text-right text-green-600">
                {isLoggedIn ? 'Precio Final' : 'Precio'}
              </th>
              <th className="p-4 font-semibold text-center w-24">Acción</th>
              {isLoggedIn && (
                <th className="p-4 font-semibold text-center w-24">Eliminar</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const { costArs, finalPrice, appliedProfit } = calculatePrices(product.priceUsd);
                const inCart = isInCart(product.id);
                const displayPrice = isLoggedIn ? finalPrice : costArs;

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition group">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.category}</div>
                      {isLoggedIn && appliedProfit !== profitMargin && (
                        <div className="text-xs text-orange-600 font-semibold mt-1">
                          ⚡ Ganancia: {appliedProfit}%
                        </div>
                      )}
                    </td>
                    {isLoggedIn && (
                      <>
                        <td className="p-4 text-right text-slate-500 font-mono">
                          ${product.priceUsd.toFixed(2)}
                        </td>
                        <td className="p-4 text-right text-slate-500 font-mono">
                          ${costArs.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </>
                    )}
                    <td className="p-4 text-right font-bold text-slate-900 font-mono text-lg">
                      <span className={isLoggedIn ? 'text-green-600' : ''}>
                        ${displayPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onAddToCart(product)}
                        disabled={inCart}
                        className={clsx(
                          "p-2 rounded-full transition flex items-center justify-center mx-auto",
                          inCart
                            ? "bg-green-100 text-green-600 cursor-default"
                            : "bg-[#f5e6c3] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-white"
                        )}
                        title={inCart ? "Agregado" : "Agregar al presupuesto"}
                      >
                        {inCart ? <ShoppingCart className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </button>
                    </td>
                    {isLoggedIn && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setConfirmDelete({ id: product.id, name: product.name })}
                          disabled={deletingId === product.id}
                          className="p-2 rounded-full transition flex items-center justify-center mx-auto bg-red-100 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                          title="Eliminar producto"
                        >
                          {deletingId === product.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isLoggedIn ? "6" : "3"} className="p-8 text-center text-slate-400">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteProduct}
        title="Eliminar Producto"
        message={confirmDelete ? `¿Estás seguro de que deseas eliminar "${confirmDelete.name}"? Esta acción no se puede deshacer.` : ''}
      />
    </div>
  );
}

