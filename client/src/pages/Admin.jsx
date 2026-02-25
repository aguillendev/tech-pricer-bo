import React, { useState } from 'react';
import Login from '../components/Login';
import ProductsPanel from '../components/ProductsPanel';
import ConfigPanel from '../components/ConfigPanel';
import { useAuth } from '../hooks/useAuth';
import { clsx } from 'clsx';
import { Database, Settings } from 'lucide-react';

const SUB_TABS = [
  { id: 'products', label: 'Importar Productos', icon: Database },
  { id: 'config', label: 'Configuración', icon: Settings },
];

export default function Admin() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Login />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs del panel admin */}
      <div className="flex gap-2 border-b border-slate-200">
        {SUB_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 -mb-px transition-colors',
              activeTab === id
                ? 'border-blue-600 text-blue-600 bg-blue-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && <ProductsPanel />}
      {activeTab === 'config' && <ConfigPanel />}
    </div>
  );
}
