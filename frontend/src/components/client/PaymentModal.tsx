import React, { useState, useEffect } from 'react';
import { Reservation, PaymentInstallment } from '../../types';
import { rentaService } from '../../services/rentaService';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface PaymentModalProps {
  reservation: Reservation;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  reservation,
  onClose,
  onPaymentSuccess
}) => {
  const { showToast } = useApp();
  const [installments, setInstallments] = useState<PaymentInstallment[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (reservation.paymentMethod === 'EN_CUOTAS') {
      rentaService.payments.getInstallments(reservation.id)
        .then(data => setInstallments(data))
        .catch(() => {});
    }
  }, [reservation]);

  const handlePayFull = async () => {
    setLoading(true);
    try {
      await rentaService.payments.process(reservation.id, reservation.paymentMethod);
      showToast('Pago procesado y verificado por pasarela segura', 'success');
      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      showToast(`Error al procesar pago: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async (installmentId: number) => {
    setProcessingId(installmentId);
    try {
      await rentaService.payments.payInstallment(installmentId);
      showToast('Cuota cancelada exitosamente', 'success');
      const updated = await rentaService.payments.getInstallments(reservation.id);
      setInstallments(updated);
      onPaymentSuccess();
    } catch (err: any) {
      showToast(`Error al pagar cuota: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E05A2B]/10 border border-[#D94E1F] flex items-center justify-center text-[#D94E1F]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Gestión de Pagos & Garantía
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Reserva: {reservation.reservationCode}
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

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Reservation Card Details */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Equipo en Alquiler:</span>
              <span className="text-white font-semibold">{reservation.toolName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duración:</span>
              <span className="text-slate-200 font-mono">{reservation.totalDays} días ({reservation.startDate} a {reservation.endDate})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal Alquiler:</span>
              <span className="text-slate-200 font-mono">${reservation.subtotalPrice.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">IVA (19%):</span>
              <span className="text-slate-200 font-mono">${reservation.taxAmount.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Garantía Escrow:</span>
              <span className="text-slate-200 font-mono">${reservation.depositAmount.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold">
              <span className="text-white">Total a Liquidar:</span>
              <span className="text-[#D94E1F] font-mono">${reservation.totalPrice.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Cuotas si aplica */}
          {reservation.paymentMethod === 'EN_CUOTAS' ? (
            <div className="space-y-3">
              <h4 className="font-semibold uppercase tracking-wider text-slate-400">
                Cronograma de Cuotas Mensuales
              </h4>
              <div className="space-y-2">
                {installments.map(inst => (
                  <div
                    key={inst.id}
                    className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        Cuota {inst.installmentNumber} de {inst.totalInstallments}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Vence: {inst.dueDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-200">
                        ${inst.amount.toLocaleString('es-CO')}
                      </span>
                      {inst.status === 'PAGADA' ? (
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Pagada
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePayInstallment(inst.id)}
                          disabled={processingId === inst.id}
                          className="px-3 py-1 rounded bg-[#D94E1F] hover:bg-[#E05A2B] text-white font-semibold text-[11px] transition-colors"
                        >
                          {processingId === inst.id ? 'Pagando...' : 'Pagar'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-[#D94E1F] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#D94E1F] shrink-0" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Transacción cifrada TLS 1.3 con validación biométrica bancaria y timbrado automático de factura DIAN.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>

          {reservation.paymentStatus !== 'PAGADO' && reservation.paymentMethod !== 'EN_CUOTAS' && (
            <button
              onClick={handlePayFull}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#D94E1F] hover:bg-[#E05A2B] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Procesando...' : 'Pagar Totalidad'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
