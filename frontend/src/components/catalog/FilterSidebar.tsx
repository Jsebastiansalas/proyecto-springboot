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
    <div className="bg-[#FAF9F5] border border-[#D6D3C9] rounded-xl p-5 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D6D3C9]">
        <div className="flex items-center gap-2 text-[#181816] font-semibold text-sm">
          <Filter className="w-4 h-4 text-[#D94E1F]" />
          <span>Filtros Operativos</span>
          <span className="text-[11px] font-mono bg-[#D94E1F]/10 text-[#D94E1F] px-2 py-0.5 rounded-md border border-[#D94E1F]/20 font-bold">
            {totalFiltered}
          </span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-[#78766F] hover:text-[#D94E1F] flex items-center gap-1 transition-colors"
          title="Restablecer filtros"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpiar</span>
        </button>
      </div>

      {/* Disponibilidad Inmediata */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#78766F] block">
          Disponibilidad
        </label>
        <button
          onClick={() => onToggleOnlyAvailable(!onlyAvailable)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
            onlyAvailable
              ? 'bg-[#E3F1E8] border-[#A7D7B8] text-[#1E6F43]'
              : 'bg-[#E8E5DC] border-[#D6D3C9] text-[#57564F] hover:border-[#B8B5AB]'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-[#1E6F43] animate-pulse' : 'bg-[#969389]'}`} />
            Solo Equipos Disponibles
          </span>
          {onlyAvailable && <Check className="w-4 h-4 text-[#1E6F43]" />}
        </button>
      </div>

      {/* Rango de Tarifa Diaria */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#78766F] flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#D94E1F]" />
            Tarifa Diaria Máx.
          </label>
          <span className="text-xs font-mono font-bold text-[#D94E1F]">
            ${priceLimit.toLocaleString('es-CO')}
          </span>
        </div>

        <input
          type="range"
          min="50000"
          max={maxPrice || 2000000}
          step="25000"
          value={priceLimit}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full accent-[#D94E1F] cursor-pointer h-2 bg-[#E8E5DC] rounded-lg"
        />

        <div className="flex justify-between text-[11px] font-mono text-[#78766F]">
          <span>$50.000</span>
          <span>Max ${(maxPrice || 2000000).toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* Filtro por Fabricantes / Marcas */}
      <div className="space-y-3 pt-2 border-t border-[#D6D3C9]">
        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#78766F] flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-[#D94E1F]" />
          Fabricante de Equipo
        </label>
        
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {brands.map(brand => {
            const isChecked = selectedBrands.includes(brand);
            return (
              <label 
                key={brand}
                className="flex items-center justify-between p-2 rounded-lg bg-[#E8E5DC]/50 hover:bg-[#E8E5DC] border border-[#D6D3C9] cursor-pointer transition-colors text-xs text-[#181816]"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleBrand(brand)}
                    className="rounded border-[#D6D3C9] text-[#D94E1F] focus:ring-[#D94E1F] accent-[#D94E1F] w-3.5 h-3.5"
                  />
                  <span className="font-medium">{brand}</span>
                </div>
                {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-[#D94E1F]" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* Sello de Aseguramiento */}
      <div className="pt-3 border-t border-[#D6D3C9] text-[11px] text-[#78766F] space-y-1">
        <div className="flex items-center gap-1.5 text-[#1E6F43] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#1E6F43]" />
          Póliza Todo Riesgo Activa
        </div>
        <p className="text-[10px] leading-relaxed text-[#57564F]">
          Todas las tarifas incluyen seguro SURA y telemetría horométrica en tiempo real.
        </p>
      </div>

    </div>
  );
};
