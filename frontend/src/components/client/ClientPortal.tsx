import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { 
  Reservation, 
  ReservationExtensionResult, 
  CancellationPenaltyResult, 
  ReservationAuditLog,
  Tool,
  ClientTrustScore 
} from '../../types';
import { PaymentModal } from './PaymentModal';
import { 
  FileText, 
  CreditCard, 
  Receipt, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle2, 
  Clock, 
  Wrench, 
  UserCheck, 
  HardHat,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Printer,
  QrCode,
  Copy,
  Check,
  Download,
  CalendarPlus,
  AlertTriangle,
  History,
  Heart,
  X,
  XCircle,
  Info,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Percent,
  Star
} from 'lucide-react';
import { downloadDianInvoicePdf } from '../../utils/pdfGenerator';
import { formatImageUrl, handleImageError } from '../../utils/imageUtils';
import { RetieCertificateModal } from '../common/RetieCertificateModal';
import { DianTaxSettlementModal } from '../common/DianTaxSettlementModal';
import { CreateReviewModal } from '../common/CreateReviewModal';

export const ClientPortal: React.FC = () => {
  const { 
    user, 
    quickDemoLogin, 
    showToast, 
    addToCart, 
    favorites, 
    toggleFavorite,
    setIsQuoteDrawerOpen 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rentals' | 'favorites'>('rentals');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForPayment, setSelectedForPayment] = useState<Reservation | null>(null);
  const [activeDianModal, setActiveDianModal] = useState<Reservation | null>(null);
  const [selectedForRetieCert, setSelectedForRetieCert] = useState<Reservation | null>(null);
  const [selectedForTaxSettlement, setSelectedForTaxSettlement] = useState<Reservation | null>(null);
  const [selectedForReview, setSelectedForReview] = useState<Reservation | null>(null);
  const [copiedCufe, setCopiedCufe] = useState(false);

  // Estados de Prórroga (Extensión de Alquiler)
  const [extendModalReservation, setExtendModalReservation] = useState<Reservation | null>(null);
  const [newEndDateInput, setNewEndDateInput] = useState<string>('');
  const [extendReasonInput, setExtendReasonInput] = useState<string>('');
  const [submittingExtension, setSubmittingExtension] = useState<boolean>(false);
  const [extensionResult, setExtensionResult] = useState<ReservationExtensionResult | null>(null);

  // Estados de Cancelación con Penalización
  const [cancelModalReservation, setCancelModalReservation] = useState<Reservation | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState<string>('');
  const [submittingCancellation, setSubmittingCancellation] = useState<boolean>(false);
  const [cancellationResult, setCancellationResult] = useState<CancellationPenaltyResult | null>(null);

  // Estados de Pista de Auditoría de Estados
  const [auditModalReservation, setAuditModalReservation] = useState<Reservation | null>(null);
  const [auditLogs, setAuditLogs] = useState<ReservationAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);

  // Estados de Favoritos
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(false);

  // Estado de Calificación y Trust Score del Contratista
  const [trustScore, setTrustScore] = useState<ClientTrustScore | null>(null);
  const [loadingTrustScore, setLoadingTrustScore] = useState<boolean>(false);

  const fetchTrustScore = async () => {
    setLoadingTrustScore(true);
    try {
      const clientId = user?.clientId || 1;
      const data = await rentaService.clients.getTrustScore(clientId);
      setTrustScore(data);
    } catch {
      try {
        const myScore = await rentaService.clients.getMyTrustScore();
        setTrustScore(myScore);
      } catch (err) {
        console.warn('Error al cargar trust score:', err);
      }
    } finally {
      setLoadingTrustScore(false);
    }
  };

  const fetchReservations = async () => {
    if (!user || (user.role !== 'ROLE_CLIENTE' && user.role !== 'ROLE_ADMIN')) {
      setLoading(false);
      return;
    }
    const clientId = user.clientId || 1;
    setLoading(true);
    try {
      const data = await rentaService.reservations.getByClient(clientId);
      setReservations(data);
    } catch (err: any) {
      showToast(`Error al cargar alquileres: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const data = await rentaService.favorites.getMyFavorites();
      setFavoriteTools(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Error al cargar favoritos de base de datos:', err);
      // Fallback: Si no hay favoritos en DB o falla, obtener catálogo filtrando por IDs locales
      try {
        const all = await rentaService.tools.getAll();
        setFavoriteTools(all.filter(t => favorites.includes(t.id)));
      } catch {
        setFavoriteTools([]);
      }
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchTrustScore();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [activeTab, favorites]);

  if (!user || (user.role !== 'ROLE_CLIENTE' && user.role !== 'ROLE_ADMIN')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#D94E1F]/20 border border-[#D94E1F] flex items-center justify-center text-[#D94E1F] mx-auto">
          <HardHat className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Portal de Alquileres de Obra</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Inicia sesión como cliente constructor para supervisar la maquinaria en tus frentes de trabajo, consultar actas 4FN y facturación DIAN.
          </p>
        </div>
        <button
          onClick={() => quickDemoLogin('ROLE_CLIENTE')}
          className="px-6 py-3 bg-[#D94E1F] hover:bg-[#E05A2B] text-white rounded-xl font-semibold text-xs inline-flex items-center gap-2 shadow-xl shadow-sm transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>Acceder con Perfil Demo Cliente (Constructora)</span>
        </button>
      </div>
    );
  }

  // Formateador seguro de pesos colombianos
  const formatCOP = (val?: number | null) => '$ ' + Math.round(Number(val || 0)).toLocaleString('es-CO');

  // Métricas rápidas del cliente
  const totalInvertido = reservations.reduce((acc, r) => acc + Number(r.totalPrice ?? (r as any).totalAmount ?? 0), 0);
  const totalGarantias = reservations.reduce((acc, r) => acc + Number(r.depositAmount ?? (r as any).depositTotal ?? 0), 0);
  const activosCount = reservations.filter(r => r.status === 'EN_CURSO' || r.status === 'APROBADA').length;

  // Apertura modal Prórroga
  const handleOpenExtendModal = (res: Reservation) => {
    setExtendModalReservation(res);
    setExtensionResult(null);
    setExtendReasonInput('Continuación de frente de trabajo y vaciado de losa');
    if (res.endDate) {
      const [y, m, d] = res.endDate.split('-').map(Number);
      const nextDate = new Date(y, m - 1, d + 3);
      const ey = nextDate.getFullYear();
      const em = String(nextDate.getMonth() + 1).padStart(2, '0');
      const ed = String(nextDate.getDate()).padStart(2, '0');
      setNewEndDateInput(`${ey}-${em}-${ed}`);
    } else {
      setNewEndDateInput('');
    }
  };

  const handleConfirmExtension = async () => {
    if (!extendModalReservation || !newEndDateInput) return;
    setSubmittingExtension(true);
    try {
      const res = await rentaService.reservations.extend(
        extendModalReservation.id,
        newEndDateInput,
        extendReasonInput
      );
      setExtensionResult(res);
      showToast(res.message || '¡Prórroga de contrato aprobada exitosamente!', 'success');
      fetchReservations();
    } catch (err: any) {
      showToast(`Error al procesar prórroga: ${err.message}`, 'error');
    } finally {
      setSubmittingExtension(false);
    }
  };

  // Apertura modal Cancelación con Multa
  const handleOpenCancelModal = (res: Reservation) => {
    setCancelModalReservation(res);
    setCancellationResult(null);
    setCancelReasonInput('Reprogramación de cronograma por contingencia en obra');
  };

  const handleConfirmCancelWithPenalty = async () => {
    if (!cancelModalReservation) return;
    setSubmittingCancellation(true);
    try {
      const res = await rentaService.reservations.cancelWithPenalty(
        cancelModalReservation.id,
        cancelReasonInput
      );
      setCancellationResult(res);
      showToast('Reserva cancelada y liquidación fiduciaria completada.', 'info');
      fetchReservations();
    } catch (err: any) {
      showToast(`Error al cancelar: ${err.message}`, 'error');
    } finally {
      setSubmittingCancellation(false);
    }
  };

  // Apertura modal Auditoría de Estados
  const handleOpenAuditTrail = async (res: Reservation) => {
    setAuditModalReservation(res);
    setLoadingAudit(true);
    try {
      const logs = await rentaService.reservations.getAuditTrail(res.id);
      setAuditLogs(logs);
    } catch (err: any) {
      showToast(`Error al consultar auditoría: ${err.message}`, 'error');
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Helper para calcular costo estimado de prórroga en vivo
  const calculateEstimatedExtension = () => {
    if (!extendModalReservation || !newEndDateInput || !extendModalReservation.endDate) return null;
    const currentEnd = new Date(extendModalReservation.endDate);
    const newEnd = new Date(newEndDateInput);
    const diffTime = newEnd.getTime() - currentEnd.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return null;
    const dailyRate = Number(extendModalReservation.dailyPrice || (extendModalReservation.totalPrice / (extendModalReservation.totalDays || 1)) || 50000);
    const subtotal = Math.round(dailyRate * diffDays);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;
    return { diffDays, dailyRate, subtotal, iva, total };
  };

  const estExtension = calculateEstimatedExtension();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F5F4F0]">
      
      {/* Header & Client Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#363632]">
        <div>
          <div className="flex items-center gap-2 text-[#D94E1F] text-xs font-semibold mb-1">
            <HardHat className="w-4 h-4" />
            <span>Portal de Operaciones B2B</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F4F0] tracking-tight">
            Mis Alquileres & Maquinaria en Obra
          </h1>
          <p className="text-xs text-[#A8A69E] mt-1">
            Cliente: <span className="text-[#F5F4F0] font-semibold">{user.companyName || user.fullName || user.email}</span> · NIT: 900.548.120-1
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-[#1E6F43]/15 text-[#4ade80] border border-[#1E6F43]/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Póliza SURA Activa</span>
          </span>
        </div>
      </div>

      {/* Contractor Trust Score Card */}
      {trustScore && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#121926] via-[#1a2333] to-[#0f172a] border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex flex-col items-center justify-center font-mono font-black text-amber-400">
                  <span className="text-xl leading-none">{trustScore.score}</span>
                  <span className="text-[9px] text-slate-400 font-sans uppercase font-bold">/ 100</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#121926] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Calificación de Confiabilidad: Tier {trustScore.tier}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    trustScore.tier === 'EXCELENTE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : trustScore.tier === 'CONFIABLE'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {trustScore.tier === 'EXCELENTE' ? 'Platinum B2B' : trustScore.tier}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {trustScore.benefitsDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-700/60 pt-3 sm:pt-0 sm:pl-6 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Puntualidad</span>
                <span className="text-emerald-400 font-bold text-sm">{trustScore.punctualityRate}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Descuento Fianza</span>
                <span className="text-amber-400 font-bold text-sm">-{trustScore.depositDiscountPercent}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Contratos Obra</span>
                <span className="text-white font-bold text-sm">{trustScore.completedContracts} exitosos</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Beneficio Activo en Cotizador: <strong>Exención del {trustScore.depositDiscountPercent}% en el depósito de garantía</strong> para todas sus cotizaciones.</span>
            </span>
            <span className="font-mono text-emerald-400 text-[10px] font-bold">CERTIFICADO ACTIVO</span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#1E1E1C] border border-[#363632]">
          <div className="flex items-center justify-between text-xs text-[#A8A69E] mb-1">
            <span className="font-semibold uppercase tracking-wider">Equipos en Despacho/Obra</span>
            <Clock className="w-4 h-4 text-[#D94E1F]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#F5F4F0]">{activosCount}</div>
          <div className="text-[11px] text-[#706E66] mt-1">Frentes de trabajo en Bogotá y Cundinamarca</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1E1E1C] border border-[#363632]">
          <div className="flex items-center justify-between text-xs text-[#A8A69E] mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Inversión Alquiler</span>
            <DollarSign className="w-4 h-4 text-[#4ade80]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#F5F4F0]">
            {formatCOP(totalInvertido)}
          </div>
          <div className="text-[11px] text-[#706E66] mt-1">Facturación acumulada en contratos vigentes</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1E1E1C] border border-[#363632]">
          <div className="flex items-center justify-between text-xs text-[#A8A69E] mb-1">
            <span className="font-semibold uppercase tracking-wider">Garantías en Custodia (Escrow)</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-[#F5F4F0]">
            {formatCOP(totalGarantias)}
          </div>
          <div className="text-[11px] text-[#706E66] mt-1">Retornables al finalizar sin novedades</div>
        </div>
      </div>

      {/* Navegación por pestañas: Contratos vs Favoritos */}
      <div className="flex items-center gap-3 border-b border-[#363632] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'rentals'
              ? 'bg-[#D94E1F] text-white shadow-md'
              : 'text-[#A8A69E] hover:text-[#F5F4F0] hover:bg-[#232320]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mis Contratos de Maquinaria ({reservations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'favorites'
              ? 'bg-[#D94E1F] text-white shadow-md'
              : 'text-[#A8A69E] hover:text-[#F5F4F0] hover:bg-[#232320]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Mis Herramientas Favoritas (Wishlist) ({favorites.length})</span>
        </button>
      </div>

      {/* PESTAÑA 1: LISTADO DE CONTRATOS */}
      {activeTab === 'rentals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F5F4F0] tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D94E1F]" />
              <span>Contratos de Maquinaria Registrados ({reservations.length})</span>
            </h2>
            <button
              onClick={fetchReservations}
              className="text-xs text-[#D94E1F] hover:text-[#B83D14] font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar Estado</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#A8A69E]">
              Consultando contratos en base de datos PostgreSQL...
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#1E1E1C] border border-[#363632] text-center space-y-3">
              <FileText className="w-8 h-8 text-[#706E66] mx-auto" />
              <div className="text-[#F5F4F0] font-semibold text-sm">No tienes contratos de alquiler activos</div>
              <p className="text-xs text-[#A8A69E] max-w-sm mx-auto">
                Explora el catálogo de maquinaria, añade equipos a tu cotización y emite tu primer contrato.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {reservations.map(res => {
                const isPaid = res.paymentStatus === 'PAGADO' || res.paymentStatus === 'COMPLETADO' || res.hasPayment;
                const canExtend = res.status === 'APROBADA' || res.status === 'EN_CURSO';
                const canCancelWithPenalty = res.status === 'PENDIENTE' || res.status === 'APROBADA';

                return (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl bg-[#1E1E1C] border border-[#363632] shadow-xl space-y-5"
                  >
                    {/* Top Row: Meta info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#363632]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#141412] border border-[#363632] overflow-hidden flex items-center justify-center shrink-0">
                          {(res.toolImage || (res as any).toolImageUrl) ? (
                            <img 
                              src={formatImageUrl(res.toolImage || (res as any).toolImageUrl)} 
                              alt={res.toolName || 'Maquinaria'} 
                              className="w-full h-full object-cover" 
                              onError={handleImageError}
                            />
                          ) : (
                            <Wrench className="w-5 h-5 text-[#A8A69E]" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[#D94E1F] bg-[#D94E1F]/10 px-2 py-0.5 rounded border border-[#D94E1F]/40">
                              {res.reservationCode || `RES-${res.id}`}
                            </span>
                            <span className="text-[11px] text-[#A8A69E] font-mono">
                              {res.startDate || 'N/A'} ➔ {res.endDate || 'N/A'} ({res.totalDays || 1} días)
                            </span>
                            {res.hasDamageInsurance && (
                              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-amber-400" />
                                Seguro Todo Riesgo
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-[#F5F4F0] mt-0.5">
                            {res.toolName || 'Maquinaria Industrial'}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
                          res.status === 'APROBADA'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : res.status === 'EN_CURSO'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : res.status === 'FINALIZADA'
                            ? 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                            : res.status === 'CANCELADA'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {res.status || 'PENDIENTE'}
                        </span>

                        {/* Payment Status Badge */}
                        <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {isPaid ? 'PAGADO' : (res.paymentStatus || 'PENDIENTE')}
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary & Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
                      <div className="flex flex-wrap items-center gap-6 text-xs">
                        <div>
                          <span className="text-[#A8A69E] block">Total Contrato:</span>
                          <span className="font-mono font-bold text-[#F5F4F0] text-sm">
                            {formatCOP(res.totalPrice ?? (res as any).totalAmount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#A8A69E] block">Depósito Escrow:</span>
                          <span className="font-mono text-slate-300">
                            {formatCOP(res.depositAmount ?? (res as any).depositTotal)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#A8A69E] block">Método:</span>
                          <span className="font-mono text-slate-300">{res.paymentMethod || 'PASARELA DE PAGO'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Botón Auditoría de Estados */}
                        <button
                          type="button"
                          onClick={() => handleOpenAuditTrail(res)}
                          className="px-3 py-2 rounded-xl bg-[#232320] hover:bg-[#2d2d29] text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#363632]"
                          title="Consultar trazabilidad de estados y pista de auditoría"
                        >
                          <History className="w-3.5 h-3.5 text-amber-400" />
                          <span>Auditoría</span>
                        </button>

                        {/* Botón Solicitar Prórroga */}
                        {canExtend && (
                          <button
                            type="button"
                            onClick={() => handleOpenExtendModal(res)}
                            className="px-3 py-2 rounded-xl bg-[#232320] hover:bg-[#2d2d29] text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-sky-500/30"
                            title="Solicitar ampliación o prórroga del tiempo de alquiler"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-sky-400" />
                            <span>Prórroga</span>
                          </button>
                        )}

                        {/* Botón Cancelar con Multa */}
                        {canCancelWithPenalty && (
                          <button
                            type="button"
                            onClick={() => handleOpenCancelModal(res)}
                            className="px-3 py-2 rounded-xl bg-[#232320] hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-500/30"
                            title="Cancelar contrato con cálculo de penalización según política"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Cancelar (Multa)</span>
                          </button>
                        )}

                        {/* Botón Certificado RETIE */}
                        <button
                          type="button"
                          onClick={() => setSelectedForRetieCert(res)}
                          className="px-3 py-2 rounded-xl bg-[#232320] hover:bg-[#2d2d29] text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-sky-500/30"
                          title="Consultar Certificado Técnico de Liberación RETIE 4FN"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                          <span>Acta RETIE</span>
                        </button>

                        {/* Botón Liquidación Tributaria DIAN */}
                        <button
                          type="button"
                          onClick={() => setSelectedForTaxSettlement(res)}
                          className="px-3 py-2 rounded-xl bg-[#232320] hover:bg-[#2d2d29] text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-500/30"
                          title="Ver liquidación fiscal con retenciones DIAN e IVA"
                        >
                          <Percent className="w-3.5 h-3.5 text-amber-400" />
                          <span>Retenciones DIAN</span>
                        </button>

                        {/* Botón Calificar Maquinaria (Reviews) */}
                        {(res.status === 'FINALIZADA' || isPaid) && (
                          <button
                            type="button"
                            onClick={() => setSelectedForReview(res)}
                            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-500/40"
                            title="Calificar el rendimiento técnico de la maquinaria de 1 a 5 estrellas"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Calificar</span>
                          </button>
                        )}

                        {/* Botón Factura DIAN */}
                        <button
                          type="button"
                          onClick={() => setActiveDianModal(res)}
                          className="px-3 py-2 rounded-xl bg-[#232320] hover:bg-[#2d2d29] text-[#F5F4F0] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#363632]"
                        >
                          <Receipt className="w-3.5 h-3.5 text-slate-300" />
                          <span>Factura PDF</span>
                        </button>

                        {/* Botón Pagar / Comprobante */}
                        <button
                          type="button"
                          onClick={() => setSelectedForPayment(res)}
                          className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                            isPaid
                              ? 'bg-[#1E6F43] hover:bg-[#258552]'
                              : 'bg-[#D94E1F] hover:bg-[#B83D14]'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isPaid ? 'Comprobante / Liquidación' : 'Pagar Inmediatamente'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: LISTADO DE FAVORITOS (WISHLIST) */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F5F4F0] tracking-tight flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>Mis Herramientas Guardadas ({favoriteTools.length})</span>
            </h2>
            <button
              onClick={fetchFavorites}
              className="text-xs text-[#D94E1F] hover:text-[#B83D14] font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refrescar Favoritos</span>
            </button>
          </div>

          {loadingFavorites ? (
            <div className="p-12 text-center text-xs text-[#A8A69E]">
              Consultando tus herramientas guardadas...
            </div>
          ) : favoriteTools.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#1E1E1C] border border-[#363632] text-center space-y-3">
              <Heart className="w-8 h-8 text-[#706E66] mx-auto" />
              <div className="text-[#F5F4F0] font-semibold text-sm">No tienes herramientas en tu lista de favoritos</div>
              <p className="text-xs text-[#A8A69E] max-w-sm mx-auto">
                Explora el catálogo y pulsa el corazón en las fichas técnicas para guardarlas para futuros proyectos de obra.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteTools.map(tool => (
                <div
                  key={tool.id}
                  className="p-4 rounded-2xl bg-[#1E1E1C] border border-[#363632] flex flex-col justify-between space-y-4 shadow-lg hover:border-[#D94E1F]/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-[#141412] border border-[#363632] overflow-hidden shrink-0 flex items-center justify-center">
                      <img 
                        src={formatImageUrl(tool.mainImageUrl)} 
                        alt={tool.name} 
                        className="w-full h-full object-cover" 
                        onError={handleImageError}
                      />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#D94E1F] uppercase font-bold tracking-wider">
                          {tool.categoryName || 'Construcción'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(tool.id)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                          title="Quitar de favoritos"
                        >
                          <Heart className="w-4 h-4 fill-rose-400" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-[#F5F4F0] truncate">{tool.name}</h4>
                      <p className="text-xs font-mono text-[#A8A69E]">{tool.brand} · {tool.model}</p>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        ${tool.baseDailyPrice.toLocaleString('es-CO')} / día
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#363632]">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(tool, 3);
                        setIsQuoteDrawerOpen(true);
                      }}
                      className="flex-1 py-2 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Cotizar en Obra</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SOLICITUD DE PRÓRROGA DE ALQUILER                                */}
      {/* ========================================================================= */}
      {extendModalReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#181816] border border-[#363632] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-5 text-[#F5F4F0]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#363632] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F4F0]">
                    Solicitud de Prórroga de Alquiler
                  </h3>
                  <p className="text-[11px] text-[#A8A69E] font-mono">
                    {extendModalReservation.reservationCode || `RES-${extendModalReservation.id}`} · {extendModalReservation.toolName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExtendModalReservation(null)}
                className="w-8 h-8 rounded-lg bg-[#232320] hover:bg-[#2d2d29] text-[#A8A69E] hover:text-[#F5F4F0] flex items-center justify-center border border-[#363632]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {extensionResult ? (
              /* Resultado de Prórroga Aprobada */
              <div className="space-y-4 py-2">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>¡Prórroga Aprobada Exitosamente!</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {extensionResult.message}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141412] border border-[#363632] space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#A8A69E]">
                    <span>Fecha Límite Anterior:</span>
                    <span className="text-[#F5F4F0]">{extensionResult.oldEndDate || extensionResult.originalEndDate}</span>
                  </div>
                  <div className="flex justify-between text-sky-400 font-bold">
                    <span>Nueva Fecha de Devolución:</span>
                    <span>{extensionResult.newEndDate} (+{extensionResult.additionalDays} días)</span>
                  </div>
                  <div className="flex justify-between text-[#A8A69E]">
                    <span>Costo Alquiler Adicional:</span>
                    <span className="text-[#F5F4F0]">${Number(extensionResult.additionalCost).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-[#A8A69E]">
                    <span>IVA Legal Adicional (19%):</span>
                    <span className="text-[#F5F4F0]">${Number(extensionResult.additionalTaxIva || extensionResult.additionalTax || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold pt-2 border-t border-[#363632]">
                    <span>Nuevo Total del Contrato:</span>
                    <span>${Number(extensionResult.newTotalAmount || extensionResult.newTotalReservationPrice).toLocaleString('es-CO')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExtendModalReservation(null);
                    setExtensionResult(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#D94E1F] hover:bg-[#B83D14] text-white font-bold text-xs transition-colors"
                >
                  Entendido y Cerrar
                </button>
              </div>
            ) : (
              /* Formulario de Solicitud de Prórroga */
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-[#141412] border border-[#363632] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#A8A69E]">
                    <span>Fecha Actual de Devolución:</span>
                    <span className="font-mono text-[#F5F4F0] font-bold">{extendModalReservation.endDate}</span>
                  </div>
                  <div className="flex justify-between text-[#A8A69E]">
                    <span>Tarifa Diaria Base:</span>
                    <span className="font-mono text-[#D94E1F] font-bold">
                      ${Number(extendModalReservation.dailyPrice || (extendModalReservation.totalPrice / (extendModalReservation.totalDays || 1))).toLocaleString('es-CO')} / día
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A8A69E] uppercase font-mono">
                    Nueva Fecha Solicitada de Devolución
                  </label>
                  <input
                    type="date"
                    min={extendModalReservation.endDate}
                    value={newEndDateInput}
                    onChange={(e) => setNewEndDateInput(e.target.value)}
                    className="w-full bg-[#141412] border border-[#363632] rounded-lg px-3 py-2 text-xs text-[#F5F4F0] font-mono focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A8A69E] uppercase font-mono">
                    Motivo de la Extensión en Obra
                  </label>
                  <textarea
                    rows={2}
                    value={extendReasonInput}
                    onChange={(e) => setExtendReasonInput(e.target.value)}
                    className="w-full bg-[#141412] border border-[#363632] rounded-lg px-3 py-2 text-xs text-[#F5F4F0] focus:outline-none focus:border-sky-400"
                    placeholder="Describe la justificación técnica de la prórroga..."
                  />
                </div>

                {/* Previsualización Financiera en Vivo */}
                {estExtension && (
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs space-y-1 font-mono">
                    <div className="text-sky-300 font-bold flex items-center justify-between">
                      <span>Días adicionales de faena:</span>
                      <span>+{estExtension.diffDays} días</span>
                    </div>
                    <div className="flex justify-between text-[#A8A69E]">
                      <span>Subtotal Adicional:</span>
                      <span className="text-[#F5F4F0]">${estExtension.subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between text-[#A8A69E]">
                      <span>IVA (19%):</span>
                      <span className="text-[#F5F4F0]">${estExtension.iva.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between text-sky-400 font-black pt-1 border-t border-sky-500/30">
                      <span>Monto Adicional a Liquidar:</span>
                      <span>${estExtension.total.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setExtendModalReservation(null)}
                    className="flex-1 py-2.5 rounded-xl bg-[#232320] hover:bg-[#2d2d29] text-[#A8A69E] hover:text-[#F5F4F0] text-xs font-semibold border border-[#363632] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmExtension}
                    disabled={submittingExtension || !estExtension}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    {submittingExtension ? 'Procesando Prórroga...' : 'Confirmar Prórroga'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CANCELACIÓN CON PENALIZACIÓN ESCALADA                             */}
      {/* ========================================================================= */}
      {cancelModalReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#181816] border border-[#363632] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-5 text-[#F5F4F0]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#363632] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F4F0]">
                    Cancelación de Reserva & Liquidación de Multa
                  </h3>
                  <p className="text-[11px] text-[#A8A69E] font-mono">
                    {cancelModalReservation.reservationCode || `RES-${cancelModalReservation.id}`} · {cancelModalReservation.toolName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalReservation(null)}
                className="w-8 h-8 rounded-lg bg-[#232320] hover:bg-[#2d2d29] text-[#A8A69E] hover:text-[#F5F4F0] flex items-center justify-center border border-[#363632]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cancellationResult ? (
              /* Desglose Liquidado Post-Cancelación */
              <div className="space-y-4 py-2">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span>Contrato Cancelado y Fianza Liquidada</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {cancellationResult.policyExplanation}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141412] border border-[#363632] space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#A8A69E]">
                    <span>Monto Original de la Reserva:</span>
                    <span className="text-[#F5F4F0]">${Number(cancellationResult.originalTotalAmount).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-rose-400 font-bold">
                    <span>Penalización Retenida ({cancellationResult.penaltyPercentage}%):</span>
                    <span>-${Number(cancellationResult.penaltyFeeAmount).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Depósito en Garantía Reembolsado:</span>
                    <span>+${Number(cancellationResult.refundedDepositAmount).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-sky-400 font-black pt-2 border-t border-[#363632] text-sm">
                    <span>Total a Reembolsar al Cliente:</span>
                    <span>${Number(cancellationResult.totalRefundedToClient).toLocaleString('es-CO')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCancelModalReservation(null);
                    setCancellationResult(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#D94E1F] hover:bg-[#B83D14] text-white font-bold text-xs transition-colors"
                >
                  Aceptar y Cerrar
                </button>
              </div>
            ) : (
              /* Explicación de la Política Contractual de Multa */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#141412] border border-[#363632] space-y-2 text-xs">
                  <div className="font-bold text-[#F5F4F0] flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>Política Contractual de Reembolsos RENTAMAQ:</span>
                  </div>
                  <ul className="space-y-1 text-[#A8A69E] text-[11px] list-disc list-inside">
                    <li><strong className="text-[#F5F4F0]">Más de 48 horas previas:</strong> 100% de reembolso de tarifa y depósito (0% penalización).</li>
                    <li><strong className="text-[#F5F4F0]">Entre 24 y 48 horas previas:</strong> Se retiene el 20% del alquiler por bloqueo logístico.</li>
                    <li><strong className="text-[#F5F4F0]">Menos de 24 horas:</strong> Se retiene el 50% de la tarifa por cuadrilla en tránsito.</li>
                    <li><strong className="text-emerald-400">Garantía Escrow:</strong> El 100% del depósito fiduciario es devuelto íntegramente.</li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A8A69E] uppercase font-mono">
                    Motivo de Cancelación Voluntaria
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    className="w-full bg-[#141412] border border-[#363632] rounded-lg px-3 py-2 text-xs text-[#F5F4F0] focus:outline-none focus:border-rose-400"
                    placeholder="Indica el motivo de la cancelación..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancelModalReservation(null)}
                    className="flex-1 py-2.5 rounded-xl bg-[#232320] hover:bg-[#2d2d29] text-[#A8A69E] hover:text-[#F5F4F0] text-xs font-semibold border border-[#363632] transition-colors"
                  >
                    Mantener Contrato
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancelWithPenalty}
                    disabled={submittingCancellation}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    {submittingCancellation ? 'Liquidando Multa...' : 'Confirmar Cancelación'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PISTA DE AUDITORÍA DE ESTADOS (AUDIT TRAIL)                       */}
      {/* ========================================================================= */}
      {auditModalReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#181816] border border-[#363632] rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-5 text-[#F5F4F0]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#363632] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F4F0]">
                    Pista de Auditoría de Estados
                  </h3>
                  <p className="text-[11px] text-[#A8A69E] font-mono">
                    {auditModalReservation.reservationCode || `RES-${auditModalReservation.id}`} · {auditModalReservation.toolName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalReservation(null)}
                className="w-8 h-8 rounded-lg bg-[#232320] hover:bg-[#2d2d29] text-[#A8A69E] hover:text-[#F5F4F0] flex items-center justify-center border border-[#363632]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Body */}
            {loadingAudit ? (
              <div className="py-12 text-center text-xs text-[#A8A69E]">
                Cargando trazabilidad cronológica de transiciones...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#141412] border border-[#363632] text-center space-y-2">
                <History className="w-6 h-6 text-[#706E66] mx-auto" />
                <p className="text-xs text-[#A8A69E]">
                  No se registran transiciones auditadas para esta reserva o el contrato fue creado recientemente.
                </p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
                {auditLogs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-3.5 rounded-xl bg-[#141412] border border-[#363632] flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#232320] border border-[#363632] flex items-center justify-center shrink-0 text-amber-400 font-mono text-xs font-bold">
                      #{idx + 1}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                          {log.previousStatus && (
                            <>
                              <span className="text-[#A8A69E]">{log.previousStatus}</span>
                              <span className="text-[#706E66]">➔</span>
                            </>
                          )}
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            {log.newStatus}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#706E66] font-mono">
                          {log.changedAt ? new Date(log.changedAt).toLocaleString('es-CO') : 'Reciente'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#A8A69E]">
                        Por: <span className="text-[#F5F4F0] font-semibold">{log.changedBy}</span>
                      </div>
                      {log.reason && (
                        <div className="text-[11px] text-[#A8A69E] bg-[#1E1E1C] p-2 rounded-lg border border-[#363632] italic">
                          "{log.reason}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-[#363632]">
              <button
                type="button"
                onClick={() => setAuditModalReservation(null)}
                className="w-full py-2.5 rounded-xl bg-[#232320] hover:bg-[#2d2d29] text-[#F5F4F0] font-bold text-xs border border-[#363632] transition-colors"
              >
                Cerrar Pista de Auditoría
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedForPayment && (
        <PaymentModal
          reservation={selectedForPayment}
          onClose={() => setSelectedForPayment(null)}
          onPaymentSuccess={fetchReservations}
          onOpenDianModal={(r) => {
            setSelectedForPayment(null);
            setActiveDianModal(r);
          }}
        />
      )}

      {/* DIAN Invoice Modal (Factura Electrónica de Venta Completa) */}
      {activeDianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div 
            className="bg-[#121210] border border-[#363632] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden glass-modal max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header DIAN */}
            <div className="p-4 sm:p-5 border-b border-[#363632] bg-[#1a1a18] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E6F43]/20 border border-[#1E6F43] flex items-center justify-center text-[#4ade80]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#F5F4F0] tracking-tight">
                      Factura Electrónica de Venta
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-[#1E6F43]/20 text-[#4ade80] border border-[#1E6F43]/40 px-2 py-0.5 rounded-full">
                      TIMBRADO DIAN VÁLIDO
                    </span>
                  </div>
                  <p className="text-xs text-[#A8A69E] font-mono mt-0.5">
                    N° FE-2026-{String(activeDianModal.id).padStart(6, '0')} · Res. DIAN 18764000001
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDianModal(null)}
                aria-label="Cerrar modal de factura"
                className="w-8 h-8 rounded-lg bg-[#242422] hover:bg-[#30302c] text-[#A8A69E] hover:text-[#F5F4F0] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#181816] border border-[#363632]">
                <div>
                  <div className="text-[10px] text-[#A8A69E] uppercase font-bold">Emisor / Arrendador</div>
                  <div className="text-[#F5F4F0] font-bold text-xs mt-0.5">RENTAMAQ COLOMBIA SAS</div>
                  <div className="text-[#A8A69E] text-[11px]">NIT: 901.849.204-8 · Bogotá D.C.</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#A8A69E] uppercase font-bold">Cliente Constructor</div>
                  <div className="text-[#F5F4F0] font-bold text-xs mt-0.5">{user.companyName || user.fullName || 'Constructora'}</div>
                  <div className="text-[#A8A69E] text-[11px]">NIT: 900.548.120-1 · Régimen Común</div>
                </div>
              </div>

              {/* CUFE */}
              <div className="p-3 rounded-xl bg-[#181816] border border-[#363632] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#A8A69E]">
                  <span className="font-bold uppercase tracking-wider">Código Único de Factura Electrónica (CUFE)</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`cufe-rentamaq-fe2026-${activeDianModal.id}-dian-valid`);
                      setCopiedCufe(true);
                      setTimeout(() => setCopiedCufe(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[#D94E1F] hover:underline"
                  >
                    {copiedCufe ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCufe ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-[#A8A69E] break-all select-all font-mono">
                  b9416a8656e474a6c8e7710648d4b941{activeDianModal.id}dian2026colombiafe00192847291
                </div>
              </div>

              {/* Items Desglose */}
              <div className="p-3 rounded-xl bg-[#181816] border border-[#363632] space-y-2">
                <div className="flex justify-between text-xs text-[#F5F4F0] font-bold">
                  <span>{activeDianModal.toolName || 'Maquinaria de Construcción'}</span>
                  <span>{formatCOP(activeDianModal.subtotalPrice || (activeDianModal.totalPrice * 0.81))}</span>
                </div>
                <div className="text-[11px] text-[#A8A69E]">
                  Período: {activeDianModal.startDate} al {activeDianModal.endDate} ({activeDianModal.totalDays || 1} días de operación)
                </div>
                {activeDianModal.hasDamageInsurance && (
                  <div className="flex justify-between text-[11px] text-amber-400 font-bold">
                    <span>Seguro Todo Riesgo de Daños (+8%):</span>
                    <span>{formatCOP(activeDianModal.insuranceCost || ((activeDianModal.subtotalPrice || activeDianModal.totalPrice * 0.81) * 0.08))}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#A8A69E] pt-2 border-t border-[#363632]">
                  <span>IVA Legal (19%):</span>
                  <span className="text-[#F5F4F0]">{formatCOP(activeDianModal.taxAmount || (activeDianModal.totalPrice * 0.19))}</span>
                </div>
                <div className="flex justify-between text-xs text-[#A8A69E]">
                  <span>Depósito en Garantía (Escrow fiduciario):</span>
                  <span className="text-[#F5F4F0]">{formatCOP(activeDianModal.depositAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#D94E1F] font-black pt-2 border-t border-[#363632]">
                  <span>TOTAL LIQUIDADO DIAN:</span>
                  <span>{formatCOP(activeDianModal.totalPrice)}</span>
                </div>
              </div>

              {/* QR Mock y Verificación */}
              <div className="p-3 rounded-xl bg-[#181816] border border-[#363632] flex items-center gap-3">
                <div className="w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10 text-black" />
                </div>
                <div className="text-[11px] text-[#A8A69E] space-y-0.5">
                  <div className="font-bold text-[#F5F4F0]">Validación Previa DIAN Aprobada</div>
                  <div>Documento electrónico timbrado según Anexo Técnico 1.8 DIAN. Representación gráfica válida para deducción fiscal de costos y gastos.</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#363632] bg-[#1a1a18] flex items-center justify-between shrink-0">
              <button
                onClick={() => setActiveDianModal(null)}
                className="px-4 py-2 bg-[#242422] hover:bg-[#30302c] text-[#A8A69E] hover:text-[#F5F4F0] rounded-xl text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-[#242422] hover:bg-[#30302c] text-[#F5F4F0] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#363632]"
                >
                  <Printer className="w-3.5 h-3.5 text-[#A8A69E]" />
                  <span>Imprimir Factura</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    downloadDianInvoicePdf(activeDianModal);
                    showToast('Factura Electrónica de Venta PDF descargada con éxito', 'success');
                  }}
                  className="px-4 py-2 bg-[#D94E1F] hover:bg-[#E05A2B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-[#D94E1F]/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF Oficial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Certificado RETIE 4FN */}
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

      {/* Modal Calificación y Reseña de Maquinaria */}
      {selectedForReview && (
        <CreateReviewModal
          reservation={selectedForReview}
          onClose={() => setSelectedForReview(null)}
          onSuccess={() => {
            setSelectedForReview(null);
            showToast('¡Calificación y reseña técnica publicadas con éxito!', 'success');
            fetchReservations();
          }}
        />
      )}

    </div>
  );
};
