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
    <div className="relative overflow-hidden pt-8 pb-12 border-b border-[#363632] bg-[#181816] blueprint-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Enterprise verification badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#232320] border border-[#3F3E3A] text-[#F5F4F0] text-xs font-mono font-semibold mb-6 shadow-sm">
          <HardHat className="w-3.5 h-3.5 text-[#D94E1F]" />
          <span>Red Logística Minera e Industrial · Patio Norte Bogotá</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E6F43] animate-pulse" />
          <span className="text-[11px] font-mono text-[#1E6F43]">180+ Unidades Listas</span>
        </div>

        {/* Main Title & Value Proposition */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-black text-[#F5F4F0] tracking-tight leading-[1.15]">
            Potencia tu obra con <span className="text-[#D94E1F]">maquinaria pesada certificada</span> y telemetría en tiempo real.
          </h1>
          <p className="mt-4 text-[#A8A69E] text-sm sm:text-base leading-relaxed">
            Plataforma B2B para contratación, entrega en 24h y liquidación de maquinaria. Incluye horómetro digital IoT, garantía de póliza Todo Riesgo SURA y facturación electrónica DIAN con CUFE.
          </p>
        </div>

        {/* Action Row */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="px-6 py-3.5 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-semibold text-sm flex items-center gap-3 transition-all shadow-md group"
          >
            <Search className="w-4 h-4 text-white" />
            <span>Buscar Maquinaria o SKU</span>
            <span className="text-[11px] font-mono bg-[#B83D14] px-2 py-0.5 rounded text-white border border-white/20">
              Ctrl + K
            </span>
          </button>

          <a
            href="#catalogo-seccion"
            className="px-5 py-3.5 rounded-lg bg-[#232320] hover:bg-[#2C2C28] text-[#F5F4F0] font-semibold text-sm flex items-center gap-2 border border-[#4A4944] transition-colors"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-4 h-4 text-[#A8A69E] group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 4 Metric Cards */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl bg-[#232320] border border-[#363632]">
            <div className="flex items-center justify-between text-[#D94E1F] mb-2">
              <span className="text-xs font-mono font-semibold text-[#A8A69E] uppercase tracking-wider">Flota Activa</span>
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-[#F5F4F0] font-mono">+180</div>
            <div className="text-xs text-[#A8A69E] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#1E6F43]" />
              <span>Con telemetría IoT activa</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#232320] border border-[#363632]">
            <div className="flex items-center justify-between text-[#1E6F43] mb-2">
              <span className="text-xs font-mono font-semibold text-[#A8A69E] uppercase tracking-wider">Disponibilidad</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-[#F5F4F0] font-mono">99.8%</div>
            <div className="text-xs text-[#A8A69E] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#1E6F43]" />
              <span>Mantenimiento preventivo</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#232320] border border-[#363632]">
            <div className="flex items-center justify-between text-[#D94E1F] mb-2">
              <span className="text-xs font-mono font-semibold text-[#A8A69E] uppercase tracking-wider">Despacho</span>
              <HardHat className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-[#F5F4F0] font-mono">24 Horas</div>
            <div className="text-xs text-[#A8A69E] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#1E6F43]" />
              <span>En cama baja a obra</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#232320] border border-[#363632]">
            <div className="flex items-center justify-between text-[#CA8A04] mb-2">
              <span className="text-xs font-mono font-semibold text-[#A8A69E] uppercase tracking-wider">Ahorro Semanal</span>
              <Percent className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-[#EAB308] font-mono">-15% OFF</div>
            <div className="text-xs text-[#A8A69E] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#CA8A04]" />
              <span>En alquileres de ≥ 7 días</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
