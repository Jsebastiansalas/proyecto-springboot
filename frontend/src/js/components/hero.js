/**
 * Componente Hero Industrial de Telemetría y Capacidad Operativa
 * Conforme a Frontend UI Engineering (Content-first, sin clichés de IA)
 */

export function initHero() {
  const container = document.getElementById('hero-container');
  if (!container) return;

  container.innerHTML = `
    <section class="industrial-hero py-12 px-4 sm:px-6 lg:px-8 relative">
      <div class="industrial-hero-pattern"></div>
      <div class="max-w-7xl mx-auto relative z-10">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Columna Izquierda: Mensaje Central y Compromiso Operativo -->
          <div class="lg:col-span-8">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold tracking-wider uppercase mb-4">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              SISTEMA INTEGRAL DE LOGÍSTICA &amp; RENTA PESADA
            </div>
            
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase leading-none">
              FLOTA INDUSTRIAL <span class="text-amber-500">&amp; EQUIPOS</span> PARA OBRA CIVIL
            </h1>
            
            <p class="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl font-sans leading-relaxed">
              Disponibilidad inmediata en patio con certificación técnica RETIE, actas digitales de entrega en faena y póliza de daño accidental incluida en cada contrato.
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-4">
              <a href="#catalog-section" class="btn-industrial btn-primary btn-lg">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explorar Equipos en Patio
              </a>
              <button id="hero-quick-calc-btn" type="button" class="btn-industrial btn-secondary btn-lg">
                <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculadora de Faena
              </button>
            </div>
          </div>

          <!-- Columna Derecha: Tarjeta de Telemetría de Patio -->
          <div class="lg:col-span-4">
            <div class="bg-[#0c1017]/90 border border-slate-700/80 rounded-xl p-5 shadow-2xl backdrop-blur-md">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <span class="font-display font-bold text-sm tracking-wider uppercase text-amber-400">TELEMETRÍA DE PATIO</span>
                <span class="font-mono text-xs text-slate-400">EN VIVO</span>
              </div>
              
              <div class="mt-4 space-y-3 font-mono text-xs">
                <div class="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <span class="text-slate-400">DISPONIBILIDAD TOTAL</span>
                  <span class="font-bold text-emerald-400">20 / 20 CATEGORÍAS</span>
                </div>
                <div class="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <span class="text-slate-400">TIEMPO PROMEDIO DESPACHO</span>
                  <span class="font-bold text-white">2.4 HORAS</span>
                </div>
                <div class="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <span class="text-slate-400">COBERTURA REGIONAL</span>
                  <span class="font-bold text-amber-400">BOGOTÁ Y SABANA</span>
                </div>
                <div class="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <span class="text-slate-400">PÓLIZA ALL-RISK</span>
                  <span class="font-bold text-emerald-400">ACTIVA</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  `;

  container.querySelector('#hero-quick-calc-btn')?.addEventListener('click', () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

export default initHero;
