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
  CheckCircle2,
  AlertTriangle,
  Zap,
  HardHat
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

  // Checklist Técnico RETIE / 4FN
  const [cablesInspected, setCablesInspected] = useState<boolean>(true);
  const [safetyGuardsOk, setSafetyGuardsOk] = useState<boolean>(true);
  const [retieCertified, setRetieCertified] = useState<boolean>(true);
  const [fluidsLevelOk, setFluidsLevelOk] = useState<boolean>(true);
  const [operatorPpeKitIncluded, setOperatorPpeKitIncluded] = useState<boolean>(true);
  const [inspectorSignature, setInspectorSignature] = useState<string>('Inspector Técnico de Patio');

  const checkedCount = [
    cablesInspected,
    safetyGuardsOk,
    retieCertified,
    fluidsLevelOk,
    operatorPpeKitIncluded
  ].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (initialHours < 0) {
      showToast('La lectura del horómetro inicial debe ser mayor o igual a 0.', 'error');
      return;
    }

    setLoading(true);
    try {
      await rentaService.logistics.dispatch(
        reservation.id, 
        initialHours, 
        observations,
        {
          cablesInspected,
          safetyGuardsOk,
          retieCertified,
          fluidsLevelOk,
          operatorPpeKitIncluded,
          inspectorSignature
        }
      );
      showToast('Despacho registrado. Acta 4FN y Certificado RETIE generados con éxito.', 'success');
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
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden glass-modal max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Protocolo de Despacho 4FN & RETIE
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
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

          {/* CHECKLIST TÉCNICO RETIE 4FN */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-200 font-bold flex items-center gap-1.5 text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Inspección Técnica Pre-Despacho (RETIE 4FN)
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                checkedCount === 5 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {checkedCount}/5 Conformes
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300 select-none">
                <input 
                  type="checkbox" 
                  checked={cablesInspected} 
                  onChange={(e) => setCablesInspected(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span>Cableado y aislamiento dieléctrico sin fisuras ni empalmes expuestos</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300 select-none">
                <input 
                  type="checkbox" 
                  checked={safetyGuardsOk} 
                  onChange={(e) => setSafetyGuardsOk(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span>Guardas de protección mecánica y parada de emergencia (E-Stop) operativas</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300 select-none">
                <input 
                  type="checkbox" 
                  checked={retieCertified} 
                  onChange={(e) => setRetieCertified(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span>Certificado de calibración y dictamen RETIE vigente adjunto</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300 select-none">
                <input 
                  type="checkbox" 
                  checked={fluidsLevelOk} 
                  onChange={(e) => setFluidsLevelOk(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span>Niveles de lubricante, refrigerante y combustible al 100% verificado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300 select-none">
                <input 
                  type="checkbox" 
                  checked={operatorPpeKitIncluded} 
                  onChange={(e) => setOperatorPpeKitIncluded(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1">
                  <HardHat className="w-3 h-3 text-amber-400 inline" />
                  Kit EPP básico entregado + Manual de operación segura
                </span>
              </label>
            </div>

            {checkedCount < 5 && (
              <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Atención: Equipo con observaciones técnicas pendientes antes de la salida.</span>
              </div>
            )}
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
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#D94E1F]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              Firma Responsable de Patio
            </label>
            <input
              type="text"
              value={inspectorSignature}
              onChange={(e) => setInspectorSignature(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#D94E1F]"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Al confirmar, la maquinaria pasa a estado "EN_CURSO" con póliza y checklist RETIE archivados.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 shrink-0">
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
              <span>{loading ? 'Registrando...' : 'Emitir Salida 4FN & RETIE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
