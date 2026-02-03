import React from 'react';
import { useConfig } from '../hooks/useConfig';
import { useAuth } from '../hooks/useAuth';
import { DollarSign, Monitor, Lock, UserCheck, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { config, loading } = useConfig();
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
          <Monitor className="text-blue-400 w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">Tech<span className="text-blue-400">Pricer</span></h1>
        </Link>

        {/* Dollar Rate Display */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cotización Dólar</span>
            <div className="flex items-center text-green-400 font-mono text-lg font-bold">
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
            <span className="text-green-400 font-bold font-mono">
              {loading ? '...' : `$${config.dollarRate?.toFixed(0)}`}
            </span>
          </div>

          {/* Auth Status */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/admin"
                className="flex items-center space-x-2 bg-green-600/20 text-green-400 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.name || 'Admin'}</span>
              </Link>
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

