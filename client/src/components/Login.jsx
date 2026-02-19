import React, { useState } from 'react';
import { Lock, ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Simple mock validation
      if (password === 'admin') {
        login(email);
      } else {
        alert('Credenciales incorrectas (prueba con cualquier email y pass: admin)');
      }
    }, 1000);
  };

  return (
    <div className="min-h-[70vh] py-4 md:py-8 flex items-center justify-center">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-4 sm:mb-6">
          <div className="bg-[#BAE6FD] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-[#1e3a5f]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Acceso Administrativo</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Ingresa tus credenciales para gestionar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#d4af37] outline-none text-sm"
              placeholder="admin@cahpoint.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#d4af37] outline-none text-sm"
              placeholder="••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a5f] text-white py-2.5 sm:py-3 rounded-lg font-bold hover:bg-[#152943] transition disabled:opacity-50 shadow-lg shadow-[#1e3a5f]/30 text-sm sm:text-base"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        {/* Separador */}
        <div className="relative my-4 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">o</span>
          </div>
        </div>

        {/* Botón para acceder como cliente */}
        <div className="bg-gradient-to-br from-[#BAE6FD] to-[#d4af37]/30 p-1 rounded-xl">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white hover:bg-gradient-to-br hover:from-[#d4af37] hover:to-[#d4af37]/90 text-[#1e3a5f] hover:text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold transition-all duration-300 shadow-lg group"
          >
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-0.5 sm:mb-1">
              <div className="bg-[#BAE6FD] group-hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-base sm:text-lg">INGRESO COMO CLIENTE</span>
            </div>
            <p className="text-[10px] sm:text-xs opacity-75 group-hover:opacity-100 transition-opacity">
              Accede al listado de productos y crea tu presupuesto en el momento
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
