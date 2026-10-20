import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Percent, 
  CheckCircle2,
  HardHat,
  Cpu
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setIsCommandPaletteOpen } = useApp();

  return (
    <div className="relative overflow-hidden pt-8 pb-12 border-b border-slate-800/80 bg-gradient-to-b from-[#0e1629] via-[#090d16] to-[#090d16]">
      {/* Decorative gradient glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Enterprise verification pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <HardHat className="w-3.5 h-3.5 text-indigo-400" />
          <span>Red Logística Minera e Industrial · Patio Norte Bogotá</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-emerald-400">180+ Unidades Listas</span>
        </div>

        {/* Main Title & Value Proposition */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Potencia tu obra con <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200 bg-clip-text text-transparent">maquinaria pesada certificada</span> y telemetría en tiempo real.
          </h1>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Plataforma B2B para contratación, entrega en 24h y liquidación de maquinaria. Incluye horómetro digital IoT, garantía de póliza Todo Riesgo SURA y facturación electrónica DIAN con CUFE.
          </p>
        </div>

        {/* Action Row */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 group"
          >
            <Search className="w-4 h-4 text-indigo-200" />
            <span>Buscar Maquinaria o SKU</span>
            <span className="text-[11px] font-mono bg-indigo-800/80 px-2 py-0.5 rounded text-indigo-200 border border-indigo-400/30">
              Ctrl + K
            </span>
          </button>

          <a
            href="#catalogo-seccion"
            className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 4 Metric Cards */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-indigo-400 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flota Activa</span>
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white font-mono">+180</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Con telemetría IoT activa</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disponibilidad</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white font-mono">99.8%</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Mantenimiento preventivo</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sky-400 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Despacho</span>
              <HardHat className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white font-mono">24 Horas</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>En cama baja a obra</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ahorro Semanal</span>
              <Percent className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">-15% OFF</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-amber-400" />
              <span>En alquileres de ≥ 7 días</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
