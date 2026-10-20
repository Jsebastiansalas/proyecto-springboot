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
  Phone,
  Building,
  Eye,
  FileCheck
} from 'lucide-react';

interface HomePageProps {
  featuredTools: Tool[];
}

export const HomePage: React.FC<HomePageProps> = ({ featuredTools }) => {
  const { setActiveView, setSelectedToolDetail, addToCart } = useApp();

  // Estado del selector de telemetría interactiva IoT vs Ficha técnica
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
    <div className="space-y-20 pb-20 animate-in fade-in duration-300">
      
      {/* =========================================================================
          1. HERO PRINCIPAL: HIERRO FUNDIDO, ASFALTO & NARANJA TERRACOTA INDUSTRIAL
             (Inspirado en Hilti, Hitachi Construction y estudios de arquitectura)
         ========================================================================= */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden text-center bg-[#181816] blueprint-grid border-b border-[#363632]">
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          
          {/* Badge superior técnico (R3.1) */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#232320] border border-[#3F3E3A] text-[#F5F4F0] text-xs font-mono uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 bg-[#D94E1F] rounded-xs inline-block" />
            <span>SISTEMA NACIONAL DE MAQUINARIA PESADA • COLOMBIA</span>
          </div>

          {/* Gran titular limpio con acento Terracota (R2.3) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#F5F4F0] tracking-tight leading-[1.08]">
            Ingeniería Pesada. <br className="hidden sm:inline" />
            <span>Renta, Monitorea </span>
            <span className="text-[#E05A2B]">& Construye.</span>
          </h1>

          {/* Subtítulo técnico y espacioso */}
          <p className="text-[#A8A69E] text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Accede a maquinaria pesada y equipos certificados para obras de infraestructura en Colombia. Telemetría IoT en tiempo real, fianza en custodia Escrow y despacho express en 24h a pie de obra.
          </p>

          {/* Botones de acción arquitectónicos (R3.2 - esquinas rounded-lg, 1px border) */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => setActiveView('catalog')}
              className="px-6 py-3.5 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-bold text-sm flex items-center gap-2.5 border border-[#B83D14] transition-all shadow-md group"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#simulador-presupuesto"
              className="px-6 py-3.5 rounded-lg bg-[#232320] hover:bg-[#2B2B28] text-[#F5F4F0] hover:border-[#D94E1F] font-semibold text-sm flex items-center gap-2 border border-[#4A4944] transition-all"
            >
              <span>Simular Presupuesto</span>
              <ArrowRight className="w-4 h-4 text-[#A8A69E]" />
            </a>
          </div>

          {/* Barra horizontal de 4 celdas técnicas tipo plano arquitectónico (R3.3) */}
          <div className="max-w-5xl mx-auto px-2 pt-10">
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-[#33332F] py-3.5 gap-y-3 font-mono text-[11px] sm:text-xs text-[#A8A69E] tracking-wider uppercase font-semibold">
              <div className="flex items-center justify-center md:border-r border-[#33332F] px-3">
                <span className="text-[#D94E1F] font-bold mr-1.5">01 //</span> DESPACHO A OBRA EN 24H
              </div>
              <div className="flex items-center justify-center md:border-r border-[#33332F] px-3">
                <span className="text-[#D94E1F] font-bold mr-1.5">02 //</span> TARIFA SEMANAL -15% AUTOMÁTICO
              </div>
              <div className="flex items-center justify-center md:border-r border-[#33332F] px-3">
                <span className="text-[#D94E1F] font-bold mr-1.5">03 //</span> FIANZA EN CUSTODIA REEMBOLSABLE
              </div>
              <div className="flex items-center justify-center px-3">
                <span className="text-[#D94E1F] font-bold mr-1.5">04 //</span> FACTURACIÓN ELECTRÓNICA DIAN (IVA 19%)
              </div>
            </div>
          </div>

        </div>

      </section>


      {/* =========================================================================
          2. HERO SHOWCASE: MAQUINARIA PESADA Y TARJETA FLOTANTE INDUSTRIAL
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden border border-[#363632] shadow-xl bg-[#181816] group">
          
          {/* Fotografía de maquinaria pesada */}
          <div className="relative w-full h-[420px] sm:h-[500px] md:h-[540px] overflow-hidden">
            <img
              src="images/hero-excavator-studio.jpg"
              alt="Excavadora Develon DX510LC Flota Pesada"
              className="w-full h-full object-cover object-[25%_center] sm:object-center transition-transform duration-700 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181816] via-transparent to-transparent sm:hidden" />
            <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-[#181816]/30 to-[#181816]/95" />
          </div>

          {/* Tarjeta Flotante Técnica en Grafito */}
          <div className="sm:absolute sm:right-8 sm:bottom-8 sm:top-8 sm:my-auto sm:max-w-md p-6 sm:p-8 rounded-xl bg-[#232320]/95 border border-[#363632] shadow-2xl flex flex-col justify-between m-4 sm:m-0 space-y-4">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#D94E1F]/15 border border-[#D94E1F]/30 text-[#D94E1F] text-xs font-mono font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-xs bg-[#D94E1F]" />
                <span>NUEVA INCORPORACIÓN · FLOTA 2026</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#F5F4F0] tracking-tight leading-tight">
                Excavadora Develon DX510LC
              </h2>

              <p className="text-xs sm:text-sm text-[#A8A69E] leading-relaxed font-normal">
                Potencia pesada de 50 toneladas para excavación masiva, minería y cimentación profunda. Equipada con telemetría satelital Trimble 3D y certificación RETIE al día.
              </p>
            </div>

            {/* Chips de especificaciones técnicas */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-1">
              <div className="p-2 rounded-lg bg-[#181816] border border-[#363632] text-[#F5F4F0]">
                <div className="text-[10px] uppercase text-[#706E66]">Capacidad</div>
                <div className="font-bold text-[#E05A2B]">50 Ton</div>
              </div>
              <div className="p-2 rounded-lg bg-[#181816] border border-[#363632] text-[#F5F4F0]">
                <div className="text-[10px] uppercase text-[#706E66]">Potencia</div>
                <div className="font-bold text-[#F5F4F0]">385 HP</div>
              </div>
              <div className="p-2 rounded-lg bg-[#181816] border border-[#363632] text-[#F5F4F0]">
                <div className="text-[10px] uppercase text-[#706E66]">Horómetro</div>
                <div className="font-bold text-[#1E6F43]">IoT 24/7</div>
              </div>
            </div>

            {/* Botón de acción en Naranja Terracota */}
            <div className="pt-2">
              <button
                onClick={() => setActiveView('catalog')}
                className="w-full py-3.5 px-5 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md group"
              >
                <span>VER FLOTA DISPONIBLE</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A8A69E] mt-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6F43]" />
                <span>Despacho a pie de obra en menos de 24 horas</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          3. GEMELO DIGITAL Y TELEMETRÍA IOT EN VIVO (BOBCAT S570)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Explicación Técnica y Beneficios */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#E3F1E8] border border-[#A7D7B8] text-[#1E6F43] text-xs font-mono font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Transparencia Operativa 100% Digital</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#181816] tracking-tight">
              Telemetría Satelital en Tiempo Real. <br />
              <span className="text-[#78766F]">Cero disputas por horas o consumo.</span>
            </h2>

            <p className="text-[#57564F] text-sm leading-relaxed">
              Cada equipo de nuestra flota cuenta con hardware IoT industrial embebido. Como contratista, tienes acceso al horómetro digital exacto, niveles de combustible, diagnóstico térmico y alertas de vibración desde cualquier dispositivo.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#D6D3C9] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#D94E1F] font-semibold text-xs">
                  <Gauge className="w-4 h-4" />
                  <span>Horómetro Irrefutable</span>
                </div>
                <p className="text-xs text-[#57564F]">
                  Facturación milimétrica por horas efectivas de motor sin lecturas manuales.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#D6D3C9] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#1E6F43] font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Seguro SURA Activo</span>
                </div>
                <p className="text-xs text-[#57564F]">
                  Cobertura Todo Riesgo y auxilio mecánico en patio en menos de 2 horas.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta Interactiva con Switch IoT vs Ficha Técnica */}
          <div className="lg:col-span-6">
            <div className="bg-[#FAF9F5] border border-[#D6D3C9] rounded-2xl p-6 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#D6D3C9]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E6F43] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#181816] uppercase tracking-wider">
                    Telemetría en Vivo · IoT 4FN
                  </span>
                </div>

                <div className="flex bg-[#E8E5DC] p-0.5 rounded-lg border border-[#D6D3C9] text-[11px] font-semibold">
                  <button
                    onClick={() => setTelemetryMode('telemetry')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      telemetryMode === 'telemetry'
                        ? 'bg-[#181816] text-white shadow-sm'
                        : 'text-[#57564F] hover:text-[#181816]'
                    }`}
                  >
                    Sensores IoT
                  </button>
                  <button
                    onClick={() => setTelemetryMode('specs')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      telemetryMode === 'specs'
                        ? 'bg-[#181816] text-white shadow-sm'
                        : 'text-[#57564F] hover:text-[#181816]'
                    }`}
                  >
                    Ficha 4FN
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/10] rounded-xl bg-[#E8E5DC] border border-[#D6D3C9] overflow-hidden flex items-center justify-center">
                <img
                  src="images/tools/HERR-0017.jpg"
                  alt="Minicargador Bobcat S570"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] text-[10px] font-mono text-[#1E6F43] border border-[#A7D7B8] font-semibold">
                    DISPONIBLE EN PATIO
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#181816] text-[10px] font-mono text-[#F5F4F0] border border-[#363632]">
                    SKU: HERR-0017
                  </span>
                </div>
              </div>

              {telemetryMode === 'telemetry' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-[#181816]">Minicargador Bobcat S570</h4>
                    <span className="text-xs font-mono font-bold text-[#D94E1F]">$480.000 /día</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#E8E5DC] border border-[#D6D3C9]">
                      <div className="flex items-center justify-center gap-1 text-[#B45309] mb-1">
                        <Gauge className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase text-[#78766F]">Horómetro</span>
                      </div>
                      <div className="font-bold text-[#181816] text-sm">168.4 <span className="text-[10px] font-normal text-[#78766F]">h</span></div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#E8E5DC] border border-[#D6D3C9]">
                      <div className="flex items-center justify-center gap-1 text-[#D94E1F] mb-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase text-[#78766F]">Batería</span>
                      </div>
                      <div className="font-bold text-[#181816] text-sm">88%</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#E8E5DC] border border-[#D6D3C9]">
                      <div className="flex items-center justify-center gap-1 text-[#1E6F43] mb-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase text-[#78766F]">RETIE</span>
                      </div>
                      <div className="font-bold text-[#1E6F43] text-sm">VIGENTE</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#E8E5DC]/60 border border-[#D6D3C9] flex items-center justify-between text-xs text-[#57564F]">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#B91C1C]" /> Temperatura: 76°C
                    </span>
                    <span className="flex items-center gap-1.5 text-[#1E6F43]">
                      <Activity className="w-3.5 h-3.5" /> Vibración: ÓPTIMO
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-[#181816]">Especificaciones de Fabricante</h4>
                    <span className="text-xs font-mono text-[#78766F]">Bobcat · MOD-219</span>
                  </div>

                  <div className="space-y-1.5 border border-[#D6D3C9] rounded-lg p-2.5 bg-[#E8E5DC]/50">
                    <div className="flex justify-between text-[#57564F]">
                      <span>Potencia de Motor:</span>
                      <span className="font-semibold text-[#181816]">61 HP Diésel Turbo</span>
                    </div>
                    <div className="flex justify-between text-[#57564F]">
                      <span>Capacidad Operativa:</span>
                      <span className="font-semibold text-[#181816]">1.2 Toneladas</span>
                    </div>
                    <div className="flex justify-between text-[#57564F]">
                      <span>Póliza Todo Riesgo:</span>
                      <span className="font-mono text-[#1E6F43]">SURA No. 98421</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  const bobcat = featuredTools.find(t => t.id === 17) || featuredTools[0];
                  if (bobcat) addToCart(bobcat, 7);
                }}
                className="w-full py-2.5 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
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
        
        <div className="p-6 sm:p-10 rounded-2xl bg-[#FAF9F5] border border-[#D6D3C9] shadow-sm space-y-8">
          
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#D94E1F] text-xs font-mono font-semibold mb-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>SIMULADOR INTELIGENTE DE PRESUPUESTO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#181816] tracking-tight">
              ¿Cuánto costará la maquinaria para tu frente de obra?
            </h2>
            <p className="text-xs sm:text-sm text-[#57564F] mt-1">
              Selecciona el tipo de trabajo y ajusta los días. Nuestro algoritmo aplica el 15% de ahorro semanal y desglosa el depósito escrow en custodia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Controles del simulador */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#78766F] block mb-3 font-mono">
                  1. Tipo de Frente de Trabajo
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {estimatorCategories.map((cat, idx) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategoryIndex(idx)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedCategoryIndex === idx
                          ? 'bg-[#FAF9F5] border-2 border-[#D94E1F] text-[#181816] shadow-sm'
                          : 'bg-[#E8E5DC] border-[#D6D3C9] text-[#57564F] hover:border-[#B8B5AB]'
                      }`}
                    >
                      <div className="font-semibold text-xs leading-tight">{cat.name}</div>
                      <div className="text-[11px] font-mono text-[#D94E1F] mt-1 font-bold">
                        Desde ${cat.daily.toLocaleString('es-CO')} /día
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold uppercase tracking-wider text-[#78766F] font-mono">
                    2. Duración Estimada de Operación:
                  </label>
                  <span className="font-mono font-bold text-[#D94E1F] text-sm bg-[#D94E1F]/10 px-3 py-1 rounded-md border border-[#D94E1F]/20">
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
                  className="w-full accent-[#D94E1F] cursor-pointer h-2 bg-[#E8E5DC] rounded-lg"
                />

                <div className="flex justify-between text-[11px] font-mono text-[#78766F]">
                  <span>1 Día (Express)</span>
                  <span>7 Días (-15% OFF)</span>
                  <span>15 Días</span>
                  <span>30 Días (Mes)</span>
                </div>
              </div>

              {hasWeeklyDiscount && (
                <div className="p-3 rounded-lg bg-[#E3F1E8] border border-[#A7D7B8] flex items-center gap-2.5 text-xs text-[#1E6F43]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Descuento Corporativo Activado:</strong> Ahorraste ${discountAmount.toLocaleString('es-CO')} COP por alquiler superior a 7 días.
                  </span>
                </div>
              )}

            </div>

            {/* Recibo dinámico de cotización en Asfalto Puro */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-xl bg-[#181816] border border-[#363632] shadow-xl space-y-4 font-mono text-xs">
                
                <div className="flex items-center justify-between pb-3 border-b border-[#363632] text-[#F5F4F0]">
                  <span className="font-sans font-bold text-sm">Desglose Estimado</span>
                  <span className="text-[10px] bg-[#232320] px-2 py-0.5 rounded text-[#A8A69E] border border-[#3F3E3A]">TRM Bogotá</span>
                </div>

                <div className="space-y-2 text-[#A8A69E]">
                  <div className="flex justify-between">
                    <span>Tarifa diaria base:</span>
                    <span className="text-[#F5F4F0]">${currentCategory.daily.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal ({estimateDays} días):</span>
                    <span className="text-[#F5F4F0]">${subtotalBase.toLocaleString('es-CO')} COP</span>
                  </div>

                  {hasWeeklyDiscount && (
                    <div className="flex justify-between text-[#1E6F43] font-semibold">
                      <span>Descuento semanal (-15%):</span>
                      <span>-${discountAmount.toLocaleString('es-CO')} COP</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>IVA (19% deducible):</span>
                    <span className="text-[#F5F4F0]">${iva.toLocaleString('es-CO')} COP</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-[#363632]">
                    <span className="text-[#D94E1F] flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Depósito Escrow:
                    </span>
                    <span className="text-[#D94E1F] font-bold">${currentCategory.deposit.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="text-[10px] text-[#706E66] italic">
                    * El depósito se libera 100% al devolver el equipo sin daños.
                  </div>
                </div>

                <div className="pt-3 border-t border-[#363632] flex justify-between items-baseline">
                  <span className="font-sans font-bold text-sm text-[#F5F4F0]">Total con Depósito:</span>
                  <span className="font-bold text-lg text-[#1E6F43]">
                    ${totalEstimado.toLocaleString('es-CO')} <span className="text-[10px] font-normal text-[#A8A69E]">COP</span>
                  </span>
                </div>

                <button
                  onClick={() => setActiveView('catalog')}
                  className="w-full py-3 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-sans font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md group mt-2"
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
          5. TOP 3 MAQUINARIA DESTACADA: ESTILO ARQUITECTÓNICO CONCRETO & HIERRO
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D94E1F]">
              Disponibilidad Inmediata
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#181816] tracking-tight mt-1">
              Flota Pesada Destacada
            </h2>
          </div>

          <button
            onClick={() => setActiveView('catalog')}
            className="text-xs font-semibold text-[#D94E1F] hover:text-[#B83D14] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Ver todo el catálogo (180+ equipos)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3Tools.map((tool) => (
            <div 
              key={tool.id}
              className="bg-[#FAF9F5] border border-[#D6D3C9] rounded-xl overflow-hidden shadow-sm hover:border-[#D94E1F] transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] bg-[#E8E5DC] overflow-hidden border-b border-[#D6D3C9]">
                <img
                  src={tool.mainImageUrl || 'images/tools/HERR-0017.jpg'}
                  alt={tool.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#FAF9F5] text-[10px] font-mono text-[#1E6F43] border border-[#A7D7B8] font-bold shadow-xs">
                    DISPONIBLE
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-md bg-[#181816] text-[10px] font-mono text-[#F5F4F0] border border-[#363632]">
                    {tool.categoryName}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-mono text-[#78766F] uppercase tracking-wide">
                    {tool.brand} · {tool.model}
                  </div>
                  <h3 className="font-bold text-[#181816] text-base mt-1 line-clamp-1 group-hover:text-[#D94E1F] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-[#57564F] line-clamp-2 mt-1.5 font-normal">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D6D3C9] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#78766F] uppercase font-mono">Tarifa Base</div>
                    <div className="text-sm font-black font-mono text-[#181816]">
                      ${tool.baseDailyPrice.toLocaleString('es-CO')} <span className="text-[10px] text-[#78766F] font-normal">/día</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedToolDetail(tool)}
                      className="p-2 rounded-lg bg-[#E8E5DC] hover:bg-[#D6D3C9] text-[#181816] transition-colors"
                      title="Ver Ficha Técnica"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addToCart(tool, 1)}
                      className="px-3.5 py-2 rounded-lg bg-[#181816] hover:bg-[#D94E1F] text-white font-semibold text-xs transition-colors shadow-xs"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FAF9F5] border border-[#D6D3C9] text-[#D94E1F] text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Seguridad B2B Contractual</span>
          </div>
          <h2 className="text-3xl font-black text-[#181816] tracking-tight">
            El Estándar 4FN de Confianza Operativa
          </h2>
          <p className="text-xs sm:text-sm text-[#57564F]">
            Diseñado para cumplir los requisitos de auditoría y compliance de constructoras en Colombia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#D6D3C9] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#E8E5DC] flex items-center justify-center text-[#D94E1F]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#181816]">Telemetría IoT Activa</h3>
            <p className="text-xs text-[#57564F] leading-relaxed">
              Monitoreo satelital continuo de horómetros y estado mecánico para evitar disputas en las horas liquidadas.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#D6D3C9] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#E3F1E8] flex items-center justify-center text-[#1E6F43]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#181816]">Custodia Escrow</h3>
            <p className="text-xs text-[#57564F] leading-relaxed">
              Tu depósito de garantía permanece bloqueado en custodia fiduciaria y se reintegra al finalizar el acta de entrega.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#D6D3C9] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#E8E5DC] flex items-center justify-center text-[#181816]">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#181816]">Despacho Express 24h</h3>
            <p className="text-xs text-[#57564F] leading-relaxed">
              Flota propia de camas bajas que transporta la maquinaria directamente al campamento de obra en Bogotá y Cundinamarca.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#D6D3C9] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#B45309]">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#181816]">Factura DIAN con CUFE</h3>
            <p className="text-xs text-[#57564F] leading-relaxed">
              Generación y timbrado electrónico legal en cada ciclo para deducción tributaria inmediata de tu compañía constructora.
            </p>
          </div>

        </div>

      </section>


      {/* =========================================================================
          7. CONSTRUCTORAS ALIADAS & PROYECTOS EN OPERACIÓN
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-xl bg-[#E8E5DC] border border-[#D6D3C9] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#78766F]">
              Alianzas Corporativas de Construcción
            </div>
            <div className="text-sm font-bold text-[#181816]">
              Más de 45 constructoras y consorcios operan con el respaldo RentaMaq
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono font-semibold text-[#57564F]">
            <span className="hover:text-[#181816]">Consorcio Bogotá Norte</span>
            <span>·</span>
            <span className="hover:text-[#181816]">Amarilo Obra Civil</span>
            <span>·</span>
            <span className="hover:text-[#181816]">Conconcreto Vías</span>
            <span>·</span>
            <span className="hover:text-[#181816]">Marval Andina</span>
          </div>
        </div>
      </section>


      {/* =========================================================================
          8. CTA FINAL: ASFALTO PURO & NARANJA TERRACOTA
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-2xl p-8 sm:p-12 overflow-hidden bg-[#181816] blueprint-grid border border-[#363632] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#F5F4F0] bg-[#232320] px-3 py-1 rounded-md border border-[#3F3E3A]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6F43]" />
              <span>Garantía de Entrega y Seguro SURA</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#F5F4F0] tracking-tight">
              ¿Listo para equipar tu frente de obra?
            </h2>
            <p className="text-xs sm:text-sm text-[#A8A69E]">
              Accede al catálogo de flota completa, simula tus días de alquiler y genera tu contrato con firma digital en menos de 5 minutos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('catalog')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Explorar Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="tel:+573108924411"
              className="w-full sm:w-auto px-5 py-3.5 rounded-lg bg-[#232320] hover:bg-[#2B2B28] text-[#F5F4F0] font-semibold text-xs flex items-center justify-center gap-2 border border-[#4A4944] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#1E6F43]" />
              <span>Patio: 310 892 4411</span>
            </a>
          </div>

        </div>

      </section>

    </div>
  );
};
