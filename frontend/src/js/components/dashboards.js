/**
 * Consola de Mando de Faena y Dashboards de Obra (Constructora Pro)
 * Diseñado específicamente para Ingenieros Civiles, Residentes de Obra y Directores de Proyecto.
 * Conforme a Impeccable Craft & Frontend UI Engineering (High Information Density)
 */

import state from '../modules/state.js';
import API from '../api.js';
import Toast from '../modules/toast.js';

export function initDashboards() {
  const container = document.getElementById('dashboards-container');
  if (!container) return;

  const formatCOP = (n) => '$ ' + Number(n || 0).toLocaleString('es-CO') + ' COP';

  // 1. DASHBOARD CONSTRUCTORA (CENTRO DE OPERACIONES DE OBRA)
  async function renderConstructoraDashboard() {
    const { obras, selectedObraId } = state.get();
    const obra = state.getSelectedObra();

    // Estado local de la pestaña activa en el dashboard
    let activeTab = 'roster'; // 'roster' | 'horometros' | 'sst' | 'costos' | 'actas'

    function renderTabs() {
      container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <!-- BANNER DE ENCABEZADO DE OBRA Y CENTRO DE COSTOS -->
          <div class="p-6 rounded-xl bg-gradient-to-r from-[#0c1017] via-[#131926] to-[#0c1017] border border-slate-700 shadow-xl text-white mb-8 relative overflow-hidden">
            <div class="absolute right-0 top-0 w-96 h-full bg-amber-500/5 transform skew-x-12 pointer-events-none"></div>
            
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-bold text-[10px] uppercase tracking-wider">
                    PROYECTO ACTIVO EN FAENA
                  </span>
                  <span class="font-mono text-xs text-amber-400 font-bold">
                    ${obra.costCenter}
                  </span>
                  <span class="text-slate-600">//</span>
                  <span class="font-mono text-xs text-slate-400">
                    ID: ${obra.id}
                  </span>
                </div>

                <h1 class="text-2xl sm:text-3xl font-black font-display tracking-tight text-white uppercase leading-none">
                  ${obra.name}
                </h1>
                
                <div class="flex flex-wrap items-center gap-4 mt-2 font-mono text-xs text-slate-300">
                  <span> ${obra.address}</span>
                  <span class="text-slate-600">&bull;</span>
                  <span> Residente: <strong class="text-white">${obra.resident}</strong></span>
                  <span class="text-slate-600">&bull;</span>
                  <span class="text-emerald-400 font-bold"> PÓLIZA ALL-RISK RETIE VIGENTE</span>
                </div>
              </div>

              <!-- Selector Rápido de Obra y Botón de Despacho -->
              <div class="flex flex-wrap items-center gap-3">
                <select id="dash-obra-switch" class="input-industrial mono text-xs bg-slate-900 text-white border-slate-700 w-auto">
                  ${obras.map(o => `
                    <option value="${o.id}" ${o.id === selectedObraId ? 'selected' : ''}>
                       ${o.name}
                    </option>
                  `).join('')}
                </select>
                <button id="dash-solicitar-equipo-btn" type="button" class="btn-industrial btn-primary btn-sm">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Solicitar Maquinaria a Patio
                </button>
              </div>
            </div>

            <!-- RIBBON DE KPIS OPERATIVOS DE LA CONSTRUCTORA -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
              <div>
                <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">EQUIPOS EN FAENA</span>
                <span id="dash-kpi-total-tools" class="font-mono font-bold text-xl text-white">8 Activos</span>
                <span class="text-[10px] font-mono text-emerald-400 block mt-0.5">5 en marcha &bull; 3 standby</span>
              </div>
              <div>
                <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">GASTO DIARIO ALQUILER</span>
                <span class="font-mono font-bold text-xl text-amber-400">${formatCOP(obra.dailyBurn)}</span>
                <span class="text-[10px] font-mono text-slate-400 block mt-0.5">Tarifa neta imputada a C.C.</span>
              </div>
              <div>
                <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">AHORRO SEMANAL (-15%)</span>
                <span class="font-mono font-bold text-xl text-emerald-400">$ 1.250.000</span>
                <span class="text-[10px] font-mono text-slate-400 block mt-0.5">Por contrato continuo</span>
              </div>
              <div>
                <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">SEGURIDAD SST / RETIE</span>
                <span class="font-mono font-bold text-xl text-emerald-400">100% OK</span>
                <span class="text-[10px] font-mono text-slate-400 block mt-0.5">0 incidentes en 184 días</span>
              </div>
            </div>
          </div>

          <!-- NAVEGACIÓN POR PESTAÑAS TÁCTICAS DE OBRA -->
          <div class="segmented-control mb-6 overflow-x-auto w-full max-w-4xl">
            <button type="button" class="segmented-item ${activeTab === 'roster' ? 'active' : ''}" data-dash-tab="roster">
              <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              1. Maquinaria en Faena (Roster)
            </button>
            <button type="button" class="segmented-item ${activeTab === 'horometros' ? 'active' : ''}" data-dash-tab="horometros">
              <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              2. Horómetros y Desgaste
            </button>
            <button type="button" class="segmented-item ${activeTab === 'sst' ? 'active' : ''}" data-dash-tab="sst">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              3. Bitácora SST Preoperacional
            </button>
            <button type="button" class="segmented-item ${activeTab === 'costos' ? 'active' : ''}" data-dash-tab="costos">
              <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              4. Control de Costos (C.C.)
            </button>
            <button type="button" class="segmented-item ${activeTab === 'actas' ? 'active' : ''}" data-dash-tab="actas">
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              5. Actas y Remisiones QR
            </button>
          </div>

          <!-- CONTENIDO DE LA PESTAÑA SELECCIONADA -->
          <div id="dash-tab-content-box"></div>

        </div>
      `;

      // Eventos del Banner y Pestañas
      container.querySelector('#dash-obra-switch')?.addEventListener('change', (e) => {
        state.setObra(e.target.value);
      });

      container.querySelector('#dash-solicitar-equipo-btn')?.addEventListener('click', () => {
        state.setView('home');
      });

      container.querySelectorAll('[data-dash-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          activeTab = e.currentTarget.getAttribute('data-dash-tab');
          renderTabs();
        });
      });

      renderActiveTabContent();
    }

    function renderActiveTabContent() {
      const contentBox = container.querySelector('#dash-tab-content-box');
      if (!contentBox) return;

      if (activeTab === 'roster') {
        renderRosterTab(contentBox);
      } else if (activeTab === 'horometros') {
        renderHorometrosTab(contentBox);
      } else if (activeTab === 'sst') {
        renderSSTTab(contentBox);
      } else if (activeTab === 'costos') {
        renderCostosTab(contentBox);
      } else if (activeTab === 'actas') {
        renderActasTab(contentBox);
      }
    }

    // TAB 1: Matriz de Maquinaria en Faena (Roster de Alta Densidad)
    async function renderRosterTab(targetEl) {
      targetEl.innerHTML = `
        <div class="bg-surface rounded-xl border border-hairline shadow-card overflow-hidden">
          <div class="p-4 border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="font-display font-bold text-lg text-main uppercase">Matriz de Equipos Asignados a la Obra</h3>
              <p class="font-sans text-xs text-muted">Control de activos, horómetros, operadores y fechas límite de permanencia.</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs text-muted">Filtrar por frente:</span>
              <select id="roster-front-filter" class="input-industrial mono text-xs w-auto py-1">
                <option value="ALL">Todos los Frentes</option>
                <option value="CIMENTACION">Frente 1: Cimentación</option>
                <option value="ESTRUCTURAS">Frente 2: Estructuras</option>
                <option value="ALTURAS">Frente 3: Alturas</option>
                <option value="REDES">Frente 4: Redes RETIE</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="constructora-table">
              <thead>
                <tr>
                  <th>CÓDIGO ACTIVO</th>
                  <th>EQUIPO Y MODELO</th>
                  <th>FRENTE DE TRABAJO</th>
                  <th>OPERADOR A CARGO</th>
                  <th>HORÓMETRO FAENA</th>
                  <th>PLAZO DE RETIRO</th>
                  <th>ESTADO SST</th>
                  <th class="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody id="roster-table-body">
                <tr><td colspan="8" class="text-center py-8 text-muted font-mono">Cargando contratos de faena en tiempo real...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;

      try {
        const reservations = await API.reservations.getMyReservations();
        const tbody = targetEl.querySelector('#roster-table-body');

        // Mapeo enriquecido con datos de ingeniería de obra
        const dummyObrasRoster = [
          {
            resId: 101,
            sku: 'HERR-0001',
            name: 'Rotomartillo SDS Plus Bosch',
            front: 'Cimentación y Demolición',
            frontCode: 'CIMENTACION',
            operator: 'Maestro Pedro Ramírez (C.C. 79.840.112)',
            horometro: '142 / 200 h',
            horometroPct: 71,
            deadline: 'En 3 días (18 Oct)',
            deadlineStatus: 'normal',
            sst: 'Aprobado RETIE',
            status: 'EN OPERACIÓN'
          },
          {
            resId: 102,
            sku: 'HERR-0002',
            name: 'Mezcladora de Concreto 350L Truper',
            front: 'Estructura y Vaciado',
            frontCode: 'ESTRUCTURAS',
            operator: 'Oficial Jairo Benítez (C.C. 80.120.400)',
            horometro: '188 / 200 h',
            horometroPct: 94,
            deadline: 'Mañana (16 Oct) ',
            deadlineStatus: 'urgent',
            sst: 'Aprobado RETIE',
            status: 'EN OPERACIÓN'
          },
          {
            resId: 103,
            sku: 'HERR-0005',
            name: 'Generador Eléctrico 5.5kW Honda',
            front: 'Redes RETIE y Energía',
            frontCode: 'REDES',
            operator: 'Téc. Electricista Luis Parra (CONTE TE-401)',
            horometro: '85 / 150 h',
            horometroPct: 56,
            deadline: 'En 6 días (21 Oct)',
            deadlineStatus: 'normal',
            sst: 'Aprobado RETIE',
            status: 'STANDBY OBRA'
          },
          {
            resId: 104,
            sku: 'HERR-0010',
            name: 'Elevador de Carga 500kg Genie',
            front: 'Trabajo Seguro en Alturas',
            frontCode: 'ALTURAS',
            operator: 'Operador Certificado Alturas Res. 4272',
            horometro: '60 / 120 h',
            horometroPct: 50,
            deadline: 'En 8 días (23 Oct)',
            deadlineStatus: 'normal',
            sst: 'Certificado Alturas',
            status: 'EN OPERACIÓN'
          }
        ];

        let itemsToRender = dummyObrasRoster;
        if (reservations && reservations.length > 0) {
          itemsToRender = reservations.map(r => ({
            resId: r.id,
            sku: r.toolId ? `HERR-${String(r.toolId).padStart(4, '0')}` : `RES-${r.id}`,
            name: r.toolName || 'Maquinaria de Faena',
            front: r.deliveryAddress || 'Torre 4 - Ciudad Salitre',
            frontCode: 'CIMENTACION',
            operator: 'Ing. Residente de Obra',
            horometro: '0 / 200 h',
            horometroPct: 25,
            deadline: `${r.startDate} al ${r.endDate}`,
            deadlineStatus: 'normal',
            sst: 'Aprobado RETIE',
            status: r.status,
            raw: r
          }));
        }

        function renderRows(filteredItems) {
          tbody.innerHTML = filteredItems.map(item => `
            <tr>
              <td>
                <span class="font-mono font-bold text-amber-500">${item.sku}</span>
                <span class="block text-[10px] font-mono text-muted">Contrato #${item.resId}</span>
              </td>
              <td>
                <span class="font-bold text-main font-display text-sm uppercase">${item.name}</span>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="epp-tag">Casco</span>
                  <span class="epp-tag">Gafas</span>
                  <span class="epp-tag">Botas</span>
                </div>
              </td>
              <td>
                <span class="spec-chip font-bold">${item.front}</span>
              </td>
              <td>
                <span class="font-mono text-xs text-main">${item.operator}</span>
              </td>
              <td>
                <div class="horometro-box">
                  <span>${item.horometro}</span>
                </div>
                <div class="horometro-bar w-24">
                  <div class="horometro-bar-fill" style="width: ${item.horometroPct}%; ${item.horometroPct > 90 ? 'background-color: #ef4444;' : ''}"></div>
                </div>
              </td>
              <td>
                <span class="font-mono text-xs font-bold ${item.deadlineStatus === 'urgent' ? 'text-rose-500' : 'text-main'}">
                  ${item.deadline}
                </span>
              </td>
              <td>
                <span class="status-pill status-pill-available">
                  <span class="status-indicator-dot"></span>
                  ${item.status}
                </span>
              </td>
              <td class="text-right whitespace-nowrap space-x-1">
                ${(item.status === 'PENDIENTE' || item.status === 'APROBADA' || item.status === 'CREADA') ? `
                  <button type="button" class="btn-roster-pay btn-industrial btn-primary btn-sm py-1" data-id="${item.resId}">
                    Pagar Alquiler
                  </button>
                ` : ''}

                ${(item.raw && (item.raw.installmentCount > 1 || item.raw.paymentStatus === 'EN_CUOTAS')) ? `
                  <button type="button" class="btn-roster-installments btn-industrial btn-outline btn-sm py-1" data-id="${item.resId}">
                    Ver Cuotas (${item.raw.paidInstallments || 0}/${item.raw.installmentCount})
                  </button>
                ` : ''}

                ${item.status === 'EN_CURSO' ? `
                  <button type="button" class="btn-roster-return btn-industrial btn-outline btn-sm py-1" data-id="${item.resId}" data-tool="${item.name}">
                    Devolver
                  </button>
                ` : ''}

                <button type="button" class="btn-roster-qr btn-industrial btn-ghost btn-sm py-1" data-id="${item.resId}" data-tool="${item.name}">
                  Acta QR
                </button>
              </td>
            </tr>
          `).join('');

          // Listeners de acciones
          tbody.querySelectorAll('.btn-roster-pay').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const resId = Number(e.currentTarget.getAttribute('data-id'));
              const targetRes = reservations ? reservations.find(r => r.id === resId) : null;
              window.dispatchEvent(new CustomEvent('modal:open', { 
                detail: { 
                  modal: 'checkout', 
                  reservation: targetRes || { id: resId, totalAmount: 450000, toolName: 'Maquinaria de Faena' } 
                } 
              }));
            });
          });

          tbody.querySelectorAll('.btn-roster-installments').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const resId = Number(e.currentTarget.getAttribute('data-id'));
              window.dispatchEvent(new CustomEvent('modal:open', { 
                detail: { 
                  modal: 'installments', 
                  reservationId: resId 
                } 
              }));
            });
          });

          tbody.querySelectorAll('.btn-roster-qr').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const resId = e.currentTarget.getAttribute('data-id');
              const tool = e.currentTarget.getAttribute('data-tool');
              window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'qrView', resId, toolName: tool } }));
            });
          });

          tbody.querySelectorAll('.btn-roster-return').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const resId = e.currentTarget.getAttribute('data-id');
              window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'return', resId } }));
            });
          });
        }

        renderRows(itemsToRender);

        // Filtro por frente
        targetEl.querySelector('#roster-front-filter')?.addEventListener('change', (e) => {
          const val = e.target.value;
          if (val === 'ALL') renderRows(itemsToRender);
          else renderRows(itemsToRender.filter(i => i.frontCode === val));
        });

      } catch (err) {
        console.error('Error al cargar roster:', err);
      }
    }

    // TAB 2: Control de Horómetros y Desgaste
    function renderHorometrosTab(targetEl) {
      targetEl.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 rounded-xl bg-surface border border-hairline shadow-sm">
            <h3 class="font-display font-bold text-lg uppercase text-main mb-2">Monitoreo de Horómetros en Obra</h3>
            <p class="font-sans text-xs text-muted mb-6">Lectura de horas de motor para prevención de recargos por hora extra.</p>
            
            <div class="space-y-5 font-mono text-xs">
              <div class="p-4 rounded-lg bg-surface-subtle border border-hairline">
                <div class="flex justify-between items-center mb-1.5">
                  <span class="font-bold text-main">HERR-0002 Mezcladora 350L Truper</span>
                  <span class="text-rose-500 font-bold">188h / 200h (94%)</span>
                </div>
                <div class="horometro-bar">
                  <div class="horometro-bar-fill bg-rose-500" style="width: 94%;"></div>
                </div>
                <span class="text-[10px] text-rose-400 block mt-1.5"> ALERTA: Quedan 12 horas antes de mantenimiento preventivo de tambor.</span>
              </div>

              <div class="p-4 rounded-lg bg-surface-subtle border border-hairline">
                <div class="flex justify-between items-center mb-1.5">
                  <span class="font-bold text-main">HERR-0001 Rotomartillo Bosch</span>
                  <span class="text-amber-500 font-bold">142h / 200h (71%)</span>
                </div>
                <div class="horometro-bar">
                  <div class="horometro-bar-fill bg-amber-500" style="width: 71%;"></div>
                </div>
                <span class="text-[10px] text-muted block mt-1.5"> En rango óptimo de operación. Próximo cambio de escobillas en 58h.</span>
              </div>

              <div class="p-4 rounded-lg bg-surface-subtle border border-hairline">
                <div class="flex justify-between items-center mb-1.5">
                  <span class="font-bold text-main">HERR-0005 Generador Eléctrico Honda</span>
                  <span class="text-emerald-500 font-bold">85h / 150h (56%)</span>
                </div>
                <div class="horometro-bar">
                  <div class="horometro-bar-fill bg-emerald-500" style="width: 56%;"></div>
                </div>
                <span class="text-[10px] text-muted block mt-1.5"> Nivel de aceite 15W-40 verificado en inspección diaria.</span>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-xl bg-surface border border-hairline shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="font-display font-bold text-lg uppercase text-main mb-2">Protocolo de Mantenimiento en Faena</h3>
              <p class="font-sans text-xs text-muted mb-4">Servicio técnico de patio disponible para revisión sin costo adicional.</p>
              
              <ul class="space-y-3 font-sans text-xs text-muted">
                <li class="flex items-start gap-2">
                  <span class="text-amber-500 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Asistencia en Obra &lt; 2H:</strong> Si un equipo presenta falla mecánica, enviamos técnico especializado o unidad de reemplazo inmediata.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-amber-500 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Alineación y Calibración:</strong> Equipos de topografía y medición cuentan con certificado de calibración vigente ante la ONAC.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-amber-500 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Certificación RETIE:</strong> No se permite la energización de maquinaria sin el visto bueno de la interventoría eléctrica.</span>
                </li>
              </ul>
            </div>

            <button type="button" class="btn-industrial btn-secondary w-full mt-6" onclick="Toast.info('Solicitud enviada', 'El móvil de asistencia técnica fue despachado al campamento de obra.')">
              Solicitar Asistencia Técnica en Obra
            </button>
          </div>
        </div>
      `;
    }

    // TAB 3: Bitácora SST Preoperacional
    function renderSSTTab(targetEl) {
      targetEl.innerHTML = `
        <div class="bg-surface rounded-xl border border-hairline shadow-card p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-hairline mb-6 gap-3">
            <div>
              <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-wider">SEGURIDAD Y SALUD EN EL TRABAJO</span>
              <h3 class="font-display font-bold text-2xl uppercase text-main">Checklist Preoperacional Diario de Maquinaria</h3>
            </div>
            <span class="status-pill status-pill-available">
              <span class="status-indicator-dot pulse"></span>
              JORNADA 15 OCT 2026: VIGENTE
            </span>
          </div>

          <form id="sst-preop-form" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Equipo a Inspeccionar</label>
                <select class="input-industrial mono text-xs">
                  <option>HERR-0001 - Rotomartillo SDS Plus Bosch</option>
                  <option>HERR-0002 - Mezcladora 350L Truper</option>
                  <option>HERR-0005 - Generador 5.5kW Honda</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-mono font-bold text-muted uppercase mb-1">Operador / Inspector Responsable</label>
                <input type="text" class="input-industrial text-xs" value="${obra.resident}" readonly />
              </div>
            </div>

            <div class="p-4 rounded-lg bg-surface-subtle border border-hairline space-y-3 font-mono text-xs">
              <h4 class="font-display font-bold text-sm uppercase text-main">Verificación de Puntos Críticos de Seguridad:</h4>
              
              <label class="flex items-center gap-3 p-2 rounded bg-surface border border-hairline cursor-pointer">
                <input type="checkbox" checked class="w-4 h-4 accent-amber-500" />
                <span>1. Cableado eléctrico sin empalmes descubiertos y clavija industrial con polo a tierra.</span>
              </label>

              <label class="flex items-center gap-3 p-2 rounded bg-surface border border-hairline cursor-pointer">
                <input type="checkbox" checked class="w-4 h-4 accent-amber-500" />
                <span>2. Carcasas protectoras de poleas, discos y correas ajustadas firmemente.</span>
              </label>

              <label class="flex items-center gap-3 p-2 rounded bg-surface border border-hairline cursor-pointer">
                <input type="checkbox" checked class="w-4 h-4 accent-amber-500" />
                <span>3. Operador cuenta con dotación EPP completa (casco, gafas, guantes, botas de seguridad).</span>
              </label>

              <label class="flex items-center gap-3 p-2 rounded bg-surface border border-hairline cursor-pointer">
                <input type="checkbox" checked class="w-4 h-4 accent-amber-500" />
                <span>4. Sistema de parada de emergencia (seta de corte) y gatillos de traba 100% funcionales.</span>
              </label>
            </div>

            <button type="submit" class="btn-industrial btn-primary">
              Firmar y Radicar Inspección Preoperacional de Obra
            </button>
          </form>
        </div>
      `;

      targetEl.querySelector('#sst-preop-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        Toast.success('Inspección Radicada', 'El formato preoperacional fue firmado y registrado en la bitácora de la constructora.');
      });
    }

    // TAB 4: Control de Costos e Imputación Presupuestal
    function renderCostosTab(targetEl) {
      targetEl.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="p-6 rounded-xl bg-surface border border-hairline shadow-sm lg:col-span-2">
            <h3 class="font-display font-bold text-lg uppercase text-main mb-2">Imputación por Centro de Costos de Obra</h3>
            <p class="font-sans text-xs text-muted mb-6">Distribución de alquiler de maquinaria por frente de trabajo.</p>

            <div class="space-y-4 font-mono text-xs">
              <div>
                <div class="flex justify-between mb-1">
                  <span>C.C. 101 - Demolición y Cimentación</span>
                  <span class="font-bold text-amber-500">$ 7.800.000 COP (42%)</span>
                </div>
                <div class="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full bg-amber-500" style="width: 42%;"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span>C.C. 102 - Estructuras y Concreto</span>
                  <span class="font-bold text-blue-500">$ 5.950.000 COP (32%)</span>
                </div>
                <div class="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full bg-blue-500" style="width: 32%;"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span>C.C. 103 - Trabajo en Alturas</span>
                  <span class="font-bold text-emerald-500">$ 3.100.000 COP (17%)</span>
                </div>
                <div class="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full bg-emerald-500" style="width: 17%;"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span>C.C. 104 - Redes Eléctricas y RETIE</span>
                  <span class="font-bold text-slate-400">$ 1.600.000 COP (9%)</span>
                </div>
                <div class="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full bg-slate-400" style="width: 9%;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-xl bg-surface border border-hairline shadow-sm flex flex-col justify-between">
            <div>
              <span class="font-mono text-xs text-muted uppercase">EJECUCIÓN PRESUPUESTAL</span>
              <div class="font-mono font-bold text-2xl text-main mt-1">${formatCOP(obra.spent)}</div>
              <span class="font-mono text-xs text-muted block mt-0.5">Límite Aprobado: ${formatCOP(obra.budgetCap)}</span>
              
              <div class="mt-6 p-4 rounded-lg bg-surface-subtle border border-hairline space-y-2 font-mono text-xs">
                <div class="flex justify-between">
                  <span class="text-muted">Depósitos Reembolsables:</span>
                  <span class="font-bold text-emerald-400">$ 4.500.000</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Facturación Electrónica:</span>
                  <span class="font-bold text-main">DIAN Habilitada</span>
                </div>
              </div>
            </div>

            <button type="button" class="btn-industrial btn-primary w-full mt-6" onclick="Toast.info('Reporte generado', 'Descargando extracto presupuestal en Excel...')">
              Exportar Reporte a Excel / ERP
            </button>
          </div>
        </div>
      `;
    }

    // TAB 5: Actas y Remisiones QR de Obra
    function renderActasTab(targetEl) {
      targetEl.innerHTML = `
        <div class="bg-surface rounded-xl border border-hairline shadow-card p-6">
          <div class="flex items-center justify-between pb-4 border-b border-hairline mb-6">
            <div>
              <span class="font-mono text-xs font-bold text-amber-500 uppercase">EXPEDIENTE DIGITAL DE OBRA</span>
              <h3 class="font-display font-bold text-2xl uppercase text-main">Actas de Ingreso y Devolución con QR</h3>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="acta-sheet">
              <div class="acta-header-seal mb-4">
                ACTA OFICIAL DE INGRESO A CAMPAMENTO #ACT-2026-881
              </div>
              <div class="space-y-1.5 text-xs text-slate-800">
                <div class="flex justify-between"><span>PROYECTO:</span><strong>${obra.name}</strong></div>
                <div class="flex justify-between"><span>EQUIPO:</span><strong>Rotomartillo SDS Plus Bosch</strong></div>
                <div class="flex justify-between"><span>SERIAL ACTIVO:</span><strong>HERR-0001</strong></div>
                <div class="flex justify-between"><span>HORÓMETRO INICIAL:</span><strong>0.0 h</strong></div>
                <div class="flex justify-between"><span>ESTADO RETIE:</span><strong class="text-emerald-700">CONFORME 100%</strong></div>
                <div class="flex justify-between"><span>RESIDENTE FIRMANTE:</span><strong>${obra.resident}</strong></div>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between">
                <button type="button" class="btn-industrial btn-outline btn-sm text-slate-900 border-slate-900" onclick="window.print()">
                   Imprimir Copia de Archivo
                </button>
                <span class="text-[10px] text-slate-500">Firmado digitalmente</span>
              </div>
            </div>

            <div class="acta-sheet">
              <div class="acta-header-seal mb-4">
                ACTA OFICIAL DE INGRESO A CAMPAMENTO #ACT-2026-882
              </div>
              <div class="space-y-1.5 text-xs text-slate-800">
                <div class="flex justify-between"><span>PROYECTO:</span><strong>${obra.name}</strong></div>
                <div class="flex justify-between"><span>EQUIPO:</span><strong>Mezcladora de Concreto 350L</strong></div>
                <div class="flex justify-between"><span>SERIAL ACTIVO:</span><strong>HERR-0002</strong></div>
                <div class="flex justify-between"><span>HORÓMETRO INICIAL:</span><strong>12.4 h</strong></div>
                <div class="flex justify-between"><span>ESTADO RETIE:</span><strong class="text-emerald-700">CONFORME 100%</strong></div>
                <div class="flex justify-between"><span>RESIDENTE FIRMANTE:</span><strong>${obra.resident}</strong></div>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between">
                <button type="button" class="btn-industrial btn-outline btn-sm text-slate-900 border-slate-900" onclick="window.print()">
                   Imprimir Copia de Archivo
                </button>
                <span class="text-[10px] text-slate-500">Firmado digitalmente</span>
              </div>
            </div>

          </div>
        </div>
      `;
    }

    renderTabs();
  }

  // 2. DASHBOARD PROVEEDOR DE FLOTA
  async function renderProviderDashboard() {
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between pb-6 border-b border-hairline mb-8">
          <div>
            <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">PORTAL PROVEEDOR &bull; LOGÍSTICA DE PATIO</span>
            <h2 class="text-3xl font-black font-display text-main tracking-tight uppercase">Despachos de Maquinaria a Obras</h2>
          </div>
          <button id="provider-add-tool-btn" type="button" class="btn-industrial btn-primary btn-sm">
            + Añadir Maquinaria a Flota
          </button>
        </div>

        <div class="bg-surface rounded-xl border border-hairline shadow-card overflow-hidden">
          <div class="p-4 border-b border-hairline font-display font-bold text-base uppercase text-main">
            Órdenes de Despacho y Transporte en Cama Baja
          </div>
          <div id="provider-deliveries-list" class="divide-y divide-hairline">
            <div class="p-8 text-center text-muted font-mono text-xs">Consultando órdenes de despacho...</div>
          </div>
        </div>
      </div>
    `;

    try {
      const reservations = await API.reservations.getProviderReservations();
      const listEl = container.querySelector('#provider-deliveries-list');

      if (!reservations || reservations.length === 0) {
        listEl.innerHTML = `<div class="p-8 text-center text-muted font-sans text-sm">No hay despachos pendientes en este momento.</div>`;
        return;
      }

      listEl.innerHTML = reservations.map(r => `
        <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono text-xs font-bold text-amber-500">ORDEN #${r.id}</span>
              <span class="status-pill status-pill-available">${r.status}</span>
            </div>
            <h4 class="font-display font-bold text-lg text-main uppercase">${r.toolName || 'Herramienta Industrial'}</h4>
            <div class="font-mono text-xs text-muted">Destino: ${r.deliveryAddress || 'Campamento de Obra'} &bull; Fecha: ${r.startDate}</div>
          </div>
          <button type="button" class="btn-dispatch btn-industrial btn-primary btn-sm" data-id="${r.id}">
            Firmar Acta de Salida en Patio
          </button>
        </div>
      `).join('');

      listEl.querySelectorAll('.btn-dispatch').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const resId = e.currentTarget.getAttribute('data-id');
          window.dispatchEvent(new CustomEvent('modal:open', { detail: { modal: 'delivery', resId } }));
        });
      });
    } catch (err) {
      console.error('Error al cargar proveedor:', err);
    }
  }

  // 3. DASHBOARD ADMINISTRADOR
  async function renderAdminDashboard() {
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="pb-6 border-b border-hairline mb-8">
          <span class="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">CONTROL ROOM &bull; TELEMETRÍA GLOBAL</span>
          <h2 class="text-3xl font-black font-display text-main tracking-tight uppercase">Consola de Mando Central RentaMaq</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div class="p-5 rounded-xl bg-surface border border-hairline shadow-sm">
            <span class="text-xs font-mono text-muted uppercase">INGRESOS TOTALES</span>
            <div id="admin-rev-metric" class="font-mono font-bold text-3xl text-amber-500 mt-2">Cargando...</div>
          </div>
          <div class="p-5 rounded-xl bg-surface border border-hairline shadow-sm">
            <span class="text-xs font-mono text-muted uppercase">CONTRATOS ACTIVOS</span>
            <div id="admin-act-metric" class="font-mono font-bold text-3xl text-main mt-2">Cargando...</div>
          </div>
          <div class="p-5 rounded-xl bg-surface border border-hairline shadow-sm">
            <span class="text-xs font-mono text-muted uppercase">DISPONIBILIDAD DE FLOTA</span>
            <div class="font-mono font-bold text-3xl text-emerald-400 mt-2">92.4%</div>
          </div>
        </div>

        <div class="p-5 rounded-xl bg-surface border border-hairline shadow-sm">
          <h3 class="font-display font-bold text-lg uppercase text-main mb-4">Ingresos Operativos de Faena</h3>
          <div class="h-64 relative">
            <canvas id="admin-revenue-chart"></canvas>
          </div>
        </div>

        <!-- TABLA DE CLIENTES FRECUENTES Y GRANDES CUENTAS (4FN) -->
        <div class="mt-8 p-5 rounded-xl bg-surface border border-hairline shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-display font-bold text-lg uppercase text-main">Clientes Frecuentes y Cuentas Corporativas</h3>
              <span class="text-[10px] font-mono text-muted">Auditoría 4FN de constructoras con mayor volumen de contratación</span>
            </div>
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
              Score Crediticio AAA
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left font-mono text-xs">
              <thead class="bg-surface-subtle text-muted text-[10px] uppercase border-b border-hairline">
                <tr>
                  <th class="p-3">Constructora / Razón Social</th>
                  <th class="p-3">NIT Corporativo</th>
                  <th class="p-3">Obra Activa Principal</th>
                  <th class="p-3">Contratos</th>
                  <th class="p-3">Facturado 2026</th>
                  <th class="p-3">Línea de Crédito Cuotas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-hairline">
                <tr class="hover:bg-surface-subtle/50 transition-colors">
                  <td class="p-3 font-bold text-main">Constructora Amarilo S.A.S.</td>
                  <td class="p-3 text-slate-400">900.123.456-7</td>
                  <td class="p-3 text-slate-300">Torre 4 - Salitre</td>
                  <td class="p-3 font-bold text-amber-500">14 equipos</td>
                  <td class="p-3 font-bold text-emerald-400">$ 42.500.000 COP</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">12 Cuotas Habilitado</span></td>
                </tr>
                <tr class="hover:bg-surface-subtle/50 transition-colors">
                  <td class="p-3 font-bold text-main">Marval Construcciones Urbanas</td>
                  <td class="p-3 text-slate-400">860.987.654-2</td>
                  <td class="p-3 text-slate-300">Puente Peatonal Km 19</td>
                  <td class="p-3 font-bold text-amber-500">8 equipos</td>
                  <td class="p-3 font-bold text-emerald-400">$ 28.100.000 COP</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">6 Cuotas Habilitado</span></td>
                </tr>
                <tr class="hover:bg-surface-subtle/50 transition-colors">
                  <td class="p-3 font-bold text-main">Arquitectura & Concreto S.A.</td>
                  <td class="p-3 text-slate-400">800.554.120-1</td>
                  <td class="p-3 text-slate-300">Parque Industrial Cota</td>
                  <td class="p-3 font-bold text-amber-500">6 equipos</td>
                  <td class="p-3 font-bold text-emerald-400">$ 19.850.000 COP</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">6 Cuotas Habilitado</span></td>
                </tr>
                <tr class="hover:bg-surface-subtle/50 transition-colors">
                  <td class="p-3 font-bold text-main">Conconcreto Infraestructura</td>
                  <td class="p-3 text-slate-400">890.300.211-9</td>
                  <td class="p-3 text-slate-300">Viaducto Calle 100</td>
                  <td class="p-3 font-bold text-amber-500">5 equipos</td>
                  <td class="p-3 font-bold text-emerald-400">$ 16.400.000 COP</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Sin Límite</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    try {
      const stats = await API.reports.getAdminDashboard();
      const revEl = container.querySelector('#admin-rev-metric');
      const actEl = container.querySelector('#admin-act-metric');
      if (revEl) revEl.textContent = formatCOP(stats.totalRevenue);
      if (actEl) actEl.textContent = `${stats.activeRentals || 0} Contratos`;

      if (window.Chart) {
        const ctx = container.querySelector('#admin-revenue-chart');
        if (ctx) {
          new window.Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'],
              datasets: [{
                label: 'Ingresos COP',
                data: [12000000, 15000000, 19000000, 22000000, 28000000, 31000000, 36000000, 42000000, 48000000, stats.totalRevenue || 55000000],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.35,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } }
            }
          });
        }
      }
    } catch (err) {
      console.error('Error al cargar admin dashboard:', err);
    }
  }

  // Enrutador de Vistas Reactivo
  function updateView(viewName) {
    const catalogSection = document.getElementById('catalog-section');
    const heroSection = document.getElementById('hero-container');

    if (viewName === 'home') {
      if (catalogSection) catalogSection.style.display = 'block';
      if (heroSection) heroSection.style.display = 'block';
      container.innerHTML = '';
    } else {
      if (catalogSection) catalogSection.style.display = 'none';
      if (heroSection) heroSection.style.display = 'none';

      if (viewName === 'client') renderConstructoraDashboard();
      else if (viewName === 'provider') renderProviderDashboard();
      else if (viewName === 'admin') renderAdminDashboard();
    }
  }

  state.on('view:change', updateView);
  state.on('obra:change', () => {
    if (state.get().currentView === 'client') {
      renderConstructoraDashboard();
    }
  });
}

export default initDashboards;
