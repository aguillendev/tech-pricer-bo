import React from 'react';
import { Link } from 'react-router-dom';
import { List, Settings } from 'lucide-react';
import Header from '../components/Header';
import Login from '../components/Login';
import AdminDashboard from '../components/AdminDashboard';
import SidebarNav from '../components/SidebarNav';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig.jsx';

export default function Admin() {
  const { isLoggedIn } = useAuth();
  const { config } = useConfig();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Navegación Móvil - Solo si está logueado */}
      {isLoggedIn && (
        <div className="lg:hidden bg-white border-b border-slate-200 sticky top-16 z-40">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-100"
              >
                <List className="w-4 h-4" />
                <span>Lista de Precios</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition flex-1 justify-center bg-[#d4af37] text-[#1e3a5f] font-semibold"
              >
                <Settings className="w-4 h-4" />
                <span>Administración</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <Login />
        ) : (
          <div className="animate-fade-in">
            {/* Título + Botones en la misma línea - TODO EL ANCHO */}
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Panel de Administración</h1>
                <p className="text-slate-500">Gestiona precios, configuración y productos.</p>
              </div>
              {/* Botones de navegación desktop */}
              <nav className="hidden lg:flex items-center space-x-2">
                <Link
                  to="/"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-100"
                >
                  <List className="w-4 h-4" />
                  <span>Lista de Precios</span>
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-[#d4af37] text-[#1e3a5f] font-semibold"
                >
                  <Settings className="w-4 h-4" />
                  <span>Administración</span>
                </Link>
              </nav>
            </div>

            {/* Contenido en dos columnas */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <AdminDashboard />
              </div>
              
              {/* Sidebar Navigation */}
              <SidebarNav config={config} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
