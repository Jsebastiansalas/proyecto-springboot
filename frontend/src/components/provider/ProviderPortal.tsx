import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { 
  Reservation, 
  Tool, 
  ToolMaintenanceOrder, 
  ScheduleMaintenanceRequest, 
  FinishMaintenanceRequest 
} from '../../types';
import { DispatchModal } from './DispatchModal';
import { ReturnInspectionModal } from './ReturnInspectionModal';
import { CreateToolModal } from './CreateToolModal';
import { RetieCertificateModal } from '../common/RetieCertificateModal';
import { DianTaxSettlementModal } from '../common/DianTaxSettlementModal';
import { 
  Truck, 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ClipboardCheck, 
  ShieldCheck, 
  UserCheck, 
  Calendar,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Receipt,
  Hammer,
  Sparkles,
  Check,
  X,
  Percent,
  Award
} from 'lucide-react';

export const ProviderPortal: React.FC = () => {
  const { user, quickDemoLogin, showToast } = useApp();
  
  // Tab activa del proveedor
  const [activeTab, setActiveTab] = useState<'reservations' | 'inventory' | 'billing' | 'maintenance'>('reservations');

  // Estado de reservas
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [selectedForRetieCert, setSelectedForRetieCert] = useState<Reservation | null>(null);
  const [selectedForTaxSettlement, setSelectedForTaxSettlement] = useState<Reservation | null>(null);
  const [selectedForDispatch, setSelectedForDispatch] = useState<Reservation | null>(null);
  const [selectedForReturn, setSelectedForReturn] = useState<Reservation | null>(null);

  // Estado de inventario de herramientas
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [isCreateToolModalOpen, setIsCreateToolModalOpen] = useState(false);

  // Estado de Mantenimiento y Taller
  const [maintenanceOrders, setMaintenanceOrders] = useState<ToolMaintenanceOrder[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [finishingOrder, setFinishingOrder] = useState<ToolMaintenanceOrder | null>(null);

  // Formulario Programar Mantenimiento
  const [scheduleToolId, setScheduleToolId] = useState<number>(0);
  const [scheduleType, setScheduleType] = useState<'PREVENTIVO' | 'CORRECTIVO' | 'CALIBRACION'>('PREVENTIVO');
  const [scheduleTechnician, setScheduleTechnician] = useState<string>('Ing. Gustavo Morales');
  const [scheduleCost, setScheduleCost] = useState<number>(120000);
  const [scheduleDescription, setScheduleDescription] = useState<string>('Mantenimiento preventivo periódico: cambio de aceite, filtros y calibración RETIE.');
  const [scheduleStartDate, setScheduleStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [scheduleEndDate, setScheduleEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // Formulario Finalizar Mantenimiento
  const [finishCost, setFinishCost] = useState<number>(120000);
  const [finishNotes, setFinishNotes] = useState<string>('Mantenimiento ejecutado a satisfacción. Pruebas dinámicas superadas al 100%. Reincorporada a DISPONIBLE.');
  const [finishDate, setFinishDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [submittingFinish, setSubmittingFinish] = useState(false);

  const providerId = user?.providerId || 1;
  const formatCOP = (val?: number | null) => '$ ' + Number(val || 0).toLocaleString('es-CO');

  const fetchProviderReservations = async () => {
    if (!user || (user.role !== 'ROLE_PROVEEDOR' && user.role !== 'ROLE_ADMIN')) {
      setLoadingReservations(false);
      return;
    }
    setLoadingReservations(true);
    try {
      const data = await rentaService.reservations.getByProvider(providerId);
      setReservations(data);
    } catch (err: any) {
      showToast(`Error al cargar flota del proveedor: ${err.message}`, 'error');
    } finally {
      setLoadingReservations(false);
    }
  };

  const fetchProviderTools = async () => {
    setLoadingTools(true);
    try {
      const data = await rentaService.tools.getByProvider(providerId);
      setTools(data);
    } catch (err: any) {
      showToast(`Error al cargar inventario de herramientas: ${err.message}`, 'error');
    } finally {
      setLoadingTools(false);
    }
  };

  const fetchMaintenanceOrders = async () => {
    setLoadingMaintenance(true);
    try {
      const data = await rentaService.maintenance.getByProvider(providerId);
      setMaintenanceOrders(data);
    } catch {
      try {
        const all = await rentaService.maintenance.getAllActive();
        setMaintenanceOrders(all);
      } catch (err: any) {
        showToast(`Error al cargar órdenes de mantenimiento: ${err.message}`, 'error');
      }
    } finally {
      setLoadingMaintenance(false);
    }
  };

  useEffect(() => {
    fetchProviderReservations();
    fetchMaintenanceOrders();
    fetchProviderTools();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchProviderTools();
    } else if (activeTab === 'maintenance') {
      fetchMaintenanceOrders();
      fetchProviderTools();
    }
  }, [activeTab]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleToolId) {
      showToast('Por favor selecciona una herramienta para ingresar a taller.', 'error');
      return;
    }
    setSubmittingSchedule(true);
    try {
      await rentaService.maintenance.schedule({
        toolId: scheduleToolId,
        maintenanceType: scheduleType,
        startDate: scheduleStartDate,
        estimatedEndDate: scheduleEndDate,
        estimatedCost: scheduleCost,
        technicianName: scheduleTechnician,
        description: scheduleDescription
      });
      showToast('Herramienta ingresada a taller. Estado actualizado a MANTENIMIENTO.', 'success');
      setIsScheduleModalOpen(false);
      fetchMaintenanceOrders();
      fetchProviderTools();
    } catch (err: any) {
      showToast(`Error al programar mantenimiento: ${err.message}`, 'error');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleFinishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finishingOrder) return;
    setSubmittingFinish(true);
    try {
      await rentaService.maintenance.finish(finishingOrder.id, {
        completionDate: finishDate,
        finalCost: finishCost,
        resolutionNotes: finishNotes
      });
      showToast('Mantenimiento finalizado con éxito. Herramienta reincorporada a DISPONIBLE.', 'success');
      setFinishingOrder(null);
      fetchMaintenanceOrders();
      fetchProviderTools();
    } catch (err: any) {
      showToast(`Error al finalizar mantenimiento: ${err.message}`, 'error');
    } finally {
      setSubmittingFinish(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await rentaService.reservations.approve(id);
      showToast('Reserva aprobada. Lista para despacho 4FN.', 'success');
      fetchProviderReservations();
    } catch (err: any) {
      showToast(`Error al aprobar reserva: ${err.message}`, 'error');
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Indica el motivo técnico del rechazo:') || 'Indisponibilidad en patio por mantenimiento';
    try {
      await rentaService.reservations.reject(id, reason);
      showToast('Reserva rechazada.', 'info');
      fetchProviderReservations();
    } catch (err: any) {
      showToast(`Error al rechazar reserva: ${err.message}`, 'error');
    }
  };

  const handleToggleToolStatus = async (toolId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'DISPONIBLE' ? 'MANTENIMIENTO' : 'DISPONIBLE';
    try {
      await rentaService.tools.updateStatus(toolId, nextStatus);
      showToast(`Estado de herramienta cambiado a ${nextStatus}.`, 'success');
      fetchProviderTools();
    } catch (err: any) {
      showToast(`Error al cambiar estado: ${err.message}`, 'error');
    }
  };

  const handleDeleteTool = async (toolId: number, toolName: string) => {
    if (!window.confirm(`¿Estás seguro de dar de baja la herramienta "${toolName}" de tu inventario?`)) {
      return;
    }
    try {
      await rentaService.tools.delete(toolId);
      showToast(`Herramienta "${toolName}" retirada de inventario.`, 'info');
      fetchProviderTools();
    } catch (err: any) {
      showToast(`Error al retirar herramienta: ${err.message}`, 'error');
    }
  };

  if (!user || (user.role !== 'ROLE_PROVEEDOR' && user.role !== 'ROLE_ADMIN')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Panel de Control de Flota & Patios</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Inicia sesión como proveedor de maquinaria pesada para gestionar inventario, aprobar alquileres, firmar despachos y generar facturas.
          </p>
        </div>
        <button
          onClick={() => quickDemoLogin('ROLE_PROVEEDOR')}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-xs inline-flex items-center gap-2 shadow-xl shadow-amber-600/30 transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>Acceder con Perfil Demo Proveedor (MaqRental Andina)</span>
        </button>
      </div>
    );
  }

  const pendientesCount = reservations.filter(r => r.status === 'PENDIENTE').length;
  const enCursoCount = reservations.filter(r => r.status === 'EN_CURSO').length;
  const aprobadasCount = reservations.filter(r => r.status === 'APROBADA').length;
  const totalFacturado = reservations.filter(r => r.paymentStatus === 'PAGADO').reduce((sum, r) => sum + r.totalPrice, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <Truck className="w-4 h-4" />
            <span>Módulo de Proveedor de Equipos & Maquinaria</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestión de Flota: {user.companyName || user.fullName || 'Patio MaqRental Andina'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inventario, aprobación de alquileres, actas de despacho/devolución y facturación.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'inventory' && (
            <button
              onClick={() => setIsCreateToolModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nueva Herramienta</span>
            </button>
          )}

          {activeTab === 'maintenance' && (
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <Hammer className="w-4 h-4" />
              <span>Ingresar Equipo a Taller</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab === 'reservations' || activeTab === 'billing') fetchProviderReservations();
              if (activeTab === 'inventory') fetchProviderTools();
              if (activeTab === 'maintenance') fetchMaintenanceOrders();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            Actualizar Tablero
          </button>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reservations'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Solicitudes & Despachos ({reservations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Gestión de Inventario ({tools.length > 0 ? tools.length : 'Flota'})</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'maintenance'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Taller & Hoja de Vida ({maintenanceOrders.filter(m => m.status === 'EN_PROCESO').length} en curso)</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'billing'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Facturación & Liquidaciones</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: SOLICITUDES Y DESPACHOS
         ===================================================================== */}
      {activeTab === 'reservations' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">Pendientes de Aprobación</span>
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">{pendientesCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Solicitudes entrantes de clientes</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">Listas para Despacho</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black font-mono text-sky-400">{aprobadasCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Aprobadas para salida en cama baja</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">Operando en Obra</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">{enCursoCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Con horómetro IoT activo</div>
            </div>
          </div>

          {/* Tabla de Reservas */}
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden glass-panel">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Control de Contratos de Maquinaria ({reservations.length})</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">Patio Proveedor #{providerId}</span>
            </div>

            {loadingReservations ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Cargando registros de maquinaria...
              </div>
            ) : reservations.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No hay registros de alquiler asignados a este patio en este momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#090d16] text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Código / Equipo</th>
                      <th className="py-3 px-4">Cliente Constructor</th>
                      <th className="py-3 px-4">Fechas de Obra</th>
                      <th className="py-3 px-4">Tarifa / Escrow</th>
                      <th className="py-3 px-4">Estado Operativo</th>
                      <th className="py-3 px-4 text-right">Acción Técnica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reservations.map(res => (
                      <tr key={res.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-amber-400">{res.reservationCode}</div>
                          <div className="font-semibold text-slate-200 mt-0.5">{res.toolName}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-white font-medium">{res.clientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">NIT Verificado</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <div>{res.startDate} ➔ {res.endDate}</div>
                          <div className="text-[10px] text-slate-500">Duración: {res.totalDays} días</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-white font-bold">{formatCOP(res.totalPrice ?? (res as any).totalAmount)}</div>
                          <div className="text-[11px] text-[#D94E1F]">Fianza: {formatCOP(res.depositAmount ?? (res as any).depositTotal)}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border ${
                            res.status === 'EN_CURSO'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                              : res.status === 'APROBADA'
                              ? 'bg-[#E05A2B]/10 text-[#D94E1F] border-[#D94E1F]'
                              : res.status === 'FINALIZADA'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : res.status === 'CANCELADA'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {res.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {res.status === 'PENDIENTE' && (
                            <>
                              <button
                                onClick={() => handleApprove(res.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                              >
                                Aceptar
                              </button>
                              <button
                                onClick={() => handleReject(res.id)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-semibold transition-colors"
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                          {res.status === 'APROBADA' && (
                            <button
                              onClick={() => setSelectedForDispatch(res)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#D94E1F] hover:bg-[#E05A2B] text-white font-semibold flex items-center gap-1.5 ml-auto transition-colors shadow-md shadow-sm"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Despachar Equipo</span>
                            </button>
                          )}

                          <div className="flex items-center gap-2 justify-end">
                            {(res.status === 'EN_CURSO' || res.status === 'FINALIZADA') && (
                              <button
                                onClick={() => setSelectedForRetieCert(res)}
                                className="px-2.5 py-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 text-sky-400 border border-sky-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                title="Ver Certificado de Inspección RETIE 4FN"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Acta RETIE</span>
                              </button>
                            )}

                            {res.status === 'EN_CURSO' && (
                              <button
                                onClick={() => setSelectedForReturn(res)}
                                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-600/20"
                              >
                                <ClipboardCheck className="w-3.5 h-3.5" />
                                <span>Recibir Devolución</span>
                              </button>
                            )}

                            {res.status === 'FINALIZADA' && (
                              <span className="text-emerald-400 font-mono text-[11px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Liquidada
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: GESTIÓN DE INVENTARIO DE HERRAMIENTAS
         ===================================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden glass-panel">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Maquinaria & Equipos en Inventario ({tools.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Edita la disponibilidad, ajusta precios diarios o retira herramientas dadas de baja.
                </p>
              </div>
              <button
                onClick={() => setIsCreateToolModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Herramienta</span>
              </button>
            </div>

            {loadingTools ? (
              <div className="p-12 text-center text-xs text-slate-400">Cargando inventario de equipos...</div>
            ) : tools.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Wrench className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-white font-semibold text-sm">No tienes herramientas registradas en tu patio</div>
                <button
                  onClick={() => setIsCreateToolModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear mi primer equipo</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#090d16] text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Equipo / SKU</th>
                      <th className="py-3 px-4">Marca & Modelo</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Tarifa Diaria</th>
                      <th className="py-3 px-4">Depósito Escrow</th>
                      <th className="py-3 px-4">Disponibilidad</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tools.map(tool => (
                      <tr key={tool.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{tool.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">SKU: {tool.codeSku}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {tool.brand} {tool.model}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {tool.categoryName}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          ${tool.baseDailyPrice.toLocaleString('es-CO')} /día
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          ${tool.depositAmount.toLocaleString('es-CO')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            tool.status === 'DISPONIBLE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : tool.status === 'ALQUILADA'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : tool.status === 'MANTENIMIENTO'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {tool.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleToolStatus(tool.id, tool.status)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
                          >
                            {tool.status === 'DISPONIBLE' ? 'Mantenimiento' : 'Habilitar'}
                          </button>
                          <button
                            onClick={() => handleDeleteTool(tool.id, tool.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="Eliminar herramienta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: FACTURACIÓN & LIQUIDACIONES
         ===================================================================== */}
      {activeTab === 'billing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 glass-panel">
              <div className="text-xs font-semibold text-slate-400 uppercase">Facturación Neta Cobrada</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                {formatCOP(totalFacturado)} COP
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Con IVA del 19% deducible</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 glass-panel">
              <div className="text-xs font-semibold text-slate-400 uppercase">Depósitos Escrow Respaldados</div>
              <div className="text-2xl font-black font-mono text-sky-400 mt-1">
                {formatCOP(reservations.reduce((sum, r) => sum + Number(r.depositAmount ?? (r as any).depositTotal ?? 0), 0))} COP
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Garantía total en custodia fiduciaria</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 glass-panel">
              <div className="text-xs font-semibold text-slate-400 uppercase">Comprobantes DIAN Emitidos</div>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {reservations.filter(r => r.paymentStatus === 'PAGADO').length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Facturas electrónicas timbradas</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800 glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Historial de Comprobantes de Pago y Facturas por Alquiler</span>
            </h3>

            <div className="divide-y divide-slate-800/60 text-xs">
              {reservations.map(res => (
                <div key={res.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-amber-400">{res.reservationCode || `RES-${res.id}`}</div>
                    <div className="text-white font-medium mt-0.5">{res.toolName || 'Maquinaria'} · Cliente: {res.clientName || 'Cliente Constructora'}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">Método de Pago: {res.paymentMethod || 'PASARELA DE PAGO'}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-emerald-400 font-bold">{formatCOP(res.totalPrice ?? (res as any).totalAmount)}</div>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Estado: {res.paymentStatus || 'PENDIENTE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: TALLER, MANTENIMIENTO TÉCNICO Y HOJA DE VIDA
         ===================================================================== */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Cards Taller */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">Órdenes en Taller</span>
                <Hammer className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {maintenanceOrders.filter(m => m.status === 'EN_PROCESO').length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Equipos bloqueados para alquiler</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">Inversión en Reparaciones</span>
                <DollarSign className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black font-mono text-sky-400">
                {formatCOP(maintenanceOrders.reduce((sum, m) => sum + Number(m.cost || 0), 0))} COP
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Costo total de refacciones y mano de obra</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">Intervenciones Certificadas</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {maintenanceOrders.filter(m => m.status === 'FINALIZADO').length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Completadas con dictamen RETIE</div>
            </div>
          </div>

          {/* Tabla de Órdenes de Mantenimiento */}
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden glass-panel">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Bitácora de Hoja de Vida y Órdenes de Taller ({maintenanceOrders.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Control de mantenimiento preventivo, correctivo y calibración electromecánica.</p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Orden</span>
              </button>
            </div>

            {loadingMaintenance ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Cargando historial técnico de taller...
              </div>
            ) : maintenanceOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No hay órdenes de mantenimiento registradas para esta flota.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#090d16] text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Herramienta / SKU</th>
                      <th className="py-3 px-4">Tipo Intervención</th>
                      <th className="py-3 px-4">Técnico Responsable</th>
                      <th className="py-3 px-4">Fechas</th>
                      <th className="py-3 px-4">Inversión</th>
                      <th className="py-3 px-4">Diagnóstico / Trabajo</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {maintenanceOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{order.toolName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{order.toolCodeSku}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.maintenanceType === 'PREVENTIVO'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : order.maintenanceType === 'CORRECTIVO'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {order.maintenanceType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {order.technicianName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          <div>Inicio: {order.startDate}</div>
                          {order.endDate && <div>Fin: {order.endDate}</div>}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {formatCOP(order.cost)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={order.description}>
                          {order.description}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.status === 'EN_PROCESO'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {order.status === 'EN_PROCESO' ? 'EN TALLER' : 'FINALIZADO'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {order.status === 'EN_PROCESO' ? (
                            <button
                              onClick={() => {
                                setFinishingOrder(order);
                                setFinishCost(order.cost || 100000);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 ml-auto"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completar</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-mono">Reincorporado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: FACTURACIÓN & LIQUIDACIONES TRIBUTARIAS DIAN
         ===================================================================== */}
      {activeTab === 'billing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Fiscales */}
          {(() => {
            const billableReservations = reservations.filter(
              r => r.status === 'APROBADA' || r.status === 'EN_CURSO' || r.status === 'FINALIZADA'
            );
            const totalBase = billableReservations.reduce((sum, r) => sum + Number(r.subtotal || r.totalPrice || 0), 0);
            const totalIva = totalBase * 0.19;
            const totalRetenciones = totalBase * (0.04 + (0.19 * 0.15) + 0.00966);
            const netoPatio = totalBase + totalIva - totalRetenciones;

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold uppercase tracking-wider">Recaudo Neto Patio</span>
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xl font-black font-mono text-emerald-400">{formatCOP(netoPatio)}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Neto post-retenciones DIAN</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold uppercase tracking-wider">Facturación Base</span>
                      <Receipt className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-xl font-black font-mono text-white">{formatCOP(totalBase)}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{billableReservations.length} contratos timbrados</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold uppercase tracking-wider">IVA (19%) Recaudado</span>
                      <Percent className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xl font-black font-mono text-amber-400">{formatCOP(totalIva)}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Estatuto Tributario Art. 468</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold uppercase tracking-wider">Retenciones Deducidas</span>
                      <TrendingUp className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="text-xl font-black font-mono text-rose-400">-{formatCOP(totalRetenciones)}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Retefuente, ReteIVA y ReteICA</div>
                  </div>
                </div>

                {/* Tabla de Facturas Fiscales */}
                <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden glass-panel">
                  <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-amber-400" />
                        <span>Libro Fiscal de Facturación & Retenciones DIAN</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Resolución DIAN No. 18764000001 · Rango autorizado de facturación electrónica 2026.
                      </p>
                    </div>
                  </div>

                  {billableReservations.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-400">
                      No hay contratos liquidados o en curso aún para liquidar tributariamente.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 bg-[#090d16] text-slate-400 uppercase tracking-wider font-semibold">
                            <th className="py-3 px-4">Factura / Reserva</th>
                            <th className="py-3 px-4">Equipo & Cliente</th>
                            <th className="py-3 px-4">Base Gravable</th>
                            <th className="py-3 px-4">IVA (19%)</th>
                            <th className="py-3 px-4">Retenciones DIAN</th>
                            <th className="py-3 px-4">Neto a Liquidar</th>
                            <th className="py-3 px-4">Estado Fiscal</th>
                            <th className="py-3 px-4 text-right">Comprobantes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {billableReservations.map((r) => {
                            const base = Number(r.subtotal || r.totalPrice || 100000);
                            const iva = base * 0.19;
                            const ret = base * (0.04 + (0.19 * 0.15) + 0.00966);
                            const neto = base + iva - ret;
                            const invCode = `FE-2026-${String(r.id).padStart(6, '0')}`;

                            return (
                              <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                                  <div>{invCode}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{r.reservationCode || `RES-${r.id}`}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-semibold text-white">{r.toolName || 'Maquinaria'}</div>
                                  <div className="text-[11px] text-slate-400">{r.totalDays || 1} días amparados</div>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-white">
                                  {formatCOP(base)}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-amber-300">
                                  +{formatCOP(iva)}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-rose-400">
                                  -{formatCOP(ret)}
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                                  {formatCOP(neto)}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    TIMBRADA DIAN
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <button
                                      onClick={() => setSelectedForTaxSettlement(r)}
                                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                      title="Ver desglose fiscal y retenciones"
                                    >
                                      <Percent className="w-3 h-3" />
                                      <span>Liquidación DIAN</span>
                                    </button>

                                    <button
                                      onClick={() => setSelectedForRetieCert(r)}
                                      className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                      title="Ver Certificado RETIE"
                                    >
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>Acta RETIE</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Modal de Despacho Logístico 4FN */}
      {selectedForDispatch && (
        <DispatchModal
          reservation={selectedForDispatch}
          onClose={() => setSelectedForDispatch(null)}
          onSuccess={fetchProviderReservations}
        />
      )}

      {/* Modal de Inspección y Retorno Físico */}
      {selectedForReturn && (
        <ReturnInspectionModal
          reservation={selectedForReturn}
          onClose={() => setSelectedForReturn(null)}
          onSuccess={fetchProviderReservations}
        />
      )}

      {/* Modal de Registro de Nueva Herramienta */}
      {isCreateToolModalOpen && (
        <CreateToolModal
          providerId={providerId}
          onClose={() => setIsCreateToolModalOpen(false)}
          onSuccess={fetchProviderTools}
        />
      )}

      {/* Modal Programar Mantenimiento / Ingresar a Taller */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div 
            className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden glass-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Hammer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Ingresar Equipo a Taller
                  </h3>
                  <p className="text-xs text-slate-400">Bloquea temporalmente el alquiler en catálogo</p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Seleccionar Herramienta de Flota</label>
                <select
                  value={scheduleToolId}
                  onChange={(e) => setScheduleToolId(Number(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Seleccionar maquinaria --</option>
                  {tools.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.codeSku}) - Estado actual: {t.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Tipo de Intervención</label>
                  <select
                    value={scheduleType}
                    onChange={(e: any) => setScheduleType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PREVENTIVO">PREVENTIVO</option>
                    <option value="CORRECTIVO">CORRECTIVO</option>
                    <option value="CALIBRACION">CALIBRACION RETIE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Costo Estimado (COP)</label>
                  <input
                    type="number"
                    value={scheduleCost}
                    onChange={(e) => setScheduleCost(Number(e.target.value))}
                    min="0"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Ingeniero / Técnico Responsable</label>
                <input
                  type="text"
                  value={scheduleTechnician}
                  onChange={(e) => setScheduleTechnician(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Fecha de Ingreso</label>
                  <input
                    type="date"
                    value={scheduleStartDate}
                    onChange={(e) => setScheduleStartDate(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Fecha Estimada Salida</label>
                  <input
                    type="date"
                    value={scheduleEndDate}
                    onChange={(e) => setScheduleEndDate(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Diagnóstico & Tareas Técnicas</label>
                <textarea
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  rows={2}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingSchedule}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{submittingSchedule ? 'Ingresando...' : 'Poner en Taller'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Finalizar Mantenimiento y Rehabilitar Equipo */}
      {finishingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div 
            className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden glass-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Finalizar Orden de Taller
                  </h3>
                  <p className="text-xs text-slate-400">Reincorpora {finishingOrder.toolName} al catálogo DISPONIBLE</p>
                </div>
              </div>
              <button
                onClick={() => setFinishingOrder(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFinishSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Herramienta:</span>
                  <span className="font-bold text-white">{finishingOrder.toolName} ({finishingOrder.toolCodeSku})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Técnico:</span>
                  <span>{finishingOrder.technicianName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Fecha de Culminación</label>
                  <input
                    type="date"
                    value={finishDate}
                    onChange={(e) => setFinishDate(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Costo Real Liquidado (COP)</label>
                  <input
                    type="number"
                    value={finishCost}
                    onChange={(e) => setFinishCost(Number(e.target.value))}
                    min="0"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Dictamen Técnico & Repuestos Instalados</label>
                <textarea
                  value={finishNotes}
                  onChange={(e) => setFinishNotes(e.target.value)}
                  rows={3}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>La maquinaria pasará a estado DISPONIBLE y estará visible para nuevos contratos.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFinishingOrder(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingFinish}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{submittingFinish ? 'Reincorporando...' : 'Completar y Habilitar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Certificado Técnico RETIE 4FN */}
      {selectedForRetieCert && (
        <RetieCertificateModal
          reservation={selectedForRetieCert}
          onClose={() => setSelectedForRetieCert(null)}
        />
      )}

      {/* Modal Liquidación Tributaria DIAN */}
      {selectedForTaxSettlement && (
        <DianTaxSettlementModal
          reservation={selectedForTaxSettlement}
          onClose={() => setSelectedForTaxSettlement(null)}
        />
      )}

    </div>
  );
};
