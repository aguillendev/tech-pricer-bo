import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, Settings, TrendingUp, Percent, AlertCircle } from 'lucide-react';

export default function SidebarNav({ config }) {
  const location = useLocation();

  // Formatear números con separador de miles solo cuando sea necesario
  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <div className="hidden lg:flex flex-col w-96 bg-white border-l border-slate-200 h-[calc(100vh-64px)] sticky top-16">
      {/* Header de navegación */}
      <div className="px-4 pt-5 pb-8 border-b border-slate-200 bg-slate-50">
        <nav className="flex items-center space-x-2">
          <Link
            to="/"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center ${
              location.pathname === '/' 
                ? 'bg-[#d4af37] text-[#1e3a5f] font-semibold' 
                : 'text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-100'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Lista de Precios</span>
          </Link>
          <Link
            to="/admin"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center ${
              location.pathname === '/admin' 
                ? 'bg-[#d4af37] text-[#1e3a5f] font-semibold' 
                : 'text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Administración</span>
          </Link>
        </nav>
      </div>

      {/* Contenido informativo - Solo en página Admin */}
      {location.pathname === '/admin' && config && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Configuración Global */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Ganancia Global</p>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#1e3a5f]">{config.profitMargin || 30}</span>
              <span className="text-lg text-slate-500 ml-1">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Por defecto, si no aplican las reglas</p>
          </div>

          {/* Reglas de Ganancia */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#d4af37]" />
              Reglas de Ganancia
            </h3>
            
            {config.profitRules && config.profitRules.length > 0 ? (
              <div className="space-y-2">
                {config.profitRules.map((rule, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-600">
                        Regla {index + 1}
                      </span>
                      <span className="text-lg font-bold text-[#1e3a5f]">{rule.profitPercent}%</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Si precio {rule.operator === 'mayor' ? 'mayor a' : 'menor a'} {rule.currency} {formatPrice(rule.priceThreshold)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No hay reglas configuradas</p>
                <p className="text-xs text-slate-400 mt-1">Las reglas se mostrarán aquí</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
