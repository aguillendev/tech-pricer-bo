import React, { useState } from 'react';
import { Save, CheckCircle, AlertCircle, Settings, Percent } from 'lucide-react';
import { useConfig } from '../hooks/useConfig.jsx';
import ProfitRules from './ProfitRules';

export default function ConfigPanel() {
    const { config, updateConfig } = useConfig();

    const [profitMargin, setProfitMargin] = useState(config.profitMargin || 0);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Sync when config loads from API
    React.useEffect(() => {
        if (config.profitMargin != null) setProfitMargin(config.profitMargin);
    }, [config.profitMargin]);

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const ok = await updateConfig({ profitMargin: Number(profitMargin) });
        setSaving(false);
        if (ok) showStatus('success', 'Porcentaje global actualizado correctamente.');
        else showStatus('error', 'Error al guardar la configuración.');
    };

    return (
        <div className="space-y-10">
            {/* ── Título de sección ── */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-blue-600" />
                    Configuración
                </h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Ajustá el margen de ganancia global y las reglas de precios por tramo.
                </p>
            </div>

            {/* ── Ganancia Global ── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Percent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Ganancia Global</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Se aplica cuando ninguna regla por tramo coincide con el producto.
                        </p>
                    </div>
                </div>

                {status.message && (
                    <div className={`mb-4 flex items-center gap-2 text-sm px-4 py-3 rounded-lg border ${status.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {status.type === 'success'
                            ? <CheckCircle className="w-4 h-4 shrink-0" />
                            : <AlertCircle className="w-4 h-4 shrink-0" />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSave} className="flex items-end gap-4 max-w-sm">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Porcentaje (%)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="9999"
                                required
                                value={profitMargin}
                                onChange={(e) => setProfitMargin(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-lg font-semibold transition"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-medium text-sm shadow-sm shadow-blue-200"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </form>
            </section>

            {/* ── Reglas de Ganancia por Tramo ── */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <ProfitRules />
            </section>
        </div>
    );
}
