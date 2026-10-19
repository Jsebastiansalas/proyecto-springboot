/**
 * Modal de Autenticación Unificado (Login, Registro Cliente y Proveedor)
 * Conforme a Impeccable Design & Security-First Patterns
 */

import state from '../modules/state.js';
import API from '../api.js';
import Toast from '../modules/toast.js';

export function initAuthModal() {
  const container = document.getElementById('auth-modal-container');
  if (!container) return;

  function render(initialTab = 'login') {
    container.innerHTML = `
      <div id="auth-modal-overlay" class="modal-overlay active">
        <div class="modal-dialog max-w-md">
          
          <div class="p-5 border-b border-hairline flex items-center justify-between">
            <div>
              <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">CONTROL DE ACCESO</span>
              <h3 class="font-display font-black text-2xl uppercase tracking-tight text-main leading-tight">Credenciales de Operación</h3>
            </div>
            <button id="close-auth-modal-btn" type="button" class="btn-industrial btn-ghost p-2 rounded-full" aria-label="Cerrar Acceso">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6">
            
            <!-- Selector de Pestañas -->
            <div class="segmented-control w-full mb-6">
              <button type="button" class="segmented-item flex-1 text-center justify-center ${initialTab === 'login' ? 'active' : ''}" data-tab="login">
                Iniciar Sesión
              </button>
              <button type="button" class="segmented-item flex-1 text-center justify-center ${initialTab === 'register' ? 'active' : ''}" data-tab="register">
                Nuevo Operador
              </button>
            </div>

            <!-- Tab: Iniciar Sesión -->
            <form id="auth-login-form" class="space-y-4 ${initialTab === 'login' ? '' : 'hidden'}">
              <div>
                <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Correo Electrónico</label>
                <input id="login-email" type="email" placeholder="operador@rentamaq.com" class="input-industrial" required />
              </div>
              <div>
                <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Contraseña</label>
                <input id="login-password" type="password" placeholder="••••••••" class="input-industrial" required />
              </div>

              <!-- Cuentas de Acceso Rápido para Pruebas -->
              <div class="p-3 bg-surface-subtle rounded border border-hairline font-mono text-[11px] text-muted space-y-1">
                <span class="font-bold text-amber-500 block uppercase">Credenciales Rápidas del Sistema:</span>
                <div class="cursor-pointer hover:text-amber-500 transition-colors" data-demo="admin">
                  &bull; <strong>Admin:</strong> admin@rentamaq.com
                </div>
                <div class="cursor-pointer hover:text-amber-500 transition-colors" data-demo="provider">
                  &bull; <strong>Proveedor:</strong> proveedor@rentamaq.com
                </div>
                <div class="cursor-pointer hover:text-amber-500 transition-colors" data-demo="client">
                  &bull; <strong>Cliente:</strong> cliente@empresa.com
                </div>
              </div>

              <button id="login-submit-btn" type="submit" class="btn-industrial btn-primary w-full mt-4">
                Ingresar a la Plataforma
              </button>
            </form>

            <!-- Tab: Registro de Cliente -->
            <form id="auth-register-form" class="space-y-3.5 ${initialTab === 'register' ? '' : 'hidden'}">
              <div>
                <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Nombre Completo o Razón Social</label>
                <input id="reg-name" type="text" placeholder="Constructora Bolívar S.A." class="input-industrial" required />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Documento / NIT</label>
                  <input id="reg-doc" type="text" placeholder="901234567" class="input-industrial mono" required />
                </div>
                <div>
                  <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Teléfono</label>
                  <input id="reg-phone" type="tel" placeholder="3101234567" class="input-industrial mono" required />
                </div>
              </div>
              <div>
                <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Correo Electrónico</label>
                <input id="reg-email" type="email" placeholder="contacto@constructora.com" class="input-industrial" required />
              </div>
              <div>
                <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Contraseña de Acceso</label>
                <input id="reg-password" type="password" placeholder="Mínimo 8 caract, mayús, núm, símb" class="input-industrial" required />
                <div id="password-strength-bar" class="h-1 bg-slate-700 rounded mt-1.5 overflow-hidden">
                  <div id="password-strength-fill" class="h-full bg-rose-500 w-0 transition-all"></div>
                </div>
              </div>

              <button id="register-submit-btn" type="submit" class="btn-industrial btn-primary w-full mt-2">
                Crear Cuenta de Operador
              </button>
            </form>

          </div>

        </div>
      </div>
    `;

    // Cambio de Pestañas
    container.querySelectorAll('.segmented-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        render(tab);
      });
    });

    // Rellenar credenciales demo
    container.querySelectorAll('[data-demo]').forEach(el => {
      el.addEventListener('click', () => {
        const type = el.getAttribute('data-demo');
        const emailInput = container.querySelector('#login-email');
        const passInput = container.querySelector('#login-password');
        if (type === 'admin') {
          emailInput.value = 'admin@rentamaq.com';
          passInput.value = 'Admin#Renta2026!SecOps';
        } else if (type === 'provider') {
          emailInput.value = 'proveedor@rentamaq.com';
          passInput.value = 'Proveedor#Renta2026!Sec';
        } else {
          emailInput.value = 'cliente@empresa.com';
          passInput.value = 'Cliente#Renta2026!Sec';
        }
      });
    });

    // Cerrar Modal
    const closeModal = () => { container.innerHTML = ''; };
    container.querySelector('#close-auth-modal-btn')?.addEventListener('click', closeModal);
    container.querySelector('#auth-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'auth-modal-overlay') closeModal();
    });

    // Envío Login
    container.querySelector('#auth-login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = container.querySelector('#login-email').value.trim();
      const pass = container.querySelector('#login-password').value;

      try {
        const res = await API.auth.login(email, pass);
        state.setUser(res);
        Toast.success('Acceso Autorizado', `Bienvenido, ${res.fullName || res.email}.`);
        closeModal();

        // Redirigir según rol
        if (res.role === 'ADMIN') state.setView('admin');
        else if (res.role === 'PROVIDER') state.setView('provider');
        else state.setView('client');
      } catch (err) {
        Toast.error('Acceso Denegado', err.message || 'Credenciales incorrectas.');
      }
    });

    // Envío Registro
    container.querySelector('#auth-register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const clientData = {
        fullName: container.querySelector('#reg-name').value.trim(),
        documentNumber: container.querySelector('#reg-doc').value.trim(),
        documentType: 'NIT',
        phone: container.querySelector('#reg-phone').value.trim(),
        address: 'Bogotá D.C. Obra Civil',
        email: container.querySelector('#reg-email').value.trim(),
        password: container.querySelector('#reg-password').value
      };

      try {
        const res = await API.auth.registerClient(clientData);
        state.setUser(res);
        Toast.success('Operador Registrado', 'Cuenta creada y sesión iniciada exitosamente.');
        closeModal();
        state.setView('client');
      } catch (err) {
        Toast.error('Error al Registrar', err.message || 'No fue posible completar el registro.');
      }
    });
  }

  window.addEventListener('modal:open', (e) => {
    if (e.detail?.modal === 'auth') {
      render(e.detail.tab || 'login');
    }
  });
}

export default initAuthModal;
