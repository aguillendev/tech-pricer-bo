import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import {
    Monitor, LayoutList, Settings, LogOut, ChevronRight, X, Menu, UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
    { id: 'products', label: 'Productos', icon: LayoutList },
    { id: 'config', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({ activeTab, onTabChange, children }) {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleNav = (id) => {
        onTabChange(id);
        setMobileOpen(false);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="px-6 py-5 border-b border-slate-800">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
                    <Monitor className="text-blue-400 w-5 h-5" />
                    <span className="text-white text-lg font-bold tracking-tight">
                        Tech<span className="text-blue-400">Pricer</span>
                    </span>
                </Link>
                <p className="text-xs text-slate-500 mt-1">Panel de Administración</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-5 space-y-1">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-3">
                    Menú
                </p>
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => handleNav(id)}
                        className={clsx(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                            activeTab === id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        {label}
                        {activeTab === id && (
                            <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
                        )}
                    </button>
                ))}
            </nav>

            {/* User / Logout */}
            <div className="px-3 py-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-slate-500">Administrador</p>
                    </div>
                    <button
                        onClick={logout}
                        title="Cerrar sesión"
                        className="p-1.5 text-slate-500 hover:text-red-400 transition rounded-lg hover:bg-red-400/10"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* ── Sidebar Desktop (fijo, siempre visible) ── */}
            <aside className="hidden lg:flex w-60 bg-slate-900 flex-col fixed inset-y-0 left-0 z-30 shadow-xl">
                <SidebarContent />
            </aside>

            {/* ── Sidebar Mobile (drawer) ── */}
            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            {/* Drawer */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Close button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                >
                    <X className="w-5 h-5" />
                </button>
                <SidebarContent />
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
                {/* Mobile topbar */}
                <header className="lg:hidden bg-slate-900 text-white h-14 flex items-center px-4 gap-3 shadow-md sticky top-0 z-30">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 rounded-lg hover:bg-slate-700 transition"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <Monitor className="text-blue-400 w-5 h-5" />
                    <span className="font-bold">
                        Tech<span className="text-blue-400">Pricer</span>
                    </span>
                    <span className="ml-auto text-slate-400 text-sm font-medium capitalize">
                        {NAV_ITEMS.find(i => i.id === activeTab)?.label}
                    </span>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
