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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Disponible
          </span>
        );
      case 'ALQUILADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-md">
            <Clock className="w-3 h-3" />
            En Obra
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 backdrop-blur-md">
            <AlertTriangle className="w-3 h-3" />
            Mantenimiento
          </span>
        );
    }
  };

  return (
    <div className="group relative bg-[#0d1322] border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 glass-card">
      
      {/* Top Image & Overlays */}
      <div className="relative aspect-[16/10] bg-[#0a0f1d] overflow-hidden flex items-center justify-center border-b border-slate-800/80">
        {tool.mainImageUrl ? (
          <img
            src={tool.mainImageUrl}
            alt={tool.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <Wrench className="w-12 h-12 text-slate-700" />
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
            className={`w-8 h-8 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all ${
              isFav
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:bg-black/60'
            }`}
            title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            aria-label="Favorito"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
          </button>

          {/* Compare button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(tool);
            }}
            className={`w-8 h-8 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all ${
              isCompared
                ? 'bg-indigo-500/30 border-indigo-500/50 text-indigo-300'
                : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:bg-black/60'
            }`}
            title="Comparar especificaciones"
            aria-label="Comparar"
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly Discount Tag */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 backdrop-blur-md">
            -15% en ≥7 días
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        {/* Header & Title */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>{tool.brand} · {tool.model}</span>
            <span className="text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              SKU: {tool.codeSku}
            </span>
          </div>

          <h3 
            onClick={() => setSelectedToolDetail(tool)}
            className="text-base font-bold text-slate-100 hover:text-indigo-300 transition-colors cursor-pointer line-clamp-1 leading-snug"
          >
            {tool.name}
          </h3>

          <div className="text-xs text-slate-400 mt-1">
            Patio: <span className="text-slate-300 font-medium">{tool.providerName}</span>
          </div>

          {/* IoT Telemetry Micro-Badges */}
          {tool.telemetry && (
            <div className="mt-3 grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-slate-300" title="Horas de trabajo acumuladas">
                <Gauge className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{tool.telemetry.horometro}h</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300" title="Nivel de combustible o carga eléctrica">
                <Zap className="w-3 h-3 text-sky-400 shrink-0" />
                <span>{tool.telemetry.fuelOrBatteryLevel}%</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400" title="Certificación eléctrica e industrial">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>RETIE</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs text-slate-400 block">Tarifa por día</span>
              <span className="text-lg font-black font-mono text-white">
                ${tool.baseDailyPrice.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Garantía Escrow</span>
              <span className="text-xs font-mono text-slate-300">
                ${tool.depositAmount.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Two-button Action Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedToolDetail(tool)}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Ficha</span>
            </button>

            <button
              onClick={() => addToCart(tool, 3)}
              disabled={!isAvailable}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isAvailable
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
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
