import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, Settings, TrendingUp, Percent, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function SidebarNav({ config }) {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  // Formatear números con separador de miles solo cuando sea necesario
  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <div className="hidden lg:block w-72 bg-white rounded-lg border border-slate-200">
      {/* Contenido informativo - Solo en página Admin */}
      {location.pathname === '/admin' && config && (
        <div className="p-4 space-y-4">
          {/* Configuración Global */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Ganancia Global</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-[#1e3a5f]">{config.profitMargin || 30}</span>
              <span className="text-base text-slate-500 ml-1">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Por defecto</p>
          </div>

          {/* Reglas de Ganancia */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <h3 className="font-semibold text-sm text-slate-900 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5 text-[#d4af37]" />
              Reglas
            </h3>
            
            {config.profitRules && config.profitRules.length > 0 ? (
              <div className="space-y-1.5">
                {config.profitRules.map((rule, index) => (
                  <div key={index} className="bg-white rounded p-2 border border-slate-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-slate-600">
                        Regla {index + 1}
                      </span>
                      <span className="text-base font-bold text-[#1e3a5f]">{rule.profitPercent}%</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {rule.operator === 'mayor' ? '>' : '<'} {rule.currency} {formatPrice(rule.priceThreshold)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded p-3 border border-slate-200 text-center">
                <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Sin reglas</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
