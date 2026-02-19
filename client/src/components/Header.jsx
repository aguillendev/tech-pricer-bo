import React from 'react';
import { useConfig } from '../hooks/useConfig.jsx';
import { useAuth } from '../hooks/useAuth';
import { DollarSign, Monitor, Lock, UserCheck, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { config, loading } = useConfig();
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <header className="bg-[#1e3a5f] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <Monitor className="text-[#d4af37] w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">CAH <span className="text-[#d4af37]">Point</span></h1>
          </Link>
        </div>

        {/* Dollar Rate Display (only for logged in users) */}
        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cotización Dólar</span>
                <div className="flex items-center text-[#d4af37] font-mono text-lg font-bold" title={config.lastDollarUpdate ? `Actualizado: ${new Date(config.lastDollarUpdate).toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' })}` : ''}>
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>{config.dollarRate?.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile visible minimal rate */}
              <div className="md:hidden flex items-center bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <span className="text-xs text-slate-400 mr-2">USD</span>
                <span className="text-[#d4af37] font-bold font-mono">
                  {loading ? '...' : `$${config.dollarRate?.toFixed(0)}`}
                </span>
              </div>
            </>
          )}

          {/* Auth Status */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-[#BAE6FD]/40 text-[#1e3a5f] px-3 py-1.5 rounded-full text-sm font-medium">
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.name || 'Admin'}</span>
              </div>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-red-400 transition p-1.5 rounded-full hover:bg-slate-800"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition text-sm"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

