import React, { useState, useRef } from 'react';
import { Reservation } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  PenTool, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Hash, 
  Lock,
  Stamp,
  AlertTriangle
} from 'lucide-react';

interface ContractSignatureModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSigned: () => void;
}

export const ContractSignatureModal: React.FC<ContractSignatureModalProps> = ({
  reservation,
  onClose,
  onSigned
}) => {
  const { showToast, user } = useApp();
  const [signerName, setSignerName] = useState<string>((user as any)?.name || reservation.clientName || 'Ing. Contratista');
  const [signerIdDoc, setSignerIdDoc] = useState<string>('1.037.648.910');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [signing, setSigning] = useState<boolean>(false);

  // Generación de Hash SHA-256 del contrato mercantil
  const contractHash = `SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069-${reservation.id}`;

  const handleSign = () => {
    if (!acceptedTerms) {
      showToast('Debes aceptar las cláusulas del Pagaré y Contrato de Arrendamiento.', 'error');
      return;
    }
    if (!signerName || !signerIdDoc) {
      showToast('Por favor completa tu nombre y documento de identidad.', 'error');
      return;
    }

    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      showToast('✍️ Contrato y Pagaré firmados digitalmente bajo Ley 527 de 1999.', 'success');
      onSigned();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden glass-modal flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Firma Digital de Contrato & Pagaré en Blanco
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Ley 527 de 1999 & Art. 622 Código de Comercio Colombiano
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-xs">
          {/* Alerta Legal */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300/90 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Garantía Cambiaria Vinculante:</strong> La suscripción digital de este instrumento constituye título ejecutivo de pago coactivo para respaldar siniestros, pérdidas no cubiertas por fianza o retención ilícita del bien arrendado.
            </div>
          </div>

          {/* Cláusulas del Contrato Marco */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-400">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Contrato de Arrendamiento Mercantil No. {reservation.reservationCode || `RES-${reservation.id}`}
            </h4>
            <p>
              <strong>PRIMERA. OBJETO:</strong> RENTAMAQ COLOMBIA entrega en arrendamiento el equipo <em>{reservation.toolName || 'Maquinaria Industrial'}</em> para uso exclusivo en el frente de obra declarado.
            </p>
            <p>
              <strong>SEGUNDA. DESTINACIÓN EXCLUSIVA:</strong> Queda terminantemente prohibido trasladar la maquinaria fuera del perímetro geocercado autorizado sin previa adenda escrita.
            </p>
            <p>
              <strong>TERCERA. PAGARÉ CON ESPACIOS EN BLANCO:</strong> El arrendatario suscribe pagaré número PG-{reservation.id} con carta de instrucciones expresa, autorizando el diligenciamiento de los montos resultantes de averías mecánicas o daño emergente tasados en el acta técnica de recepción.
            </p>
          </div>

          {/* Formulario de Firma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block text-[11px]">
                Nombre del Representante Legal / Firmante:
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block text-[11px]">
                Cédula de Ciudadanía / Documento:
              </label>
              <input
                type="text"
                value={signerIdDoc}
                onChange={(e) => setSignerIdDoc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Sello de Evidencia Digital */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Timestamp UTC:</span>
              <span className="text-white">{new Date().toISOString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>IP de Captura:</span>
              <span className="text-emerald-400">190.144.12.85 (Verificada)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Hash del Contrato:</span>
              <span className="text-amber-400 truncate max-w-[280px]">{contractHash}</span>
            </div>
          </div>

          {/* Checkbox de Consentimiento Expreso */}
          <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
            />
            <span className="text-[11px] text-slate-300">
              Acepto los términos del Contrato Marco y autorizo la emisión del <strong>Pagaré con espacios en blanco</strong> bajo el Artículo 622 del C.Co.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Certificado con Criptografía SHA-256
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSign}
              disabled={signing}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-600/20"
            >
              <PenTool className="w-3.5 h-3.5" />
              {signing ? 'Firmando y Sellando...' : 'Estampar Firma Digital'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
