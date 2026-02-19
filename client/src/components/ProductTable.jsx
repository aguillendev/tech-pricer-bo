import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import ConfirmModal from './ConfirmModal';

export default function ProductTable({ products, dollarRate, onAddToCart, cartItems, profitMargin = 30, profitRules = [], onProductDeleted }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const { isLoggedIn } = useAuth();
  const { deleteProduct, deleteAllProducts } = useProducts();
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name } or { ids: [], count }
  const [selectedProducts, setSelectedProducts] = useState([]); // Array of product IDs
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const handleDeleteProduct = async () => {
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    
    // Si es eliminación múltiple
    if (confirmDelete.ids) {
      const { ids, count } = confirmDelete;
      
      // Si se van a eliminar todos los productos
      if (count === products.length) {
        const result = await deleteAllProducts();
        if (result.success) {
          setSelectedProducts([]);
          setConfirmDelete(null);
        } else {
          alert(result.message || 'Error al eliminar productos');
        }
      } else {
        // Eliminar productos seleccionados uno por uno
        let successCount = 0;
        for (const id of ids) {
          const result = await deleteProduct(id);
          if (result.success) {
            successCount++;
            if (onProductDeleted) {
              onProductDeleted(id);
            }
          }
        }
        setSelectedProducts([]);
        setConfirmDelete(null);
        if (successCount < ids.length) {
          alert(`Se eliminaron ${successCount} de ${ids.length} productos`);
        }
      }
    } else {
      // Eliminación individual
      const { id, name } = confirmDelete;
      setDeletingId(id);
      const result = await deleteProduct(id);
      setDeletingId(null);
      setConfirmDelete(null);
      
      if (!result.success) {
        alert(result.message || 'Error al eliminar producto');
      } else {
        if (onProductDeleted) {
          onProductDeleted(id);
        }
      }
    }
    
    setIsDeleting(false);
  };

  // Manejar selección de todos los productos (de la página actual)
  const handleSelectAll = () => {
    const currentPageIds = paginatedProducts.map(p => p.id);
    const allCurrentSelected = currentPageIds.every(id => selectedProducts.includes(id));
    
    if (allCurrentSelected) {
      // Deseleccionar los de la página actual
      setSelectedProducts(selectedProducts.filter(id => !currentPageIds.includes(id)));
    } else {
      // Seleccionar todos los de la página actual (sin duplicar)
      const newSelection = [...new Set([...selectedProducts, ...currentPageIds])];
      setSelectedProducts(newSelection);
    }
  };

  // Manejar selección individual
  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Manejar eliminación de seleccionados
  const handleDeleteSelected = () => {
    const count = selectedProducts.length;
    const isAll = count === products.length;
    
    setConfirmDelete({
      ids: selectedProducts,
      count: count,
      isAll: isAll
    });
  };

  // Manejar agregar todos los seleccionados al presupuesto
  const handleAddAllSelected = () => {
    const productsToAdd = filteredProducts.filter(p => 
      selectedProducts.includes(p.id) && !isInCart(p.id)
    );
    
    productsToAdd.forEach(product => {
      onAddToCart(product);
    });
    
    // Opcional: limpiar la selección después de agregar
    setSelectedProducts([]);
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, itemsPerPage]);

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
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none transition bg-white text-slate-700 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Admin info badge */}
        {isLoggedIn && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <span className="bg-[#F8FAFC] text-[#1e3a5f] px-2 py-1 rounded-full font-semibold">
                Vista Admin
              </span>
              <span className="text-slate-500">
                Ganancia: <span className="font-mono font-bold text-[#d4af37]">{profitMargin}%</span>
              </span>
            </div>
            {selectedProducts.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={handleAddAllSelected}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152943] transition disabled:opacity-50 flex items-center justify-center space-x-2 text-sm font-medium shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Agregar al Presupuesto ({selectedProducts.filter(id => !isInCart(id)).length})</span>
                  <span className="sm:hidden">Agregar ({selectedProducts.filter(id => !isInCart(id)).length})</span>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center space-x-2 text-sm font-medium shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Eliminar Seleccionados ({selectedProducts.length})</span>
                  <span className="sm:hidden">Eliminar ({selectedProducts.length})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              {isLoggedIn && (
                <th className="p-4 font-semibold text-center w-12">
                  <input
                    type="checkbox"
                    checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.includes(p.id))}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 accent-[#d4af37] cursor-pointer"
                  />
                </th>
              )}
              <th className="p-4 font-semibold">Producto</th>
              {isLoggedIn && (
                <>
                  <th className="p-4 font-semibold text-right hidden lg:table-cell">Costo USD</th>
                  <th className="p-4 font-semibold text-right hidden md:table-cell">Costo ARS</th>
                </>
              )}
              <th className="p-4 font-semibold text-right text-[#d4af37]">
                {isLoggedIn ? 'Precio Final' : 'Precio'}
              </th>
              <th className="p-4 font-semibold text-center w-24">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => {
                const { costArs, finalPrice, appliedProfit } = calculatePrices(product.priceUsd);
                const inCart = isInCart(product.id);
                const displayPrice = isLoggedIn ? finalPrice : costArs;

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition group">
                    {isLoggedIn && (
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 rounded border-slate-300 accent-[#d4af37] cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.category}</div>
                      {/* Mostrar costos en móvil dentro de la celda del producto */}
                      {isLoggedIn && (
                        <div className="text-xs text-slate-400 mt-1 md:hidden">
                          Costo: ${costArs.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                      )}
                      {isLoggedIn && appliedProfit !== profitMargin && (
                        <div className="text-xs text-orange-600 font-semibold mt-1">
                          ⚡ Ganancia: {appliedProfit}%
                        </div>
                      )}
                    </td>
                    {isLoggedIn && (
                      <>
                        <td className="p-4 text-right text-slate-500 font-mono hidden lg:table-cell">
                          ${product.priceUsd.toFixed(2)}
                        </td>
                        <td className="p-4 text-right text-slate-500 font-mono hidden md:table-cell">
                          ${costArs.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </>
                    )}
                    <td className="p-4 text-right font-bold text-slate-900 font-mono text-lg">
                      <span className={isLoggedIn ? 'text-[#d4af37] font-semibold' : ''}>
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
                            ? "bg-[#BAE6FD] text-[#d4af37] cursor-default font-semibold"
                            : "bg-[#BAE6FD] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-white"
                        )}
                        title={inCart ? "Agregado" : "Agregar al presupuesto"}
                      >
                        {inCart ? <ShoppingCart className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isLoggedIn ? "5" : "3"} className="p-8 text-center text-slate-400">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">Mostrando</span>
            <span className="font-semibold text-[#1e3a5f]">
              {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}
            </span>
            <span>de</span>
            <span className="font-semibold text-[#1e3a5f]">{filteredProducts.length}</span>
            <span className="hidden sm:inline">productos</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2 text-sm">
              <label className="text-slate-600 hidden sm:inline">Por página:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none bg-white text-slate-700 cursor-pointer text-sm"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-700"
                title="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="px-3 py-1 text-sm">
                <span className="font-semibold text-[#1e3a5f]">{currentPage}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-600">{totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-700"
                title="Página siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteProduct}
        title={confirmDelete?.ids ? (confirmDelete.isAll ? "Eliminar Todos los Productos" : "Eliminar Productos Seleccionados") : "Eliminar Producto"}
        message={
          confirmDelete?.ids 
            ? confirmDelete.isAll
              ? '¿Estás seguro de que deseas eliminar todos los productos? Esta acción no se puede deshacer.'
              : `¿Estás seguro de que deseas eliminar ${confirmDelete.count} producto${confirmDelete.count > 1 ? 's' : ''}? Esta acción no se puede deshacer.`
            : confirmDelete
              ? `¿Estás seguro de que deseas eliminar "${confirmDelete.name}"? Esta acción no se puede deshacer.`
              : ''
        }
      />
    </div>
  );
}

