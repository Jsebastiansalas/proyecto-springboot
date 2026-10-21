import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { Reservation } from '../../types';
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
  DollarSign,
  Printer,
  QrCode,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { downloadDianInvoicePdf } from '../../utils/pdfGenerator';

export const ClientPortal: React.FC = () => {
  const { user, quickDemoLogin, showToast } = useApp();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForPayment, setSelectedForPayment] = useState<Reservation | null>(null);
  const [activeDianModal, setActiveDianModal] = useState<Reservation | null>(null);
  const [copiedCufe, setCopiedCufe] = useState(false);

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

  // Formateador seguro de pesos colombianos sin decimales residuales
  const formatCOP = (val?: number | null) => '$ ' + Math.round(Number(val || 0)).toLocaleString('es-CO');

  // Métricas rápidas del cliente calculadas defensivamente
  const totalInvertido = reservations.reduce((acc, r) => acc + Number(r.totalPrice ?? (r as any).totalAmount ?? 0), 0);
  const totalGarantias = reservations.reduce((acc, r) => acc + Number(r.depositAmount ?? (r as any).depositTotal ?? 0), 0);
  const activosCount = reservations.filter(r => r.status === 'EN_CURSO' || r.status === 'APROBADA').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
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

      {/* Reservations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#F5F4F0] tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D94E1F]" />
            <span>Contratos de Maquinaria Registrados ({reservations.length})</span>
          </h2>
          <button
            onClick={fetchReservations}
            className="text-xs text-[#D94E1F] hover:text-[#B83D14] font-semibold"
          >
            Actualizar Estado
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#A8A69E]">
            Consultando contratos en base de datos...
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
            {reservations.map(res => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-[#1E1E1C] border border-[#363632] shadow-xl space-y-5"
              >
                {/* Top Row: Meta info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#363632]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {(res.toolImage || (res as any).toolImageUrl) ? (
                        <img 
                          src={res.toolImage || (res as any).toolImageUrl} 
                          alt={res.toolName || 'Maquinaria'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Wrench className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#D94E1F] bg-[#E05A2B]/10 px-2 py-0.5 rounded border border-[#D94E1F]">
                          {res.reservationCode || `RES-${res.id}`}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {res.startDate || 'N/A'} ➔ {res.endDate || 'N/A'} ({res.totalDays || 1} días)
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {res.toolName || 'Maquinaria Industrial'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#E05A2B]/10 text-[#D94E1F] border border-[#D94E1F]">
                      {res.status || 'PENDIENTE'}
                    </span>

                    {/* Payment Status Badge */}
                    {(() => {
                      const isPaid = res.paymentStatus === 'PAGADO' || res.paymentStatus === 'COMPLETADO' || res.hasPayment;
                      return (
                        <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {isPaid ? 'PAGADO' : (res.paymentStatus || 'PENDIENTE')}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Financial Summary & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 block">Total Contrato:</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatCOP(res.totalPrice ?? (res as any).totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Depósito Escrow:</span>
                      <span className="font-mono text-slate-300">
                        {formatCOP(res.depositAmount ?? (res as any).depositTotal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Método:</span>
                      <span className="font-mono text-slate-300">{res.paymentMethod || 'PASARELA DE PAGO'}</span>
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

                    {(() => {
                      const isPaid = res.paymentStatus === 'PAGADO' || res.paymentStatus === 'COMPLETADO' || res.hasPayment;
                      return (
                        <button
                          onClick={() => setSelectedForPayment(res)}
                          className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                            isPaid
                              ? 'bg-[#1E6F43] hover:bg-[#258552]'
                              : 'bg-[#D94E1F] hover:bg-[#E05A2B] animate-pulse-subtle'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isPaid ? 'Comprobante / Liquidación' : 'Pagar Inmediatamente'}</span>
                        </button>
                      );
                    })()}
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
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
              {/* CUFE Box */}
              <div className="p-3.5 rounded-xl bg-[#181816] border border-[#363632] space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#A8A69E] text-[10px] font-bold uppercase tracking-wider">
                    Código Único de Factura Electrónica (CUFE)
                  </span>
                  <button
                    onClick={() => {
                      const cufeStr = `fe80::1ff:fe00:3a60:8b9c:${activeDianModal.id}a8f:c712:44bb:92e1:810f`;
                      navigator.clipboard?.writeText(cufeStr);
                      setCopiedCufe(true);
                      showToast('CUFE copiado al portapapeles', 'info');
                      setTimeout(() => setCopiedCufe(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[10px] text-[#A8A69E] hover:text-[#F5F4F0] transition-colors"
                  >
                    {copiedCufe ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCufe ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="text-[#D94E1F] break-all text-[11px] bg-[#121210] p-2 rounded-lg border border-[#2a2a26]">
                  fe80::1ff:fe00:3a60:8b9c:{activeDianModal.id}a8f:c712:44bb:92e1:810f
                </div>
              </div>

              {/* Emisor y Adquiriente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#181816] border border-[#363632] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#706E66]">Emisor / Proveedor</div>
                  <div className="font-bold text-[#F5F4F0]">RENTAMAQ INDUSTRIAL S.A.S.</div>
                  <div className="text-[#A8A69E] font-mono text-[11px]">NIT: 901.442.189-4</div>
                  <div className="text-[#706E66] text-[10px]">Régimen Común · Bogotá D.C., Colombia</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#181816] border border-[#363632] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#706E66]">Adquiriente / Cliente</div>
                  <div className="font-bold text-[#F5F4F0]">{activeDianModal.clientName || 'Constructora B2B'}</div>
                  <div className="text-[#A8A69E] font-mono text-[11px]">NIT: 900.548.120-1</div>
                  <div className="text-[#706E66] text-[10px]">Responsable de IVA · Frente de Obra</div>
                </div>
              </div>

              {/* Tabla de Conceptos */}
              <div className="p-4 rounded-xl bg-[#181816] border border-[#363632] space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#2a2a26]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8A69E]">
                    Detalle de Rubros Facturados
                  </span>
                  <span className="text-[11px] font-mono text-[#4ade80] font-semibold">
                    Tarifa General IVA 19%
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <div>
                    <span className="text-[#F5F4F0] font-bold block">
                      Arrendamiento: {activeDianModal.toolName}
                    </span>
                    <span className="text-[10px] text-[#706E66] font-mono">
                      {activeDianModal.totalDays} {Number(activeDianModal.totalDays) === 1 ? 'día' : 'días'} ({activeDianModal.startDate} a {activeDianModal.endDate})
                    </span>
                  </div>
                  <span className="font-mono text-[#F5F4F0]">
                    {formatCOP(activeDianModal.subtotalPrice ?? (activeDianModal as any).subtotal)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-t border-[#2a2a26]">
                  <span className="text-[#A8A69E]">IVA Discriminado (19%):</span>
                  <span className="font-mono text-[#F5F4F0]">
                    {formatCOP(activeDianModal.taxAmount ?? Math.round(Number(activeDianModal.subtotalPrice ?? (activeDianModal as any).subtotal ?? 0) * 0.19))}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-t border-[#2a2a26]">
                  <div>
                    <span className="text-[#A8A69E] block">Garantía Escrow en Custodia:</span>
                    <span className="text-[10px] text-[#706E66]">No genera IVA · Retornable</span>
                  </div>
                  <span className="font-mono text-sky-400">
                    {formatCOP(activeDianModal.depositAmount ?? (activeDianModal as any).depositTotal)}
                  </span>
                </div>

                <div className="flex justify-between pt-2.5 border-t border-[#363632] font-black text-sm">
                  <span className="text-[#F5F4F0]">Total Liquidado DIAN:</span>
                  <span className="font-mono text-[#D94E1F] text-base">
                    {formatCOP(activeDianModal.totalPrice ?? (activeDianModal as any).totalAmount)}
                  </span>
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

    </div>
  );
};
