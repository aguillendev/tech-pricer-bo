import React, { useState } from 'react';
import { Settings, Database, PlusCircle, Save, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useConfig } from '../hooks/useConfig';
import { useProducts } from '../hooks/useProducts';

export default function AdminDashboard() {
    const { config, updateConfig } = useConfig();
    const { addProduct, importProducts } = useProducts();

    const [activeTab, setActiveTab] = useState('config');
    const [status, setStatus] = useState({ type: '', message: '' });

    // Forms State
    const [profitMargin, setProfitMargin] = useState(config.profitMargin || 30);
    const [importText, setImportText] = useState('');
    const [manualProduct, setManualProduct] = useState({ name: '', priceUsd: '', category: '' });
    const [loadingAction, setLoadingAction] = useState(false);
    const [importedProducts, setImportedProducts] = useState([]);

    // Sync profit margin when config loads
    React.useEffect(() => {
        if (config.profitMargin) setProfitMargin(config.profitMargin);
    }, [config.profitMargin]);

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        setLoadingAction(true);
        const success = await updateConfig({ profitMargin: Number(profitMargin) });
        setLoadingAction(false);
        if (success) showStatus('success', 'Configuración actualizada correctamente');
        else showStatus('error', 'Error al actualizar configuración');
    };

    const handleImport = async () => {
        if (!importText.trim()) return;
        setLoadingAction(true);
        setImportedProducts([]); // Clear previous results
        const result = await importProducts(importText);
        setLoadingAction(false);
        if (result.success) {
            showStatus('success', result.message);
            setImportText('');
            setImportedProducts(result.products || []);
        } else {
            showStatus('error', result.message || 'Error en la importación');
        }
    };

    const handleManualAdd = async (e) => {
        e.preventDefault();
        setLoadingAction(true);
        const success = await addProduct({
            name: manualProduct.name,
            priceUsd: Number(manualProduct.priceUsd),
            category: manualProduct.category
        });
        setLoadingAction(false);
        if (success) {
            showStatus('success', 'Producto agregado correctamente');
            setManualProduct({ name: '', priceUsd: '', category: '' });
        } else {
            showStatus('error', 'Error al agregar producto');
        }
    };

    const tabs = [
        { id: 'config', label: 'Configuración', icon: Settings },
        { id: 'import', label: 'Importación Masiva', icon: Database },
        { id: 'manual', label: 'Carga Manual', icon: PlusCircle },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="md:w-64 bg-slate-50 border-r border-slate-100 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Menú Admin</h3>
                <nav className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition",
                                activeTab === tab.id
                                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8">
                {status.message && (
                    <div className={clsx(
                        "mb-6 p-4 rounded-lg flex items-center",
                        status.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                    )}>
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                        {status.message}
                    </div>
                )}

                {/* Config Tab */}
                {activeTab === 'config' && (
                    <div className="max-w-lg">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Configuración General</h2>
                        <form onSubmit={handleUpdateConfig} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Porcentaje de Ganancia Global (%)</label>
                            <div className="flex items-center space-x-4 mb-6">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={profitMargin}
                                    onChange={(e) => setProfitMargin(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <button
                                disabled={loadingAction}
                                className="flex items-center justify-center space-x-2 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loadingAction ? 'Guardando...' : <><Save className="w-4 h-4" /><span>Guardar Cambios</span></>}
                            </button>
                        </form>
                    </div>
                )}

                {/* Import Tab */}
                {activeTab === 'import' && (
                    <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Importación Masiva de Productos</h2>
                        <div className="flex-1 flex flex-col">
                            <p className="text-sm text-slate-500 mb-2">Pega aquí el listado de productos (formato: nombre, precio, categoría).</p>
                            <textarea
                                className="flex-1 w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm resize-none mb-6 min-h-[200px]"
                                placeholder="Laptop Gamer, 850.00, Computación&#10;Mouse RGB, 25.50, Periféricos&#10;Monitor 27, 300.00"
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                            ></textarea>
                            <button
                                onClick={handleImport}
                                disabled={loadingAction || !importText}
                                className="self-end px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50 flex items-center space-x-2"
                            >
                                {loadingAction ? 'Procesando...' : <><Upload className="w-4 h-4" /><span>Procesar y Guardar</span></>}
                            </button>
                        </div>

                        {/* Lista de productos importados */}
                        {importedProducts.length > 0 && (
                            <div className="mt-8 border-t border-slate-200 pt-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    Productos Importados ({importedProducts.length})
                                </h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-left px-4 py-3 font-medium text-slate-600">ID</th>
                                                <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
                                                <th className="text-right px-4 py-3 font-medium text-slate-600">Precio USD</th>
                                                <th className="text-left px-4 py-3 font-medium text-slate-600">Categoría</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {importedProducts.map((product) => (
                                                <tr key={product.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-4 py-3 text-slate-500">{product.id}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                                                    <td className="px-4 py-3 text-right text-blue-600 font-mono">${product.priceUsd.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-slate-600">{product.category}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Manual Add Tab */}
                {activeTab === 'manual' && (
                    <div className="max-w-lg">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Carga Manual de Producto</h2>
                        <form onSubmit={handleManualAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={manualProduct.name}
                                    onChange={e => setManualProduct({ ...manualProduct, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={manualProduct.category}
                                    onChange={e => setManualProduct({ ...manualProduct, category: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Precio USD (Costo)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={manualProduct.priceUsd}
                                    onChange={e => setManualProduct({ ...manualProduct, priceUsd: e.target.value })}
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loadingAction}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {loadingAction ? 'Guardando...' : <><PlusCircle className="w-4 h-4" /><span>Agregar Producto</span></>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
