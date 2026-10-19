/**
 * Entrypoint Principal de la Aplicación RentaMaq
 * Conforme a Impeccable Architecture, Clean Components y Reactividad
 */

import '../css/app.css';
import API from './api.js';
import state from './modules/state.js';
import Toast from './modules/toast.js';

import initNavbar from './components/navbar.js';
import initHero from './components/hero.js';
import initCatalog from './components/catalog.js';
import initToolModal from './components/toolModal.js';
import initCheckoutModal from './components/checkoutModal.js';
import initAuthModal from './components/authModal.js';
import initDashboards from './components/dashboards.js';
import initDeliveryReturnModals from './components/deliveryReturnModals.js';
import initComparisonModal from './components/comparisonModal.js';

// Inicialización de la Aplicación
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[RentaMaq] Inicializando sistema de diseño industrial...');

  // 1. Inicializar Componentes de UI
  initNavbar();
  initHero();
  initCatalog();
  initToolModal();
  initCheckoutModal();
  initAuthModal();
  initDashboards();
  initDeliveryReturnModals();
  initComparisonModal();

  // 2. Carga Inicial de Datos desde la API REST
  try {
    const [categories, tools] = await Promise.all([
      API.tools.getCategories(),
      API.tools.getAll()
    ]);

    state.setCategories(categories);
    state.setTools(tools);
    console.log(`[RentaMaq] Datos cargados: ${categories.length} categorías, ${tools.length} herramientas.`);
  } catch (err) {
    console.error('[RentaMaq] Error al cargar inventario de faena:', err);
    Toast.error('Conexión con Patio Central', 'No fue posible sincronizar el inventario en tiempo real.');
  }

  // 3. Sondeo Periódico de Notificaciones
  async function pollNotifications() {
    const user = state.get().user;
    if (!user) return;
    try {
      const notifs = await API.notifications.getMyNotifications();
      state.data.notifications = notifs;
      state.data.unreadNotifCount = notifs.filter(n => !n.read).length;
      state.emit('notifications:loaded', notifs);
    } catch {
      // Ignorar errores en sondeo de fondo
    }
  }

  pollNotifications();
  setInterval(pollNotifications, 30000);
});
