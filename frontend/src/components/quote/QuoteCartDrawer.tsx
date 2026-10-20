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

  if (!isQuoteDrawerOpen) return null;

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

    setSubmitting(true);
    try {
      // Crear reservaciones en paralelo o secuencial
      for (const item of cart) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + item.days);

        await rentaService.reservations.create({
          toolId: item.tool.id,
          startDate: startDate,
          endDate: end.toISOString().split('T')[0],
          paymentMethod: paymentMethod,
          installmentCount: paymentMethod === 'EN_CUOTAS' ? installmentCount : 1
        });
      }

      clearCart();
      setIsQuoteDrawerOpen(false);
      setActiveView('client');
      showToast('¡Contratos de alquiler generados exitosamente! Revisa el estado de despacho.', 'success');
    } catch (err: any) {
      showToast(`Error al procesar reserva: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-0" onClick={() => setIsQuoteDrawerOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F5] border-l border-[#D6D3C9] flex flex-col shadow-2xl text-[#181816]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#D6D3C9] bg-[#E8E5DC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D94E1F] flex items-center justify-center text-white shadow-xs">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#181816] tracking-tight">
                  Cotización Activa de Obra
                </h3>
                <p className="text-xs text-[#78766F]">
                  {cart.length} {cart.length === 1 ? 'equipo seleccionado' : 'equipos seleccionados'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsQuoteDrawerOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#FAF9F5] hover:bg-[#D6D3C9] text-[#181816] border border-[#D6D3C9] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-[#E8E5DC] flex items-center justify-center text-[#78766F] mx-auto border border-[#D6D3C9]">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div className="text-[#181816] font-semibold text-sm">Tu cotización está vacía</div>
                <p className="text-xs text-[#78766F] max-w-xs mx-auto">
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
                        className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#D6D3C9] space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-[#E8E5DC] border border-[#D6D3C9] overflow-hidden shrink-0 flex items-center justify-center">
                              {item.tool.mainImageUrl ? (
                                <img src={item.tool.mainImageUrl} alt={item.tool.name} className="w-full h-full object-cover" />
                              ) : (
                                <Wrench className="w-5 h-5 text-[#78766F]" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#181816] line-clamp-1">{item.tool.name}</h4>
                              <div className="text-[11px] text-[#78766F] font-mono">
                                {item.tool.brand} · SKU: {item.tool.codeSku}
                              </div>
                              <div className="text-[11px] text-[#D94E1F] font-mono font-bold">
                                ${item.tool.baseDailyPrice.toLocaleString('es-CO')} /día
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.tool.id)}
                            className="text-[#78766F] hover:text-[#B91C1C] p-1"
                            title="Eliminar de cotización"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Rental Days Interactive Stepper */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#D6D3C9] text-xs">
                          <span className="text-[#78766F]">Días de Alquiler:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartDays(item.tool.id, Math.max(1, item.days - 1))}
                              className="w-6 h-6 rounded bg-[#E8E5DC] hover:bg-[#D6D3C9] text-[#181816] flex items-center justify-center border border-[#D6D3C9]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold text-[#181816] px-2">
                              {item.days} {item.days === 1 ? 'día' : 'días'}
                            </span>
                            <button
                              onClick={() => updateCartDays(item.tool.id, item.days + 1)}
                              className="w-6 h-6 rounded bg-[#E8E5DC] hover:bg-[#D6D3C9] text-[#181816] flex items-center justify-center border border-[#D6D3C9]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Weekly Discount Pill */}
                        {hasDiscount ? (
                          <div className="flex items-center justify-between text-[11px] text-[#1E6F43] bg-[#E3F1E8] px-2.5 py-1 rounded-lg border border-[#A7D7B8]">
                            <span className="flex items-center gap-1 font-semibold">
                              <Percent className="w-3 h-3" /> Descuento Semanal (-15%)
                            </span>
                            <span className="font-mono font-bold">-${itemDiscount.toLocaleString('es-CO')}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#78766F] text-right font-mono">
                            * Añade {7 - item.days} días más para obtener 15% OFF
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Logistics & Delivery Date */}
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#D6D3C9] space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#181816] font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#D94E1F]" />
                    Fecha de Entrega en Obra
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#E8E5DC]/50 border border-[#D6D3C9] rounded-lg px-3 py-2 text-xs text-[#181816] focus:outline-none focus:border-[#D94E1F] font-mono"
                  />
                  <div className="text-[11px] text-[#78766F] flex items-center gap-1.5">
                    <Building className="w-3 h-3 text-[#D94E1F] shrink-0" />
                    <span>Despacho en cama baja desde patio Suba Bogotá</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#D6D3C9] space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#181816] font-mono">
                    <CreditCard className="w-3.5 h-3.5 text-[#D94E1F]" />
                    Método de Pago
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('TARJETA_CREDITO')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        paymentMethod === 'TARJETA_CREDITO'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/10 text-[#D94E1F] font-bold'
                          : 'border-[#D6D3C9] text-[#57564F] hover:bg-[#E8E5DC]'
                      }`}
                    >
                      Tarjeta de Crédito
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PSE')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        paymentMethod === 'PSE'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/10 text-[#D94E1F] font-bold'
                          : 'border-[#D6D3C9] text-[#57564F] hover:bg-[#E8E5DC]'
                      }`}
                    >
                      PSE Débito Bancario
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('TRANSFERENCIA')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        paymentMethod === 'TRANSFERENCIA'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/10 text-[#D94E1F] font-bold'
                          : 'border-[#D6D3C9] text-[#57564F] hover:bg-[#E8E5DC]'
                      }`}
                    >
                      Transferencia Bancaria
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('EN_CUOTAS')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        paymentMethod === 'EN_CUOTAS'
                          ? 'border-[#D94E1F] bg-[#D94E1F]/10 text-[#D94E1F] font-bold'
                          : 'border-[#D6D3C9] text-[#57564F] hover:bg-[#E8E5DC]'
                      }`}
                    >
                      Plan en Cuotas
                    </button>
                  </div>

                  {paymentMethod === 'EN_CUOTAS' && (
                    <div className="pt-2 border-t border-[#D6D3C9] flex items-center justify-between text-xs">
                      <span className="text-[#78766F]">Número de cuotas:</span>
                      <select
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(Number(e.target.value))}
                        className="bg-[#E8E5DC] border border-[#D6D3C9] rounded-lg px-2 py-1 text-xs text-[#181816]"
                      >
                        <option value={3}>3 Cuotas Mensuales</option>
                        <option value={6}>6 Cuotas Mensuales</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Escrow Custody Assurance */}
                <div className="p-3 rounded-xl bg-[#E3F1E8] border border-[#A7D7B8] text-xs text-[#1E6F43] space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1E6F43]" />
                    Custodia Escrow Protegida
                  </div>
                  <p className="text-[11px] text-[#1E6F43]/80 leading-relaxed">
                    Los depósitos en garantía quedan protegidos en cuenta fiduciaria y son reembolsados tras la firma del acta de devolución.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Summary & Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#D6D3C9] bg-[#E8E5DC] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#78766F]">
                  <span>Subtotal Alquiler:</span>
                  <span className="font-mono text-[#181816] font-bold">${subtotalSinDescuento.toLocaleString('es-CO')}</span>
                </div>
                {totalDescuento > 0 && (
                  <div className="flex justify-between text-[#1E6F43] font-semibold">
                    <span>Ahorro Semanal (-15%):</span>
                    <span className="font-mono">-${totalDescuento.toLocaleString('es-CO')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#78766F]">
                  <span>IVA Legal (19%):</span>
                  <span className="font-mono text-[#181816]">${iva.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-[#78766F]">
                  <span>Depósitos en Custodia (Escrow):</span>
                  <span className="font-mono text-[#181816]">${totalDepositos.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#181816] pt-2 border-t border-[#D6D3C9]">
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
                  <span>Generando Contratos...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-white" />
                    <span>Confirmar y Emitir Contrato</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
