import React, { useState } from 'react';
import {
    Database, PlusCircle, Upload, CheckCircle, AlertCircle, LayoutList
} from 'lucide-react';
import { clsx } from 'clsx';
import { useConfig } from '../hooks/useConfig.jsx';
import { useProducts } from '../hooks/useProducts';

const SUB_TABS = [
    { id: 'import', label: 'Importación Masiva', icon: Database },
    { id: 'manual', label: 'Carga Manual', icon: PlusCircle },
];

export default function ProductsPanel() {
    const { config, refreshDollarRate } = useConfig();
    const { addProduct, importProducts } = useProducts();

    const [subTab, setSubTab] = useState('import');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    // Import state
    const [importText, setImportText] = useState('');
    const [importedProducts, setImportedProducts] = useState([]);

    // Manual state
    const [manual, setManual] = useState({ name: '', priceUsd: '', category: '' });

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    };

    const handleImport = async () => {
        if (!importText.trim()) return;
        setLoading(true);
        setImportedProducts([]);
        await refreshDollarRate();
        const result = await importProducts(importText);
        setLoading(false);
        if (result.success) {
            showStatus('success', result.message);
            setImportText('');
            setImportedProducts(result.products || []);
        } else {
            showStatus('error', result.message || 'Error en la importación.');
        }
    };

    const handleManualAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        const ok = await addProduct({
            name: manual.name,
            priceUsd: Number(manual.priceUsd),
            category: manual.category,
        });
        setLoading(false);
        if (ok) {
            showStatus('success', 'Producto agregado correctamente.');
            setManual({ name: '', priceUsd: '', category: '' });
        } else {
            showStatus('error', 'Error al agregar el producto.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <LayoutList className="w-6 h-6 text-blue-600" />
                    Productos
                </h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Importá productos en bloque o agregá uno a la vez.
                </p>
            </div>

            {/* Status */}
            {status.message && (
                <div className={clsx(
                    'flex items-center gap-2 text-sm px-4 py-3 rounded-xl border',
                    status.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                )}>
                    {status.type === 'success'
                        ? <CheckCircle className="w-4 h-4 shrink-0" />
                        : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {status.message}
                </div>
            )}

            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-0">
                {SUB_TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setSubTab(id)}
                        className={clsx(
                            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-colors',
                            subTab === id
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Importación Masiva ── */}
            {subTab === 'import' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <p className="text-sm text-slate-500">
                        Pegá el listado de productos. Formatos soportados: símbolo{' '}
                        <code className="bg-slate-100 px-1 rounded text-xs">▪️ Nombre - $Precio</code>,
                        o CSV <code className="bg-slate-100 px-1 rounded text-xs">Nombre, Precio, Categoría</code>.
                    </p>
                    <textarea
                        className="w-full h-52 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm resize-none transition"
                        placeholder={`► CELULARES\n▪️ iPhone 15 - $ 850\n▪️ Samsung S24 - $ 700\n\n► LAPTOPS\n▪️ MacBook Air M2 - $ 1200`}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleImport}
                            disabled={loading || !importText.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition font-medium text-sm shadow-sm"
                        >
                            {loading ? 'Procesando...' : <><Upload className="w-4 h-4" /> Procesar y Guardar</>}
                        </button>
                    </div>

                    {/* Resultado del import */}
                    {importedProducts.length > 0 && (
                        <div className="border-t border-slate-100 pt-5">
                            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {importedProducts.length} producto{importedProducts.length !== 1 ? 's' : ''} importado{importedProducts.length !== 1 ? 's' : ''}
                            </h3>
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left font-semibold">Nombre</th>
                                            <th className="px-4 py-2.5 text-right font-semibold">USD</th>
                                            <th className="px-4 py-2.5 text-right font-semibold">Precio Final ARS</th>
                                            <th className="px-4 py-2.5 text-left font-semibold">Categoría</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {importedProducts.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition">
                                                <td className="px-4 py-2.5 font-medium text-slate-900">{p.name}</td>
                                                <td className="px-4 py-2.5 text-right text-slate-500 font-mono">
                                                    ${p.priceUsd?.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-700">
                                                    ${(p.finalPriceArs ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-500">{p.category}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Carga Manual ── */}
            {subTab === 'manual' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <form onSubmit={handleManualAdd} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Nombre del Producto <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="ej: iPhone 16 128GB"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                                value={manual.name}
                                onChange={(e) => setManual({ ...manual, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Categoría
                            </label>
                            <input
                                type="text"
                                placeholder="ej: Celulares"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                                value={manual.category}
                                onChange={(e) => setManual({ ...manual, category: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Precio USD (Costo) <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900 font-mono"
                                    value={manual.priceUsd}
                                    onChange={(e) => setManual({ ...manual, priceUsd: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-medium text-sm shadow-sm shadow-blue-200"
                            >
                                <PlusCircle className="w-4 h-4" />
                                {loading ? 'Guardando...' : 'Agregar Producto'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
