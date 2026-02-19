import React, { useState } from 'react';
import { Settings, Database, PlusCircle, Save, Upload, CheckCircle, AlertCircle, TrendingUp, Trash2, Edit2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useConfig } from '../hooks/useConfig.jsx';
import { useProducts } from '../hooks/useProducts';
import ConfirmModal from './ConfirmModal';

export default function AdminDashboard() {
    const { config, updateConfig, refreshDollarRate } = useConfig();
    const { addProduct, importProducts, products } = useProducts();

    const [activeTab, setActiveTab] = useState('config');
    const [status, setStatus] = useState({ type: '', message: '' });

    // Forms State
    const [profitMargin, setProfitMargin] = useState(config.profitMargin || 30);
    const [importText, setImportText] = useState('');
    const [manualProduct, setManualProduct] = useState({ name: '', priceUsd: '', category: '' });
    const [useCustomCategory, setUseCustomCategory] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [importedProducts, setImportedProducts] = useState([]);
    
    // Profit Rules State
    const [profitRules, setProfitRules] = useState(config.profitRules || []);
    const [editingRuleId, setEditingRuleId] = useState(null);
    const [newRule, setNewRule] = useState({
        operator: 'mayor',
        priceThreshold: '',
        currency: 'USD',
        profitPercent: ''
    });

    // Sync profit margin when config loads
    React.useEffect(() => {
        if (config.profitMargin) setProfitMargin(config.profitMargin);
        if (config.profitRules) setProfitRules(config.profitRules);
    }, [config.profitMargin, config.profitRules]);

    // Obtener categorías únicas de productos existentes
    const getUniqueCategories = () => {
        if (!products || products.length === 0) return [];
        const categories = products
            .map(p => p.category)
            .filter(c => c && c.trim() !== '')
            .filter((value, index, self) => self.indexOf(value) === index);
        return categories.sort();
    };

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    };

    // Formatear número con separador de miles (punto) y decimales (coma)
    const formatNumber = (value) => {
        if (!value) return '';
        
        // Remover espacios y limpiar
        let cleaned = value.toString().trim();
        
        // Si termina en coma, preservar la coma para que el usuario pueda seguir escribiendo decimales
        const endsWithComma = cleaned.endsWith(',');
        
        // Remover puntos (separadores de miles existentes) y reemplazar coma por punto para parsear
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        
        const num = parseFloat(cleaned);
        if (isNaN(num)) return '';
        
        // Separar parte entera y decimal
        const parts = cleaned.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] || '';
        
        // Formatear parte entera con separador de miles (punto)
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        // Si el usuario estaba escribiendo decimales, preservar lo que escribió
        if (decimalPart || endsWithComma) {
            return `${formattedInteger},${decimalPart}`;
        }
        
        // Si no hay decimales, agregar ,00
        return `${formattedInteger},00`;
    };

    // Parsear número formateado a valor numérico
    const parseFormattedNumber = (value) => {
        if (!value) return '';
        // Remover puntos (separadores de miles) y convertir coma a punto
        const cleaned = value.replace(/\./g, '').replace(',', '.');
        return cleaned;
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

        // First, refresh dollar rate
        await refreshDollarRate();

        // Then import products
        const result = await importProducts(importText);
        setLoadingAction(false);
        if (result.success) {
            showStatus('success', `${result.message} | Cotización actualizada: $${config.dollarRate}`);
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
            priceUsd: Number(parseFormattedNumber(manualProduct.priceUsd)),
            category: manualProduct.category
        });
        setLoadingAction(false);
        if (success) {
            showStatus('success', 'Producto agregado correctamente');
            setManualProduct({ name: '', priceUsd: '', category: '' });
            setUseCustomCategory(false);
        } else {
            showStatus('error', 'Error al agregar producto');
        }
    };


    const handleAddRule = async () => {
        if (!newRule.priceThreshold || !newRule.profitPercent) {
            showStatus('error', 'Completa todos los campos de la regla');
            return;
        }
        
        setLoadingAction(true);
        let updatedRules;
        let priceThreshold = Number(parseFormattedNumber(newRule.priceThreshold));
        
        // Validación: Detectar reglas duplicadas o conflictivas
        const existingRules = editingRuleId 
            ? profitRules.filter(r => r.id !== editingRuleId)
            : profitRules;
            
        // Verificar si existe una regla con el mismo operador, precio y moneda
        const duplicateRule = existingRules.find(rule => 
            rule.operator === newRule.operator && 
            Math.abs(rule.priceThreshold - priceThreshold) < 0.01 &&
            rule.currency === newRule.currency
        );
        
        if (duplicateRule) {
            setLoadingAction(false);
            showStatus('error', `⚠️ Ya existe una regla con esta condición. Por favor, edita la regla existente en lugar de crear una duplicada.`);
            return;
        }
        
        // Validación adicional: Detectar solapamientos potenciales
        const overlappingRule = existingRules.find(rule => {
            if (rule.currency !== newRule.currency) return false;
            
            const currentOp = newRule.operator;
            const existingOp = rule.operator;
            const currentPrice = priceThreshold;
            const existingPrice = rule.priceThreshold;
            const samePriceRange = Math.abs(existingPrice - currentPrice) < 0.01;
            
            // Detectar operadores que se pisan en el mismo rango de precio
            if (samePriceRange) {
                // Mismo operador con mismo precio
                if (currentOp === existingOp) {
                    return true;
                }
            }
            
            // Detectar solapamientos más complejos
            // Ambas reglas son "menor" con rangos similares
            if (currentOp === 'menor' && existingOp === 'menor' && Math.abs(existingPrice - currentPrice) < 1) {
                return true;
            }
            
            // Ambas reglas son "mayor" con rangos similares
            if (currentOp === 'mayor' && existingOp === 'mayor' && Math.abs(existingPrice - currentPrice) < 1) {
                return true;
            }
            
            return false;
        });
        
        if (overlappingRule) {
            setLoadingAction(false);
            const formattedExisting = overlappingRule.priceThreshold.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            showStatus('error', `⚠️ Esta regla se solapa con una existente (${overlappingRule.operator === 'mayor' ? 'Mayor a' : overlappingRule.operator === 'menor' ? 'Menor a' : 'Igual a'} ${overlappingRule.currency === 'USD' ? 'U$S' : 'ARS $'} ${formattedExisting}). Por favor, edita la regla existente.`);
            return;
        }
        
        // Validación automática para ajustar precios complementarios
        for (const existingRule of existingRules) {
            if (existingRule.currency === newRule.currency && 
                existingRule.priceThreshold === priceThreshold) {
                
                // Si existe una regla "mayor" y estamos agregando "menor", restamos 0.01
                if (existingRule.operator === 'mayor' && newRule.operator === 'menor') {
                    priceThreshold = priceThreshold - 0.01;
                    showStatus('success', `💡 Precio ajustado a ${priceThreshold.toFixed(2)} para complementar regla existente sin solaparse`);
                }
                
                // Si existe una regla "menor" y estamos agregando "mayor", restamos 0.01
                if (existingRule.operator === 'menor' && newRule.operator === 'mayor') {
                    priceThreshold = priceThreshold - 0.01;
                    showStatus('success', `💡 Precio ajustado a ${priceThreshold.toFixed(2)} para complementar regla existente sin solaparse`);
                }
            }
        }
        
        if (editingRuleId) {
            // Editar regla existente
            updatedRules = profitRules.map(rule => 
                rule.id === editingRuleId 
                    ? {
                        id: rule.id,
                        operator: newRule.operator,
                        priceThreshold: priceThreshold,
                        currency: newRule.currency,
                        profitPercent: Number(newRule.profitPercent)
                    }
                    : rule
            );
            setEditingRuleId(null);
        } else {
            // Agregar nueva regla
            const rule = {
                id: Date.now(),
                operator: newRule.operator,
                priceThreshold: priceThreshold,
                currency: newRule.currency,
                profitPercent: Number(newRule.profitPercent)
            };
            updatedRules = [...profitRules, rule];
        }
        
        // Guardar inmediatamente en el backend
        const success = await updateConfig({ profitRules: updatedRules });
        setLoadingAction(false);
        
        if (success) {
            setProfitRules(updatedRules);
            setNewRule({ operator: 'mayor', priceThreshold: '', currency: 'USD', profitPercent: '' });
            showStatus('success', editingRuleId ? 'Regla actualizada' : 'Regla agregada correctamente');
        } else {
            showStatus('error', 'Error al guardar la regla');
        }
    };

    const handleEditRule = (rule) => {
        // Formatear el precio threshold para edición
        const parts = rule.priceThreshold.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const formattedPrice = parts.join(',');
        
        setNewRule({
            operator: rule.operator,
            priceThreshold: formattedPrice,
            currency: rule.currency,
            profitPercent: rule.profitPercent.toString()
        });
        setEditingRuleId(rule.id);
        // Scroll suave al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingRuleId(null);
        setNewRule({ operator: 'mayor', priceThreshold: '', currency: 'USD', profitPercent: '' });
    };

    const handleDeleteRule = async (ruleId) => {
        setLoadingAction(true);
        const updatedRules = profitRules.filter(r => r.id !== ruleId);
        
        // Guardar inmediatamente en el backend
        const success = await updateConfig({ profitRules: updatedRules });
        setLoadingAction(false);
        
        if (success) {
            setProfitRules(updatedRules);
            showStatus('success', 'Regla eliminada correctamente');
            if (editingRuleId === ruleId) {
                handleCancelEdit();
            }
        } else {
            showStatus('error', 'Error al eliminar la regla');
        }
    };

    const tabs = [
        { id: 'config', label: 'Configuración', icon: Settings },
        { id: 'rules', label: 'Reglas de Ganancia', icon: TrendingUp },
        { id: 'import', label: 'Importación Masiva', icon: Database },
        { id: 'manual', label: 'Carga Manual', icon: PlusCircle },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="md:w-64 bg-slate-50 border-b md:border-r md:border-b-0 border-slate-100 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 hidden md:block">Menú Admin</h3>
                <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1 md:space-y-1 md:gap-0 -mx-2 px-2 md:mx-0 md:px-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-3 rounded-lg text-sm font-medium transition whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-white text-[#1e3a5f] shadow-sm ring-1 ring-slate-200"
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
            <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                {status.message && (
                    <div className={clsx(
                        "mb-6 p-4 rounded-lg flex items-center",
                        status.type === 'success' ? "bg-[#BAE6FD] text-[#1e3a5f] border border-sky-300" : "bg-amber-50 text-amber-900 border border-amber-200"
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
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none"
                                />
                            </div>
                            <button
                                disabled={loadingAction}
                                className="flex items-center justify-center space-x-2 w-full bg-[#1e3a5f] text-white py-3 rounded-lg hover:bg-[#152943] transition disabled:opacity-50"
                            >
                                {loadingAction ? 'Guardando...' : <><Save className="w-4 h-4" /><span>Guardar Cambios</span></>}
                            </button>
                        </form>
                    </div>
                )}

                {/* Rules Tab */}
                {activeTab === 'rules' && (
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Reglas de Ganancia</h2>
                        <p className="text-sm text-slate-500 mb-6">Define reglas automáticas basadas en el precio de los productos. Los cambios se guardan automáticamente.</p>
                        
                        {/* Nueva Regla */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-700">
                                    {editingRuleId ? '✏️ Editar Regla' : 'Agregar Nueva Regla'}
                                </h3>
                                {editingRuleId && (
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-xs text-slate-500 hover:text-slate-700 underline"
                                    >
                                        Cancelar edición
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Condición</label>
                                    <select
                                        value={newRule.operator}
                                        onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none text-sm"
                                    >
                                        <option value="menor">Menor a</option>
                                        <option value="mayor">Mayor a</option>
                                        <option value="igual">Igual a</option>
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Precio</label>
                                    <input
                                        type="text"
                                        placeholder="500,00"
                                        value={newRule.priceThreshold}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Permitir solo números, punto y coma (y solo una coma)
                                            if (/^[\d.,]*$/.test(value) && (value.match(/,/g) || []).length <= 1) {
                                                setNewRule({ ...newRule, priceThreshold: value });
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value) {
                                                const formatted = formatNumber(e.target.value);
                                                setNewRule({ ...newRule, priceThreshold: formatted });
                                            }
                                        }}
                                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none text-sm"
                                    />
                                </div>
                                <div className="flex-1 min-w-[100px]">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Moneda</label>
                                    <select
                                        value={newRule.currency}
                                        onChange={(e) => setNewRule({ ...newRule, currency: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none text-sm"
                                    >
                                        <option value="USD">U$S</option>
                                        <option value="ARS">ARS $</option>
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Ganancia (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="15"
                                        value={newRule.profitPercent}
                                        onChange={(e) => setNewRule({ ...newRule, profitPercent: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddRule}
                                    disabled={loadingAction}
                                    className="px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152943] transition text-sm font-medium whitespace-nowrap disabled:opacity-50"
                                >
                                    {loadingAction ? '⏳' : (editingRuleId ? '💾 Guardar' : '+ Agregar')}
                                </button>
                            </div>
                        </div>

                        {/* Lista de Reglas */}
                        {profitRules.length > 0 && (
                            <div className="mb-6">
                                <div className="bg-gradient-to-r from-[#1e3a5f] to-[#152943] rounded-t-xl p-4 flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Reglas Activas ({profitRules.length})
                                    </h3>
                                </div>
                                <div className="bg-white border-2 border-[#d4af37] rounded-b-xl p-4 space-y-3">
                                    {profitRules.map((rule) => {
                                        // Formatear precio con separador de miles
                                        const parts = rule.priceThreshold.toFixed(2).split('.');
                                        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                                        const formattedPrice = parts.join(',');
                                        
                                        return (
                                            <div key={rule.id} className="bg-gradient-to-r from-slate-50 to-[#BAE6FD]/30 border-2 border-sky-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md hover:border-sky-300 transition-all">
                                                <div className="flex items-center space-x-4">
                                                    <div className="bg-[#1e3a5f] text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm">
                                                        {rule.operator === 'mayor' ? '>' : rule.operator === 'menor' ? '<' : '='}
                                                    </div>
                                                    <p className="text-sm text-slate-800 font-medium">
                                                        Precio <span className="font-bold text-[#1e3a5f]">
                                                            {rule.operator === 'mayor' ? 'mayor a' : rule.operator === 'menor' ? 'menor a' : 'igual a'}
                                                        </span>{' '}
                                                        <span className="font-bold text-[#1e3a5f] bg-[#BAE6FD] px-2 py-1 rounded">
                                                            {rule.currency === 'USD' ? 'U$S' : 'ARS $'} {formattedPrice}
                                                        </span>
                                                        {' '}→ Ganancia: <span className="font-bold text-[#d4af37] bg-[#BAE6FD] px-2 py-1 rounded">{rule.profitPercent}%</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditRule(rule)}
                                                        className="text-[#1e3a5f] hover:text-white hover:bg-[#1e3a5f] p-2 rounded-lg transition-all"
                                                        title="Editar regla"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRule(rule.id)}
                                                        className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all"
                                                        title="Eliminar regla"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {profitRules.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">No hay reglas definidas. Agrega una regla para comenzar.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Import Tab */}
                {activeTab === 'import' && (
                    <div className="h-full flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Importación Masiva de Productos</h2>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <p className="text-sm text-slate-500 mb-2">Pega aquí el listado de productos (formato: nombre, precio, categoría).</p>
                            <textarea
                                className="flex-1 w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none font-mono text-sm resize-none mb-6 min-h-[200px]"
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
                                    <CheckCircle className="w-5 h-5 text-[#d4af37] mr-2" />
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
                                                    <td className="px-4 py-3 text-right text-[#1e3a5f] font-mono">${product.priceUsd.toFixed(2)}</td>
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
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none"
                                    value={manualProduct.name}
                                    onChange={e => setManualProduct({ ...manualProduct, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                {!useCustomCategory ? (
                                    <div className="space-y-2">
                                        <select
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none bg-white"
                                            value={manualProduct.category}
                                            onChange={e => {
                                                if (e.target.value === '__custom__') {
                                                    setUseCustomCategory(true);
                                                    setManualProduct({ ...manualProduct, category: '' });
                                                } else {
                                                    setManualProduct({ ...manualProduct, category: e.target.value });
                                                }
                                            }}
                                        >
                                            <option value="">Selecciona una categoría...</option>
                                            {getUniqueCategories().map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="__custom__" className="font-semibold text-[#1e3a5f]">✏️ Agregar categoría nueva...</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Escribe el nombre de la nueva categoría"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none"
                                            value={manualProduct.category}
                                            onChange={e => setManualProduct({ ...manualProduct, category: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseCustomCategory(false);
                                                setManualProduct({ ...manualProduct, category: '' });
                                            }}
                                            className="text-sm text-slate-500 hover:text-slate-700 underline"
                                        >
                                            ← Volver a categorías existentes
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Precio USD (Costo)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="1.250,00"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1e3a5f] outline-none"
                                    value={manualProduct.priceUsd}
                                    onChange={e => {
                                        const value = e.target.value;
                                        // Permitir solo números, punto y coma (y solo una coma)
                                        if (/^[\d.,]*$/.test(value) && (value.match(/,/g) || []).length <= 1) {
                                            setManualProduct({ ...manualProduct, priceUsd: value });
                                        }
                                    }}
                                    onBlur={e => {
                                        if (e.target.value) {
                                            const formatted = formatNumber(e.target.value);
                                            setManualProduct({ ...manualProduct, priceUsd: formatted });
                                        }
                                    }}
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loadingAction}
                                    className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg hover:bg-[#152943] transition disabled:opacity-50 flex items-center justify-center space-x-2"
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
