import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Scale, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Minus, 
  Wrench, 
  ShieldCheck, 
  Zap, 
  Gauge, 
  SlidersHorizontal 
} from 'lucide-react';

export const ComparatorDock: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, addToCart } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto">
        <div className="bg-[#0f172a]/95 border border-[#D94E1F] rounded-2xl shadow-2xl backdrop-blur-xl p-3 flex items-center justify-between gap-4 glow-border">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D94E1F]/20 border border-[#D94E1F] flex items-center justify-center text-[#D94E1F]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                Comparador Técnico
                <span className="text-[11px] font-mono bg-[#E05A2B]/20 text-[#D94E1F] border border-[#D94E1F] px-2 py-0.5 rounded-full">
                  {compareList.length}/3
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Contrasta especificaciones y telemetría en tiempo real
              </div>
            </div>
          </div>

          {/* Thumbnails preview */}
          <div className="flex items-center gap-2">
            {compareList.map(tool => (
              <div key={tool.id} className="relative group">
                <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {tool.mainImageUrl ? (
                    <img src={tool.mainImageUrl} alt={tool.name} className="w-full h-full object-cover" />
                  ) : (
                    <Wrench className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <button
                  onClick={() => removeFromCompare(tool.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  aria-label="Quitar del comparador"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="px-3 py-1.5 rounded-lg bg-[#D94E1F] hover:bg-[#E05A2B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-sm"
            >
              <span>{isExpanded ? 'Ocultar' : 'Comparar'}</span>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              onClick={clearCompare}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
              title="Limpiar comparador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Expanded Modal Comparison Table */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden glass-modal">
            
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#0a0f1d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E05A2B]/10 border border-[#D94E1F] flex items-center justify-center text-[#D94E1F]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Matriz Comparativa de Rendimiento
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspección técnica de maquinaria pesada y condiciones contractuales
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comparison Matrix Table */}
            <div className="p-4 sm:p-6 overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-1/4">
                      Parámetro / Especificación
                    </th>
                    {compareList.map(t => (
                      <th key={t.id} className="py-3 px-4 text-left w-1/4">
                        <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden mb-2">
                          <img src={t.mainImageUrl} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-sm text-slate-100">{t.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{t.brand} {t.model}</div>
                        <div className="mt-2 text-[#D94E1F] font-bold font-mono text-sm">
                          ${t.baseDailyPrice.toLocaleString('es-CO')} <span className="text-[11px] font-normal text-slate-400">/día</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {/* Categoría */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Categoría Operativa</td>
                    {compareList.map(t => (
                      <td key={t.id} className="py-3 px-4 text-slate-200 font-medium">
                        {t.categoryName}
                      </td>
                    ))}
                  </tr>

                  {/* Depósito en Garantía */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Depósito en Garantía (Escrow)</td>
                    {compareList.map(t => (
                      <td key={t.id} className="py-3 px-4 text-slate-200 font-mono">
                        ${t.depositAmount.toLocaleString('es-CO')}
                      </td>
                    ))}
                  </tr>

                  {/* Horómetro */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" />
                      Horómetro Digital
                    </td>
                    {compareList.map(t => (
                      <td key={t.id} className="py-3 px-4 font-mono text-slate-200">
                        {t.telemetry?.horometro ?? 150} hrs de uso
                      </td>
                    ))}
                  </tr>

                  {/* Combustible / Batería */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-sky-400" />
                      Nivel de Energía / Fluido
                    </td>
                    {compareList.map(t => (
                      <td key={t.id} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                            <div 
                              className="bg-emerald-500 h-full rounded-full" 
                              style={{ width: `${t.telemetry?.fuelOrBatteryLevel ?? 80}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-200">{t.telemetry?.fuelOrBatteryLevel ?? 80}%</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Certificado RETIE */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Certificación RETIE / RUC
                    </td>
                    {compareList.map(t => (
                      <td key={t.id} className="py-3 px-4">
                        {t.telemetry?.retieCertified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-3 h-3" /> Vigente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            <Minus className="w-3 h-3" /> N/A (Mecánico)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Proveedor */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Patio / Proveedor</td>
                    {compareList.map(t => (
                      <td key={t.id} className="py-3 px-4 text-slate-300">
                        {t.providerName}
                      </td>
                    ))}
                  </tr>

                  {/* Acciones */}
                  <tr>
                    <td className="py-4 px-4 font-medium text-slate-400">Acción Directa</td>
                    {compareList.map(t => (
                      <td key={t.id} className="py-4 px-4">
                        <button
                          onClick={() => {
                            addToCart(t, 3);
                            setIsExpanded(false);
                          }}
                          className="w-full py-2 px-3 bg-[#D94E1F] hover:bg-[#E05A2B] text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-sm"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          Cotizar Equipo
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#0a0f1d] flex items-center justify-between text-xs text-slate-400">
              <span>* Los precios no incluyen IVA (19%) ni transporte intermunicipal de cama baja.</span>
              <button
                onClick={clearCompare}
                className="text-rose-400 hover:text-rose-300 font-medium"
              >
                Limpiar lista de comparación
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
