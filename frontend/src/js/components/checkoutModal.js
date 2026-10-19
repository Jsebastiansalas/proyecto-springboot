/**
 * Modal de Liquidación, Stepper de 4 Pasos, Simulador de Cuotas y Pasarela 3D
 * Conforme a Emil Kowalski Philosophy, Apple Design & Validaciones de Alta Seguridad
 */

import state from '../modules/state.js';
import API from '../api.js';
import Toast from '../modules/toast.js';

export function initCheckoutModal() {
  const container = document.getElementById('checkout-modal-container');
  if (!container) return;

  const formatCOP = (n) => '$ ' + Number(n || 0).toLocaleString('es-CO') + ' COP';

  // Algoritmo de Luhn
  function validateLuhn(cardNumber) {
    const clean = cardNumber.replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  // Detección de franquicia
  function detectCardBrand(number) {
    const clean = number.replace(/\D/g, '');
    if (/^4/.test(clean)) return { brand: 'VISA', cvvLen: 3, mask: [4, 4, 4, 4] };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: 'MASTERCARD', cvvLen: 3, mask: [4, 4, 4, 4] };
    if (/^3[47]/.test(clean)) return { brand: 'AMEX', cvvLen: 4, mask: [4, 6, 5] };
    return { brand: 'GENERIC', cvvLen: 3, mask: [4, 4, 4, 4] };
  }

  // Cálculo financiero de cuotas
  function calculateInstallmentPlan(totalAmount, installments) {
    const n = parseInt(installments, 10) || 1;
    if (n <= 1) {
      return {
        installments: 1,
        monthlyRatePct: 0,
        monthlyRate: 0,
        installmentAmount: totalAmount,
        totalWithInterest: totalAmount,
        totalInterest: 0
      };
    }
    if (n === 3) {
      // 3 cuotas con 0% de interés de fomento para constructoras
      return {
        installments: 3,
        monthlyRatePct: 0,
        monthlyRate: 0,
        installmentAmount: Math.round(totalAmount / 3),
        totalWithInterest: totalAmount,
        totalInterest: 0
      };
    }

    // 6 y 12 cuotas con 1.8% TEM
    const i = 0.018;
    const factor = Math.pow(1 + i, n);
    const cuota = Math.round((totalAmount * i * factor) / (factor - 1));
    const totalPagar = cuota * n;

    return {
      installments: n,
      monthlyRatePct: 1.8,
      monthlyRate: i,
      installmentAmount: cuota,
      totalWithInterest: totalPagar,
      totalInterest: totalPagar - totalAmount
    };
  }

  function render(tool, existingReservation = null) {
    if (!tool && !existingReservation) {
      container.innerHTML = '';
      return;
    }

    const { bookingDates, user } = state.get();
    const baseTotal = existingReservation ? Number(existingReservation.totalAmount || 0) : Number(bookingDates.total || 0);

    // Estado del Stepper (Paso 1 a 4)
    let currentStep = 1;
    let selectedInstallments = 1;
    let currentPlan = calculateInstallmentPlan(baseTotal, 1);

    function updateStepView() {
      // Indicador visual de los 4 pasos
      const stepIndicators = [1, 2, 3, 4].map(s => {
        const isActive = s === currentStep;
        const isPast = s < currentStep;
        const stepClass = isActive 
          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' 
          : isPast 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
            : 'bg-slate-800 text-slate-400 border-slate-700';
        return `
          <div class="flex items-center gap-1.5 font-mono text-[11px]">
            <span class="w-5 h-5 rounded-full flex items-center justify-center border ${stepClass}">${isPast ? '✓' : s}</span>
            <span class="${isActive ? 'text-white font-bold' : 'text-slate-400'} hidden sm:inline">
              ${s === 1 ? 'Contrato' : s === 2 ? 'Financiación' : s === 3 ? 'Términos' : 'Pago'}
            </span>
            ${s < 4 ? '<span class="text-slate-600 mx-1">›</span>' : ''}
          </div>
        `;
      }).join('');

      container.querySelector('#stepper-indicators').innerHTML = stepIndicators;

      // Ocultar todos los pasos y mostrar el activo
      [1, 2, 3, 4].forEach(s => {
        const el = container.querySelector(`#step-${s}-content`);
        if (el) {
          if (s === currentStep) {
            el.classList.remove('hidden');
          } else {
            el.classList.add('hidden');
          }
        }
      });
    }

    const toolName = tool ? tool.name : (existingReservation.toolName || 'Maquinaria Industrial');

    container.innerHTML = `
      <div id="checkout-overlay" class="modal-overlay active">
        <div class="modal-dialog max-w-xl max-h-[92vh] flex flex-col">
          
          <!-- Encabezado con Stepper -->
          <div class="p-5 border-b border-hairline shrink-0">
            <div class="flex items-center justify-between mb-3">
              <div>
                <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">FORMALIZACIÓN DE ALQUILER</span>
                <h3 class="font-display font-black text-2xl uppercase tracking-tight text-main leading-tight">Liquidación de Faena</h3>
              </div>
              <button id="close-checkout-modal-btn" type="button" class="btn-industrial btn-ghost p-2 rounded-full" aria-label="Cerrar">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Stepper Bar -->
            <div id="stepper-indicators" class="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle border border-hairline">
              <!-- Se actualiza con updateStepView() -->
            </div>
          </div>

          <!-- Contenido del Paso Actual -->
          <div class="p-6 overflow-y-auto flex-1">
            
            <!-- ============================================== -->
            <!-- PASO 1: RESUMEN DE CONTRATO Y FECHAS -->
            <!-- ============================================== -->
            <div id="step-1-content" class="space-y-4">
              <div class="p-4 rounded-lg bg-surface-subtle border border-hairline">
                <span class="text-[10px] font-mono text-muted uppercase block">EQUIPO EN CONTRATO</span>
                <h4 class="font-display font-bold text-xl text-main uppercase">${toolName}</h4>
                <div class="font-mono text-xs text-muted mt-1">
                  ${bookingDates.days} día(s) de faena &bull; ${bookingDates.startDate} al ${bookingDates.endDate}
                </div>
              </div>

              <div class="space-y-2 font-mono text-xs p-4 rounded-lg bg-surface border border-hairline">
                <div class="flex justify-between text-muted">
                  <span>Alquiler neto diario (${bookingDates.days} días):</span>
                  <span class="text-main">${formatCOP(bookingDates.subtotal)}</span>
                </div>
                <div class="flex justify-between text-muted">
                  <span>IVA Régimen Común (19%):</span>
                  <span class="text-main">${formatCOP(bookingDates.subtotal * 0.19)}</span>
                </div>
                <div class="flex justify-between text-muted">
                  <span>Depósito de garantía (25% reembolsable):</span>
                  <span class="text-main">${formatCOP(bookingDates.deposit)}</span>
                </div>
                <div class="flex justify-between text-base font-bold text-amber-500 pt-2 border-t border-hairline">
                  <span>TOTAL ESTIMADO:</span>
                  <span>${formatCOP(baseTotal)}</span>
                </div>
              </div>

              <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded font-mono text-xs text-amber-300">
                • Incluye póliza All-Risk contra avería y certificado de aislamiento RETIE.
              </div>

              <div class="pt-4 flex justify-end">
                <button id="step-1-next-btn" type="button" class="btn-industrial btn-primary">
                  Siguiente: Modalidad de Pago →
                </button>
              </div>
            </div>

            <!-- ============================================== -->
            <!-- PASO 2: SIMULADOR DE CUOTAS Y FINANCIACIÓN -->
            <!-- ============================================== -->
            <div id="step-2-content" class="space-y-4 hidden">
              <div>
                <span class="font-mono text-xs font-bold text-muted uppercase block mb-2">SELECCIONA EL PLAN DE PAGO</span>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  <button type="button" class="installment-opt-btn p-3 rounded-lg border text-center transition-all bg-amber-500/10 border-amber-500 text-white font-mono" data-installments="1">
                    <span class="block text-xs font-bold">1 CUOTA</span>
                    <span class="block text-[10px] text-emerald-400">0% Interés</span>
                    <span class="block text-[11px] font-bold text-amber-400 mt-1">${formatCOP(baseTotal)}</span>
                  </button>

                  <button type="button" class="installment-opt-btn p-3 rounded-lg border text-center transition-all bg-surface border-hairline text-slate-300 font-mono" data-installments="3">
                    <span class="block text-xs font-bold">3 CUOTAS</span>
                    <span class="block text-[10px] text-emerald-400">0% Interés</span>
                    <span class="block text-[11px] font-bold text-amber-400 mt-1">${formatCOP(Math.round(baseTotal / 3))}/mes</span>
                  </button>

                  <button type="button" class="installment-opt-btn p-3 rounded-lg border text-center transition-all bg-surface border-hairline text-slate-300 font-mono" data-installments="6">
                    <span class="block text-xs font-bold">6 CUOTAS</span>
                    <span class="block text-[10px] text-amber-400">1.8% TEM</span>
                    <span class="block text-[11px] font-bold text-amber-400 mt-1">${formatCOP(calculateInstallmentPlan(baseTotal, 6).installmentAmount)}/mes</span>
                  </button>

                  <button type="button" class="installment-opt-btn p-3 rounded-lg border text-center transition-all bg-surface border-hairline text-slate-300 font-mono" data-installments="12">
                    <span class="block text-xs font-bold">12 CUOTAS</span>
                    <span class="block text-[10px] text-amber-400">1.8% TEM</span>
                    <span class="block text-[11px] font-bold text-amber-400 mt-1">${formatCOP(calculateInstallmentPlan(baseTotal, 12).installmentAmount)}/mes</span>
                  </button>

                </div>
              </div>

              <!-- Desglose Financiero Reactivo -->
              <div id="installment-simulation-box" class="p-4 rounded-lg bg-surface border border-hairline font-mono text-xs space-y-2">
                <!-- Se actualiza con selectInstallments() -->
              </div>

              <div class="pt-4 flex items-center justify-between">
                <button id="step-2-back-btn" type="button" class="btn-industrial btn-ghost">
                  ← Volver
                </button>
                <button id="step-2-next-btn" type="button" class="btn-industrial btn-primary">
                  Siguiente: Términos Contractuales →
                </button>
              </div>
            </div>

            <!-- ============================================== -->
            <!-- PASO 3: TÉRMINOS Y CONDICIONES CONTRACTUALES -->
            <!-- ============================================== -->
            <div id="step-3-content" class="space-y-4 hidden">
              <div>
                <span class="font-mono text-xs font-bold text-amber-500 uppercase block mb-1">CONDICIONES LEGALES DE FAENA</span>
                <h4 class="font-display font-bold text-lg text-main uppercase">Aceptación de Contrato de Arrendamiento</h4>
              </div>

              <div class="space-y-3 font-sans text-xs">
                
                <label class="flex items-start gap-3 p-3 rounded-lg bg-surface border border-hairline cursor-pointer hover:border-slate-600 transition-colors">
                  <input type="checkbox" id="chk-term-retie" class="w-4 h-4 accent-amber-500 mt-0.5" required />
                  <span class="text-slate-300 leading-relaxed">
                    Declaro que el equipo será operado exclusivamente por personal calificado portando los EPP reglamentarios y respetando la normativa técnica RETIE / Res. 4272.
                  </span>
                </label>

                <label class="flex items-start gap-3 p-3 rounded-lg bg-surface border border-hairline cursor-pointer hover:border-slate-600 transition-colors">
                  <input type="checkbox" id="chk-term-deposit" class="w-4 h-4 accent-amber-500 mt-0.5" required />
                  <span class="text-slate-300 leading-relaxed">
                    Acepto las condiciones de la póliza de avería All-Risk y entiendo que el depósito de garantía en custodia (${formatCOP(bookingDates.deposit)}) será reintegrado en patio tras la devolución física del activo.
                  </span>
                </label>

                <label class="flex items-start gap-3 p-3 rounded-lg bg-surface border border-hairline cursor-pointer hover:border-slate-600 transition-colors">
                  <input type="checkbox" id="chk-term-installments" class="w-4 h-4 accent-amber-500 mt-0.5" required />
                  <span class="text-slate-300 leading-relaxed">
                    Me comprometo al cumplimiento del cronograma de cuotas y amortización pactado en este contrato bajo la legislación comercial colombiana.
                  </span>
                </label>

              </div>

              <div class="pt-4 flex items-center justify-between">
                <button id="step-3-back-btn" type="button" class="btn-industrial btn-ghost">
                  ← Volver
                </button>
                <button id="step-3-next-btn" type="button" class="btn-industrial btn-primary">
                  Siguiente: Pasarela y Emisión →
                </button>
              </div>
            </div>

            <!-- ============================================== -->
            <!-- PASO 4: PASARELA 3D Y CONFIRMACIÓN -->
            <!-- ============================================== -->
            <div id="step-4-content" class="space-y-4 hidden">
              
              <!-- Tarjeta 3D Interactiva -->
              <div class="card-scene">
                <div id="interactive-card" class="credit-card-3d">
                  
                  <!-- Frente -->
                  <div class="card-face">
                    <div class="flex items-center justify-between">
                      <div class="w-10 h-7 rounded bg-amber-400/80 border border-amber-300 shadow-inner flex items-center justify-center">
                        <div class="w-6 h-4 border border-amber-600/40 rounded-sm"></div>
                      </div>
                      <span id="card-brand-label" class="font-display font-black tracking-wider text-base text-amber-400">TARJETA</span>
                    </div>

                    <div id="card-display-number" class="font-mono text-lg tracking-widest text-center text-slate-100 font-bold py-2">
                      •••• •••• •••• ••••
                    </div>

                    <div class="flex items-center justify-between font-mono text-[11px] text-slate-300 uppercase">
                      <div>
                        <span class="text-[8px] text-slate-400 block">TITULAR</span>
                        <span id="card-display-name" class="font-bold tracking-wider">${user?.fullName || 'OPERADOR AUTORIZADO'}</span>
                      </div>
                      <div class="text-right">
                        <span class="text-[8px] text-slate-400 block">VENCE</span>
                        <span id="card-display-exp" class="font-bold tracking-wider">MM/AA</span>
                      </div>
                    </div>
                  </div>

                  <!-- Reverso -->
                  <div class="card-face card-face-back">
                    <div class="magnetic-strip"></div>
                    <div class="cvv-panel">
                      <span class="text-[9px] text-slate-500 block">CVV / CVC</span>
                      <span id="card-display-cvv">•••</span>
                    </div>
                    <div class="px-6 text-[8px] font-mono text-slate-400 text-center uppercase tracking-widest mt-2">
                      SISTEMA SEGURO CERTIFICADO RETIE &bull; COBERTURA ALL-RISK
                    </div>
                  </div>

                </div>
              </div>

              <!-- Formulario de Tarjeta -->
              <form id="payment-form" class="space-y-3">
                <div>
                  <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Número de Tarjeta</label>
                  <div class="relative">
                    <input id="input-card-number" 
                           type="text" 
                           inputmode="numeric" 
                           maxlength="19" 
                           placeholder="4532 0158 9632 7412" 
                           class="input-industrial mono" 
                           required />
                    <span id="luhn-badge" class="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold px-2 py-0.5 rounded hidden"></span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Nombre en la Tarjeta</label>
                  <input id="input-card-name" 
                         type="text" 
                         placeholder="NOMBRE DEL TITULAR" 
                         value="${user?.fullName || ''}" 
                         class="input-industrial uppercase font-mono" 
                         required />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Vencimiento (MM/AA)</label>
                    <input id="input-card-exp" 
                           type="text" 
                           inputmode="numeric" 
                           maxlength="5" 
                           placeholder="12/28" 
                           class="input-industrial mono" 
                           required />
                  </div>
                  <div>
                    <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Código de Seguridad (CVV)</label>
                    <input id="input-card-cvv" 
                           type="password" 
                           inputmode="numeric" 
                           maxlength="3" 
                           placeholder="123" 
                           class="input-industrial mono" 
                           required />
                  </div>
                </div>

                <div class="p-3 bg-surface-subtle border border-hairline rounded flex items-center justify-between font-mono text-xs">
                  <span class="text-muted">CARGO A REALIZAR HOY:</span>
                  <span id="final-charge-label" class="font-bold text-amber-500 text-sm">${formatCOP(currentPlan.installmentAmount)}</span>
                </div>

                <div class="pt-3 border-t border-hairline flex items-center justify-between">
                  <button id="step-4-back-btn" type="button" class="btn-industrial btn-ghost">
                    ← Volver
                  </button>
                  <button id="submit-payment-btn" type="submit" class="btn-industrial btn-primary">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Confirmar Contrato y Pago
                  </button>
                </div>
              </form>

            </div>

          </div>

        </div>
      </div>
    `;

    // Lógica del Simulador de Cuotas
    function updateInstallmentsUI(n) {
      selectedInstallments = n;
      currentPlan = calculateInstallmentPlan(baseTotal, n);

      // Actualizar botones de selección
      container.querySelectorAll('.installment-opt-btn').forEach(btn => {
        const val = parseInt(btn.getAttribute('data-installments'), 10);
        if (val === n) {
          btn.className = 'installment-opt-btn p-3 rounded-lg border text-center transition-all bg-amber-500/10 border-amber-500 text-white font-mono';
        } else {
          btn.className = 'installment-opt-btn p-3 rounded-lg border text-center transition-all bg-surface border-hairline text-slate-300 font-mono';
        }
      });

      // Actualizar cuadro de simulación
      const box = container.querySelector('#installment-simulation-box');
      if (box) {
        box.innerHTML = `
          <div class="flex justify-between text-muted">
            <span>Modalidad de financiación:</span>
            <span class="text-main font-bold">${n === 1 ? 'Contado (1 sola exhibición)' : `${n} cuotas mensuales`}</span>
          </div>
          <div class="flex justify-between text-muted">
            <span>Tasa de interés mensual:</span>
            <span class="${currentPlan.monthlyRatePct === 0 ? 'text-emerald-400' : 'text-amber-400'} font-bold">
              ${currentPlan.monthlyRatePct}% TEM ${currentPlan.monthlyRatePct === 0 ? '(0% Interés)' : ''}
            </span>
          </div>
          <div class="flex justify-between text-muted">
            <span>Valor de la cuota mensual:</span>
            <span class="text-amber-400 font-bold">${formatCOP(currentPlan.installmentAmount)}</span>
          </div>
          ${currentPlan.totalInterest > 0 ? `
            <div class="flex justify-between text-muted">
              <span>Intereses totales financiamiento:</span>
              <span class="text-slate-300">${formatCOP(currentPlan.totalInterest)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between text-sm font-bold text-main pt-1 border-t border-hairline">
            <span>MONTO TOTAL A FINANCIAR:</span>
            <span class="text-amber-500">${formatCOP(currentPlan.totalWithInterest)}</span>
          </div>
        `;
      }

      const chargeLabel = container.querySelector('#final-charge-label');
      if (chargeLabel) {
        chargeLabel.textContent = formatCOP(currentPlan.installmentAmount);
      }
    }

    updateInstallmentsUI(1);

    container.querySelectorAll('.installment-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.currentTarget.getAttribute('data-installments'), 10);
        updateInstallmentsUI(val);
      });
    });

    // Control de Navegación del Stepper
    container.querySelector('#step-1-next-btn')?.addEventListener('click', () => {
      currentStep = 2;
      updateStepView();
    });

    container.querySelector('#step-2-back-btn')?.addEventListener('click', () => {
      currentStep = 1;
      updateStepView();
    });

    container.querySelector('#step-2-next-btn')?.addEventListener('click', () => {
      currentStep = 3;
      updateStepView();
    });

    container.querySelector('#step-3-back-btn')?.addEventListener('click', () => {
      currentStep = 2;
      updateStepView();
    });

    container.querySelector('#step-3-next-btn')?.addEventListener('click', () => {
      const chk1 = container.querySelector('#chk-term-retie');
      const chk2 = container.querySelector('#chk-term-deposit');
      const chk3 = container.querySelector('#chk-term-installments');

      if (!chk1.checked || !chk2.checked || !chk3.checked) {
        Toast.warning('Términos Obligatorios', 'Debes aceptar todas las condiciones legales y de seguridad para continuar.');
        return;
      }

      currentStep = 4;
      updateStepView();
    });

    container.querySelector('#step-4-back-btn')?.addEventListener('click', () => {
      currentStep = 3;
      updateStepView();
    });

    updateStepView();

    // Elementos Interactivos de la Tarjeta 3D
    const card3d = container.querySelector('#interactive-card');
    const inputNumber = container.querySelector('#input-card-number');
    const inputName = container.querySelector('#input-card-name');
    const inputExp = container.querySelector('#input-card-exp');
    const inputCvv = container.querySelector('#input-card-cvv');
    const luhnBadge = container.querySelector('#luhn-badge');

    const dispNumber = container.querySelector('#card-display-number');
    const dispName = container.querySelector('#card-display-name');
    const dispExp = container.querySelector('#card-display-exp');
    const dispCvv = container.querySelector('#card-display-cvv');
    const brandLabel = container.querySelector('#card-brand-label');

    // Flip al enfocar CVV
    inputCvv?.addEventListener('focus', () => card3d?.classList.add('flipped'));
    inputCvv?.addEventListener('blur', () => card3d?.classList.remove('flipped'));

    // Input número de tarjeta
    inputNumber?.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      const meta = detectCardBrand(val);

      if (brandLabel) brandLabel.textContent = meta.brand;
      if (inputCvv) inputCvv.maxLength = meta.cvvLen;

      val = val.substring(0, 16);
      const parts = val.match(/.{1,4}/g);
      const formatted = parts ? parts.join(' ') : val;

      e.target.value = formatted;
      if (dispNumber) dispNumber.textContent = formatted || '•••• •••• •••• ••••';

      if (val.length >= 15) {
        const isValid = validateLuhn(val);
        luhnBadge.classList.remove('hidden');
        if (isValid) {
          luhnBadge.className = 'absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
          luhnBadge.textContent = 'VÁLIDA';
        } else {
          luhnBadge.className = 'absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40';
          luhnBadge.textContent = 'INVÁLIDA';
        }
      } else {
        luhnBadge.classList.add('hidden');
      }
    });

    inputName?.addEventListener('input', (e) => {
      if (dispName) dispName.textContent = e.target.value.toUpperCase() || 'OPERADOR AUTORIZADO';
    });

    inputExp?.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      e.target.value = val;
      if (dispExp) dispExp.textContent = val || 'MM/AA';
    });

    inputCvv?.addEventListener('input', (e) => {
      const clean = e.target.value.replace(/\D/g, '');
      e.target.value = clean;
      if (dispCvv) dispCvv.textContent = clean || '•••';
    });

    // Cierre
    const closeModal = () => { container.innerHTML = ''; };
    container.querySelector('#close-checkout-modal-btn')?.addEventListener('click', closeModal);
    container.querySelector('#checkout-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'checkout-overlay') closeModal();
    });

    // Envío y Formalización
    container.querySelector('#payment-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const numVal = inputNumber.value.replace(/\D/g, '');
      const cvvVal = inputCvv.value.replace(/\D/g, '');
      const expVal = inputExp.value.trim();

      if (!validateLuhn(numVal)) {
        Toast.error('Tarjeta Inválida', 'El número de tarjeta no cumple el estándar bancario (Luhn).');
        inputNumber.focus();
        return;
      }

      const meta = detectCardBrand(numVal);
      if (cvvVal.length !== meta.cvvLen) {
        Toast.error('CVV Inválido', `Para ${meta.brand} el código de seguridad debe tener exactamente ${meta.cvvLen} dígitos.`);
        inputCvv.focus();
        return;
      }

      const [mm, yy] = expVal.split('/');
      const monthNum = parseInt(mm, 10);
      if (!monthNum || monthNum < 1 || monthNum > 12) {
        Toast.error('Vencimiento Inválido', 'El mes debe estar entre 01 y 12.');
        inputExp.focus();
        return;
      }

      const submitBtn = container.querySelector('#submit-payment-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Formalizando Alquiler y Pagando...
      `;

      try {
        let reservationId;
        if (existingReservation) {
          reservationId = existingReservation.id;
        } else {
          // 1. Crear Reserva con asignación a Obra
          const activeObra = state.getSelectedObra();
          const resPayload = {
            clientId: user?.clientId || user?.id || 1,
            toolId: tool.id,
            startDate: bookingDates.startDate,
            endDate: bookingDates.endDate,
            notes: `Imputación a ${activeObra ? activeObra.costCenter : 'C.C. 104'} - Póliza RETIE y Plan de Cuotas Formalizado`
          };
          const createdRes = await API.reservations.create(resPayload);
          reservationId = createdRes.id;
        }

        // 2. Procesar Pago con installmentCount
        const payPayload = {
          reservationId: reservationId,
          clientId: clientUser?.clientId || clientUser?.id || 1,
          paymentMethod: 'TARJETA_CREDITO',
          amount: baseTotal,
          installmentCount: selectedInstallments,
          transactionReference: `TX-BANK-${Date.now()}`
        };

        const payment = await API.payments.processPayment(payPayload);

        Toast.success('¡Alquiler Confirmado!', `Contrato #${reservationId} formalizado exitosamente.`);
        renderReceipt(reservationId, payment, toolName, selectedInstallments, currentPlan);
      } catch (err) {
        console.error('Error al procesar reserva:', err);
        Toast.error('Error en Transacción', err.message || 'No fue posible formalizar el alquiler.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Confirmar Contrato y Pago`;
      }
    });
  }

  // Comprobante Final con Código QR y Botón de Cuotas
  function renderReceipt(reservationId, payment, toolName, installmentCount, plan) {
    container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-dialog max-w-lg text-center p-8">
          
          <div class="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <span class="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">ACTA DIGITAL EMITIDA</span>
          <h3 class="font-display font-black text-2xl uppercase tracking-tight text-main mt-1">¡Contrato Formalizado!</h3>
          <p class="font-sans text-xs text-muted mt-1">Código QR válido para recepción de maquinaria en faena.</p>

          <!-- Código QR Generado -->
          <div class="my-5 p-4 bg-white rounded-xl inline-block shadow-lg border border-slate-200">
            <canvas id="receipt-qr-code" class="mx-auto"></canvas>
            <div class="mt-2 font-mono text-[10px] text-slate-800 font-bold uppercase tracking-wider">
              CONTRATO #${reservationId} &bull; ${toolName}
            </div>
          </div>

          <div class="space-y-1.5 font-mono text-xs text-left bg-surface-subtle p-4 rounded-lg border border-hairline mb-5">
            <div class="flex justify-between"><span class="text-muted">TRANSACCIÓN:</span><span class="font-bold text-main">${payment.transactionReference || 'APROBADA'}</span></div>
            <div class="flex justify-between"><span class="text-muted">MODALIDAD:</span><span class="font-bold text-amber-500">${installmentCount > 1 ? `${installmentCount} Cuotas (${formatCOP(plan.installmentAmount)}/mes)` : 'Contado (1 Cuota)'}</span></div>
            <div class="flex justify-between"><span class="text-muted">ESTADO PAGO:</span><span class="font-bold text-emerald-400">${payment.status || 'APROBADO'}</span></div>
          </div>

          <div class="flex gap-3">
            ${installmentCount > 1 ? `
              <button id="view-installments-receipt-btn" type="button" class="btn-industrial btn-outline flex-1">
                Ver Cronograma de Cuotas
              </button>
            ` : ''}
            <button id="finish-receipt-btn" type="button" class="btn-industrial btn-primary flex-1">
              Ir a Mis Reservas
            </button>
          </div>

        </div>
      </div>
    `;

    if (window.QRious) {
      new window.QRious({
        element: container.querySelector('#receipt-qr-code'),
        value: `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=RENTAMAQ-RES-${reservationId}-TX-${payment.id || Date.now()}`,
        size: 160
      });
    }

    container.querySelector('#view-installments-receipt-btn')?.addEventListener('click', () => {
      renderInstallmentsModal(reservationId);
    });

    container.querySelector('#finish-receipt-btn')?.addEventListener('click', () => {
      container.innerHTML = '';
      state.setView('client');
    });
  }

  // Modal Independiente de Cronograma de Cuotas
  async function renderInstallmentsModal(reservationId) {
    container.innerHTML = `
      <div id="installments-overlay" class="modal-overlay active">
        <div class="modal-dialog max-w-2xl max-h-[90vh] flex flex-col p-6">
          <div class="flex items-center justify-between pb-4 border-b border-hairline mb-4 shrink-0">
            <div>
              <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">CRONOGRAMA DE AMORTIZACIÓN</span>
              <h3 class="font-display font-black text-2xl uppercase tracking-tight text-main leading-tight">Plan de Cuotas Contrato #${reservationId}</h3>
            </div>
            <button id="close-inst-modal-btn" type="button" class="btn-industrial btn-ghost p-2 rounded-full">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div id="installments-modal-body" class="overflow-y-auto flex-1 space-y-4">
            <div class="text-center py-8 font-mono text-xs text-muted">Consultando cronograma bancario...</div>
          </div>
        </div>
      </div>
    `;

    const close = () => { container.innerHTML = ''; };
    container.querySelector('#close-inst-modal-btn')?.addEventListener('click', close);
    container.querySelector('#installments-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'installments-overlay') close();
    });

    async function loadInstallments() {
      const body = container.querySelector('#installments-modal-body');
      if (!body) return;

      try {
        const plan = await API.payments.getInstallments(reservationId);
        if (!plan || !plan.installments || plan.installments.length === 0) {
          body.innerHTML = `<div class="text-center py-8 font-mono text-xs text-muted">Este contrato no registra un plan de pagos a cuotas.</div>`;
          return;
        }

        body.innerHTML = `
          <!-- Resumen de Financiación -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-surface border border-hairline font-mono text-xs">
            <div>
              <span class="text-muted block text-[10px] uppercase">TOTAL CONTRATO</span>
              <span class="font-bold text-amber-500 text-sm">${formatCOP(plan.totalAmount)}</span>
            </div>
            <div>
              <span class="text-muted block text-[10px] uppercase">CUOTAS PAGADAS</span>
              <span class="font-bold text-emerald-400 text-sm">${plan.paidInstallments} / ${plan.installmentCount}</span>
            </div>
            <div>
              <span class="text-muted block text-[10px] uppercase">TOTAL PAGADO</span>
              <span class="font-bold text-main text-sm">${formatCOP(plan.totalPaid)}</span>
            </div>
            <div>
              <span class="text-muted block text-[10px] uppercase">SALDO PENDIENTE</span>
              <span class="font-bold text-rose-400 text-sm">${formatCOP(plan.pendingAmount)}</span>
            </div>
          </div>

          <!-- Tabla de Cuotas -->
          <div class="rounded-lg border border-hairline overflow-hidden">
            <table class="w-full text-left font-mono text-xs">
              <thead class="bg-surface-subtle text-muted text-[10px] uppercase border-b border-hairline">
                <tr>
                  <th class="p-3">N°</th>
                  <th class="p-3">Vencimiento</th>
                  <th class="p-3">Capital</th>
                  <th class="p-3">Interés</th>
                  <th class="p-3">Cuota</th>
                  <th class="p-3">Estado</th>
                  <th class="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-hairline">
                ${plan.installments.map(inst => {
                  const isPaid = inst.status === 'PAGADA';
                  const isDue = inst.status === 'VENCIDA';
                  const badgeClass = isPaid 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : isDue 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

                  return `
                    <tr class="hover:bg-surface-subtle/50 transition-colors">
                      <td class="p-3 font-bold text-main">#${inst.installmentNumber}</td>
                      <td class="p-3 text-slate-300">${inst.dueDate}</td>
                      <td class="p-3 text-slate-400">${formatCOP(inst.principalAmount)}</td>
                      <td class="p-3 text-slate-400">${formatCOP(inst.interestAmount)}</td>
                      <td class="p-3 font-bold text-amber-500">${formatCOP(inst.amount)}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}">
                          ${inst.status}
                        </span>
                      </td>
                      <td class="p-3 text-right">
                        ${!isPaid ? `
                          <button type="button" class="btn-pay-installment btn-industrial btn-primary btn-xs py-1 px-2.5" data-id="${inst.id}">
                            Abonar Cuota
                          </button>
                        ` : `
                          <span class="text-emerald-400 text-[11px] font-bold">✓ Pagada</span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;

        // Listeners para abonar cuota individual
        body.querySelectorAll('.btn-pay-installment').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const instId = e.currentTarget.getAttribute('data-id');
            btn.disabled = true;
            btn.textContent = 'Procesando...';
            try {
              await API.payments.payInstallment(instId);
              Toast.success('Abono Exitoso', 'La cuota ha sido registrada y pagada satisfactoriamente.');
              loadInstallments();
            } catch (err) {
              Toast.error('Error al Pagar Cuota', err.message || 'No fue posible registrar el abono.');
              btn.disabled = false;
              btn.textContent = 'Abonar Cuota';
            }
          });
        });

      } catch (err) {
        console.error('Error al cargar cuotas:', err);
        body.innerHTML = `<div class="text-center py-8 font-mono text-xs text-rose-400">Error al consultar cronograma de cuotas: ${err.message}</div>`;
      }
    }

    loadInstallments();
  }

  // Listeners de eventos de apertura
  window.addEventListener('modal:open', (e) => {
    if (e.detail?.modal === 'checkout') {
      render(e.detail.tool, e.detail.reservation);
    } else if (e.detail?.modal === 'installments') {
      renderInstallmentsModal(e.detail.reservationId);
    }
  });
}

export default initCheckoutModal;
