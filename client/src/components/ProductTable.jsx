import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus } from 'lucide-react';
import { clsx } from 'clsx';

export default function ProductTable({ products, dollarRate, onAddToCart, cartItems }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Helper to check if item is in cart
  const isInCart = (productId) => cartItems.some(item => item.id === productId);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="p-4 font-semibold">Producto</th>
              <th className="p-4 font-semibold text-right hidden sm:table-cell">Precio USD</th>
              <th className="p-4 font-semibold text-right text-blue-600">Precio ARS</th>
              <th className="p-4 font-semibold text-center w-24">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const priceArs = product.priceUsd * dollarRate;
                const inCart = isInCart(product.id);

                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition group">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.category}</div>
                    </td>
                    <td className="p-4 text-right text-slate-500 font-mono hidden sm:table-cell">
                      ${product.priceUsd.toFixed(2)}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 font-mono text-lg">
                      ${priceArs.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onAddToCart(product)}
                        disabled={inCart}
                        className={clsx(
                          "p-2 rounded-full transition flex items-center justify-center mx-auto",
                          inCart
                            ? "bg-green-100 text-green-600 cursor-default"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
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
                <td colSpan="4" className="p-8 text-center text-slate-400">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
