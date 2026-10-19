/**
 * Motor de Notificaciones Físicas estilo Sonner
 * Conforme a Emil Kowalski Animation Philosophy & Impeccable Design
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.ensureContainer();
  }

  ensureContainer() {
    if (!this.container) {
      this.container = document.getElementById('sonner-toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'sonner-toast-container';
        this.container.className = 'sonner-toast-container';
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
      }
    }
  }

  show({ type = 'info', title = '', message = '', duration = 4000 }) {
    this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = 'sonner-toast';
    toast.setAttribute('role', 'alert');

    // Iconos SVG según el tipo
    let iconSvg = '';
    let accentColor = '#f59e0b';

    if (type === 'success') {
      accentColor = '#10b981';
      iconSvg = `
        <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>`;
    } else if (type === 'error') {
      accentColor = '#ef4444';
      iconSvg = `
        <svg class="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>`;
    } else if (type === 'warning') {
      accentColor = '#f59e0b';
      iconSvg = `
        <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
    } else {
      accentColor = '#3b82f6';
      iconSvg = `
        <svg class="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="flex-1 min-w-0 pr-2">
        <h4 class="font-display font-bold text-sm text-white tracking-wide uppercase leading-tight">${title}</h4>
        ${message ? `<p class="font-sans text-xs text-slate-300 mt-0.5 leading-relaxed">${message}</p>` : ''}
      </div>
      <button type="button" class="text-slate-400 hover:text-white p-1 transition-colors" aria-label="Cerrar notificación">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="sonner-toast-progress" style="background-color: ${accentColor};"></div>
    `;

    // Cerrar al clic
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    // Entrada física
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Barra de progreso y temporizador de cierre
    const progressBar = toast.querySelector('.sonner-toast-progress');
    progressBar.style.transition = `width ${duration}ms linear`;
    requestAnimationFrame(() => {
      progressBar.style.width = '0%';
    });

    const timeout = setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    toast._timeout = timeout;
    return toast;
  }

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    clearTimeout(toast._timeout);
    toast.classList.remove('show');
    toast.classList.add('closing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 220);
  }

  success(title, message, duration = 4000) {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title, message, duration = 5000) {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title, message, duration = 4500) {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title, message, duration = 3500) {
    return this.show({ type: 'info', title, message, duration });
  }
}

export const Toast = new ToastManager();
export default Toast;
