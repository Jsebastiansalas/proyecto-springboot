import React from 'react';
import { Tool } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  Scale, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  SlidersHorizontal, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Wrench,
  AlertTriangle
} from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { 
    favorites, 
    toggleFavorite, 
    compareList, 
    toggleCompare, 
    addToCart, 
    setSelectedToolDetail 
  } = useApp();

  const isFav = favorites.includes(tool.id);
  const isCompared = compareList.some(item => item.id === tool.id);
  const isAvailable = tool.status === 'DISPONIBLE';

  const getStatusBadge = () => {
    switch (tool.status) {
      case 'DISPONIBLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#E3F1E8] text-[#1E6F43] border border-[#A7D7B8] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E6F43] animate-pulse" />
            Disponible
          </span>
        );
      case 'ALQUILADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] shadow-xs">
            <Clock className="w-3 h-3" />
            En Obra
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] shadow-xs">
            <AlertTriangle className="w-3 h-3" />
            Mantenimiento
          </span>
        );
    }
  };

  return (
    <div className="group relative bg-[#1E1E1C] border border-[#363632] hover:border-[#D94E1F] rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-xs">
      
      {/* Top Image & Overlays */}
      <div className="relative aspect-[16/10] bg-[#141412] overflow-hidden flex items-center justify-center border-b border-[#363632]">
        {tool.mainImageUrl ? (
          <img
            src={tool.mainImageUrl}
            alt={tool.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <Wrench className="w-12 h-12 text-[#706E66]" />
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3 z-10">
          {getStatusBadge()}
        </div>

        {/* Quick action buttons overlay */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(tool.id);
            }}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
              isFav
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-[#232320] border-[#363632] text-[#A8A69E] hover:text-rose-400 hover:bg-[#282824]'
            }`}
            title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            aria-label="Favorito"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Compare button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(tool);
            }}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
              isCompared
                ? 'bg-[#D94E1F] border-[#B83D14] text-white shadow-xs'
                : 'bg-[#232320] border-[#363632] text-[#A8A69E] hover:text-[#F5F4F0] hover:bg-[#282824]'
            }`}
            title="Comparar especificaciones"
            aria-label="Comparar"
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly Discount Tag */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#181816] text-[#F5F4F0] border border-[#363632]">
            -15% en ≥7 días
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Header & Title */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#A8A69E] font-mono mb-1">
            <span>{tool.brand} · {tool.model}</span>
            <span className="text-[10px] bg-[#282824] text-[#F5F4F0] px-2 py-0.5 rounded border border-[#363632] font-bold">
              SKU: {tool.codeSku}
            </span>
          </div>

          <h3 
            onClick={() => setSelectedToolDetail(tool)}
            className="text-base font-bold text-[#F5F4F0] hover:text-[#D94E1F] transition-colors cursor-pointer line-clamp-1 leading-snug"
          >
            {tool.name}
          </h3>

          <div className="text-xs text-[#A8A69E] mt-1">
            Patio: <span className="text-[#F5F4F0] font-medium">{tool.providerName}</span>
          </div>

          {/* IoT Telemetry Micro-Badges */}
          {tool.telemetry && (
            <div className="mt-3 grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-[#141412] border border-[#363632] text-[10px] font-mono">
              <div className="flex items-center gap-1 text-[#F5F4F0]" title="Horas de trabajo acumuladas">
                <Gauge className="w-3 h-3 text-[#fbbf24] shrink-0" />
                <span>{tool.telemetry.horometro}h</span>
              </div>
              <div className="flex items-center gap-1 text-[#F5F4F0]" title="Nivel de combustible o carga eléctrica">
                <Zap className="w-3 h-3 text-[#D94E1F] shrink-0" />
                <span>{tool.telemetry.fuelOrBatteryLevel}%</span>
              </div>
              <div className="flex items-center gap-1 text-[#4ade80] font-bold" title="Certificación eléctrica e industrial">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>RETIE</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-[#363632]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] text-[#A8A69E] block font-mono">Tarifa por día</span>
              <span className="text-lg font-black font-mono text-[#F5F4F0]">
                ${tool.baseDailyPrice.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#A8A69E] block font-mono">Fianza Custodia</span>
              <span className="text-xs font-mono text-[#706E66]">
                ${tool.depositAmount.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Two-button Action Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedToolDetail(tool)}
              className="py-2.5 px-3 rounded-lg bg-[#232320] hover:bg-[#282824] text-[#F5F4F0] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#363632] transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#A8A69E]" />
              <span>Ficha</span>
            </button>

            <button
              onClick={() => addToCart(tool, 3)}
              disabled={!isAvailable}
              className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isAvailable
                  ? 'bg-[#D94E1F] hover:bg-[#B83D14] text-white shadow-xs'
                  : 'bg-[#141412] text-[#706E66] cursor-not-allowed border border-[#363632]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isAvailable ? 'Cotizar' : 'No Disp.'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
