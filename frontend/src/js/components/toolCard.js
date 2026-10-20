/**
 * Ficha Técnica de Maquinaria Industrial para Obra Civil (ToolCard)
 * Conforme a Impeccable Design & Estándares de Constructora
 */

import state from '../modules/state.js';

export function createToolCard(tool) {
  const card = document.createElement('article');
  card.className = 'card-machinery';
  card.setAttribute('data-id', tool.id);

  // Normalización de propiedades de API
  const dailyPrice = Number(tool.baseDailyPrice || tool.pricePerDay || 0);
  const weeklyDailyRate = Math.round(dailyPrice * 0.85); // 15% descuento semanal constructora

  const priceFormatted = dailyPrice.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });

  const weeklyFormatted = weeklyDailyRate.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });

  // Estado de disponibilidad
  const isAvailable = tool.status === 'DISPONIBLE' || tool.status === 'AVAILABLE';
  const statusBadge = isAvailable
    ? `<span class="status-pill status-pill-available">
         <span class="status-indicator-dot pulse"></span>
         Disponible en Patio
       </span>`
    : `<span class="status-pill status-pill-rented">
         <span class="status-indicator-dot"></span>
         En Faena / Alquilado
       </span>`;

  // Imagen del equipo con fallback a SVG industrial
  let imageUrl = tool.mainImageUrl ? ('/' + tool.mainImageUrl.replace(/^\//, '')) : (tool.imageUrl || `/images/tools/HERR-${String(tool.id).padStart(4, '0')}.jpg`);

  // EPP y Normativas según categoría
  let eppTags = '<span class="epp-tag">Casco</span><span class="epp-tag">Botas</span>';
  let normBadge = 'NORMA RETIE';

  if (tool.categoryId === 3 || tool.categoryId === 10 || tool.categoryId === 15) {
    eppTags = '<span class="epp-tag">Arnés Res. 4272</span><span class="epp-tag">Eslinga</span><span class="epp-tag">Casco Barbuquejo</span>';
    normBadge = 'CERTIFICADO ALTURAS';
  } else if (tool.categoryId === 1 || tool.categoryId === 16) {
    eppTags = '<span class="epp-tag">Protección Auditiva</span><span class="epp-tag">Gafas</span><span class="epp-tag">Guantes Vaqueta</span>';
    normBadge = 'RETIE & VIBRACIÓN';
  } else if (tool.categoryId === 7) {
    eppTags = '<span class="epp-tag">Careta Soldar</span><span class="epp-tag">Peto Carnaza</span><span class="epp-tag">Polainas</span>';
    normBadge = 'RETIE ALTA POTENCIA';
  }

  card.innerHTML = `
    <!-- Imagen del Equipo con Placa de Activo y Status -->
    <div class="tool-image-container relative">
      <img src="${imageUrl}" 
           alt="${tool.name}" 
           loading="lazy"
           onerror="this.onerror=null; this.src='/images/tools/placeholder-tool.svg';" />
      
      <div class="absolute top-2.5 left-2.5 z-10">
        ${statusBadge}
      </div>

      <div class="absolute top-2.5 right-2.5 z-10">
        <span class="px-2 py-0.5 rounded bg-black/85 text-amber-400 font-mono text-[10px] font-bold border border-slate-700">
          ACTIVO #${String(tool.id).padStart(3, '0')}
        </span>
      </div>
    </div>

    <!-- Información Técnica y de Ingeniería -->
    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-xs font-mono text-muted uppercase tracking-wider mb-1">
          <span>FABRICANTE: <strong>${tool.brand || 'CATERPILLAR'}</strong></span>
          <span>MOD: ${tool.model || 'SERIE-PRO'}</span>
        </div>

        <div class="flex items-center justify-between mt-1 mb-1">
          <div class="flex items-center gap-1.5 text-amber-400 font-mono text-xs">
            <span class="text-amber-500 font-bold"></span>
            <span class="font-bold text-main">${tool.averageRating ? Number(tool.averageRating).toFixed(1) : '5.0'}</span>
            <span class="text-muted text-[10px]">(${tool.totalReviews || 0} reseñas)</span>
          </div>
          <button type="button" class="btn-compare btn-industrial btn-ghost text-[10px] py-0.5 px-2 font-mono uppercase tracking-wider" data-id="${tool.id}">
            + Comparar
          </button>
        </div>

        <h3 class="font-display font-bold text-lg text-main leading-tight uppercase tracking-wide group-hover:text-amber-500 transition-colors">
          ${tool.name}
        </h3>

        <p class="font-sans text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
          ${tool.description || 'Equipo especializado para faena y obra civil con certificación RETIE.'}
        </p>

        <!-- Tags de Seguridad y EPP de Obra -->
        <div class="mt-3 flex flex-wrap gap-1.5 items-center">
          <span class="spec-chip font-bold text-amber-600 dark:text-amber-400">
             ${normBadge}
          </span>
          ${eppTags}
        </div>

        <!-- Matriz de Precios Dual: Diario vs Semanal (-15% Constructoras) -->
        <div class="pricing-dual-matrix mt-4">
          <div class="pricing-tier">
            <span class="text-[9px] text-muted block uppercase">TARIFA DIARIA</span>
            <div class="font-mono font-bold text-xs text-main">${priceFormatted}</div>
          </div>
          <div class="pricing-tier featured">
            <span class="text-[9px] text-amber-500 font-bold block uppercase">SEMANAL (-15%)</span>
            <div class="font-mono font-bold text-xs text-amber-500">${weeklyFormatted} <span class="text-[8px]">/día</span></div>
          </div>
        </div>
      </div>

      <!-- Acciones de Asignación a Obra -->
      <div class="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
        <button type="button" class="btn-detail btn-industrial btn-outline btn-sm" title="Consultar hoja técnica y especificaciones">
          Ficha Técnica
        </button>
        <button type="button" class="btn-rent btn-industrial btn-primary btn-sm" ${!isAvailable ? 'disabled' : ''}>
          Asignar a Obra
        </button>
      </div>

    </div>
  `;

  // Eventos de botones
  card.querySelector('.btn-compare')?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('compare:toggle', { detail: { tool } }));
  });

  card.querySelector('.btn-detail')?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.setSelectedTool(tool);
    window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'toolDetail', tool } }));
  });

  card.querySelector('.btn-rent')?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.setSelectedTool(tool);
    window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'toolDetail', tool } }));
  });

  return card;
}

export default createToolCard;
