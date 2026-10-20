import React, { useState } from 'react';
import { Reservation } from '../../types';
import { rentaService } from '../../services/rentaService';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Truck, 
  Gauge, 
  FileText, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

interface DispatchModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSuccess: () => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  reservation,
  onClose,
  onSuccess
}) => {
  const { showToast } = useApp();
  const [initialHours, setInitialHours] = useState<number>(120);
  const [observations, setObservations] = useState<string>('Equipo inspeccionado 4FN, niveles de fluidos al 100%, horómetro calibrado.');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await rentaService.logistics.dispatch(reservation.id, initialHours, observations);
      showToast('Despacho registrado. Acta 4FN de salida generada con éxito.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(`Error al despachar equipo: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Protocolo de Despacho 4FN
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Reserva: {reservation.reservationCode} · {reservation.toolName}
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
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Cliente Adquiriente:</span>
              <span className="text-white font-semibold">{reservation.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Periodo Programado:</span>
              <span className="text-slate-300 font-mono">{reservation.startDate} a {reservation.endDate}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Lectura Horómetro Inicial (Salida de Patio)
            </label>
            <input
              type="number"
              value={initialHours}
              onChange={(e) => setInitialHours(Number(e.target.value))}
              min="0"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#D94E1F]"
            />
            <span className="text-[11px] text-slate-500">
              Horas acumuladas certificadas por telemetría IoT
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#D94E1F]" />
              Observaciones de Entrega 4FN
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#D94E1F]"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Al confirmar, la maquinaria pasa a estado "EN_CURSO" con seguro activo.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-amber-600/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Registrando...' : 'Emitir Salida 4FN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
