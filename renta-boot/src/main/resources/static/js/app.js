/**
 * Controlador de Interfaz de Usuario y Lógica Reactiva SPA
 * Plataforma de Renta de Herramientas y Equipos de Construcción
 */

const App = (() => {
  const state = {
    user: null,
    profile: null,
    categories: [],
    tools: [],
    currentView: 'catalog', // 'catalog' | 'client' | 'provider' | 'admin'
    filters: {
      query: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      onlyAvailable: false,
      sortBy: 'featured'
    },
    selectedTool: null,
    selectedToolOccupied: [],
    hasDateConflict: false,
    calculatedPrice: null,
    activeReservationForPayment: null,
    activeReservationForDelivery: null,
    activeReservationForReturn: null,
    providerReservations: [],
    adminReservations: []
  };

  // Utilidades de formato
  const formatCOP = (num) => {
    if (num === null || num === undefined) return '$ 0 COP';
    return '$ ' + Number(num).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' COP';
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  // Sistema de Notificaciones Toast
  function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type} animate-fade-in`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    t.innerHTML = `<span class="font-bold text-lg">${icon}</span><span class="flex-1 whitespace-pre-line">${message}</span>`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s ease';
      setTimeout(() => t.remove(), 300);
    }, 4500);
  }

  // Inicialización
  async function init() {
    setupEventListeners();
    await checkSession();
    await loadCategories();
    await loadTools();
  }

  async function checkSession() {
    const storedUser = API.getUser();
    if (storedUser && API.getToken()) {
      try {
        const me = await API.auth.getMe();
        state.user = storedUser;
        state.profile = me;
        renderHeaderUser();
      } catch (e) {
        API.logout();
        state.user = null;
        state.profile = null;
        renderHeaderUser();
      }
    } else {
      renderHeaderUser();
    }
  }

  function renderHeaderUser() {
    const userContainer = document.getElementById('user-session-container');
    const guestContainer = document.getElementById('guest-session-container');
    const portalNav = document.getElementById('portal-navigation');

    if (state.user && state.profile) {
      guestContainer.classList.add('hidden');
      userContainer.classList.remove('hidden');
      portalNav.classList.remove('hidden');

      const name = state.profile.displayName || state.user.email;
      document.getElementById('user-name-display').textContent = name;
      const initialsEl = document.getElementById('user-avatar-initials');
      if (initialsEl) {
        const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'U';
        initialsEl.textContent = initials;
      }
      const roleBadge = document.getElementById('user-role-badge');
      const role = state.profile.role;
      roleBadge.textContent = role.replace('ROLE_', '');
      roleBadge.className = 'text-[9px] font-bold px-1.5 py-0.5 rounded-full ' +
        (role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' :
         role === 'ROLE_PROVEEDOR' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800');

      // Mostrar pestaña de portal correspondiente
      document.getElementById('btn-nav-client').classList.toggle('hidden', role !== 'ROLE_CLIENTE' && role !== 'ROLE_ADMIN');
      document.getElementById('btn-nav-provider').classList.toggle('hidden', role !== 'ROLE_PROVEEDOR' && role !== 'ROLE_ADMIN');
      document.getElementById('btn-nav-admin').classList.toggle('hidden', role !== 'ROLE_ADMIN');
    } else {
      guestContainer.classList.remove('hidden');
      userContainer.classList.add('hidden');
      portalNav.classList.add('hidden');
      navigateView('catalog');
    }
  }

  // Carga de categorías para filtros y formularios
  async function loadCategories() {
    try {
      const cats = await API.tools.getCategories();
      state.categories = cats;
      const select = document.getElementById('filter-category');
      if (select) {
        select.innerHTML = '<option value="">Todas las categorías</option>' +
          cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }

      // Renderizado de chips rápidos
      const chips = document.getElementById('category-chips-container');
      if (chips) {
        chips.innerHTML = `
          <button type="button" onclick="App.filterByCategoryChip('')" id="chip-cat-all" class="category-chip category-chip-active">
            Todas
          </button>
        ` + cats.map(c => `
          <button type="button" onclick="App.filterByCategoryChip('${c.id}')" id="chip-cat-${c.id}" class="category-chip">
            ${c.name}
          </button>
        `).join('');
      }
    } catch (err) {
      console.warn('Error cargando categorías:', err);
    }
  }

  // Carga de herramientas en el catálogo
  async function loadTools() {
    const grid = document.getElementById('tools-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full py-16 text-center text-slate-400"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-3"></div><p>Cargando catálogo de maquinaria y equipos...</p></div>';

    try {
      const tools = await API.tools.getTools(state.filters);
      state.tools = tools;
      renderToolsGrid(tools);
    } catch (err) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-rose-500">Error al cargar herramientas: ${err.message}</div>`;
    }
  }

  function onSortChange(value) {
    state.filters.sortBy = value;
    renderToolsGrid(state.tools || []);
  }

  function onOnlyAvailableChange() {
    const cb = document.getElementById('filter-only-available');
    state.filters.onlyAvailable = cb ? cb.checked : false;
    renderToolsGrid(state.tools || []);
  }

  function renderToolsGrid(tools) {
    const grid = document.getElementById('tools-grid');
    const countEl = document.getElementById('catalog-results-count');

    // Procesar filtros en memoria
    let processed = tools ? [...tools] : [];
    if (state.filters.onlyAvailable) {
      processed = processed.filter(t => t.status === 'DISPONIBLE');
    }

    if (state.filters.sortBy === 'price_asc') {
      processed.sort((a, b) => Number(a.baseDailyPrice) - Number(b.baseDailyPrice));
    } else if (state.filters.sortBy === 'price_desc') {
      processed.sort((a, b) => Number(b.baseDailyPrice) - Number(a.baseDailyPrice));
    } else if (state.filters.sortBy === 'name_asc') {
      processed.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    } else if (state.filters.sortBy === 'brand_asc') {
      processed.sort((a, b) => a.brand.localeCompare(b.brand, 'es'));
    }

    if (countEl) countEl.textContent = `${processed.length} equipo(s) disponible(s)`;

    if (processed.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <svg class="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <p class="text-lg font-semibold text-slate-700">No se encontraron herramientas con esos criterios</p>
          <p class="text-sm text-slate-400 mt-1">Intenta ajustando el término de búsqueda o cambiando los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = processed.map(tool => {
      const statusClass = tool.status === 'DISPONIBLE' ? 'badge-available' :
                          tool.status === 'ALQUILADA' ? 'badge-rented' :
                          tool.status === 'MANTENIMIENTO' ? 'badge-maintenance' : 'badge-retired';

      const fallbackImg = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80';
      const imgSrc = tool.mainImageUrl || fallbackImg;

      return `
        <div class="tool-card rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
          <div>
            <div class="relative h-52 bg-slate-100 overflow-hidden group">
              <img src="${imgSrc}" alt="${tool.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='${fallbackImg}'">
              <div class="absolute top-3 left-3 flex gap-2">
                <span class="px-2.5 py-1 text-xs font-bold rounded-md ${statusClass}">${tool.status}</span>
                <span class="px-2 py-1 text-xs font-semibold bg-slate-900/80 text-white rounded-md backdrop-blur-sm">${tool.categoryName || 'General'}</span>
              </div>
              <div class="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 text-xs font-black bg-amber-400 text-slate-950 rounded-md shadow-sm">
                <span>★</span>
                <span>${tool.id <= 3 ? (tool.id === 2 ? '4.8' : '5.0') : '5.0'}</span>
              </div>
              <div class="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-mono bg-black/60 text-white rounded">
                SKU: ${tool.codeSku}
              </div>
            </div>

            <div class="p-5">
              <div class="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">${tool.brand} • ${tool.model}</div>
              <h3 class="text-lg font-black text-slate-900 mb-2 line-clamp-1">${tool.name}</h3>
              <p class="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">${tool.description}</p>
              
              <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <span class="text-slate-400">🏢 Proveedor:</span>
                <strong class="text-slate-800 font-semibold">${tool.providerName}</strong>
              </div>
            </div>
          </div>

          <div class="p-5 pt-0 border-t border-slate-100 bg-slate-50/60 mt-auto">
            <div class="flex items-baseline justify-between py-3">
              <div>
                <span class="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Tarifa Diaria:</span>
                <div class="text-xl font-black text-slate-900">${formatCOP(tool.baseDailyPrice)}</div>
                <span class="inline-block text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md mt-0.5">⚡ 15% desc. semana</span>
              </div>
              <div class="text-right">
                <span class="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Garantía:</span>
                <div class="text-xs font-bold text-slate-700 mt-0.5">${formatCOP(tool.depositAmount)}</div>
                <span class="text-[10px] text-slate-400 block mt-0.5">Reembolsable</span>
              </div>
            </div>

            <button onclick="App.openToolDetail(${tool.id})" class="w-full py-2.5 px-4 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
              <span>Cotizar / Alquilar</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Modal Ficha Técnica 4FN y Cotizador Dinámico
  async function openToolDetail(toolId) {
    const modal = document.getElementById('modal-tool-detail');
    const content = document.getElementById('tool-detail-content');
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="py-24 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div><p class="mt-2 text-sm text-slate-500">Cargando relaciones 4FN...</p></div>';

    try {
      const [tool, occupied, reviewData] = await Promise.all([
        API.tools.getToolDetail(toolId),
        API.reservations.getOccupiedDates(toolId).catch(() => []),
        API.reviews.getToolReviews(toolId).catch(() => ({ averageRating: 0, totalReviews: 0, reviews: [] }))
      ]);
      state.selectedTool = tool;
      state.selectedToolOccupied = occupied || [];
      state.selectedToolReviews = reviewData;

      // Fechas por defecto: mañana a 7 días (para mostrar descuento semanal 15%)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const toIsoDate = (d) => d.toISOString().split('T')[0];
      const startStr = toIsoDate(tomorrow);
      const endStr = toIsoDate(nextWeek);

      content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Columna Izquierda: Galería e Información Base -->
          <div class="lg:col-span-7 space-y-6">
            <div class="relative h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img id="detail-main-img" src="${tool.mainImageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'">
              <div class="absolute top-4 left-4 flex gap-2">
                <span class="px-3 py-1 text-xs font-bold rounded-lg bg-white/90 backdrop-blur text-slate-800 shadow-sm">${tool.categoryName}</span>
                <span class="px-3 py-1 text-xs font-bold rounded-lg ${tool.status === 'DISPONIBLE' ? 'badge-available' : 'badge-maintenance'}">${tool.status}</span>
              </div>
            </div>

            <!-- Galería de imágenes (4FN Relación 1) -->
            ${tool.images && tool.images.length > 0 ? `
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Galería de Inspección Visual (4FN)</h4>
                <div class="flex gap-2 overflow-x-auto pb-2">
                  ${tool.images.map(img => `
                    <img src="${img.imageUrl}" onclick="document.getElementById('detail-main-img').src='${img.imageUrl}'" class="w-20 h-20 rounded-lg object-cover cursor-pointer border-2 hover:border-amber-500 transition-colors border-transparent" title="${img.caption || ''}">
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div>
              <div class="text-xs font-bold uppercase text-amber-600 tracking-wider mb-1">${tool.brand} • ${tool.model} • SKU: ${tool.codeSku}</div>
              <h2 class="text-2xl font-extrabold text-slate-900">${tool.name}</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">${tool.description}</p>
            </div>

            <!-- Especificaciones Técnicas (4FN Relación 2) -->
            <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                Especificaciones Técnicas Normalizadas
              </h3>
              <div class="grid grid-cols-2 gap-3 text-xs">
                ${tool.specifications && tool.specifications.length > 0 ?
                  tool.specifications.map(s => `
                    <div class="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between">
                      <span class="text-slate-500">${s.specName}:</span>
                      <strong class="text-slate-800">${s.specValue}</strong>
                    </div>
                  `).join('') : '<p class="text-slate-400 col-span-2">No registra especificaciones detalladas.</p>'
                }
              </div>
            </div>

            <!-- Requisitos de Seguridad EPP (4FN Relación 4) -->
            <div class="bg-amber-50/60 p-5 rounded-2xl border border-amber-200">
              <h3 class="text-sm font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Protocolos y Seguridad en Obra (EPP)
              </h3>
              <div class="flex flex-wrap gap-2">
                ${tool.safetyRequirements && tool.safetyRequirements.length > 0 ?
                  tool.safetyRequirements.map(sr => `
                    <span class="px-3 py-1.5 bg-white rounded-lg border border-amber-200 text-xs font-semibold text-amber-900 shadow-sm flex items-center gap-1.5" title="${sr.description || ''}">
                      <span>⚠️</span> ${sr.requirementName}
                    </span>
                  `).join('') : '<span class="text-xs text-amber-700">Equipamiento estándar de protección requerido.</span>'
                }
              </div>
            </div>

            <!-- Calificaciones y Reseñas de Clientes (Pilar 2) -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="text-xl">⭐</span>
                  <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Opiniones de Contratistas</h3>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-base font-black text-amber-600">★ ${reviewData && reviewData.averageRating > 0 ? reviewData.averageRating.toFixed(1) : '5.0'}</span>
                  <span class="text-xs text-slate-400 font-medium">(${reviewData ? reviewData.totalReviews : 0} opinión${reviewData && reviewData.totalReviews === 1 ? '' : 'es'})</span>
                </div>
              </div>

              ${reviewData && reviewData.reviews && reviewData.reviews.length > 0 ? `
                <div class="space-y-3">
                  ${reviewData.reviews.map(rev => `
                    <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-extrabold text-slate-800">${rev.clientName || 'Contratista'}</span>
                        <span class="text-amber-500 text-sm font-bold tracking-wider">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</span>
                      </div>
                      <p class="text-slate-600 leading-relaxed">${rev.comment}</p>
                      <div class="text-[10px] text-slate-400 font-mono pt-1">${formatDate(rev.createdAt)}</div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  Esta herramienta aún no registra opiniones. ¡Alquílala y comparte tu experiencia en obra!
                </div>
              `}
            </div>
          </div>

          <!-- Columna Derecha: Tarifas 4FN y Cotizador en Vivo -->
          <div class="lg:col-span-5 flex flex-col justify-between">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 class="text-base font-extrabold text-slate-900 mb-1">Cotizador Dinámico de Alquiler</h3>
                <p class="text-xs text-slate-500">Calculado en tiempo real según días de arrendamiento e impuestos fiscales (IVA 19%).</p>
              </div>

              <!-- Tarifas Normalizadas (4FN Relación 3) -->
              ${tool.pricingTiers && tool.pricingTiers.length > 0 ? `
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div class="text-xs font-bold text-slate-700 uppercase mb-2">Escalas de Tarifa por Volumen:</div>
                  <div class="space-y-1.5 text-xs">
                    ${tool.pricingTiers.map(t => `
                      <div class="flex justify-between items-center text-slate-600">
                        <span>• ${t.tierType} (${t.minDays}+ días):</span>
                        <strong class="text-slate-900">${formatCOP(t.pricePerDay)}/día</strong>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Selector de fechas -->
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Fecha Entrega</label>
                    <input type="date" id="calc-start-date" value="${startStr}" min="${startStr}" onchange="App.recalculateRentalPrice()" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium">
                  </div>
                  <div>
                    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Fecha Retorno</label>
                    <input type="date" id="calc-end-date" value="${endStr}" min="${startStr}" onchange="App.recalculateRentalPrice()" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium">
                  </div>
                </div>
              </div>

              <!-- Calendario Visual de Disponibilidad (28 Días) -->
              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>📅</span> Disponibilidad Próximos 28 Días:
                  </span>
                  <span class="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">En vivo</span>
                </div>
                
                <div id="availability-calendar-grid" class="grid grid-cols-7 gap-1 text-center text-[10px]">
                  <!-- Días generados dinámicamente -->
                </div>

                <!-- Leyenda del calendario -->
                <div class="flex items-center justify-between pt-1.5 text-[10px] text-slate-500 border-t border-slate-200">
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded bg-white border border-slate-300"></span>
                    <span>Libre</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded bg-amber-500"></span>
                    <span>Tu Selección</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded bg-rose-200 border border-rose-300"></span>
                    <span>Reservado</span>
                  </div>
                </div>
              </div>

              <!-- Banner de Validación de Conflicto -->
              <div id="date-validation-banner"></div>

              <!-- Desglose de Liquidación -->
              <div id="calc-breakdown-box" class="p-4 bg-slate-900 text-white rounded-xl space-y-2.5 font-mono text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Días de Alquiler:</span>
                  <span id="calc-days" class="text-white font-bold">7 días</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Tarifa diaria base:</span>
                  <span id="calc-base-daily">${formatCOP(tool.baseDailyPrice)}</span>
                </div>
                <div id="calc-weekly-badge" class="flex justify-between text-emerald-400 font-semibold bg-emerald-950/60 p-1.5 rounded">
                  <span>✓ Descuento Semanal (85%):</span>
                  <span>APLICADO</span>
                </div>
                <div class="border-t border-slate-800 pt-2 flex justify-between text-slate-300">
                  <span>Subtotal Neto:</span>
                  <span id="calc-subtotal" class="font-bold text-white">$ 0 COP</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>IVA Ley (19%):</span>
                  <span id="calc-tax">$ 0 COP</span>
                </div>
                <div class="flex justify-between text-amber-400">
                  <span>Depósito Garantía (Reembolsable):</span>
                  <span id="calc-deposit">${formatCOP(tool.depositAmount)}</span>
                </div>
                <div class="border-t border-slate-700 pt-2 flex justify-between text-sm font-extrabold text-amber-400">
                  <span>TOTAL ESTIMADO:</span>
                  <span id="calc-grand-total">$ 0 COP</span>
                </div>
              </div>

              <!-- Notas adicionales -->
              <div>
                <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Observaciones / Dirección de Obra (Opcional)</label>
                <textarea id="reservation-notes" rows="2" placeholder="Ej: Obra Calle 127 con 7ma, Torre B..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"></textarea>
              </div>

              <!-- Botón de acción principal -->
              <div>
                ${tool.status === 'DISPONIBLE' ? `
                  <button type="button" id="btn-submit-reservation" onclick="App.submitReservation()" class="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-base rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                    <span>Confirmar Solicitud de Reserva</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </button>
                ` : `
                  <button disabled class="w-full py-3.5 bg-slate-300 text-slate-500 font-bold text-sm rounded-xl cursor-not-allowed">
                    Herramienta no disponible para reserva
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      `;

      // Calcular inmediatamente el precio y generar calendario
      await recalculateRentalPrice();

    } catch (err) {
      content.innerHTML = `<div class="py-12 text-center text-rose-500">Error cargando detalles: ${err.message}</div>`;
    }
  }

  // Funciones del Calendario Visual de Disponibilidad
  function checkDateConflict(startStr, endStr, occupiedList) {
    if (!startStr || !endStr || !occupiedList || occupiedList.length === 0) return null;
    for (const res of occupiedList) {
      if (!res.startDate || !res.endDate) continue;
      // Traslape de rangos: inicioA <= finB && finA >= inicioB
      if (startStr <= res.endDate && endStr >= res.startDate) {
        return res;
      }
    }
    return null;
  }

  function renderAvailabilityCalendar(occupiedList, selectedStartStr, selectedEndStr) {
    const grid = document.getElementById('availability-calendar-grid');
    if (!grid) return;

    const days = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];
    let html = days.map(d => `<div class="font-bold text-slate-400 py-0.5">${d}</div>`).join('');

    const today = new Date();
    today.setHours(0,0,0,0);

    const startDayOfWeek = today.getDay(); // 0 a 6
    for (let i = 0; i < startDayOfWeek; i++) {
      html += `<div class="opacity-0 py-1">.</div>`;
    }

    const selStart = selectedStartStr || '';
    const selEnd = selectedEndStr || '';

    // Generar 28 días desde hoy
    for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
      const current = new Date(today);
      current.setDate(today.getDate() + dayOffset);
      const isoStr = current.toISOString().split('T')[0];
      const dayNum = current.getDate();

      let isOccupied = false;
      let occupiedCode = '';
      if (occupiedList) {
        for (const res of occupiedList) {
          if (isoStr >= res.startDate && isoStr <= res.endDate) {
            isOccupied = true;
            occupiedCode = res.reservationCode || 'Ocupado';
            break;
          }
        }
      }

      const isSelected = selStart && selEnd && isoStr >= selStart && isoStr <= selEnd;

      let cellClass = '';
      let cellTitle = '';
      let clickAttr = '';

      if (isOccupied) {
        cellClass = 'bg-rose-100 text-rose-800 border border-rose-300 font-bold line-through cursor-not-allowed opacity-80';
        cellTitle = `Reservado (${occupiedCode}) - No disponible`;
      } else if (isSelected) {
        cellClass = 'bg-amber-500 text-slate-950 font-black shadow-sm ring-2 ring-amber-400 cursor-pointer';
        cellTitle = `Tu selección (${isoStr})`;
        clickAttr = `onclick="App.selectDateFromCalendar('${isoStr}')"`;
      } else {
        cellClass = 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300 cursor-pointer font-semibold';
        cellTitle = `Disponible (${isoStr}) - Clic para fijar fecha`;
        clickAttr = `onclick="App.selectDateFromCalendar('${isoStr}')"`;
      }

      html += `
        <button type="button" ${clickAttr} title="${cellTitle}" class="h-7 w-full rounded flex items-center justify-center transition-all ${cellClass}">
          ${dayNum}
        </button>
      `;
    }

    grid.innerHTML = html;
  }

  function selectDateFromCalendar(isoDateStr) {
    const startInput = document.getElementById('calc-start-date');
    const endInput = document.getElementById('calc-end-date');
    if (!startInput || !endInput) return;

    const curStart = startInput.value;
    const curEnd = endInput.value;

    if (!curStart || (curStart && curEnd && isoDateStr < curStart)) {
      startInput.value = isoDateStr;
      const nextDay = new Date(isoDateStr + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 7);
      endInput.value = nextDay.toISOString().split('T')[0];
    } else {
      endInput.value = isoDateStr;
    }
    recalculateRentalPrice();
  }

  // Recálculo AJAX de precio de reserva con validación de conflictos
  async function recalculateRentalPrice() {
    if (!state.selectedTool) return;
    const startInput = document.getElementById('calc-start-date');
    const endInput = document.getElementById('calc-end-date');
    if (!startInput || !endInput) return;

    const startVal = startInput.value;
    const endVal = endInput.value;

    // 1. Validar conflicto con fechas ocupadas
    const conflict = checkDateConflict(startVal, endVal, state.selectedToolOccupied);
    const banner = document.getElementById('date-validation-banner');
    const submitBtn = document.getElementById('btn-submit-reservation');

    if (conflict) {
      state.hasDateConflict = true;
      if (banner) {
        banner.innerHTML = `
          <div class="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
            <span class="text-base">🚫</span>
            <div>
              <strong>Fechas Ocupadas (${conflict.reservationCode}):</strong>
              <div class="font-normal text-[11px] mt-0.5">El equipo ya está reservado del ${formatDate(conflict.startDate)} al ${formatDate(conflict.endDate)}. Selecciona otro rango libre en el calendario.</div>
            </div>
          </div>
        `;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    } else {
      state.hasDateConflict = false;
      if (banner) {
        banner.innerHTML = `
          <div class="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span class="text-emerald-600 font-bold">✓</span>
            <span>Fechas disponibles para entrega y uso en obra.</span>
          </div>
        `;
      }
      if (submitBtn && state.selectedTool.status === 'DISPONIBLE') {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }

    // 2. Refrescar el calendario visual
    renderAvailabilityCalendar(state.selectedToolOccupied, startVal, endVal);

    if (new Date(endVal) < new Date(startVal)) {
      toast('La fecha de retorno no puede ser anterior a la de entrega', 'warning');
      return;
    }

    try {
      const calculation = await API.reservations.calculatePrice(
        state.selectedTool.id,
        startVal,
        endVal
      );
      state.calculatedPrice = calculation;

      document.getElementById('calc-days').textContent = `${calculation.totalDays} día(s)`;
      document.getElementById('calc-subtotal').textContent = formatCOP(calculation.subtotal);
      document.getElementById('calc-tax').textContent = formatCOP(calculation.taxAmount);
      document.getElementById('calc-deposit').textContent = formatCOP(calculation.depositAmount);
      document.getElementById('calc-grand-total').textContent = formatCOP(calculation.totalAmount || calculation.totalWithDeposit);

      const weeklyBadge = document.getElementById('calc-weekly-badge');
      if (weeklyBadge) {
        weeklyBadge.classList.toggle('hidden', !calculation.weeklyDiscountApplied);
      }
    } catch (err) {
      console.warn('Error cotizando fechas:', err);
    }
  }

  // Creación de reserva
  async function submitReservation() {
    if (state.hasDateConflict) {
      toast('No puedes reservar fechas que ya están ocupadas por otro usuario.', 'warning');
      return;
    }

    if (!state.user) {
      toast('Debes iniciar sesión como Cliente para crear una reserva.', 'info');
      openAuthModal('login');
      return;
    }

    if (!state.profile || !state.profile.clientId) {
      toast('Tu cuenta no tiene perfil de cliente para alquilar equipos.', 'error');
      return;
    }

    const startInput = document.getElementById('calc-start-date');
    const endInput = document.getElementById('calc-end-date');
    const notesInput = document.getElementById('reservation-notes');

    try {
      const res = await API.reservations.createReservation({
        clientId: state.profile.clientId,
        toolId: state.selectedTool.id,
        startDate: startInput.value,
        endDate: endInput.value,
        notes: notesInput ? notesInput.value : ''
      });

      closeModal('modal-tool-detail');
      toast(`¡Reserva creada exitosamente!\nCódigo: ${res.reservationCode}`, 'success');

      // Si estamos como cliente, navegar a Mis Reservas
      if (state.profile.role === 'ROLE_CLIENTE') {
        navigateView('client');
      }
    } catch (err) {
      toast('No se pudo crear la reserva: ' + err.message, 'error');
    }
  }

  // Navegación entre vistas (Catálogo, Panel Cliente, Proveedor, Admin)
  function navigateView(viewName) {
    state.currentView = viewName;
    const views = ['catalog', 'client', 'provider', 'admin'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.toggle('hidden', v !== viewName);
      const btn = document.getElementById(`btn-nav-${v}`);
      if (btn) {
        btn.classList.toggle('nav-pill-active', v === viewName);
        btn.classList.toggle('text-slate-600', v !== viewName);
      }
    });

    if (viewName === 'client') loadClientDashboard();
    if (viewName === 'provider') loadProviderDashboard();
    if (viewName === 'admin') loadAdminDashboard();
  }

  function resetFilters() {
    const searchInput = document.getElementById('filter-search');
    const categorySelect = document.getElementById('filter-category');
    const minPriceInput = document.getElementById('filter-min-price');
    const maxPriceInput = document.getElementById('filter-max-price');
    const onlyAvailCb = document.getElementById('filter-only-available');
    const sortSelect = document.getElementById('catalog-sort-select');

    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    if (onlyAvailCb) onlyAvailCb.checked = false;
    if (sortSelect) sortSelect.value = 'featured';

    state.filters = {
      query: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      onlyAvailable: false,
      sortBy: 'featured'
    };

    document.querySelectorAll('.category-chip').forEach(btn => btn.classList.remove('category-chip-active'));
    const allChip = document.getElementById('chip-cat-all');
    if (allChip) allChip.classList.add('category-chip-active');

    loadTools();
  }

  function filterByCategoryChip(catId) {
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
      categorySelect.value = catId || '';
    }
    state.filters.categoryId = catId ? String(catId) : '';

    document.querySelectorAll('.category-chip').forEach(btn => btn.classList.remove('category-chip-active'));
    const activeChip = document.getElementById(catId ? `chip-cat-${catId}` : 'chip-cat-all');
    if (activeChip) activeChip.classList.add('category-chip-active');

    loadTools();
  }

  // 1. Panel Cliente
  async function loadClientDashboard() {
    if (!state.profile || !state.profile.clientId) return;
    const listEl = document.getElementById('client-reservations-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="py-12 text-center text-slate-400">Cargando tus reservas...</div>';

    try {
      const reservations = await API.reservations.getByClient(state.profile.clientId);
      if (reservations.length === 0) {
        listEl.innerHTML = '<div class="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">No tienes reservas activas en este momento.</div>';
        return;
      }

      listEl.innerHTML = reservations.map(r => `
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <img src="${r.toolImageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=200&q=80'}" class="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-mono font-bold text-slate-700">${r.reservationCode}</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-bold badge-res-${r.status.toLowerCase()}">${r.status}</span>
              </div>
              <h4 class="font-bold text-slate-900 text-base">${r.toolName}</h4>
              <p class="text-xs text-slate-500">${formatDate(r.startDate)} ➔ ${formatDate(r.endDate)} (${r.totalDays} días)</p>
            </div>
          </div>

          <div class="flex flex-col md:items-end justify-between gap-3">
            <div>
              <div class="text-xs text-slate-400">Total a pagar:</div>
              <div class="text-lg font-extrabold text-slate-900">${formatCOP(r.totalAmount)}</div>
            </div>
            <div class="flex gap-2">
              ${r.status === 'PENDIENTE' ? `
                <button onclick="App.openPaymentModal(${r.id}, '${r.reservationCode}', ${r.totalAmount})" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors">
                  💳 Pagar Ahora
                </button>
                <button onclick="App.cancelReservationAction(${r.id})" class="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-lg transition-colors">
                  Cancelar
                </button>
              ` : ''}

              ${r.status === 'APROBADA' || r.status === 'EN_CURSO' || r.status === 'FINALIZADA' ? `
                <button onclick="App.openInvoiceModal(${r.id})" class="px-3.5 py-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                  <span>📄 Factura DIAN</span>
                </button>
              ` : ''}

              ${r.status === 'FINALIZADA' ? `
                <button onclick="App.openSettlementModal(${r.id})" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm">
                  <span>🛡️ Liquidación</span>
                </button>
                <button onclick="App.openReviewModal(${r.id}, ${r.toolId}, '${(r.toolName || 'Herramienta').replace(/'/g, "\\'")}', '${r.reservationCode}')" class="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm">
                  <span>⭐ Calificar</span>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      listEl.innerHTML = `<div class="p-4 text-rose-600">Error: ${err.message}</div>`;
    }
  }

  // 2. Panel Proveedor
  async function loadProviderDashboard() {
    if (!state.profile || !state.profile.providerId) return;
    const providerId = state.profile.providerId;

    try {
      const [metrics, reservations, tools] = await Promise.all([
        API.reports.getProviderDashboard(providerId),
        API.reservations.getByProvider(providerId),
        API.tools.getToolsByProvider(providerId)
      ]);
      state.providerReservations = reservations || [];

      document.getElementById('prov-total-tools').textContent = metrics.totalTools;
      document.getElementById('prov-rented-tools').textContent = metrics.rentedTools;
      document.getElementById('prov-maintenance-tools').textContent = metrics.maintenanceTools;
      document.getElementById('prov-total-earnings').textContent = formatCOP(metrics.totalEarnings);

      // Tabla de solicitudes recibidas
      const resContainer = document.getElementById('provider-reservations-list');
      if (resContainer) {
        if (reservations.length === 0) {
          resContainer.innerHTML = '<div class="p-6 text-center text-slate-400">No hay reservas para tus equipos aún.</div>';
        } else {
          resContainer.innerHTML = reservations.map(r => `
            <div class="p-4 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono font-bold text-xs text-slate-700">${r.reservationCode}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-bold badge-res-${r.status.toLowerCase()}">${r.status}</span>
                </div>
                <div class="font-bold text-slate-900">${r.toolName}</div>
                <div class="text-xs text-slate-500">Cliente: <strong>${r.clientName}</strong> • ${formatDate(r.startDate)} a ${formatDate(r.endDate)}</div>
              </div>
              <div class="flex items-center gap-2">
                ${r.status === 'PENDIENTE' ? `
                  <button onclick="App.approveReservationAction(${r.id})" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg">Aprobar</button>
                  <button onclick="App.rejectReservationAction(${r.id})" class="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-lg">Rechazar</button>
                ` : ''}
                ${r.status === 'APROBADA' ? `
                  <button onclick="App.openDeliveryModal(${r.id}, '${r.reservationCode}')" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg">📦 Despachar / Entrega</button>
                ` : ''}
                ${r.status === 'EN_CURSO' ? `
                  <button onclick="App.openReturnModal(${r.id}, '${r.reservationCode}')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg">🔍 Recibir & Inspección</button>
                ` : ''}
                ${r.status === 'FINALIZADA' ? `
                  <button onclick="App.openSettlementModal(${r.id})" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm">
                    <span>🛡️ Liquidación</span>
                  </button>
                  <button onclick="App.openInvoiceModal(${r.id})" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg">
                    Factura
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('');
        }
      }

      // Tabla de catálogo de herramientas del proveedor
      const toolsContainer = document.getElementById('provider-tools-list');
      if (toolsContainer) {
        toolsContainer.innerHTML = tools.map(t => `
          <div class="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <div class="flex items-center gap-3">
              <img src="${t.mainImageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=100&q=80'}" class="w-10 h-10 rounded-lg object-cover" onerror="this.src='https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=100&q=80'">
              <div>
                <strong class="text-slate-900 text-sm">${t.name}</strong> (${t.brand} ${t.model})
                <div class="text-slate-500">${t.codeSku} • Tarifa: ${formatCOP(t.baseDailyPrice)}/día</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <select onchange="App.updateToolStatusAction(${t.id}, this.value)" class="px-2 py-1 border border-slate-300 rounded font-semibold text-xs">
                <option value="DISPONIBLE" ${t.status === 'DISPONIBLE' ? 'selected' : ''}>DISPONIBLE</option>
                <option value="ALQUILADA" ${t.status === 'ALQUILADA' ? 'selected' : ''}>ALQUILADA</option>
                <option value="MANTENIMIENTO" ${t.status === 'MANTENIMIENTO' ? 'selected' : ''}>MANTENIMIENTO</option>
                <option value="RETIRADA" ${t.status === 'RETIRADA' ? 'selected' : ''}>RETIRADA</option>
              </select>
            </div>
          </div>
        `).join('');
      }

    } catch (err) {
      toast('Error cargando panel de proveedor: ' + err.message, 'error');
    }
  }

  // 3. Panel Administrador
  async function loadAdminDashboard() {
    try {
      const [dash, allRes] = await Promise.all([
        API.reports.getAdminDashboard(),
        API.reservations.getAll()
      ]);
      state.adminReservations = allRes || [];

      document.getElementById('adm-total-users').textContent = dash.totalUsers;
      document.getElementById('adm-total-clients').textContent = dash.totalClients;
      document.getElementById('adm-total-providers').textContent = dash.totalProviders;
      document.getElementById('adm-total-tools').textContent = dash.totalTools;
      document.getElementById('adm-active-rentals').textContent = dash.activeRentals;
      document.getElementById('adm-total-revenue').textContent = formatCOP(dash.totalRevenue);
      document.getElementById('adm-total-deposits').textContent = formatCOP(dash.totalDepositsInEscrow);

      // Top Herramientas
      const topList = document.getElementById('adm-top-tools-list');
      if (topList && dash.topRentedTools) {
        topList.innerHTML = dash.topRentedTools.map(t => `
          <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200 text-xs">
            <div>
              <strong class="text-slate-900">${t.toolName}</strong> (${t.brand})
              <div class="text-slate-500">${t.rentalCount} alquileres completados</div>
            </div>
            <div class="font-extrabold text-amber-600">${formatCOP(t.revenueGenerated)}</div>
          </div>
        `).join('');
      }

      // Todas las reservas
      const admResList = document.getElementById('adm-all-reservations-list');
      if (admResList) {
        admResList.innerHTML = allRes.map(r => `
          <tr class="border-b border-slate-100 text-xs">
            <td class="py-2.5 font-mono font-bold text-slate-800">${r.reservationCode}</td>
            <td class="py-2.5">${r.toolName}</td>
            <td class="py-2.5 text-slate-600">${r.clientName}</td>
            <td class="py-2.5">${formatDate(r.startDate)} a ${formatDate(r.endDate)}</td>
            <td class="py-2.5 font-bold text-slate-900">${formatCOP(r.totalAmount)}</td>
            <td class="py-2.5"><span class="px-2 py-0.5 rounded-full font-bold badge-res-${r.status.toLowerCase()}">${r.status}</span></td>
          </tr>
        `).join('');
      }
    } catch (err) {
      toast('Error cargando métricas globales: ' + err.message, 'error');
    }
  }

  // Exportación CSV de Reservas para Proveedor
  async function exportProviderReservationsCSV() {
    try {
      const providerId = state.profile?.providerId;
      if (!providerId) {
        toast('No se encontró el ID del proveedor activo', 'warning');
        return;
      }
      const list = (state.providerReservations && state.providerReservations.length > 0)
        ? state.providerReservations
        : await API.reservations.getByProvider(providerId);

      if (!list || list.length === 0) {
        toast('No hay solicitudes de reserva registradas para exportar.', 'info');
        return;
      }

      const headers = ['Codigo Reserva', 'Herramienta', 'Cliente', 'Fecha Inicio', 'Fecha Fin', 'Dias', 'Subtotal COP', 'Deposito COP', 'Total COP', 'Estado', 'Observaciones'];
      const rows = list.map(r => [
        `"${r.reservationCode || ''}"`,
        `"${(r.toolName || '').replace(/"/g, '""')}"`,
        `"${(r.clientName || '').replace(/"/g, '""')}"`,
        `"${r.startDate || ''}"`,
        `"${r.endDate || ''}"`,
        r.totalDays || 0,
        r.subtotal || 0,
        r.depositTotal || 0,
        r.totalAmount || 0,
        `"${r.status || ''}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_reservas_proveedor_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast('✓ Reporte CSV de reservas descargado con éxito.', 'success');
    } catch (err) {
      toast('Error al exportar CSV: ' + err.message, 'error');
    }
  }

  // Exportación CSV de Auditoría Global para Administrador
  async function exportAdminReservationsCSV() {
    try {
      const list = (state.adminReservations && state.adminReservations.length > 0)
        ? state.adminReservations
        : await API.reservations.getAll();

      if (!list || list.length === 0) {
        toast('No hay reservas registradas en el sistema para exportar.', 'info');
        return;
      }

      const headers = ['ID', 'Codigo Reserva', 'Herramienta', 'ID Herramienta', 'Cliente', 'ID Cliente', 'Fecha Inicio', 'Fecha Fin', 'Dias', 'Subtotal COP', 'Deposito COP', 'Total COP', 'Estado'];
      const rows = list.map(r => [
        r.id,
        `"${r.reservationCode || ''}"`,
        `"${(r.toolName || '').replace(/"/g, '""')}"`,
        r.toolId,
        `"${(r.clientName || '').replace(/"/g, '""')}"`,
        r.clientId,
        `"${r.startDate || ''}"`,
        `"${r.endDate || ''}"`,
        r.totalDays || 0,
        r.subtotal || 0,
        r.depositTotal || 0,
        r.totalAmount || 0,
        `"${r.status || ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `auditoria_global_reservas_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast('✓ Auditoría global exportada a CSV con éxito.', 'success');
    } catch (err) {
      toast('Error al exportar CSV: ' + err.message, 'error');
    }
  }

  // Acciones sobre reservas
  async function approveReservationAction(id) {
    try {
      await API.reservations.approve(id);
      toast('Reserva aprobada.', 'success');
      loadProviderDashboard();
    } catch (err) {
      toast('Error al aprobar: ' + err.message, 'error');
    }
  }

  async function rejectReservationAction(id) {
    const reason = prompt('Motivo de rechazo de la reserva:') || 'No disponible en las fechas requeridas';
    try {
      await API.reservations.reject(id, reason);
      toast('Reserva rechazada.', 'info');
      loadProviderDashboard();
    } catch (err) {
      toast('Error al rechazar: ' + err.message, 'error');
    }
  }

  async function cancelReservationAction(id) {
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    try {
      await API.reservations.cancel(id, 'Cancelada por el cliente desde el portal');
      toast('Reserva cancelada correctamente.', 'info');
      loadClientDashboard();
    } catch (err) {
      toast('Error al cancelar: ' + err.message, 'error');
    }
  }

  async function updateToolStatusAction(toolId, newStatus) {
    try {
      await API.tools.updateStatus(toolId, newStatus);
      toast(`Estado actualizado a ${newStatus}`, 'success');
      loadTools();
    } catch (err) {
      toast('Error actualizando estado: ' + err.message, 'error');
    }
  }

  // Abrir Modal de Factura Electrónica Imprimible
  async function openInvoiceModal(reservationId) {
    try {
      const inv = await API.invoices.getByReservation(reservationId);
      document.getElementById('inv-display-number').textContent = inv.invoiceNumber;
      document.getElementById('inv-display-date').textContent = formatDate(inv.issueDate);
      document.getElementById('inv-display-client').textContent = inv.clientName || 'Cliente';
      document.getElementById('inv-display-doc').textContent = inv.clientDocument || 'CC / NIT';
      document.getElementById('inv-display-res-code').textContent = inv.reservationCode || `RES-${inv.reservationId}`;
      document.getElementById('inv-display-tool').textContent = inv.toolName || 'Maquinaria de Obra';
      document.getElementById('inv-concept-name').textContent = `Arrendamiento: ${inv.toolName || 'Maquinaria'}`;

      document.getElementById('inv-table-subtotal').textContent = formatCOP(inv.subtotal);
      document.getElementById('inv-table-iva').textContent = formatCOP(inv.taxAmount);
      document.getElementById('inv-table-subtotal-neto').textContent = formatCOP(inv.total);

      document.getElementById('inv-total-subtotal').textContent = formatCOP(inv.subtotal);
      document.getElementById('inv-total-iva').textContent = formatCOP(inv.taxAmount);
      document.getElementById('inv-total-final').textContent = formatCOP(inv.total);

      const hashSeed = `${inv.invoiceNumber}-${inv.id}-${inv.subtotal}-${inv.taxAmount}`;
      let cufeHash = '';
      for (let i = 0; i < hashSeed.length; i++) {
        cufeHash += hashSeed.charCodeAt(i).toString(16);
      }
      cufeHash = (cufeHash + '7a9f8c4e2b1d0356e849201a4f7832bc9d0124578e90ab12f45c89de3210abef45').substring(0, 64);
      document.getElementById('inv-display-cufe').textContent = cufeHash;

      document.getElementById('modal-invoice').classList.remove('hidden');
    } catch (err) {
      toast('No se encontró factura para esta reserva o aún no ha sido pagada.', 'error');
    }
  }

  // Modal Pagos
  function openPaymentModal(reservationId, code, amount) {
    state.activeReservationForPayment = { id: reservationId, code, amount };
    document.getElementById('pay-res-code').textContent = code;
    document.getElementById('pay-res-amount').textContent = formatCOP(amount);
    document.getElementById('modal-payment').classList.remove('hidden');
  }

  async function processPaymentSubmit(e) {
    e.preventDefault();
    if (!state.activeReservationForPayment) return;

    const resId = state.activeReservationForPayment.id;
    const method = document.getElementById('pay-method').value;
    const cardMasked = document.getElementById('pay-card-masked').value || '4532-****-****-1029';

    try {
      await API.payments.processPayment({
        reservationId: resId,
        clientId: state.profile.clientId,
        paymentMethod: method,
        amount: state.activeReservationForPayment.amount,
        cardNumberMasked: cardMasked,
        gatewayReference: 'GW-SIM-' + Date.now()
      });

      closeModal('modal-payment');
      toast('¡Pago procesado exitosamente!\nReserva confirmada y Factura emitida con 19% IVA.', 'success');
      loadClientDashboard();
      setTimeout(() => openInvoiceModal(resId), 400);
    } catch (err) {
      toast('Error al procesar el pago: ' + err.message, 'error');
    }
  }

  // Modales Despacho / Devolución
  function openDeliveryModal(reservationId, code) {
    state.activeReservationForDelivery = { id: reservationId, code };
    document.getElementById('deliv-res-code').textContent = code;
    document.getElementById('modal-delivery').classList.remove('hidden');
  }

  async function submitDelivery(e) {
    e.preventDefault();
    try {
      await API.deliveries.startRental({
        reservationId: state.activeReservationForDelivery.id,
        deliveredBy: document.getElementById('deliv-by').value,
        initialConditionNotes: document.getElementById('deliv-notes').value,
        clientSignatureAck: document.getElementById('deliv-ack').checked
      });
      closeModal('modal-delivery');
      toast('Despacho registrado. Reserva EN_CURSO.', 'success');
      loadProviderDashboard();
    } catch (err) {
      toast('Error al registrar entrega: ' + err.message, 'error');
    }
  }

  function openReturnModal(reservationId, code) {
    state.activeReservationForReturn = { id: reservationId, code };
    document.getElementById('ret-res-code').textContent = code;
    document.getElementById('modal-return').classList.remove('hidden');
  }

  async function submitReturn(e) {
    e.preventDefault();
    try {
      const res = await API.deliveries.finishRental({
        reservationId: state.activeReservationForReturn.id,
        receivedBy: document.getElementById('ret-by').value,
        conditionStatus: document.getElementById('ret-condition').value,
        inspectionNotes: document.getElementById('ret-notes').value,
        depositRefunded: document.getElementById('ret-refund').checked,
        extraDamageFee: Number(document.getElementById('ret-damage-fee').value) || 0
      });
      closeModal('modal-return');
      toast('Devolución registrada e inspección cerrada. Reserva FINALIZADA.', 'success');
      loadProviderDashboard();
    } catch (err) {
      toast('Error al registrar devolución: ' + err.message, 'error');
    }
  }

  // ==================== PILAR 2: LIQUIDACIÓN DE GARANTÍA & RESEÑAS ====================
  async function openSettlementModal(reservationId) {
    const modal = document.getElementById('modal-settlement');
    if (!modal) return;
    modal.classList.remove('hidden');

    document.getElementById('settle-res-code').textContent = 'Cargando...';
    document.getElementById('settle-tool-name').textContent = 'Consultando liquidación...';
    document.getElementById('settle-client-name').textContent = '...';
    document.getElementById('settle-condition-badge').textContent = '...';
    document.getElementById('settle-inspection-notes').textContent = 'Consultando acta de retorno...';
    document.getElementById('settle-initial-deposit').textContent = '$ 0 COP';
    document.getElementById('settle-damage-deduction').textContent = '$ 0 COP';
    document.getElementById('settle-refund-amount').textContent = '$ 0 COP';
    document.getElementById('settle-extra-charge').textContent = '$ 0 COP';
    document.getElementById('settle-extra-charge-row').classList.add('hidden');

    try {
      const data = await API.deliveries.getDepositSettlement(reservationId);
      document.getElementById('settle-res-code').textContent = data.reservationCode || `RES-${data.reservationId}`;
      document.getElementById('settle-tool-name').textContent = data.toolName || 'Herramienta';
      document.getElementById('settle-client-name').textContent = data.clientName || 'Cliente Titular';

      const badge = document.getElementById('settle-condition-badge');
      badge.textContent = data.toolConditionStatus || 'BUENO';
      if (data.toolConditionStatus === 'EXCELENTE') {
        badge.className = 'px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800';
      } else if (data.toolConditionStatus === 'BUENO') {
        badge.className = 'px-2 py-0.5 rounded text-[11px] font-extrabold bg-blue-100 text-blue-800';
      } else {
        badge.className = 'px-2 py-0.5 rounded text-[11px] font-extrabold bg-rose-100 text-rose-800';
      }

      document.getElementById('settle-inspection-notes').textContent = data.inspectionNotes || 'Inspección técnica física conforme.';
      document.getElementById('settle-initial-deposit').textContent = formatCOP(data.initialDeposit);
      document.getElementById('settle-damage-deduction').textContent = `- ${formatCOP(data.damageDeduction)}`;
      document.getElementById('settle-refund-amount').textContent = formatCOP(data.refundAmount);

      if (data.extraChargeDue && Number(data.extraChargeDue) > 0) {
        document.getElementById('settle-extra-charge').textContent = formatCOP(data.extraChargeDue);
        document.getElementById('settle-extra-charge-row').classList.remove('hidden');
      } else {
        document.getElementById('settle-extra-charge-row').classList.add('hidden');
      }

      const banner = document.getElementById('settle-status-banner');
      const text = document.getElementById('settle-status-text');
      if (data.settlementStatus === 'REEMBOLSO_TOTAL') {
        banner.className = 'text-center p-3 rounded-xl border bg-emerald-50 border-emerald-300 text-emerald-800';
        text.innerHTML = '<strong>✓ Reembolso Total:</strong> Depósito en garantía reintegrado al 100% al cliente sin deducciones.';
      } else if (data.settlementStatus === 'REEMBOLSO_PARCIAL') {
        banner.className = 'text-center p-3 rounded-xl border bg-amber-50 border-amber-300 text-amber-800';
        text.innerHTML = '<strong>⚠️ Reembolso Parcial:</strong> Se dedujo el costo de reparación de averías y se reintegró el saldo.';
      } else if (data.settlementStatus === 'RETENIDO_TOTAL') {
        banner.className = 'text-center p-3 rounded-xl border bg-orange-50 border-orange-300 text-orange-800';
        text.innerHTML = '<strong>🔒 Fianza Retenida:</strong> El costo de avería cubrió la totalidad de la garantía depositada.';
      } else {
        banner.className = 'text-center p-3 rounded-xl border bg-rose-50 border-rose-300 text-rose-800';
        text.innerHTML = '<strong>🚨 Saldo a Cobrar:</strong> El costo de averías excede la garantía. Se genera saldo a cobrar al contratista.';
      }
    } catch (err) {
      toast('Error al consultar liquidación de garantía: ' + err.message, 'error');
      closeModal('modal-settlement');
    }
  }

  function openReviewModal(reservationId, toolId, toolName, reservationCode) {
    const modal = document.getElementById('modal-review');
    if (!modal) return;
    document.getElementById('review-res-id').value = reservationId;
    document.getElementById('review-tool-id').value = toolId;
    document.getElementById('review-tool-name').textContent = toolName || 'Herramienta';
    document.getElementById('review-res-code').textContent = reservationCode || `RES-${reservationId}`;
    document.getElementById('review-comment').value = '';
    setReviewRating(5);
    modal.classList.remove('hidden');
  }

  function setReviewRating(rating) {
    const valInput = document.getElementById('review-rating-value');
    if (valInput) valInput.value = rating;

    const stars = document.querySelectorAll('#star-picker-container .star-btn');
    stars.forEach((btn, idx) => {
      if (idx < rating) {
        btn.classList.add('text-amber-400');
        btn.classList.remove('text-slate-200');
      } else {
        btn.classList.remove('text-amber-400');
        btn.classList.add('text-slate-200');
      }
    });

    const labels = {
      1: '1 estrella - Mal estado o deficiente',
      2: '2 estrellas - Regular desempeño',
      3: '3 estrellas - Bueno / Aceptable',
      4: '4 estrellas - Muy buen equipo',
      5: '5 estrellas - ¡Excelente equipo!'
    };
    const textEl = document.getElementById('review-rating-text');
    if (textEl) textEl.textContent = labels[rating] || `${rating} estrellas`;
  }

  async function submitReview(e) {
    if (e && e.preventDefault) e.preventDefault();
    const resId = Number(document.getElementById('review-res-id').value);
    const rating = Number(document.getElementById('review-rating-value').value) || 5;
    const comment = document.getElementById('review-comment').value.trim();

    if (!comment || comment.length < 3) {
      toast('El comentario debe contener al menos 3 caracteres.', 'error');
      return;
    }

    try {
      await API.reviews.createReview({
        reservationId: resId,
        rating: rating,
        comment: comment
      });

      closeModal('modal-review');
      toast('¡Gracias por tu opinión! Tu calificación ha sido publicada exitosamente.', 'success');
      loadClientDashboard();
    } catch (err) {
      toast('Error al publicar calificación: ' + err.message, 'error');
    }
  }

  // Modal Auth
  function openAuthModal(tab = 'login') {
    document.getElementById('modal-auth').classList.remove('hidden');
    switchAuthTab(tab);
  }

  function switchAuthTab(tab) {
    const tabs = ['login', 'reg-client', 'reg-prov'];
    tabs.forEach(t => {
      document.getElementById(`tab-content-${t}`).classList.toggle('hidden', t !== tab);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (btn) {
        btn.classList.toggle('text-amber-600', t === tab);
        btn.classList.toggle('border-b-2', t === tab);
        btn.classList.toggle('border-amber-600', t === tab);
      }
    });
  }

  function autofillDemo(email, pass) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = pass;
    toast(`Credenciales de prueba cargadas para: ${email}`, 'info');
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    try {
      const user = await API.auth.login(email, pass);
      const me = await API.auth.getMe();
      state.user = user;
      state.profile = me;
      closeModal('modal-auth');
      renderHeaderUser();
      toast(`¡Bienvenido de nuevo, ${me.displayName}!`, 'success');

      if (me.role === 'ROLE_CLIENTE') navigateView('client');
      else if (me.role === 'ROLE_PROVEEDOR') navigateView('provider');
      else if (me.role === 'ROLE_ADMIN') navigateView('admin');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleRegisterClientSubmit(e) {
    e.preventDefault();
    const payload = {
      email: document.getElementById('rc-email').value,
      password: document.getElementById('rc-pass').value,
      firstName: document.getElementById('rc-fn').value,
      lastName: document.getElementById('rc-ln').value,
      documentType: document.getElementById('rc-doctype').value,
      documentNumber: document.getElementById('rc-docnum').value,
      phone: document.getElementById('rc-phone').value,
      address: document.getElementById('rc-addr').value,
      city: document.getElementById('rc-city').value
    };

    try {
      const user = await API.auth.registerClient(payload);
      const me = await API.auth.getMe();
      state.user = user;
      state.profile = me;
      closeModal('modal-auth');
      renderHeaderUser();
      toast('¡Cuenta de cliente creada con éxito!', 'success');
      navigateView('client');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleRegisterProviderSubmit(e) {
    e.preventDefault();
    const payload = {
      email: document.getElementById('rp-email').value,
      password: document.getElementById('rp-pass').value,
      companyName: document.getElementById('rp-company').value,
      legalRepresentative: document.getElementById('rp-rep').value,
      nitRut: document.getElementById('rp-nit').value,
      phone: document.getElementById('rp-phone').value,
      address: document.getElementById('rp-addr').value,
      city: document.getElementById('rp-city').value
    };

    try {
      const user = await API.auth.registerProvider(payload);
      const me = await API.auth.getMe();
      state.user = user;
      state.profile = me;
      closeModal('modal-auth');
      renderHeaderUser();
      toast('¡Cuenta de proveedor creada con éxito!', 'success');
      navigateView('provider');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('hidden');
  }

  function setupEventListeners() {
    // Filtros de búsqueda reactivos
    const searchInput = document.getElementById('filter-search');
    const categorySelect = document.getElementById('filter-category');
    const minPriceInput = document.getElementById('filter-min-price');
    const maxPriceInput = document.getElementById('filter-max-price');

    let debounceTimer = null;
    const triggerSearch = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.filters.query = searchInput ? searchInput.value.trim() : '';
        state.filters.categoryId = categorySelect ? categorySelect.value : '';
        state.filters.minPrice = minPriceInput ? minPriceInput.value : '';
        state.filters.maxPrice = maxPriceInput ? maxPriceInput.value : '';
        loadTools();
      }, 250);
    };

    if (searchInput) searchInput.addEventListener('input', triggerSearch);
    if (categorySelect) {
      categorySelect.addEventListener('change', () => {
        const val = categorySelect.value;
        document.querySelectorAll('.category-chip').forEach(btn => btn.classList.remove('category-chip-active'));
        const activeChip = document.getElementById(val ? `chip-cat-${val}` : 'chip-cat-all');
        if (activeChip) activeChip.classList.add('category-chip-active');
        triggerSearch();
      });
    }
    if (minPriceInput) minPriceInput.addEventListener('input', triggerSearch);
    if (maxPriceInput) maxPriceInput.addEventListener('input', triggerSearch);

    // Formulario de login
    const loginForm = document.getElementById('form-login');
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

    // Formulario de registro de cliente
    const regClientForm = document.getElementById('form-reg-client');
    if (regClientForm) regClientForm.addEventListener('submit', handleRegisterClientSubmit);

    // Formulario de registro de proveedor
    const regProvForm = document.getElementById('form-reg-prov');
    if (regProvForm) regProvForm.addEventListener('submit', handleRegisterProviderSubmit);

    // Formulario de pago
    const payForm = document.getElementById('form-payment');
    if (payForm) payForm.addEventListener('submit', processPaymentSubmit);

    // Formulario de entrega
    const delivForm = document.getElementById('form-delivery');
    if (delivForm) delivForm.addEventListener('submit', submitDelivery);

    // Formulario de retorno
    const retForm = document.getElementById('form-return');
    if (retForm) retForm.addEventListener('submit', submitReturn);

    // Evento de logout
    window.addEventListener('auth:logout', () => {
      state.user = null;
      state.profile = null;
      renderHeaderUser();
      toast('Sesión cerrada correctamente.', 'info');
    });
  }

  return {
    init,
    openToolDetail,
    recalculateRentalPrice,
    submitReservation,
    navigateView,
    openAuthModal,
    switchAuthTab,
    autofillDemo,
    closeModal,
    openPaymentModal,
    openDeliveryModal,
    openReturnModal,
    approveReservationAction,
    rejectReservationAction,
    cancelReservationAction,
    updateToolStatusAction,
    openInvoiceModal,
    downloadInvoiceAction: openInvoiceModal,
    resetFilters,
    filterByCategoryChip,
    onSortChange,
    onOnlyAvailableChange,
    selectDateFromCalendar,
    exportProviderReservationsCSV,
    exportAdminReservationsCSV,
    openSettlementModal,
    openReviewModal,
    setReviewRating,
    submitReview
  };
})();

// Iniciar al cargar el DOM
document.addEventListener('DOMContentLoaded', App.init);
