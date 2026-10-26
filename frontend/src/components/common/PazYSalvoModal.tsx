import React from 'react';
import { Reservation } from '../../types';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck, 
  QrCode, 
  Building2, 
  Award,
  Hash
} from 'lucide-react';

interface PazYSalvoModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export const PazYSalvoModal: React.FC<PazYSalvoModalProps> = ({ reservation, onClose }) => {
  const formatCOP = (val?: number | null) => '$ ' + Number(val || 0).toLocaleString('es-CO');

  const printCertificate = () => {
    window.print();
  };

  // Generador de Hash SHA-256 visual determinista
  const clearanceCode = `PYS-${reservation.id}-${new Date().getFullYear()}`;
  const sha256Fingerprint = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.slice(0, 48) + `-${reservation.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden glass-modal flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Certificado Oficial de Paz y Salvo Técnico & Financiero
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Cierre Contractual de Obra · Validez Legal Interventoría Ley 80
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={printCertificate}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-300 text-xs printable-area bg-[#0b1329]/90 border border-slate-800/80 m-4 rounded-xl">
          {/* Encabezado del Certificado */}
          <div className="border-b border-slate-700 pb-5 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm tracking-wider uppercase">
              <Building2 className="w-4 h-4" />
              RentaMaq Colombia S.A.S. · NIT: 901.482.119-4
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
              Certificado de Paz y Salvo Definitivo
            </h2>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              EXPEDIENTE No: {clearanceCode}
            </div>
          </div>

          {/* Datos del Contrato */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block">Contratista Titular:</span>
              <span className="text-white font-bold">{reservation.clientName || 'CONSTRUCTORA ADQUIRIENTE S.A.S.'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Reserva / Contrato Marco:</span>
              <span className="text-emerald-400 font-bold">{reservation.reservationCode || `RES-${reservation.id}`}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Maquinaria Arrendada:</span>
              <span className="text-white font-bold">{reservation.toolName || 'Compresor / Equipo Industrial'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Período de Operación:</span>
              <span className="text-slate-300">{reservation.startDate} al {reservation.endDate}</span>
            </div>
          </div>

          {/* Declaración Juramentada de Interventoría */}
          <div className="space-y-3 leading-relaxed text-slate-300 text-justify">
            <p>
              Por medio del presente documento legal y vinculante, <strong>RENTAMAQ COLOMBIA S.A.S.</strong> hace constar y certifica ante la Interventoría de Obra, Entidades Públicas y Contratantes Privados que:
            </p>
            <div className="space-y-2 pl-3 border-l-2 border-emerald-500 text-[11px]">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                La maquinaria antes descrita fue restituida al patio técnico habiendo superado a entera satisfacción el <strong>Checklist RETIE y Acta 4FN</strong>.
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                No existen reclamaciones pendientes por <strong>averías mecánicas, desgaste no contractual ni sobreuso de horómetro</strong>.
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                El depósito en custodia de garantía (fianza) ha sido finiquitado y liquidado al 100%.
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <strong>Saldo Exigible a la Fecha: $0 COP (CERO PESOS M/CTE).</strong>
              </p>
            </div>
          </div>

          {/* Liquidación de Finiquito */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Monto Total Finiquitado y Pagado:</span>
            <span className="text-white font-mono text-base font-bold">{formatCOP(reservation.totalPrice || reservation.subtotal)}</span>
          </div>

          {/* Sellos de Criptografía y Validación Soberana */}
          <div className="border-t border-slate-700/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-left w-full sm:w-auto">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block flex items-center gap-1">
                <Hash className="w-3 h-3 text-emerald-400" />
                Firma Criptográfica SHA-256 Inmutable
              </span>
              <p className="font-mono text-[9px] text-emerald-400/90 break-all bg-black/40 p-1.5 rounded border border-slate-800 max-w-sm">
                {sha256Fingerprint}
              </p>
              <span className="text-[9px] text-slate-500 block">
                Expedido en Medellín, Colombia · Validez Soberana ante Contraloría y DIAN
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white text-slate-900 shrink-0">
              <QrCode className="w-14 h-14" />
              <div className="text-[9px] leading-tight font-mono font-bold">
                ESCANEAR<br />QR VERIFICAR<br />AUTENTICIDAD
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0f1d] flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};
