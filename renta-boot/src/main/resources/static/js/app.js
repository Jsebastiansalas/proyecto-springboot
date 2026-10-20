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
    currentView: 'home', // 'home' | 'catalog' | 'client' | 'provider' | 'admin'
    filters: {
      query: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      onlyAvailable: false,
      sortBy: 'featured'
    },
    filterOnlyFavorites: false,
    favorites: JSON.parse(localStorage.getItem('rentamaq_favs') || '[]'),
    theme: localStorage.getItem('rentamaq_theme') || 'light',
    compareList: [],
    notifications: [],
    quoteCart: JSON.parse(localStorage.getItem('rentamaq_quote_cart') || '[]'),
    catalogViewMode: localStorage.getItem('rentamaq_view_mode') || 'grid',
    deliveryLocation: localStorage.getItem('rentamaq_location') || 'Bogotá, Suba',
    selectedBrands: [],
    retieOnly: false,
    selectedTool: null,
    selectedToolOccupied: [],
    selectedToolComments: [],
    hasDateConflict: false,
    calculatedPrice: null,
    activeReservationForPayment: null,
    activeReservationForDelivery: null,
    activeReservationForReturn: null,
    clientReservations: [],
    clientFilterStatus: 'all',
    clientSearchQuery: '',
    providerReservations: [],
    providerFilterStatus: 'all',
    adminReservations: [],
    adminCharts: { revenue: null, fleet: null },
    providerCharts: { revenue: null, status: null }
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
    const icon = type === 'success' ? '•' : type === 'error' ? '!' : 'i';
    t.innerHTML = `<span class="font-bold text-lg">${icon}</span><span class="flex-1 whitespace-pre-line">${message}</span>`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s ease';
      setTimeout(() => t.remove(), 300);
    }, 4500);
  }

  // Tema Claro / Oscuro
  function loadTheme() {
    const isDark = state.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    const darkIcon = document.getElementById('theme-icon-dark');
    const lightIcon = document.getElementById('theme-icon-light');
    if (darkIcon && lightIcon) {
      darkIcon.classList.toggle('hidden', !isDark);
      lightIcon.classList.toggle('hidden', isDark);
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('rentamaq_theme', state.theme);
    loadTheme();
  }

  // Favoritos
  function updateFavoritesCounter() {
    const badge = document.getElementById('favs-counter-badge');
    if (badge) badge.textContent = state.favorites.length;
  }

  function toggleFavorite(toolId, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const id = Number(toolId);
    const idx = state.favorites.indexOf(id);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      toast('Equipo removido de tus Favoritos', 'info');
    } else {
      state.favorites.push(id);
      toast('Equipo añadido a tus Favoritos', 'success');
    }
    localStorage.setItem('rentamaq_favs', JSON.stringify(state.favorites));
    updateFavoritesCounter();
    renderToolsGrid(state.tools || []);
  }

  function toggleFavoritesFilter() {
    state.filterOnlyFavorites = !state.filterOnlyFavorites;
    const btn = document.getElementById('chip-cat-favs');
    if (btn) {
      if (state.filterOnlyFavorites) {
        btn.classList.add('bg-rose-500', 'text-white', 'border-rose-600');
        btn.classList.remove('text-rose-600', 'border-rose-300');
      } else {
        btn.classList.remove('bg-rose-500', 'text-white', 'border-rose-600');
        btn.classList.add('text-rose-600', 'border-rose-300');
      }
    }
    renderToolsGrid(state.tools || []);
  }

  // Notificaciones In-App
  async function loadNotifications() {
    try {
      const notifs = await API.notifications.getNotifications();
      state.notifications = notifs || [];
      renderNotifications();
    } catch (e) {
      console.warn('Error cargando notificaciones:', e);
    }
  }

  function renderNotifications() {
    const badge = document.getElementById('notif-badge');
    const list = document.getElementById('notif-items-list');
    const unread = state.notifications.filter(n => !n.read);
    if (badge) {
      badge.classList.toggle('hidden', unread.length === 0);
    }
    if (list) {
      if (state.notifications.length === 0) {
        list.innerHTML = '<div class="text-slate-400 text-center py-4">No hay notificaciones pendientes.</div>';
      } else {
        list.innerHTML = state.notifications.map(n => `
          <div class="p-2.5 rounded-xl border ${n.read ? 'bg-slate-50 border-[#D6D3C9] text-slate-500' : 'bg-[#FFF5F0]/80 border-[#D6D3C9] text-slate-900'} text-xs space-y-1 cursor-pointer transition-colors" onclick="App.markNotificationRead(${n.id})">
            <div class="flex justify-between items-center font-bold">
              <span>${n.title || 'Aviso de Obra'}</span>
              <span class="text-[10px] text-slate-400 font-mono">${formatDate(n.createdAt)}</span>
            </div>
            <p class="text-[11px] leading-relaxed">${n.message}</p>
          </div>
        `).join('');
      }
    }
  }

  function toggleNotificationsPanel() {
    const popover = document.getElementById('notif-popover');
    if (!popover) {
      toast('No tienes notificaciones pendientes', 'info');
      return;
    }
    const isOpen = popover.classList.contains('notif-popover-open');
    if (!isOpen) {
      loadNotifications();
      popover.classList.add('notif-popover-open');
    } else {
      popover.classList.remove('notif-popover-open');
    }
  }

  async function markAllNotificationsRead() {
    try {
      await API.notifications.markAllAsRead();
      state.notifications.forEach(n => n.read = true);
      renderNotifications();
      toast('Todas las notificaciones marcadas como leídas', 'info');
    } catch (err) {
      toast('Error al marcar notificaciones: ' + err.message, 'error');
    }
  }

  async function markNotificationRead(id) {
    try {
      await API.notifications.markAsRead(id);
      const n = state.notifications.find(x => x.id === id);
      if (n) n.read = true;
      renderNotifications();
    } catch (err) {
      console.warn('Error marcando notificación:', err);
    }
  }

  // ==================== CARRITO DE COTIZACIÓN ACTIVA (QUOTE CART) ====================
  function updateQuoteCartBadge() {
    const badge = document.getElementById('quote-cart-badge');
    if (!badge) return;
    const count = state.quoteCart.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  function toggleQuoteDrawer(open) {
    const drawer = document.getElementById('quote-drawer');
    const backdrop = document.getElementById('quote-drawer-backdrop');
    if (!drawer || !backdrop) return;
    const shouldOpen = open !== undefined ? open : !drawer.classList.contains('active');
    drawer.classList.toggle('active', shouldOpen);
    backdrop.classList.toggle('active', shouldOpen);
    if (shouldOpen) {
      renderQuoteCart();
    }
  }

  function addToQuoteCart(toolId, days = 7) {
    const id = Number(toolId);
    const tool = state.tools.find(t => t.id === id) || state.selectedTool;
    if (!tool) {
      toast('No se encontró información del equipo', 'error');
      return;
    }

    const existing = state.quoteCart.find(item => item.toolId === id);
    if (existing) {
      existing.days = Math.min(60, (existing.days || 7) + 1);
      toast(`Se actualizó a ${existing.days} días para "${tool.name}"`, 'info');
    } else {
      state.quoteCart.push({
        toolId: id,
        name: tool.name,
        brand: tool.brand || 'Industrial',
        model: tool.model || 'Pro',
        sku: tool.codeSku || `HERR-00${id}`,
        dailyPrice: Number(tool.baseDailyPrice) || 50000,
        deposit: Number(tool.depositAmount) || 100000,
        days: Number(days) || 7,
        image: tool.mainImageUrl || 'images/tools/HERR-0001.jpg'
      });
      toast(`"${tool.name}" añadido a tu cotización activa`, 'success');
    }

    localStorage.setItem('rentamaq_quote_cart', JSON.stringify(state.quoteCart));
    updateQuoteCartBadge();
    toggleQuoteDrawer(true);
  }

  function addComboToQuoteCart(id1, id2) {
    addToQuoteCart(id1, 7);
    addToQuoteCart(id2, 7);
    toast('Combo de obra añadido a tu cotización activa', 'success');
  }

  function removeFromQuoteCart(toolId) {
    const id = Number(toolId);
    state.quoteCart = state.quoteCart.filter(item => item.toolId !== id);
    localStorage.setItem('rentamaq_quote_cart', JSON.stringify(state.quoteCart));
    updateQuoteCartBadge();
    renderQuoteCart();
    toast('Equipo removido de la cotización', 'info');
  }

  function updateQuoteCartDays(toolId, days) {
    const id = Number(toolId);
    const item = state.quoteCart.find(i => i.toolId === id);
    if (item) {
      item.days = Math.max(1, Math.min(90, parseInt(days, 10) || 1));
      localStorage.setItem('rentamaq_quote_cart', JSON.stringify(state.quoteCart));
      renderQuoteCart();
    }
  }

  function renderQuoteCart() {
    const container = document.getElementById('quote-drawer-items');
    const subtotalEl = document.getElementById('quote-drawer-subtotal');
    const discountEl = document.getElementById('quote-drawer-discount');
    const ivaEl = document.getElementById('quote-drawer-iva');
    const depositsEl = document.getElementById('quote-drawer-deposits');
    const totalEl = document.getElementById('quote-drawer-total');

    if (!container) return;

    if (state.quoteCart.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center text-slate-400 space-y-3">
          <span class="text-4xl block font-sans text-[#D94E1F] font-black">#</span>
          <p class="font-extrabold text-slate-800 text-sm">Tu cotización de obra está vacía</p>
          <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Explora el catálogo y añade los equipos requeridos para tu frente de obra con un 15% de ahorro semanal.
          </p>
          <button type="button" onclick="App.toggleQuoteDrawer(false); App.navigateView('catalog');" class="px-5 py-2.5 bg-[#181816] hover:bg-[#D94E1F] text-white shadow-md shadow-sm rounded-xl text-xs font-black shadow-sm transition-all">
            Explorar Catálogo &rarr;
          </button>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '$ 0 COP';
      if (discountEl) discountEl.textContent = '$ 0 COP';
      if (ivaEl) ivaEl.textContent = '$ 0 COP';
      if (depositsEl) depositsEl.textContent = '$ 0 COP';
      if (totalEl) totalEl.textContent = '$ 0 COP';
      return;
    }

    let subtotal = 0;
    let discount = 0;
    let deposits = 0;

    container.innerHTML = state.quoteCart.map(item => {
      const lineSubtotal = item.dailyPrice * item.days;
      const hasDiscount = item.days >= 7;
      const lineDiscount = hasDiscount ? Math.round(lineSubtotal * 0.15) : 0;
      const lineNet = lineSubtotal - lineDiscount;

      subtotal += lineSubtotal;
      discount += lineDiscount;
      deposits += item.deposit;

      return `
        <div class="p-3 bg-white rounded-2xl border border-[#D6D3C9] shadow-sm space-y-2.5">
          <div class="flex items-start gap-3">
            <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-[#D6D3C9] shrink-0" onerror="this.src='images/tools/HERR-0001.jpg'">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-[#D94E1F] uppercase tracking-wider">${item.brand} • ${item.sku}</span>
                <button type="button" onclick="App.removeFromQuoteCart(${item.toolId})" class="text-slate-400 hover:text-rose-600 text-xs transition-colors" title="Quitar equipo">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <h4 class="font-extrabold text-xs text-slate-900 line-clamp-1 leading-snug">${item.name}</h4>
              <div class="text-[11px] font-mono text-slate-700 font-bold mt-0.5">${formatCOP(item.dailyPrice)} / día</div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-[#D6D3C9] text-xs">
            <!-- Stepper de Días -->
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Faena:</span>
              <div class="flex items-center border border-[#D6D3C9] rounded-lg overflow-hidden bg-slate-50">
                <button type="button" onclick="App.updateQuoteCartDays(${item.toolId}, ${item.days - 1})" class="px-2 py-0.5 hover:bg-slate-200 text-slate-700 font-bold text-xs">-</button>
                <input type="number" min="1" max="90" value="${item.days}" onchange="App.updateQuoteCartDays(${item.toolId}, this.value)" class="w-10 text-center text-xs font-mono font-bold bg-transparent focus:outline-none">
                <button type="button" onclick="App.updateQuoteCartDays(${item.toolId}, ${item.days + 1})" class="px-2 py-0.5 hover:bg-slate-200 text-slate-700 font-bold text-xs">+</button>
              </div>
              <span class="text-[10px] text-slate-500 font-medium">días</span>
            </div>

            <!-- Total Línea -->
            <div class="text-right">
              <span class="font-mono font-bold text-slate-900 text-xs">${formatCOP(lineNet)}</span>
              ${hasDiscount ? '<span class="block text-[9px] font-bold text-emerald-600">-15% Semanal</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const subtotalAfterDiscount = subtotal - discount;
    const iva = Math.round(subtotalAfterDiscount * 0.19);
    const grandTotal = subtotalAfterDiscount + iva + deposits;

    if (subtotalEl) subtotalEl.textContent = formatCOP(subtotal);
    if (discountEl) discountEl.textContent = discount > 0 ? `- ${formatCOP(discount)}` : '$ 0 COP';
    if (ivaEl) ivaEl.textContent = formatCOP(iva);
    if (depositsEl) depositsEl.textContent = formatCOP(deposits);
    if (totalEl) totalEl.textContent = formatCOP(grandTotal);
  }

  function checkoutQuoteDrawer() {
    if (state.quoteCart.length === 0) {
      toast('Añade al menos un equipo a la cotización', 'warning');
      return;
    }
    toggleQuoteDrawer(false);

    if (!state.user) {
      toast('Inicia sesión o regístrate como contratista para formalizar tu reserva.', 'info');
      openAuthModal('login');
      return;
    }

    const firstItem = state.quoteCart[0];
    toast('Generando consolidado de reserva para tu cuadrilla...', 'info');
    openToolDetail(firstItem.toolId);
  }

  // ==================== SELECTOR DE PATIO Y UBICACIÓN ====================
  function openLocationModal() {
    const modal = document.getElementById('modal-location');
    if (modal) modal.classList.remove('hidden');
  }

  function setDeliveryLocation(locName) {
    state.deliveryLocation = locName;
    localStorage.setItem('rentamaq_location', locName);
    const badge = document.getElementById('current-delivery-location');
    if (badge) badge.textContent = locName;
    closeModal('modal-location');
    toast(`Patio de despacho actualizado: ${locName}`, 'success');
  }

  // ==================== BÚSQUEDA OMNICANAL ESTILO AMAZON ====================
  function onOmniCategoryChange(catId) {
    state.filters.categoryId = catId ? String(catId) : '';
    const catSelect = document.getElementById('filter-category');
    if (catSelect) catSelect.value = state.filters.categoryId;
    document.querySelectorAll('.category-chip').forEach(btn => btn.classList.remove('category-chip-active'));
    const activeChip = document.getElementById(catId ? `chip-cat-${catId}` : 'chip-cat-all');
    if (activeChip) activeChip.classList.add('category-chip-active');
    navigateView('catalog');
    loadTools();
  }

  function onOmniSearchKeyup(e) {
    if (e.key === 'Enter') {
      performOmniSearch();
    }
  }

  function performOmniSearch() {
    const input = document.getElementById('header-search-input');
    const catSelect = document.getElementById('header-search-category');
    const query = input ? input.value.trim() : '';
    const catId = catSelect ? catSelect.value : '';

    state.filters.query = query;
    state.filters.categoryId = catId;

    const catFilterInput = document.getElementById('filter-search');
    if (catFilterInput) catFilterInput.value = query;

    const catalogCatSelect = document.getElementById('filter-category');
    if (catalogCatSelect) catalogCatSelect.value = catId;

    navigateView('catalog');
    loadTools();
  }

  // ==================== FILTROS FACETADOS Y VISTA CUADRÍCULA / LISTA ====================
  function renderFacetedFilters() {
    const catList = document.getElementById('faceted-category-list');
    const brandList = document.getElementById('faceted-brand-list');

    if (catList && state.categories.length > 0) {
      catList.innerHTML = state.categories.map(c => {
        const count = state.tools.filter(t => String(t.categoryId) === String(c.id)).length;
        const isChecked = state.filters.categoryId === String(c.id);
        return `
          <label class="faceted-item">
            <span class="flex items-center gap-2">
              <input type="checkbox" value="${c.id}" ${isChecked ? 'checked' : ''} onchange="App.onFacetedCategoryChange('${c.id}', this.checked)">
              <span>${c.name}</span>
            </span>
            <span class="faceted-count font-mono">(${count})</span>
          </label>
        `;
      }).join('');
    }

    if (brandList && state.tools.length > 0) {
      const brandCounts = {};
      state.tools.forEach(t => {
        if (t.brand) {
          brandCounts[t.brand] = (brandCounts[t.brand] || 0) + 1;
        }
      });
      const brands = Object.keys(brandCounts).sort();
      brandList.innerHTML = brands.map(b => {
        const isChecked = state.selectedBrands.includes(b);
        return `
          <label class="faceted-item">
            <span class="flex items-center gap-2">
              <input type="checkbox" value="${b}" ${isChecked ? 'checked' : ''} onchange="App.onFacetedBrandChange('${b}', this.checked)">
              <span>${b}</span>
            </span>
            <span class="faceted-count font-mono">(${brandCounts[b]})</span>
          </label>
        `;
      }).join('');
    }
  }

  function onFacetedCategoryChange(catId, isChecked) {
    state.filters.categoryId = isChecked ? String(catId) : '';
    const catSelect = document.getElementById('filter-category');
    if (catSelect) catSelect.value = state.filters.categoryId;
    const headerCat = document.getElementById('header-search-category');
    if (headerCat) headerCat.value = state.filters.categoryId;

    document.querySelectorAll('.category-chip').forEach(btn => btn.classList.remove('category-chip-active'));
    const activeChip = document.getElementById(state.filters.categoryId ? `chip-cat-${state.filters.categoryId}` : 'chip-cat-all');
    if (activeChip) activeChip.classList.add('category-chip-active');

    renderFacetedFilters();
    loadTools();
  }

  function onFacetedBrandChange(brand, isChecked) {
    if (isChecked) {
      if (!state.selectedBrands.includes(brand)) state.selectedBrands.push(brand);
    } else {
      state.selectedBrands = state.selectedBrands.filter(b => b !== brand);
    }
    renderActiveCatalogView();
  }

  function onRetieFilterChange() {
    const cb = document.getElementById('filter-retie');
    state.retieOnly = cb ? cb.checked : false;
    renderActiveCatalogView();
  }

  function applyPriceFilter() {
    const min = document.getElementById('filter-min-price')?.value;
    const max = document.getElementById('filter-max-price')?.value;
    state.filters.minPrice = min ? min.trim() : '';
    state.filters.maxPrice = max ? max.trim() : '';
    loadTools();
  }

  function getFilteredTools(tools) {
    let list = tools ? [...tools] : (state.tools ? [...state.tools] : []);

    if (state.filters.onlyAvailable) {
      list = list.filter(t => t.status === 'DISPONIBLE');
    }
    if (state.filterOnlyFavorites) {
      list = list.filter(t => state.favorites.includes(Number(t.id)));
    }
    if (state.selectedBrands && state.selectedBrands.length > 0) {
      list = list.filter(t => state.selectedBrands.includes(t.brand));
    }
    if (state.retieOnly) {
      list = list.filter(t => {
        const text = `${t.name} ${t.description} ${t.model}`.toLowerCase();
        return text.includes('retie') || text.includes('eléctric') || text.includes('220v') || text.includes('110v') || text.includes('kva') || t.categoryId === 4;
      });
    }

    if (state.filters.sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.baseDailyPrice) - Number(b.baseDailyPrice));
    } else if (state.filters.sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.baseDailyPrice) - Number(a.baseDailyPrice));
    } else if (state.filters.sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    } else if (state.filters.sortBy === 'brand_asc') {
      list.sort((a, b) => a.brand.localeCompare(b.brand, 'es'));
    }

    return list;
  }

  function toggleCatalogViewMode(mode) {
    state.catalogViewMode = mode;
    localStorage.setItem('rentamaq_view_mode', mode);

    const btnGrid = document.getElementById('btn-view-grid');
    const btnList = document.getElementById('btn-view-list');
    const gridEl = document.getElementById('tools-grid');
    const listEl = document.getElementById('tools-list-view');

    if (btnGrid && btnList) {
      btnGrid.className = mode === 'grid' ? 'view-mode-btn view-mode-btn-active' : 'view-mode-btn';
      btnList.className = mode === 'list' ? 'view-mode-btn view-mode-btn-active' : 'view-mode-btn';
    }

    if (gridEl && listEl) {
      gridEl.classList.toggle('hidden', mode !== 'grid');
      listEl.classList.toggle('hidden', mode !== 'list');
    }

    renderActiveCatalogView();
  }

  function renderActiveCatalogView() {
    if (state.catalogViewMode === 'list') {
      renderToolsList(state.tools || []);
    } else {
      renderToolsGrid(state.tools || []);
    }
  }

  // Inicialización
  async function init() {
    loadTheme();
    updateFavoritesCounter();
    updateQuoteCartBadge();
    const locBadge = document.getElementById('current-delivery-location');
    if (locBadge) locBadge.textContent = state.deliveryLocation;
    setupEventListeners();
    await checkSession();
    await loadCategories();
    await loadTools();
    loadNotifications();
    onHomeCalcChange();
    toggleCatalogViewMode(state.catalogViewMode || 'grid');
    navigateView('home');
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
    if (portalNav) portalNav.classList.remove('hidden');

    const clientBtn = document.getElementById('btn-nav-client');
    const provBtn = document.getElementById('btn-nav-provider');
    const adminBtn = document.getElementById('btn-nav-admin');

    if (state.user && state.profile) {
      if (guestContainer) guestContainer.classList.add('hidden');
      if (userContainer) userContainer.classList.remove('hidden');

      const name = state.profile.displayName || state.user.email;
      const nameEl = document.getElementById('user-name-display');
      if (nameEl) nameEl.textContent = name;
      const initialsEl = document.getElementById('user-avatar-initials');
      if (initialsEl) {
        const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'U';
        initialsEl.textContent = initials;
      }
      const roleBadge = document.getElementById('user-role-badge');
      const role = state.profile.role;
      if (roleBadge) {
        roleBadge.textContent = role.replace('ROLE_', '');
        roleBadge.className = 'text-[9px] font-bold px-1.5 py-0.5 rounded-lg ' +
          (role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' :
           role === 'ROLE_PROVEEDOR' ? 'bg-[#FFE8DE] text-blue-800' : 'bg-emerald-100 text-emerald-800');
      }

      // Mostrar pestañas correspondientes
      if (clientBtn) clientBtn.classList.remove('hidden');
      if (provBtn) provBtn.classList.toggle('hidden', role !== 'ROLE_PROVEEDOR' && role !== 'ROLE_ADMIN');
      if (adminBtn) adminBtn.classList.toggle('hidden', role !== 'ROLE_ADMIN');
    } else {
      if (guestContainer) guestContainer.classList.remove('hidden');
      if (userContainer) userContainer.classList.add('hidden');
      if (clientBtn) clientBtn.classList.remove('hidden');
      if (provBtn) provBtn.classList.add('hidden');
      if (adminBtn) adminBtn.classList.add('hidden');
    }
  }

  // Ayudante de iconos por categoría
  function getCategoryEmoji(name = "") {
    return "";
  }

  // Renderizado dinámico de chips de categorías con pills estilizados
  function renderCategoryChips() {
    const chips = document.getElementById('category-chips-container');
    if (!chips || !state.categories || state.categories.length === 0) return;

    const totalCount = state.tools ? state.tools.length : 18;
    const isAllActive = !state.filters.categoryId;

    let html = `
      <button type="button" onclick="App.filterByCategoryChip('')" id="chip-cat-all" class="category-chip ${isAllActive ? 'category-chip-active' : ''}">
        
        <span>Todas</span>
        <span class="category-chip-badge font-mono">${totalCount}</span>
      </button>
    `;

    state.categories.forEach(c => {
      const icon = getCategoryEmoji(c.name);
      const isActive = String(state.filters.categoryId) === String(c.id);
      const count = state.tools ? state.tools.filter(t => String(t.categoryId) === String(c.id)).length : 0;
      html += `
        <button type="button" onclick="App.filterByCategoryChip('${c.id}')" id="chip-cat-${c.id}" class="category-chip ${isActive ? 'category-chip-active' : ''}">
          <span class="category-chip-icon">${icon}</span>
          <span>${c.name}</span>
          ${count > 0 ? `<span class="category-chip-badge font-mono">${count}</span>` : ''}
        </button>
      `;
    });

    chips.innerHTML = html;
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

      // Renderizado de chips rápidos con diseño profesional
      renderCategoryChips();
      renderFacetedFilters();
    } catch (err) {
      console.warn('Error cargando categorías:', err);
    }
  }

  // Carga de herramientas en el catálogo
  async function loadTools() {
    const grid = document.getElementById('tools-grid');
    const listEl = document.getElementById('tools-list-view');
    const spinner = '<div class="col-span-full py-16 text-center text-slate-400"><div class="inline-block animate-spin rounded-lg h-8 w-8 border-b-2 border-[#D94E1F] mb-3"></div><p class="font-medium text-xs">Cargando catálogo de maquinaria y equipos...</p></div>';
    if (grid) grid.innerHTML = spinner;
    if (listEl) listEl.innerHTML = spinner;

    try {
      const tools = await API.tools.getTools(state.filters);
      state.tools = tools;
      renderCategoryChips();
      renderFacetedFilters();
      renderActiveCatalogView();
    } catch (err) {
      if (grid) grid.innerHTML = `<div class="col-span-full py-12 text-center text-rose-500 text-xs">Error al cargar herramientas: ${err.message}</div>`;
      if (listEl) listEl.innerHTML = `<div class="py-12 text-center text-rose-500 text-xs">Error al cargar herramientas: ${err.message}</div>`;
    }
  }

  function onSortChange(value) {
    state.filters.sortBy = value;
    renderActiveCatalogView();
  }

  function onOnlyAvailableChange() {
    const cb = document.getElementById('filter-only-available');
    state.filters.onlyAvailable = cb ? cb.checked : false;
    renderActiveCatalogView();
  }

  function filterByCategoryQuick(catId, catName) {
    filterByCategoryChip(catId ? String(catId) : '');
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Comparador de Maquinaria 4FN
  function toggleCompare(toolId, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const id = Number(toolId);
    const existingIdx = state.compareList.findIndex(item => item.id === id);

    if (existingIdx >= 0) {
      state.compareList.splice(existingIdx, 1);
      toast('Equipo retirado del comparador', 'info');
    } else {
      if (state.compareList.length >= 3) {
        toast('Solo puedes comparar un máximo de 3 equipos simultáneamente.', 'warning');
        return;
      }
      const tool = state.tools.find(t => t.id === id);
      if (tool) {
        state.compareList.push({
          id: tool.id,
          name: tool.name,
          image: tool.mainImageUrl,
          price: tool.baseDailyPrice,
          brand: tool.brand
        });
        toast(`"${tool.name}" añadido al comparador (${state.compareList.length}/3)`, 'success');
      }
    }

    updateCompareDock();
    renderToolsGrid(state.tools || []);
  }

  function updateCompareDock() {
    const dock = document.getElementById('compare-dock');
    const label = document.getElementById('compare-dock-count-label');
    const thumbsContainer = document.getElementById('compare-dock-thumbnails');
    if (!dock) return;

    if (state.compareList.length > 0) {
      dock.classList.add('compare-dock-visible');
      if (label) label.textContent = `${state.compareList.length}/3`;
      if (thumbsContainer) {
        thumbsContainer.innerHTML = state.compareList.map(item => `
          <img src="${item.image || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=80&q=80'}" class="w-8 h-8 rounded-lg border-2 border-slate-900 object-cover shadow" title="${item.name}">
        `).join('');
      }
    } else {
      dock.classList.remove('compare-dock-visible');
    }
  }

  function clearCompareList() {
    state.compareList = [];
    updateCompareDock();
    renderToolsGrid(state.tools || []);
    closeModal('modal-comparator');
  }

  async function openComparatorModal() {
    if (state.compareList.length < 2) {
      toast('Selecciona al menos 2 herramientas para realizar la comparación lado a lado.', 'info');
      return;
    }

    const modal = document.getElementById('modal-comparator');
    const container = document.getElementById('comparator-container');
    if (!modal || !container) return;

    modal.classList.remove('hidden');
    container.innerHTML = '<div class="py-16 text-center text-slate-400"><div class="inline-block animate-spin rounded-lg h-8 w-8 border-b-2 border-[#D94E1F] mb-2"></div><p>Cargando especificaciones 4FN cruzadas...</p></div>';

    try {
      // Cargar detalles completos 4FN de cada equipo
      const toolDetails = await Promise.all(
        state.compareList.map(item => API.tools.getToolDetail(item.id))
      );

      // Calcular mejor precio (mínimo baseDailyPrice)
      const minDailyPrice = Math.min(...toolDetails.map(t => Number(t.baseDailyPrice) || Infinity));

      // Cruzar todas las especificaciones técnicas únicas (4FN)
      const specNamesSet = new Set();
      toolDetails.forEach(t => {
        if (t.specifications) {
          t.specifications.forEach(s => specNamesSet.add(s.specName));
        }
      });
      const allSpecNames = Array.from(specNamesSet);

      container.innerHTML = `
        <table class="w-full text-xs text-left border-collapse border border-[#D6D3C9]">
          <thead>
            <tr class="bg-slate-100 text-slate-700">
              <th class="p-4 border border-[#D6D3C9] w-44 font-bold uppercase text-[10px] text-slate-400">Atributo / Parámetro</th>
              ${toolDetails.map(t => `
                <th class="p-4 border border-[#D6D3C9] text-center w-64 bg-white">
                  <div class="relative h-28 rounded-xl overflow-hidden mb-2 bg-slate-50">
                    <img src="${t.mainImageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80'}" class="w-full h-full object-cover">
                    ${Number(t.baseDailyPrice) === minDailyPrice ? `
                      <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-slate-950 uppercase shadow">Mejor Precio</span>
                    ` : ''}
                  </div>
                  <h4 class="font-extrabold text-sm text-slate-900 leading-snug line-clamp-1">${t.name}</h4>
                  <div class="text-[11px] text-amber-600 font-bold uppercase mt-0.5">${t.brand} • ${t.model}</div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <!-- Tarifa Diaria -->
            <tr class="bg-amber-50/40 font-bold">
              <td class="p-3 border border-[#D6D3C9] text-slate-700 uppercase text-[10px]">Tarifa Diaria (Base)</td>
              ${toolDetails.map(t => `
                <td class="p-3 border border-[#D6D3C9] text-center font-mono text-sm text-slate-900 ${Number(t.baseDailyPrice) === minDailyPrice ? 'text-emerald-700 font-black' : ''}">
                  ${formatCOP(t.baseDailyPrice)} / día
                </td>
              `).join('')}
            </tr>

            <!-- Tarifa Semanal (con descuento 15%) -->
            <tr>
              <td class="p-3 border border-[#D6D3C9] text-slate-600 uppercase text-[10px]">Tarifa Semanal (-15%)</td>
              ${toolDetails.map(t => {
                const weekly = Number(t.baseDailyPrice) * 7 * 0.85;
                return `
                  <td class="p-3 border border-[#D6D3C9] text-center font-mono text-emerald-600 font-bold">
                    ${formatCOP(weekly)} (7 días)
                  </td>
                `;
              }).join('')}
            </tr>

            <!-- Depósito en Garantía -->
            <tr>
              <td class="p-3 border border-[#D6D3C9] text-slate-600 uppercase text-[10px]">Depósito Reembolsable</td>
              ${toolDetails.map(t => `
                <td class="p-3 border border-[#D6D3C9] text-center font-mono text-slate-600">
                  ${formatCOP(t.depositAmount)}
                </td>
              `).join('')}
            </tr>

            <!-- Calificación Promedio -->
            <tr>
              <td class="p-3 border border-[#D6D3C9] text-slate-600 uppercase text-[10px]">Calificación Contratistas</td>
              ${toolDetails.map(t => `
                <td class="p-3 border border-[#D6D3C9] text-center font-bold text-amber-600">
                  <svg class="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline mr-0.5" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>${(t.averageRating || 5.0).toFixed(1)} <span class="text-slate-400 font-normal">(${t.totalReviews || 0} reseñas)</span>
                </td>
              `).join('')}
            </tr>

            <!-- Categoría y SKU -->
            <tr>
              <td class="p-3 border border-[#D6D3C9] text-slate-600 uppercase text-[10px]">Categoría & SKU</td>
              ${toolDetails.map(t => `
                <td class="p-3 border border-[#D6D3C9] text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-bold">${t.categoryName}</span>
                  <div class="text-[10px] font-mono text-slate-400 mt-1">${t.codeSku}</div>
                </td>
              `).join('')}
            </tr>

            <!-- Especificaciones Técnicas Cruzadas 4FN -->
            ${allSpecNames.length > 0 ? `
              <tr class="bg-slate-100/80 font-extrabold text-slate-800">
                <td colspan="${toolDetails.length + 1}" class="p-2.5 px-3 uppercase text-[10px] tracking-wider text-slate-500">
                  Especificaciones Técnicas Normalizadas (4FN)
                </td>
              </tr>
              ${allSpecNames.map(specName => `
                <tr>
                  <td class="p-2.5 border border-[#D6D3C9] font-semibold text-slate-600">${specName}</td>
                  ${toolDetails.map(t => {
                    const match = (t.specifications || []).find(s => s.specName.toLowerCase() === specName.toLowerCase());
                    return `
                      <td class="p-2.5 border border-[#D6D3C9] text-center font-medium ${match ? 'text-slate-900 font-semibold' : 'text-slate-300 italic'}">
                        ${match ? match.specValue : '—'}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            ` : ''}

            <!-- Requisitos de Seguridad EPP (4FN) -->
            <tr class="bg-amber-50/60 font-extrabold text-amber-900">
              <td colspan="${toolDetails.length + 1}" class="p-2.5 px-3 uppercase text-[10px] tracking-wider text-amber-800">
                Requisitos de Seguridad y EPP (4FN)
              </td>
            </tr>
            <tr>
              <td class="p-3 border border-[#D6D3C9] font-semibold text-slate-600">EPP Obligatorio</td>
              ${toolDetails.map(t => `
                <td class="p-3 border border-[#D6D3C9]">
                  <div class="flex flex-wrap gap-1 justify-center">
                    ${t.safetyRequirements && t.safetyRequirements.length > 0 ?
                      t.safetyRequirements.map(sr => `
                        <span class="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-semibold">
                          ${sr.requirementName}
                        </span>
                      `).join('') : '<span class="text-slate-400 italic">Estándar</span>'}
                  </div>
                </td>
              `).join('')}
            </tr>

            <!-- Botón de Acción -->
            <tr class="bg-slate-50">
              <td class="p-4 border border-[#D6D3C9] font-bold uppercase text-[10px] text-slate-500">Decisión</td>
              ${toolDetails.map(t => `
                <td class="p-4 border border-[#D6D3C9] text-center">
                  <button type="button" onclick="App.selectAndRentFromComparator(${t.id})" class="w-full py-2 bg-[#181816] hover:bg-[#D94E1F] text-white text-white font-extrabold text-xs rounded-xl transition-all shadow-sm">
                    Alquilar este Equipo
                  </button>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      `;
    } catch (err) {
      container.innerHTML = `<div class="p-8 text-center text-rose-500">Error al cargar datos comparativos: ${err.message}</div>`;
    }
  }

  function selectAndRentFromComparator(toolId) {
    closeModal('modal-comparator');
    openToolDetail(toolId);
  }

  function renderToolsGrid(tools) {
    const grid = document.getElementById('tools-grid');
    const countEl = document.getElementById('catalog-results-count');
    if (!grid) return;

    let processed = getFilteredTools(tools);
    if (countEl) countEl.textContent = `${processed.length} equipo(s) disponible(s)`;

    if (processed.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-[#D6D3C9]">
          <svg class="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <p class="text-base font-extrabold text-slate-800">No se encontraron equipos con esos criterios</p>
          <p class="text-xs text-slate-400 mt-1">Intenta ajustando el término de búsqueda o cambiando los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = processed.map(tool => {
      const statusClass = tool.status === 'DISPONIBLE' ? 'badge-available' :
                          tool.status === 'ALQUILADA' ? 'badge-rented' :
                          tool.status === 'MANTENIMIENTO' ? 'badge-maintenance' : 'badge-retired';

      const fallbackImg = 'images/tools/HERR-0001.jpg';
      const imgSrc = tool.mainImageUrl || fallbackImg;
      const isFav = state.favorites.includes(Number(tool.id));
      const isComparing = state.compareList.some(item => item.id === tool.id);
      const isBestSeller = tool.id === 17 || tool.id === 1;
      const isChoice = tool.id === 16 || tool.id === 7;

      const ratingText = (tool.totalReviews && Number(tool.totalReviews) > 0)
        ? `<svg class="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline mr-0.5" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>${(tool.averageRating || 5.0).toFixed(1)} (${tool.totalReviews})`
        : `<svg class="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline mr-0.5" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>Nuevo`;

      return `
        <div class="tool-card rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm bg-[#FAF9F5] border border-[#D6D3C9] transition-all">
          <div>
            <div class="relative h-52 bg-slate-100 overflow-hidden group">
              <img src="${imgSrc}" alt="${tool.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='${fallbackImg}'">
              <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                ${isBestSeller ? '<span class="badge-bestseller">#1 MÁS ALQUILADO</span>' : ''}
                ${isChoice ? '<span class="badge-choice">OPCIÓN RENTAMAQ</span>' : ''}
                <div class="flex gap-1.5 mt-0.5">
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-md ${statusClass}">${tool.status}</span>
                  <span class="px-2 py-0.5 text-[10px] font-semibold bg-[#232320]/80 text-white rounded-md backdrop-blur-sm">${tool.categoryName || 'General'}</span>
                </div>
              </div>
              <div class="absolute top-3 right-3 flex items-center gap-1.5">
                <button type="button" onclick="App.toggleFavorite(${tool.id}, event)" class="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-sm border border-[#D6D3C9] flex items-center justify-center text-xs shadow-sm hover:scale-110 transition-transform ${isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}" title="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
                  ${isFav ? '<svg class="w-4 h-4 fill-rose-500 text-rose-500 inline" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' : '<svg class="w-4 h-4 text-slate-400 hover:text-rose-500 inline" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>'}
                </button>
                <div class="flex items-center gap-1 px-2 py-0.5 text-[11px] font-black bg-[#181816] text-[#D94E1F] rounded-md shadow-sm border border-[#363632]">
                  <span>${ratingText}</span>
                </div>
              </div>
              <div class="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-mono bg-black/70 text-white rounded font-bold">
                SKU: ${tool.codeSku}
              </div>
            </div>

            <div class="p-5">
              <div class="text-[10px] font-bold uppercase tracking-wider text-[#D94E1F] mb-1">${tool.brand} • ${tool.model}</div>
              <h3 class="text-base font-black text-slate-900 mb-1.5 line-clamp-1 leading-snug hover:text-[#D94E1F] cursor-pointer transition-colors" onclick="App.openToolDetail(${tool.id})">${tool.name}</h3>
              <p class="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">${tool.description}</p>
              
              <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <span class="text-slate-400">Proveedor:</span>
                <strong class="text-slate-800 font-semibold">${tool.providerName}</strong>
              </div>
            </div>
          </div>

          <div class="p-5 pt-0 border-t border-[#D6D3C9] bg-[#E8E5DC]/50 mt-auto">
            <div class="flex items-baseline justify-between py-3">
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tarifa Diaria:</span>
                <div class="text-xl font-black text-slate-900 font-mono">${formatCOP(tool.baseDailyPrice)}</div>
                <span class="inline-block text-[10px] font-bold text-[#B83D14] bg-[#FFF5F0] border border-[#D6D3C9] px-2 py-0.5 rounded-md mt-0.5">15% desc. semana</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Garantía:</span>
                <div class="text-xs font-bold text-slate-700 font-mono mt-0.5">${formatCOP(tool.depositAmount)}</div>
                <span class="text-[9px] text-slate-400 block mt-0.5">Reembolsable</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <button onclick="App.openToolDetail(${tool.id})" class="flex-1 py-2.5 px-3 bg-[#181816] hover:bg-[#D94E1F] text-white shadow-md shadow-sm font-extrabold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm">
                <span>Cotizar / Alquilar</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
              <button type="button" onclick="App.addToQuoteCart(${tool.id}); event.stopPropagation();" class="p-2.5 rounded-xl border border-[#D6D3C9] hover:border-[#D94E1F] hover:bg-orange-50 text-slate-700 text-xs font-bold transition-all" title="Añadir a Cotización Activa">
                
              </button>
              <button type="button" onclick="App.toggleCompare(${tool.id}, event)" class="px-2.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${isComparing ? 'bg-[#D94E1F] text-white border-[#D94E1F]' : 'bg-white text-slate-700 border-[#D6D3C9] hover:border-[#D94E1F]'}" title="Comparar equipo lado a lado">
                
                <span class="hidden sm:inline">${isComparing ? 'En Lista' : 'Comparar'}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderToolsList(tools) {
    const listContainer = document.getElementById('tools-list-view');
    const countEl = document.getElementById('catalog-results-count');
    if (!listContainer) return;

    let processed = getFilteredTools(tools);
    if (countEl) countEl.textContent = `${processed.length} equipo(s) disponible(s)`;

    if (processed.length === 0) {
      listContainer.innerHTML = `
        <div class="py-16 text-center text-slate-500 bg-white rounded-2xl border border-[#D6D3C9]">
          <p class="text-base font-extrabold text-slate-800">No se encontraron equipos con esos criterios en lista</p>
          <p class="text-xs text-slate-400 mt-1">Intenta ajustando los filtros facetados.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = processed.map(tool => {
      const statusClass = tool.status === 'DISPONIBLE' ? 'badge-available' :
                          tool.status === 'ALQUILADA' ? 'badge-rented' :
                          tool.status === 'MANTENIMIENTO' ? 'badge-maintenance' : 'badge-retired';
      const fallbackImg = 'images/tools/HERR-0001.jpg';
      const imgSrc = tool.mainImageUrl || fallbackImg;
      const isComparing = state.compareList.some(item => item.id === tool.id);
      const isBestSeller = tool.id === 17 || tool.id === 1;
      const isChoice = tool.id === 16 || tool.id === 7;
      const weeklyRate = Math.round(Number(tool.baseDailyPrice) * 7 * 0.85);

      return `
        <div class="tool-list-row bg-white">
          <!-- Columna 1: Imagen y SKU -->
          <div class="relative h-28 w-full sm:w-36 rounded-xl overflow-hidden bg-slate-100 border border-[#D6D3C9] shrink-0">
            <img src="${imgSrc}" alt="${tool.name}" class="w-full h-full object-cover" onerror="this.src='${fallbackImg}'">
            <span class="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/70 text-white font-bold">${tool.codeSku}</span>
          </div>

          <!-- Columna 2: Detalles Técnicos & Badges -->
          <div class="space-y-1.5 flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2 py-0.5 text-[10px] font-bold rounded ${statusClass}">${tool.status}</span>
              <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded">${tool.categoryName || 'General'}</span>
              ${isBestSeller ? '<span class="badge-bestseller">#1 MÁS ALQUILADO</span>' : ''}
              ${isChoice ? '<span class="badge-choice">OPCIÓN RENTAMAQ</span>' : ''}
              <span class="text-[10px] font-mono text-slate-400 font-bold uppercase">${tool.brand} • ${tool.model}</span>
            </div>
            <h3 class="text-base font-extrabold text-slate-900 leading-tight hover:text-[#D94E1F] cursor-pointer transition-colors" onclick="App.openToolDetail(${tool.id})">${tool.name}</h3>
            <p class="text-xs text-slate-500 line-clamp-1 leading-relaxed">${tool.description}</p>
            <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span>Proveedor: <strong class="text-slate-800">${tool.providerName}</strong></span>
              <span>•</span>
              <span class="text-emerald-700 font-bold">Póliza Todo Riesgo Sura Incluida</span>
            </div>
          </div>

          <!-- Columna 3: Tarifas & Acciones -->
          <div class="flex flex-col justify-between items-end gap-2 border-t md:border-t-0 md:border-l border-[#D6D3C9] pt-3 md:pt-0 md:pl-4">
            <div class="text-right">
              <div class="text-[10px] text-slate-400 uppercase font-bold">Tarifa Diaria:</div>
              <div class="text-lg font-black text-slate-900 font-mono">${formatCOP(tool.baseDailyPrice)}</div>
              <div class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5">Semana (-15%): ${formatCOP(weeklyRate)}</div>
            </div>

            <div class="flex items-center gap-1.5 w-full justify-end">
              <button type="button" onclick="App.addToQuoteCart(${tool.id})" class="p-2 rounded-xl border border-[#D6D3C9] hover:border-[#D94E1F] hover:bg-orange-50 text-slate-700 text-xs font-bold transition-all" title="Añadir a Cotización">
                <svg class="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </button>
              <button type="button" onclick="App.toggleCompare(${tool.id}, event)" class="p-2 rounded-xl border border-[#D6D3C9] hover:border-slate-400 text-slate-700 text-xs font-bold transition-all ${isComparing ? 'bg-[#D94E1F] text-white border-[#D94E1F]' : ''}" title="Comparar">
                <svg class="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
              </button>
              <button type="button" onclick="App.openToolDetail(${tool.id})" class="px-3.5 py-2 bg-[#181816] hover:bg-[#D94E1F] text-white shadow-md shadow-sm font-extrabold text-xs rounded-xl transition-all shadow-sm">
                Cotizar / Alquilar
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
    content.innerHTML = '<div class="py-24 text-center"><div class="inline-block animate-spin rounded-lg h-8 w-8 border-b-2 border-[#D94E1F]"></div><p class="mt-2 text-sm text-slate-500">Cargando relaciones 4FN...</p></div>';

    try {
      const [tool, occupied, reviewData, commentsData] = await Promise.all([
        API.tools.getToolDetail(toolId),
        API.reservations.getOccupiedDates(toolId).catch(() => []),
        API.reviews.getToolReviews(toolId).catch(() => ({ averageRating: 0, totalReviews: 0, reviews: [] })),
        API.tools.getComments(toolId).catch(() => [])
      ]);
      state.selectedTool = tool;
      state.selectedToolOccupied = occupied || [];
      state.selectedToolReviews = reviewData;
      state.selectedToolComments = commentsData || [];

      // Fechas por defecto: mañana a 7 días (para mostrar descuento semanal 15%)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const toIsoDate = (d) => d.toISOString().split('T')[0];
      const startStr = toIsoDate(tomorrow);
      const endStr = toIsoDate(nextWeek);

      // Equipo complementario para combo sinérgico de obra (Amazon style)
      const compTool = (state.tools && state.tools.length > 0)
        ? (state.tools.find(t => t.id !== tool.id && (t.categoryId === tool.categoryId || t.id === (tool.id % 20 + 1))) || state.tools[0])
        : null;
      const comboDailyPrice = Number(tool.baseDailyPrice) + (compTool ? Number(compTool.baseDailyPrice) : 0);
      const comboDiscounted = Math.round(comboDailyPrice * 0.90);

      content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Columna Izquierda: Galería e Información Base -->
          <div class="lg:col-span-7 space-y-6">
            <div class="relative h-80 rounded-2xl overflow-hidden bg-slate-100 border border-[#D6D3C9]">
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
                    <img src="${img.imageUrl}" onclick="document.getElementById('detail-main-img').src='${img.imageUrl}'" class="w-20 h-20 rounded-lg object-cover cursor-pointer border-2 hover:border-[#D94E1F] transition-colors border-transparent" title="${img.caption || ''}">
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
            <div class="bg-slate-50 p-5 rounded-2xl border border-[#D6D3C9]">
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                Especificaciones Técnicas Normalizadas
              </h3>
              <div class="grid grid-cols-2 gap-3 text-xs">
                ${tool.specifications && tool.specifications.length > 0 ?
                  tool.specifications.map(s => `
                    <div class="p-2.5 bg-white rounded-lg border border-[#D6D3C9] flex justify-between">
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
                      ${sr.requirementName}
                    </span>
                  `).join('') : '<span class="text-xs text-amber-700">Equipamiento estándar de protección requerido.</span>'
                }
              </div>
            </div>

            <!-- Calificaciones y Reseñas de Clientes (Pilar 2) -->
            <div class="bg-white p-5 rounded-2xl border border-[#D6D3C9] space-y-4">
              <div class="flex items-center justify-between border-b border-[#D6D3C9] pb-3">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-500 fill-amber-500 inline" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Opiniones de Contratistas</h3>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-base font-black text-amber-600"><svg class="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline mr-0.5" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>${reviewData && reviewData.averageRating > 0 ? reviewData.averageRating.toFixed(1) : '5.0'}</span>
                  <span class="text-xs text-slate-400 font-medium">(${reviewData ? reviewData.totalReviews : 0} opinión${reviewData && reviewData.totalReviews === 1 ? '' : 'es'})</span>
                </div>
              </div>

              ${reviewData && reviewData.reviews && reviewData.reviews.length > 0 ? `
                <div class="space-y-3">
                  ${reviewData.reviews.map(rev => `
                    <div class="p-3.5 bg-slate-50 rounded-xl border border-[#D6D3C9] text-xs space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-extrabold text-slate-800">${rev.clientName || 'Contratista'}</span>
                        <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${rev.rating} / 5</span>
                      </div>
                      <p class="text-slate-600 leading-relaxed">${rev.comment}</p>
                      <div class="text-[10px] text-slate-400 font-mono pt-1">${formatDate(rev.createdAt)}</div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-[#D6D3C9]">
                  Esta herramienta aún no registra opiniones. ¡Alquílala y comparte tu experiencia en obra!
                </div>
              `}
            </div>

            <!-- Muro Interactivo de Comentarios y Preguntas (Q&A) -->
            <div class="bg-white p-5 rounded-2xl border border-[#D6D3C9] space-y-4">
              <div class="flex items-center justify-between border-b border-[#D6D3C9] pb-3">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#D94E1F] inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Preguntas y Comentarios sobre este Equipo</h3>
                </div>
                <span id="comment-count-badge" class="text-xs text-slate-400 font-medium">${state.selectedToolComments.length} mensaje(s)</span>
              </div>

              <!-- Lista de Comentarios -->
              <div id="tool-comments-container" class="space-y-3">
                ${renderCommentsHtml(state.selectedToolComments, tool.id)}
              </div>

              <!-- Formulario para Publicar Pregunta / Comentario -->
              ${state.user ? `
                <div class="pt-2 border-t border-[#D6D3C9]">
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Escribe tu pregunta para el proveedor o equipo técnico:</label>
                  <div class="flex gap-2">
                    <input type="text" id="new-comment-input" placeholder="Ej: ¿El equipo incluye brocas SDS Max o cable de extensión de 20m?" class="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none">
                    <button type="button" onclick="App.submitComment(${tool.id})" class="px-4 py-2 bg-[#181816] hover:bg-[#D94E1F] text-white text-white font-extrabold text-xs rounded-xl transition-all shadow-sm shrink-0">
                      Publicar
                    </button>
                  </div>
                </div>
              ` : `
                <div class="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  <span>¿Tienes dudas sobre especificaciones o transporte? </span>
                  <button type="button" onclick="App.openAuthModal('login')" class="font-bold text-amber-600 hover:underline">Inicia sesión</button> para preguntar al proveedor.
                </div>
              `}
            </div>

            <!-- Combo Frecuentemente Alquilados Juntos (Amazon Style) -->
            ${compTool ? `
              <div class="combo-bundle-box space-y-3.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-black text-[#D94E1F] uppercase tracking-wider bg-[#FFE8DE] text-[#B83D14] px-2 py-0.5 rounded font-bold">COMBO SINÉRGICO DE OBRA</span>
                    <span class="text-xs text-slate-800 font-extrabold">Frecuentemente Alquilados Juntos</span>
                  </div>
                  <span class="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">10% OFF BUNDLE</span>
                </div>
                <div class="flex flex-col sm:flex-row items-center gap-4">
                  <div class="flex items-center gap-2 shrink-0">
                    <img src="${tool.mainImageUrl || 'images/tools/HERR-0001.jpg'}" class="w-16 h-16 rounded-xl object-cover border border-[#D6D3C9] bg-slate-100" onerror="this.src='images/tools/HERR-0001.jpg'">
                    <span class="text-slate-400 font-black text-lg">+</span>
                    <img src="${compTool.mainImageUrl || 'images/tools/HERR-0001.jpg'}" class="w-16 h-16 rounded-xl object-cover border border-[#D6D3C9] bg-slate-100" onerror="this.src='images/tools/HERR-0001.jpg'">
                  </div>
                  <div class="flex-1 min-w-0 text-xs space-y-1">
                    <h5 class="font-bold text-slate-900 leading-snug">${tool.name} <span class="text-slate-400">+</span> ${compTool.name}</h5>
                    <p class="text-[11px] text-slate-500">Combo integral para obra continua con 10% de descuento bundle.</p>
                    <div class="flex items-baseline gap-2 pt-0.5">
                      <span class="text-base font-black text-slate-950 font-mono">${formatCOP(comboDiscounted)} / día</span>
                      <span class="text-xs line-through text-slate-400 font-mono">${formatCOP(comboDailyPrice)}</span>
                    </div>
                  </div>
                  <button type="button" onclick="App.addComboToQuoteCart(${tool.id}, ${compTool.id}); App.closeModal('modal-tool-detail');" class="px-4 py-2.5 bg-[#181816] hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap">
                    Alquilar Ambos en Combo &rarr;
                  </button>
                </div>
              </div>
            ` : ''}

          </div>

          <!-- Columna Derecha: Tarifas 4FN y Cotizador en Vivo -->
          <div class="lg:col-span-5 flex flex-col justify-between">
            <div class="bg-white p-6 rounded-2xl border border-[#D6D3C9] shadow-sm space-y-5">
              <div>
                <h3 class="text-base font-extrabold text-slate-900 mb-1">Cotizador Dinámico de Alquiler</h3>
                <p class="text-xs text-slate-500">Calculado en tiempo real según días de arrendamiento e impuestos fiscales (IVA 19%).</p>
              </div>

              <!-- Tarifas Normalizadas (4FN Relación 3) -->
              ${tool.pricingTiers && tool.pricingTiers.length > 0 ? `
                <div class="p-3 bg-slate-50 rounded-xl border border-[#D6D3C9]">
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
              <div class="p-3.5 bg-slate-50 rounded-xl border border-[#D6D3C9] space-y-2.5">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    Disponibilidad Próximos 28 Días:
                  </span>
                  <span class="text-[10px] font-bold text-blue-800 bg-[#FFE8DE]/80 px-2 py-0.5 rounded">En vivo</span>
                </div>
                
                <div id="availability-calendar-grid" class="grid grid-cols-7 gap-1 text-center text-[10px]">
                  <!-- Días generados dinámicamente -->
                </div>

                <!-- Leyenda del calendario -->
                <div class="flex items-center justify-between pt-1.5 text-[10px] text-slate-500 border-t border-[#D6D3C9]">
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded bg-white border border-slate-300"></span>
                    <span>Libre</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded bg-[#D94E1F]"></span>
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
              <div id="calc-breakdown-box" class="p-4 bg-[#232320] text-white rounded-xl space-y-2.5 font-mono text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Días de Alquiler:</span>
                  <span id="calc-days" class="text-white font-bold">7 días</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Tarifa diaria base:</span>
                  <span id="calc-base-daily">${formatCOP(tool.baseDailyPrice)}</span>
                </div>
                <div id="calc-weekly-badge" class="flex justify-between text-emerald-400 font-semibold bg-emerald-950/60 p-1.5 rounded">
                  <span>Descuento Semanal (85%):</span>
                  <span>APLICADO</span>
                </div>
                <div class="border-t border-[#363632] pt-2 flex justify-between text-slate-300">
                  <span>Subtotal Neto:</span>
                  <span id="calc-subtotal" class="font-bold text-white">$ 0 COP</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>IVA Ley (19%):</span>
                  <span id="calc-tax">$ 0 COP</span>
                </div>
                <div class="flex justify-between text-blue-300">
                  <span>Depósito Garantía (Reembolsable):</span>
                  <span id="calc-deposit">${formatCOP(tool.depositAmount)}</span>
                </div>
                <div class="border-t border-slate-700 pt-2 flex justify-between text-sm font-extrabold text-blue-300">
                  <span>TOTAL ESTIMADO:</span>
                  <span id="calc-grand-total">$ 0 COP</span>
                </div>
              </div>

              <!-- Notas adicionales -->
              <div>
                <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Observaciones / Dirección de Obra (Opcional)</label>
                <textarea id="reservation-notes" rows="2" placeholder="Ej: Obra Calle 127 con 7ma, Torre B..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>
              </div>

              <!-- Botones de Acción: Reserva, Carrito de Obra y Cotización Formal -->
              <div class="space-y-2">
                ${tool.status === 'DISPONIBLE' ? `
                  <button type="button" id="btn-submit-reservation" onclick="App.submitReservation()" class="w-full py-3.5 bg-[#181816] hover:bg-[#D94E1F] text-white font-black text-sm rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2">
                    <span>Confirmar Solicitud de Reserva</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </button>
                ` : `
                  <button disabled class="w-full py-3.5 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed">
                    Herramienta no disponible para reserva
                  </button>
                `}

                <button type="button" onclick="App.addToQuoteCart(${tool.id}); App.closeModal('modal-tool-detail');" class="w-full py-2.5 bg-[#181816] hover:bg-[#232320] text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                  <span>Añadir a Cotización Activa (Carrito de Obra)</span>
                </button>
                
                <button type="button" onclick="App.openFormalQuoteModal()" class="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-300 shadow-sm">
                  <span>Imprimir Cotización Formal Membretada</span>
                </button>
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

  // Renderizado y lógica de comentarios Q&A
  function renderCommentsHtml(comments, toolId) {
    if (!comments || comments.length === 0) {
      return `
        <div class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-[#D6D3C9]">
          No hay preguntas aún. ¡Sé el primero en consultar sobre disponibilidad técnica, transporte o accesorios!
        </div>
      `;
    }

    const canReply = state.profile && (state.profile.role === 'ROLE_PROVEEDOR' || state.profile.role === 'ROLE_ADMIN');

    return comments.map(c => `
      <div class="p-3.5 bg-slate-50 rounded-xl border border-[#D6D3C9] text-xs space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-[#232320] text-amber-400 font-bold flex items-center justify-center text-[10px]">
              ${(c.userName || 'U')[0].toUpperCase()}
            </span>
            <span class="font-extrabold text-slate-800">${c.userName || 'Usuario'}</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">${formatDate(c.createdAt)}</span>
        </div>
        <p class="text-slate-700 leading-relaxed pl-8">${c.commentText}</p>

        <!-- Respuesta oficial del proveedor -->
        ${c.providerReply ? `
          <div class="ml-8 p-3 bg-amber-50/70 rounded-lg border-l-2 border-[#D94E1F] text-slate-800 space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span>Respuesta Oficial del Proveedor</span>
              <span class="text-[10px] text-slate-400 font-mono font-normal">${formatDate(c.repliedAt)}</span>
            </div>
            <p class="text-[11px] text-slate-700 leading-relaxed">${c.providerReply}</p>
          </div>
        ` : (canReply ? `
          <div class="ml-8 pt-1">
            <button type="button" onclick="App.replyCommentPrompt(${c.id}, ${toolId})" class="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 hover:underline">
              Responder oficialmente
            </button>
          </div>
        ` : '')}
      </div>
    `).join('');
  }

  async function submitComment(toolId) {
    const input = document.getElementById('new-comment-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || text.length < 3) {
      toast('El comentario debe contener al menos 3 caracteres.', 'warning');
      return;
    }

    try {
      await API.tools.addComment(toolId, text);
      input.value = '';
      toast('Pregunta publicada con éxito.', 'success');
      // Recargar comentarios sin cerrar modal
      await refreshToolComments(toolId);
    } catch (err) {
      toast('Error al publicar comentario: ' + err.message, 'error');
    }
  }

  async function replyCommentPrompt(commentId, toolId) {
    const reply = prompt('Escribe la respuesta técnica oficial del proveedor para este comentario:');
    if (!reply || reply.trim().length < 2) return;

    try {
      await API.tools.replyComment(commentId, reply.trim());
      toast('Respuesta oficial guardada y publicada.', 'success');
      await refreshToolComments(toolId);
    } catch (err) {
      toast('Error al responder comentario: ' + err.message, 'error');
    }
  }

  async function refreshToolComments(toolId) {
    try {
      const comments = await API.tools.getComments(toolId);
      state.selectedToolComments = comments || [];
      const container = document.getElementById('tool-comments-container');
      const badge = document.getElementById('comment-count-badge');
      if (container) container.innerHTML = renderCommentsHtml(comments, toolId);
      if (badge) badge.textContent = `${comments.length} mensaje(s)`;
    } catch (e) {
      console.warn('Error refrescando comentarios:', e);
    }
  }

  // Modal de Cotización Formal Membretada
  function openFormalQuoteModal() {
    const tool = state.selectedTool;
    const calc = state.calculatedPrice;
    if (!tool) {
      toast('No hay herramienta seleccionada para cotizar.', 'warning');
      return;
    }

    const startVal = document.getElementById('calc-start-date')?.value || new Date().toISOString().split('T')[0];
    const endVal = document.getElementById('calc-end-date')?.value || startVal;
    const clientName = state.profile?.displayName || 'CONTRATISTA DE OBRA';
    const clientEmail = state.user?.email || 'cliente@obra.com';
    const quoteNum = 'COT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
    const todayStr = formatDate(new Date().toISOString());

    const days = calc?.totalDays || 7;
    const baseDaily = Number(tool.baseDailyPrice) || 0;
    const subtotal = calc?.subtotal || (baseDaily * days);
    const discount = calc?.weeklyDiscountApplied ? (baseDaily * days * 0.15) : 0;
    const tax = calc?.taxAmount || (subtotal * 0.19);
    const deposit = calc?.depositAmount || Number(tool.depositAmount) || 0;
    const total = (subtotal + tax + deposit);

    const doc = document.getElementById('formal-quote-document');
    if (!doc) return;

    doc.innerHTML = `
      <!-- Encabezado Membretado Oficial -->
      <div class="flex justify-between items-start border-b-2 border-slate-900 pb-5">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-black text-slate-950">RENTA<span class="text-[#D94E1F]">MAQ</span></span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D94E1F] text-white">HEAVY EQUIPMENT</span>
          </div>
          <div class="text-xs text-slate-500 mt-1">RentaMaq Colombia S.A.S. • NIT 901.884.231-9</div>
          <div class="text-xs text-slate-500">Parque Industrial El Dorado, Módulo 14 • Bogotá D.C.</div>
          <div class="text-xs text-slate-500">PBX: (601) 745-8800 • cotizaciones@rentamaq.com</div>
        </div>
        <div class="text-right">
          <div class="inline-block px-3 py-1 bg-[#232320] text-white font-mono font-bold text-xs rounded-lg uppercase tracking-wider mb-1">
            Cotización Comercial
          </div>
          <div class="text-base font-black text-slate-900 font-mono">${quoteNum}</div>
          <div class="text-xs text-slate-500 mt-0.5">Fecha: <strong>${todayStr}</strong></div>
          <div class="text-[10px] text-[#B83D14] font-bold mt-0.5">Validez: 15 días calendario</div>
        </div>
      </div>

      <!-- Datos del Cliente y Obra -->
      <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-[#D6D3C9] text-xs">
        <div>
          <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Datos del Solicitante / Contratista</span>
          <div class="font-black text-sm text-slate-900">${clientName}</div>
          <div class="text-slate-600 mt-0.5">Email: <strong>${clientEmail}</strong></div>
          <div class="text-slate-600">Ciudad: <strong>Bogotá D.C. &bull; Región Central</strong></div>
        </div>
        <div>
          <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Condiciones de Despacho</span>
          <div class="text-slate-600">Fecha Estimada Entrega: <strong class="text-slate-900">${formatDate(startVal)}</strong></div>
          <div class="text-slate-600 mt-0.5">Fecha Retorno Previsto: <strong class="text-slate-900">${formatDate(endVal)}</strong></div>
          <div class="text-slate-600 mt-0.5">Duración Estimada: <strong class="text-amber-700">${days} día(s) en faena</strong></div>
        </div>
      </div>

      <!-- Tabla de Liquidación del Equipo Cotizado -->
      <div class="border border-[#D6D3C9] rounded-2xl overflow-hidden">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
            <tr>
              <th class="py-2.5 px-4">Descripción del Equipo / Maquinaria</th>
              <th class="py-2.5 px-3 text-center">Días</th>
              <th class="py-2.5 px-3 text-right">Tarifa Diaria</th>
              <th class="py-2.5 px-3 text-right">Desc. Escala</th>
              <th class="py-2.5 px-4 text-right">Subtotal Neto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="py-3 px-4">
                <div class="font-extrabold text-slate-900 text-sm">${tool.name}</div>
                <div class="text-[11px] text-slate-500 font-medium">${tool.brand} &bull; Modelo: ${tool.model} &bull; SKU: ${tool.codeSku}</div>
                <div class="text-[10px] text-amber-700 mt-0.5">Certificación RETIE y Póliza All-Risk incluida</div>
              </td>
              <td class="py-3 px-3 text-center font-bold">${days}</td>
              <td class="py-3 px-3 text-right font-mono">${formatCOP(baseDaily)}</td>
              <td class="py-3 px-3 text-right font-mono text-emerald-600 font-bold">
                ${discount > 0 ? `- ${formatCOP(discount)}` : '$ 0'}
              </td>
              <td class="py-3 px-4 text-right font-mono font-black text-slate-900">${formatCOP(subtotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Desglose Financiero -->
      <div class="flex justify-between items-start pt-2">
        <div class="max-w-xs space-y-1.5 text-[11px] text-slate-500">
          <div class="font-bold text-slate-700 uppercase text-[10px]">Garantías y Condiciones Comerciales:</div>
          <div>• Depósito reembolsable sujeto a inspección técnica a conformidad en acta de retorno.</div>
          <div>• Mantenimiento preventivo por desgaste natural a cargo de RentaMaq S.A.S.</div>
          <div>• Soporte técnico de reposición en obra en menos de 4 horas en Bogotá y Sabana.</div>
        </div>

        <div class="w-72 space-y-1.5 text-xs">
          <div class="flex justify-between py-1 border-b border-[#D6D3C9]">
            <span class="text-slate-500">Subtotal Arriendo:</span>
            <span class="font-mono font-bold text-slate-900">${formatCOP(subtotal)}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-[#D6D3C9]">
            <span class="text-slate-500">IVA (19% Ley):</span>
            <span class="font-mono font-bold text-amber-700">${formatCOP(tax)}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-[#D6D3C9]">
            <span class="text-slate-500">Garantía en Custodia (Fianza):</span>
            <span class="font-mono font-bold text-slate-700">${formatCOP(deposit)}</span>
          </div>
          <div class="flex justify-between py-2 bg-[#232320] text-white px-3.5 rounded-xl font-bold mt-2">
            <span>TOTAL ESTIMADO:</span>
            <span class="font-mono text-[#D94E1F] font-black text-sm">${formatCOP(total)}</span>
          </div>
        </div>
      </div>

      <!-- Firmas Autorizadas -->
      <div class="grid grid-cols-2 gap-8 pt-8 border-t border-[#D6D3C9] text-xs">
        <div class="text-center space-y-1">
          <div class="h-12 border-b border-slate-300 mx-8 flex items-end justify-center pb-1 font-mono text-[11px] text-slate-400">
            [Firma Digital Verificada - RentaMaq]
          </div>
          <div class="font-bold text-slate-900">Gerencia Comercial y Logística</div>
          <div class="text-[10px] text-slate-400">RentaMaq Colombia S.A.S.</div>
        </div>
        <div class="text-center space-y-1">
          <div class="h-12 border-b border-slate-300 mx-8"></div>
          <div class="font-bold text-slate-900">Firma de Aceptación del Contratista</div>
          <div class="text-[10px] text-slate-400">CC / NIT del Titular o Representante</div>
        </div>
      </div>
    `;

    document.getElementById('modal-formal-quote').classList.remove('hidden');
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
        cellClass = 'bg-[#D94E1F] text-white font-black shadow-sm ring-2 ring-blue-400 cursor-pointer';
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
            <span><svg class="w-4 h-4 text-rose-600 shrink-0 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></span>
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
            <span><svg class="w-4 h-4 text-emerald-600 shrink-0 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></span>
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

  // Navegación entre vistas (Inicio, Catálogo, Panel Cliente, Proveedor, Admin)
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

    if (viewName === 'home') {
      onHomeCalcChange();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (viewName === 'catalog') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (viewName === 'client') loadClientDashboard();
    if (viewName === 'provider') loadProviderDashboard();
    if (viewName === 'admin') loadAdminDashboard();
  }

  function openCategoryInCatalog(catId, catName) {
    navigateView('catalog');
    let matchedCat = null;
    if (catId && state.categories.some(c => c.id == catId)) {
      matchedCat = state.categories.find(c => c.id == catId);
    } else if (catName) {
      matchedCat = state.categories.find(c => c.name.toLowerCase().includes(catName.toLowerCase()));
    }

    if (matchedCat) {
      filterByCategoryChip(matchedCat.id);
    } else if (catName) {
      const searchInput = document.getElementById('filter-search');
      if (searchInput) {
        searchInput.value = catName;
        state.filters.query = catName;
        loadTools();
      }
    } else {
      resetFilters();
    }

    const catalogEl = document.getElementById('view-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function onHomeCalcChange() {
    const toolSelect = document.getElementById('home-calc-tool');
    const daysInput = document.getElementById('home-calc-days');
    const daysDisplay = document.getElementById('home-calc-days-display');
    const dailyPriceEl = document.getElementById('home-calc-daily-price');
    const subtotalEl = document.getElementById('home-calc-subtotal');
    const discountEl = document.getElementById('home-calc-discount');
    const ivaEl = document.getElementById('home-calc-iva');
    const depositEl = document.getElementById('home-calc-deposit');
    const totalEl = document.getElementById('home-calc-total');

    if (!toolSelect || !daysInput) return;

    const days = parseInt(daysInput.value, 10) || 1;
    const dailyPrice = parseFloat(toolSelect.value) || 95000;

    if (daysDisplay) daysDisplay.textContent = `${days} día(s)`;
    if (dailyPriceEl) dailyPriceEl.textContent = formatCOP(dailyPrice);

    const subtotal = dailyPrice * days;
    const discount = days >= 7 ? Math.round(subtotal * 0.15) : 0;
    const subtotalAfterDiscount = subtotal - discount;
    const iva = Math.round(subtotalAfterDiscount * 0.19);
    const deposit = dailyPrice * 2; // 2 días de fianza en custodia
    const total = subtotalAfterDiscount + iva + deposit;

    if (subtotalEl) subtotalEl.textContent = formatCOP(subtotal);
    if (discountEl) {
      if (discount > 0) {
        discountEl.textContent = `- ${formatCOP(discount)} (15% OFF)`;
        discountEl.className = 'text-emerald-400 font-bold';
      } else {
        discountEl.textContent = '$ 0 (Aplica desde 7 días)';
        discountEl.className = 'text-slate-500 font-normal';
      }
    }
    if (ivaEl) ivaEl.textContent = formatCOP(iva);
    if (depositEl) depositEl.textContent = formatCOP(deposit);
    if (totalEl) totalEl.textContent = formatCOP(total);
  }

  function toggleFaq(id) {
    const ans = document.getElementById(`faq-ans-${id}`);
    const icon = document.getElementById(`faq-icon-${id}`);
    if (!ans) return;
    const isHidden = ans.classList.contains('hidden');
    ans.classList.toggle('hidden', !isHidden);
    if (icon) {
      icon.textContent = isHidden ? '▲' : '▼';
    }
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
    state.selectedBrands = [];
    state.retieOnly = false;
    state.filterOnlyFavorites = false;

    renderCategoryChips();
    renderFacetedFilters();
    loadTools();
  }

  function filterByCategoryChip(catId) {
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
      categorySelect.value = catId || '';
    }
    state.filters.categoryId = catId ? String(catId) : '';

    renderCategoryChips();

    const activeChip = document.getElementById(catId ? `chip-cat-${catId}` : 'chip-cat-all');
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    renderFacetedFilters();
    loadTools();
  }

  function scrollToInventory() {
    const el = document.getElementById('catalog-inventory-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function quickClientDemoLogin() {
    try {
      const user = await API.auth.login('cliente1@correo.com', 'Cliente#Renta2026!Sec');
      const me = await API.auth.getMe();
      state.user = user;
      state.profile = me;
      renderHeaderUser();
      toast('¡Sesión iniciada como Contratista (Constructora Andina S.A.S.)!', 'success');
      navigateView('client');
    } catch (err) {
      toast('Error al iniciar sesión de demostración: ' + err.message, 'error');
    }
  }

  // 1. Panel Cliente / Mis Alquileres
  async function loadClientDashboard() {
    const listEl = document.getElementById('client-reservations-list');
    const statsTiles = document.getElementById('client-stats-tiles');

    if (!state.profile || !state.profile.clientId) {
      if (statsTiles) statsTiles.classList.add('hidden');
      if (listEl) {
        listEl.innerHTML = `
          <div class="p-8 sm:p-12 text-center bg-white rounded-3xl border border-[#D6D3C9] shadow-sm space-y-6">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-[#FFF5F0] text-[#D94E1F] flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div class="max-w-md mx-auto space-y-2">
              <h3 class="text-xl font-black text-slate-900">Portal de Gestión de Obras para Contratistas</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Inicia sesión para monitorear el estado en tiempo real de tus reservas, realizar pagos en cuotas, descargar facturas electrónicas con CUFE y tramitar actas de devolución.
              </p>
            </div>
            <div class="flex flex-wrap justify-center gap-3 pt-2">
              <button type="button" onclick="App.quickClientDemoLogin()" class="px-5 py-3 bg-[#181816] hover:bg-[#D94E1F] text-white shadow-md shadow-sm font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2">
                Ingresar como Contratista Demo (Constructora Andina)
              </button>
              <button type="button" onclick="App.openAuthModal('login')" class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all">
                Iniciar Sesión con Otra Cuenta
              </button>
            </div>
          </div>
        `;
      }
      return;
    }

    if (statsTiles) statsTiles.classList.remove('hidden');

    const titleEl = document.getElementById('client-company-title');
    const subtitleEl = document.getElementById('client-company-subtitle');
    if (titleEl) titleEl.textContent = state.profile.displayName || 'Constructora Andina S.A.S.';
    if (subtitleEl) subtitleEl.textContent = `NIT: ${state.profile.documentNumber || '901.482.119-3'} • Frentes de Obra Activos & Supervisión de Cuadrilla`;

    if (!listEl) return;
    listEl.innerHTML = '<div class="py-12 text-center text-slate-400"><div class="inline-block animate-spin rounded-lg h-8 w-8 border-b-2 border-[#D94E1F] mb-2"></div><p>Cargando tus alquileres y estados de obra...</p></div>';

    try {
      const reservations = await API.reservations.getByClient(state.profile.clientId);
      state.clientReservations = reservations || [];

      // Actualizar KPIs de contratista en vivo
      updateClientKpis(state.clientReservations);

      renderClientReservationsList();
    } catch (err) {
      listEl.innerHTML = `<div class="p-4 text-rose-600 bg-rose-50 rounded-xl">Error cargando tus alquileres: ${err.message}</div>`;
    }
  }

  function updateClientKpis(reservations) {
    const activeEl = document.getElementById('client-kpi-active');
    const instEl = document.getElementById('client-kpi-installments');
    const depEl = document.getElementById('client-kpi-deposits');
    const invEl = document.getElementById('client-kpi-invoices');

    const activeCount = reservations.filter(r => r.status === 'EN_CURSO').length;
    const instCount = reservations.filter(r => r.paymentMethod === 'EN_CUOTAS' || (r.installmentCount && r.installmentCount > 1)).length;
    const totalDeposits = reservations
      .filter(r => r.status === 'EN_CURSO' || r.status === 'APROBADA')
      .reduce((acc, r) => acc + (Number(r.depositAmount) || 0), 0);
    const invoiceCount = reservations.filter(r => r.hasPayment || r.status === 'APROBADA' || r.status === 'EN_CURSO' || r.status === 'FINALIZADA').length;

    if (activeEl) activeEl.textContent = activeCount;
    if (instEl) instEl.textContent = instCount;
    if (depEl) depEl.textContent = formatCOP(totalDeposits);
    if (invEl) invEl.textContent = invoiceCount;
  }

  function filterClientReservations(status) {
    state.clientFilterStatus = status;
    const btns = document.querySelectorAll('.client-status-btn');
    btns.forEach(b => {
      const match = b.getAttribute('onclick')?.includes(`'${status}'`);
      b.className = match
        ? 'client-status-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-[#232320] text-white'
        : 'client-status-btn px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100';
    });
    renderClientReservationsList();
  }

  function onClientSearchInput(text) {
    state.clientSearchQuery = (text || '').trim().toLowerCase();
    renderClientReservationsList();
  }

  function renderClientReservationsList() {
    const listEl = document.getElementById('client-reservations-list');
    if (!listEl) return;

    let list = state.clientReservations || [];

    // Filtro por estado
    if (state.clientFilterStatus && state.clientFilterStatus !== 'all') {
      if (state.clientFilterStatus === 'EN_CUOTAS') {
        list = list.filter(r => r.paymentMethod === 'EN_CUOTAS' || (r.installmentCount && r.installmentCount > 1));
      } else {
        list = list.filter(r => r.status === state.clientFilterStatus);
      }
    }

    // Filtro por texto de búsqueda
    if (state.clientSearchQuery) {
      const q = state.clientSearchQuery;
      list = list.filter(r =>
        (r.reservationCode && r.reservationCode.toLowerCase().includes(q)) ||
        (r.toolName && r.toolName.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      listEl.innerHTML = '<div class="p-8 text-center text-slate-400 bg-white rounded-2xl border border-[#D6D3C9]">No se encontraron reservas con esos filtros.</div>';
      return;
    }

    listEl.innerHTML = list.map(r => {
      // 5 Pasos Operacionales del Ciclo de Vida del Contratista
      const isCancelled = r.status === 'CANCELADA' || r.status === 'RECHAZADA';
      let step1 = 'completed'; // 1. Reserva Creada
      let step2 = 'pending';   // 2. Pagada / Cuotas
      let step3 = 'pending';   // 3. En Faena
      let step4 = 'pending';   // 4. Retorno
      let step5 = 'pending';   // 5. Fianza Reintegrada
      let progressPct = 20;

      if (r.status === 'PENDIENTE') {
        step2 = 'active';
        progressPct = 20;
      } else if (r.status === 'APROBADA') {
        if (!r.hasPayment) {
          step2 = 'active';
          progressPct = 35;
        } else {
          step2 = 'completed';
          step3 = 'active';
          progressPct = 50;
        }
      } else if (r.status === 'EN_CURSO') {
        step1 = 'completed';
        step2 = 'completed';
        step3 = 'completed';
        step4 = 'active';
        progressPct = 70;
      } else if (r.status === 'FINALIZADA') {
        step1 = 'completed';
        step2 = 'completed';
        step3 = 'completed';
        step4 = 'completed';
        step5 = 'completed';
        progressPct = 100;
      }

      const getDotClass = (st) => st === 'completed' ? 'stepper-dot-completed' : (st === 'active' ? 'stepper-dot-active' : 'stepper-dot-pending');
      const getDotIcon = (st, num) => num;
      const getLabelClass = (st) => st === 'active' ? 'stepper-label-active font-extrabold' : (st === 'completed' ? 'text-slate-900 font-bold' : '');

      const isEnCuotas = r.hasPayment && (r.paymentMethod === 'EN_CUOTAS' || (r.installmentCount && r.installmentCount > 1));

      return `
        <div class="bg-white p-5 rounded-2xl border border-[#D6D3C9] shadow-sm space-y-4">
          <!-- Encabezado de la Reserva -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <img src="${r.toolImageUrl || 'images/tools/HERR-0001.jpg'}" class="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-[#D6D3C9] shrink-0" onerror="this.src='images/tools/HERR-0001.jpg'">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-mono font-bold text-slate-700">${r.reservationCode}</span>
                  <span class="text-xs px-2.5 py-0.5 rounded-lg font-bold badge-res-${r.status.toLowerCase()}">${r.status}</span>
                  ${isEnCuotas ? '<span class="text-[10px] px-2 py-0.5 rounded font-extrabold bg-orange-100 text-orange-900 border border-orange-200">EN CUOTAS</span>' : ''}
                </div>
                <h4 class="font-extrabold text-slate-900 text-base leading-snug">${r.toolName}</h4>
                <p class="text-xs text-slate-500 font-medium">${formatDate(r.startDate)} &bull; ${formatDate(r.endDate)} (${r.totalDays} días en faena)</p>
              </div>
            </div>

            <div class="flex flex-col md:items-end justify-between gap-2">
              <div>
                <div class="text-[11px] text-slate-400 uppercase font-semibold">Total Liquidado:</div>
                <div class="text-lg font-black text-slate-900 font-mono">${formatCOP(r.totalAmount)}</div>
              </div>
              <div class="flex flex-wrap gap-2">
                <!-- Botón de Pago Desbloqueado para PENDIENTE y APROBADA -->
                ${(!r.hasPayment && (r.status === 'PENDIENTE' || r.status === 'APROBADA')) ? `
                  <button type="button" onclick="App.openPaymentModal(${r.id}, '${r.reservationCode}', ${r.totalAmount})" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 animate-pulse">
                    Pagar Ahora
                  </button>
                ` : ''}

                ${r.status === 'PENDIENTE' ? `
                  <button type="button" onclick="App.cancelReservationAction(${r.id})" class="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors">
                    Cancelar
                  </button>
                ` : ''}

                ${(r.hasPayment || r.status === 'APROBADA' || r.status === 'EN_CURSO' || r.status === 'FINALIZADA') ? `
                  <button type="button" onclick="App.openInvoiceModal(${r.id})" class="px-3 py-1.5 bg-[#181816] hover:bg-[#D94E1F] text-white shadow-md shadow-sm font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                    Factura DIAN
                  </button>
                ` : ''}

                ${r.status === 'FINALIZADA' ? `
                  <button type="button" onclick="App.openSettlementModal(${r.id})" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm">
                    Liquidación
                  </button>
                  <button type="button" onclick="App.openReviewModal(${r.id}, ${r.toolId}, '${(r.toolName || 'Herramienta').replace(/'/g, "\\'")}', '${r.reservationCode}')" class="px-3 py-1.5 bg-[#181816] hover:bg-[#D94E1F] text-white font-black text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm">
                    Calificar
                  </button>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Stepper de 5 Pasos del Ciclo de Vida -->
          ${!isCancelled ? `
            <div class="pt-3 border-t border-[#D6D3C9]">
              <div class="stepper-container">
                <div class="stepper-progress-bg">
                  <div class="stepper-progress-fill" style="width: ${progressPct}%;"></div>
                </div>

                <!-- Paso 1 -->
                <div class="stepper-node">
                  <div class="stepper-dot ${getDotClass(step1)}">${getDotIcon(step1, 1)}</div>
                  <span class="stepper-label ${getLabelClass(step1)}">1. Reserva Creada</span>
                </div>

                <!-- Paso 2 -->
                <div class="stepper-node">
                  <div class="stepper-dot ${getDotClass(step2)}">${getDotIcon(step2, 2)}</div>
                  <span class="stepper-label ${getLabelClass(step2)}">2. Pagada / Cuotas</span>
                </div>

                <!-- Paso 3 -->
                <div class="stepper-node">
                  <div class="stepper-dot ${getDotClass(step3)}">${getDotIcon(step3, 3)}</div>
                  <span class="stepper-label ${getLabelClass(step3)}">3. En Faena</span>
                </div>

                <!-- Paso 4 -->
                <div class="stepper-node">
                  <div class="stepper-dot ${getDotClass(step4)}">${getDotIcon(step4, 4)}</div>
                  <span class="stepper-label ${getLabelClass(step4)}">4. Retorno</span>
                </div>

                <!-- Paso 5 -->
                <div class="stepper-node">
                  <div class="stepper-dot ${getDotClass(step5)}">${getDotIcon(step5, 5)}</div>
                  <span class="stepper-label ${getLabelClass(step5)}">5. Fianza Reintegrada</span>
                </div>
              </div>
            </div>
          ` : `
            <div class="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
               Esta reserva se encuentra cancelada o rechazada.
            </div>
          `}

          <!-- Barra de Cuotas y Botón para Modal de Cuotas (Si aplica EN_CUOTAS) -->
          ${isEnCuotas ? `
            <div class="p-3 bg-[#FFF5F0]/60 border border-[#D6D3C9] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-2">
                <span><svg class="w-4 h-4 text-[#D94E1F] inline shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg></span>
                <div>
                  <span class="font-extrabold text-blue-900 block">Plan de Financiamiento en Cuotas Activo</span>
                  <span class="text-slate-600">Financiado a ${r.installmentCount || 3} cuotas mensuales / quincenales</span>
                </div>
              </div>
              <button type="button" onclick="App.openInstallmentsModal(${r.id}, '${r.reservationCode}')" class="px-3.5 py-1.5 bg-[#181816] hover:bg-[#D94E1F] text-white text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5">
                Ver / Pagar Cuotas
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // Modal de Cronograma de Cuotas (Modal 9)
  async function openInstallmentsModal(reservationId, reservationCode) {
    const modal = document.getElementById('modal-installments');
    const tableBody = document.getElementById('inst-table-body');
    if (!modal || !tableBody) return;

    modal.classList.remove('hidden');
    document.getElementById('inst-res-code').textContent = reservationCode || `RES-${reservationId}`;
    tableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400">Consultando cronograma contable de cuotas...</td></tr>';

    try {
      const summary = await API.payments.getInstallments(reservationId);
      document.getElementById('inst-summary-total').textContent = formatCOP(summary.totalAmount);
      document.getElementById('inst-summary-paid').textContent = formatCOP(summary.paidAmount);
      document.getElementById('inst-summary-pending').textContent = formatCOP(summary.pendingBalance);
      document.getElementById('inst-summary-progress').textContent = `${summary.paidInstallments} / ${summary.totalInstallments}`;

      const items = summary.installments || [];
      if (items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-slate-400">Esta reserva no registra plan de cuotas pendiente.</td></tr>';
        return;
      }

      tableBody.innerHTML = items.map(inst => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3 px-3 font-bold text-slate-900">Cuota ${inst.installmentNumber}/${summary.totalInstallments}</td>
          <td class="py-3 px-3 font-mono text-slate-600">${formatDate(inst.dueDate)}</td>
          <td class="py-3 px-3 text-right font-mono font-bold text-slate-900">${formatCOP(inst.amount)}</td>
          <td class="py-3 px-3 text-right font-mono text-slate-600">${formatCOP(inst.interestAmount)}</td>
          <td class="py-3 px-3 text-center">
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${inst.status === 'PAGADA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${inst.status}
            </span>
          </td>
          <td class="py-3 px-3 text-right">
            ${inst.status === 'PENDIENTE' ? `
              <button type="button" onclick="App.payInstallmentAction(${inst.id}, ${reservationId}, '${reservationCode}')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm">
                Pagar Cuota
              </button>
            ` : `
              <span class="text-emerald-600 font-bold text-xs">Pagada (${formatDate(inst.paidAt)})</span>
            `}
          </td>
        </tr>
      `).join('');
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-rose-500">Error al cargar cronograma: ${err.message}</td></tr>`;
    }
  }

  async function payInstallmentAction(installmentId, reservationId, reservationCode) {
    if (!confirm('¿Deseas procesar el pago de esta cuota ahora?')) return;
    try {
      await API.payments.payInstallment(installmentId);
      toast('Cuota pagada exitosamente. Saldo actualizado.', 'success');
      await openInstallmentsModal(reservationId, reservationCode);
      loadClientDashboard();
    } catch (err) {
      toast('Error al pagar cuota: ' + err.message, 'error');
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

      renderProviderCharts(metrics);
      renderProviderReservationsList();

      // Tabla de catálogo de herramientas del proveedor
      const toolsContainer = document.getElementById('provider-tools-list');
      if (toolsContainer) {
        toolsContainer.innerHTML = tools.map(t => `
          <div class="p-3 bg-white rounded-xl border border-[#D6D3C9] flex justify-between items-center text-xs">
            <div class="flex items-center gap-3">
              <img src="${t.mainImageUrl || 'images/tools/HERR-0001.jpg'}" class="w-10 h-10 rounded-lg object-cover" onerror="this.src='images/tools/HERR-0001.jpg'">
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

  function filterProviderReservations(status) {
    state.providerFilterStatus = status;
    const btns = document.querySelectorAll('.prov-status-btn');
    btns.forEach(b => {
      const match = b.getAttribute('onclick')?.includes(`'${status}'`);
      b.className = match
        ? 'prov-status-btn px-2.5 py-1 rounded-lg bg-[#232320] text-white'
        : 'prov-status-btn px-2.5 py-1 rounded-lg text-slate-600 hover:bg-white';
    });
    renderProviderReservationsList();
  }

  function renderProviderReservationsList() {
    const resContainer = document.getElementById('provider-reservations-list');
    if (!resContainer) return;

    let list = state.providerReservations || [];
    if (state.providerFilterStatus && state.providerFilterStatus !== 'all') {
      list = list.filter(r => r.status === state.providerFilterStatus);
    }

    if (list.length === 0) {
      resContainer.innerHTML = '<div class="p-6 text-center text-slate-400">No hay reservas con ese estado actualmente.</div>';
      return;
    }

    resContainer.innerHTML = list.map(r => `
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

  function renderProviderCharts(metrics) {
    if (typeof Chart === 'undefined') return;

    // 1. Gráfico de ingresos mensuales del proveedor
    const revCanvas = document.getElementById('chart-prov-revenue');
    if (revCanvas) {
      if (state.providerCharts.revenue) state.providerCharts.revenue.destroy();
      const monthly = metrics.monthlyEarnings || [];
      const labels = monthly.map(m => m.month || 'Mes');
      const data = monthly.map(m => Number(m.earnings) || 0);

      state.providerCharts.revenue = new Chart(revCanvas, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['Mes Actual'],
          datasets: [{
            label: 'Ingresos COP',
            data: data.length > 0 ? data : [metrics.totalEarnings || 0],
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: v => '$' + Number(v).toLocaleString('es-CO') }
            }
          }
        }
      });
    }

    // 2. Gráfico de disponibilidad de flota del proveedor
    const statusCanvas = document.getElementById('chart-prov-status');
    if (statusCanvas) {
      if (state.providerCharts.status) state.providerCharts.status.destroy();
      state.providerCharts.status = new Chart(statusCanvas, {
        type: 'pie',
        data: {
          labels: ['En Alquiler', 'Mantenimiento', 'Disponibles'],
          datasets: [{
            data: [
              metrics.rentedTools || 0,
              metrics.maintenanceTools || 0,
              Math.max(0, (metrics.totalTools || 0) - (metrics.rentedTools || 0) - (metrics.maintenanceTools || 0))
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
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
            <div class="font-extrabold text-[#D94E1F]">${formatCOP(t.revenueGenerated)}</div>
          </div>
        `).join('');
      }

      // Top 5 Clientes Frecuentes
      const topClientsEl = document.getElementById('adm-top-clients-list');
      if (topClientsEl) {
        if (dash.topClients && dash.topClients.length > 0) {
          topClientsEl.innerHTML = dash.topClients.map((c, idx) => `
            <div class="py-3 flex items-center justify-between text-xs">
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-lg ${idx === 0 ? 'bg-[#D94E1F] text-white font-black' : 'bg-slate-100 text-slate-700 font-bold'} flex items-center justify-center text-[11px]">
                  #${idx + 1}
                </span>
                <div>
                  <strong class="text-slate-900 text-sm block">${c.clientName}</strong>
                  <span class="text-slate-500 text-[11px] font-mono">${c.documentNumber || c.email} &bull; ${c.rentalCount} contratos completados</span>
                </div>
              </div>
              <div class="text-right">
                <span class="font-mono font-black text-slate-900">${formatCOP(c.totalPaid)}</span>
                <span class="text-[10px] text-emerald-600 font-bold block">Facturación Acumulada</span>
              </div>
            </div>
          `).join('');
        } else {
          topClientsEl.innerHTML = '<div class="py-4 text-center text-slate-400">Sin historial de clientes frecuentes aún.</div>';
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
    } catch (err) {
      toast('Error cargando métricas globales: ' + err.message, 'error');
    }
  }

  function renderAdminCharts(dash) {
    if (typeof Chart === 'undefined') return;

    // 1. Gráfica de ingresos mensuales
    const revCanvas = document.getElementById('chart-adm-revenue');
    if (revCanvas) {
      if (state.adminCharts.revenue) state.adminCharts.revenue.destroy();
      const monthly = dash.monthlyRevenue || [];
      const labels = monthly.map(m => m.month || 'Mes');
      const data = monthly.map(m => Number(m.revenue) || 0);

      state.adminCharts.revenue = new Chart(revCanvas, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['Sin datos'],
          datasets: [{
            label: 'Ingresos Netos (COP)',
            data: data.length > 0 ? data : [0],
            backgroundColor: 'rgba(245, 158, 11, 0.85)',
            borderColor: '#d97706',
            borderRadius: 8,
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: v => '$' + Number(v).toLocaleString('es-CO') }
            }
          }
        }
      });
    }

    // 2. Gráfica de flota nacional
    const fleetCanvas = document.getElementById('chart-adm-fleet');
    if (fleetCanvas) {
      if (state.adminCharts.fleet) state.adminCharts.fleet.destroy();
      const rented = dash.activeRentals || 0;
      const total = dash.totalTools || 0;
      const available = Math.max(0, total - rented);

      state.adminCharts.fleet = new Chart(fleetCanvas, {
        type: 'doughnut',
        data: {
          labels: ['En Obra (Alquiladas)', 'Disponibles en Patio'],
          datasets: [{
            data: [rented, available],
            backgroundColor: ['#10b981', '#f59e0b'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
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
      toast('Reporte CSV de reservas descargado con éxito.', 'success');
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
      toast('Auditoría global exportada a CSV con éxito.', 'success');
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

  // Abrir Modal de Factura Electrónica Imprimible con QRious
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

      // Generar código QR dinámico con QRious
      const canvas = document.getElementById('inv-qr-canvas');
      if (canvas && typeof QRious !== 'undefined') {
        new QRious({
          element: canvas,
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

  // Modal Pagos con Tarjeta Interactiva y Cuotas
  function openPaymentModal(reservationId, code, amount) {
    state.activeReservationForPayment = { id: reservationId, code, amount };
    document.getElementById('pay-res-code').textContent = code;
    document.getElementById('pay-res-amount').textContent = formatCOP(amount);

    const nameInput = document.getElementById('pay-card-holder');
    if (nameInput) {
      nameInput.value = (state.profile?.displayName || 'CONSTRUCTORA ANDINA S.A.S.').toUpperCase();
    }
    const instSelect = document.getElementById('pay-installments-count');
    if (instSelect) {
      instSelect.value = '1';
    }

    onCardInputChanged();
    onInstallmentsCountChange('1');
    document.getElementById('modal-payment').classList.remove('hidden');
  }

  function onCardInputChanged() {
    const numInput = document.getElementById('pay-card-number');
    const holderInput = document.getElementById('pay-card-holder');
    const expiryInput = document.getElementById('pay-card-expiry');
    const previewNum = document.getElementById('preview-card-number');
    const previewHolder = document.getElementById('preview-card-holder');
    const previewExpiry = document.getElementById('preview-card-expiry');
    const previewBrand = document.getElementById('preview-card-brand');

    if (numInput && previewNum) {
      let val = numInput.value.replace(/\D/g, '').substring(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
      if (val !== numInput.value.replace(/\s/g, '')) {
        numInput.value = formatted;
      }
      previewNum.textContent = formatted || '4532 •••• •••• 2026';

      if (previewBrand) {
        if (val.startsWith('4')) previewBrand.textContent = 'VISA INDUSTRIAL';
        else if (val.startsWith('5')) previewBrand.textContent = 'MASTERCARD CORP';
        else if (val.startsWith('3')) previewBrand.textContent = 'AMEX HEAVY FLEET';
        else previewBrand.textContent = 'VISA / MASTERCARD';
      }
    }

    if (holderInput && previewHolder) {
      previewHolder.textContent = holderInput.value.toUpperCase() || 'EMPRESA / CONTRATISTA';
    }

    if (expiryInput && previewExpiry) {
      let exp = expiryInput.value.replace(/\D/g, '').substring(0, 4);
      if (exp.length >= 3) {
        exp = exp.substring(0, 2) + '/' + exp.substring(2);
      }
      expiryInput.value = exp;
      previewExpiry.textContent = exp || '12/28';
    }
  }

  function onPaymentMethodChange(method) {
    const cardInputs = document.getElementById('card-inputs-container');
    const cardPreview = document.querySelector('.card-interactive-preview');
    const instSelector = document.getElementById('pay-installments-count')?.closest('div');
    if (method === 'TARJETA_CREDITO') {
      if (cardInputs) cardInputs.classList.remove('hidden');
      if (cardPreview) cardPreview.classList.remove('hidden');
      if (instSelector) instSelector.classList.remove('hidden');
    } else {
      if (cardInputs) cardInputs.classList.add('hidden');
      if (cardPreview) cardPreview.classList.add('hidden');
      if (instSelector) instSelector.classList.add('hidden');
      onInstallmentsCountChange('1');
    }
  }

  function onInstallmentsCountChange(countVal) {
    const count = Number(countVal) || 1;
    const totalAmount = state.activeReservationForPayment?.amount || 0;
    const simBox = document.getElementById('pay-installments-simulation');
    const simTotal = document.getElementById('pay-sim-total');
    const simList = document.getElementById('pay-sim-schedule-list');
    if (!simBox || !simTotal || !simList) return;

    if (count === 1) {
      simBox.classList.add('hidden');
      return;
    }

    simBox.classList.remove('hidden');
    const interestRate = (count <= 3) ? 0.0 : 0.018; // 0% 1-3, 1.8% 6-12
    const totalWithInterest = count <= 3 ? totalAmount : Math.round(totalAmount * (1 + interestRate * count));
    const quotaAmount = Math.round(totalWithInterest / count);

    simTotal.textContent = `${formatCOP(totalWithInterest)} (${count <= 3 ? '0% Interés' : '1.8% mes vencido'})`;

    let html = '';
    const now = new Date();
    for (let i = 1; i <= count; i++) {
      const dueDate = new Date(now);
      if (count === 2) {
        dueDate.setDate(dueDate.getDate() + (i * 15));
      } else {
        dueDate.setMonth(dueDate.getMonth() + i);
      }
      html += `
        <div class="flex justify-between items-center py-1 border-b border-[#D6D3C9] last:border-0 text-[10px]">
          <span class="font-bold text-slate-700">Cuota ${i}/${count}:</span>
          <span class="text-slate-500">${formatDate(dueDate.toISOString().split('T')[0])}</span>
          <span class="font-mono font-bold text-slate-900">${formatCOP(quotaAmount)}</span>
        </div>
      `;
    }
    simList.innerHTML = html;
  }

  async function processPaymentSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!state.activeReservationForPayment) return;

    const resId = state.activeReservationForPayment.id;
    const method = document.getElementById('pay-method').value;
    const cardMasked = document.getElementById('pay-card-number')?.value.slice(-4)
      ? `****-****-****-${document.getElementById('pay-card-number').value.slice(-4)}`
      : '4532-****-****-2026';
    const installmentCount = Number(document.getElementById('pay-installments-count')?.value || 1);

    const submitBtn = document.getElementById('btn-submit-payment');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Procesando pago seguro...</span>';
    }

    try {
      await API.payments.processPayment({
        reservationId: resId,
        clientId: state.profile.clientId,
        paymentMethod: method,
        amount: state.activeReservationForPayment.amount,
        installmentCount: installmentCount,
        cardNumberMasked: cardMasked,
        gatewayReference: 'GW-SIM-' + Date.now()
      });

      closeModal('modal-payment');
      if (installmentCount > 1) {
        toast(`¡Pago procesado exitosamente!\nPlan financiado a ${installmentCount} cuotas activado.\nPrimera cuota liquidada.`, 'success');
      } else {
        toast('¡Pago procesado exitosamente!\nReserva confirmada y Factura emitida con 19% IVA.', 'success');
      }

      await loadClientDashboard();
      setTimeout(() => openInvoiceModal(resId), 400);
    } catch (err) {
      toast('Error al procesar el pago: ' + err.message, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Confirmar y Procesar Transacción</span>';
      }
    }
  }

  // Modales Despacho / Devolución con Validación EPP (4FN)
  async function openDeliveryModal(reservationId, code) {
    state.activeReservationForDelivery = { id: reservationId, code };
    document.getElementById('deliv-res-code').textContent = code;
    const checklist = document.getElementById('deliv-epp-checklist');

    if (checklist) {
      checklist.innerHTML = '<div class="text-slate-400 text-xs py-2">Consultando matriz de seguridad y EPP requeridos (4FN)...</div>';
    }

    document.getElementById('modal-delivery').classList.remove('hidden');

    try {
      const res = await API.reservations.getById(reservationId);
      const tool = await API.tools.getToolDetail(res.toolId);
      const reqs = tool.safetyRequirements || [];

      if (checklist) {
        if (reqs.length === 0) {
          checklist.innerHTML = `
            <div class="flex items-center gap-2">
              <input type="checkbox" id="epp-std" checked required class="w-4 h-4 text-[#D94E1F] accent-blue-600 epp-checkbox">
              <label for="epp-std" class="text-slate-700">EPP Estándar de Obra (Casco, Guantes, Botas con puntera de acero)</label>
            </div>
          `;
        } else {
          checklist.innerHTML = reqs.map((sr, idx) => `
            <div class="flex items-start gap-2">
              <input type="checkbox" id="epp-${idx}" required class="w-4 h-4 text-amber-500 mt-0.5 epp-checkbox">
              <label for="epp-${idx}" class="text-slate-700 font-medium">
                <strong>${sr.requirementName}:</strong> ${sr.description || 'Obligatorio en faena'}
              </label>
            </div>
          `).join('');
        }
      }
    } catch (e) {
      console.warn('Error cargando EPP:', e);
      if (checklist) {
        checklist.innerHTML = `
          <div class="flex items-center gap-2">
            <input type="checkbox" id="epp-std" checked required class="w-4 h-4 text-[#D94E1F] accent-blue-600 epp-checkbox">
            <label for="epp-std" class="text-slate-700">EPP General de Seguridad Verificado</label>
          </div>
        `;
      }
    }
  }

  async function submitDelivery(e) {
    e.preventDefault();
    const eppBoxes = document.querySelectorAll('.epp-checkbox');
    for (const box of eppBoxes) {
      if (!box.checked) {
        toast('Debes certificar todos los requisitos EPP de seguridad antes de despachar.', 'warning');
        return;
      }
    }

    try {
      await API.deliveries.startRental({
        reservationId: state.activeReservationForDelivery.id,
        deliveredBy: document.getElementById('deliv-by').value,
        initialConditionNotes: document.getElementById('deliv-notes').value,
        clientSignatureAck: document.getElementById('deliv-ack').checked
      });
      closeModal('modal-delivery');
      toast('Despacho registrado. Reserva en estado EN_CURSO.', 'success');
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
      toast('Devolución registrada e inspección técnica cerrada. Reserva FINALIZADA.', 'success');
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
        text.innerHTML = '<strong>Reembolso Total:</strong> Depósito en garantía reintegrado al 100% al cliente sin deducciones.';
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
        btn.classList.toggle('text-[#D94E1F]', t === tab);
        btn.classList.toggle('border-b-2', t === tab);
        btn.classList.toggle('border-[#D94E1F]', t === tab);
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

  function openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('hidden');
  }

  function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('hidden');
  }

  async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    const currentPass = document.getElementById('cp-current').value;
    const newPass = document.getElementById('cp-new').value;
    const confirmPass = document.getElementById('cp-confirm').value;

    if (newPass !== confirmPass) {
      toast('La confirmación de la nueva contraseña no coincide.', 'error');
      return;
    }

    try {
      await API.auth.changePassword(currentPass, newPass, confirmPass);
      closeModal('modal-change-password');
      const form = document.getElementById('form-change-password');
      if (form) form.reset();
      toast('¡Contraseña actualizada exitosamente! Usa tu nueva clave para el próximo ingreso.', 'success');
    } catch (err) {
      toast(err.message, 'error');
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
    // Temas y Notificaciones
    toggleTheme,
    toggleFavorite,
    toggleFavoritesFilter,
    toggleNotificationsPanel,
    markAllNotificationsRead,
    markNotificationRead,
    // Cotización Activa (Quote Cart & Drawer)
    updateQuoteCartBadge,
    toggleQuoteDrawer,
    addToQuoteCart,
    addComboToQuoteCart,
    removeFromQuoteCart,
    updateQuoteCartDays,
    renderQuoteCart,
    checkoutQuoteDrawer,
    // Selector de Patio y Despacho
    openLocationModal,
    setDeliveryLocation,
    // Búsqueda Omnicanal
    onOmniCategoryChange,
    onOmniSearchKeyup,
    performOmniSearch,
    // Filtros Facetados & Switcher de Vista
    renderFacetedFilters,
    onFacetedCategoryChange,
    onFacetedBrandChange,
    onRetieFilterChange,
    applyPriceFilter,
    toggleCatalogViewMode,
    renderToolsList,
    renderToolsGrid,
    // Catálogo & Comparador 4FN
    resetFilters,
    renderCategoryChips,
    filterByCategoryChip,
    filterByCategoryQuick,
    scrollToInventory,
    onSortChange,
    onOnlyAvailableChange,
    toggleCompare,
    clearCompareList,
    openComparatorModal,
    selectAndRentFromComparator,
    // Detalle, Cotización y Comentarios Q&A
    openToolDetail,
    selectDateFromCalendar,
    recalculateRentalPrice,
    submitReservation,
    openFormalQuoteModal,
    submitComment,
    replyCommentPrompt,
    refreshToolComments,
    // Navegación & Autenticación
    navigateView,
    openCategoryInCatalog,
    onHomeCalcChange,
    toggleFaq,
    quickClientDemoLogin,
    openAuthModal,
    switchAuthTab,
    autofillDemo,
    openModal,
    closeModal,
    handleChangePasswordSubmit,
    // Panel Cliente y Filtros
    filterClientReservations,
    onClientSearchInput,
    cancelReservationAction,
    openInstallmentsModal,
    payInstallmentAction,
    // Pagos con Tarjeta y Cuotas
    openPaymentModal,
    onCardInputChanged,
    onPaymentMethodChange,
    onInstallmentsCountChange,
    processPaymentSubmit,
    // Despacho, Devolución y EPP 4FN
    openDeliveryModal,
    submitDelivery,
    openReturnModal,
    submitReturn,
    // Proveedor & Admin
    filterProviderReservations,
    approveReservationAction,
    rejectReservationAction,
    updateToolStatusAction,
    exportProviderReservationsCSV,
    exportAdminReservationsCSV,
    // Facturación, Garantía & Reseñas
    openInvoiceModal,
    downloadInvoiceAction: openInvoiceModal,
    openSettlementModal,
    openReviewModal,
    setReviewRating,
    submitReview
  };
})();

// Iniciar al cargar el DOM
document.addEventListener('DOMContentLoaded', App.init);
