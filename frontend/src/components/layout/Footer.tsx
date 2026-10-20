import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  FileCheck2, 
  Award, 
  Clock, 
  HardHat,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <footer className="bg-[#181816] border-t border-[#363632] text-[#A8A69E] font-sans text-xs pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Columna 1: Marca & Misión */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D94E1F] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm">
                <HardHat className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-wider text-[#F5F4F0]">
                RENTAMAQ<span className="text-[#D94E1F]">.CO</span>
              </span>
            </div>
            <p className="text-[#A8A69E] leading-relaxed text-xs">
              Infraestructura B2B para alquiler, despacho y custodia escrow de maquinaria pesada y equipos industriales en Colombia.
            </p>
            <div className="flex items-center gap-2 text-[#1E6F43] font-mono text-[11px] bg-[#E3F1E8]/10 px-3 py-1.5 rounded-lg border border-[#A7D7B8]/20 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantía Asegurada SURA No. 98421-COL</span>
            </div>
          </div>

          {/* Columna 2: Módulos Operativos */}
          <div>
            <h4 className="text-[#F5F4F0] font-semibold uppercase tracking-wider text-xs mb-3 font-mono">
              Módulos Operativos
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setActiveView('catalog')}
                  className="hover:text-[#D94E1F] transition-colors flex items-center gap-1"
                >
                  Catálogo Técnico de Equipos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('client')}
                  className="hover:text-[#D94E1F] transition-colors flex items-center gap-1"
                >
                  Portal de Alquileres de Obra
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('provider')}
                  className="hover:text-[#D94E1F] transition-colors flex items-center gap-1"
                >
                  Control de Patios y Flota
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('admin')}
                  className="hover:text-[#D94E1F] transition-colors flex items-center gap-1"
                >
                  Centro de Control & Auditoría
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Cumplimiento & Estándares */}
          <div>
            <h4 className="text-[#F5F4F0] font-semibold uppercase tracking-wider text-xs mb-3 font-mono">
              Seguridad & Cumplimiento
            </h4>
            <ul className="space-y-2 text-[#A8A69E]">
              <li className="flex items-center gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-[#D94E1F] shrink-0" />
                <span>Facturación Electrónica DIAN con CUFE</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                <span>Certificaciones RETIE y RUC vigentes</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#CA8A04] shrink-0" />
                <span>Horómetros IoT & Mantenimiento Preventivo</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E6F43] shrink-0" />
                <span>Depósitos en Custodia Escrow Segura</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Patio Central & Despacho */}
          <div>
            <h4 className="text-[#F5F4F0] font-semibold uppercase tracking-wider text-xs mb-3 font-mono">
              Patio Principal Bogotá
            </h4>
            <div className="space-y-2.5 text-[#A8A69E]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D94E1F] shrink-0 mt-0.5" />
                <span>Av. Suba # 128A-42, Parque Industrial Norte, Bogotá D.C.</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1E6F43] shrink-0" />
                <span className="font-mono text-[#F5F4F0]">+57 (601) 745-8900 / 310-892-4411</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D94E1F] shrink-0" />
                <span>operaciones@rentamaq.co</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://dian.gov.co"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#A8A69E] hover:text-[#F5F4F0]"
                >
                  Verificación de Factura DIAN <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#363632] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#706E66]">
          <div>
            © 2026 RENTAMAQ INDUSTRIAL S.A.S. NIT: 901.442.189-4. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#F5F4F0] cursor-pointer">Términos de Alquiler</span>
            <span>·</span>
            <span className="hover:text-[#F5F4F0] cursor-pointer">Seguro de Todo Riesgo</span>
            <span>·</span>
            <span className="hover:text-[#F5F4F0] cursor-pointer">Protocolo de Despacho 4FN</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
