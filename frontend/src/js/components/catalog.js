/**
 * Catálogo de Maquinaria por Frentes de Obra y Categorías Industriales
 * Conforme a Frontend UI Engineering & Emil Kowalski Principles
 */

import state from '../modules/state.js';
import createToolCard from './toolCard.js';

export function initCatalog() {
  const container = document.getElementById('catalog-section');
  if (!container) return;

  function renderCategoryChips() {
    const categoriesContainer = document.getElementById('category-chips-list');
    if (!categoriesContainer) return;

    const { categories, tools, filters } = state.get();
    
    // Conteo de herramientas por categoría
    const countMap = {};
    tools.forEach(t => {
      countMap[t.categoryId] = (countMap[t.categoryId] || 0) + 1;
    });

    const isAllActive = filters.categoryId === null || filters.categoryId === '';

    categoriesContainer.innerHTML = `
      <button type="button" class="category-chip-btn ${isAllActive ? 'active' : ''}" data-category-id="">
        <span>TODAS LAS CATEGORÍAS</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
          ${tools.length}
        </span>
      </button>
      ${categories.map(cat => {
        const isActive = Number(filters.categoryId) === cat.id;
        const count = countMap[cat.id] || 0;
        return `
          <button type="button" class="category-chip-btn ${isActive ? 'active' : ''}" data-category-id="${cat.id}">
            <span>${cat.name}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
              ${count}
            </span>
          </button>
        `;
      }).join('')}
    `;

    // Eventos de selección de categoría
    categoriesContainer.querySelectorAll('.category-chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const catId = e.currentTarget.getAttribute('data-category-id');
        state.setFilter('categoryId', catId ? Number(catId) : null);
      });
    });
  }

  function renderToolGrid() {
    const gridContainer = document.getElementById('tools-grid-container');
    const emptyContainer = document.getElementById('tools-empty-state');
    if (!gridContainer) return;

    const { filteredTools } = state.get();

    gridContainer.innerHTML = '';

    if (filteredTools.length === 0) {
      if (emptyContainer) emptyContainer.style.display = 'block';
      gridContainer.style.display = 'none';
      return;
    }

    if (emptyContainer) emptyContainer.style.display = 'none';
    gridContainer.style.display = 'grid';

    // Renderizar tarjetas con staggered micro-motion
    filteredTools.forEach((tool, idx) => {
      const card = createToolCard(tool);
      card.style.animationDelay = `${Math.min(idx * 30, 240)}ms`;
      gridContainer.appendChild(card);
    });
  }

  // Estructura HTML inicial del Catálogo
  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <!-- Encabezado de Sección y Barra de Control -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest block">
              PATIO DE MAQUINARIA &bull; BOGOTÁ Y SABANA
            </span>
            <span class="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold">
              DESPACHO INMEDIATO
            </span>
          </div>
          <h2 class="text-3xl font-black font-display text-main tracking-tight uppercase leading-none">
            CATÁLOGO DE MAQUINARIA Y EQUIPO MENOR
          </h2>
        </div>

        <!-- Controles de Búsqueda y Ordenamiento -->
        <div class="flex flex-wrap items-center gap-3">
          
          <!-- Input de Búsqueda Instantánea con Debounce -->
          <div class="relative min-w-[240px]">
            <input id="catalog-search-input" 
                   type="text" 
                   class="input-industrial pl-9 text-sm" 
                   placeholder="Buscar equipo, marca, modelo..." 
                   value="${state.get().filters.query || ''}" />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Selector de Ordenamiento -->
          <select id="catalog-sort-select" class="input-industrial text-sm font-mono w-auto pr-8">
            <option value="featured">Orden: Más Solicitados en Obra</option>
            <option value="price-asc">Tarifa: Menor a Mayor</option>
            <option value="price-desc">Tarifa: Mayor a Menor</option>
            <option value="rating">Mayor Calificación Técnica</option>
          </select>

          <!-- Toggle Solo Disponibles -->
          <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-mono font-bold uppercase text-muted">
            <input id="catalog-available-toggle" type="checkbox" class="w-4 h-4 accent-amber-500 rounded" />
            Solo en Patio
          </label>
        </div>
      </div>

      <!-- Barra de Filtros por Frentes de Trabajo de Obra -->
      <div class="mb-5 p-3 rounded-lg bg-surface border border-hairline shadow-sm flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div class="flex items-center gap-2">
          <span class="font-bold text-muted uppercase">FRENTES DE OBRA:</span>
          <div class="flex flex-wrap gap-1.5">
            <button type="button" class="btn-front-filter px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold" data-front="TODOS">
              Todos los Frentes
            </button>
            <button type="button" class="btn-front-filter px-2.5 py-1 rounded bg-surface-subtle text-muted hover:text-main" data-front="CIMENTACION">
              Frente 1: Cimentación &bull; Demolición
            </button>
            <button type="button" class="btn-front-filter px-2.5 py-1 rounded bg-surface-subtle text-muted hover:text-main" data-front="ESTRUCTURAS">
              Frente 2: Concreto &bull; Estructura
            </button>
            <button type="button" class="btn-front-filter px-2.5 py-1 rounded bg-surface-subtle text-muted hover:text-main" data-front="ALTURAS">
              Frente 3: Alturas &bull; Elevación
            </button>
            <button type="button" class="btn-front-filter px-2.5 py-1 rounded bg-surface-subtle text-muted hover:text-main" data-front="REDES">
              Frente 4: Redes RETIE &bull; Bombeo
            </button>
          </div>
        </div>
        <div class="text-[11px] text-amber-500 font-bold">
           Póliza de avería por contrato
        </div>
      </div>

      <!-- Carrusel de Filtro por Categorías -->
      <div id="category-chips-list" class="category-scroll-container mb-8"></div>

      <!-- Grid de Tarjetas de Herramientas -->
      <div id="tools-grid-container" class="catalog-grid"></div>

      <!-- Estado Vacío Elegante (Empty State) -->
      <div id="tools-empty-state" class="text-center py-16 px-4 bg-surface rounded-xl border border-hairline shadow-sm" style="display: none;">
        <div class="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="font-display font-bold text-xl uppercase tracking-wider text-main">No se encontraron equipos en patio</h3>
        <p class="font-sans text-sm text-muted max-w-md mx-auto mt-1">
          No hay maquinaria que coincida con los criterios de búsqueda o frente de obra seleccionado.
        </p>
        <button id="reset-filters-btn" type="button" class="btn-industrial btn-primary btn-sm mt-5">
          Restablecer Filtros
        </button>
      </div>

    </div>
  `;

  // Listeners de controles
  let debounceTimer = null;
  const searchInput = container.querySelector('#catalog-search-input');
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.setFilter('query', e.target.value);
    }, 200);
  });

  const sortSelect = container.querySelector('#catalog-sort-select');
  sortSelect?.addEventListener('change', (e) => {
    state.setFilter('sortBy', e.target.value);
  });

  const availableToggle = container.querySelector('#catalog-available-toggle');
  availableToggle?.addEventListener('change', (e) => {
    state.setFilter('onlyAvailable', e.target.checked);
  });

  // Filtros por frentes de obra
  container.querySelectorAll('.btn-front-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const front = e.currentTarget.getAttribute('data-front');
      state.setWorkFront(front);

      container.querySelectorAll('.btn-front-filter').forEach(b => {
        b.className = 'btn-front-filter px-2.5 py-1 rounded bg-surface-subtle text-muted hover:text-main';
      });
      e.currentTarget.className = 'btn-front-filter px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold';
    });
  });

  container.querySelector('#reset-filters-btn')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (availableToggle) availableToggle.checked = false;
    state.data.filters.query = '';
    state.data.filters.categoryId = null;
    state.data.filters.onlyAvailable = false;
    state.setWorkFront('TODOS');
    renderCategoryChips();
  });

  // Re-render en cambios
  state.on('categories:loaded', renderCategoryChips);
  state.on('tools:loaded', () => {
    renderCategoryChips();
    renderToolGrid();
  });
  state.on('tools:filtered', renderToolGrid);
  state.on('filters:change', () => {
    renderCategoryChips();
    renderToolGrid();
  });

  // Render inicial
  renderCategoryChips();
  renderToolGrid();
}

export default initCatalog;
