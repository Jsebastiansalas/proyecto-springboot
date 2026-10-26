import React, { useState } from 'react';
import { Reservation } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  RotateCcw, 
  Wrench, 
  AlertTriangle, 
  Truck, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

interface EquipmentSwapModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSuccess: () => void;
}

export const EquipmentSwapModal: React.FC<EquipmentSwapModalProps> = ({
  reservation,
  onClose,
  onSuccess
}) => {
  const { showToast } = useApp();
  const [failureReason, setFailureReason] = useState<string>('FALLA_ELECTRICA');
  const [description, setDescription] = useState<string>('Pérdida de potencia y sobrecalentamiento súbito en motor durante operación normal.');
  const [urgency, setUrgency] = useState<'ALTA' | 'CRITICA'>('CRITICA');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast('🔄 Solicitud Hot-Swap aprobada. Se despachará una unidad de reemplazo de inmediato sin costos de fianza.', 'success');
      onSuccess();
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Garantía Hot-Swap: Reemplazo Express en Obra
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Reserva: {reservation.reservationCode || `RES-${reservation.id}`} · {reservation.toolName || 'Maquinaria'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Garantía Activa:</strong> La sustitución técnica no genera cobro de nuevo depósito ni altera los días restantes de tu contrato.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Tipo de Falla / Diagnóstico Inicial:
            </label>
            <select
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="FALLA_ELECTRICA">Falla Eléctrica / Cortocircuito Interno</option>
              <option value="BLOQUEO_MECANICO">Bloqueo Mecánico / Rotura de Rodamientos</option>
              <option value="FUGA_HIDRAULICA">Fuga Hidráulica Mayor / Pérdida de Presión</option>
              <option value="ARRANQUE_INOPERATIVO">Motor no enciende (Falla de Inyección/Batería)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Descripción Detallada de la Novedad en Obra:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              placeholder="Indica las circunstancias en las que ocurrió la parada..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Nivel de Prioridad de Despacho del Reemplazo:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('ALTA')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  urgency === 'ALTA'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Alta (Despacho en 4 Horas)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('CRITICA')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  urgency === 'CRITICA'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                🚨 Crítica (Fundición Parada)
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-600/20"
            >
              <Truck className="w-3.5 h-3.5" />
              {loading ? 'Asignando Reemplazo...' : 'Solicitar Sustitución Inmediata'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
