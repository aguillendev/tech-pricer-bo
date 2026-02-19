import React from 'react';
import { X, Printer, Download } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, cartItems, dollarRate, totalArs }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none">

        {/* Header - No Print controls */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 print:hidden">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Vista de Exportación</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152943] transition text-sm sm:text-base"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
              <span className="sm:hidden">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-4 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible flex-1">
          <div className="mb-6 sm:mb-8 text-center border-b pb-4 sm:pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-2">Presupuesto CAH Point</h1>
            <p className="text-slate-500">Fecha: {new Date().toLocaleDateString()}</p>
          </div>

          <table className="w-full text-left mb-8">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 font-semibold text-slate-700">Producto</th>
                <th className="py-2 font-semibold text-slate-700 text-right">Precio Unit. (ARS)</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3 text-slate-800">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.category}</div>
                  </td>
                  <td className="py-3 text-right text-slate-800 font-mono">
                    ${(item.priceUsd * dollarRate).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="py-4 text-xl font-bold text-slate-900 text-right pr-4">Total Final:</td>
                <td className="py-4 text-xl font-bold text-[#1e3a5f] text-right font-mono">
                  ${totalArs.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="text-center text-slate-400 text-sm mt-12 print:mt-auto">
            <p>Presupuesto válido por 24 horas.</p>
            <p>CAH Point</p>
          </div>
        </div>
      </div>
    </div>
  );
}
