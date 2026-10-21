import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { 
  X, 
  Trash2, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  SlidersHorizontal, 
  ArrowRight, 
  Percent,
  Plus,
  Minus,
  Wrench,
  Lock,
  Building
} from 'lucide-react';
import { formatImageUrl, handleImageError } from '../../utils/imageUtils';
import { PaymentModal } from '../client/PaymentModal';
import { Reservation } from '../../types';

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

  if (!isQuoteDrawerOpen && !pendingPaymentReservation) return null;

  // Cálculos consolidados
  let subtotalSinDescuento = 0;
  let totalDescuento = 0;
  let totalDepositos = 0;

  cart.forEach(item => {
    const itemSubtotal = item.tool.baseDailyPrice * item.days;
    subtotalSinDescuento += itemSubtotal;
    if (item.days >= 7) {
      totalDescuento += itemSubtotal * 0.15;
    }
    totalDepositos += item.tool.depositAmount;
  });

  const subtotalNeto = subtotalSinDescuento - totalDescuento;
  const iva = subtotalNeto * 0.19;
  const granTotal = subtotalNeto + iva + totalDepositos;

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

        const created = await rentaService.reservations.create({
          clientId: user.clientId || user.id || 1,
          toolId: item.tool.id,
          startDate: startDate,
          endDate: endDateStr,
          paymentMethod: paymentMethod,
          installmentCount: paymentMethod === 'EN_CUOTAS' ? installmentCount : 1,
          notes: 'Reserva emitida desde Cotizador Web'
        });

        if (!firstCreatedRes) {
          firstCreatedRes = created;
        }
      }

      clearCart();
      setIsQuoteDrawerOpen(false);

      if (firstCreatedRes) {
        setPendingPaymentReservation(firstCreatedRes);
        showToast('¡Cotización aceptada! Procediendo a la ventana de pago...', 'success');
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
                {totalDescuento > 0 && (
                  <div className="flex justify-between text-[#4ade80] font-semibold">
                    <span>Ahorro Semanal (-15%):</span>
                    <span className="font-mono">-${totalDescuento.toLocaleString('es-CO')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#A8A69E]">
                  <span>IVA Legal (19%):</span>
                  <span className="font-mono text-[#F5F4F0]">${iva.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-[#A8A69E]">
                  <span>Depósitos en Custodia (Escrow):</span>
                  <span className="font-mono text-[#F5F4F0]">${totalDepositos.toLocaleString('es-CO')}</span>
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
