import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Login from '../components/Login';
import AdminDashboard from '../components/AdminDashboard';
import { useAuth } from '../hooks/useAuth';
import { List } from 'lucide-react';

export default function Admin() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <Login />
        ) : (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
                <p className="text-slate-500">Gestiona precios, configuración y productos.</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  <List className="w-4 h-4" />
                  Ver Lista de Precios
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
            <AdminDashboard />
          </div>
        )}
      </main>
    </div>
  );
}
