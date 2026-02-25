import React, { useState } from 'react';
import { Lock, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (password === 'admin') {
        login(email);
      } else {
        setError('Credenciales incorrectas. Verificá tu usuario y contraseña.');
      }
    }, 1000);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
      <div className="text-center mb-8">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Acceso Administrativo</h2>
        <p className="text-slate-500 text-sm mt-2">Ingresa tus credenciales para gestionar.</p>
      </div>

      {/* Error inline */}
      {error && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            required
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition ${error ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
              }`}
            placeholder="admin@cahpoint.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
          <input
            type="password"
            required
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition ${error ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
              }`}
            placeholder="••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
