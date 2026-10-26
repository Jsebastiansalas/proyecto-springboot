import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { 
  X, 
  Trash2, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle2, 
  SlidersHorizontal, 
  ArrowRight, 
  Percent,
  Plus,
  Minus,
  Wrench,
  Lock,
  Building,
  Tag,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  UserCheck,
  MapPin,
  PackageCheck
} from 'lucide-react';
import { formatImageUrl, handleImageError } from '../../utils/imageUtils';
import { PaymentModal } from '../client/PaymentModal';
import { Reservation, CouponValidationResult } from '../../types';

export const QuoteCartDrawer: React.FC = () => {
  const { 
    isQuoteDrawerOpen, 
    setIsQuoteDrawerOpen, 
    cart, 
    removeFromCart, 
    updateCartDays, 
    clearCart, 
    user, 
    setIsAuthModalOpen, 
    setActiveView,
    showToast 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'TARJETA_CREDITO' | 'PSE' | 'TRANSFERENCIA' | 'EN_CUOTAS'>('TARJETA_CREDITO');
  const [installmentCount, setInstallmentCount] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [submitting, setSubmitting] = useState(false);
  const [pendingPaymentReservation, setPendingPaymentReservation] = useState<Reservation | null>(null);

  // Estados examen: Seguro de daños y Cupón de descuento
  const [includeDamageWaiver, setIncludeDamageWaiver] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Estados examen lote 6: Régimen de Turnos (39), Operador (27), Consumibles (29), Geocercas (33), Idempotencia (31)
  const [workShift, setWorkShift] = useState<'TURNO_SENCILLO_8H' | 'DOBLE_TURNO_16H' | 'TRIPLE_TURNO_24H'>('TURNO_SENCILLO_8H');
  const [includeOperator, setIncludeOperator] = useState<boolean>(false);
  const [includeConsumablesKit, setIncludeConsumablesKit] = useState<boolean>(false);
  const [deliveryZone, setDeliveryZone] = useState<'METROPOLITANA' | 'INTERMUNICIPAL_FORANEA'>('METROPOLITANA');
  const [idempotencyKey] = useState<string>(() => crypto.randomUUID());

  if (!isQuoteDrawerOpen && !pendingPaymentReservation) return null;

  // Multiplicador por turno de trabajo
  const shiftMultiplier = workShift === 'TRIPLE_TURNO_24H' ? 2.20 : (workShift === 'DOBLE_TURNO_16H' ? 1.65 : 1.0);

  // Cálculos consolidados de cotización
  let subtotalSinDescuento = 0;
  let totalDescuentoSemanal = 0;
  let totalDescuentoCombo = 0;
  let totalDepositosBase = 0;
  let totalDaysSum = 0;

  // Descuento Paquete Combo: 10% en herramientas adicionales cuando se cotizan 2 o más
  const isMultiToolCombo = cart.length >= 2;

  cart.forEach((item, index) => {
    totalDaysSum += item.days;
    const itemSubtotal = Math.round(item.tool.baseDailyPrice * item.days * shiftMultiplier);
    subtotalSinDescuento += itemSubtotal;
    if (item.days >= 7) {
      totalDescuentoSemanal += itemSubtotal * 0.15;
    }
    if (isMultiToolCombo && index > 0) {
      totalDescuentoCombo += Math.round(itemSubtotal * 0.10);
    }
    totalDepositosBase += item.tool.depositAmount;
  });

  const costoOperador = includeOperator ? (totalDaysSum * 80000) : 0;
  const costoConsumibles = includeConsumablesKit ? 45000 : 0;
  const sobretasaGeocerca = deliveryZone === 'INTERMUNICIPAL_FORANEA' ? 120000 : 0;

  const subtotalNetoPrevio = Math.max(0, subtotalSinDescuento - totalDescuentoSemanal - totalDescuentoCombo + costoOperador + costoConsumibles + sobretasaGeocerca);
  const descuentoCupon = appliedCoupon?.valid ? (appliedCoupon.discountAmount ?? 0) : 0;
  const subtotalNeto = Math.max(0, subtotalNetoPrevio - descuentoCupon);

  // Seguro contra daños: 8% del subtotal neto de alquiler
  const costoSeguro = includeDamageWaiver ? Math.round(subtotalNeto * 0.08) : 0;

  // Base imponible para IVA (19%): subtotal neto + seguro
  const baseGravable = subtotalNeto + costoSeguro;
  const iva = Math.round(baseGravable * 0.19);

  // Depósito en custodia Escrow: se reduce al 50% si adquiere seguro contra daños
  const totalDepositos = includeDamageWaiver ? Math.round(totalDepositosBase * 0.5) : totalDepositosBase;

  const granTotal = baseGravable + iva + totalDepositos;

  // Manejador para aplicar y validar cupón promocional contra el backend
  const handleApplyCoupon = async (codeToUse?: string) => {
    const code = (codeToUse || couponCode).trim().toUpperCase();
    if (!code) {
      showToast('Por favor ingresa un código de cupón.', 'error');
      return;
    }
    setValidatingCoupon(true);
    setCouponMessage(null);
    try {
      const totalDays = cart.reduce((acc, it) => acc + it.days, 0);
      const avgDays = Math.max(1, Math.round(totalDays / (cart.length || 1)));
      const res = await rentaService.coupons.validate(
        code,
        subtotalNetoPrevio,
        avgDays,
        startDate
      );
      if (res.valid) {
        setAppliedCoupon(res);
        setCouponCode(code);
        setCouponMessage({
          text: res.message || `Cupón ${code} aplicado (-${res.discountPercentage || 0}%)`,
          isError: false
        });
        showToast(res.message || `¡Cupón ${code} validado exitosamente!`, 'success');
      } else {
        setAppliedCoupon(null);
        setCouponMessage({
          text: res.message || 'Cupón no válido o requisitos no cumplidos',
          isError: true
        });
        showToast(res.message || 'Cupón no válido', 'error');
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponMessage({
        text: err.message || 'Error al validar cupón',
        isError: true
      });
      showToast(`Error al validar cupón: ${err.message}`, 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage(null);
    showToast('Cupón promocional removido.', 'info');
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      showToast('Por favor inicia sesión como Contratista para formalizar la reserva.', 'info');
      return;
    }

    if (cart.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    if (!startDate || startDate < todayStr) {
      showToast('La fecha de entrega en obra no puede ser anterior al día de hoy.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let firstCreatedRes: Reservation | null = null;
      // Crear reservaciones en paralelo o secuencial
      for (const item of cart) {
        const [y, m, d] = startDate.split('-').map(Number);
        const endDateObj = new Date(y, m - 1, d + item.days - 1);
        const endYear = endDateObj.getFullYear();
        const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
        const endDay = String(endDateObj.getDate()).padStart(2, '0');
        const endDateStr = `${endYear}-${endMonth}-${endDay}`;

        const noteText = appliedCoupon?.valid 
          ? `Reserva con Cupón ${appliedCoupon.couponCode || couponCode} (-$${descuentoCupon.toLocaleString('es-CO')})`
          : 'Reserva emitida desde Cotizador Web';

        const created = await rentaService.reservations.create({
          clientId: user.clientId || user.id || 1,
          toolId: item.tool.id,
          startDate: startDate,
          endDate: endDateStr,
          paymentMethod: paymentMethod,
          installmentCount: paymentMethod === 'EN_CUOTAS' ? installmentCount : 1,
          notes: noteText,
          includeDamageWaiver: includeDamageWaiver
        });

        if (!firstCreatedRes) {
          firstCreatedRes = created;
        }
      }

      clearCart();
      setIsQuoteDrawerOpen(false);

      if (firstCreatedRes) {
        setPendingPaymentReservation(firstCreatedRes);
        showToast('¡Cotización formalizada con éxito! Procediendo a la pasarela de pago...', 'success');
      } else {
        setActiveView('client');
      }
    } catch (err: any) {
      showToast(`Error al procesar reserva: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {isQuoteDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setIsQuoteDrawerOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#181816] border-l border-[#363632] flex flex-col shadow-2xl text-[#F5F4F0]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#363632] bg-[#141412] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D94E1F] flex items-center justify-center text-white shadow-xs">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F4F0] tracking-tight">
                  Cotización Activa de Obra
                </h3>
                <p className="text-xs text-[#A8A69E]">
                  {cart.length} {cart.length === 1 ? 'equipo seleccionado' : 'equipos seleccionados'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsQuoteDrawerOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#232320] hover:bg-[#282824] text-[#A8A69E] hover:text-[#F5F4F0] border border-[#363632] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-[#141412] flex items-center justify-center text-[#706E66] mx-auto border border-[#363632]">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div className="text-[#F5F4F0] font-semibold text-sm">Tu cotización está vacía</div>
                <p className="text-xs text-[#A8A69E] max-w-xs mx-auto">
                  Explora el catálogo y añade la maquinaria requerida para tu cuadrilla o frente de trabajo.
                </p>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {cart.map(item => {
                    const hasDiscount = item.days >= 7;
                    const itemSubtotal = item.tool.baseDailyPrice * item.days;
                    const itemDiscount = hasDiscount ? itemSubtotal * 0.15 : 0;

                    return (
                      <div
                        key={item.tool.id}
                        className="p-3.5 rounded-xl bg-[#1E1E1C] border border-[#363632] space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-[#141412] border border-[#363632] overflow-hidden shrink-0 flex items-center justify-center">
                              <img 
                                src={formatImageUrl(item.tool.mainImageUrl)} 
                                alt={item.tool.name} 
                                className="w-full h-full object-cover" 
                                onError={handleImageError}
                              />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#F5F4F0] line-clamp-1">{item.tool.name}</h4>
                              <div className="text-[11px] text-[#A8A69E] font-mono">
                                {item.tool.brand} · SKU: {item.tool.codeSku}
                              </div>
                              <div className="text-[11px] text-[#D94E1F] font-mono font-bold">
                                ${item.tool.baseDailyPrice.toLocaleString('es-CO')} /día
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.tool.id)}
                            className="text-[#706E66] hover:text-rose-400 p-1"
                            title="Eliminar de cotización"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Rental Days Interactive Stepper */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#363632] text-xs">
                          <div>
                            <span className="text-[#A8A69E]">Días de Alquiler:</span>
                            <span className="block text-[10px] text-[#706E66] font-mono">Máx. 30 días (1 mes)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateCartDays(item.tool.id, Math.max(1, item.days - 1))}
                              disabled={item.days <= 1}
                              className="w-6 h-6 rounded bg-[#232320] hover:bg-[#282824] disabled:opacity-30 disabled:cursor-not-allowed text-[#F5F4F0] flex items-center justify-center border border-[#363632] transition-colors"
                              title={item.days <= 1 ? 'Mínimo 1 día' : 'Disminuir días'}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold text-[#F5F4F0] px-2 min-w-[65px] text-center">
                              {item.days} {item.days === 1 ? 'día' : 'días'}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartDays(item.tool.id, Math.min(30, item.days + 1))}
                              disabled={item.days >= 30}
                              className="w-6 h-6 rounded bg-[#232320] hover:bg-[#282824] disabled:opacity-30 disabled:cursor-not-allowed text-[#F5F4F0] flex items-center justify-center border border-[#363632] transition-colors"
                              title={item.days >= 30 ? 'Límite alcanzado: máximo 30 días (1 mes)' : 'Aumentar días'}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Limit reached warning */}
                        {item.days >= 30 && (
                          <div className="text-[10px] text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20 font-mono text-center">
                            Límite máximo por contrato alcanzado: 30 días (1 mes)
                          </div>
                        )}

                        {/* Weekly Discount Pill */}
                        {hasDiscount ? (
                          <div className="flex items-center justify-between text-[11px] text-[#4ade80] bg-[#1E6F43]/20 px-2.5 py-1 rounded-lg border border-[#1E6F43]/40">
                            <span className="flex items-center gap-1 font-semibold">
                              <Percent className="w-3 h-3" /> Descuento Semanal (-15%)
                            </span>
                            <span className="font-mono font-bold">-${itemDiscount.toLocaleString('es-CO')}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#706E66] text-right font-mono">
                            * Añade {7 - item.days} días más para obtener 15% OFF
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Logistics & Delivery Date */}
                <div className="p-4 rounded-xl bg-[#1E1E1C] border border-[#363632] space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5F4F0] font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#D94E1F]" />
                    Fecha de Entrega en Obra
                  </div>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#141412] border border-[#363632] rounded-lg px-3 py-2 text-xs text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F] font-mono"
                  />
                  <div className="text-[11px] text-[#A8A69E] flex items-center gap-1.5">
                    <Building className="w-3 h-3 text-[#D94E1F] shrink-0" />
                    <span>Despacho en cama baja desde patio Suba Bogotá</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="p-4 rounded-xl bg-[#1E1E1C] border border-[#363632] space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5F4F0] font-mono">
                    <CreditCard className="w-3.5 h-3.5 text-[#D94E1F]" />
                    Método de Pago
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('TARJETA_CREDITO')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        paymentMethod === 'TARJETA_CREDITO'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/15 text-[#D94E1F] font-bold'
                          : 'border-[#363632] text-[#A8A69E] hover:bg-[#232320] hover:text-[#F5F4F0]'
                      }`}
                    >
                      Tarjeta de Crédito
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PSE')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        paymentMethod === 'PSE'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/15 text-[#D94E1F] font-bold'
                          : 'border-[#363632] text-[#A8A69E] hover:bg-[#232320] hover:text-[#F5F4F0]'
                      }`}
                    >
                      PSE Débito Bancario
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('TRANSFERENCIA')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        paymentMethod === 'TRANSFERENCIA'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/15 text-[#D94E1F] font-bold'
                          : 'border-[#363632] text-[#A8A69E] hover:bg-[#232320] hover:text-[#F5F4F0]'
                      }`}
                    >
                      Transferencia Bancaria
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('EN_CUOTAS')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        paymentMethod === 'EN_CUOTAS'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/15 text-[#D94E1F] font-bold'
                          : 'border-[#363632] text-[#A8A69E] hover:bg-[#232320] hover:text-[#F5F4F0]'
                      }`}
                    >
                      Plan en Cuotas
                    </button>
                  </div>

                  {paymentMethod === 'EN_CUOTAS' && (
                    <div className="pt-2 border-t border-[#363632] flex items-center justify-between text-xs">
                      <span className="text-[#A8A69E]">Número de cuotas:</span>
                      <select
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(Number(e.target.value))}
                        className="bg-[#141412] border border-[#363632] rounded-lg px-2 py-1 text-xs text-[#F5F4F0]"
                      >
                        <option value={3}>3 Cuotas Mensuales</option>
                        <option value={6}>6 Cuotas Mensuales</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Régimen de Turnos (Funcionalidad 39) */}
                <div className="p-4 rounded-xl bg-[#1E1E1C] border border-[#363632] space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#F5F4F0] font-mono">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#D94E1F]" />
                      Régimen de Turnos (Jornada)
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">
                      {workShift === 'TURNO_SENCILLO_8H' ? '1.0x Base' : (workShift === 'DOBLE_TURNO_16H' ? '1.65x (+65%)' : '2.20x (+120%)')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setWorkShift('TURNO_SENCILLO_8H')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        workShift === 'TURNO_SENCILLO_8H'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/15 text-[#D94E1F] font-bold'
                          : 'border-[#363632] text-[#A8A69E] hover:bg-[#232320]'
                      }`}
                    >
                      Diurno (8h)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkShift('DOBLE_TURNO_16H')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        workShift === 'DOBLE_TURNO_16H'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/15 text-[#D94E1F] font-bold'
                          : 'border-[#363632] text-[#A8A69E] hover:bg-[#232320]'
                      }`}
                    >
                      Doble (16h)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkShift('TRIPLE_TURNO_24H')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        workShift === 'TRIPLE_TURNO_24H'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/15 text-[#D94E1F] font-bold'
                          : 'border-[#363632] text-[#A8A69E] hover:bg-[#232320]'
                      }`}
                    >
                      🌙 24/7 Continuo
                    </button>
                  </div>
                </div>

                {/* Servicios de Obra & Logística (Funcionalidades 27, 29 y 33) */}
                <div className="p-4 rounded-xl bg-[#1E1E1C] border border-[#363632] space-y-3 shadow-xs">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#F5F4F0] font-mono flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-[#D94E1F]" />
                    Servicios de Obra & Logística
                  </div>

                  {/* Operador Certificado */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#141412] border border-[#363632] cursor-pointer hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={includeOperator}
                        onChange={(e) => setIncludeOperator(e.target.checked)}
                        className="rounded border-[#363632] text-[#D94E1F] focus:ring-0 accent-[#D94E1F]"
                      />
                      <div>
                        <span className="text-[#F5F4F0] font-semibold block">Operador / Maquinista SENA</span>
                        <span className="text-[10px] text-[#A8A69E]">Mitigación SST y curso de alturas</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-amber-400 font-bold">+$80.000/día</span>
                  </label>

                  {/* Kit Consumibles */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#141412] border border-[#363632] cursor-pointer hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={includeConsumablesKit}
                        onChange={(e) => setIncludeConsumablesKit(e.target.checked)}
                        className="rounded border-[#363632] text-[#D94E1F] focus:ring-0 accent-[#D94E1F]"
                      />
                      <div>
                        <span className="text-[#F5F4F0] font-semibold block">Kit Consumibles Diamantados</span>
                        <span className="text-[10px] text-[#A8A69E]">Brocas de impacto y discos de corte</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-amber-400 font-bold">+$45.000 COP</span>
                  </label>

                  {/* Geocerca Territorial */}
                  <div className="pt-2 border-t border-[#363632] space-y-1.5">
                    <label className="text-xs text-[#A8A69E] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#D94E1F]" /> Perímetro de Obra (Geocerca):
                      </span>
                      {deliveryZone === 'INTERMUNICIPAL_FORANEA' && (
                        <span className="text-[10px] font-mono text-rose-400 font-bold">+$120.000 Póliza Foránea</span>
                      )}
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value as any)}
                      className="w-full bg-[#141412] border border-[#363632] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F4F0] font-mono focus:outline-none focus:border-[#D94E1F]"
                    >
                      <option value="METROPOLITANA">Perímetro Urbano / Metropolitano (&le; 50 km) - Tarifa Estándar</option>
                      <option value="INTERMUNICIPAL_FORANEA">Zona Intermunicipal Foránea (&gt; 50 km) - Sobretasa Seguro</option>
                    </select>
                  </div>
                </div>

                {/* Seguro contra Daños Todo Riesgo */}
                <div className={`p-4 rounded-xl border transition-all ${
                  includeDamageWaiver 
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-xs' 
                    : 'bg-[#1E1E1C] border-[#363632]'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeDamageWaiver}
                      onChange={(e) => setIncludeDamageWaiver(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#363632] bg-[#141412] text-[#D94E1F] focus:ring-0 focus:ring-offset-0 accent-[#D94E1F]"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className={`w-4 h-4 ${includeDamageWaiver ? 'text-amber-400' : 'text-[#A8A69E]'}`} />
                        <span className="text-xs font-bold text-[#F5F4F0]">
                          Seguro Todo Riesgo de Daños
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          +8% Alquiler
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A8A69E] leading-relaxed">
                        Cubre averías operativas y desgaste accidental fortuito. <strong className="text-emerald-400 font-semibold">¡Reduce el depósito de garantía al 50%!</strong>
                      </p>
                      {includeDamageWaiver && (
                        <div className="text-[11px] font-mono text-emerald-400 pt-1 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Depósito reducido: ${totalDepositos.toLocaleString('es-CO')} (Ahorro fiduciario 50%)
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Cupón Promocional de Descuento */}
                <div className="p-4 rounded-xl bg-[#1E1E1C] border border-[#363632] space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5F4F0] font-mono">
                      <Tag className="w-3.5 h-3.5 text-[#D94E1F]" />
                      Cupón de Descuento
                    </div>
                    {appliedCoupon?.valid && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] text-[#A8A69E] hover:text-rose-400 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" /> Quitar
                      </button>
                    )}
                  </div>

                  {!appliedCoupon?.valid ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ej: OBRAS2026, EXAMEN10"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                          className="flex-1 bg-[#141412] border border-[#363632] rounded-lg px-3 py-2 text-xs text-[#F5F4F0] uppercase font-mono tracking-wider focus:outline-none focus:border-[#D94E1F]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="px-3.5 py-2 rounded-lg bg-[#282824] hover:bg-[#32322C] disabled:opacity-40 text-xs font-bold text-[#F5F4F0] border border-[#363632] transition-colors"
                        >
                          {validatingCoupon ? 'Validando...' : 'Aplicar'}
                        </button>
                      </div>

                      {/* Chips sugeridos para prueba rápida en examen */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="text-[#706E66]">Sugeridos:</span>
                        {['OBRAS2026', 'EXAMEN10', 'PROMO20'].map(chip => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setCouponCode(chip);
                              handleApplyCoupon(chip);
                            }}
                            className="px-2 py-0.5 rounded bg-[#141412] hover:bg-[#232320] text-[#A8A69E] hover:text-[#D94E1F] border border-[#363632] font-mono transition-colors"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      {couponMessage?.isError && (
                        <p className="text-[11px] text-rose-400 font-mono">
                          {couponMessage.text}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-emerald-300">
                            {appliedCoupon.couponCode || couponCode}
                          </span>
                          <span className="text-[#A8A69E] ml-1.5 text-[11px]">
                            (-{appliedCoupon.discountPercentage}%)
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        -${descuentoCupon.toLocaleString('es-CO')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Escrow Custody Assurance */}
                <div className="p-3 rounded-xl bg-[#1E6F43]/15 border border-[#1E6F43]/30 text-xs text-[#4ade80] space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                    Custodia Escrow Protegida
                  </div>
                  <p className="text-[11px] text-[#4ade80]/80 leading-relaxed">
                    Los depósitos en garantía quedan protegidos en cuenta fiduciaria y son reembolsados tras la firma del acta de devolución.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Summary & Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#363632] bg-[#141412] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#A8A69E]">
                  <span>Subtotal Alquiler:</span>
                  <span className="font-mono text-[#F5F4F0] font-bold">${subtotalSinDescuento.toLocaleString('es-CO')}</span>
                </div>
                {totalDescuentoSemanal > 0 && (
                  <div className="flex justify-between text-[#4ade80] font-semibold">
                    <span>Ahorro Semanal (-15%):</span>
                    <span className="font-mono">-${totalDescuentoSemanal.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {totalDescuentoCombo > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Descuento Paquete Multi-Equipo (-10%):</span>
                    </span>
                    <span className="font-mono">-${totalDescuentoCombo.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {descuentoCupon > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Cupón {appliedCoupon?.couponCode || couponCode} (-{appliedCoupon?.discountPercentage}%):</span>
                    <span className="font-mono">-${descuentoCupon.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {costoSeguro > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Seguro Daños Todo Riesgo (+8%):</span>
                    <span className="font-mono">+${costoSeguro.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {costoOperador > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Servicio Maquinista SENA (+$80k/d):</span>
                    <span className="font-mono">+${costoOperador.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {costoConsumibles > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Kit Consumibles Obra:</span>
                    <span className="font-mono">+${costoConsumibles.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {sobretasaGeocerca > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>Póliza Geocerca Intermunicipal:</span>
                    <span className="font-mono">+${sobretasaGeocerca.toLocaleString('es-CO')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#A8A69E]">
                  <span>IVA Legal (19%):</span>
                  <span className="font-mono text-[#F5F4F0]">${iva.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-[#A8A69E]">
                  <span className="flex items-center gap-1">
                    Depósitos en Custodia (Escrow):
                    {includeDamageWaiver && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                        -50% OFF
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[#F5F4F0]">
                    {includeDamageWaiver && (
                      <span className="line-through text-[#706E66] mr-1.5">${totalDepositosBase.toLocaleString('es-CO')}</span>
                    )}
                    ${totalDepositos.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#F5F4F0] pt-2 border-t border-[#363632]">
                  <span>Gran Total Liquidado:</span>
                  <span className="font-mono text-[#D94E1F] text-base font-black">
                    ${granTotal.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {submitting ? (
                  <span>Generando Contratos y Pasarela...</span>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-white" />
                    <span>Aceptar Cotización y Pagar Inmediatamente</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <span className="text-[10px] text-[#A8A69E] font-mono flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Transacción protegida con Idempotency-Key: {idempotencyKey.slice(0, 18)}...
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )}

  {/* Ventana de Pago después de aceptar la cotización */}
  {pendingPaymentReservation && (
    <PaymentModal
      reservation={pendingPaymentReservation}
      onClose={() => {
        setPendingPaymentReservation(null);
        setActiveView('client');
      }}
      onPaymentSuccess={() => {
        showToast('¡Pago efectuado con éxito de inmediato! Factura DIAN disponible.', 'success');
      }}
    />
  )}
</>
  );
};
