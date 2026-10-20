import React from 'react';
import { MapPin, ShieldCheck, Phone, FileCheck, Truck } from 'lucide-react';

export const TopUtilityBar: React.FC = () => {
  return (
    <div className="bg-[#111110] border-b border-[#2C2C28] py-1.5 px-4 text-xs text-[#A8A69E]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Despacho en Patio */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#181816] px-2.5 py-1 rounded-md border border-[#363632] text-[#F5F4F0]">
            <MapPin className="w-3.5 h-3.5 text-[#D94E1F] shrink-0" />
            <span className="text-[11px]">
              Patio de Despacho: <strong className="text-white">Bogotá, Suba (Parque Industrial)</strong>
            </span>
          </div>
          <span className="hidden md:inline text-[#4A4944]">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#A8A69E]">
            <Truck className="w-3.5 h-3.5 text-[#D94E1F]" />
            <span>Despacho con grúa pluma en menos de 24 horas</span>
          </div>
        </div>

        {/* Garantías y Moneda */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="hidden lg:flex items-center gap-1.5 text-[#1E6F43] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E6F43]" />
            <span>Póliza Todo Riesgo Sura</span>
            <span className="text-[#4A4944]">•</span>
            <FileCheck className="w-3.5 h-3.5 text-[#D94E1F]" />
            <span className="text-[#A8A69E]">Facturación Electrónica DIAN</span>
          </div>
          <span className="hidden lg:inline text-[#4A4944]">|</span>
          <div className="flex items-center gap-1.5 text-[#A8A69E]">
            <Phone className="w-3 h-3 text-[#A8A69E]" />
            <span>Línea Obras:</span>
            <a href="tel:6017458900" className="font-mono font-bold text-white hover:text-[#D94E1F] transition-colors">
              (601) 745-8900
            </a>
          </div>
          <div className="px-2 py-0.5 rounded bg-[#232320] border border-[#363632] font-mono text-[10px] text-[#F5F4F0]">
            COP ($)
          </div>
        </div>
      </div>
    </div>
  );
};
