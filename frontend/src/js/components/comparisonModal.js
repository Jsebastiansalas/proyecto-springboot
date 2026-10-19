/**
 * Comparador 4FN de Maquinaria y Equipos de Construcción Lado a Lado
 * Conforme a Impeccable Design & Apple Physical Restraint
 */

import state from '../modules/state.js';
import Toast from '../modules/toast.js';

export function initComparisonModal() {
  let comparedTools = [];

  const formatCOP = (n) => '$ ' + Number(n || 0).toLocaleString('es-CO') + ' COP';

  // Contenedor para el dock flotante y modal
  let dockContainer = document.getElementById('comparison-dock-container');
  if (!dockContainer) {
    dockContainer = document.createElement('div');
    dockContainer.id = 'comparison-dock-container';
    document.body.appendChild(dockContainer);
  }

  let modalContainer = document.getElementById('comparison-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'comparison-modal-container';
    document.body.appendChild(modalContainer);
  }

  // Renderizar Dock Flotante Inferior
  function renderDock() {
    if (comparedTools.length === 0) {
      dockContainer.innerHTML = '';
      return;
    }

    dockContainer.innerHTML = `
      <aside aria-label="Bandeja de Comparación de Maquinaria" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-surface/95 backdrop-blur-md border border-hairline rounded-xl shadow-2xl p-3 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div class="flex items-center gap-3 overflow-x-auto py-1">
          <div class="font-mono text-xs hidden sm:block">
            <span class="text-amber-500 font-bold block uppercase tracking-wider text-[10px]">COMPARADOR 4FN</span>
            <span class="text-muted text-[10px]">${comparedTools.length} de 4 equipos</span>
          </div>

          <div class="flex items-center gap-2">
            ${comparedTools.map(t => {
              const img = t.mainImageUrl ? ('/' + t.mainImageUrl.replace(/^\//, '')) : (t.imageUrl || `/images/tools/HERR-${String(t.id).padStart(4, '0')}.jpg`);
              return `
                <div class="relative group w-11 h-11 rounded-lg bg-black border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  <img src="${img}" alt="${t.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/images/tools/placeholder-tool.svg';" />
                  <button type="button" class="btn-remove-from-dock absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" data-id="${t.id}">
                    &times;
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button id="clear-compare-dock-btn" type="button" class="btn-industrial btn-ghost text-[11px] py-1 px-2 font-mono text-muted">
            Limpiar
          </button>
          <button id="open-compare-modal-btn" type="button" class="btn-industrial btn-primary text-xs py-1.5 px-3 font-mono font-bold">
            Comparar (${comparedTools.length}) Lado a Lado
          </button>
        </div>
      </aside>
    `;

    dockContainer.querySelectorAll('.btn-remove-from-dock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.getAttribute('data-id'));
        toggleTool(comparedTools.find(t => t.id === id));
      });
    });

    dockContainer.querySelector('#clear-compare-dock-btn')?.addEventListener('click', () => {
      comparedTools = [];
      renderDock();
    });

    dockContainer.querySelector('#open-compare-modal-btn')?.addEventListener('click', () => {
      renderComparisonModal();
    });
  }

  // Renderizar Modal de Comparación Lado a Lado
  function renderComparisonModal() {
    if (comparedTools.length === 0) return;

    modalContainer.innerHTML = `
      <div id="compare-modal-overlay" class="modal-overlay active">
        <div class="modal-dialog max-w-5xl max-h-[92vh] flex flex-col p-6">
          
          <div class="flex items-center justify-between pb-4 border-b border-hairline mb-4 shrink-0">
            <div>
              <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">TABLERO COMPARATIVO 4FN</span>
              <h3 class="font-display font-black text-2xl uppercase tracking-tight text-main leading-tight">Análisis Técnico de Maquinaria</h3>
            </div>
            <button id="close-compare-modal-btn" type="button" class="btn-industrial btn-ghost p-2 rounded-full">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="overflow-x-auto flex-1 pb-4">
            <table class="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr class="border-b border-hairline">
                  <th class="p-3 bg-surface-subtle text-muted text-[10px] uppercase w-48 shrink-0">CARACTERÍSTICA</th>
                  ${comparedTools.map(t => {
                    const img = t.mainImageUrl ? ('/' + t.mainImageUrl.replace(/^\//, '')) : (t.imageUrl || `/images/tools/HERR-${String(t.id).padStart(4, '0')}.jpg`);
                    return `
                      <th class="p-3 text-center bg-surface border-l border-hairline min-w-[200px]">
                        <div class="w-full h-28 rounded-lg bg-black overflow-hidden mb-2 border border-slate-700">
                          <img src="${img}" alt="${t.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/images/tools/placeholder-tool.svg';" />
                        </div>
                        <h4 class="font-display font-bold text-sm text-main uppercase">${t.name}</h4>
                        <span class="text-[10px] text-amber-400 font-bold block mt-0.5">★ ${t.averageRating ? Number(t.averageRating).toFixed(1) : '5.0'} (${t.totalReviews || 0} reseñas)</span>
                      </th>
                    `;
                  }).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-hairline">
                
                <tr>
                  <td class="p-3 bg-surface-subtle font-bold text-muted">MARCA Y MODELO</td>
                  ${comparedTools.map(t => `
                    <td class="p-3 text-center border-l border-hairline text-main font-bold">
                      ${t.brand || 'CATERPILLAR'} &bull; ${t.model || 'SERIE-PRO'}
                    </td>
                  `).join('')}
                </tr>

                <tr>
                  <td class="p-3 bg-surface-subtle font-bold text-muted">TARIFA DIARIA NETO</td>
                  ${comparedTools.map(t => `
                    <td class="p-3 text-center border-l border-hairline text-amber-500 font-bold text-sm">
                      ${formatCOP(t.baseDailyPrice || t.pricePerDay)}
                    </td>
                  `).join('')}
                </tr>

                <tr>
                  <td class="p-3 bg-surface-subtle font-bold text-muted">TARIFA SEMANAL (-15%)</td>
                  ${comparedTools.map(t => {
                    const daily = Number(t.baseDailyPrice || t.pricePerDay || 0);
                    const weeklyDaily = Math.round(daily * 0.85);
                    return `
                      <td class="p-3 text-center border-l border-hairline text-emerald-400 font-bold">
                        ${formatCOP(weeklyDaily)} <span class="text-[9px] text-muted">/día</span>
                      </td>
                    `;
                  }).join('')}
                </tr>

                <tr>
                  <td class="p-3 bg-surface-subtle font-bold text-muted">DEPÓSITO EN GARANTÍA</td>
                  ${comparedTools.map(t => {
                    const daily = Number(t.baseDailyPrice || t.pricePerDay || 0);
                    const deposit = Math.round(daily * 0.25);
                    return `
                      <td class="p-3 text-center border-l border-hairline text-slate-300">
                        ${formatCOP(deposit)} <span class="text-[9px] text-muted">(25%)</span>
                      </td>
                    `;
                  }).join('')}
                </tr>

                <tr>
                  <td class="p-3 bg-surface-subtle font-bold text-muted">CERTIFICACIÓN RETIE</td>
                  ${comparedTools.map(() => `
                    <td class="p-3 text-center border-l border-hairline text-emerald-400 font-bold">
                      ✓ Aprobado RETIE
                    </td>
                  `).join('')}
                </tr>

                <tr>
                  <td class="p-3 bg-surface-subtle font-bold text-muted">PÓLIZA DE AVERÍA</td>
                  ${comparedTools.map(() => `
                    <td class="p-3 text-center border-l border-hairline text-slate-300">
                      Cobertura All-Risk Incluida
                    </td>
                  `).join('')}
                </tr>

                <tr>
                  <td class="p-3 bg-surface-subtle font-bold text-muted">DISPONIBILIDAD PATIO</td>
                  ${comparedTools.map(t => {
                    const isAvail = t.status === 'DISPONIBLE' || t.status === 'AVAILABLE';
                    return `
                      <td class="p-3 text-center border-l border-hairline">
                        <span class="status-pill ${isAvail ? 'status-pill-available' : 'status-pill-rented'}">
                          ${isAvail ? 'Disponible' : 'En Faena'}
                        </span>
                      </td>
                    `;
                  }).join('')}
                </tr>

                <tr>
                  <td class="p-3 bg-surface-subtle font-bold text-muted">DECISIÓN DE CONTRATO</td>
                  ${comparedTools.map(t => `
                    <td class="p-3 text-center border-l border-hairline">
                      <button type="button" class="btn-compare-rent btn-industrial btn-primary btn-sm w-full" data-id="${t.id}">
                        Asignar a Obra
                      </button>
                    </td>
                  `).join('')}
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#close-compare-modal-btn')?.addEventListener('click', close);
    modalContainer.querySelector('#compare-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'compare-modal-overlay') close();
    });

    modalContainer.querySelectorAll('.btn-compare-rent').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.getAttribute('data-id'));
        const tool = comparedTools.find(t => t.id === id);
        close();
        if (tool) {
          state.setSelectedTool(tool);
          window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'toolDetail', tool } }));
        }
      });
    });
  }

  function toggleTool(tool) {
    if (!tool) return;
    const idx = comparedTools.findIndex(t => t.id === tool.id);
    if (idx >= 0) {
      comparedTools.splice(idx, 1);
      Toast.info('Comparador Actualizado', `${tool.name} removido de la comparación.`);
    } else {
      if (comparedTools.length >= 4) {
        Toast.warning('Límite de Comparación', 'Puedes comparar un máximo de 4 equipos simultáneamente.');
        return;
      }
      comparedTools.push(tool);
      Toast.success('Equipo Agregado', `${tool.name} listo para comparar lado a lado.`);
    }
    renderDock();
  }

  window.addEventListener('compare:toggle', (e) => {
    toggleTool(e.detail?.tool);
  });
}

export default initComparisonModal;
