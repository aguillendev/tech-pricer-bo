import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
    Monitor, LayoutList, Settings, LogOut, Menu, X,
    UserCheck, Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AppLayout({ children }) {
    const { isLoggedIn, user, logout } = useAuth();
    const location = useLocation();
    const [expanded, setExpanded] = useState(true);   // desktop: expand/collapse
    const [mobileOpen, setMobileOpen] = useState(false); // mobile: drawer open

    const NAV_ITEMS = [
        { to: '/', label: 'Productos', icon: LayoutList, always: true },
        { to: '/admin', label: 'Configuración', icon: Settings, always: false }, // solo admin
    ];

    const visibleItems = NAV_ITEMS.filter(item => item.always || isLoggedIn);

    const isActive = (to) =>
        to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

    // ── Sidebar content (reusable en desktop y mobile) ──────────────────────────
    const SidebarInner = ({ compact = false }) => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className={clsx(
                'flex items-center gap-3 border-b border-slate-800 transition-all duration-200',
                compact ? 'px-3 py-4 justify-center' : 'px-5 py-4'
            )}>
                <Monitor className="text-blue-400 w-6 h-6 shrink-0" />
                {!compact && (
                    <span className="text-white text-lg font-bold tracking-tight leading-none">
                        Tech<span className="text-blue-400">Pricer</span>
                    </span>
                )}
            </div>

            {/* Nav items */}
            <nav className={clsx('flex-1 py-4 space-y-1', compact ? 'px-2' : 'px-3')}>
                {!compact && (
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2 mb-3">
                        Menú
                    </p>
                )}
                {visibleItems.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        title={compact ? label : undefined}
                        className={clsx(
                            'flex items-center rounded-xl transition-all duration-150 font-medium text-sm',
                            compact ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                            isActive(to)
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        {!compact && label}
                    </Link>
                ))}
            </nav>

            {/* Footer: usuario / login */}
            <div className={clsx('border-t border-slate-800 py-3', compact ? 'px-2' : 'px-3')}>
                {isLoggedIn ? (
                    <div className={clsx(
                        'flex items-center rounded-xl bg-slate-800',
                        compact ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                    )}>
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        {!compact && (
                            <>
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
                            </>
                        )}
                    </div>
                ) : (
                    <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        title={compact ? 'Iniciar sesión' : undefined}
                        className={clsx(
                            'flex items-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition text-sm',
                            compact ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                        )}
                    >
                        <Lock className="w-4 h-4 shrink-0" />
                        {!compact && 'Iniciar Sesión'}
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* ═══ SIDEBAR DESKTOP ═══ */}
            <aside className={clsx(
                'hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-slate-900 shadow-xl transition-all duration-300 ease-in-out',
                expanded ? 'w-56' : 'w-16'
            )}>
                <SidebarInner compact={!expanded} />
            </aside>

            {/* ═══ SIDEBAR MOBILE — overlay + drawer ═══ */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            <aside className={clsx(
                'fixed inset-y-0 left-0 z-50 w-56 bg-slate-900 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Botón cerrar (X) en mobile */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-3.5 right-3 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition z-10"
                >
                    <X className="w-5 h-5" />
                </button>
                <SidebarInner compact={false} />
            </aside>

            {/* ═══ CONTENIDO PRINCIPAL ═══ */}
            <div className={clsx(
                'flex-1 flex flex-col min-h-screen transition-all duration-300',
                'lg:ml-16', // mínimo siempre por el sidebar compacto
                expanded && 'lg:ml-56'  // cuando está expandido
            )}>
                {/* ── Topbar ── */}
                <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 gap-3 sticky top-0 z-20 shadow-sm">
                    {/* Hamburguesa — siempre visible */}
                    <button
                        onClick={() => {
                            if (window.innerWidth >= 1024) setExpanded(prev => !prev);
                            else setMobileOpen(prev => !prev);
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Brand solo en mobile */}
                    <div className="lg:hidden flex items-center gap-2">
                        <Monitor className="text-blue-500 w-5 h-5" />
                        <span className="font-bold text-slate-900">
                            Tech<span className="text-blue-500">Pricer</span>
                        </span>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Acceso rápido admin en topbar (mobile) */}
                    {isLoggedIn ? (
                        <div className="flex items-center gap-2 lg:hidden">
                            <span className="text-xs font-medium text-slate-600 hidden sm:block">
                                {user?.name || 'Admin'}
                            </span>
                            <button
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-red-500 transition rounded-xl hover:bg-red-50"
                                title="Cerrar sesión"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/admin"
                            className="lg:hidden flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition"
                        >
                            <Lock className="w-3.5 h-3.5" />
                            <span className="hidden sm:block">Admin</span>
                        </Link>
                    )}
                </header>

                {/* ── Página ── */}
                <main className="flex-1 p-5 lg:p-7">
                    {children}
                </main>
            </div>
        </div>
    );
}
