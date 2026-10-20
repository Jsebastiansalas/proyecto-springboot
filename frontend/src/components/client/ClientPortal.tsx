import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { Reservation } from '../../types';
import { ReservationTimeline } from './ReservationTimeline';
import { PaymentModal } from './PaymentModal';
import { 
  FileText, 
  CreditCard, 
  Receipt, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  UserCheck, 
  HardHat,
  ArrowRight,
  ExternalLink,
  DollarSign
} from 'lucide-react';

export const ClientPortal: React.FC = () => {
  const { user, quickDemoLogin, showToast } = useApp();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForPayment, setSelectedForPayment] = useState<Reservation | null>(null);
  const [activeDianModal, setActiveDianModal] = useState<Reservation | null>(null);

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

  useEffect(() => {
    fetchReservations();
  }, [user]);

  if (!user || (user.role !== 'ROLE_CLIENTE' && user.role !== 'ROLE_ADMIN')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
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
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs inline-flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>Acceder con Perfil Demo Cliente (Constructora)</span>
        </button>
      </div>
    );
  }

  // Métricas rápidas del cliente
  const totalInvertido = reservations.reduce((acc, r) => acc + r.totalPrice, 0);
  const totalGarantias = reservations.reduce((acc, r) => acc + r.depositAmount, 0);
  const activosCount = reservations.filter(r => r.status === 'EN_CURSO' || r.status === 'APROBADA').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Client Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <HardHat className="w-4 h-4" />
            <span>Portal de Operaciones B2B</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mis Alquileres & Maquinaria en Obra
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cliente: <span className="text-slate-200 font-semibold">{user.companyName || user.fullName || user.email}</span> · NIT: 900.548.120-1
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Póliza SURA Activa</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Equipos en Despacho/Obra</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{activosCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Frentes de trabajo en Bogotá y Cundinamarca</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Inversión Alquiler</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${totalInvertido.toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Facturación acumulada en contratos vigentes</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Garantías en Custodia (Escrow)</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${totalGarantias.toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Retornables al finalizar sin novedades</div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Contratos de Maquinaria Registrados ({reservations.length})</span>
          </h2>
          <button
            onClick={fetchReservations}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Actualizar Estado
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Consultando contratos en base de datos...
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-white font-semibold text-sm">No tienes contratos de alquiler activos</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explora el catálogo de maquinaria, añade equipos a tu cotización y emite tu primer contrato.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reservations.map(res => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800 shadow-xl space-y-5 glass-panel"
              >
                {/* Top Row: Meta info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {res.toolImage ? (
                        <img src={res.toolImage} alt={res.toolName} className="w-full h-full object-cover" />
                      ) : (
                        <Wrench className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {res.reservationCode}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {res.startDate} ➔ {res.endDate} ({res.totalDays} días)
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {res.toolName}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      {res.status}
                    </span>

                    {/* Payment Status Badge */}
                    <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
                      res.paymentStatus === 'PAGADO'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {res.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Operations Timeline Component */}
                <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800/80">
                  <ReservationTimeline status={res.status} />
                </div>

                {/* Financial Summary & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 block">Total Contrato:</span>
                      <span className="font-mono font-bold text-white text-sm">
                        ${res.totalPrice.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Depósito Escrow:</span>
                      <span className="font-mono text-slate-300">
                        ${res.depositAmount.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Método:</span>
                      <span className="font-mono text-slate-300">{res.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {res.status === 'PENDIENTE' && (
                      <button
                        onClick={async () => {
                          if (window.confirm('¿Deseas cancelar esta reserva?')) {
                            try {
                              await rentaService.reservations.cancel(res.id);
                              showToast('Reserva cancelada con éxito.', 'info');
                              fetchReservations();
                            } catch (err: any) {
                              showToast(`Error al cancelar: ${err.message}`, 'error');
                            }
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors border border-slate-700"
                      >
                        Cancelar
                      </button>
                    )}

                    <button
                      onClick={() => setActiveDianModal(res)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Receipt className="w-3.5 h-3.5 text-sky-400" />
                      <span>Factura DIAN</span>
                    </button>

                    <button
                      onClick={() => setSelectedForPayment(res)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{res.paymentStatus === 'PAGADO' ? 'Detalles de Pago' : 'Gestionar Pago'}</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedForPayment && (
        <PaymentModal
          reservation={selectedForPayment}
          onClose={() => setSelectedForPayment(null)}
          onPaymentSuccess={fetchReservations}
        />
      )}

      {/* DIAN Invoice Modal */}
      {activeDianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 glass-modal">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <span>Factura Electrónica de Venta</span>
              </div>
              <button
                onClick={() => setActiveDianModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono">
                <div className="text-slate-400 text-[10px] uppercase">Código Único de Factura Electrónica (CUFE)</div>
                <div className="text-indigo-300 break-all text-[11px]">
                  fe80::1ff:fe00:3a60:8b9c:5421:9a8f:c712:44bb:92e1:810f
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400">Emisor:</div>
                  <div className="font-semibold text-white">RENTAMAQ INDUSTRIAL S.A.S.</div>
                  <div className="text-slate-400 font-mono">NIT: 901.442.189-4</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400">Adquiriente:</div>
                  <div className="font-semibold text-white">{activeDianModal.clientName}</div>
                  <div className="text-slate-400 font-mono">NIT: 900.548.120-1</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal Operativo:</span>
                  <span className="font-mono text-slate-200">${activeDianModal.subtotalPrice.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IVA 19%:</span>
                  <span className="font-mono text-slate-200">${activeDianModal.taxAmount.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-white">
                  <span>Total Timbrado DIAN:</span>
                  <span className="font-mono text-indigo-400">${activeDianModal.totalPrice.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveDianModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
              <button
                onClick={() => showToast('Generando representación gráfica PDF timbrada por la DIAN...', 'info')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Descargar PDF Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
