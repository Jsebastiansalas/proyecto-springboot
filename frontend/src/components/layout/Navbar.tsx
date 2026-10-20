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
  UserPlus
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
    logout 
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const totalCartItems = cart.length;

  return (
    <header className="sticky top-0 z-40 bg-[#181816] border-b border-[#363632] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Marca Industrial */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#D94E1F] flex items-center justify-center font-black text-white text-base shadow-sm group-hover:bg-[#B83D14] transition-colors">
              R
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-[#F5F4F0] leading-none">
                RENTA<span className="text-[#D94E1F]">MAQ</span>
              </div>
              <span className="text-[9px] font-mono tracking-widest uppercase text-[#A8A69E] font-semibold">
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
                  ? 'bg-[#D94E1F] text-white border border-[#B83D14] font-bold shadow-xs'
                  : 'text-[#A8A69E] hover:text-[#F5F4F0] hover:bg-[#232320]'
              }`}
            >
              Inicio
            </button>

            {/* 2. Catálogo */}
            <button
              onClick={() => setActiveView('catalog')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'catalog'
                  ? 'bg-[#D94E1F] text-white border border-[#B83D14] font-bold shadow-xs'
                  : 'text-[#A8A69E] hover:text-[#F5F4F0] hover:bg-[#232320]'
              }`}
            >
              Catálogo de Flota
            </button>

            {/* 3. Mis Alquileres */}
            <button
              onClick={() => setActiveView('client')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'client'
                  ? 'bg-[#D94E1F] text-white border border-[#B83D14] font-bold shadow-xs'
                  : 'text-[#A8A69E] hover:text-[#F5F4F0] hover:bg-[#232320]'
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
            className="relative flex items-center gap-2 px-3.5 py-2 bg-[#D94E1F] hover:bg-[#B83D14] text-white rounded-lg text-xs font-bold border border-[#B83D14] shadow-xs transition-all press-scale"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cotización</span>
            {totalCartItems > 0 && (
              <span className="w-5 h-5 rounded-md bg-[#181816] text-[#F5F4F0] font-mono font-extrabold text-[10px] flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </button>



          {/* Estado de Sesión del Usuario */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#232320] hover:bg-[#2C2C28] border border-[#363632] text-xs font-bold text-[#F5F4F0] transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-[#D94E1F]/20 border border-[#D94E1F]/40 text-[#D94E1F] flex items-center justify-center font-mono text-[11px] font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[120px] truncate">{user.email}</span>
                <ChevronDown className="w-3 h-3 text-[#A8A69E]" />
              </button>

              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-[#232320] rounded-xl border border-[#363632] shadow-2xl py-2 z-50 text-xs"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-[#363632]">
                    <div className="font-bold text-[#F5F4F0] truncate">{user.email}</div>
                    <div className="text-[10px] text-[#D94E1F] font-mono mt-0.5 font-semibold">
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
                      className="w-full text-left px-3.5 py-2.5 text-[#F5F4F0] hover:bg-[#2C2C28] flex items-center gap-2 border-b border-[#363632]"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#B45309]" />
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
                      className="w-full text-left px-3.5 py-2.5 text-[#F5F4F0] hover:bg-[#2C2C28] flex items-center gap-2 border-b border-[#363632]"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-[#1E6F43]" />
                      <span>Panel de Auditoría</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsChangePasswordModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-[#F5F4F0] hover:bg-[#2C2C28] flex items-center gap-2"
                  >
                    <Key className="w-3.5 h-3.5 text-[#D94E1F]" />
                    <span>Cambiar Contraseña</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-[#B91C1C] hover:bg-[#B91C1C]/10 flex items-center gap-2 border-t border-[#363632]"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#B91C1C]" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#232320] hover:bg-[#2C2C28] text-white border border-[#363632] text-xs font-bold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#D94E1F]" />
                <span>Ingresar</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white text-xs font-bold transition-colors shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrarse</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
