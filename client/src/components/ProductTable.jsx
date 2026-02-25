import React, { useState, useMemo } from 'react';
import {
  Search, ShoppingCart, Plus, Trash2, CheckSquare, Square,
  AlertTriangle, X
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { deleteProducts } from '../services/api';
import AddProductModal from './AddProductModal';

// ── Modal de confirmación ────────────────────────────────────────────────────
function ConfirmDeleteModal({ count, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        {/* Botón cerrar */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ícono */}
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        {/* Texto */}
        <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
          Confirmar eliminación
        </h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          Estás por eliminar{' '}
          <span className="font-semibold text-slate-800">
            {count} producto{count !== 1 ? 's' : ''}
          </span>
          . Esta acción <span className="text-red-600 font-medium">no se puede deshacer</span>.
        </p>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-red-200"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Eliminando...</>
              : <><Trash2 className="w-4 h-4" /> Eliminar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function ProductTable({ products, dollarRate, onAddToCart, cartItems, onProductsDeleted }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { isLoggedIn } = useAuth();

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['Todas', ...Array.from(cats).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const isInCart = (productId) => cartItems.some(item => item.id === productId);
  const getCostArs = (priceUsd) => priceUsd * dollarRate;

  // ── Selección ──────────────────────────────────────────────────────────────
  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every(p => selectedIds.has(p.id));

  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredProducts.forEach(p => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredProducts.forEach(p => next.add(p.id));
        return next;
      });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Eliminación ────────────────────────────────────────────────────────────
  const handleDeleteConfirmed = async () => {
    const ids = Array.from(selectedIds);
    setDeleting(true);
    try {
      await deleteProducts(ids);
      setSelectedIds(new Set());
      setShowConfirm(false);
      onProductsDeleted?.();
    } catch (err) {
      console.error(err);
      setShowConfirm(false);
      setErrorMsg('Error al eliminar los productos. Intenta nuevamente.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const colCount = isLoggedIn ? 6 : 3;

  return (
    <>
      {/* Modal de confirmación de borrado */}
      {showConfirm && (
        <ConfirmDeleteModal
          count={selectedIds.size}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => !deleting && setShowConfirm(false)}
          loading={deleting}
        />
      )}

      {/* Modal agregar productos */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onDone={() => { onProductsDeleted?.(); }}
        />
      )}

      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        {/* ── Barra de búsqueda y filtros ── */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
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

            {/* Botón + agregar — solo admin */}
            {isLoggedIn && (
              <button
                onClick={() => setShowAddModal(true)}
                title="Agregar productos"
                className={[
                  'group relative flex items-center gap-2 shrink-0',
                  'pl-3.5 pr-4 py-2.5 rounded-xl',
                  'bg-gradient-to-br from-blue-500 to-indigo-600',
                  'text-white text-sm font-semibold',
                  'shadow-md shadow-blue-500/40',
                  'hover:shadow-lg hover:shadow-blue-500/50',
                  'hover:from-blue-400 hover:to-indigo-500',
                  'hover:scale-[1.03]',
                  'active:scale-[0.97]',
                  'transition-all duration-200 ease-out',
                  'ring-1 ring-white/20',
                ].join(' ')}
              >
                {/* Glow interno */}
                <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                {/* Ícono que rota al hacer hover */}
                <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90 relative z-10" />
                <span className="hidden sm:inline relative z-10 tracking-wide">Agregar</span>
              </button>
            )}
          </div>

          {isLoggedIn && (
            <div className="flex items-center gap-4 text-xs">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                Vista Admin
              </span>
              <span className="text-slate-500">
                Cotización: <span className="font-mono font-bold">${dollarRate.toFixed(2)}</span>
              </span>
              <span className="text-slate-500">
                Precios calculados con reglas de ganancia por tramos
              </span>
            </div>
          )}
        </div>

        {/* ── Mensaje de error inline ── */}
        {errorMsg && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="ml-auto text-red-400 hover:text-red-600 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Barra de acción (selección activa) ── */}
        {isLoggedIn && someSelected && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-red-50 border-b border-red-100">
            <span className="text-sm font-medium text-red-700">
              {selectedIds.size} producto{selectedIds.size !== 1 ? 's' : ''} seleccionado{selectedIds.size !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setShowConfirm(true)}
              className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar seleccionados
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-red-500 hover:text-red-700 transition"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ── Tabla ── */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                {isLoggedIn && (
                  <th className="p-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-blue-600 transition"
                      title={allFilteredSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    >
                      {allFilteredSelected
                        ? <CheckSquare className="w-4 h-4 text-blue-600" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                )}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const costArs = getCostArs(product.priceUsd);
                  const finalPrice = product.finalPriceArs ?? costArs;
                  const inCart = isInCart(product.id);
                  const isChecked = selectedIds.has(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={clsx(
                        'hover:bg-slate-50 transition group',
                        isChecked && 'bg-red-50/70 hover:bg-red-50'
                      )}
                    >
                      {isLoggedIn && (
                        <td className="p-4 w-10">
                          <button
                            onClick={() => toggleSelect(product.id)}
                            className="text-slate-300 hover:text-red-500 transition"
                          >
                            {isChecked
                              ? <CheckSquare className="w-4 h-4 text-red-500" />
                              : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                      )}

                      <td className="p-4">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.category}</div>
                      </td>

                      {isLoggedIn && (
                        <>
                          <td className="p-4 text-right text-slate-500 font-mono">
                            ${product.priceUsd?.toFixed(2)}
                          </td>
                          <td className="p-4 text-right text-slate-500 font-mono">
                            ${costArs.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                        </>
                      )}

                      <td className="p-4 text-right font-bold text-slate-900 font-mono text-lg">
                        <span className={isLoggedIn ? 'text-green-600' : ''}>
                          ${finalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => onAddToCart(product)}
                          disabled={inCart}
                          className={clsx(
                            'p-2 rounded-full transition flex items-center justify-center mx-auto',
                            inCart
                              ? 'bg-green-100 text-green-600 cursor-default'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'
                          )}
                          title={inCart ? 'Agregado' : 'Agregar al presupuesto'}
                        >
                          {inCart ? <ShoppingCart className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={colCount} className="p-8 text-center text-slate-400">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
