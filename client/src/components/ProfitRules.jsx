import React, { useState, useEffect, useCallback } from 'react';
import { Percent, Plus, Trash2, Pencil, Save, X, AlertCircle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { getRules, createRule, updateRule, deleteRule } from '../services/api';

const EMPTY_RULE = { minPriceUsd: '', maxPriceUsd: '', profitPercentage: '', description: '' };

function RangeLabel({ rule }) {
    const from = rule.minPriceUsd != null && rule.minPriceUsd !== '' ? `$${rule.minPriceUsd}` : '$0';
    const to = rule.maxPriceUsd != null && rule.maxPriceUsd !== '' ? `$${rule.maxPriceUsd}` : '∞';
    return (
        <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 font-mono font-medium">
            {from} <ArrowRight className="w-3 h-3" /> {to}
        </span>
    );
}

function RuleForm({ form, onChange, onSubmit, onCancel, submitLabel = 'Guardar' }) {
    return (
        <div>
            <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Desde (USD) <span className="text-slate-400">(vacío = $0)</span>
                    </label>
                    <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="ej: 0"
                        value={form.minPriceUsd}
                        onChange={e => onChange({ ...form, minPriceUsd: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Hasta (USD) <span className="text-slate-400">(vacío = sin límite)</span>
                    </label>
                    <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="ej: 500"
                        value={form.maxPriceUsd}
                        onChange={e => onChange({ ...form, maxPriceUsd: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Ganancia (%) <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        placeholder="ej: 15"
                        value={form.profitPercentage}
                        onChange={e => onChange({ ...form, profitPercentage: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Descripción (opcional)</label>
                <input
                    type="text"
                    placeholder="ej: Productos económicos"
                    value={form.description}
                    onChange={e => onChange({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
            </div>
            <div className="flex gap-3">
                <button
                    type="submit"
                    onClick={onSubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                    <Save className="w-4 h-4" /> {submitLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition text-sm"
                >
                    <X className="w-4 h-4" /> Cancelar
                </button>
            </div>
        </div>
    );
}

function toPayload(form) {
    return {
        minPriceUsd: form.minPriceUsd !== '' ? Number(form.minPriceUsd) : null,
        maxPriceUsd: form.maxPriceUsd !== '' ? Number(form.maxPriceUsd) : null,
        profitPercentage: Number(form.profitPercentage),
        description: form.description || null,
    };
}

function toFormValues(rule) {
    return {
        minPriceUsd: rule.minPriceUsd ?? '',
        maxPriceUsd: rule.maxPriceUsd ?? '',
        profitPercentage: rule.profitPercentage ?? '',
        description: rule.description ?? '',
    };
}

export default function ProfitRules() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_RULE);
    const [showAdd, setShowAdd] = useState(false);
    const [newForm, setNewForm] = useState(EMPTY_RULE);
    const [status, setStatus] = useState({ type: '', message: '' });

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    const fetchRules = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getRules();
            setRules(data);
        } catch {
            showStatus('error', 'No se pudieron cargar las reglas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRules(); }, [fetchRules]);

    // ── Crear ─────────────────────────────────────────────────────────────────
    const handleCreate = async (e) => {
        e?.preventDefault();
        try {
            await createRule(toPayload(newForm));
            showStatus('success', 'Regla creada correctamente.');
            setNewForm(EMPTY_RULE);
            setShowAdd(false);
            fetchRules();
        } catch {
            showStatus('error', 'Error al crear la regla.');
        }
    };

    // ── Editar ────────────────────────────────────────────────────────────────
    const startEdit = (rule) => {
        setEditingId(rule.id);
        setEditForm(toFormValues(rule));
        setShowAdd(false);
    };

    const handleUpdate = async (id) => {
        try {
            await updateRule(id, toPayload(editForm));
            showStatus('success', 'Regla actualizada.');
            setEditingId(null);
            fetchRules();
        } catch {
            showStatus('error', 'Error al actualizar la regla.');
        }
    };

    // ── Eliminar ──────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta regla?')) return;
        try {
            await deleteRule(id);
            showStatus('success', 'Regla eliminada.');
            fetchRules();
        } catch {
            showStatus('error', 'Error al eliminar la regla.');
        }
    };

    return (
        <div className="max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Reglas de Ganancia</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Define rangos de precio en USD con su porcentaje de ganancia correspondiente.
                    </p>
                </div>
                <button
                    onClick={() => { setShowAdd(true); setEditingId(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Nueva regla
                </button>
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                    <strong>Rangos inclusivos:</strong> tanto el valor "desde" como el "hasta" se incluyen.
                    Para evitar superposición entre reglas, definí rangos contiguos:
                    ej. <span className="font-mono bg-amber-100 px-1 rounded">$0–$500</span> y <span className="font-mono bg-amber-100 px-1 rounded">$501–$1000</span>.
                    "Hasta" vacío significa sin límite superior.
                </div>
            </div>

            {/* Status */}
            {status.message && (
                <div className={`mb-5 p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {status.type === 'success'
                        ? <CheckCircle className="w-4 h-4 shrink-0" />
                        : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {status.message}
                </div>
            )}

            {/* Formulario nueva regla */}
            {showAdd && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Nueva Regla
                    </h3>
                    <RuleForm
                        form={newForm}
                        onChange={setNewForm}
                        onSubmit={handleCreate}
                        onCancel={() => { setShowAdd(false); setNewForm(EMPTY_RULE); }}
                        submitLabel="Crear regla"
                    />
                </div>
            )}

            {/* Lista de reglas */}
            {loading ? (
                <div className="text-center py-16 text-slate-400 text-sm animate-pulse">Cargando reglas...</div>
            ) : rules.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                    <Percent className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No hay reglas configuradas</p>
                    <p className="text-slate-400 text-sm mt-1">Se aplicará el porcentaje global a todos los productos.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {rules.map((rule) => (
                        <div key={rule.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                            {editingId === rule.id ? (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Editando regla</p>
                                    <RuleForm
                                        form={editForm}
                                        onChange={setEditForm}
                                        onSubmit={() => handleUpdate(rule.id)}
                                        onCancel={() => setEditingId(null)}
                                        submitLabel="Guardar cambios"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <Percent className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-900 text-xl">{rule.profitPercentage}%</span>
                                                <RangeLabel rule={rule} />
                                            </div>
                                            {rule.description && (
                                                <p className="text-sm text-slate-500">{rule.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => startEdit(rule)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rule.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
