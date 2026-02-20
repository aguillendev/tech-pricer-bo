import React from 'react';
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

      <main className="flex-1 container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <Login />
        ) : (
          <div className="animate-fade-in flex flex-col lg:flex-row gap-6 relative">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Panel de Administración</h1>
                <p className="text-slate-500">Gestiona precios, configuración y productos.</p>
              </div>
              <AdminDashboard />
            </div>
            
            {/* Sidebar Navigation */}
            <SidebarNav config={config} />
          </div>
        )}
      </main>
    </div>
  );
}
