import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { ReviewSummary, ToolComment, OccupiedDateRange, ToolMaintenanceOrder } from '../../types';
import { 
  X, 
  Wrench, 
  Cpu, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  Calendar, 
  MessageSquare, 
  Send, 
  Star, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  Flame,
  Activity,
  CornerDownRight,
  Shield,
  FileCheck2,
  Heart,
  Boxes,
  Hammer
} from 'lucide-react';
import { formatImageUrl, handleImageError } from '../../utils/imageUtils';

export const ToolDetailModal: React.FC = () => {
  const { 
    selectedToolDetail, 
    setSelectedToolDetail, 
    addToCart, 
    user, 
    showToast,
    favorites,
    toggleFavorite 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'specs' | 'telemetry' | 'calendar' | 'qa' | 'maintenance'>('specs');
  const [reviews, setReviews] = useState<ReviewSummary | null>(null);
  const [comments, setComments] = useState<ToolComment[]>([]);
  const [occupiedDates, setOccupiedDates] = useState<OccupiedDateRange[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<ToolMaintenanceOrder[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [testStartDate, setTestStartDate] = useState('');
  const [testEndDate, setTestEndDate] = useState('');
  const [checkResult, setCheckResult] = useState<{ available: boolean; message: string } | null>(null);

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testStartDate || !testEndDate) return;
    if (testStartDate > testEndDate) {
      setCheckResult({ available: false, message: 'La fecha de inicio debe ser anterior o igual a la fecha final.' });
      return;
    }

    const conflictRental = occupiedDates.find(r => {
      return (testStartDate <= r.endDate && testEndDate >= r.startDate);
    });

    if (conflictRental) {
      setCheckResult({
        available: false,
        message: `Conflicto de fechas con reserva activa ${conflictRental.reservationCode} (${conflictRental.startDate} a ${conflictRental.endDate}). Por favor elige otro intervalo.`
      });
      return;
    }

    const conflictMaint = maintenanceHistory.find(m => {
      const mEnd = m.endDate || m.startDate;
      return (testStartDate <= mEnd && testEndDate >= m.startDate && m.status !== 'CANCELADO');
    });

    if (conflictMaint) {
      setCheckResult({
        available: false,
        message: `Conflicto técnico: Maquinaria en orden de taller ${conflictMaint.maintenanceType} (${conflictMaint.startDate} a ${conflictMaint.endDate || 'en curso'}).`
      });
      return;
    }

    setCheckResult({
      available: true,
      message: `¡Equipo 100% disponible! Puedes solicitar el despacho en obra para las fechas del ${testStartDate} al ${testEndDate}.`
    });
  };

  useEffect(() => {
    if (!selectedToolDetail) return;

    // Cargar información complementaria
    rentaService.reviews.getByTool(selectedToolDetail.id)
      .then(res => setReviews(res))
      .catch(() => {});

    rentaService.comments.getByTool(selectedToolDetail.id)
      .then(res => setComments(res))
      .catch(() => {});

    rentaService.tools.getOccupiedDates(selectedToolDetail.id)
      .then(res => setOccupiedDates(res))
      .catch(() => {});

    rentaService.maintenance.getByTool(selectedToolDetail.id)
      .then(res => setMaintenanceHistory(res))
      .catch(() => {});
  }, [selectedToolDetail]);

  if (!selectedToolDetail) return null;

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmittingQuestion(true);
    try {
      const created = await rentaService.comments.create(selectedToolDetail.id, newQuestion);
      setComments(prev => [...prev, created]);
      setNewQuestion('');
      showToast('Pregunta técnica enviada al patio de maquinaria', 'success');
    } catch (err: any) {
      showToast(`Error al enviar pregunta: ${err.message}`, 'error');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const telemetry = selectedToolDetail.telemetry ?? {
    horometro: 245,
    fuelOrBatteryLevel: 82,
    nextServiceHours: 55,
    retieCertified: true,
    operatingTemp: 74,
    vibrationLevel: 'ÓPTIMO' as const
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E05A2B]/10 border border-[#D94E1F] flex items-center justify-center text-[#D94E1F]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#D94E1F] font-semibold uppercase tracking-wider">
                  SKU: {selectedToolDetail.codeSku}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedToolDetail.categoryName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {selectedToolDetail.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(selectedToolDetail.id)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                favorites.includes(selectedToolDetail.id)
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-slate-700'
              }`}
              title={favorites.includes(selectedToolDetail.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              aria-label="Favorito"
            >
              <Heart className={`w-4 h-4 ${favorites.includes(selectedToolDetail.id) ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={() => setSelectedToolDetail(null)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-[#0c1220] overflow-x-auto">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-[#D94E1F] text-[#D94E1F]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Ficha Técnica 4FN</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'telemetry'
                ? 'border-[#D94E1F] text-[#D94E1F]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Telemetría IoT en Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'calendar'
                ? 'border-[#D94E1F] text-[#D94E1F]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Disponibilidad en Patio ({occupiedDates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'qa'
                ? 'border-[#D94E1F] text-[#D94E1F]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Consultas Técnicas & Reseñas ({comments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'maintenance'
                ? 'border-[#D94E1F] text-[#D94E1F]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-amber-400" />
            <span>Hoja de Vida & Taller ({maintenanceHistory.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: FICHA TÉCNICA */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tool Image and Quick Meta */}
              <div className="space-y-4">
                <div className="aspect-[4/3] rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                  <img 
                    src={formatImageUrl(selectedToolDetail.mainImageUrl)} 
                    alt={selectedToolDetail.name}
                    className="w-full h-full object-cover" 
                    onError={handleImageError}
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Patio Proveedor:</span>
                    <span className="text-slate-200 font-semibold">{selectedToolDetail.providerName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Fabricante:</span>
                    <span className="text-slate-200 font-semibold">{selectedToolDetail.brand}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Modelo:</span>
                    <span className="text-slate-200 font-semibold font-mono">{selectedToolDetail.model}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Póliza Sura Todo Riesgo:</span>
                    <span className="text-emerald-400 font-mono font-semibold">Vigente (No. 98421)</span>
                  </div>
                  {selectedToolDetail.stockQuantity != null && (
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Disponibilidad en Flota:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {selectedToolDetail.stockQuantity} unidades en patio
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Spec List */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Especificaciones Homologadas
                </h4>

                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 text-xs">
                  <div className="flex justify-between p-3 bg-slate-900/40">
                    <span className="text-slate-400">Capacidad / Potencia</span>
                    <span className="text-slate-200 font-semibold">Calibrada bajo norma ISO 9001</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-900/20">
                    <span className="text-slate-400">Condición Operativa</span>
                    <span className="text-emerald-400 font-semibold">100% Inspeccionada pre-despacho</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-900/40">
                    <span className="text-slate-400">Protocolo de Despacho</span>
                    <span className="text-slate-200 font-semibold">Acta 4FN con registro fotográfico</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-900/20">
                    <span className="text-slate-400">Tiempo de Entrega</span>
                    <span className="text-[#D94E1F] font-semibold">24 horas hábiles a obra</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-900/40">
                    <span className="text-slate-400">Facturación Legal</span>
                    <span className="text-sky-300 font-semibold">Electrónica DIAN con código CUFE</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/20 border border-[#D94E1F] text-xs text-[#D94E1F] space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#D94E1F]" />
                    Custodia Escrow de Depósito
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    El depósito en garantía de ${selectedToolDetail.depositAmount.toLocaleString('es-CO')} queda retenido en fiducia segura y se reintegra automáticamente tras la inspección de retorno sin novedades.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRÍA IOT EN VIVO */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="text-xs font-semibold text-white">Transmisión IoT Activa · Módulo Celular LTE</span>
                    <div className="text-[11px] font-mono text-slate-400">Último paquete recibido: Hace 2 minutos</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  En Línea
                </span>
              </div>

              {/* Gauges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Horómetro Digital */}
                <div className="p-5 rounded-xl bg-[#0b101d] border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                    <span className="font-semibold uppercase tracking-wider">Horómetro Digital</span>
                    <Gauge className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="bg-black/60 p-3 rounded-lg border border-slate-700/80 text-center font-mono text-2xl font-black text-amber-400 tracking-widest shadow-inner">
                    {telemetry.horometro.toString().padStart(5, '0')}.4 <span className="text-xs text-slate-400">HRS</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-3 text-center">
                    Próximo mantenimiento en: <span className="text-white font-mono">{telemetry.nextServiceHours} hrs</span>
                  </div>
                </div>

                {/* Combustible / Batería */}
                <div className="p-5 rounded-xl bg-[#0b101d] border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                    <span className="font-semibold uppercase tracking-wider">Nivel de Combustible</span>
                    <Zap className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white font-mono">{telemetry.fuelOrBatteryLevel}%</div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 border border-slate-700">
                      <div 
                        className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${telemetry.fuelOrBatteryLevel}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-3 text-center">
                    Tanque inspeccionado y sellado pre-despacho
                  </div>
                </div>

                {/* Sensores de Operación */}
                <div className="p-5 rounded-xl bg-[#0b101d] border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                    <span className="font-semibold uppercase tracking-wider">Estado de Sensores</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-400" /> Temperatura:
                      </span>
                      <span className="font-mono text-white font-semibold">{telemetry.operatingTemp}°C (Normal)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-[#D94E1F]" /> Vibración:
                      </span>
                      <span className="font-mono text-emerald-400 font-semibold">{telemetry.vibrationLevel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> RETIE:
                      </span>
                      <span className="text-sky-300 font-semibold font-mono">Certificado Vigente</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 text-center">
                    Auditoría continua de fallas
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: CALENDARIO DE OCUPACIÓN Y VERIFICADOR DE FECHAS */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              
              {/* Verificador Interactivo de Disponibilidad */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Verificador de Disponibilidad para tu Obra
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Validación algorítmica de no-solapamiento
                  </span>
                </div>

                <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Fecha Inicio Deseada
                    </label>
                    <input
                      type="date"
                      value={testStartDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setTestStartDate(e.target.value);
                        setCheckResult(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Fecha Fin Deseada
                    </label>
                    <input
                      type="date"
                      value={testEndDate}
                      min={testStartDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setTestEndDate(e.target.value);
                        setCheckResult(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={!testStartDate || !testEndDate}
                      className="w-full py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Comprobar Fechas</span>
                    </button>
                  </div>
                </form>

                {/* Banner de resultado */}
                {checkResult && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    checkResult.available 
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}>
                    {checkResult.available ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold">
                        {checkResult.available ? 'Fechas Disponibles sin Conflicto' : 'Conflicto de Disponibilidad'}
                      </div>
                      <p className="text-[11px] leading-relaxed">{checkResult.message}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cronograma de Ocupación por Alquileres */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cronograma de Alquileres Asignados ({occupiedDates.length})
                  </h4>
                  <span className="text-[11px] font-mono text-amber-400">En Obra</span>
                </div>

                {occupiedDates.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                    No registra alquileres vigentes en las próximas semanas. Maquinaria en patio lista para despacho.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {occupiedDates.map((range, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="font-mono text-slate-300 font-semibold">
                            {range.startDate} ➔ {range.endDate}
                          </span>
                        </div>
                        <span className="font-mono text-amber-300 text-[11px] bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                          Reserva: {range.reservationCode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cronograma de Mantenimientos y Calibraciones en Taller */}
              {maintenanceHistory.filter(m => m.status === 'EN_PROCESO' || m.status === 'PROGRAMADO').length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Hammer className="w-3.5 h-3.5 text-rose-400" />
                      Intervenciones en Taller & Calibración RETIE
                    </h4>
                    <span className="text-[11px] font-mono text-rose-400">En Taller</span>
                  </div>

                  <div className="grid gap-2">
                    {maintenanceHistory
                      .filter(m => m.status === 'EN_PROCESO' || m.status === 'PROGRAMADO')
                      .map((m) => (
                        <div 
                          key={m.id}
                          className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-white font-bold">
                                {m.startDate} ➔ {m.endDate || 'En proceso'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                                {m.maintenanceType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{m.description}</p>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">
                            {m.technicianName || 'Técnico Certificado'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: CONSULTAS & RESEÑAS */}
          {activeTab === 'qa' && (
            <div className="space-y-6">
              {/* Formulario de nueva pregunta */}
              <form onSubmit={handlePostQuestion} className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Hacer una consulta técnica al patio
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ej. ¿Qué tipo de combustible requiere? ¿Incluye operario certificado?"
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D94E1F]"
                  />
                  <button
                    type="submit"
                    disabled={submittingQuestion || !newQuestion.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#D94E1F] hover:bg-[#E05A2B] disabled:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Preguntar</span>
                  </button>
                </div>
              </form>

              {/* Lista de preguntas */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Historial de Consultas de Obra ({comments.length})
                </h4>

                {comments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No hay preguntas aún para este equipo. ¡Sé el primero en consultar!
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{c.authorName}</span>
                        <span className="text-[11px] font-mono text-slate-500">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-300">{c.content}</p>

                      {c.officialReply && (
                        <div className="ml-4 p-2.5 rounded-lg bg-indigo-950/30 border border-[#D94E1F] text-[11px] space-y-1">
                          <div className="flex items-center gap-1 text-[#D94E1F] font-semibold">
                            <CornerDownRight className="w-3 h-3" />
                            <span>Respuesta oficial de {c.officialReply.providerName}</span>
                          </div>
                          <p className="text-slate-300">{c.officialReply.replyContent}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Reseñas y calificaciones */}
              {reviews && reviews.reviews.length > 0 && (
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Reseñas de Constructoras ({reviews.totalReviews})
                    </h4>
                    <div className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{reviews.averageRating.toFixed(1)} / 5.0</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {reviews.reviews.map(r => (
                      <div key={r.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs">
                        <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                          <span className="font-medium text-slate-200">{r.clientName}</span>
                          <span className="text-amber-400 font-mono">Calificación: {r.rating}/5</span>
                        </div>
                        <p className="text-slate-300">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HOJA DE VIDA TÉCNICA & TALLER */}
          {activeTab === 'maintenance' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Hoja de Vida Mecánica Certificada & Dictamen RETIE</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Historial público e inmutable de mantenimientos, calibraciones de impacto y pruebas dieléctricas.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                  RETIE CERTIFICADO
                </span>
              </div>

              {maintenanceHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/30 border border-slate-800/60 rounded-xl">
                  Equipo nuevo en inventario. Próximo mantenimiento preventivo programado a las 200 horas de operación.
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceHistory.map((order, idx) => (
                    <div key={order.id || idx} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.maintenanceType === 'PREVENTIVO'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : order.maintenanceType === 'CORRECTIVO'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {order.maintenanceType}
                          </span>
                          <span className="text-xs font-bold text-white">
                            Intervención Técnica #{order.id}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.status === 'FINALIZADO'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {order.status === 'FINALIZADO' ? 'COMPLETADO & AUDITADO' : 'EN TALLER'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {order.description}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                        <div>
                          <span className="text-slate-500 block">Técnico Certificado:</span>
                          <span className="text-slate-200">{order.technicianName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Periodo de Servicio:</span>
                          <span className="text-slate-300">{order.startDate} {order.endDate ? `a ${order.endDate}` : ''}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Costo de Intervención:</span>
                          <span className="text-white font-bold">${Number(order.cost || 0).toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-[#0a0f1d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[11px] text-slate-400 block">Tarifa por día</span>
              <span className="text-xl font-black font-mono text-white">
                ${selectedToolDetail.baseDailyPrice.toLocaleString('es-CO')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Depósito en Garantía</span>
              <span className="text-sm font-mono text-slate-300">
                ${selectedToolDetail.depositAmount.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setSelectedToolDetail(null)}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                addToCart(selectedToolDetail, 3);
                setSelectedToolDetail(null);
              }}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-[#D94E1F] hover:bg-[#E05A2B] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Añadir a Cotización</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
