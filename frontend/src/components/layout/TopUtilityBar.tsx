import React from 'react';
import { MapPin, ShieldCheck, Phone, FileCheck, Truck } from 'lucide-react';

export const TopUtilityBar: React.FC = () => {
  return (
    <div className="bg-obsidian-950 border-b border-white/5 py-1.5 px-4 text-xs text-obsidian-400">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Despacho en Patio */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-obsidian-800/80 px-2.5 py-1 rounded-md border border-white/5 text-obsidian-200">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px]">
              Patio de Despacho: <strong className="text-white">Bogotá, Suba (Parque Industrial)</strong>
            </span>
          </div>
          <span className="hidden md:inline text-obsidian-700">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-obsidian-400">
            <Truck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Despacho con grúa pluma en menos de 24 horas</span>
          </div>
        </div>

        {/* Garantías y Moneda */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-400/90 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Póliza Todo Riesgo Sura</span>
            <span className="text-obsidian-700">•</span>
            <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-obsidian-300">Facturación Electrónica DIAN</span>
          </div>
          <span className="hidden lg:inline text-obsidian-700">|</span>
          <div className="flex items-center gap-1.5 text-obsidian-300">
            <Phone className="w-3 h-3 text-obsidian-400" />
            <span>Línea Obras:</span>
            <a href="tel:6017458900" className="font-mono font-bold text-white hover:text-indigo-400 transition-colors">
              (601) 745-8900
            </a>
          </div>
          <div className="px-2 py-0.5 rounded bg-obsidian-850 border border-white/10 font-mono text-[10px] text-obsidian-300">
            COP ($)
          </div>
        </div>
      </div>
    </div>
  );
};
