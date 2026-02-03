import React from 'react';
import Header from '../components/Header';
import Login from '../components/Login';
import AdminDashboard from '../components/AdminDashboard';
import { useAuth } from '../hooks/useAuth';

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
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
            <AdminDashboard />
          </div>
        )}
      </main>
    </div>
  );
}

