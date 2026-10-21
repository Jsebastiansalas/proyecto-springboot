import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { Reservation, Tool } from '../../types';
import { DispatchModal } from './DispatchModal';
import { ReturnInspectionModal } from './ReturnInspectionModal';
import { CreateToolModal } from './CreateToolModal';
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
  Receipt
} from 'lucide-react';

export const ProviderPortal: React.FC = () => {
  const { user, quickDemoLogin, showToast } = useApp();
  
  // Tab activa del proveedor
  const [activeTab, setActiveTab] = useState<'reservations' | 'inventory' | 'billing'>('reservations');

  // Estado de reservas
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [selectedForDispatch, setSelectedForDispatch] = useState<Reservation | null>(null);
  const [selectedForReturn, setSelectedForReturn] = useState<Reservation | null>(null);

  // Estado de inventario de herramientas
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [isCreateToolModalOpen, setIsCreateToolModalOpen] = useState(false);

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

  useEffect(() => {
    fetchProviderReservations();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchProviderTools();
    }
  }, [activeTab]);

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

          <button
            onClick={() => {
              if (activeTab === 'reservations' || activeTab === 'billing') fetchProviderReservations();
              if (activeTab === 'inventory') fetchProviderTools();
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

                          {res.status === 'EN_CURSO' && (
                            <button
                              onClick={() => setSelectedForReturn(res)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 ml-auto transition-colors shadow-md shadow-amber-600/20"
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

    </div>
  );
};
