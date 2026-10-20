import React, { useState } from 'react';
import { Reservation } from '../../types';
import { rentaService } from '../../services/rentaService';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ClipboardCheck, 
  Gauge, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign,
  ShieldCheck
} from 'lucide-react';

interface ReturnInspectionModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnInspectionModal: React.FC<ReturnInspectionModalProps> = ({
  reservation,
  onClose,
  onSuccess
}) => {
  const { showToast } = useApp();
  const [finalHours, setFinalHours] = useState<number>(145);
  const [damageCost, setDamageCost] = useState<number>(0);
  const [damageReport, setDamageReport] = useState<string>('Inspección de retorno exitosa. Sin desgastes anormales ni piezas averiadas.');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await rentaService.logistics.returnDelivery(reservation.id, finalHours, damageCost, damageReport);
      showToast('Inspección 4FN registrada. Liquidación y reembolso de garantía escrow ejecutados.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(`Error al registrar retorno: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const depositRefund = Math.max(0, reservation.depositAmount - damageCost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Inspección de Retorno & Liquidación
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
              <span className="text-slate-400">Depósito en Custodia (Escrow):</span>
              <span className="font-mono text-white font-bold">${reservation.depositAmount.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cliente Adquiriente:</span>
              <span className="text-slate-200">{reservation.clientName}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Lectura Horómetro Final (Reingreso al Patio)
            </label>
            <input
              type="number"
              value={finalHours}
              onChange={(e) => setFinalHours(Number(e.target.value))}
              min="0"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#D94E1F]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-rose-400" />
              Costo de Averías / Daños a Descontar ($ COP)
            </label>
            <input
              type="number"
              value={damageCost}
              onChange={(e) => setDamageCost(Number(e.target.value))}
              min="0"
              max={reservation.depositAmount}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#D94E1F]"
            />
            <span className="text-[11px] text-slate-500">
              0 si el equipo ingresó en óptimas condiciones
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-[#D94E1F]" />
              Informe Técnico 4FN de Retorno
            </label>
            <textarea
              value={damageReport}
              onChange={(e) => setDamageReport(e.target.value)}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#D94E1F]"
            />
          </div>

          {/* Liquidación Escrow Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Depósito Original:</span>
              <span className="font-mono">${reservation.depositAmount.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Deducción por Daños:</span>
              <span className="font-mono">-${damageCost.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-white">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Reembolso al Cliente:
              </span>
              <span className="font-mono text-emerald-400">${depositRefund.toLocaleString('es-CO')}</span>
            </div>
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Liquidando...' : 'Firmar Acta & Liberar Escrow'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
