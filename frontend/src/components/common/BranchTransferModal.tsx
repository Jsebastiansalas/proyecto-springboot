import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Truck, 
  ArrowRightLeft, 
  Building2, 
  CheckCircle2, 
  MapPin,
  Lock
} from 'lucide-react';

interface BranchTransferModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BranchTransferModal: React.FC<BranchTransferModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { showToast } = useApp();
  const [toolId, setToolId] = useState<string>('1');
  const [originBranch, setOriginBranch] = useState<string>('Patio Norte - Bello');
  const [destBranch, setDestBranch] = useState<string>('Patio Sur - Sabaneta / Medellín');
  const [trackingGuide, setTrackingGuide] = useState<string>('GUIA-TR-2026-042');
  const [transferring, setTransferring] = useState<boolean>(false);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferring(true);

    setTimeout(() => {
      setTransferring(false);
      showToast('🚚 Traslado logístico inter-sedes despachado. Equipo bloqueado en tránsito.', 'success');
      onSuccess();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Transferencia de Flota Inter-Patios
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Logística Multisede · Bloqueo Concurrente SELECT FOR UPDATE
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

        <form onSubmit={handleTransfer} className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Equipo a Trasladar:
            </label>
            <select
              value={toolId}
              onChange={(e) => setToolId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="1">Compresor 50L (Serial: CMP-50L-01)</option>
              <option value="2">Generador Diésel 10 kVA (Serial: GEN-10K-04)</option>
              <option value="3">Rotomartillo SDS Max 1500W (Serial: RTM-MAX-12)</option>
              <option value="4">Plataforma Tijera 12m (Serial: PLT-TJ-02)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" /> Origen
              </span>
              <span className="text-white font-bold">{originBranch}</span>
            </div>
            <div className="space-y-1 border-l border-slate-800 pl-3">
              <span className="text-slate-500 block text-[10px] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Destino
              </span>
              <span className="text-indigo-400 font-bold">{destBranch}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Número de Guía / Despachador de Carga:
            </label>
            <input
              type="text"
              value={trackingGuide}
              onChange={(e) => setTrackingGuide(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-indigo-300 text-[11px] flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              El estado de la máquina cambiará a <strong>EN_TRANSITO</strong> y no podrá ser reservada en patio origen hasta su recepción técnica.
            </span>
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
              disabled={transferring}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Truck className="w-3.5 h-3.5" />
              {transferring ? 'Despachando Carga...' : 'Autorizar Traslado Inter-Sedes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
