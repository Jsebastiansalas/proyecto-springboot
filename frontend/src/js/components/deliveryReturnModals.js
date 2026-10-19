/**
 * Modales de Inspección de Entrega, Devolución y Visor de Código QR
 * Conforme a Emil Kowalski Philosophy & Procedimientos de Obra
 */

import state from '../modules/state.js';
import API from '../api.js';
import Toast from '../modules/toast.js';

export function initDeliveryReturnModals() {
  const container = document.getElementById('operations-modal-container');
  if (!container) return;

  // 1. Visor de Código QR
  function renderQRModal(resId, toolName) {
    container.innerHTML = `
      <div id="qr-modal-overlay" class="modal-overlay active">
        <div class="modal-dialog max-w-sm text-center p-6">
          <div class="flex justify-between items-center pb-3 border-b border-hairline mb-4">
            <span class="font-mono text-xs font-bold text-amber-500 uppercase">ACTA DIGITAL DE FAENA</span>
            <button id="close-qr-btn" type="button" class="btn-industrial btn-ghost p-1 rounded-full">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-4 bg-white rounded-xl inline-block shadow-md border border-slate-200 my-2">
            <canvas id="qr-canvas-viewer" class="mx-auto"></canvas>
            <div class="mt-2 font-mono text-[10px] text-slate-800 font-bold uppercase">
              CONTRATO #${resId} &bull; ${toolName || 'MAQUINARIA'}
            </div>
          </div>

          <p class="font-sans text-xs text-muted mt-2">
            Muestra este código al transportista autorizado al momento de la entrega o retiro en obra.
          </p>
        </div>
      </div>
    `;

    if (window.QRious) {
      new window.QRious({
        element: container.querySelector('#qr-canvas-viewer'),
        value: `RENTAMAQ-ACTA-${resId}`,
        size: 180
      });
    }

    const close = () => { container.innerHTML = ''; };
    container.querySelector('#close-qr-btn')?.addEventListener('click', close);
    container.querySelector('#qr-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'qr-modal-overlay') close();
    });
  }

  // 2. Modal de Entrega con Checklist (Proveedor)
  function renderDeliveryModal(resId) {
    container.innerHTML = `
      <div id="delivery-modal-overlay" class="modal-overlay active">
        <div class="modal-dialog max-w-md p-6">
          <div class="flex justify-between items-center pb-3 border-b border-hairline mb-4">
            <div>
              <span class="font-mono text-xs font-bold text-amber-500 uppercase">INSPECCIÓN EN FAENA</span>
              <h3 class="font-display font-bold text-xl uppercase text-main">Acta de Entrega de Equipo</h3>
            </div>
            <button id="close-del-btn" type="button" class="btn-industrial btn-ghost p-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form id="delivery-form" class="space-y-4">
            <div class="border-b border-hairline pb-2 mb-2">
              <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-wider block">CHECKLIST OBLIGATORIO DE EPP & RETIE</span>
              <span class="text-[10px] font-mono text-muted">Todos los elementos deben ser verificados en presencia del contratista</span>
            </div>

            <div class="space-y-2 text-xs font-mono">
              <label class="flex items-center gap-2 p-2 rounded bg-surface-subtle border border-hairline cursor-pointer">
                <input type="checkbox" id="chk-epp-casco" class="w-4 h-4 accent-amber-500 epp-req-chk" required />
                <span>Casco de seguridad industrial (Norma ANSI Z89.1)</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded bg-surface-subtle border border-hairline cursor-pointer">
                <input type="checkbox" id="chk-epp-gafas" class="w-4 h-4 accent-amber-500 epp-req-chk" required />
                <span>Gafas de protección contra impacto / radiación UV</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded bg-surface-subtle border border-hairline cursor-pointer">
                <input type="checkbox" id="chk-epp-guantes" class="w-4 h-4 accent-amber-500 epp-req-chk" required />
                <span>Guantes de vaqueta / dieléctricos según ficha técnica</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded bg-surface-subtle border border-hairline cursor-pointer">
                <input type="checkbox" id="chk-epp-botas" class="w-4 h-4 accent-amber-500 epp-req-chk" required />
                <span>Botas con puntera de seguridad reforzada</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded bg-surface-subtle border border-hairline cursor-pointer">
                <input type="checkbox" id="chk-epp-auditiva" class="w-4 h-4 accent-amber-500 epp-req-chk" required />
                <span>Protección auditiva de inserción / copa (NRR > 25dB)</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded bg-surface-subtle border border-hairline cursor-pointer">
                <input type="checkbox" id="chk-electric" class="w-4 h-4 accent-amber-500 epp-req-chk" required />
                <span>Prueba de encendido y aislamiento RETIE 100% conforme</span>
              </label>
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Nombre del Receptor en Obra</label>
              <input id="del-receiver-name" type="text" placeholder="Ing. Residente de Obra" class="input-industrial" required />
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Documento del Receptor</label>
              <input id="del-receiver-doc" type="text" placeholder="1020304050" class="input-industrial mono" required />
            </div>

            <button type="submit" class="btn-industrial btn-primary w-full mt-2">
              Firmar y Confirmar Entrega
            </button>
          </form>
        </div>
      </div>
    `;

    const close = () => { container.innerHTML = ''; };
    container.querySelector('#close-del-btn')?.addEventListener('click', close);
    container.querySelector('#delivery-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'delivery-modal-overlay') close();
    });

    container.querySelector('#delivery-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          reservationId: resId,
          receiverName: container.querySelector('#del-receiver-name').value.trim(),
          receiverDocument: container.querySelector('#del-receiver-doc').value.trim(),
          notes: 'Inspección técnica de obra aprobada con checklist RETIE'
        };
        await API.deliveries.registerDelivery(payload);
        Toast.success('Entrega Registrada', `Contrato #${resId} pasó a estado EN OPERACIÓN.`);
        close();
        state.setView('provider');
      } catch (err) {
        Toast.error('Error al registrar entrega', err.message);
      }
    });
  }

  // 3. Modal de Devolución e Inspección de Daños
  function renderReturnModal(resId) {
    container.innerHTML = `
      <div id="return-modal-overlay" class="modal-overlay active">
        <div class="modal-dialog max-w-md p-6">
          <div class="flex justify-between items-center pb-3 border-b border-hairline mb-4">
            <div>
              <span class="font-mono text-xs font-bold text-amber-500 uppercase">RETIRO Y LIQUIDACIÓN</span>
              <h3 class="font-display font-bold text-xl uppercase text-main">Devolución de Maquinaria</h3>
            </div>
            <button id="close-ret-btn" type="button" class="btn-industrial btn-ghost p-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form id="return-form" class="space-y-4">
            <div>
              <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Estado de Recepción del Equipo</label>
              <select id="ret-condition" class="input-industrial mono text-xs">
                <option value="EXCELLENT">Excelente (Sin novedades)</option>
                <option value="GOOD">Bueno (Desgaste natural de obra)</option>
                <option value="DAMAGED">Con Avería (Requiere cobro de póliza/penalidad)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Observaciones de Inspección</label>
              <textarea id="ret-notes" rows="2" class="input-industrial text-xs" placeholder="Horómetro de entrega, estado de brocas o tambor..."></textarea>
            </div>

            <button type="submit" class="btn-industrial btn-primary w-full mt-2">
              Liquidar Contrato y Liberar Depósito
            </button>
          </form>
        </div>
      </div>
    `;

    const close = () => { container.innerHTML = ''; };
    container.querySelector('#close-ret-btn')?.addEventListener('click', close);
    container.querySelector('#return-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'return-modal-overlay') close();
    });

    container.querySelector('#return-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          reservationId: resId,
          equipmentCondition: container.querySelector('#ret-condition').value,
          notes: container.querySelector('#ret-notes').value.trim() || 'Inspección final de faena conforme'
        };
        await API.returns.registerReturn(payload);
        Toast.success('Devolución Liquidada', `Contrato #${resId} finalizado. Depósito reintegrado.`);
        close();
        state.setView('client');
      } catch (err) {
        Toast.error('Error al registrar devolución', err.message);
      }
    });
  }

  // Listener global de modales de operación
  window.addEventListener('modal:open', (e) => {
    if (e.detail?.modal === 'qrView') {
      renderQRModal(e.detail.resId, e.detail.toolName);
    } else if (e.detail?.modal === 'delivery') {
      renderDeliveryModal(e.detail.resId);
    } else if (e.detail?.modal === 'return') {
      renderReturnModal(e.detail.resId);
    }
  });
}

export default initDeliveryReturnModals;
