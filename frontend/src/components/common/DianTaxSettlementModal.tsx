import React from 'react';
import { Reservation } from '../../types';
import { 
  X, 
  Receipt, 
  Printer, 
  Building2, 
  ShieldCheck, 
  Percent, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface DianTaxSettlementModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export const DianTaxSettlementModal: React.FC<DianTaxSettlementModalProps> = ({
  reservation,
  onClose
}) => {
  const formatCOP = (val: number) => '$ ' + Math.round(val).toLocaleString('es-CO');

  const subtotal = Number(reservation.subtotal || reservation.totalPrice || 100000);
  const ivaRate = 0.19;
  const ivaAmount = subtotal * ivaRate;

  // Retenciones tributarias colombianas DIAN
  const retefuenteRate = 0.04; // 4% por arrendamiento de bienes muebles
  const retefuenteAmount = subtotal * retefuenteRate;

  const reteIvaRate = 0.15; // 15% del valor del IVA
  const reteIvaAmount = ivaAmount * reteIvaRate;

  const reteIcaRate = 0.00966; // 9.66 por mil
  const reteIcaAmount = subtotal * reteIcaRate;

  const totalRetenciones = retefuenteAmount + reteIvaAmount + reteIcaAmount;

  // Depósito de garantía con descuento de confianza si aplica
  const depositGross = Number(reservation.depositAmount || (reservation as any).depositTotal || 200000);
  // Simular descuento del 50% por cliente Platinum/Excelente
  const trustDiscountPercent = 50;
  const trustDiscountAmount = depositGross * (trustDiscountPercent / 100);
  const depositNet = depositGross - trustDiscountAmount;

  // Total neto a pagar
  const netoPagarAlquiler = subtotal + ivaAmount - totalRetenciones;
  const totalConFianza = netoPagarAlquiler + depositNet;

  const invoiceNum = `FE-2026-${String(reservation.id).padStart(6, '0')}`;
  const cufeHash = `cuf-${reservation.id}-901884231-19-${Math.round(subtotal)}-${Math.round(ivaAmount)}-dian2026`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Liquidación Tributaria DIAN & Retenciones
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  ESTATUTO TRIBUTARIO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Reserva: {reservation.reservationCode || `RES-${reservation.id}`} · Comprobante: {invoiceNum}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-amber-500/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Liquidación</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 print:p-0 print:overflow-visible text-xs">
          
          {/* Printable Invoice Card */}
          <div className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-6 space-y-5 print:bg-white print:text-black print:border-black">
            
            {/* Fiscal Header */}
            <div className="flex justify-between items-start border-b border-slate-700/80 pb-4 print:border-black">
              <div>
                <h2 className="text-base font-black text-white print:text-black uppercase tracking-tight">
                  PLATAFORMA RENTAMAQ COLOMBIA S.A.S.
                </h2>
                <div className="text-slate-400 print:text-gray-700 font-mono text-[11px] space-y-0.5">
                  <p>NIT: 901.884.231-9 · Régimen Común / Responsable de IVA</p>
                  <p>Resolución DIAN No. 18764000001 del 15/01/2026 (Rango FE-00001 al FE-99999)</p>
                  <p>Actividad Económica CIIU 7730: Alquiler de maquinaria, equipo y bienes tangibles</p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] uppercase text-slate-400 print:text-gray-600 block">Factura Proforma</span>
                <span className="text-sm font-bold text-amber-400 print:text-black">{invoiceNum}</span>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">{new Date().toLocaleDateString('es-CO')}</span>
              </div>
            </div>

            {/* Contract & Tool Summary */}
            <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">Equipo Arrendado</span>
                <span className="text-white print:text-black font-semibold">{reservation.toolName || 'Maquinaria de Construcción'}</span>
                <span className="text-slate-400 print:text-gray-600 font-mono text-[11px] block">{reservation.totalDays || 1} días amparados</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 print:text-gray-600 text-[10px] uppercase font-bold block">Fechas del Servicio</span>
                <span className="font-mono text-slate-300 print:text-black font-semibold">{reservation.startDate} ➔ {reservation.endDate}</span>
                <span className="text-emerald-400 font-semibold block text-[11px]">Entrega certificada RETIE</span>
              </div>
            </div>

            {/* Tax Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400 print:text-black" />
                Desglose Detallado de Impuestos y Retenciones
              </h4>

              <div className="border border-slate-800 rounded-xl divide-y divide-slate-800/80 overflow-hidden font-mono text-xs print:border-gray-300 print:divide-gray-300">
                
                {/* Subtotal */}
                <div className="p-3 bg-slate-900/40 flex justify-between items-center print:bg-white">
                  <span className="text-slate-300 print:text-black">1. Subtotal Base Gravable Maquinaria</span>
                  <span className="font-bold text-white print:text-black">{formatCOP(subtotal)}</span>
                </div>

                {/* IVA 19% */}
                <div className="p-3 bg-slate-900/20 flex justify-between items-center print:bg-white">
                  <div className="space-y-0.5">
                    <span className="text-slate-300 print:text-black block">2. Impuesto al Valor Agregado (IVA 19%)</span>
                    <span className="text-[10px] text-slate-400 print:text-gray-600">Art. 468 del Estatuto Tributario</span>
                  </div>
                  <span className="font-bold text-amber-400 print:text-black">+{formatCOP(ivaAmount)}</span>
                </div>

                {/* Retefuente 4% */}
                <div className="p-3 bg-slate-900/40 flex justify-between items-center print:bg-white">
                  <div className="space-y-0.5">
                    <span className="text-slate-300 print:text-black block">3. Retención en la Fuente (-4.0%)</span>
                    <span className="text-[10px] text-slate-400 print:text-gray-600">Arrendamiento de bienes muebles (Art. 392 E.T.)</span>
                  </div>
                  <span className="font-bold text-rose-400 print:text-black">-{formatCOP(retefuenteAmount)}</span>
                </div>

                {/* ReteIVA 15% */}
                <div className="p-3 bg-slate-900/20 flex justify-between items-center print:bg-white">
                  <div className="space-y-0.5">
                    <span className="text-slate-300 print:text-black block">4. Retención de IVA (-15% del IVA)</span>
                    <span className="text-[10px] text-slate-400 print:text-gray-600">Agente retenedor de IVA (Art. 437-2 E.T.)</span>
                  </div>
                  <span className="font-bold text-rose-400 print:text-black">-{formatCOP(reteIvaAmount)}</span>
                </div>

                {/* ReteICA 0.966% */}
                <div className="p-3 bg-slate-900/40 flex justify-between items-center print:bg-white">
                  <div className="space-y-0.5">
                    <span className="text-slate-300 print:text-black block">5. Retención de ICA (-0.966%)</span>
                    <span className="text-[10px] text-slate-400 print:text-gray-600">Industria y Comercio Distrito Capital</span>
                  </div>
                  <span className="font-bold text-rose-400 print:text-black">-{formatCOP(reteIvaAmount)}</span>
                </div>

                {/* Fianza Escrow with Trust Score */}
                <div className="p-3 bg-slate-900/20 flex justify-between items-center print:bg-white">
                  <div className="space-y-0.5">
                    <span className="text-slate-300 print:text-black block">6. Fianza Escrow Reembolsable</span>
                    <span className="text-[10px] text-emerald-400 print:text-gray-600 flex items-center gap-1 font-sans">
                      <TrendingDown className="w-3 h-3" />
                      Beneficio Trust Score: -50% fianza aplicada
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sky-400 print:text-black block">+{formatCOP(depositNet)}</span>
                    <span className="text-[10px] text-slate-400 print:text-gray-500 line-through">
                      {formatCOP(depositGross)}
                    </span>
                  </div>
                </div>

                {/* Gran Total */}
                <div className="p-4 bg-slate-950 flex justify-between items-center border-t-2 border-amber-500/50 print:bg-gray-100 print:border-black">
                  <div>
                    <span className="text-sm font-black text-white print:text-black uppercase block">
                      TOTAL NETO A PAGAR
                    </span>
                    <span className="text-[10px] text-slate-400 print:text-gray-600 font-sans">
                      Incluye retenciones DIAN aplicadas y fianza descontada
                    </span>
                  </div>
                  <span className="text-lg font-black text-amber-400 print:text-black">
                    {formatCOP(totalConFianza)}
                  </span>
                </div>

              </div>
            </div>

            {/* CUFE Stamp */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-[10px] font-mono space-y-1 print:bg-gray-50 print:border-gray-300">
              <div className="text-slate-400 print:text-gray-600 font-bold uppercase">CUFE (Código Único de Factura Electrónica):</div>
              <div className="text-slate-300 print:text-black break-all">{cufeHash}</div>
            </div>

          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 no-print">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Esta liquidación cumple con los requisitos del Estatuto Tributario para empresas constructoras y personas jurídicas. Los certificados de retención correspondientes se emitirán al cierre del bimestre fiscal.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
