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
    adminReservations: [],
    charts: {
      adminRevenue: null,
      adminTools: null,
      provStatus: null,
      provDemand: null
    },
    notifications: [],
    notifPollTimer: null
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

  // Escapa caracteres HTML para evitar inyeccion (XSS) al pintar datos con innerHTML
  const escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Imagenes de herramientas: mapeo directo a fotos locales de faena, SKU y resguardo técnico
  const TOOL_PLACEHOLDER = 'images/tools/placeholder-tool.svg';
  const slugify = (text) => String(text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const LOCAL_TOOL_IMAGES = {
    'HERR-0001': 'images/tools/HERR-0001.jpg',
    'HERR-0002': 'images/tools/HERR-0002.jpg',
    'HERR-0003': 'images/tools/HERR-0003.jpg',
    'HERR-0004': 'images/tools/HERR-0004.jpg',
    'HERR-0005': 'images/tools/HERR-0005.webp',
    'HERR-0006': 'images/tools/HERR-0006.jpg',
    'HERR-0007': 'images/tools/HERR-0007.webp',
    'HERR-0008': 'images/tools/HERR-0008.webp',
    'HERR-0009': 'images/tools/HERR-0009.jpg',
    'HERR-0010': 'images/tools/HERR-0010.jpg',
    'HERR-0011': 'images/tools/HERR-0011.jpg',
    'HERR-0012': 'images/tools/HERR-0012.jpg',
    'HERR-0013': 'images/tools/HERR-0013.webp',
    'HERR-0014': 'images/tools/HERR-0014.jpg',
    'HERR-0015': 'images/tools/HERR-0015.jpg',
    'HERR-0016': 'images/tools/HERR-0016.jpg',
    'HERR-0017': 'images/tools/HERR-0017.jpg',
    'HERR-0018': 'images/tools/HERR-0018.webp',
    'HERR-0019': 'images/tools/HERR-0019.jpg',
    'HERR-0020': 'images/tools/HERR-0020.jpg'
  };

  const CACHE_BUST = '?v=2';
  const toolImageSrc = (tool) => {
    if (!tool) return TOOL_PLACEHOLDER;
    const sku = tool.codeSku || ('HERR-' + String(tool.id || 0).padStart(4, '0'));
    if (LOCAL_TOOL_IMAGES[sku]) return LOCAL_TOOL_IMAGES[sku] + CACHE_BUST;
    if (tool.mainImageUrl && !tool.mainImageUrl.includes('wikimedia.org')) {
      return tool.mainImageUrl + (tool.mainImageUrl.startsWith('images/') ? CACHE_BUST : '');
    }
    return `images/tools/${slugify(tool.name)}.jpg` + CACHE_BUST;
  };

  const toolImageCodeSrc = (tool) => {
    if (!tool) return TOOL_PLACEHOLDER;
    const sku = tool.codeSku || ('HERR-' + String(tool.id || 0).padStart(4, '0'));
    const base = LOCAL_TOOL_IMAGES[sku] || `images/tools/${sku}.jpg`;
    return base + CACHE_BUST;
  };

  window.rmImgFallback = (img) => {
    const step = Number(img.dataset.step || '0');
    if (step === 0 && img.dataset.codeSrc && img.src !== img.dataset.codeSrc) {
      img.dataset.step = '1';
      img.src = img.dataset.codeSrc;
    } else if (step <= 1) {
      img.dataset.step = '2';
      if (img.src.endsWith('.webp')) {
        img.src = img.src.replace('.webp', '.jpg');
      } else if (img.src.endsWith('.png')) {
        img.src = img.src.replace('.png', '.jpg');
      } else if (img.src.endsWith('.jpg')) {
        img.src = img.src.replace('.jpg', '.png');
      } else {
        img.src = TOOL_PLACEHOLDER;
      }
    } else if (!img.src.endsWith(TOOL_PLACEHOLDER)) {
      img.dataset.step = '3';
      img.src = TOOL_PLACEHOLDER;
    }
  };

  // Sistema de Notificaciones Toast
  function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type} animate-fade-in`;
    const icon = type === 'success' ? '' : type === 'error' ? '' : 'ℹ';
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
      roleBadge.className = 'text-[9px] font-bold px-1.5 py-0.5 rounded-lg ' +
        (role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' :
         role === 'ROLE_PROVEEDOR' ? 'bg-[#FFE8DE] text-blue-800' : 'bg-emerald-100 text-emerald-800');

      // Mostrar pestaña de portal correspondiente
      document.getElementById('btn-nav-client').classList.toggle('hidden', role !== 'ROLE_CLIENTE' && role !== 'ROLE_ADMIN');
      document.getElementById('btn-nav-provider').classList.toggle('hidden', role !== 'ROLE_PROVEEDOR' && role !== 'ROLE_ADMIN');
      document.getElementById('btn-nav-admin').classList.toggle('hidden', role !== 'ROLE_ADMIN');

      // SPRINT 4 (HU-11): Iniciar polling de notificaciones In-App
      loadNotifications();
      if (!state.notifPollTimer) {
        state.notifPollTimer = setInterval(loadNotifications, 30000);
      }
    } else {
      guestContainer.classList.remove('hidden');
      userContainer.classList.add('hidden');
      portalNav.classList.add('hidden');

      if (state.notifPollTimer) {
        clearInterval(state.notifPollTimer);
        state.notifPollTimer = null;
      }
      state.notifications = [];
      const badge = document.getElementById('notif-badge');
      if (badge) badge.classList.add('hidden');
      const dropdown = document.getElementById('notifications-dropdown');
      if (dropdown) dropdown.classList.add('hidden');

      navigateView('home');
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
    grid.innerHTML = '<div class="col-span-full py-16 text-center text-slate-400"><div class="inline-block animate-spin rounded-lg h-8 w-8 border-b-2 border-amber-500 mb-3"></div><p>Cargando catálogo de maquinaria y equipos...</p></div>';

    try {
      const tools = await API.tools.getTools(state.filters);
      state.tools = tools;
      renderToolsGrid(tools);
      renderHomeFeatured();
      updateHeaderRentalsCount();
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

    // Procesar filtros en memoria (Reactividad pura estilo Amazon)
    let processed = tools ? [...tools] : [];

    // Filtro por familia taxonómica (desde la Home)
    if (state.filters.familyCategoryIds && state.filters.familyCategoryIds.length > 0) {
      processed = processed.filter(t => state.filters.familyCategoryIds.includes(Number(t.categoryId)));
    }

    if (state.filters.onlyAvailable) {
      processed = processed.filter(t => t.status === 'DISPONIBLE');
    }

    if (state.filters.minPrice) {
      processed = processed.filter(t => Number(t.baseDailyPrice) >= Number(state.filters.minPrice));
    }
    if (state.filters.maxPrice) {
      processed = processed.filter(t => Number(t.baseDailyPrice) <= Number(state.filters.maxPrice));
    }

    if (state.filters.query && state.filters.query.trim()) {
      const q = state.filters.query.toLowerCase().trim();
      processed = processed.filter(t =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.brand && t.brand.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.categoryName && t.categoryName.toLowerCase().includes(q)) ||
        (t.codeSku && t.codeSku.toLowerCase().includes(q))
      );
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

    if (countEl) countEl.textContent = `${processed.length} equipo(s) disponible(s) en catálogo`;

    if (processed.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-[#D6D3C9]">
          <svg class="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <p class="text-lg font-semibold text-slate-700">No se encontraron herramientas con esos criterios</p>
          <p class="text-sm text-slate-400 mt-1">Intenta ajustando el término de búsqueda o seleccionando otra categoría.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = processed.map(tool => {
      const statusClass = tool.status === 'DISPONIBLE' ? 'badge-available' :
                          tool.status === 'ALQUILADA' ? 'badge-rented' :
                          tool.status === 'MANTENIMIENTO' ? 'badge-maintenance' : 'badge-retired';

      const imgSrc = toolImageSrc(tool);
      const imgCodeSrc = toolImageCodeSrc(tool);
      const weeklyDiscountRate = Math.round(Number(tool.baseDailyPrice) * 0.85);

      return `
        <div class="tool-card bg-white border border-[#d5dbe4] hover:border-amber-500 transition-all flex flex-col justify-between shadow-sm rounded overflow-hidden">
          <div>
            <!-- Header Técnico / SKU Bar -->
            <div class="bg-[#0c1017] px-3 py-1.5 border-b border-[#182030] flex items-center justify-between text-[11px] font-mono">
              <span class="text-amber-400 font-bold">REF: ${tool.codeSku || 'EQ-' + tool.id}</span>
              <span class="text-slate-400 text-[10px] uppercase tracking-wider">${tool.categoryName || 'GENERAL'}</span>
            </div>

            <div class="relative h-48 bg-[#111722] overflow-hidden group">
              <img src="${imgSrc}" alt="${tool.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-code-src="${imgCodeSrc}" onerror="window.rmImgFallback(this)">
              <div class="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded ${statusClass}">${tool.status}</span>
              </div>
              <div class="absolute bottom-2 left-2 flex gap-1">
                <span class="tech-spec-tag">RETIE VIGENTE</span>
                <span class="tech-spec-tag bg-[#232320]/90 text-amber-300 border-amber-500/40">-15% SEMANAL</span>
              </div>
            </div>

            <div class="p-4 space-y-2">
              <div class="text-[11px] font-display font-extrabold uppercase tracking-widest text-amber-700">${tool.brand} // MOD. ${tool.model}</div>
              <h3 class="text-base font-display font-black text-slate-950 uppercase tracking-tight line-clamp-1 leading-snug">${tool.name}</h3>
              <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${tool.description}</p>
              
              <div class="flex items-center justify-between pt-1 text-xs border-t border-[#D6D3C9] font-mono">
                <span class="text-slate-400 text-[10px] uppercase font-bold">Operador:</span>
                <strong class="text-slate-800 text-[11px]">${tool.providerName || 'Parque RentaMaq Central'}</strong>
              </div>
            </div>
          </div>

          <div class="p-4 pt-0 bg-slate-50 border-t border-[#D6D3C9] mt-auto space-y-3">
            <div class="flex items-baseline justify-between py-2.5">
              <div>
                <span class="text-[10px] font-display font-bold text-slate-400 uppercase tracking-wider block">Tarifa Día (1-6 Días):</span>
                <div class="text-lg font-mono font-black text-slate-950">${formatCOP(tool.baseDailyPrice)}</div>
                <span class="inline-block text-[10px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300/80 px-1.5 py-0.5 rounded mt-0.5">Semana: ${formatCOP(weeklyDiscountRate)}/d</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] font-display font-bold text-slate-400 uppercase tracking-wider block">Depósito Garantía:</span>
                <div class="text-xs font-mono font-bold text-slate-700 mt-0.5">${formatCOP(tool.depositAmount)}</div>
                <span class="text-[9px] text-slate-500 font-mono block">Reembolsable</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button onclick="App.openToolDetail(${tool.id})" class="py-2.5 px-2 bg-white hover:bg-slate-100 text-slate-900 font-display font-bold text-xs uppercase tracking-wider rounded border border-slate-300 transition-colors text-center shadow-xs">
                Ficha Técnica
              </button>
              <button onclick="App.openToolDetail(${tool.id})" class="py-2.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded transition-colors shadow-sm text-center">
                Alquilar Equipo
              </button>
            </div>
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
    content.innerHTML = '<div class="py-24 text-center"><div class="inline-block animate-spin rounded-lg h-8 w-8 border-b-2 border-amber-500"></div><p class="mt-2 text-sm text-slate-500">Cargando relaciones 4FN...</p></div>';

    try {
      const [tool, occupied, reviewData] = await Promise.all([
        API.tools.getToolDetail(toolId),
        API.reservations.getOccupiedDates(toolId).catch(() => []),
        API.reviews.getToolReviews(toolId).catch(() => ({ averageRating: 0, totalReviews: 0, reviews: [] }))
      ]);
      state.selectedTool = tool;
      state.selectedToolOccupied = occupied || [];
      state.selectedToolReviews = reviewData;

      // Fechas por defecto y límites (Máximo 2 meses de alquiler)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const pad2 = (n) => String(n).padStart(2, '0');
      const toIsoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

      const minStartStr = toIsoDate(today);
      const startStr = toIsoDate(tomorrow);

      // Entrega máxima programable: 2 meses desde hoy
      const maxStart = new Date(today);
      maxStart.setMonth(maxStart.getMonth() + 2);
      const maxStartStr = toIsoDate(maxStart);

      // Retorno máximo permitido: 2 meses desde la fecha de entrega
      const maxReturn = new Date(tomorrow);
      maxReturn.setMonth(maxReturn.getMonth() + 2);
      const maxEndStr = toIsoDate(maxReturn);
      const endStr = toIsoDate(nextWeek);

      content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Columna Izquierda: Galería e Información Base -->
          <div class="lg:col-span-7 space-y-6">
            <div class="relative h-80 rounded overflow-hidden bg-[#111722] border border-[#182030]">
              <img id="detail-main-img" src="${toolImageSrc(tool)}" data-code-src="${toolImageCodeSrc(tool)}" class="w-full h-full object-cover" onerror="window.rmImgFallback(this)">
              <div class="absolute top-3 left-3 flex gap-2">
                <span class="px-2.5 py-1 text-xs font-mono font-bold rounded bg-[#0c1017]/90 text-white border border-[#182030] shadow-sm uppercase">${tool.categoryName}</span>
                <span class="px-2.5 py-1 text-xs font-mono font-bold rounded ${tool.status === 'DISPONIBLE' ? 'badge-available' : 'badge-maintenance'}">${tool.status}</span>
              </div>
              <div class="absolute bottom-3 right-3 px-2 py-0.5 text-[10px] font-mono bg-black/80 text-amber-400 rounded border border-[#182030] font-bold">
                REF: ${tool.codeSku || 'EQ-' + tool.id}
              </div>
            </div>

            <!-- Galería de imágenes (4FN Relación 1) -->
            ${tool.images && tool.images.length > 0 ? `
              <div>
                <h4 class="text-[11px] font-display font-bold uppercase tracking-wider text-slate-400 mb-2">Inspección Visual de Flota (4FN)</h4>
                <div class="flex gap-2 overflow-x-auto pb-2">
                  ${tool.images.map(img => `
                    <img src="${img.imageUrl}" onclick="document.getElementById('detail-main-img').src='${img.imageUrl}'" class="w-20 h-20 rounded object-cover cursor-pointer border-2 hover:border-amber-500 transition-colors border-[#D6D3C9]" title="${img.caption || ''}">
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="space-y-1">
              <div class="text-xs font-display font-extrabold uppercase text-amber-700 tracking-widest">${tool.brand} // MOD. ${tool.model} // SKU: ${tool.codeSku || 'EQ-' + tool.id}</div>
              <h2 class="text-2xl font-display font-black text-slate-950 uppercase tracking-tight">${tool.name}</h2>
              <p class="text-xs text-slate-600 mt-2 leading-relaxed">${tool.description}</p>
            </div>

            <!-- Especificaciones Técnicas (4FN Relación 2) -->
            <div class="bg-slate-50 p-5 rounded border border-[#D6D3C9]">
              <h3 class="text-xs font-display font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                Ficha Técnica Normalizada de Maquinaria
              </h3>
              <div class="grid grid-cols-2 gap-2.5 text-xs font-mono">
                ${tool.specifications && tool.specifications.length > 0 ?
                  tool.specifications.map(s => `
                    <div class="p-2.5 bg-white rounded border border-[#D6D3C9] flex justify-between">
                      <span class="text-slate-500 uppercase text-[10px]">${s.specName}:</span>
                      <strong class="text-slate-900 text-[11px]">${s.specValue}</strong>
                    </div>
                  `).join('') : '<p class="text-slate-400 col-span-2 text-xs">No registra especificaciones detalladas en ficha.</p>'
                }
              </div>
            </div>

            <!-- Requisitos de Seguridad EPP (4FN Relación 4) -->
            <div class="bg-amber-50/70 p-5 rounded border border-amber-200">
              <h3 class="text-xs font-display font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Protocolos y Seguridad en Obra (SST / EPP)
              </h3>
              <div class="flex flex-wrap gap-2">
                ${tool.safetyRequirements && tool.safetyRequirements.length > 0 ?
                  tool.safetyRequirements.map(sr => `
                    <span class="px-3 py-1 bg-white rounded border border-amber-300 text-xs font-semibold text-amber-950 shadow-xs flex items-center gap-1.5" title="${sr.description || ''}">
                      <span class="w-1.5 h-1.5 rounded-lg bg-amber-500"></span>
                      ${sr.requirementName}
                    </span>
                  `).join('') : '<span class="text-xs text-amber-800">Equipamiento estándar de protección certificado requerido.</span>'
                }
              </div>
            </div>

            <!-- Calificaciones y Reseñas de Clientes (Pilar 2) -->
            <div class="bg-white p-5 rounded border border-[#D6D3C9] space-y-4">
              <div class="flex items-center justify-between border-b border-[#D6D3C9] pb-3">
                <div class="flex items-center gap-2">
                  <span class="font-display font-bold text-xs uppercase tracking-wider text-slate-900">Bitácora de Rendimiento en Obra</span>
                </div>
                <div class="flex items-center gap-1.5 font-mono">
                  <span class="text-sm font-bold text-amber-600"> ${reviewData && reviewData.averageRating > 0 ? reviewData.averageRating.toFixed(1) : '5.0'}</span>
                  <span class="text-xs text-slate-400">(${reviewData ? reviewData.totalReviews : 0} informe${reviewData && reviewData.totalReviews === 1 ? '' : 's'})</span>
                </div>
              </div>

              ${reviewData && reviewData.reviews && reviewData.reviews.length > 0 ? `
                <div class="space-y-3">
                  ${reviewData.reviews.map(rev => `
                    <div class="p-3 bg-slate-50 rounded border border-[#D6D3C9] text-xs space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-extrabold text-slate-800 font-display uppercase tracking-wider">${rev.clientName || 'Contratista'}</span>
                        <span class="text-amber-500 text-xs font-bold tracking-wider">${''.repeat(rev.rating)}${''.repeat(5 - rev.rating)}</span>
                      </div>
                      <p class="text-slate-600 leading-relaxed text-xs">${rev.comment}</p>
                      <div class="text-[10px] text-slate-400 font-mono pt-1">${formatDate(rev.createdAt)}</div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded border border-[#D6D3C9]">
                  Equipo certificado listo para faena. ¡Alquílalo e ingresa el reporte de operación!
                </div>
              `}
            </div>
          </div>

          <!-- Columna Derecha: Tarifas 4FN y Cotizador en Vivo -->
          <div class="lg:col-span-5 flex flex-col justify-between">
            <div class="bg-white p-6 rounded border border-[#D6D3C9] shadow-sm space-y-5">
              <div class="border-b border-[#D6D3C9] pb-3">
                <h3 class="text-base font-display font-black uppercase tracking-tight text-slate-950">Liquidación Operativa de Faena</h3>
                <p class="text-xs text-slate-500 mt-0.5">Tarifa vinculante con IVA 19% y descuento semanal automático.</p>
              </div>

              <!-- Tarifas Normalizadas (4FN Relación 3) -->
              ${tool.pricingTiers && tool.pricingTiers.length > 0 ? `
                <div class="p-3 bg-slate-50 rounded border border-[#D6D3C9]">
                  <div class="text-xs font-display font-bold text-slate-700 uppercase mb-2">Escalas de Tarifa por Volumen:</div>
                  <div class="space-y-1.5 text-xs font-mono">
                    ${tool.pricingTiers.map(t => `
                      <div class="flex justify-between items-center text-slate-600">
                        <span>// ${t.tierType} (${t.minDays}+ días):</span>
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
                    <label class="block text-[11px] font-display uppercase tracking-wider text-slate-500 mb-1 font-bold">Fecha Entrega</label>
                    <input type="date" id="calc-start-date" value="${startStr}" min="${minStartStr}" max="${maxStartStr}" onchange="App.onDeliveryDateChange()" class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono">
                  </div>
                  <div>
                    <label class="block text-[11px] font-display uppercase tracking-wider text-slate-500 mb-1 font-bold">Fecha Retorno</label>
                    <input type="date" id="calc-end-date" value="${endStr}" min="${startStr}" max="${maxEndStr}" onchange="App.onReturnDateChange()" class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono">
                    <span class="block text-[10px] text-amber-700 font-mono font-bold mt-1">Máximo 2 meses de alquiler</span>
                  </div>
                </div>
              </div>

              <!-- Calendario Visual de Disponibilidad (28 Días) -->
              <div class="p-3 bg-slate-50 rounded border border-[#D6D3C9] space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-[11px] font-display font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    Disponibilidad Próximos 28 Días
                  </span>
                  <span class="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300/60">Flota En Línea</span>
                </div>
                
                <div id="availability-calendar-grid" class="grid grid-cols-7 gap-1 text-center text-[10px] font-mono">
                  <!-- Días generados dinámicamente -->
                </div>

                <!-- Leyenda del calendario -->
                <div class="flex items-center justify-between pt-1.5 text-[10px] font-mono text-slate-500 border-t border-[#D6D3C9]">
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300"></span>
                    <span>Libre</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                    <span>Tu Selección</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded-sm bg-rose-200 border border-rose-300"></span>
                    <span>Reservado</span>
                  </div>
                </div>
              </div>

              <!-- Banner de Validación de Conflicto -->
              <div id="date-validation-banner"></div>

              <!-- Desglose de Liquidación -->
              <div id="calc-breakdown-box" class="p-4 bg-[#0c1017] text-white rounded border border-[#182030] space-y-2.5 font-mono text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Días de Arrendamiento:</span>
                  <span id="calc-days" class="text-white font-bold">7 días</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Tarifa diaria base:</span>
                  <span id="calc-base-daily">${formatCOP(tool.baseDailyPrice)}</span>
                </div>
                <div id="calc-weekly-badge" class="flex justify-between text-amber-400 font-semibold bg-amber-950/40 border border-amber-700/50 p-1.5 rounded">
                  <span>Beneficio Semanal (85%):</span>
                  <span>-15% APLICADO</span>
                </div>
                <div class="border-t border-[#182030] pt-2 flex justify-between text-slate-300">
                  <span>Subtotal Neto:</span>
                  <span id="calc-subtotal" class="font-bold text-white">$ 0 COP</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>IVA Legal (19%):</span>
                  <span id="calc-tax">$ 0 COP</span>
                </div>
                <div class="flex justify-between text-amber-400">
                  <span>Garantía Reembolsable:</span>
                  <span id="calc-deposit">${formatCOP(tool.depositAmount)}</span>
                </div>
                <div class="border-t border-[#182030] pt-2 flex justify-between text-sm font-extrabold text-amber-400 font-mono">
                  <span>TOTAL ESTIMADO:</span>
                  <span id="calc-grand-total">$ 0 COP</span>
                </div>
              </div>

              <!-- Notas adicionales -->
              <div>
                <label class="block text-[11px] font-display uppercase tracking-wider text-slate-500 mb-1 font-bold">Observaciones / Ubicación de Obra (Opcional)</label>
                <textarea id="reservation-notes" rows="2" placeholder="Ej: Obra Calle 127 con 7ma, Torre B..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"></textarea>
              </div>

              <!-- Botón de acción principal -->
              <div>
                ${tool.status === 'DISPONIBLE' ? `
                  <button type="button" id="btn-submit-reservation" onclick="App.submitReservation()" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span>CONFIRMAR SOLICITUD DE RESERVA</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </button>
                ` : `
                  <button disabled class="w-full py-3 bg-slate-200 text-slate-500 font-display font-bold text-xs uppercase tracking-wider rounded cursor-not-allowed">
                    EQUIPO NO DISPONIBLE EN ESTE MOMENTO
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
        cellClass = 'bg-white hover:bg-emerald-50 text-slate-700 border border-[#D6D3C9] hover:border-emerald-300 cursor-pointer font-semibold';
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
    const pad = (n) => String(n).padStart(2, '0');

    if (!curStart || (curStart && curEnd && isoDateStr < curStart)) {
      startInput.value = isoDateStr;
      endInput.min = isoDateStr;

      const [sy, sm, sd] = isoDateStr.split('-').map(Number);
      const sDate = new Date(sy, sm - 1, sd);

      const maxReturn = new Date(sDate);
      maxReturn.setMonth(maxReturn.getMonth() + 2);
      const maxReturnStr = `${maxReturn.getFullYear()}-${pad(maxReturn.getMonth() + 1)}-${pad(maxReturn.getDate())}`;
      endInput.max = maxReturnStr;

      const nextWeek = new Date(sDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = `${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}`;

      endInput.value = nextWeekStr > maxReturnStr ? maxReturnStr : nextWeekStr;
    } else {
      const [sy, sm, sd] = curStart.split('-').map(Number);
      const sDate = new Date(sy, sm - 1, sd);
      const maxReturn = new Date(sDate);
      maxReturn.setMonth(maxReturn.getMonth() + 2);
      const maxReturnStr = `${maxReturn.getFullYear()}-${pad(maxReturn.getMonth() + 1)}-${pad(maxReturn.getDate())}`;

      if (isoDateStr > maxReturnStr) {
        toast('El plazo máximo de alquiler permitido es de 2 meses.', 'warning');
        endInput.value = maxReturnStr;
      } else {
        endInput.value = isoDateStr;
      }
    }
    recalculateRentalPrice();
  }

  // Controladores de cambio de fecha con restricción de máximo 2 meses
  function onDeliveryDateChange() {
    const startInput = document.getElementById('calc-start-date');
    const endInput = document.getElementById('calc-end-date');
    if (!startInput || !endInput) return;

    const startVal = startInput.value;
    if (!startVal) return;

    // Actualizar el mínimo de retorno para que coincida con la entrega
    endInput.min = startVal;

    // Calcular máximo 2 meses después de la entrega
    const [sy, sm, sd] = startVal.split('-').map(Number);
    const startDate = new Date(sy, sm - 1, sd);
    const maxReturnDate = new Date(startDate);
    maxReturnDate.setMonth(maxReturnDate.getMonth() + 2);

    const pad = (n) => String(n).padStart(2, '0');
    const maxReturnStr = `${maxReturnDate.getFullYear()}-${pad(maxReturnDate.getMonth() + 1)}-${pad(maxReturnDate.getDate())}`;
    endInput.max = maxReturnStr;

    // Si la fecha actual de retorno supera los 2 meses, ajustarla
    if (endInput.value > maxReturnStr) {
      endInput.value = maxReturnStr;
      toast('Se ajustó la fecha de retorno: el alquiler máximo es de 2 meses.', 'info');
    } else if (endInput.value < startVal) {
      const nextWeek = new Date(startDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = `${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}`;
      endInput.value = nextWeekStr > maxReturnStr ? maxReturnStr : nextWeekStr;
    }

    recalculateRentalPrice();
  }

  function onReturnDateChange() {
    const startInput = document.getElementById('calc-start-date');
    const endInput = document.getElementById('calc-end-date');
    if (!startInput || !endInput) return;

    const startVal = startInput.value;
    const endVal = endInput.value;
    if (!startVal || !endVal) return;

    const [sy, sm, sd] = startVal.split('-').map(Number);
    const startDate = new Date(sy, sm - 1, sd);
    const maxReturnDate = new Date(startDate);
    maxReturnDate.setMonth(maxReturnDate.getMonth() + 2);

    const pad = (n) => String(n).padStart(2, '0');
    const maxReturnStr = `${maxReturnDate.getFullYear()}-${pad(maxReturnDate.getMonth() + 1)}-${pad(maxReturnDate.getDate())}`;

    if (endVal > maxReturnStr) {
      endInput.value = maxReturnStr;
      toast('El plazo máximo de alquiler permitido es de 2 meses (60 días).', 'warning');
    } else if (endVal < startVal) {
      endInput.value = startVal;
      toast('La fecha de retorno no puede ser anterior a la de entrega.', 'warning');
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
            <span class="text-xs font-bold text-rose-600 bg-rose-100 border border-rose-300 rounded px-1.5 py-0.5">OCUPADO</span>
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
            <span class="text-emerald-600 font-bold"></span>
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

    // Validación estricta de máximo 2 meses
    const [sy, sm, sd] = startVal.split('-').map(Number);
    const [ey, em, ed] = endVal.split('-').map(Number);
    const sDate = new Date(sy, sm - 1, sd);
    const eDate = new Date(ey, em - 1, ed);
    const maxAllowedDate = new Date(sDate);
    maxAllowedDate.setMonth(maxAllowedDate.getMonth() + 2);

    if (eDate > maxAllowedDate) {
      if (banner) {
        banner.innerHTML = `
          <div class="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
            <span class="px-1.5 py-0.5 bg-amber-200 border border-amber-400 rounded text-amber-900 text-[10px]">LÍMITE 2 MESES</span>
            <div>El período máximo de alquiler permitido es de 2 meses (60 días). Por favor ajusta la fecha de retorno.</div>
          </div>
        `;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
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

  // Mapeo taxonómico de las 4 familias de maquinaria hacia categorías DB
  const CATEGORY_FAMILIES = {
    demolicion: [1, 2, 11, 16],
    compactacion: [7, 8, 12, 17, 18],
    generacion: [4, 5, 6, 14],
    alturas: [3, 10, 15, 20]
  };

  function filterByFamily(familyName) {
    const ids = CATEGORY_FAMILIES[familyName] || [];
    state.filters.familyCategoryIds = ids;
    state.filters.categoryId = '';
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) categorySelect.value = '';
    document.querySelectorAll('.category-chip').forEach(btn => btn.classList.remove('category-chip-active'));
    navigateView('catalog');
    renderToolsGrid(state.tools || []);
  }

  function onHeroCategorySelect(catId) {
    filterByCategoryChip(catId);
    navigateView('catalog');
  }

  function renderHomeFeatured() {
    const container = document.getElementById('home-featured-grid');
    if (!container || !state.tools) return;
    const available = state.tools.filter(t => t.status === 'DISPONIBLE').slice(0, 4);
    if (available.length === 0) {
      container.innerHTML = '<div class="col-span-full py-6 text-center text-slate-400 font-mono text-xs">Cargando equipos de flota operativa...</div>';
      return;
    }

    container.innerHTML = available.map(tool => {
      const imgSrc = toolImageSrc(tool);
      const imgCodeSrc = toolImageCodeSrc(tool);
      const weeklyDiscountRate = Math.round(Number(tool.baseDailyPrice) * 0.85);

      return `
        <div class="tool-card bg-white border border-[#d5dbe4] hover:border-amber-500 transition-all flex flex-col justify-between shadow-sm rounded overflow-hidden">
          <div>
            <div class="bg-[#0c1017] px-3 py-1.5 border-b border-[#182030] flex items-center justify-between text-[11px] font-mono">
              <span class="text-amber-400 font-bold">REF: ${tool.codeSku || 'EQ-' + tool.id}</span>
              <span class="text-slate-400 text-[10px] uppercase">${tool.categoryName || 'GENERAL'}</span>
            </div>

            <div class="h-40 bg-[#111722] overflow-hidden relative border-b border-[#D6D3C9] group">
              <img src="${imgSrc}" alt="${tool.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-code-src="${imgCodeSrc}" onerror="window.rmImgFallback(this)">
              <span class="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-600 text-white rounded">Flota Operativa</span>
              <span class="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-[#0c1017]/90 text-white rounded border border-[#182030]">${tool.brand}</span>
            </div>

            <div class="p-3.5 space-y-1.5">
              <div class="text-[10px] font-display font-extrabold uppercase text-amber-700 tracking-wider">${tool.brand} // ${tool.model}</div>
              <h4 class="text-sm font-display font-black text-slate-950 uppercase tracking-tight line-clamp-1">${tool.name}</h4>
              <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${tool.description}</p>
            </div>
          </div>

          <div class="p-3.5 pt-0 bg-slate-50 border-t border-[#D6D3C9] mt-auto space-y-2.5">
            <div class="flex items-baseline justify-between pt-2">
              <div>
                <span class="text-[9px] font-display font-bold text-slate-400 block uppercase tracking-wider">Tarifa Día:</span>
                <span class="text-base font-mono font-black text-slate-950">${formatCOP(tool.baseDailyPrice)}</span>
              </div>
              <div class="text-right">
                <span class="text-[9px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300/80 px-1.5 py-0.5 rounded block">Semana: ${formatCOP(weeklyDiscountRate)}/d</span>
              </div>
            </div>
            <button onclick="App.openToolDetail(${tool.id})" class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded transition-colors shadow-sm">
              Alquilar Equipo
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateHeaderRentalsCount() {
    const badge = document.getElementById('header-rentals-count-badge');
    if (!badge) return;
    if (state.token && state.profile && state.profile.role === 'ROLE_CLIENTE' && state.clientReservations) {
      badge.textContent = state.clientReservations.length;
    } else {
      badge.textContent = '0';
    }
  }

  function onActiveRentalsHeaderClick() {
    if (state.token && state.profile) {
      if (state.profile.role === 'ROLE_CLIENTE') navigateView('client');
      else if (state.profile.role === 'ROLE_PROVEEDOR') navigateView('provider');
      else if (state.profile.role === 'ROLE_ADMIN') navigateView('admin');
      else navigateView('catalog');
    } else {
      openAuthModal('login');
    }
  }

  function onPriceRangeRadio(rangeStr) {
    const minInput = document.getElementById('filter-min-price');
    const maxInput = document.getElementById('filter-max-price');
    if (rangeStr === 'all') {
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';
      state.filters.minPrice = '';
      state.filters.maxPrice = '';
    } else {
      const parts = rangeStr.split('-');
      if (minInput) minInput.value = parts[0];
      if (maxInput) maxInput.value = parts[1];
      state.filters.minPrice = parts[0];
      state.filters.maxPrice = parts[1];
    }
    renderToolsGrid(state.tools || []);
  }

  function onCategoryChange(catId) {
    state.filters.familyCategoryIds = null;
    state.filters.categoryId = catId ? String(catId) : '';
    document.querySelectorAll('.category-chip').forEach(btn => btn.classList.remove('category-chip-active'));
    const activeChip = document.getElementById(catId ? `chip-cat-${catId}` : 'chip-cat-all');
    if (activeChip) activeChip.classList.add('category-chip-active');
    loadTools();
  }

  function onSearchInput() {
    const input = document.getElementById('filter-search');
    state.filters.query = input ? input.value : '';
    renderToolsGrid(state.tools || []);
  }

  // Navegación entre vistas (Home, Catálogo, Panel Cliente, Proveedor, Admin)
  function navigateView(viewName) {
    state.currentView = viewName;
    const views = ['home', 'catalog', 'client', 'provider', 'admin'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.toggle('hidden', v !== viewName);
      const btn = document.getElementById(`btn-nav-${v}`);
      if (btn) {
        btn.classList.toggle('nav-pill-active', v === viewName);
        btn.classList.toggle('text-slate-600', v !== viewName);
      }
    });

    if (viewName === 'home') renderHomeFeatured();
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

    const radioAll = document.querySelector('input[name="price-range"][value="all"]');
    if (radioAll) radioAll.checked = true;

    state.filters = {
      query: '',
      categoryId: '',
      familyCategoryIds: null,
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
    state.filters.familyCategoryIds = null;
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
        listEl.innerHTML = '<div class="p-8 text-center text-slate-400 bg-white rounded-xl border border-[#D6D3C9]">No tienes reservas activas en este momento.</div>';
        return;
      }

      listEl.innerHTML = reservations.map(r => `
        <div class="bg-white p-5 rounded-2xl border border-[#D6D3C9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <img src="${r.toolImageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=200&q=80'}" class="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-[#D6D3C9]">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-mono font-bold text-slate-700">${r.reservationCode}</span>
                <span class="text-xs px-2.5 py-0.5 rounded-lg font-bold badge-res-${r.status.toLowerCase()}">${r.status}</span>
              </div>
              <h4 class="font-bold text-slate-900 text-base">${r.toolName}</h4>
              <p class="text-xs text-slate-500">${formatDate(r.startDate)} → ${formatDate(r.endDate)} (${r.totalDays} días)</p>
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
                  Pagar Ahora
                </button>
                <button onclick="App.cancelReservationAction(${r.id})" class="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-lg transition-colors">
                  Cancelar
                </button>
              ` : ''}

              ${r.status === 'APROBADA' || r.status === 'EN_CURSO' || r.status === 'FINALIZADA' ? `
                <button onclick="App.openInvoiceModal(${r.id})" class="px-3.5 py-1.5 bg-[#232320] hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                  <span>Factura DIAN</span>
                </button>
              ` : ''}

              ${r.status === 'FINALIZADA' ? `
                <button onclick="App.openSettlementModal(${r.id})" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm">
                  <span>Liquidación</span>
                </button>
                <button onclick="App.openReviewModal(${r.id}, ${r.toolId}, '${(r.toolName || 'Herramienta').replace(/'/g, "\\'")}', '${r.reservationCode}')" class="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm">
                  <span>Calificar</span>
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
            <div class="p-4 bg-white rounded-xl border border-[#D6D3C9] flex flex-col md:flex-row justify-between items-center gap-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono font-bold text-xs text-slate-700">${r.reservationCode}</span>
                  <span class="text-xs px-2 py-0.5 rounded-lg font-bold badge-res-${r.status.toLowerCase()}">${r.status}</span>
                </div>
                <div class="font-bold text-slate-900">${r.toolName}</div>
                <div class="text-xs text-slate-500">Cliente: <strong>${r.clientName}</strong> • ${formatDate(r.startDate)} a ${formatDate(r.endDate)}</div>
              </div>
              <div class="flex items-center gap-2">
                ${r.status === 'PENDIENTE' ? `
                  <button onclick="App.approveReservationAction(${r.id})" class="px-3 py-1.5 bg-[#181816] hover:bg-[#D94E1F] text-white font-bold text-xs rounded-lg">Aprobar</button>
                  <button onclick="App.rejectReservationAction(${r.id})" class="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-lg">Rechazar</button>
                ` : ''}
                ${r.status === 'APROBADA' ? `
                  <button onclick="App.openDeliveryModal(${r.id}, '${r.reservationCode}')" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg">Despachar / Entrega</button>
                ` : ''}
                ${r.status === 'EN_CURSO' ? `
                  <button onclick="App.openReturnModal(${r.id}, '${r.reservationCode}')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg">Recibir & Inspección</button>
                ` : ''}
                ${r.status === 'FINALIZADA' ? `
                  <button onclick="App.openSettlementModal(${r.id})" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm">
                    <span>Liquidación</span>
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

      // Tabla de catálogo de herramientas del proveedor (HU-01, HU-02)
      const toolsContainer = document.getElementById('provider-tools-list');
      if (toolsContainer) {
        if (!tools || tools.length === 0) {
          toolsContainer.innerHTML = `
            <div class="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-[#D6D3C9]">
              <span class="text-xs font-bold text-slate-400 block mb-2">EQUIPOS</span>
              <p class="font-bold text-sm">No tienes maquinaria registrada en tu catálogo.</p>
              <button type="button" onclick="App.openCreateToolModal()" class="mt-2 text-xs font-bold text-amber-600 hover:underline">+ Publica tu primera herramienta en 4FN</button>
            </div>
          `;
        } else {
          toolsContainer.innerHTML = tools.map(t => `
            <div class="p-3.5 bg-white rounded-xl border border-[#D6D3C9] flex flex-wrap justify-between items-center gap-3 text-xs shadow-sm hover:border-amber-300 transition-colors">
              <div class="flex items-center gap-3.5">
                <img src="${t.mainImageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=100&q=80'}" class="w-12 h-12 rounded-xl object-cover border border-[#D6D3C9]" onerror="this.src='https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=100&q=80'">
                <div>
                  <div class="flex items-center gap-2">
                    <strong class="text-slate-900 text-sm">${escapeHtml(t.name)}</strong>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'DISPONIBLE' ? 'bg-emerald-100 text-emerald-800' :
                      t.status === 'ALQUILADA' ? 'bg-[#FFE8DE] text-blue-800' :
                      t.status === 'MANTENIMIENTO' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }">${t.status}</span>
                  </div>
                  <div class="text-slate-500 mt-0.5">${escapeHtml(t.brand)} ${escapeHtml(t.model)} • <span class="font-mono text-slate-700">${escapeHtml(t.codeSku)}</span> • Tarifa: <strong class="text-slate-900">${formatCOP(t.baseDailyPrice)}/día</strong> (Garantía: ${formatCOP(t.depositAmount)})</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <select onchange="App.updateToolStatusAction(${t.id}, this.value)" class="px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500">
                  <option value="DISPONIBLE" ${t.status === 'DISPONIBLE' ? 'selected' : ''}>DISPONIBLE</option>
                  <option value="ALQUILADA" ${t.status === 'ALQUILADA' ? 'selected' : ''}>ALQUILADA</option>
                  <option value="MANTENIMIENTO" ${t.status === 'MANTENIMIENTO' ? 'selected' : ''}>MANTENIMIENTO</option>
                  <option value="RETIRADA" ${t.status === 'RETIRADA' ? 'selected' : ''}>RETIRADA</option>
                </select>
                <button type="button" onclick="App.openEditToolModal(${t.id})" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition-colors">
                  Editar
                </button>
                <button type="button" onclick="App.retireToolAction(${t.id}, '${escapeHtml(t.name).replace(/'/g, "\\'")}')" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 flex items-center gap-1 transition-colors">
                  Dar de Baja
                </button>
              </div>
            </div>
          `).join('');
        }
      }

      // SPRINT 4 (HU-08): Renderizar Gráficas Visuales Chart.js de Proveedor
      renderProviderCharts(metrics, tools, reservations);

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

      // SPRINT 4 (HU-08): Renderizar Gráficas Visuales Chart.js de Administrador
      renderAdminCharts(dash);

      // Top Herramientas
      const topList = document.getElementById('adm-top-tools-list');
      if (topList && dash.topRentedTools) {
        topList.innerHTML = dash.topRentedTools.map(t => `
          <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-[#D6D3C9] text-xs">
            <div>
              <strong class="text-slate-900">${t.toolName}</strong> (${t.brand})
              <div class="text-slate-500">${t.rentalCount} alquileres completados</div>
            </div>
            <div class="font-extrabold text-amber-600">${formatCOP(t.revenueGenerated)}</div>
          </div>
        `).join('');
      }

      // SPRINT 2 (HU-05): Facturación Mensual Real
      const monthlyList = document.getElementById('adm-monthly-revenue-list');
      if (monthlyList && dash.monthlyRevenue) {
        monthlyList.innerHTML = dash.monthlyRevenue.map(m => `
          <div class="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-[#D6D3C9] text-xs transition-colors">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-amber-500/10 text-amber-900 border border-amber-300 rounded font-mono font-bold">${m.period}</span>
              <span class="text-slate-500">${m.rentalCount} alquiler(es)</span>
            </div>
            <div class="font-mono font-extrabold text-slate-900">${formatCOP(m.revenue)}</div>
          </div>
        `).join('');
      }

      // SPRINT 2 (HU-05): Top 5 Clientes Frecuentes
      const clientList = document.getElementById('adm-top-clients-list');
      if (clientList && dash.topFrequentClients) {
        if (dash.topFrequentClients.length === 0) {
          clientList.innerHTML = `<div class="p-3 text-slate-400 text-xs text-center">No hay clientes con compras aún.</div>`;
        } else {
          clientList.innerHTML = dash.topFrequentClients.map((c, idx) => `
            <div class="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-[#D6D3C9] text-xs transition-colors">
              <div class="flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">#${idx + 1}</span>
                <div>
                  <div class="font-bold text-slate-900">${escapeHtml(c.clientName)}</div>
                  <div class="text-[10px] text-slate-500 font-mono">${escapeHtml(c.email)} • Doc: ${escapeHtml(c.documentNumber)}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-mono font-extrabold text-emerald-700">${formatCOP(c.totalSpent)}</div>
                <div class="text-[10px] text-slate-500">${c.totalReservations} reserva(s)</div>
              </div>
            </div>
          `).join('');
        }
      }

      // Todas las reservas
      const admResList = document.getElementById('adm-all-reservations-list');
      if (admResList) {
        admResList.innerHTML = allRes.map(r => `
          <tr class="border-b border-[#D6D3C9] text-xs">
            <td class="py-2.5 font-mono font-bold text-slate-800">${r.reservationCode}</td>
            <td class="py-2.5">${r.toolName}</td>
            <td class="py-2.5 text-slate-600">${r.clientName}</td>
            <td class="py-2.5">${formatDate(r.startDate)} a ${formatDate(r.endDate)}</td>
            <td class="py-2.5 font-bold text-slate-900">${formatCOP(r.totalAmount)}</td>
            <td class="py-2.5"><span class="px-2 py-0.5 rounded-lg font-bold badge-res-${r.status.toLowerCase()}">${r.status}</span></td>
          </tr>
        `).join('');
      }

      // Consultar salud del sistema (Spring Boot Actuator)
      checkSystemHealth(false);

      // Cargar Gestión de Usuarios y Proveedores (HU-03)
      loadAdminUsers();
      loadAdminProviders();
    } catch (err) {
      toast('Error cargando métricas globales: ' + err.message, 'error');
    }
  }

  // Verificación de salud y observabilidad con Spring Boot Actuator
  async function checkSystemHealth(notify = true) {
    try {
      const health = await API.system.getHealth();
      const statusEl = document.getElementById('actuator-status');
      const dbEl = document.getElementById('actuator-db');

      if (statusEl) {
        if (health.status === 'UP') {
          statusEl.textContent = 'UP (Saludable)';
          statusEl.className = 'font-black text-emerald-400 text-sm';
        } else {
          statusEl.textContent = health.status || 'DOWN';
          statusEl.className = 'font-black text-rose-400 text-sm';
        }
      }

      if (dbEl) {
        const dbStatus = health.components && health.components.db ? health.components.db.status : (health.status === 'UP' ? 'UP' : 'DOWN');
        if (dbStatus === 'UP') {
          dbEl.textContent = 'UP (Conectado)';
          dbEl.className = 'font-black text-emerald-400 text-sm';
        } else {
          dbEl.textContent = dbStatus || 'DESCONECTADO';
          dbEl.className = 'font-black text-rose-400 text-sm';
        }
      }

      if (notify) {
        toast('Monitoreo Actuator: Sistema operativo y base de datos conectada', 'success');
      }
    } catch (err) {
      const statusEl = document.getElementById('actuator-status');
      if (statusEl) {
        statusEl.textContent = 'INACCESIBLE';
        statusEl.className = 'font-black text-rose-400 text-sm';
      }
      if (notify) {
        toast('No se pudo consultar el estado de Actuator', 'warning');
      }
    }
  }

  // ==================== SPRINT 1: HU-03 GESTIÓN DE USUARIOS (ADMIN) ====================
  async function loadAdminUsers() {
    const listEl = document.getElementById('adm-users-list');
    if (!listEl) return;
    try {
      listEl.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-slate-400">Cargando usuarios...</td></tr>`;
      const users = await API.admin.getUsers();
      if (!users || users.length === 0) {
        listEl.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-slate-400">No hay usuarios registrados.</td></tr>`;
        return;
      }
      listEl.innerHTML = users.map(u => {
        const roleBadge = u.role === 'ROLE_ADMIN' 
          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
          : u.role === 'ROLE_PROVEEDOR' 
            ? 'bg-[#FFE8DE] text-blue-800 border border-[#D6D3C9]' 
            : 'bg-emerald-100 text-emerald-800 border border-emerald-200';
        const statusBadge = u.active 
          ? '<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Activo</span>'
          : '<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-200 text-slate-600">Inactivo</span>';
        const actionBtn = u.active
          ? `<button type="button" onclick="App.toggleUserStatusAction(${u.id}, true)" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] border border-rose-200 transition-colors">Desactivar</button>`
          : `<button type="button" onclick="App.toggleUserStatusAction(${u.id}, false)" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[11px] border border-emerald-200 transition-colors">Activar</button>`;
        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-2.5 font-mono font-bold text-slate-700">#${u.id}</td>
            <td class="py-2.5 font-bold text-slate-900">${escapeHtml(u.profileName || 'Usuario')}</td>
            <td class="py-2.5 text-slate-600 font-mono text-[11px]">${escapeHtml(u.email)}</td>
            <td class="py-2.5"><span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${roleBadge}">${u.role}</span></td>
            <td class="py-2.5">${statusBadge}</td>
            <td class="py-2.5 text-right">${actionBtn}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      listEl.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-rose-500">Error cargando usuarios: ${err.message}</td></tr>`;
    }
  }

  async function toggleUserStatusAction(userId, currentActive) {
    const newStatus = !currentActive;
    const actionVerb = newStatus ? 'activar' : 'desactivar';
    if (!confirm(`¿Estás seguro de que deseas ${actionVerb} la cuenta de este usuario?`)) return;
    try {
      await API.admin.toggleUserStatus(userId, newStatus);
      toast(`Usuario #${userId} ${newStatus ? 'activado' : 'desactivado'} con éxito.`, 'success');
      loadAdminUsers();
    } catch (err) {
      toast('Error al actualizar estado del usuario: ' + err.message, 'error');
    }
  }

  // ==================== SPRINT 1: HU-03 VERIFICACIÓN DE PROVEEDORES (ADMIN) ====================
  async function loadAdminProviders() {
    const listEl = document.getElementById('adm-providers-list');
    if (!listEl) return;
    try {
      listEl.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-slate-400">Cargando empresas proveedoras...</td></tr>`;
      const providers = await API.admin.getProviders();
      if (!providers || providers.length === 0) {
        listEl.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-slate-400">No hay proveedores registrados.</td></tr>`;
        return;
      }
      listEl.innerHTML = providers.map(p => {
        const verifiedBadge = p.verified
          ? '<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Verificado</span>'
          : '<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Pendiente</span>';
        const actionBtn = p.verified
          ? `<button type="button" onclick="App.verifyProviderAction(${p.id}, true)" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-[11px] border border-amber-200 transition-colors">Suspender</button>`
          : `<button type="button" onclick="App.verifyProviderAction(${p.id}, false)" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] border border-emerald-300 transition-colors shadow-sm">Aprobar Empresa</button>`;
        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-2.5 font-mono font-bold text-slate-700">#${p.id}</td>
            <td class="py-2.5 font-bold text-slate-900">${escapeHtml(p.companyName)}</td>
            <td class="py-2.5 font-mono text-slate-600">${escapeHtml(p.nitRut)}</td>
            <td class="py-2.5 text-slate-700">${escapeHtml(p.legalRepresentative || '-')}</td>
            <td class="py-2.5 text-slate-500">${escapeHtml(p.city || '-')} (${escapeHtml(p.phone || '-')})</td>
            <td class="py-2.5">${verifiedBadge}</td>
            <td class="py-2.5 text-right">${actionBtn}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      listEl.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-rose-500">Error cargando proveedores: ${err.message}</td></tr>`;
    }
  }

  async function verifyProviderAction(providerId, currentVerified) {
    const newStatus = !currentVerified;
    const actionVerb = newStatus ? 'verificar y aprobar' : 'retirar la verificación de';
    if (!confirm(`¿Deseas ${actionVerb} esta empresa proveedora?`)) return;
    try {
      await API.admin.verifyProvider(providerId, newStatus);
      toast(`Empresa proveedora #${providerId} ${newStatus ? 'verificada' : 'suspendida'} correctamente.`, 'success');
      loadAdminProviders();
    } catch (err) {
      toast('Error actualizando verificación: ' + err.message, 'error');
    }
  }

  // ==================== SPRINT 1: HU-01 Y HU-02 GESTIÓN DE HERRAMIENTAS 4FN (PROVEEDOR) ====================
  async function openCreateToolModal() {
    const form = document.getElementById('form-tool');
    if (form) form.reset();
    document.getElementById('tool-form-id').value = '';
    document.getElementById('tool-form-title').innerHTML = 'Publicar Nueva Herramienta';
    document.getElementById('btn-submit-tool').textContent = 'Publicar Herramienta';
    document.getElementById('tool-form-sku').disabled = false;

    // Cargar categorías en el select
    await populateCategorySelect('tool-form-category');
    openModal('modal-tool-form');
  }

  async function openEditToolModal(toolId) {
    try {
      const tool = await API.tools.getToolDetail(toolId);
      await populateCategorySelect('tool-form-category');

      document.getElementById('tool-form-id').value = tool.id;
      document.getElementById('tool-form-name').value = tool.name || '';
      document.getElementById('tool-form-sku').value = tool.codeSku || '';
      document.getElementById('tool-form-sku').disabled = true; // El SKU no se modifica en edición
      document.getElementById('tool-form-category').value = tool.categoryId;
      document.getElementById('tool-form-brand').value = tool.brand || '';
      document.getElementById('tool-form-model').value = tool.model || '';
      document.getElementById('tool-form-price').value = tool.baseDailyPrice || '';
      document.getElementById('tool-form-deposit').value = tool.depositAmount || '';
      document.getElementById('tool-form-image').value = tool.mainImageUrl || '';
      document.getElementById('tool-form-desc').value = tool.description || '';

      // Formatear especificaciones 4FN
      if (tool.specifications && tool.specifications.length > 0) {
        document.getElementById('tool-form-specs').value = tool.specifications
          .map(s => `${s.specName}: ${s.specValue}`).join('\n');
      } else {
        document.getElementById('tool-form-specs').value = '';
      }

      // Formatear requisitos de seguridad 4FN
      if (tool.safetyRequirements && tool.safetyRequirements.length > 0) {
        document.getElementById('tool-form-safety').value = tool.safetyRequirements
          .map(r => r.requirementName).join('\n');
      } else {
        document.getElementById('tool-form-safety').value = '';
      }

      // Tarifa semanal
      const weeklyTier = tool.pricingTiers && tool.pricingTiers.find(t => t.tierType === 'SEMANAL');
      document.getElementById('tool-form-weekly-price').value = weeklyTier ? weeklyTier.pricePerDay : '';

      document.getElementById('tool-form-title').innerHTML = 'Editar Herramienta: ' + escapeHtml(tool.name);
      document.getElementById('btn-submit-tool').textContent = 'Actualizar Herramienta';
      openModal('modal-tool-form');
    } catch (err) {
      toast('Error al cargar datos de la herramienta: ' + err.message, 'error');
    }
  }

  async function populateCategorySelect(selectId) {
    const selectEl = document.getElementById(selectId);
    if (!selectEl) return;
    if (!state.categories || state.categories.length === 0) {
      state.categories = await API.tools.getCategories();
    }
    selectEl.innerHTML = state.categories.map(c => `
      <option value="${c.id}">${escapeHtml(c.name)}</option>
    `).join('');
  }

  async function submitToolForm(event) {
    event.preventDefault();
    const toolId = document.getElementById('tool-form-id').value;
    const isEdit = !!toolId;

    const name = document.getElementById('tool-form-name').value.trim();
    const sku = document.getElementById('tool-form-sku').value.trim();
    const categoryId = parseInt(document.getElementById('tool-form-category').value, 10);
    const brand = document.getElementById('tool-form-brand').value.trim();
    const model = document.getElementById('tool-form-model').value.trim();
    const baseDailyPrice = parseFloat(document.getElementById('tool-form-price').value);
    const depositAmount = parseFloat(document.getElementById('tool-form-deposit').value);
    const mainImageUrl = document.getElementById('tool-form-image').value.trim() || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80';
    const description = document.getElementById('tool-form-desc').value.trim();

    // Procesar Especificaciones Técnicas (4FN)
    const specsText = document.getElementById('tool-form-specs').value.trim();
    const specifications = [];
    if (specsText) {
      const lines = specsText.split('\n');
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          specifications.push({
            specName: parts[0].trim(),
            specValue: parts.slice(1).join(':').trim()
          });
        }
      }
    }

    // Procesar Requisitos de Seguridad y EPP (4FN)
    const safetyText = document.getElementById('tool-form-safety').value.trim();
    const safetyRequirements = [];
    if (safetyText) {
      const lines = safetyText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          safetyRequirements.push({
            requirementName: trimmed,
            description: 'Uso obligatorio para operar el equipo de manera segura'
          });
        }
      }
    }

    // Procesar Tarifas Escalonadas (4FN)
    const pricingTiers = [];
    const weeklyPriceRaw = document.getElementById('tool-form-weekly-price').value;
    const weeklyPrice = weeklyPriceRaw ? parseFloat(weeklyPriceRaw) : Math.round(baseDailyPrice * 0.85);
    pricingTiers.push({
      tierType: 'SEMANAL',
      minDays: 7,
      pricePerDay: weeklyPrice
    });

    // Procesar Imágenes (4FN)
    const images = [
      { imageUrl: mainImageUrl, primary: true, caption: name }
    ];

    const btn = document.getElementById('btn-submit-tool');
    const originalBtnText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      if (isEdit) {
        const updatePayload = {
          categoryId,
          name,
          brand,
          model,
          description,
          baseDailyPrice,
          depositAmount,
          mainImageUrl,
          images,
          specifications,
          pricingTiers,
          safetyRequirements
        };
        await API.tools.updateTool(toolId, updatePayload);
        toast(`Herramienta "${name}" actualizada con éxito en 4FN.`, 'success');
      } else {
        const providerId = (state.user && state.user.providerId) ? state.user.providerId : 1;
        const createPayload = {
          providerId,
          categoryId,
          codeSku: sku,
          name,
          brand,
          model,
          description,
          baseDailyPrice,
          depositAmount,
          mainImageUrl,
          images,
          specifications,
          pricingTiers,
          safetyRequirements
        };
        await API.tools.createTool(createPayload);
        toast(`Herramienta "${name}" creada y publicada con sus 4 tablas 4FN.`, 'success');
      }

      closeModal('modal-tool-form');
      loadProviderDashboard();
      loadCatalog();
    } catch (err) {
      toast('Error al guardar herramienta: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalBtnText;
    }
  }

  async function retireToolAction(toolId, toolName) {
    if (!confirm(`¿Estás seguro de que deseas dar de baja la herramienta "${toolName}"?\nPasará a estado RETIRADA y no se podrá volver a alquilar.`)) return;
    try {
      await API.tools.updateStatus(toolId, 'RETIRADA');
      toast(`Herramienta "${toolName}" dada de baja correctamente.`, 'success');
      loadProviderDashboard();
      loadCatalog();
    } catch (err) {
      toast('Error al dar de baja herramienta: ' + err.message, 'error');
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
      toast(' Reporte CSV de reservas descargado con éxito.', 'success');
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
      toast(' Auditoría global exportada a CSV con éxito.', 'success');
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

      // SPRINT 4 (HU-10): Generación de Código QR Real para el CUFE de la Factura
      const qrCanvas = document.getElementById('inv-qrcode-canvas');
      if (qrCanvas && window.QRious) {
        new QRious({
          element: qrCanvas,
          value: `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${cufeHash}`,
          size: 70,
          level: 'M'
        });
      }

      document.getElementById('modal-invoice').classList.remove('hidden');
    } catch (err) {
      toast('No se encontró factura para esta reserva o aún no ha sido pagada.', 'error');
    }
  }

  // Medidor interactivo de fortaleza de contraseñas (OWASP)
  function checkPasswordStrength(password, prefix) {
    const bar = document.getElementById(prefix + '-pass-bar');
    const badge = document.getElementById(prefix + '-pass-badge');
    const reqLen = document.getElementById(prefix + '-req-len');
    const reqUpper = document.getElementById(prefix + '-req-upper');
    const reqLower = document.getElementById(prefix + '-req-lower');
    const reqNum = document.getElementById(prefix + '-req-num');
    const reqSym = document.getElementById(prefix + '-req-sym');

    if (!bar) return;

    const hasLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNum = /\d/.test(password);
    const hasSym = /[@$!%*?&#^()_+\-=]/.test(password);

    if (reqLen) reqLen.className = hasLen ? 'text-emerald-600 font-bold' : 'text-slate-400';
    if (reqUpper) reqUpper.className = hasUpper ? 'text-emerald-600 font-bold' : 'text-slate-400';
    if (reqLower) reqLower.className = hasLower ? 'text-emerald-600 font-bold' : 'text-slate-400';
    if (reqNum) reqNum.className = hasNum ? 'text-emerald-600 font-bold' : 'text-slate-400';
    if (reqSym) reqSym.className = hasSym ? 'text-emerald-600 font-bold' : 'text-slate-400';

    let score = 0;
    if (hasLen) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNum) score++;
    if (hasSym) score++;

    if (password.length === 0) {
      bar.style.width = '0%';
      bar.className = 'h-full transition-all duration-300 bg-slate-300';
      if (badge) { badge.textContent = 'Requerido: 8+ caracteres'; badge.className = 'text-[10px] font-bold text-slate-400'; }
    } else if (score <= 2) {
      bar.style.width = '25%';
      bar.className = 'h-full transition-all duration-300 bg-rose-500';
      if (badge) { badge.textContent = 'Nivel: Débil'; badge.className = 'text-[10px] font-bold text-rose-600'; }
    } else if (score === 3 || score === 4) {
      bar.style.width = '65%';
      bar.className = 'h-full transition-all duration-300 bg-amber-500';
      if (badge) { badge.textContent = 'Nivel: Buena'; badge.className = 'text-[10px] font-bold text-amber-600'; }
    } else {
      bar.style.width = '100%';
      bar.className = 'h-full transition-all duration-300 bg-emerald-500';
      if (badge) { badge.textContent = 'Nivel: Fuerte y Segura'; badge.className = 'text-[10px] font-bold text-emerald-600'; }
    }
  }

  // Pestañas de la Pasarela de Pago
  function switchPaymentTab(tab) {
    const tabs = ['card', 'pse', 'trf'];
    tabs.forEach(t => {
      const btn = document.getElementById('pay-tab-' + t);
      const panel = document.getElementById('pay-panel-' + t);
      if (t === tab) {
        if (btn) {
          btn.className = 'py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 bg-[#181816] text-white shadow-sm';
        }
        if (panel) panel.classList.remove('hidden');
      } else {
        if (btn) {
          btn.className = 'py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-950';
        }
        if (panel) panel.classList.add('hidden');
      }
    });

    const methodInput = document.getElementById('pay-selected-method');
    if (methodInput) {
      if (tab === 'card') methodInput.value = 'TARJETA_CREDITO';
      else if (tab === 'pse') methodInput.value = 'PSE';
      else if (tab === 'trf') methodInput.value = 'TRANSFERENCIA';
    }
  }

  // Formateo y simulación de tarjeta en tiempo real
  function onCardNumberFormat(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    input.value = formatted;

    const previewNum = document.getElementById('card-preview-number');
    if (previewNum) {
      if (val.length === 0) {
        previewNum.textContent = '4532 •••• •••• 2026';
      } else {
        previewNum.textContent = formatted;
      }
    }

    const brandEl = document.getElementById('card-preview-brand');
    const isAmex = val.startsWith('34') || val.startsWith('37');
    if (brandEl) {
      if (val.startsWith('4')) {
        brandEl.textContent = 'VISA';
        brandEl.className = 'text-sm font-black italic tracking-wider text-[#D94E1F]';
      } else if (val.startsWith('5') || val.startsWith('2')) {
        brandEl.textContent = 'MASTERCARD';
        brandEl.className = 'text-sm font-black italic tracking-wider text-amber-400';
      } else if (isAmex) {
        brandEl.textContent = 'AMERICAN EXPRESS';
        brandEl.className = 'text-sm font-black italic tracking-wider text-cyan-400';
      } else {
        brandEl.textContent = 'VISA / MC';
        brandEl.className = 'text-sm font-black italic tracking-wider text-slate-300';
      }
    }

    // Ajustar longitud de CVV dinámicamente según franquicia
    const cvvInput = document.getElementById('pay-card-cvv');
    const cvvHint = document.getElementById('pay-cvv-hint');
    const maxCvv = isAmex ? 4 : 3;
    if (cvvInput) {
      cvvInput.maxLength = maxCvv;
      if (cvvInput.value.length > maxCvv) {
        cvvInput.value = cvvInput.value.substring(0, maxCvv);
      }
    }
    if (cvvHint) {
      cvvHint.textContent = isAmex ? 'Frente 4 dígitos' : 'Reverso 3 dígitos';
    }
  }

  function onCardInputChange() {
    const holderInput = document.getElementById('pay-card-holder');
    const previewHolder = document.getElementById('card-preview-holder');
    if (holderInput && previewHolder) {
      previewHolder.textContent = holderInput.value.toUpperCase() || 'CONTRATISTA DE OBRA';
    }
  }

  function onCardExpFormat(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      input.value = val.substring(0, 2) + '/' + val.substring(2);
    } else {
      input.value = val;
    }
    const previewExp = document.getElementById('card-preview-exp');
    if (previewExp) {
      previewExp.textContent = input.value || '12/28';
    }
  }

  function onCardCvvFormat(input) {
    const cardNum = (document.getElementById('pay-card-masked')?.value || '').replace(/\D/g, '');
    const isAmex = cardNum.startsWith('34') || cardNum.startsWith('37');
    const maxLen = isAmex ? 4 : 3;
    input.maxLength = maxLen;
    input.value = input.value.replace(/\D/g, '').substring(0, maxLen);
  }

  // Algoritmo de validación de tarjeta Luhn (módulo 10)
  function validateLuhn(numStr) {
    if (!numStr || numStr.length < 13) return false;
    let sum = 0;
    let alternate = false;
    for (let i = numStr.length - 1; i >= 0; i--) {
      let n = parseInt(numStr.charAt(i), 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  // Modal Pagos Enriquecido con Desglose Fiscal DIAN
  async function openPaymentModal(reservationId, code, amount) {
    state.activeReservationForPayment = { id: reservationId, code, amount };
    document.getElementById('pay-res-code').textContent = code;
    document.getElementById('pay-res-amount').textContent = formatCOP(amount);

    // Elementos del desglose
    const subtotalEl = document.getElementById('pay-subtotal');
    const discountRow = document.getElementById('pay-discount-row');
    const discountEl = document.getElementById('pay-discount');
    const ivaEl = document.getElementById('pay-iva');
    const depositEl = document.getElementById('pay-deposit');
    const toolNameEl = document.getElementById('pay-tool-name');
    const toolCatEl = document.getElementById('pay-tool-cat');
    const datesEl = document.getElementById('pay-dates-summary');
    const daysBadge = document.getElementById('pay-days-badge');

    // Intentar obtener detalles completos de la reserva
    try {
      let res = null;
      if (state.clientReservations) {
        res = state.clientReservations.find(r => r.id === reservationId);
      }
      if (!res && state.providerReservations) {
        res = state.providerReservations.find(r => r.id === reservationId);
      }
      if (!res && state.adminReservations) {
        res = state.adminReservations.find(r => r.id === reservationId);
      }
      if (!res) {
        res = await API.reservations.getById(reservationId);
      }

      if (res) {
        if (toolNameEl) toolNameEl.textContent = res.toolName || 'Maquinaria Industrial';
        if (toolCatEl) toolCatEl.textContent = res.categoryName || 'Maquinaria';
        if (datesEl) datesEl.textContent = `${formatDate(res.startDate)} → ${formatDate(res.endDate)}`;
        if (daysBadge) daysBadge.textContent = `${res.totalDays || 1} ${(res.totalDays === 1 ? 'Día' : 'Días')}`;
        
        if (subtotalEl) subtotalEl.textContent = formatCOP(res.subtotalPrice || (amount * 0.70));
        if (ivaEl) ivaEl.textContent = formatCOP(res.ivaAmount || (amount * 0.15));
        if (depositEl) depositEl.textContent = formatCOP(res.depositAmount || 0);

        if (res.weeklyDiscount && Number(res.weeklyDiscount) > 0) {
          if (discountRow) discountRow.classList.remove('hidden');
          if (discountEl) discountEl.textContent = '-' + formatCOP(res.weeklyDiscount);
        } else {
          if (discountRow) discountRow.classList.add('hidden');
        }
      }
    } catch (e) {
      console.warn('Detalle de reserva no precargado:', e);
    }

    switchPaymentTab('card');
    
    // Restaurar estado de botón de pago
    const btnSubmit = document.getElementById('btn-pay-submit');
    const btnText = document.getElementById('btn-pay-text');
    const btnSpinner = document.getElementById('btn-pay-spinner');
    if (btnSubmit) btnSubmit.disabled = false;
    if (btnText) btnText.textContent = `Pagar ${formatCOP(amount)} y Confirmar`;
    if (btnSpinner) btnSpinner.classList.add('hidden');

    document.getElementById('modal-payment').classList.remove('hidden');
  }

  async function processPaymentSubmit(e) {
    e.preventDefault();
    if (!state.activeReservationForPayment) return;

    const resId = state.activeReservationForPayment.id;
    const method = document.getElementById('pay-selected-method')?.value || 'TARJETA_CREDITO';
    
    let cardMasked = '4532 •••• •••• 2026';
    let gatewayRef = 'GW-TXN-' + Date.now();

    if (method === 'TARJETA_CREDITO') {
      const cardHolder = (document.getElementById('pay-card-holder')?.value || '').trim();
      const rawCard = document.getElementById('pay-card-masked')?.value || '';
      const cleanDigits = rawCard.replace(/\D/g, '');
      const expDate = (document.getElementById('pay-card-exp')?.value || '').trim();
      const cvv = (document.getElementById('pay-card-cvv')?.value || '').trim();

      // 1. Validar Nombre del Titular
      if (!cardHolder || cardHolder.length < 3 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cardHolder)) {
        toast('Ingresa un nombre de titular válido (mínimo 3 letras, sin símbolos ni números).', 'error');
        document.getElementById('pay-card-holder')?.focus();
        return;
      }

      // 2. Validar Número de Tarjeta
      const isAmex = cleanDigits.startsWith('34') || cleanDigits.startsWith('37');
      const expectedCardLen = isAmex ? 15 : 16;
      if (cleanDigits.length !== expectedCardLen) {
        toast(`El número de tarjeta debe tener ${expectedCardLen} dígitos (${isAmex ? 'American Express' : 'Visa/Mastercard'}).`, 'error');
        document.getElementById('pay-card-masked')?.focus();
        return;
      }

      if (!validateLuhn(cleanDigits)) {
        toast('El número de tarjeta no es válido (falla suma de verificación bancaria Luhn).', 'error');
        document.getElementById('pay-card-masked')?.focus();
        return;
      }

      // 3. Validar Fecha de Expiración
      const expMatch = expDate.match(/^(\d{2})\/(\d{2})$/);
      if (!expMatch) {
        toast('Formato de fecha de vencimiento inválido. Usa MM/AA (ejemplo: 12/28).', 'error');
        document.getElementById('pay-card-exp')?.focus();
        return;
      }
      const expMonth = parseInt(expMatch[1], 10);
      const expYear = parseInt('20' + expMatch[2], 10);
      if (expMonth < 1 || expMonth > 12) {
        toast('Mes de vencimiento inválido. Debe estar entre 01 y 12.', 'error');
        document.getElementById('pay-card-exp')?.focus();
        return;
      }
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        toast('La tarjeta de crédito está vencida. Ingresa una fecha vigente.', 'error');
        document.getElementById('pay-card-exp')?.focus();
        return;
      }

      // 4. Validar Código CVV Estricto (3 dígitos para Visa/Mastercard, 4 para Amex)
      const expectedCvvLen = isAmex ? 4 : 3;
      if (!/^\d+$/.test(cvv) || cvv.length !== expectedCvvLen) {
        toast(`Código de seguridad inválido: El CVV para ${isAmex ? 'American Express' : 'Visa / Mastercard'} debe tener exactamente ${expectedCvvLen} dígitos numéricos.`, 'error');
        document.getElementById('pay-card-cvv')?.focus();
        return;
      }

      const brandName = cleanDigits.startsWith('4') ? 'Visa' : isAmex ? 'Amex' : 'Mastercard';
      const last4 = cleanDigits.slice(-4);
      cardMasked = `${brandName} •••• ${last4}`;
      gatewayRef = 'CARD-' + Date.now();
    } else if (method === 'PSE') {
      const bank = document.getElementById('pse-bank')?.value || '';
      const docType = document.getElementById('pse-doc-type')?.value || 'CC';
      const docNum = (document.getElementById('pse-doc-number')?.value || '').trim();

      if (!bank) {
        toast('Por favor selecciona tu entidad bancaria para débito PSE.', 'error');
        return;
      }
      if (!docNum || docNum.length < 5 || !/^\d+$/.test(docNum)) {
        toast('Ingresa un número de documento válido para PSE (mínimo 5 dígitos).', 'error');
        document.getElementById('pse-doc-number')?.focus();
        return;
      }

      cardMasked = `${bank} (${docType} ${docNum})`;
      gatewayRef = 'PSE-' + Date.now();
    } else if (method === 'TRANSFERENCIA') {
      const trfRef = (document.getElementById('trf-reference')?.value || '').trim();
      if (!trfRef || trfRef.length < 4) {
        toast('Ingresa el número de comprobante o referencia de tu transferencia bancaria.', 'error');
        document.getElementById('trf-reference')?.focus();
        return;
      }
      cardMasked = 'Bancolombia Cta Cte 482-90182-1';
      gatewayRef = trfRef;
    }

    const btnSubmit = document.getElementById('btn-pay-submit');
    const btnText = document.getElementById('btn-pay-text');
    const btnSpinner = document.getElementById('btn-pay-spinner');
    const btnIcon = document.getElementById('btn-pay-icon');

    try {
      if (btnSubmit) btnSubmit.disabled = true;
      if (btnText) btnText.textContent = 'Validando con pasarela segura...';
      if (btnSpinner) btnSpinner.classList.remove('hidden');
      if (btnIcon) btnIcon.classList.add('hidden');

      // Simulación de latencia realista de pasarela bancaria
      await new Promise(r => setTimeout(r, 600));

      await API.payments.processPayment({
        reservationId: resId,
        clientId: state.profile?.clientId || state.user?.id || 1,
        paymentMethod: method,
        amount: state.activeReservationForPayment.amount,
        cardNumberMasked: cardMasked,
        gatewayReference: gatewayRef
      });

      closeModal('modal-payment');
      toast('¡Pago procesado exitosamente!\nReserva confirmada y Factura DIAN emitida con 19% IVA.', 'success');
      
      if (state.currentView === 'client') {
        loadClientDashboard();
      }
      setTimeout(() => openInvoiceModal(resId), 400);
    } catch (err) {
      toast('Error al procesar el pago: ' + err.message, 'error');
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
      if (btnText) btnText.textContent = 'Confirmar y Procesar Transacción';
      if (btnSpinner) btnSpinner.classList.add('hidden');
      if (btnIcon) btnIcon.classList.remove('hidden');
    }
  }

  // Modales Despacho / Devolución
  async function openDeliveryModal(reservationId, code) {
    state.activeReservationForDelivery = { id: reservationId, code };
    document.getElementById('deliv-res-code').textContent = code;

    // SPRINT 4 (HU-09): Carga dinámica de requisitos obligatorios EPP (4FN)
    const chkList = document.getElementById('deliv-epp-checklist');
    if (chkList) {
      chkList.innerHTML = '<div class="p-2 text-slate-400 text-xs text-center animate-pulse">Consultando protocolo EPP de la herramienta...</div>';
    }

    document.getElementById('modal-delivery').classList.remove('hidden');

    try {
      const res = state.providerReservations.find(r => r.id === reservationId);
      let requirements = [];

      if (res && res.toolId) {
        const toolDetail = await API.tools.getToolDetail(res.toolId);
        if (toolDetail && toolDetail.safetyRequirements && toolDetail.safetyRequirements.length > 0) {
          requirements = toolDetail.safetyRequirements;
        }
      }

      // Si la herramienta no tiene requisitos en BD, cargar EPP estándar obligatorio de obra civil
      if (requirements.length === 0) {
        requirements = [
          { requirementName: 'Casco de Seguridad Industrial', description: 'Certificación ANSI Z89.1 Tipo I / II Clase E con barbuquejo de 3 puntos.' },
          { requirementName: 'Botas de Seguridad con Puntera', description: 'Calzado con puntera de acero y suela dieléctrica antideslizante.' },
          { requirementName: 'Gafas de Protección Visual UV', description: 'Lente de policarbonato anti-impacto (Norma ANSI Z87.1).' },
          { requirementName: 'Guantes de Protección Mecánica', description: 'Guantes de carnaza / nitrilo para manipulación y amortiguación de vibraciones.' },
          { requirementName: 'Protección Auditiva de Copa', description: 'Atenuación mínima NRR 25 dB para operación continua de maquinaria.' }
        ];
      }

      if (chkList) {
        chkList.innerHTML = requirements.map((req, idx) => `
          <label class="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-amber-200/80 cursor-pointer hover:bg-amber-50/60 transition-colors select-none">
            <input type="checkbox" id="epp-item-${idx}" class="deliv-epp-chk mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer" data-name="${escapeHtml(req.requirementName)}">
            <div class="text-xs">
              <strong class="text-slate-900 block leading-tight">${escapeHtml(req.requirementName)}</strong>
              <span class="text-slate-500 text-[11px] leading-tight block mt-0.5">${escapeHtml(req.description)}</span>
            </div>
          </label>
        `).join('');
      }
    } catch (err) {
      console.warn('Error al cargar requisitos EPP:', err);
    }
  }

  async function submitDelivery(e) {
    e.preventDefault();

    // SPRINT 4 (HU-09): Validación estricta de Checklist EPP (Norma SST)
    const eppCheckboxes = Array.from(document.querySelectorAll('#deliv-epp-checklist .deliv-epp-chk'));
    const unchecked = eppCheckboxes.filter(c => !c.checked);
    if (unchecked.length > 0) {
      toast('¡Atención SST Obligatoria!\nDebe verificar y marcar todos los elementos de EPP requeridos antes de despachar el equipo al arrendatario.', 'error');
      return;
    }

    const verifiedEPPs = eppCheckboxes.map(c => c.getAttribute('data-name')).join(', ');
    const userNotes = document.getElementById('deliv-notes').value.trim();
    const finalNotes = userNotes + (verifiedEPPs ? `\n[SST EPP Verificado]: ${verifiedEPPs}` : '');

    try {
      await API.deliveries.startRental({
        reservationId: state.activeReservationForDelivery.id,
        deliveredBy: document.getElementById('deliv-by').value,
        initialConditionNotes: finalNotes,
        clientSignatureAck: document.getElementById('deliv-ack').checked
      });
      closeModal('modal-delivery');
      toast('Despacho registrado con protocolo EPP validado. Reserva EN_CURSO.', 'success');
      loadProviderDashboard();
    } catch (err) {
      toast('Error al registrar entrega: ' + err.message, 'error');
    }
  }

  function openReturnModal(reservationId, code) {
    state.activeReservationForReturn = { id: reservationId, code };
    document.getElementById('ret-res-code').textContent = code;
    document.getElementById('ret-condition').value = 'EXCELENTE';
    document.getElementById('ret-damage-fee').value = 0;
    document.getElementById('ret-refund').checked = true;
    const damageSec = document.getElementById('ret-damage-section');
    if (damageSec) damageSec.classList.add('hidden');
    const descEl = document.getElementById('ret-damage-desc');
    if (descEl) descEl.value = '';
    document.getElementById('ret-notes').value = 'Inspección física aprobada, horómetro dentro de rango y sin averías.';
    document.getElementById('modal-return').classList.remove('hidden');
  }

  function onReturnConditionChange() {
    const cond = document.getElementById('ret-condition').value;
    const damageSection = document.getElementById('ret-damage-section');
    const feeInput = document.getElementById('ret-damage-fee');
    const refundCheckbox = document.getElementById('ret-refund');

    if (cond === 'DANADO') {
      if (damageSection) damageSection.classList.remove('hidden');
      if (feeInput && Number(feeInput.value) === 0) feeInput.value = 150000;
      if (refundCheckbox) refundCheckbox.checked = false;
      document.getElementById('ret-notes').value = 'Equipo devuelto con avería mecánica o estructural. Requiere evaluación técnica.';
    } else if (cond === 'REGULAR') {
      if (damageSection) damageSection.classList.remove('hidden');
      if (feeInput && Number(feeInput.value) === 0) feeInput.value = 35000;
      document.getElementById('ret-notes').value = 'Equipo devuelto con suciedad excesiva en obra. Requiere limpieza y ajuste.';
    } else {
      if (damageSection) damageSection.classList.add('hidden');
      if (feeInput) feeInput.value = 0;
      if (refundCheckbox) refundCheckbox.checked = true;
      document.getElementById('ret-notes').value = 'Inspección física aprobada, horómetro dentro de rango y sin averías.';
    }
  }

  async function submitReturn(e) {
    e.preventDefault();
    const cond = document.getElementById('ret-condition').value;
    const fee = Number(document.getElementById('ret-damage-fee').value) || 0;
    const damageType = document.getElementById('ret-damage-type') ? document.getElementById('ret-damage-type').value : 'ESTRUCTURA';
    const damageDesc = document.getElementById('ret-damage-desc') ? document.getElementById('ret-damage-desc').value.trim() : '';

    try {
      const res = await API.deliveries.finishRental({
        reservationId: state.activeReservationForReturn.id,
        receivedBy: document.getElementById('ret-by').value,
        conditionStatus: cond,
        inspectionNotes: document.getElementById('ret-notes').value,
        depositRefunded: document.getElementById('ret-refund').checked,
        extraDamageFee: fee,
        repairCostEstimate: fee,
        damageType: (cond === 'DANADO' || fee > 0) ? damageType : null,
        damageDescription: (cond === 'DANADO' || fee > 0) ? (damageDesc || document.getElementById('ret-notes').value) : null
      });
      closeModal('modal-return');
      const msg = (cond === 'DANADO' || fee > 0)
        ? 'Devolución registrada con reporte de avería (damage_reports). La herramienta pasó a MANTENIMIENTO.'
        : 'Devolución registrada e inspección cerrada. Reserva FINALIZADA.';
      toast(msg, cond === 'DANADO' ? 'warning' : 'success');
      loadProviderDashboard();
      loadCatalog();
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
        badge.className = 'px-2 py-0.5 rounded text-[11px] font-extrabold bg-[#FFE8DE] text-blue-800';
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
        text.innerHTML = '<strong> Reembolso Total:</strong> Depósito en garantía reintegrado al 100% al cliente sin deducciones.';
      } else if (data.settlementStatus === 'REEMBOLSO_PARCIAL') {
        banner.className = 'text-center p-3 rounded-xl border bg-amber-50 border-amber-300 text-amber-800';
        text.innerHTML = '<strong>Reembolso Parcial:</strong> Se dedujo el costo de reparación de averías y se reintegró el saldo.';
      } else if (data.settlementStatus === 'RETENIDO_TOTAL') {
        banner.className = 'text-center p-3 rounded-xl border bg-orange-50 border-orange-300 text-orange-800';
        text.innerHTML = '<strong>Fianza Retenida:</strong> El costo de avería cubrió la totalidad de la garantía depositada.';
      } else {
        banner.className = 'text-center p-3 rounded-xl border bg-rose-50 border-rose-300 text-rose-800';
        text.innerHTML = '<strong>Saldo a Cobrar:</strong> El costo de averías excede la garantía. Se genera saldo a cobrar al contratista.';
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
    const email = (document.getElementById('login-email').value || '').trim();
    const pass = (document.getElementById('login-password').value || '').trim();

    if (!email || !pass) {
      toast('Por favor ingresa tu correo y contraseña.', 'warning');
      return;
    }

    try {
      const user = await API.auth.login(email, pass);
      const me = await API.auth.getMe();
      state.user = user;
      state.profile = me;
      closeModal('modal-auth');
      renderHeaderUser();
      toast(`¡Bienvenido de nuevo, ${me.displayName || user.name || 'Usuario'}!`, 'success');

      if (me.role === 'ROLE_CLIENTE') navigateView('client');
      else if (me.role === 'ROLE_PROVEEDOR') navigateView('provider');
      else if (me.role === 'ROLE_ADMIN') navigateView('admin');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,64}$/;
  const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s'-]{2,50}$/;
  const PHONE_REGEX = /^(\+?57)?(3[0-9]{9}|60[1-8][0-9]{7}|[1-9][0-9]{6,9})$/;
  const CITY_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]{3,50}$/;
  const NIT_REGEX = /^[0-9]{8,10}(-[0-9])?$/;
  const COMPANY_NAME_REGEX = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñüÜ\s\.,&'-]{3,100}$/;

  async function handleRegisterClientSubmit(e) {
    e.preventDefault();
    const email = (document.getElementById('rc-email')?.value || '').trim();
    const password = document.getElementById('rc-pass')?.value || '';
    const firstName = (document.getElementById('rc-fn')?.value || '').trim();
    const lastName = (document.getElementById('rc-ln')?.value || '').trim();
    const documentType = document.getElementById('rc-doctype')?.value || 'CC';
    const documentNumber = (document.getElementById('rc-docnum')?.value || '').trim();
    const phone = (document.getElementById('rc-phone')?.value || '').trim();
    const address = (document.getElementById('rc-addr')?.value || '').trim();
    const city = (document.getElementById('rc-city')?.value || '').trim();

    if (!NAME_REGEX.test(firstName)) {
      toast('El nombre solo debe contener letras y espacios (entre 2 y 50 caracteres, sin comas ni símbolos).', 'warning');
      document.getElementById('rc-fn')?.focus();
      return;
    }

    if (!NAME_REGEX.test(lastName)) {
      toast('El apellido solo debe contener letras y espacios (entre 2 y 50 caracteres, sin comas ni símbolos).', 'warning');
      document.getElementById('rc-ln')?.focus();
      return;
    }

    if (!EMAIL_FORMAT_REGEX.test(email)) {
      toast('Ingresa un correo electrónico válido (ejemplo: usuario@correo.com).', 'warning');
      document.getElementById('rc-email')?.focus();
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      toast('Contraseña débil: Debe contener mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (@$!%*?&#^()_+-=).', 'warning');
      document.getElementById('rc-pass')?.focus();
      return;
    }

    if (documentType === 'CC') {
      if (!/^[0-9]{6,11}$/.test(documentNumber)) {
        toast('Para Cédula (CC), el documento debe contener entre 6 y 11 dígitos numéricos sin letras.', 'warning');
        document.getElementById('rc-docnum')?.focus();
        return;
      }
    } else if (documentType === 'NIT') {
      const cleanNit = documentNumber.replace(/\./g, '').trim();
      if (!NIT_REGEX.test(cleanNit)) {
        toast('Para NIT, ingresa entre 8 y 10 dígitos numéricos (ej: 900123456-1).', 'warning');
        document.getElementById('rc-docnum')?.focus();
        return;
      }
    } else {
      if (!/^[0-9A-Za-z-]{6,15}$/.test(documentNumber)) {
        toast('El número de documento debe contener entre 6 y 15 caracteres alfanuméricos válidos.', 'warning');
        document.getElementById('rc-docnum')?.focus();
        return;
      }
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      toast('El teléfono debe ser un número válido de 7 a 10 dígitos (ej: 3101234567 o 6017654321).', 'warning');
      document.getElementById('rc-phone')?.focus();
      return;
    }
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (/^(\d)\1{5,}$/.test(digitsOnly)) {
      toast('El teléfono ingresado no es válido (no puede tener dígitos idénticos repetidos).', 'warning');
      document.getElementById('rc-phone')?.focus();
      return;
    }

    if (!CITY_REGEX.test(city)) {
      toast('La ciudad solo debe contener letras (mínimo 3 caracteres, ej: Bogotá).', 'warning');
      document.getElementById('rc-city')?.focus();
      return;
    }

    if (!address || address.length < 5 || address.length > 120) {
      toast('La dirección debe tener entre 5 y 120 caracteres.', 'warning');
      document.getElementById('rc-addr')?.focus();
      return;
    }

    const payload = {
      email,
      password,
      firstName,
      lastName,
      documentType,
      documentNumber,
      phone: cleanPhone,
      address,
      city
    };

    try {
      const user = await API.auth.registerClient(payload);
      const me = await API.auth.getMe();
      state.user = user;
      state.profile = me;
      closeModal('modal-auth');
      renderHeaderUser();
      toast('¡Cuenta de cliente creada con éxito y protegida con BCrypt 12!', 'success');
      navigateView('client');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleRegisterProviderSubmit(e) {
    e.preventDefault();
    const email = (document.getElementById('rp-email')?.value || '').trim();
    const password = document.getElementById('rp-pass')?.value || '';
    const companyName = (document.getElementById('rp-company')?.value || '').trim();
    const legalRepresentative = (document.getElementById('rp-rep')?.value || '').trim();
    const nitRut = (document.getElementById('rp-nit')?.value || '').trim();
    const phone = (document.getElementById('rp-phone')?.value || '').trim();
    const address = (document.getElementById('rp-addr')?.value || '').trim();
    const city = (document.getElementById('rp-city')?.value || '').trim();

    if (!COMPANY_NAME_REGEX.test(companyName)) {
      toast('La razón social o nombre de empresa debe tener entre 3 y 100 caracteres válidos.', 'warning');
      document.getElementById('rp-company')?.focus();
      return;
    }

    const cleanNit = nitRut.replace(/\./g, '').trim();
    if (!NIT_REGEX.test(cleanNit)) {
      toast('Ingresa un NIT/RUT válido de 8 a 10 dígitos (ej: 900123456-1).', 'warning');
      document.getElementById('rp-nit')?.focus();
      return;
    }

    if (!NAME_REGEX.test(legalRepresentative)) {
      toast('El nombre del representante legal solo debe contener letras y espacios (entre 2 y 50 caracteres).', 'warning');
      document.getElementById('rp-rep')?.focus();
      return;
    }

    if (!EMAIL_FORMAT_REGEX.test(email)) {
      toast('Ingresa un correo corporativo válido (ejemplo: contacto@empresa.com).', 'warning');
      document.getElementById('rp-email')?.focus();
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      toast('Contraseña débil: Debe contener mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (@$!%*?&#^()_+-=).', 'warning');
      document.getElementById('rp-pass')?.focus();
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      toast('El teléfono de contacto debe ser un número válido de 7 a 10 dígitos (ej: 3101234567).', 'warning');
      document.getElementById('rp-phone')?.focus();
      return;
    }
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (/^(\d)\1{5,}$/.test(digitsOnly)) {
      toast('El teléfono ingresado no es válido (no puede tener dígitos idénticos repetidos).', 'warning');
      document.getElementById('rp-phone')?.focus();
      return;
    }

    if (!CITY_REGEX.test(city)) {
      toast('La ciudad base solo debe contener letras (mínimo 3 caracteres, ej: Bogotá).', 'warning');
      document.getElementById('rp-city')?.focus();
      return;
    }

    if (!address || address.length < 5 || address.length > 120) {
      toast('La dirección de sede o patio debe tener entre 5 y 120 caracteres.', 'warning');
      document.getElementById('rp-addr')?.focus();
      return;
    }

    const payload = {
      email,
      password,
      companyName,
      legalRepresentative,
      nitRut: cleanNit,
      phone: cleanPhone,
      address,
      city
    };

    try {
      const user = await API.auth.registerProvider(payload);
      const me = await API.auth.getMe();
      state.user = user;
      state.profile = me;
      closeModal('modal-auth');
      renderHeaderUser();
      toast('¡Cuenta de proveedor creada con éxito y protegida con BCrypt 12!', 'success');
      navigateView('provider');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('hidden');
  }

  // =========================================================================
  // SPRINT 4 (HU-08): Gráficas Interactivas con Chart.js
  // =========================================================================

  function renderAdminCharts(dash) {
    if (!window.Chart || !dash) return;

    // 1. Tendencia de Facturación Mensual (Bar Chart)
    const revCanvas = document.getElementById('chart-admin-revenue');
    if (revCanvas && dash.monthlyRevenue && dash.monthlyRevenue.length > 0) {
      if (state.charts.adminRevenue) {
        state.charts.adminRevenue.destroy();
        state.charts.adminRevenue = null;
      }

      const labels = dash.monthlyRevenue.map(m => m.period);
      const data = dash.monthlyRevenue.map(m => Number(m.revenue));

      const ctx = revCanvas.getContext('2d');
      state.charts.adminRevenue = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Facturación Mensual (COP)',
            data: data,
            backgroundColor: 'rgba(245, 158, 11, 0.75)',
            borderColor: '#d97706',
            borderWidth: 2,
            borderRadius: 8,
            maxBarThickness: 45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ' ' + formatCOP(ctx.raw)
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) => '$ ' + (val / 1000).toLocaleString() + 'k'
              },
              grid: { color: 'rgba(226, 232, 240, 0.6)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 2. Distribución y Demanda de Maquinaria (Doughnut Chart)
    const toolsCanvas = document.getElementById('chart-admin-tools');
    if (toolsCanvas && dash.topRentedTools && dash.topRentedTools.length > 0) {
      if (state.charts.adminTools) {
        state.charts.adminTools.destroy();
        state.charts.adminTools = null;
      }

      const labels = dash.topRentedTools.map(t => t.toolName);
      const data = dash.topRentedTools.map(t => t.rentalCount);
      const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];

      const ctx = toolsCanvas.getContext('2d');
      state.charts.adminTools = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors.slice(0, data.length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 12, font: { size: 11 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.raw} alquiler(es)`
              }
            }
          },
          cutout: '65%'
        }
      });
    }
  }

  function renderProviderCharts(metrics, tools, reservations) {
    if (!window.Chart || !metrics) return;

    // 1. Estado de Flota (Doughnut)
    const statusCanvas = document.getElementById('chart-prov-status');
    if (statusCanvas) {
      if (state.charts.provStatus) {
        state.charts.provStatus.destroy();
        state.charts.provStatus = null;
      }

      const total = Number(metrics.totalTools) || 0;
      const rented = Number(metrics.rentedTools) || 0;
      const maint = Number(metrics.maintenanceTools) || 0;
      const avail = Math.max(0, total - rented - maint);

      const ctx = statusCanvas.getContext('2d');
      state.charts.provStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Disponibles', 'Alquiladas', 'En Mantenimiento'],
          datasets: [{
            data: [avail, rented, maint],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 10 } }
            }
          },
          cutout: '65%'
        }
      });
    }

    // 2. Demanda por Equipo (Bar Chart)
    const demandCanvas = document.getElementById('chart-prov-demand');
    if (demandCanvas && reservations) {
      if (state.charts.provDemand) {
        state.charts.provDemand.destroy();
        state.charts.provDemand = null;
      }

      const counts = {};
      reservations.forEach(r => {
        counts[r.toolName] = (counts[r.toolName] || 0) + 1;
      });

      const labels = Object.keys(counts).slice(0, 6);
      const data = labels.map(l => counts[l]);

      const ctx = demandCanvas.getContext('2d');
      state.charts.provDemand = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['Sin alquileres'],
          datasets: [{
            label: 'Alquileres',
            data: data.length ? data : [0],
            backgroundColor: 'rgba(59, 130, 246, 0.75)',
            borderColor: '#2563eb',
            borderWidth: 2,
            borderRadius: 6,
            maxBarThickness: 35
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, precision: 0 },
              grid: { color: 'rgba(226, 232, 240, 0.6)' }
            },
            x: {
              grid: { display: false },
              ticks: {
                callback: function(val, index) {
                  const label = this.getLabelForValue(val);
                  return label.length > 12 ? label.substring(0, 10) + '...' : label;
                }
              }
            }
          }
        }
      });
    }
  }

  // =========================================================================
  // SPRINT 4 (HU-11): Gestión Reactiva de Notificaciones In-App
  // =========================================================================

  async function loadNotifications() {
    if (!state.user) return;
    const userId = state.profile?.userId || state.profile?.id || state.user?.userId || state.user?.id;
    if (!userId) return;

    try {
      const notifs = await API.notifications.list(userId, 25);
      state.notifications = notifs || [];

      const unreadCount = state.notifications.filter(n => !n.read).length;
      const badge = document.getElementById('notif-badge');
      const countText = document.getElementById('notif-count-text');

      if (badge) {
        if (unreadCount > 0) {
          badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }

      if (countText) {
        countText.textContent = `${unreadCount} nuevas`;
      }

      renderNotificationsList();
    } catch (err) {
      console.warn('Error al cargar notificaciones:', err);
    }
  }

  function renderNotificationsList() {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    if (!state.notifications || state.notifications.length === 0) {
      list.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <span class="text-xs font-bold text-slate-400 block mb-1">AVISO</span>
          <p class="font-bold text-xs">Sin notificaciones</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Te avisaremos sobre aprobaciones, pagos y devoluciones.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = state.notifications.map(n => {
      const icon = n.type === 'RESERVATION_APPROVED' ? 'OK' :
                   n.type === 'PAYMENT_RECEIVED' ? '$' :
                   n.type === 'RETURN_INSPECTED' ? 'REV' :
                   n.type === 'DAMAGE_REPORTED' ? 'WARN' : 'INFO';
      const readClass = n.read ? 'bg-white opacity-70' : 'bg-amber-50/40 hover:bg-amber-50 font-medium';

      return `
        <div onclick="App.markNotificationRead(${n.id})" class="p-3 ${readClass} hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5">
          <span class="text-lg leading-none mt-0.5">${icon}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <strong class="text-slate-900 font-bold truncate block text-xs">${escapeHtml(n.title)}</strong>
              ${!n.read ? '<span class="w-2 h-2 rounded-lg bg-amber-500 shrink-0"></span>' : ''}
            </div>
            <p class="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">${escapeHtml(n.message)}</p>
            <span class="text-[9px] text-slate-400 font-mono mt-1 block">${formatDate(n.createdAt)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function toggleNotificationsDropdown() {
    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown) {
      const isHidden = dropdown.classList.contains('hidden');
      dropdown.classList.toggle('hidden');
      if (isHidden) {
        loadNotifications();
      }
    }
  }

  async function markNotificationRead(id) {
    try {
      await API.notifications.markRead(id);
      const target = state.notifications.find(n => n.id === id);
      if (target) target.read = true;
      loadNotifications();
    } catch (err) {
      console.warn('Error al marcar leída:', err);
    }
  }

  async function markAllNotificationsRead() {
    if (!state.user) return;
    const userId = state.profile?.userId || state.profile?.id || state.user?.userId || state.user?.id;
    try {
      await API.notifications.markAllRead(userId);
      state.notifications.forEach(n => n.read = true);
      loadNotifications();
      toast('Todas las notificaciones marcadas como leídas.', 'info');
    } catch (err) {
      console.warn('Error al marcar todas leídas:', err);
    }
  }

  async function simulateNotification() {
    if (!state.user) return;
    const userId = state.profile?.userId || state.profile?.id || state.user?.userId || state.user?.id;
    try {
      await API.notifications.simulate({
        userId: userId,
        title: 'Verificación de Seguridad SST',
        message: 'Protocolo EPP 4FN completado satisfactoriamente para la maquinaria despachada.',
        type: 'RETURN_INSPECTED'
      });
      await loadNotifications();
      toast('Notificación In-App generada por NotificationServicePort.', 'success');
    } catch (err) {
      toast('Error al simular notificación: ' + err.message, 'error');
    }
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

    // Sanitización en tiempo real para evitar caracteres inválidos al escribir o pegar
    const rcFn = document.getElementById('rc-fn');
    const rcLn = document.getElementById('rc-ln');
    const rcDoc = document.getElementById('rc-docnum');
    const rcPhone = document.getElementById('rc-phone');
    const rcDocType = document.getElementById('rc-doctype');
    const rpRep = document.getElementById('rp-rep');
    const rpPhone = document.getElementById('rp-phone');
    const rpNit = document.getElementById('rp-nit');

    [rcFn, rcLn, rpRep].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          inp.value = inp.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s'-]/g, '');
        });
      }
    });

    [rcPhone, rpPhone].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          inp.value = inp.value.replace(/[^0-9+\s]/g, '').slice(0, 14);
        });
      }
    });

    if (rpNit) {
      rpNit.addEventListener('input', () => {
        rpNit.value = rpNit.value.replace(/[^0-9-]/g, '').slice(0, 15);
      });
    }

    if (rcDoc) {
      rcDoc.addEventListener('input', () => {
        const type = rcDocType ? rcDocType.value : 'CC';
        if (type === 'CC') {
          rcDoc.value = rcDoc.value.replace(/[^0-9]/g, '').slice(0, 11);
        } else {
          rcDoc.value = rcDoc.value.replace(/[^0-9A-Za-z-]/g, '').slice(0, 15);
        }
      });
    }

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

    // SPRINT 4 (HU-11): Cerrar dropdown de notificaciones al hacer clic fuera
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('notifications-dropdown');
      const btn = document.getElementById('btn-notifications');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      }
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
    filterByFamily,
    onHeroCategorySelect,
    renderHomeFeatured,
    onActiveRentalsHeaderClick,
    onPriceRangeRadio,
    onCategoryChange,
    onSearchInput,
    selectDateFromCalendar,
    onDeliveryDateChange,
    onReturnDateChange,
    exportProviderReservationsCSV,
    exportAdminReservationsCSV,
    openSettlementModal,
    openReviewModal,
    setReviewRating,
    submitReview,
    checkSystemHealth,
    // Sprint 1: Paneles Proveedor y Admin (HU-01, HU-02, HU-03)
    loadAdminUsers,
    toggleUserStatusAction,
    loadAdminProviders,
    verifyProviderAction,
    openCreateToolModal,
    openEditToolModal,
    submitToolForm,
    retireToolAction,
    // Sprint 2: Daños y Analítica Real (HU-04, HU-05)
    onReturnConditionChange,
    // Sprint 4: Funciones "Plus" (HU-08 a HU-11)
    toggleNotificationsDropdown,
    markNotificationRead,
    markAllNotificationsRead,
    simulateNotification,
    // Pasarela de Pago Interactiva y Seguridad de Contraseñas
    switchPaymentTab,
    onCardNumberFormat,
    onCardInputChange,
    onCardExpFormat,
    onCardCvvFormat,
    processPaymentSubmit,
    checkPasswordStrength
  };
})();

// Exponer en window para eventos inline HTML (onclick, etc.)
window.App = App;
export default App;

// Iniciar al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}

