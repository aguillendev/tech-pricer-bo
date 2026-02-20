import React from 'react';
import { Trash2, FileText, ChevronRight, ShoppingCart } from 'lucide-react';
import { clsx } from 'clsx';

export default function CartSummary({ cartItems, dollarRate, onRemoveItem, onExport }) {
  const totalUsd = cartItems.reduce((acc, item) => acc + item.priceUsd, 0);
  const totalArs = totalUsd * dollarRate;

  const [isOpen, setIsOpen] = React.useState(false); // Mobile toggle

  // Auto-open on desktop if items added? handled by parent or just CSS layout.
  // We'll use a fixed positioning approach.

  if (cartItems.length === 0) {
    return (
        <div className="hidden lg:flex flex-col w-80 bg-white border-l border-slate-200 p-6 h-[calc(100vh-64px)] sticky top-16">
            <div className="text-center text-slate-400 mt-10">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tu presupuesto está vacío</p>
                <p className="text-sm mt-2">Agrega productos de la lista.</p>
            </div>
        </div>
    );
  }

  return (
    <>
      {/* Mobile Toggle / Floating Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-40">
        <div className="flex items-center justify-between">
          <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Presupuesto</span>
            <span className="text-xl font-bold text-blue-600 font-mono">
                ${totalArs.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-slate-400">{cartItems.length} ítems</span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/30"
          >
            Ver Detalle
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop: Static/Sticky, Mobile: Fixed Overlay) */}
      <div className={clsx(
        "fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:transform-none lg:static lg:w-80 lg:shadow-none lg:border-l lg:border-slate-200 lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 lg:bg-white">
          <h2 className="font-bold text-lg text-slate-800 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Mi Presupuesto
          </h2>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-start justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-medium text-slate-900 truncate">{item.name}</p>
                <p className="text-sm text-slate-500 font-mono">
                  ${(item.priceUsd * dollarRate).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-between items-end mb-2">
            <span className="text-slate-500 font-medium">Total Estimado</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono mb-6">
            ${totalArs.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </div>

          <button
            onClick={onExport}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 flex items-center justify-center space-x-2 transition transform active:scale-[0.98]"
          >
            <FileText className="w-5 h-5" />
            <span>Exportar Presupuesto</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
