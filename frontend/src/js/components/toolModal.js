/**
 * Modal de Ficha Técnica, Cotización de Reserva y Muro Interactivo Q&A
 * Conforme a Emil Kowalski Philosophy & Precision UI
 */

import state from '../modules/state.js';
import API from '../api.js';
import Toast from '../modules/toast.js';

export function initToolModal() {
  const modalContainer = document.getElementById('tool-detail-modal-container');
  if (!modalContainer) return;

  function render(tool) {
    if (!tool) {
      modalContainer.innerHTML = '';
      return;
    }

    const { bookingDates, user } = state.get();
    const dailyPrice = Number(tool.baseDailyPrice || tool.pricePerDay || 0);
    const priceFormatted = dailyPrice.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    });

    const imageUrl = tool.mainImageUrl ? ('/' + tool.mainImageUrl.replace(/^\//, '')) : (tool.imageUrl || `/images/tools/HERR-${String(tool.id).padStart(4, '0')}.jpg`);

    // Fechas por defecto: Mañana a 3 días después
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);

    const defaultStart = bookingDates.startDate || tomorrow.toISOString().split('T')[0];
    const defaultEnd = bookingDates.endDate || threeDays.toISOString().split('T')[0];

    modalContainer.innerHTML = `
      <div id="tool-modal-overlay" class="modal-overlay active">
        <div class="modal-dialog max-w-2xl max-h-[90vh] flex flex-col">
          
          <!-- Encabezado con Botón Cerrar -->
          <div class="p-5 border-b border-hairline flex items-center justify-between shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">FICHA TÉCNICA DE EQUIPO</span>
                <span class="text-amber-400 font-mono text-xs">★ ${tool.averageRating ? Number(tool.averageRating).toFixed(1) : '5.0'} (${tool.totalReviews || 0} reseñas)</span>
              </div>
              <h3 class="font-display font-black text-2xl uppercase tracking-tight text-main leading-tight">${tool.name}</h3>
            </div>
            <button id="close-tool-modal-btn" type="button" class="btn-industrial btn-ghost p-2 rounded-full" aria-label="Cerrar Ficha">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido Central Scrollable -->
          <div class="p-6 space-y-6 overflow-y-auto flex-1">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div class="w-full h-56 rounded-lg bg-black overflow-hidden flex items-center justify-center border border-slate-700 shadow-inner">
                <img src="${imageUrl}" 
                     alt="${tool.name}" 
                     class="w-full h-full object-cover"
                     onerror="this.onerror=null; this.src='/images/tools/placeholder-tool.svg';" />
              </div>

              <div class="space-y-3 font-mono text-xs">
                <div class="flex justify-between py-1.5 border-b border-hairline">
                  <span class="text-muted">CÓDIGO DE ACTIVO</span>
                  <span class="font-bold text-main">HERR-${String(tool.id).padStart(4, '0')}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-hairline">
                  <span class="text-muted">FABRICANTE / MARCA</span>
                  <span class="font-bold text-main">${tool.brand || 'CATERPILLAR / PRO'}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-hairline">
                  <span class="text-muted">MODELO</span>
                  <span class="font-bold text-main">${tool.model || 'SERIE-INDUSTRIAL'}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-hairline">
                  <span class="text-muted">NORMATIVA</span>
                  <span class="font-bold text-emerald-500">RETIE CERTIFICADO</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-hairline">
                  <span class="text-muted">TARIFA DIARIA</span>
                  <span class="font-bold text-amber-500 text-sm">${priceFormatted}</span>
                </div>
              </div>
            </div>

            <p class="font-sans text-sm text-muted leading-relaxed">
              ${tool.description || 'Equipo para faena y obra civil con control de telemetría y mantenimiento al día.'}
            </p>

            <!-- Selector de Obra de Destino y Frente -->
            <div class="p-4 rounded-lg bg-surface-subtle border border-hairline space-y-3">
              <h4 class="font-display font-bold text-sm uppercase tracking-wider text-main">
                ASIGNACIÓN EN OBRA Y CENTRO DE COSTOS
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">PROYECTO / OBRA DE DESTINO</label>
                  <select id="modal-target-obra" class="input-industrial mono text-xs">
                    ${state.get().obras.map(o => `
                      <option value="${o.id}" ${o.id === state.get().selectedObraId ? 'selected' : ''}>
                        ${o.name} (${o.costCenter.split('-')[0].trim()})
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">FRENTE DE TRABAJO</label>
                  <select id="modal-work-front" class="input-industrial mono text-xs">
                    <option value="CIMENTACION">Frente 1: Cimentación y Demolición</option>
                    <option value="ESTRUCTURAS" selected>Frente 2: Concreto y Estructura</option>
                    <option value="ALTURAS">Frente 3: Trabajo en Alturas (Res. 4272)</option>
                    <option value="REDES">Frente 4: Redes RETIE y Energía</option>
                  </select>
                </div>
              </div>

              <!-- Modalidad de Tarifa: Diaria vs Plan Semanal Constructora -->
              <div class="pt-2">
                <label class="block text-xs font-mono font-bold text-muted uppercase mb-1.5">PLAN DE ARRENDAMIENTO</label>
                <div class="grid grid-cols-2 gap-2">
                  <label class="flex items-center gap-2 p-2.5 rounded border border-hairline bg-surface cursor-pointer select-none">
                    <input type="radio" name="rental-rate-type" value="daily" checked class="w-4 h-4 accent-amber-500" />
                    <div>
                      <span class="block text-xs font-bold text-main font-mono">TARIFA DIARIA</span>
                      <span class="block text-[10px] text-muted">${priceFormatted} / día</span>
                    </div>
                  </label>
                  <label class="flex items-center gap-2 p-2.5 rounded border border-amber-500/50 bg-amber-500/10 cursor-pointer select-none">
                    <input type="radio" name="rental-rate-type" value="weekly" class="w-4 h-4 accent-amber-500" />
                    <div>
                      <span class="block text-xs font-bold text-amber-500 font-mono">PLAN SEMANAL (-15%)</span>
                      <span class="block text-[10px] text-amber-600 dark:text-amber-400 font-bold">${(Math.round(dailyPrice * 0.85)).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} / día</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Selector de Fechas de Alquiler -->
            <div class="p-4 rounded-lg bg-surface-subtle border border-hairline">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-display font-bold text-sm uppercase tracking-wider text-main">
                  PROGRAMACIÓN DE FAENA Y COTIZACIÓN
                </h4>
                <button id="btn-print-quote" type="button" class="btn-industrial btn-outline btn-xs font-mono">
                  📄 Imprimir Cotización Formal
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">FECHA DE ENTREGA (OBRA)</label>
                  <input id="booking-start-date" type="date" class="input-industrial mono" value="${defaultStart}" />
                </div>
                <div>
                  <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">FECHA DE DEVOLUCIÓN</label>
                  <input id="booking-end-date" type="date" class="input-industrial mono" value="${defaultEnd}" />
                </div>
              </div>

              <!-- Desglose de Costos en Vivo -->
              <div id="booking-breakdown-box" class="pt-3 border-t border-hairline space-y-1.5 font-mono text-xs">
                <!-- Se actualiza reactivamente -->
              </div>
            </div>

            <!-- MURO INTERACTIVO DE PREGUNTAS Y RESPUESTAS (Q&A) -->
            <div class="p-4 rounded-lg bg-surface-subtle border border-hairline space-y-4">
              <div class="flex items-center justify-between border-b border-hairline pb-2">
                <div>
                  <h4 class="font-display font-bold text-sm uppercase tracking-wider text-main">
                    MURO DE CONSULTAS TÉCNICAS (Q&A)
                  </h4>
                  <span class="text-[10px] font-mono text-muted">Preguntas directas de contratistas y respuestas del proveedor</span>
                </div>
                <span id="qa-comments-count" class="font-mono text-xs text-amber-500 font-bold">Cargando...</span>
              </div>

              <!-- Listado de Preguntas -->
              <div id="qa-comments-list" class="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-hairline">
                <div class="text-center py-4 text-muted font-mono text-xs">Cargando consultas de obra...</div>
              </div>

              <!-- Formulario de Nueva Pregunta -->
              <div id="qa-post-box" class="pt-3 border-t border-hairline">
                ${user ? `
                  <div class="space-y-2">
                    <label class="block text-xs font-mono font-bold text-muted uppercase">Realizar una consulta técnica</label>
                    <div class="flex gap-2">
                      <input id="qa-comment-input" type="text" placeholder="Ej: ¿Qué tipo de toma eléctrica requiere este generador?" class="input-industrial flex-1 text-xs font-sans" />
                      <button id="qa-submit-comment-btn" type="button" class="btn-industrial btn-primary btn-sm shrink-0">
                        Preguntar
                      </button>
                    </div>
                  </div>
                ` : `
                  <div class="p-2.5 rounded bg-surface border border-hairline text-center text-xs font-mono text-muted">
                    <span>Para realizar consultas técnicas al proveedor, </span>
                    <button id="qa-login-btn" type="button" class="text-amber-500 font-bold underline">inicia sesión aquí</button>.
                  </div>
                `}
              </div>
            </div>

          </div>

          <!-- Pie del Modal: Acciones -->
          <div class="p-5 border-t border-hairline flex items-center justify-between bg-surface-subtle shrink-0">
            <button id="cancel-booking-btn" type="button" class="btn-industrial btn-ghost">
              Cancelar
            </button>
            <button id="proceed-to-checkout-btn" type="button" class="btn-industrial btn-primary">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Proceder a Liquidación y Pago
            </button>
          </div>

        </div>
      </div>
    `;

    // Cargar Preguntas y Respuestas (Q&A)
    async function loadQA() {
      const listEl = modalContainer.querySelector('#qa-comments-list');
      const countEl = modalContainer.querySelector('#qa-comments-count');
      if (!listEl) return;

      try {
        const comments = await API.comments.getByTool(tool.id);
        if (countEl) countEl.textContent = `${comments.length} consultas`;

        if (!comments || comments.length === 0) {
          listEl.innerHTML = `<div class="text-center py-4 text-muted font-sans text-xs">No hay consultas registradas para este equipo. ¡Sé el primero en preguntar!</div>`;
          return;
        }

        const isPrivileged = user && (user.role === 'PROVEEDOR' || user.role === 'ROLE_PROVEEDOR' || user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');

        listEl.innerHTML = comments.map(c => `
          <div class="pt-3 pb-2 space-y-1.5" data-comment-id="${c.id}">
            <div class="flex items-center justify-between text-[11px] font-mono">
              <div class="flex items-center gap-1.5">
                <strong class="text-main">${c.authorName || 'Contratista'}</strong>
                <span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px] uppercase">${c.authorRole || 'CLIENTE'}</span>
              </div>
              <span class="text-muted text-[10px]">${c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-CO') : ''}</span>
            </div>
            
            <p class="font-sans text-xs text-slate-200 leading-relaxed pl-1">
              ${c.commentText}
            </p>

            ${(c.providerReply || c.replied) ? `
              <div class="mt-2 ml-3 p-2.5 rounded bg-amber-500/10 border-l-2 border-amber-500 space-y-1">
                <div class="flex items-center justify-between text-[10px] font-mono">
                  <span class="text-amber-400 font-bold">✓ RESPUESTA PROVEEDOR PATIO</span>
                  <span class="text-muted">${c.repliedAt ? new Date(c.repliedAt).toLocaleDateString('es-CO') : ''}</span>
                </div>
                <p class="font-sans text-xs text-slate-300 leading-relaxed">
                  ${c.providerReply || c.replyText}
                </p>
              </div>
            ` : (isPrivileged ? `
              <div class="mt-2 ml-3 flex gap-2">
                <input type="text" placeholder="Responder como proveedor..." class="input-industrial flex-1 text-xs reply-input" />
                <button type="button" class="btn-industrial btn-outline btn-xs reply-btn" data-id="${c.id}">
                  Responder
                </button>
              </div>
            ` : '')}
          </div>
        `).join('');

        // Listeners para responder preguntas (Proveedor)
        listEl.querySelectorAll('.reply-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const commentId = e.currentTarget.getAttribute('data-id');
            const parent = e.currentTarget.closest('[data-comment-id]');
            const input = parent.querySelector('.reply-input');
            const replyText = input.value.trim();
            if (!replyText) {
              Toast.warning('Campo Vacío', 'Escribe una respuesta antes de enviar.');
              return;
            }

            try {
              btn.disabled = true;
              await API.comments.reply(commentId, replyText);
              Toast.success('Respuesta Publicada', 'Tu aclaración técnica está visible para todos.');
              loadQA();
            } catch (err) {
              Toast.error('Error al Responder', err.message || 'No fue posible registrar la respuesta.');
              btn.disabled = false;
            }
          });
        });

      } catch (err) {
        console.error('Error al cargar Q&A:', err);
        listEl.innerHTML = `<div class="text-center py-4 text-rose-400 font-mono text-xs">No fue posible sincronizar el muro de consultas.</div>`;
      }
    }

    loadQA();

    // Listener para publicar nueva pregunta
    modalContainer.querySelector('#qa-submit-comment-btn')?.addEventListener('click', async () => {
      const input = modalContainer.querySelector('#qa-comment-input');
      const text = input.value.trim();
      if (!text) {
        Toast.warning('Pregunta Vacía', 'Ingresa tu inquietud técnica sobre la maquinaria.');
        return;
      }

      try {
        const btn = modalContainer.querySelector('#qa-submit-comment-btn');
        btn.disabled = true;
        await API.comments.post(tool.id, text);
        Toast.success('Consulta Registrada', 'El proveedor ha recibido tu pregunta técnica.');
        input.value = '';
        btn.disabled = false;
        loadQA();
      } catch (err) {
        Toast.error('Error al Preguntar', err.message || 'No se pudo enviar la consulta.');
        modalContainer.querySelector('#qa-submit-comment-btn').disabled = false;
      }
    });

    modalContainer.querySelector('#qa-login-btn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'auth' } }));
    });

    // Estado del plan en el modal
    let isWeeklyRate = false;

    // Función para refrescar el desglose
    function updateBreakdown() {
      const { bookingDates } = state.get();
      const breakdownEl = modalContainer.querySelector('#booking-breakdown-box');
      if (!breakdownEl) return;

      const format = (n) => '$ ' + Number(n).toLocaleString('es-CO') + ' COP';
      const effectiveDaily = isWeeklyRate ? Math.round(dailyPrice * 0.85) : dailyPrice;
      const subtotal = effectiveDaily * bookingDates.days;
      const deposit = Math.round(subtotal * 0.25);
      const total = subtotal + deposit;

      // Actualizar state con la tarifa efectiva
      state.data.bookingDates.dailyRate = effectiveDaily;
      state.data.bookingDates.subtotal = subtotal;
      state.data.bookingDates.deposit = deposit;
      state.data.bookingDates.total = total;

      const obraTarget = state.getSelectedObra();

      breakdownEl.innerHTML = `
        <div class="flex justify-between text-muted">
          <span>Destino de despacho:</span>
          <span class="font-bold text-main">${obraTarget.name}</span>
        </div>
        <div class="flex justify-between text-muted">
          <span>Días de faena:</span>
          <span class="font-bold text-main">${bookingDates.days} día(s)</span>
        </div>
        <div class="flex justify-between text-muted">
          <span>Alquiler neto (${bookingDates.days} x ${format(effectiveDaily)}):</span>
          <span>${format(subtotal)} ${isWeeklyRate ? '<span class="text-emerald-500 font-bold">(-15%)</span>' : ''}</span>
        </div>
        <div class="flex justify-between text-muted">
          <span>Depósito de garantía reembolsable (25%):</span>
          <span>${format(deposit)}</span>
        </div>
        <div class="flex justify-between text-sm font-bold text-amber-500 pt-1 border-t border-hairline">
          <span>TOTAL ESTIMADO:</span>
          <span>${format(total)}</span>
        </div>
      `;
    }

    // Inicializar cálculo
    state.calculateBooking(defaultStart, defaultEnd);
    updateBreakdown();

    // Listeners de Obra y Plan
    modalContainer.querySelector('#modal-target-obra')?.addEventListener('change', (e) => {
      state.setObra(e.target.value);
      updateBreakdown();
    });

    modalContainer.querySelectorAll('input[name="rental-rate-type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        isWeeklyRate = e.target.value === 'weekly';
        updateBreakdown();
      });
    });

    // Listeners de fechas
    const startInput = modalContainer.querySelector('#booking-start-date');
    const endInput = modalContainer.querySelector('#booking-end-date');

    const onDateChange = () => {
      const s = startInput.value;
      const e = endInput.value;
      if (s && e && new Date(e) < new Date(s)) {
        Toast.warning('Fecha inválida', 'La fecha de devolución no puede ser anterior a la entrega.');
        endInput.value = s;
      }
      state.calculateBooking(startInput.value, endInput.value);
      updateBreakdown();
    };

    startInput?.addEventListener('change', onDateChange);
    endInput?.addEventListener('change', onDateChange);

    // Botón de Impresión de Cotización Formal
    modalContainer.querySelector('#btn-print-quote')?.addEventListener('click', () => {
      const { bookingDates, user: currentUser } = state.get();
      const format = (n) => '$ ' + Number(n).toLocaleString('es-CO') + ' COP';
      const quoteNo = `COT-2026-${tool.id}-${Date.now().toString().slice(-4)}`;
      const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cotización Formal ${quoteNo} - RentaMaq</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; }
            .meta { font-size: 12px; color: #64748b; font-family: monospace; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #b45309; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; font-family: monospace; font-size: 11px; text-transform: uppercase; }
            .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #0f172a; color: #0f172a; }
            .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">RENTAMAQ <span style="color:#f59e0b">S.A.S.</span></div>
              <div class="meta">NIT 901.554.210-8 • PATIO INDUSTRIAL DE MAQUINARIA</div>
              <div class="meta">Autopista Norte Km 19 • PBX: (601) 745-0000 • Bogotá D.C.</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold; color: #b45309;">${quoteNo}</div>
              <div class="meta">Fecha de Emisión: ${today}</div>
              <div class="meta" style="color: #059669; font-weight: bold;">VALIDEZ COMERCIAL: 15 DÍAS</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">DATOS DEL CONTRATISTA / CLIENTE</div>
            <p style="margin: 0; font-size: 13px;"><strong>Razón Social / Cliente:</strong> ${currentUser?.fullName || 'EMPRESA CONSTRUCTORA / CONTRATISTA'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px;"><strong>Correo de Facturación:</strong> ${currentUser?.email || 'contacto@constructora.com'}</p>
          </div>

          <div class="section">
            <div class="section-title">DETALLE DE MAQUINARIA Y PROGRAMACIÓN DE FAENA</div>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción del Equipo</th>
                  <th>Marca / Modelo</th>
                  <th>Días</th>
                  <th>Tarifa Diaria</th>
                  <th>Total Neto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-family: monospace;">HERR-${String(tool.id).padStart(4, '0')}</td>
                  <td><strong>${tool.name}</strong></td>
                  <td>${tool.brand || 'CATERPILLAR'} - ${tool.model || 'SERIE-PRO'}</td>
                  <td style="text-align: center;">${bookingDates.days}</td>
                  <td>${format(bookingDates.dailyRate)}</td>
                  <td>${format(bookingDates.subtotal)}</td>
                </tr>
                <tr>
                  <td colspan="5" style="text-align: right; color: #64748b;">Subtotal Neto:</td>
                  <td>${format(bookingDates.subtotal)}</td>
                </tr>
                <tr>
                  <td colspan="5" style="text-align: right; color: #64748b;">IVA Régimen Común (19%):</td>
                  <td>${format(bookingDates.subtotal * 0.19)}</td>
                </tr>
                <tr>
                  <td colspan="5" style="text-align: right; color: #64748b;">Depósito de Garantía en Custodia (25% Reembolsable):</td>
                  <td>${format(bookingDates.deposit)}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="5" style="text-align: right;">VALOR TOTAL ESTIMADO DE CONTRATO:</td>
                  <td style="color: #b45309;">${format(bookingDates.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">CONDICIONES CONTRACTUALES Y DE SEGURIDAD RETIE</div>
            <ul style="font-size: 11px; color: #475569; padding-left: 20px;">
              <li>Todo despacho incluye póliza de avería All-Risk y certificado técnico de aislamiento RETIE.</li>
              <li>El depósito de garantía será reembolsado íntegramente tras la inspección física de retorno en patio.</li>
              <li>El contratista se compromete a operar la maquinaria con personal certificado y portando los EPP reglamentarios.</li>
            </ul>
          </div>

          <div class="footer">
            RentaMaq S.A.S. • Documento Informativo de Cotización Comercial • Generado automáticamente por RentaMaq Cloud Platform
          </div>
        </body>
        </html>
      `;

      const printWin = window.open('', '_blank', 'width=850,height=900');
      if (printWin) {
        printWin.document.write(printHtml);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => printWin.print(), 300);
      } else {
        Toast.warning('Ventana Bloqueada', 'Permite ventanas emergentes para generar el documento de cotización.');
      }
    });

    // Cerrar modal
    const closeModal = () => {
      modalContainer.innerHTML = '';
      state.setSelectedTool(null);
    };

    modalContainer.querySelector('#close-tool-modal-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#cancel-booking-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#tool-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'tool-modal-overlay') closeModal();
    });

    // Proceder al pago
    modalContainer.querySelector('#proceed-to-checkout-btn')?.addEventListener('click', () => {
      const currentUser = state.get().user;
      if (!currentUser) {
        Toast.info('Acceso Requerido', 'Inicia sesión o regístrate para formalizar el contrato de alquiler.');
        window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'auth' } }));
        return;
      }

      closeModal();
      window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'checkout', tool } }));
    });
  }

  // Listener para apertura de modal
  window.addEventListener('modal:open', (e) => {
    if (e.detail?.modal === 'toolDetail') {
      render(e.detail.tool);
    }
  });
}

export default initToolModal;
