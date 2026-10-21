import React, { useState, useEffect } from 'react';
import { Reservation, PaymentInstallment, PaymentRecord, PaymentMethod } from '../../types';
import { rentaService } from '../../services/rentaService';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Calendar,
  AlertCircle,
  Copy,
  Check,
  Printer,
  FileText,
  Landmark,
  Layers,
  ArrowRight,
  Download,
  Smartphone,
  QrCode,
  Zap
} from 'lucide-react';
import { downloadPaymentReceiptPdf } from '../../utils/pdfGenerator';

interface PaymentModalProps {
  reservation: Reservation;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onOpenDianModal?: (reservation: Reservation) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  reservation,
  onClose,
  onPaymentSuccess,
  onOpenDianModal
}) => {
  const { showToast } = useApp();
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);
  const [installments, setInstallments] = useState<PaymentInstallment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [localPaid, setLocalPaid] = useState(false);

  // Estados para selección del método de pago
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    reservation.paymentMethod || 'TARJETA_CREDITO'
  );
  const [installmentChoice, setInstallmentChoice] = useState<number>(
    (reservation as any).installmentCount && (reservation as any).installmentCount > 1
      ? (reservation as any).installmentCount
      : 1
  );

  // Inputs según método
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(reservation.clientName || 'Cliente Constructora');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('982');
  
  const [pseBank, setPseBank] = useState('Bancolombia');
  const [psePersonType, setPsePersonType] = useState('NATURAL');
  const [pseDocType, setPseDocType] = useState('CC');
  const [pseDocNumber, setPseDocNumber] = useState('1098273645');

  const [walletType, setWalletType] = useState<'Nequi' | 'Daviplata'>('Nequi');
  const [walletPhone, setWalletPhone] = useState('310 492 8172');

  // Cargar registro de pago y cuotas desde el backend
  useEffect(() => {
    let isMounted = true;
    setLoadingRecord(true);

    rentaService.payments.getByReservation(reservation.id)
      .then((record) => {
        if (isMounted && record) {
          setPaymentRecord(record);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingRecord(false);
      });

    if (reservation.paymentMethod === 'EN_CUOTAS' || (reservation as any).installmentCount > 1) {
      rentaService.payments.getInstallments(reservation.id)
        .then(data => {
          if (isMounted) setInstallments(data || []);
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [reservation.id, reservation.paymentMethod]);

  const isPaid = Boolean(
    localPaid ||
    reservation.hasPayment ||
    reservation.paymentStatus === 'PAGADO' ||
    (reservation.paymentStatus as any) === 'COMPLETADO' ||
    paymentRecord != null
  );

  const formatCOP = (val?: number | null) => 
    '$ ' + Math.round(Number(val || 0)).toLocaleString('es-CO');

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTxn(true);
    showToast('Referencia copiada al portapapeles', 'info');
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const handlePayFull = async () => {
    if (isPaid) {
      showToast('Esta reserva ya cuenta con un pago verificado', 'info');
      return;
    }

    setLoading(true);
    try {
      const finalMethod = selectedMethod === 'EN_CUOTAS' ? 'TARJETA_CREDITO' : selectedMethod;
      const finalInstallments = selectedMethod === 'EN_CUOTAS' ? installmentChoice : 1;
      
      await rentaService.payments.process(
        reservation.id, 
        finalMethod, 
        finalInstallments, 
        reservation.totalPrice
      );
      
      setLocalPaid(true);
      showToast('¡Pago efectuado de inmediato con éxito! Factura DIAN generada.', 'success');
      onPaymentSuccess();

      // Recargar datos bancarios para mostrar comprobante de inmediato
      try {
        const rec = await rentaService.payments.getByReservation(reservation.id);
        if (rec) setPaymentRecord(rec);
      } catch {}
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
      showToast('Cuota cancelada de inmediato con éxito', 'success');
      const updated = await rentaService.payments.getInstallments(reservation.id);
      setInstallments(updated || []);
      onPaymentSuccess();
    } catch (err: any) {
      showToast(`Error al pagar cuota: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#121210] border border-[#363632] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden glass-modal max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#363632] bg-[#1a1a18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isPaid 
                ? 'bg-[#1E6F43]/20 border-[#1E6F43] text-[#4ade80]'
                : 'bg-[#D94E1F]/20 border-[#D94E1F] text-[#D94E1F]'
            }`}>
              {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#F5F4F0] tracking-tight">
                  {isPaid ? 'Comprobante de Venta & Liquidación' : 'Gestión de Pagos & Pasarela'}
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isPaid
                    ? 'bg-[#1E6F43]/20 text-[#4ade80] border-[#1E6F43]/40'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {isPaid ? 'PAGO VERIFICADO' : 'PENDIENTE DE PAGO'}
                </span>
              </div>
              <p className="text-xs text-[#A8A69E] font-mono mt-0.5">
                Reserva: <span className="text-[#F5F4F0] font-semibold">{reservation.reservationCode || `RES-${reservation.id}`}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-lg bg-[#242422] hover:bg-[#30302c] text-[#A8A69E] hover:text-[#F5F4F0] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">

          {/* Banner de Estado del Pago */}
          {isPaid ? (
            <div className="p-3.5 rounded-xl bg-[#1E6F43]/10 border border-[#1E6F43]/40 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#4ade80] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-[#4ade80] text-xs">
                  Transacción Financiera Aprobada & Liquidada Inmediatamente
                </p>
                <p className="text-[11px] text-[#A8A69E] leading-relaxed">
                  El pago total del contrato y la garantía Escrow se encuentran acreditados y custodiados bajo Póliza SURA N° 84920-B2B. No se requieren pagos adicionales.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Selecciona tu método de pago preferido para liquidar inmediatamente el contrato de alquiler y emitir la factura electrónica DIAN.
              </p>
            </div>
          )}

          {/* Tarjeta de Datos de Transacción Bancaria (si ya está pagado) */}
          {isPaid && (
            <div className="p-4 rounded-xl bg-[#181816] border border-[#363632] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#2a2a26]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8A69E]">
                  Detalles de la Transacción Bancaria
                </span>
                <span className="text-[11px] font-mono text-[#4ade80] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Pasarela Bancaria Conectada
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#706E66] block">Referencia TXN:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-[#F5F4F0] text-xs">
                      {paymentRecord?.transactionReference || `TXN-RES-${reservation.id}-CONF`}
                    </span>
                    <button
                      onClick={() => copyToClipboard(paymentRecord?.transactionReference || `TXN-RES-${reservation.id}-CONF`)}
                      className="p-1 rounded hover:bg-[#2a2a26] text-[#A8A69E] hover:text-[#F5F4F0] transition-colors"
                      title="Copiar Referencia"
                    >
                      {copiedTxn ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[#706E66] block">Autorización Pasarela:</span>
                  <span className="font-mono text-[#D94E1F] font-bold text-xs mt-0.5 block">
                    {paymentRecord?.gatewayReference || `GW-${reservation.id}-AUT`}
                  </span>
                </div>

                <div>
                  <span className="text-[#706E66] block">Fecha de Pago:</span>
                  <span className="text-[#F5F4F0] font-mono mt-0.5 block">
                    {paymentRecord?.paymentDate 
                      ? new Date(paymentRecord.paymentDate).toLocaleString('es-CO')
                      : 'Fecha Confirmada'}
                  </span>
                </div>

                <div>
                  <span className="text-[#706E66] block">Medio de Pago:</span>
                  <span className="text-[#F5F4F0] font-semibold mt-0.5 block">
                    {paymentRecord?.paymentMethod || selectedMethod || 'Tarjeta de Crédito'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Desglose Financiero Completo de la Venta */}
          <div className="p-4 rounded-xl bg-[#181816] border border-[#363632] space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a26]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8A69E]">
                Liquidación de Venta & Contrato
              </span>
              <span className="text-[11px] text-[#A8A69E] font-mono">
                {reservation.totalDays || 1} {Number(reservation.totalDays) === 1 ? 'día' : 'días'} de operación
              </span>
            </div>

            <div className="flex justify-between py-0.5">
              <span className="text-[#A8A69E]">Equipo en Alquiler:</span>
              <span className="text-[#F5F4F0] font-bold">{reservation.toolName}</span>
            </div>

            <div className="flex justify-between py-0.5">
              <span className="text-[#A8A69E]">Vigencia del Contrato:</span>
              <span className="text-[#F5F4F0] font-mono">
                {reservation.startDate || 'Inicio'} a {reservation.endDate || 'Fin'}
              </span>
            </div>

            <div className="flex justify-between py-0.5">
              <span className="text-[#A8A69E]">Subtotal Alquiler ({reservation.totalDays} d):</span>
              <span className="text-[#F5F4F0] font-mono">
                {formatCOP(reservation.subtotalPrice ?? (reservation as any).subtotal)}
              </span>
            </div>

            <div className="flex justify-between py-0.5">
              <span className="text-[#A8A69E]">IVA General (19%):</span>
              <span className="text-[#F5F4F0] font-mono">
                {formatCOP(reservation.taxAmount ?? Math.round(Number(reservation.subtotalPrice ?? (reservation as any).subtotal ?? 0) * 0.19))}
              </span>
            </div>

            <div className="flex justify-between py-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[#A8A69E]">Garantía en Custodia (Escrow):</span>
                <span className="text-[10px] text-sky-400 font-mono">(Reembolsable)</span>
              </div>
              <span className="text-sky-300 font-mono">
                {formatCOP(reservation.depositAmount ?? (reservation as any).depositTotal)}
              </span>
            </div>

            <div className="flex justify-between pt-2.5 border-t border-[#363632] text-sm font-black">
              <span className="text-[#F5F4F0]">
                {isPaid ? 'Total Liquidado & Pagado:' : 'Total a Liquidar:'}
              </span>
              <span className={`font-mono text-base ${isPaid ? 'text-[#4ade80]' : 'text-[#D94E1F]'}`}>
                {formatCOP(reservation.totalPrice ?? (reservation as any).totalAmount)}
              </span>
            </div>
          </div>

          {/* ================================================================= */}
          {/* VENTANA DE SELECCIÓN DE MÉTODOS DE PAGO (SI ESTÁ PENDIENTE)       */}
          {/* ================================================================= */}
          {!isPaid && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#A8A69E] block">
                  Métodos de Pago Disponibles
                </label>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Transacción Inmediata Cifrada
                </span>
              </div>

              {/* Grid de 4 Métodos de Pago */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Tarjeta de Crédito / Débito */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('TARJETA_CREDITO')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    selectedMethod === 'TARJETA_CREDITO'
                      ? 'bg-[#D94E1F]/15 border-[#D94E1F] text-[#F5F4F0] ring-1 ring-[#D94E1F]'
                      : 'bg-[#181816] border-[#363632] text-[#A8A69E] hover:border-[#4d4d47]'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 ${selectedMethod === 'TARJETA_CREDITO' ? 'text-[#D94E1F]' : 'text-[#706E66]'}`} />
                  <div>
                    <div className="font-bold text-xs text-white">Tarjeta Crédito</div>
                    <div className="text-[10px] text-[#A8A69E]">Visa, MC, Amex</div>
                  </div>
                </button>

                {/* 2. Débito PSE */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('PSE')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    selectedMethod === 'PSE'
                      ? 'bg-[#D94E1F]/15 border-[#D94E1F] text-[#F5F4F0] ring-1 ring-[#D94E1F]'
                      : 'bg-[#181816] border-[#363632] text-[#A8A69E] hover:border-[#4d4d47]'
                  }`}
                >
                  <Landmark className={`w-4 h-4 ${selectedMethod === 'PSE' ? 'text-[#D94E1F]' : 'text-[#706E66]'}`} />
                  <div>
                    <div className="font-bold text-xs text-white">Débito PSE</div>
                    <div className="text-[10px] text-[#A8A69E]">Bancos Colombia</div>
                  </div>
                </button>

                {/* 3. Billeteras Nequi / Daviplata */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('TRANSFERENCIA')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    selectedMethod === 'TRANSFERENCIA'
                      ? 'bg-[#D94E1F]/15 border-[#D94E1F] text-[#F5F4F0] ring-1 ring-[#D94E1F]'
                      : 'bg-[#181816] border-[#363632] text-[#A8A69E] hover:border-[#4d4d47]'
                  }`}
                >
                  <Smartphone className={`w-4 h-4 ${selectedMethod === 'TRANSFERENCIA' ? 'text-[#D94E1F]' : 'text-[#706E66]'}`} />
                  <div>
                    <div className="font-bold text-xs text-white">Nequi / Billeteras</div>
                    <div className="text-[10px] text-[#A8A69E]">Notificación Push</div>
                  </div>
                </button>

                {/* 4. En Cuotas */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('EN_CUOTAS')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    selectedMethod === 'EN_CUOTAS'
                      ? 'bg-[#D94E1F]/15 border-[#D94E1F] text-[#F5F4F0] ring-1 ring-[#D94E1F]'
                      : 'bg-[#181816] border-[#363632] text-[#A8A69E] hover:border-[#4d4d47]'
                  }`}
                >
                  <Layers className={`w-4 h-4 ${selectedMethod === 'EN_CUOTAS' ? 'text-[#D94E1F]' : 'text-[#706E66]'}`} />
                  <div>
                    <div className="font-bold text-xs text-white">En Cuotas</div>
                    <div className="text-[10px] text-[#A8A69E]">1 a 12 meses</div>
                  </div>
                </button>
              </div>

              {/* Formulario 1: Tarjeta de Crédito */}
              {selectedMethod === 'TARJETA_CREDITO' && (
                <div className="p-3.5 rounded-xl bg-[#181816] border border-[#363632] space-y-2.5 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#A8A69E] block mb-1">Número de Tarjeta</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#121210] border border-[#363632] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F4F0] font-mono"
                        placeholder="•••• •••• •••• ••••"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A8A69E] block mb-1">Titular de la Cuenta</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-[#121210] border border-[#363632] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F4F0]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#A8A69E] block mb-1">Vencimiento</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-[#121210] border border-[#363632] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F4F0] font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A8A69E] block mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        className="w-full bg-[#121210] border border-[#363632] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F4F0] font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A8A69E] block mb-1">Diferir Cuotas</label>
                      <select
                        value={installmentChoice}
                        onChange={(e) => setInstallmentChoice(Number(e.target.value))}
                        className="w-full bg-[#121210] border border-[#363632] rounded-lg px-2 py-1.5 text-xs text-[#F5F4F0]"
                      >
                        <option value={1}>1 cuota (Total)</option>
                        <option value={3}>3 cuotas</option>
                        <option value={6}>6 cuotas</option>
                        <option value={12}>12 cuotas</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario 2: PSE */}
              {selectedMethod === 'PSE' && (
                <div className="p-3.5 rounded-xl bg-[#181816] border border-[#363632] space-y-2.5 animate-in fade-in">
                  <div>
                    <label className="text-[10px] text-[#A8A69E] block mb-1">Selecciona tu Entidad Financiera</label>
                    <select
                      value={pseBank}
                      onChange={(e) => setPseBank(e.target.value)}
                      className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-xs text-[#F5F4F0]"
                    >
                      <option value="Bancolombia">Bancolombia</option>
                      <option value="Banco de Bogotá">Banco de Bogotá</option>
                      <option value="Davivienda">Davivienda</option>
                      <option value="BBVA Colombia">BBVA Colombia</option>
                      <option value="Banco de Occidente">Banco de Occidente</option>
                      <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                      <option value="Nequi">Nequi PSE</option>
                      <option value="Daviplata">Daviplata PSE</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#A8A69E] block mb-1">Tipo de Persona</label>
                      <select
                        value={psePersonType}
                        onChange={(e) => setPsePersonType(e.target.value)}
                        className="w-full bg-[#121210] border border-[#363632] rounded-lg px-2 py-1.5 text-xs text-[#F5F4F0]"
                      >
                        <option value="NATURAL">Natural</option>
                        <option value="JURIDICA">Jurídica (Empresa)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A8A69E] block mb-1">Tipo Documento</label>
                      <select
                        value={pseDocType}
                        onChange={(e) => setPseDocType(e.target.value)}
                        className="w-full bg-[#121210] border border-[#363632] rounded-lg px-2 py-1.5 text-xs text-[#F5F4F0]"
                      >
                        <option value="CC">C.C.</option>
                        <option value="NIT">NIT</option>
                        <option value="CE">C.E.</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A8A69E] block mb-1">N° Identificación</label>
                      <input
                        type="text"
                        value={pseDocNumber}
                        onChange={(e) => setPseDocNumber(e.target.value)}
                        className="w-full bg-[#121210] border border-[#363632] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F4F0] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario 3: Nequi / Billeteras */}
              {selectedMethod === 'TRANSFERENCIA' && (
                <div className="p-3.5 rounded-xl bg-[#181816] border border-[#363632] space-y-2.5 animate-in fade-in">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWalletType('Nequi')}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        walletType === 'Nequi' 
                          ? 'bg-[#D94E1F]/20 border-[#D94E1F] text-white' 
                          : 'bg-[#121210] border-[#363632] text-[#A8A69E]'
                      }`}
                    >
                      Nequi Colombia
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletType('Daviplata')}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        walletType === 'Daviplata' 
                          ? 'bg-[#D94E1F]/20 border-[#D94E1F] text-white' 
                          : 'bg-[#121210] border-[#363632] text-[#A8A69E]'
                      }`}
                    >
                      Daviplata
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8A69E] block mb-1">Número de Celular Registrado</label>
                    <input
                      type="tel"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-xs text-[#F5F4F0] font-mono"
                      placeholder="300 000 0000"
                    />
                  </div>
                  <p className="text-[10px] text-[#706E66] italic">
                    Al presionar pagar, se enviará una notificación push a tu app de {walletType} para autorizar el cobro instantáneamente.
                  </p>
                </div>
              )}

              {/* Formulario 4: En Cuotas */}
              {selectedMethod === 'EN_CUOTAS' && (
                <div className="p-3.5 rounded-xl bg-[#181816] border border-[#363632] space-y-3 animate-in fade-in">
                  <div>
                    <label className="text-[10px] text-[#A8A69E] block mb-1">Selecciona el Plazo de Financiación</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 3, 6, 12].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setInstallmentChoice(num)}
                          className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
                            installmentChoice === num
                              ? 'bg-[#D94E1F] border-[#D94E1F] text-white'
                              : 'bg-[#121210] border-[#363632] text-[#A8A69E] hover:text-white'
                          }`}
                        >
                          {num} {num === 1 ? 'Cuota' : 'Cuotas'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#121210] border border-[#2a2a26] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#A8A69E]">Valor aproximado por cuota:</span>
                    <span className="font-bold text-[#4ade80]">
                      {formatCOP(Math.round(Number(reservation.totalPrice ?? (reservation as any).totalAmount ?? 0) / installmentChoice))} / mes
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cuotas si ya están generadas en el backend */}
          {installments.length > 0 && (
            <div className="space-y-3 pt-1">
              <h4 className="font-bold uppercase tracking-wider text-[#A8A69E] text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D94E1F]" />
                <span>Cronograma de Cuotas Registrado</span>
              </h4>
              <div className="space-y-2">
                {installments.map(inst => (
                  <div
                    key={inst.id}
                    className="p-3 rounded-lg bg-[#181816] border border-[#363632] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#F5F4F0]">
                        Cuota {inst.installmentNumber} de {inst.totalInstallments}
                      </div>
                      <div className="text-[11px] text-[#A8A69E] font-mono flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#706E66]" />
                        Vence: {inst.dueDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#F5F4F0]">
                        {formatCOP(inst.amount)}
                      </span>
                      {inst.status === 'PAGADA' ? (
                        <span className="text-[#4ade80] bg-[#1E6F43]/20 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-[#1E6F43]/40">
                          <CheckCircle2 className="w-3 h-3" /> Pagada
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePayInstallment(inst.id)}
                          disabled={processingId === inst.id}
                          className="px-3.5 py-1.5 rounded-lg bg-[#D94E1F] hover:bg-[#E05A2B] text-white font-semibold text-[11px] transition-colors"
                        >
                          {processingId === inst.id ? 'Pagando...' : 'Pagar'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sello de Seguridad y Cifrado */}
          <div className="p-3 rounded-xl bg-[#181816] border border-[#363632] flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-[#D94E1F] shrink-0" />
            <p className="text-[11px] text-[#A8A69E] leading-relaxed">
              Transacción cifrada TLS 1.3 con convalidación bancaria, póliza SURA y timbrado automático de Factura Electrónica de Venta DIAN.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#363632] bg-[#1a1a18] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#242422] hover:bg-[#30302c] text-[#A8A69E] hover:text-[#F5F4F0] text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            {isPaid ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    downloadPaymentReceiptPdf(reservation, paymentRecord);
                    showToast('Comprobante de Pago PDF descargado con éxito', 'success');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#242422] hover:bg-[#30302c] text-[#F5F4F0] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#363632]"
                >
                  <Download className="w-3.5 h-3.5 text-[#4ade80]" />
                  <span>Descargar Soporte PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-[#242422] hover:bg-[#30302c] text-[#F5F4F0] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#363632]"
                >
                  <Printer className="w-3.5 h-3.5 text-[#A8A69E]" />
                  <span>Imprimir</span>
                </button>

                {onOpenDianModal && (
                  <button
                    type="button"
                    onClick={() => onOpenDianModal(reservation)}
                    className="px-4 py-2 rounded-xl bg-[#D94E1F] hover:bg-[#E05A2B] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Factura DIAN</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handlePayFull}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#D94E1F] hover:bg-[#E05A2B] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#D94E1F]/20 disabled:opacity-50"
              >
                {loading ? (
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>
                  {loading 
                    ? 'Efectuando Pago Inmediato...' 
                    : `Pagar Inmediatamente (${formatCOP(reservation.totalPrice ?? (reservation as any).totalAmount)})`}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
