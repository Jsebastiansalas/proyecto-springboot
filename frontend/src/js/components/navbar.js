/**
 * Componente Navbar de Ingeniería y Selector de Obras
 * Conforme a Impeccable Design & Apple Direct Manipulation
 */

import state from '../modules/state.js';
import API from '../api.js';

export function initNavbar() {
  const headerContainer = document.getElementById('navbar-container');
  if (!headerContainer) return;

  function render() {
    const { user, theme, currentView, unreadNotifCount, obras, selectedObraId } = state.get();
    const role = user ? user.role : null;
    const currentObra = state.getSelectedObra();

    headerContainer.innerHTML = `
      <!-- 1. BARRA SUPERIOR DE TELEMETRÍA Y SEGURIDAD INDUSTRIAL EN OBRA -->
      <aside aria-label="Telemetría de Faena" class="telemetry-ticker hidden md:block">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-400 status-indicator-dot pulse"></span>
              PATIO CENTRAL BOGOTÁ &bull; 100% OPERATIVO
            </span>
            <span class="text-slate-600">//</span>
            <span class="text-slate-300">DESPACHO A CAMPAMENTO DE OBRA &lt; 3H</span>
            <span class="text-slate-600">//</span>
            <span class="text-amber-400 font-bold">SEGURIDAD SST: CERO INCIDENTES (184 DÍAS) &bull; RETIE 100%</span>
          </div>
          <div class="flex items-center gap-4 text-slate-400">
            <span>CENTRAL LOGÍSTICA: <strong class="text-white font-mono">(601) 745-0000</strong></span>
            <span class="text-slate-600">•</span>
            <span>RADIO FAENA: CANAL 4 VHF</span>
          </div>
        </div>
      </aside>

      <!-- 2. NAVEGACIÓN PRINCIPAL DE LA CONSTRUCTORA -->
      <header class="app-header">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
          
          <!-- Lado Izquierdo: Logotipo y Selector de Proyecto/Obra -->
          <div class="w-full md:w-auto flex items-center justify-between gap-4">
            
            <div id="nav-brand-logo" class="flex items-center gap-3 cursor-pointer select-none group">
              <div class="w-10 h-10 bg-gradient-to-br from-[#0c1017] to-[#1e293b] text-amber-500 rounded flex items-center justify-center shadow-md border border-slate-700 group-hover:border-amber-500 transition-colors">
                <svg class="w-6 h-6 transform group-hover:scale-105 transition-transform" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2.5L28 9.5V22.5L16 29.5L4 22.5V9.5L16 2.5Z" stroke="#f59e0b" stroke-width="2" stroke-linejoin="round" fill="#0c1017"/>
                  <path d="M10.5 8.5H18C20.5 8.5 22 9.8 22 12C22 13.8 20.8 15 18.8 15.3L22.5 22.5H19L15.6 16.5H13.2V22.5H10.5V8.5Z" fill="#f59e0b"/>
                  <circle cx="23.5" cy="8.5" r="1.8" fill="#fbbf24"/>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-1.5 leading-none">
                  <span class="text-2xl font-black font-display tracking-wider text-main">RENTA<span class="text-amber-500">MAQ</span></span>
                  <span class="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-slate-950 rounded">HEAVY FLEET</span>
                </div>
                <div class="text-[9.5px] font-mono font-bold uppercase tracking-widest text-muted mt-0.5">SISTEMA INDUSTRIAL DE CONSTRUCCIÓN</div>
              </div>
            </div>

            <!-- Selector de Obra Activa de la Constructora -->
            <div class="relative hidden sm:block">
              <select id="navbar-obra-select" class="obra-selector-pill pr-7 font-mono text-xs">
                ${obras.map(o => `
                  <option value="${o.id}" ${o.id === selectedObraId ? 'selected' : ''}>
                     Obra: ${o.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Botón Menú Móvil -->
            <button id="mobile-menu-toggle" type="button" class="md:hidden p-2 text-slate-400 hover:text-white" aria-label="Abrir Menú">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Selector de Vistas Segmentado (Estilo Procore / Linear) -->
          <nav aria-label="Vistas Principales" class="segmented-control">
            
            <button type="button" class="segmented-item ${currentView === 'home' ? 'active' : ''}" data-view="home">
              <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Catálogo de Maquinaria
            </button>

            <!-- Consola de Obra (Dashboard de la Constructora) -->
            <button type="button" class="segmented-item ${currentView === 'client' ? 'active' : ''}" data-view="client">
              <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Consola de Obra (Dashboard)
            </button>

            ${user && role === 'PROVIDER' ? `
              <button type="button" class="segmented-item ${currentView === 'provider' ? 'active' : ''}" data-view="provider">
                <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Despachos y Flota
              </button>
            ` : ''}

            ${user && role === 'ADMIN' ? `
              <button type="button" class="segmented-item ${currentView === 'admin' ? 'active' : ''}" data-view="admin">
                <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Control Room Admin
              </button>
            ` : ''}
          </nav>

          <!-- Acciones de Usuario & Tema -->
          <div class="flex items-center gap-3">
            
            <!-- Conmutador Tema Claro / Oscuro -->
            <button id="theme-toggle-btn" type="button" class="btn-industrial btn-ghost p-2" title="Alternar Modo Oscuro / Claro" aria-label="Cambiar Tema">
              ${theme === 'dark' ? `
                <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ` : `
                <svg class="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              `}
            </button>

            <!-- Campana de Notificaciones -->
            ${user ? `
              <button id="notif-toggle-btn" type="button" class="btn-industrial btn-ghost relative p-2" title="Notificaciones de Obra" aria-label="Notificaciones">
                <svg class="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                ${unreadNotifCount > 0 ? `
                  <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full status-indicator-dot pulse"></span>
                ` : ''}
              </button>
            ` : ''}

            <!-- Autenticación / Perfil de Ingeniero / Operador -->
            ${user ? `
              <div class="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-800">
                <div class="text-right hidden sm:block">
                  <div class="text-xs font-bold leading-tight text-main">${user.fullName || user.email}</div>
                  <div class="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">${user.role === 'CLIENT' ? 'CONSTRUCTORA AUTORIZADA' : user.role}</div>
                </div>
                <button id="logout-btn" type="button" class="btn-industrial btn-outline btn-sm" title="Cerrar sesión">
                  Salir
                </button>
              </div>
            ` : `
              <button id="login-open-btn" type="button" class="btn-industrial btn-primary btn-sm">
                Acceso Constructora / NIT
              </button>
            `}
          </div>
        </div>
      </header>
    `;

    // Eventos
    headerContainer.querySelector('#navbar-obra-select')?.addEventListener('change', (e) => {
      state.setObra(e.target.value);
    });

    headerContainer.querySelector('#nav-brand-logo')?.addEventListener('click', () => {
      state.setView('home');
    });

    headerContainer.querySelector('#theme-toggle-btn')?.addEventListener('click', () => {
      state.toggleTheme();
    });

    headerContainer.querySelectorAll('.segmented-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        if (view) state.setView(view);
      });
    });

    headerContainer.querySelector('#login-open-btn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'auth' } }));
    });

    headerContainer.querySelector('#logout-btn')?.addEventListener('click', () => {
      API.logout();
      state.setUser(null);
      state.setView('home');
    });
  }

  // Suscribirse a cambios de estado
  state.on('auth:change', render);
  state.on('theme:change', render);
  state.on('view:change', render);
  state.on('obra:change', render);

  // Render inicial
  render();
}

export default initNavbar;
