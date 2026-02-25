import React, { useState } from 'react';
import {
    X, Upload, PlusCircle, CheckCircle, AlertCircle,
    List, PackagePlus, ClipboardList
} from 'lucide-react';
import { clsx } from 'clsx';
import { useProducts } from '../hooks/useProducts';
import { useConfig } from '../hooks/useConfig.jsx';

const TABS = [
    { id: 'bulk', label: 'Importar Lista', icon: ClipboardList },
    { id: 'single', label: 'Nuevo Producto', icon: PackagePlus },
];

// ── Spinner inline ────────────────────────────────────────────────────────────
const Spinner = () => (
    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
);

export default function AddProductModal({ onClose, onDone }) {
    const { importProducts, addProduct } = useProducts();
    const { refreshDollarRate } = useConfig();

    const [activeTab, setActiveTab] = useState('bulk');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    // ── Bulk state ────────────────────────────────────────────────────────────
    const [importText, setImportText] = useState('');
    const [importedProducts, setImportedProducts] = useState([]);

    // ── Single state ──────────────────────────────────────────────────────────
    const [form, setForm] = useState({ name: '', priceUsd: '', category: '' });

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleBulkImport = async () => {
        if (!importText.trim()) return;
        setLoading(true);
        setImportedProducts([]);
        await refreshDollarRate();
        const result = await importProducts(importText);
        setLoading(false);
        if (result.success) {
            showStatus('success', result.message || `${result.products?.length ?? 0} productos importados correctamente.`);
            setImportText('');
            setImportedProducts(result.products || []);
            onDone?.();
        } else {
            showStatus('error', result.message || 'Error en la importación.');
        }
    };

    const handleSingleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        const ok = await addProduct({
            name: form.name,
            priceUsd: Number(form.priceUsd),
            category: form.category,
        });
        setLoading(false);
        if (ok) {
            showStatus('success', `"${form.name}" agregado correctamente.`);
            setForm({ name: '', priceUsd: '', category: '' });
            onDone?.();
        } else {
            showStatus('error', 'Error al agregar el producto.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <PlusCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">Agregar Productos</h2>
                    <button
                        onClick={onClose}
                        className="ml-auto p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-6">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => { setActiveTab(id); setStatus({ type: '', message: '' }); setImportedProducts([]); }}
                            className={clsx(
                                'flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                                activeTab === id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Status */}
                {status.message && (
                    <div className={clsx(
                        'mx-6 mt-4 flex items-center gap-2 text-sm px-4 py-3 rounded-xl border',
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

                {/* Body */}
                <div className="p-6">
                    {/* ── Tab: Importar Lista ── */}
                    {activeTab === 'bulk' && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">
                                Pegá la lista de precios. Formatos soportados:{' '}
                                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">▪️ Nombre - $Precio</code>{' '}
                                o CSV{' '}
                                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">Nombre, Precio, Categoría</code>.
                            </p>

                            <textarea
                                className="w-full h-44 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm resize-none transition bg-slate-50"
                                placeholder={`► CELULARES\n▪️ iPhone 15 - $ 850\n▪️ Samsung S24 - $ 700\n\n► LAPTOPS\n▪️ MacBook Air M2 - $ 1200`}
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                            />

                            <div className="flex justify-end">
                                <button
                                    onClick={handleBulkImport}
                                    disabled={loading || !importText.trim()}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition font-medium text-sm shadow-sm"
                                >
                                    {loading ? <><Spinner /> Procesando...</> : <><Upload className="w-4 h-4" /> Procesar y Guardar</>}
                                </button>
                            </div>

                            {/* Preview de resultados */}
                            {importedProducts.length > 0 && (
                                <div className="border-t border-slate-100 pt-4">
                                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                                        <List className="w-4 h-4 text-green-500" />
                                        {importedProducts.length} producto{importedProducts.length !== 1 ? 's' : ''} importado{importedProducts.length !== 1 ? 's' : ''}
                                    </h4>
                                    <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                                                    <th className="px-3 py-2 text-right font-semibold">USD</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-green-600">Precio Final</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {importedProducts.map((p) => (
                                                    <tr key={p.id} className="hover:bg-slate-50 transition">
                                                        <td className="px-3 py-2 font-medium text-slate-800 truncate max-w-[180px]">{p.name}</td>
                                                        <td className="px-3 py-2 text-right font-mono text-slate-500">${p.priceUsd?.toFixed(0)}</td>
                                                        <td className="px-3 py-2 text-right font-mono font-semibold text-green-700">
                                                            ${(p.finalPriceArs ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Tab: Nuevo Producto ── */}
                    {activeTab === 'single' && (
                        <form onSubmit={handleSingleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Nombre del Producto <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ej: iPhone 16 128GB"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Categoría
                                </label>
                                <input
                                    type="text"
                                    placeholder="ej: Celulares"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Precio Costo (USD) <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono bg-slate-50"
                                        value={form.priceUsd}
                                        onChange={(e) => setForm({ ...form, priceUsd: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-medium text-sm shadow-sm shadow-blue-200"
                                >
                                    {loading ? <><Spinner /> Guardando...</> : <><PackagePlus className="w-4 h-4" /> Agregar Producto</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
