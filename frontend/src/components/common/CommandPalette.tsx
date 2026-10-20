import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { Tool } from '../../types';
import { 
  Search, 
  Home,
  Wrench, 
  FileText, 
  Shield, 
  UserCheck, 
  Truck, 
  SlidersHorizontal, 
  ArrowRight, 
  X,
  Sparkles,
  KeyRound,
  LogOut,
  Layers
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveView,
    quickDemoLogin,
    setIsQuoteDrawerOpen,
    setSelectedToolDetail,
    setIsChangePasswordModalOpen,
    user,
    logout
  } = useApp();

  const [query, setQuery] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      rentaService.tools.getAll().then(data => setTools(data)).catch(() => {});
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredTools = query.trim() === '' 
    ? [] 
    : tools.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.brand.toLowerCase().includes(query.toLowerCase()) ||
        t.codeSku.toLowerCase().includes(query.toLowerCase()) ||
        t.categoryName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

  const handleSelectView = (view: 'home' | 'catalog' | 'client' | 'provider' | 'admin') => {
    setActiveView(view);
    setIsCommandPaletteOpen(false);
  };

  const handleToolSelect = (tool: Tool) => {
    setSelectedToolDetail(tool);
    setIsCommandPaletteOpen(false);
  };

  const handleDemoSelect = async (role: 'ROLE_CLIENTE' | 'ROLE_PROVEEDOR' | 'ROLE_ADMIN') => {
    await quickDemoLogin(role);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0d1322] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#0a0f1d]/80">
          <Search className="w-5 h-5 text-indigo-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar maquinaria, módulo operativo, o comando rápido..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-200 p-1 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            ESC
          </span>
        </div>

        {/* Content Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs font-sans">
          
          {/* Equipos encontrados */}
          {filteredTools.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                Maquinaria Encontrada
              </div>
              <div className="mt-1 space-y-1">
                {filteredTools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-slate-200 hover:bg-indigo-600/15 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                        {tool.mainImageUrl ? (
                          <img src={tool.mainImageUrl} alt={tool.name} className="w-full h-full object-cover" />
                        ) : (
                          <Wrench className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300">
                          {tool.name}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {tool.brand} {tool.model} · SKU: {tool.codeSku}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-indigo-400 font-semibold font-mono text-xs">
                        ${tool.baseDailyPrice.toLocaleString('es-CO')} /día
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                        Ver Ficha <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navegación Principal */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Navegación de Módulos
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <button
                onClick={() => handleSelectView('home')}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors text-left"
              >
                <Home className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-medium text-xs text-slate-200">Inicio</div>
                  <div className="text-[10px] text-slate-400">Portal y simulador interactivo</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectView('catalog')}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors text-left"
              >
                <Wrench className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-medium text-xs text-slate-200">Catálogo de Equipos</div>
                  <div className="text-[10px] text-slate-400">Ver maquinaria disponible</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectView('client')}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-medium text-xs text-slate-200">Mis Alquileres</div>
                  <div className="text-[10px] text-slate-400">Portal de cliente y contratos</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectView('provider')}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors text-left"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-medium text-xs text-slate-200">Control de Flota</div>
                  <div className="text-[10px] text-slate-400">Despacho, horas e inspección</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectView('admin')}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors text-left col-span-2 sm:col-span-1"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-medium text-xs text-slate-200">Centro de Control</div>
                  <div className="text-[10px] text-slate-400">Métricas DIAN, escrow y auditoría</div>
                </div>
              </button>
            </div>
          </div>

          {/* Accesos Rápidos Demo */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Perfiles de Demostración Rápida
            </div>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <button
                onClick={() => handleDemoSelect('ROLE_CLIENTE')}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-sky-500/50 hover:bg-sky-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-xs">
                  <UserCheck className="w-3.5 h-3.5" />
                  Cliente
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Constructora Bogotá</div>
              </button>

              <button
                onClick={() => handleDemoSelect('ROLE_PROVEEDOR')}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                  <Truck className="w-3.5 h-3.5" />
                  Proveedor
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">MaqRental Andina</div>
              </button>

              <button
                onClick={() => handleDemoSelect('ROLE_ADMIN')}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  Administrador
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">SecOps & Auditoría</div>
              </button>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between px-2 text-slate-400">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsQuoteDrawerOpen(true);
                  setIsCommandPaletteOpen(false);
                }}
                className="hover:text-indigo-400 flex items-center gap-1 text-[11px]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Cotización Activa
              </button>

              {user && (
                <button
                  onClick={() => {
                    setIsChangePasswordModalOpen(true);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="hover:text-amber-400 flex items-center gap-1 text-[11px]"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Cambiar Clave
                </button>
              )}
            </div>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsCommandPaletteOpen(false);
                }}
                className="hover:text-rose-400 flex items-center gap-1 text-[11px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            )}
          </div>

        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-slate-800 bg-[#080d19] flex items-center justify-between text-[11px] text-slate-400">
          <span>Navega con flechas y selecciona con enter</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">Ctrl + K</span>
            <span>para alternar comando</span>
          </div>
        </div>
      </div>
    </div>
  );
};
