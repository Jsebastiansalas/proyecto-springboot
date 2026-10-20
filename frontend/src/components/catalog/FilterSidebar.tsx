import React from 'react';
import { Filter, RotateCcw, DollarSign, Check, Wrench } from 'lucide-react';

interface FilterSidebarProps {
  brands: string[];
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  maxPrice: number;
  priceLimit: number;
  onPriceChange: (val: number) => void;
  onlyAvailable: boolean;
  onToggleOnlyAvailable: (val: boolean) => void;
  onResetFilters: () => void;
  totalFiltered: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  brands,
  selectedBrands,
  onToggleBrand,
  maxPrice,
  priceLimit,
  onPriceChange,
  onlyAvailable,
  onToggleOnlyAvailable,
  onResetFilters,
  totalFiltered
}) => {
  return (
    <div className="bg-[#0c1220] border border-slate-800/80 rounded-2xl p-5 space-y-6 glass-panel">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filtros Operativos</span>
          <span className="text-[11px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
            {totalFiltered}
          </span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
          title="Restablecer filtros"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpiar</span>
        </button>
      </div>

      {/* Disponibilidad Inmediata */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
          Disponibilidad
        </label>
        <button
          onClick={() => onToggleOnlyAvailable(!onlyAvailable)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
            onlyAvailable
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            Solo Equipos Disponibles
          </span>
          {onlyAvailable && <Check className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Rango de Tarifa Diaria */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
            Tarifa Diaria Máx.
          </label>
          <span className="text-xs font-mono font-bold text-indigo-400">
            ${priceLimit.toLocaleString('es-CO')}
          </span>
        </div>
        <input
          type="range"
          min="50000"
          max={maxPrice > 0 ? maxPrice : 1500000}
          step="25000"
          value={priceLimit}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>$50.000</span>
          <span>${(maxPrice > 0 ? maxPrice : 1500000).toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* Marcas Fabricantes */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-indigo-400" />
          Fabricantes
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {brands.map(brand => {
            const isChecked = selectedBrands.includes(brand);
            return (
              <button
                key={brand}
                onClick={() => onToggleBrand(brand)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isChecked
                    ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span>{brand}</span>
                {isChecked && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        Todos los equipos incluyen inspección técnica pre-entrega 4FN y certificado de calibración vigente.
      </div>
    </div>
  );
};
