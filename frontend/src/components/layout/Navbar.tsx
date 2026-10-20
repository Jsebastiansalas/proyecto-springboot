import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Key, 
  LogOut, 
  Building2, 
  ShieldAlert, 
  ChevronDown, 
  Layers,
  HardHat
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { 
    user, 
    activeView, 
    setActiveView, 
    cart, 
    setIsQuoteDrawerOpen, 
    setIsCommandPaletteOpen, 
    setIsAuthModalOpen,
    setIsChangePasswordModalOpen,
    quickDemoLogin,
    logout 
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  const totalCartItems = cart.length;

  return (
    <header className="sticky top-0 z-40 bg-obsidian-900/90 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Marca Industrial */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white leading-none">
                RENTA<span className="text-indigo-400">MAQ</span>
              </div>
              <span className="text-[9px] font-mono tracking-widest uppercase text-obsidian-400 font-semibold">
                Heavy Fleet & Tools
              </span>
            </div>
          </button>

          {/* Navegación Principal: 3 Apartados Principales */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            {/* 1. Inicio */}
            <button
              onClick={() => setActiveView('home')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'home'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold shadow-sm'
                  : 'text-obsidian-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Inicio
            </button>

            {/* 2. Catálogo */}
            <button
              onClick={() => setActiveView('catalog')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'catalog'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold shadow-sm'
                  : 'text-obsidian-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Catálogo de Flota
            </button>

            {/* 3. Mis Alquileres */}
            <button
              onClick={() => setActiveView('client')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'client'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold shadow-sm'
                  : 'text-obsidian-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Mis Alquileres
            </button>

          </nav>
        </div>

        {/* Acciones del Usuario & Carrito de Obra */}
        <div className="flex items-center gap-2.5">
          {/* Botón Cotizador / Carrito de Obra */}
          <button
            type="button"
            onClick={() => setIsQuoteDrawerOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all press-scale"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cotización</span>
            {totalCartItems > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-indigo-900 font-extrabold text-[10px] flex items-center justify-center animate-pulse">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Menú de Roles Demo (Acceso Rápido) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDemoMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-obsidian-300 border border-white/10 text-xs font-semibold transition-colors"
              title="Perfiles Demostrativos"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Roles Demo</span>
              <ChevronDown className="w-3 h-3 text-obsidian-400" />
            </button>

            {isDemoMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-52 bg-obsidian-850 rounded-2xl border border-white/10 shadow-2xl py-2 z-50 text-xs"
                onMouseLeave={() => setIsDemoMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-obsidian-400 border-b border-white/5">
                  Cambiar Perfil de Prueba
                </div>
                <button
                  type="button"
                  onClick={() => {
                    quickDemoLogin('ROLE_CLIENTE');
                    setIsDemoMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-obsidian-200 flex items-center gap-2"
                >
                  <HardHat className="w-3.5 h-3.5 text-indigo-400" />
                  <div>
                    <div className="font-bold">Contratista Demo</div>
                    <div className="text-[10px] text-obsidian-400">Constructora Andina</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    quickDemoLogin('ROLE_PROVEEDOR');
                    setIsDemoMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-obsidian-200 flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <div className="font-bold">Proveedor Demo</div>
                    <div className="text-[10px] text-obsidian-400">Ferretools SAS</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    quickDemoLogin('ROLE_ADMIN');
                    setIsDemoMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-obsidian-200 flex items-center gap-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <div>
                    <div className="font-bold">Administrador Demo</div>
                    <div className="text-[10px] text-obsidian-400">Superintendencia Obra</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Estado de Sesión del Usuario */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 border border-white/10 text-xs font-bold text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-mono text-[11px]">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[120px] truncate">{user.email}</span>
                <ChevronDown className="w-3 h-3 text-obsidian-400" />
              </button>

              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-obsidian-850 rounded-2xl border border-white/10 shadow-2xl py-2 z-50 text-xs"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-white/5">
                    <div className="font-bold text-white truncate">{user.email}</div>
                    <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                      {user.role}
                    </div>
                  </div>

                  {user.role === 'ROLE_PROVEEDOR' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveView('provider');
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-obsidian-200 hover:bg-white/5 flex items-center gap-2 border-b border-white/5"
                    >
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Panel de Proveedor</span>
                    </button>
                  )}

                  {user.role === 'ROLE_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveView('admin');
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-obsidian-200 hover:bg-white/5 flex items-center gap-2 border-b border-white/5"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Panel de Auditoría</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsChangePasswordModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-obsidian-200 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cambiar Contraseña</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 border-t border-white/5"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-white border border-white/10 text-xs font-bold transition-colors"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Iniciar Sesión</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
