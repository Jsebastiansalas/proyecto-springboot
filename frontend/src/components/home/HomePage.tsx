import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tool } from '../../types';
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Truck, 
  Receipt, 
  Clock, 
  SlidersHorizontal, 
  Gauge, 
  Zap, 
  CheckCircle2, 
  Flame, 
  Activity,
  HardHat,
  Sparkles,
  Phone,
  Building,
  Eye
} from 'lucide-react';

interface HomePageProps {
  featuredTools: Tool[];
}

// Icono geométrico de cuatro puntas (estrella minimalista de alta precisión tipo Promptverse AI)
const SparkleStar: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-slate-500/40" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

export const HomePage: React.FC<HomePageProps> = ({ featuredTools }) => {
  const { setActiveView, setSelectedToolDetail, addToCart } = useApp();

  // Estado del selector de gemelo digital / telemetría interactiva
  const [telemetryMode, setTelemetryMode] = useState<'specs' | 'telemetry'>('telemetry');

  // Estado del simulador rápido interactivo de presupuesto
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);
  const [estimateDays, setEstimateDays] = useState<number>(7);

  const estimatorCategories = [
    { name: 'Minicargadores & Carga', daily: 480000, deposit: 1500000, catId: 17 },
    { name: 'Generación Eléctrica', daily: 150000, deposit: 500000, catId: 5 },
    { name: 'Compactación y Pavimento', daily: 140000, deposit: 450000, catId: 9 },
    { name: 'Mezclado de Concreto', daily: 120000, deposit: 400000, catId: 2 },
  ];

  const currentCategory = estimatorCategories[selectedCategoryIndex];
  const subtotalBase = currentCategory.daily * estimateDays;
  const hasWeeklyDiscount = estimateDays >= 7;
  const discountAmount = hasWeeklyDiscount ? subtotalBase * 0.15 : 0;
  const subtotalNeto = subtotalBase - discountAmount;
  const iva = subtotalNeto * 0.19;
  const totalEstimado = subtotalNeto + iva + currentCategory.deposit;

  // Filtrar 3 herramientas destacadas reales
  const top3Tools = featuredTools.slice(0, 3);

  return (
    <div className="space-y-24 pb-20 animate-in fade-in duration-300">
      
      {/* =========================================================================
          1. HEADER PRINCIPAL: MINIMALISTA, ESTELAR Y ELEGANTE (ESTILO PROMPTERSE AI)
         ========================================================================= */}
      <section className="relative pt-12 sm:pt-20 pb-4 overflow-hidden text-center">
        
        {/* Estrellas minimalistas flotantes con sutil resplandor */}
        <div className="absolute top-8 left-[12%] pointer-events-none">
          <SparkleStar className="w-3.5 h-3.5 text-slate-400/40 animate-pulse" />
        </div>
        <div className="absolute top-20 right-[15%] pointer-events-none">
          <SparkleStar className="w-4 h-4 text-slate-300/50 animate-pulse" />
        </div>
        <div className="absolute bottom-10 left-[20%] pointer-events-none">
          <SparkleStar className="w-3 h-3 text-slate-500/30 animate-pulse" />
        </div>
        <div className="absolute bottom-12 right-[18%] pointer-events-none">
          <SparkleStar className="w-3.5 h-3.5 text-indigo-400/40 animate-pulse" />
        </div>

        {/* Resplandores ambientales sutiles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          
          {/* Badge superior discreto */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-slate-300 text-xs font-medium tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rentamaq Cloud Flota · Infraestructura Pesada Colombia</span>
          </div>

          {/* Gran titular limpio, amplio y tipografía nítida */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
            Ingeniería Pesada. <br className="hidden sm:inline" />
            <span className="text-slate-200">Renta, Monitorea & Construye.</span>
          </h1>

          {/* Subtítulo espacioso y legible */}
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Accede a maquinaria pesada y equipos certificados para obras de infraestructura en Colombia. Telemetría IoT en tiempo real, fianza en custodia Escrow y despacho express en 24h a pie de obra.
          </p>

          {/* Botones de acción redondeados estilo pastilla */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => setActiveView('catalog')}
              className="px-6 py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white font-medium text-sm flex items-center gap-2.5 border border-slate-700/80 hover:border-indigo-500/50 transition-all shadow-lg shadow-black/40 group"
            >
              <span>Explorar Catálogo</span>
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </button>

            <a
              href="#simulador-presupuesto"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm flex items-center gap-2 shadow-xl shadow-white/10 hover:shadow-white/20 transition-all"
            >
              <span>Simular Presupuesto</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </a>
          </div>

        </div>

      </section>


      {/* =========================================================================
          2. HERO SHOWCASE: COMPOSICIÓN ESTILO FURNIRO CON MAQUINARIA PESADA Y TARJETA FLOTANTE
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-slate-800/90 shadow-2xl bg-[#070b14] group">
          
          {/* Fotografía cinematográfica de maquinaria pesada */}
          <div className="relative w-full h-[440px] sm:h-[520px] md:h-[580px] overflow-hidden">
            <img
              src="images/hero-excavator-studio.jpg"
              alt="Excavadora Develon DX510LC Flota Pesada"
              className="w-full h-full object-cover object-[25%_center] sm:object-center transition-transform duration-1000 group-hover:scale-[1.02]"
            />
            {/* Gradientes atmosféricos para realzar contraste y profundidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent sm:hidden" />
            <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-[#070b14]/30 to-[#070b14]/95" />
          </div>

          {/* Tarjeta Flotante (Inspirada en el banner de Furniro: 'Discover Our New Collection') */}
          <div className="sm:absolute sm:right-8 sm:bottom-8 sm:top-8 sm:my-auto sm:max-w-md p-6 sm:p-8 rounded-2xl bg-[#0c1222]/95 backdrop-blur-xl border border-amber-500/30 sm:border-slate-700/80 shadow-2xl flex flex-col justify-between m-4 sm:m-0 space-y-4">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>NUEVA INCORPORACIÓN · FLOTA 2026</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Excavadora Develon DX510LC
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Potencia pesada de 50 toneladas para excavación masiva, minería y cimentación profunda. Equipada con telemetría satelital Trimble 3D y certificación RETIE al día.
              </p>
            </div>

            {/* Chips de especificaciones técnicas */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-1">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <div className="text-[10px] uppercase text-slate-400">Capacidad</div>
                <div className="font-bold text-amber-300">50 Ton</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <div className="text-[10px] uppercase text-slate-400">Potencia</div>
                <div className="font-bold text-sky-300">385 HP</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <div className="text-[10px] uppercase text-slate-400">Horómetro</div>
                <div className="font-bold text-emerald-300">IoT 24/7</div>
              </div>
            </div>

            {/* Botón de acción destacado estilo Furniro */}
            <div className="pt-2">
              <button
                onClick={() => setActiveView('catalog')}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 group"
              >
                <span>VER FLOTA DISPONIBLE</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Despacho a pie de obra en menos de 24 horas</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          3. GEMELO DIGITAL Y TELEMETRÍA IOT EN VIVO (BOBCAT S650)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Explicación Técnica y Beneficios */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Transparencia Operativa 100% Digital</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Telemetría Satelital en Tiempo Real. <br />
              <span className="text-slate-400">Cero disputas por horas o consumo.</span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed">
              Cada equipo de nuestra flota cuenta con hardware IoT industrial embebido. Como contratista, tienes acceso al horómetro digital exacto, niveles de combustible, diagnóstico térmico y alertas de vibración desde cualquier dispositivo.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                  <Gauge className="w-4 h-4" />
                  <span>Horómetro Irrefutable</span>
                </div>
                <p className="text-xs text-slate-400">
                  Facturación milimétrica por horas efectivas de motor sin lecturas manuales.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Seguro SURA Activo</span>
                </div>
                <p className="text-xs text-slate-400">
                  Cobertura Todo Riesgo y auxilio mecánico en patio en menos de 2 horas.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta Interactiva con Switch IoT vs Ficha Técnica */}
          <div className="lg:col-span-6">
            <div className="bg-[#0c1220] border border-slate-700/80 rounded-2xl p-6 shadow-2xl glass-card space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                    Telemetría en Vivo · IoT 4FN
                  </span>
                </div>

                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px] font-semibold">
                  <button
                    onClick={() => setTelemetryMode('telemetry')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      telemetryMode === 'telemetry'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sensores IoT
                  </button>
                  <button
                    onClick={() => setTelemetryMode('specs')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      telemetryMode === 'specs'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Ficha 4FN
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/10] rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                <img
                  src="images/tools/HERR-0017.jpg"
                  alt="Minicargador Bobcat S570"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                    DISPONIBLE EN PATIO
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
                    SKU: HERR-0017
                  </span>
                </div>
              </div>

              {telemetryMode === 'telemetry' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-white">Minicargador Bobcat S570</h4>
                    <span className="text-xs font-mono font-bold text-indigo-400">$480.000 /día</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                        <Gauge className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase text-slate-400">Horómetro</span>
                      </div>
                      <div className="font-bold text-amber-300 text-sm">168.4 <span className="text-[10px] font-normal text-slate-400">h</span></div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center justify-center gap-1 text-sky-400 mb-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase text-slate-400">Batería</span>
                      </div>
                      <div className="font-bold text-sky-300 text-sm">88%</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase text-slate-400">RETIE</span>
                      </div>
                      <div className="font-bold text-emerald-300 text-sm">VIGENTE</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" /> Temperatura: 76°C
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Activity className="w-3.5 h-3.5" /> Vibración: ÓPTIMO
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-white">Especificaciones de Fabricante</h4>
                    <span className="text-xs font-mono text-slate-400">Bobcat · MOD-219</span>
                  </div>

                  <div className="space-y-1.5 border border-slate-800 rounded-lg p-2.5 bg-slate-900/40">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Potencia de Motor:</span>
                      <span className="font-semibold text-white">61 HP Diésel Turbo</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Capacidad Operativa:</span>
                      <span className="font-semibold text-white">1.2 Toneladas</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Póliza Todo Riesgo:</span>
                      <span className="font-mono text-emerald-400">SURA No. 98421</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  const bobcat = featuredTools.find(t => t.id === 17) || featuredTools[0];
                  if (bobcat) addToCart(bobcat, 7);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/20"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Cotizar este Minicargador con -15% OFF</span>
              </button>

            </div>
          </div>

        </div>

      </section>


      {/* =========================================================================
          4. SMART PROJECT ESTIMATOR (CALCULADORA RÁPIDA INTERACTIVA)
         ========================================================================= */}
      <section id="simulador-presupuesto" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="p-6 sm:p-10 rounded-3xl bg-[#0c1220] border border-slate-800/80 shadow-2xl glass-panel space-y-8">
          
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Simulador Inteligente de Presupuesto</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ¿Cuánto costará la maquinaria para tu frente de obra?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Selecciona el tipo de trabajo y ajusta los días. Nuestro algoritmo aplica el 15% de ahorro semanal y desglosa el depósito escrow en custodia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Controles del simulador */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                  1. Tipo de Frente de Trabajo
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {estimatorCategories.map((cat, idx) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategoryIndex(idx)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedCategoryIndex === idx
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs leading-tight">{cat.name}</div>
                      <div className="text-[11px] font-mono text-indigo-400 mt-1">
                        Desde ${cat.daily.toLocaleString('es-CO')} /día
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold uppercase tracking-wider text-slate-400">
                    2. Duración Estimada de Operación:
                  </label>
                  <span className="font-mono font-bold text-indigo-400 text-sm bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                    {estimateDays} {estimateDays === 1 ? 'Día' : 'Días'}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={estimateDays}
                  onChange={(e) => setEstimateDays(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>1 Día (Express)</span>
                  <span>7 Días (-15% OFF)</span>
                  <span>15 Días</span>
                  <span>30 Días (Mes)</span>
                </div>
              </div>

              {hasWeeklyDiscount && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Descuento Corporativo Activado:</strong> Ahorraste ${discountAmount.toLocaleString('es-CO')} COP por alquiler superior a 7 días.
                  </span>
                </div>
              )}

            </div>

            {/* Recibo dinámico de cotización */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl space-y-4 font-mono text-xs">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-300">
                  <span className="font-sans font-bold text-sm text-white">Desglose Estimado</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">TRM Bogotá</span>
                </div>

                <div className="space-y-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>Tarifa diaria base:</span>
                    <span className="text-slate-200">${currentCategory.daily.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal ({estimateDays} días):</span>
                    <span className="text-slate-200">${subtotalBase.toLocaleString('es-CO')} COP</span>
                  </div>

                  {hasWeeklyDiscount && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Descuento semanal (-15%):</span>
                      <span>-${discountAmount.toLocaleString('es-CO')} COP</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>IVA (19% deducible):</span>
                    <span className="text-slate-200">${iva.toLocaleString('es-CO')} COP</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-indigo-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Depósito Escrow:
                    </span>
                    <span className="text-indigo-300">${currentCategory.deposit.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="text-[10px] text-slate-500 italic">
                    * El depósito se libera 100% al devolver el equipo sin daños.
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="font-sans font-bold text-sm text-white">Total con Depósito:</span>
                  <span className="font-bold text-lg text-emerald-400">
                    ${totalEstimado.toLocaleString('es-CO')} <span className="text-[10px] font-normal text-slate-400">COP</span>
                  </span>
                </div>

                <button
                  onClick={() => setActiveView('catalog')}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 group mt-2"
                >
                  <span>Alquilar con esta Tarifa</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

              </div>
            </div>

          </div>

        </div>

      </section>


      {/* =========================================================================
          5. TOP 3 MAQUINARIA DESTACADA: MINIMALISTA Y ELEGANTE
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Disponibilidad Inmediata
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Flota Pesada Destacada
            </h2>
          </div>

          <button
            onClick={() => setActiveView('catalog')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Ver todo el catálogo (180+ equipos)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3Tools.map((tool) => (
            <div 
              key={tool.id}
              className="bg-[#0c1220] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col group glass-card"
            >
              <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                <img
                  src={tool.mainImageUrl || 'images/tools/HERR-0017.jpg'}
                  alt={tool.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30 font-semibold">
                    DISPONIBLE
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700">
                    {tool.categoryName}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                    {tool.brand} · {tool.model}
                  </div>
                  <h3 className="font-bold text-white text-base mt-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 font-normal">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Tarifa Base</div>
                    <div className="text-sm font-black font-mono text-white">
                      ${tool.baseDailyPrice.toLocaleString('es-CO')} <span className="text-[10px] text-slate-400 font-normal">/día</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedToolDetail(tool)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Ver Ficha Técnica"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addToCart(tool, 1)}
                      className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20"
                    >
                      Alquilar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>


      {/* =========================================================================
          6. LOS 4 PILARES DEL ESTÁNDAR 4FN
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Seguridad B2B Contractual</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            El Estándar 4FN de Confianza Operativa
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Diseñado para cumplir los requisitos de auditoría y compliance de constructoras en Colombia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800/80 space-y-3 glass-panel">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Telemetría IoT Activa</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitoreo satelital continuo de horómetros y estado mecánico para evitar disputas en las horas liquidadas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800/80 space-y-3 glass-panel">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Custodia Escrow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tu depósito de garantía permanece bloqueado en custodia fiduciaria y se reintegra al finalizar el acta de entrega.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800/80 space-y-3 glass-panel">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Despacho Express 24h</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flota propia de camas bajas que transporta la maquinaria directamente al campamento de obra en Bogotá y Cundinamarca.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800/80 space-y-3 glass-panel">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Factura DIAN con CUFE</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generación y timbrado electrónico legal en cada ciclo para deducción tributaria inmediata de tu compañía constructora.
            </p>
          </div>

        </div>

      </section>


      {/* =========================================================================
          7. CONSTRUCTORAS ALIADAS & PROYECTOS EN OPERACIÓN
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Alianzas Corporativas de Construcción
            </div>
            <div className="text-sm font-bold text-slate-200">
              Más de 45 constructoras y consorcios operan con el respaldo RentaMaq
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono font-semibold text-slate-400">
            <span className="hover:text-slate-200">Consorcio Bogotá Norte</span>
            <span>·</span>
            <span className="hover:text-slate-200">Amarilo Obra Civil</span>
            <span>·</span>
            <span className="hover:text-slate-200">Conconcreto Vías</span>
            <span>·</span>
            <span className="hover:text-slate-200">Marval Andina</span>
          </div>
        </div>
      </section>


      {/* =========================================================================
          8. CTA FINAL ELEGANTE: LISTOS PARA OPERAR EN OBRA
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-[#0d162d] via-[#101b38] to-[#0d162d] border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantía de Entrega y Seguro SURA</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              ¿Listo para equipar tu frente de obra?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Accede al catálogo de flota completa, simula tus días de alquiler y genera tu contrato con firma digital en menos de 5 minutos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('catalog')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/30"
            >
              <span>Explorar Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="tel:+573108924411"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Patio: 310 892 4411</span>
            </a>
          </div>

        </div>

      </section>

    </div>
  );
};
