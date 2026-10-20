// ============================================================================
// TIPOS Y MODELOS DE DOMINIO - RENTAMAQ TYPESCRIPT
// ============================================================================

export type UserRole = 'ROLE_ADMIN' | 'ROLE_CLIENTE' | 'ROLE_PROVEEDOR';

export interface AuthUser {
  id: number;
  userId?: number;
  clientId?: number;
  providerId?: number;
  email: string;
  role: UserRole;
  fullName?: string;
  companyName?: string;
  token: string;
}

export type ToolStatus = 'DISPONIBLE' | 'ALQUILADA' | 'MANTENIMIENTO' | 'RETIRADA';

export interface TechnicalSpec {
  id?: number;
  specKey: string;
  specValue: string;
  unitOfMeasure?: string;
}

export interface TelemetryData {
  horometro: number; // Horas trabajadas
  fuelOrBatteryLevel: number; // Porcentaje 0-100%
  nextServiceHours: number; // Horas restantes para mantenimiento preventivo
  retieCertified: boolean; // Certificado RETIE vigente
  operatingTemp: number; // Grados Celsius
  vibrationLevel: 'NORMAL' | 'PRECAUCIÓN' | 'ÓPTIMO';
}

export interface Tool {
  id: number;
  name: string;
  brand: string;
  model: string;
  codeSku: string;
  categoryId: number;
  categoryName: string;
  baseDailyPrice: number;
  depositAmount: number;
  description?: string;
  status: ToolStatus;
  mainImageUrl: string;
  providerId: number;
  providerName: string;
  technicalSpecs?: TechnicalSpec[];
  averageRating?: number;
  totalReviews?: number;
  telemetry?: TelemetryData;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  toolCount?: number;
}

export type ReservationStatus = 
  | 'PENDIENTE' 
  | 'APROBADA' 
  | 'EN_CURSO' 
  | 'FINALIZADA' 
  | 'CANCELADA' 
  | 'RECHAZADA';

export type PaymentStatus = 
  | 'PENDIENTE' 
  | 'PAGADO' 
  | 'RECHAZADO' 
  | 'REEMBOLSADO' 
  | 'RETENIDO';

export type PaymentMethod = 
  | 'TARJETA_CREDITO' 
  | 'PSE' 
  | 'TRANSFERENCIA' 
  | 'EN_CUOTAS';

export interface PaymentInstallment {
  id: number;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  status: 'PENDIENTE' | 'PAGADA' | 'VENCIDA';
  paidAt?: string;
  transactionRef?: string;
}

export interface Reservation {
  id: number;
  reservationCode: string;
  toolId: number;
  toolName: string;
  toolImage?: string;
  clientId: number;
  clientName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyPrice: number;
  subtotalPrice: number;
  depositAmount: number;
  taxAmount: number;
  totalPrice: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  installmentCount?: number;
  paidInstallments?: number;
  totalInstallments?: number;
  createdAt: string;
  invoiceId?: number;
  invoiceNumber?: string;
}

export interface OccupiedDateRange {
  startDate: string;
  endDate: string;
  reservationCode: string;
}

export interface Review {
  id: number;
  toolId: number;
  clientId: number;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export interface ToolComment {
  id: number;
  toolId: number;
  authorName: string;
  content: string;
  createdAt: string;
  officialReply?: {
    replyContent: string;
    repliedAt: string;
    providerName: string;
  };
}

export interface CartItem {
  tool: Tool;
  days: number;
  startDate?: string;
  endDate?: string;
}

export interface AdminDashboardData {
  totalRevenue: number;
  totalDepositsInEscrow: number;
  activeRentals: number;
  totalTools: number;
  totalClients: number;
  totalProviders: number;
  topRentedTools?: Array<{
    toolName: string;
    brand: string;
    rentalCount: number;
    revenueGenerated: number;
  }>;
  topClients?: Array<{
    clientName: string;
    email: string;
    totalRentals: number;
    totalSpent: number;
  }>;
}

export type DocumentType = 'CC' | 'CE' | 'PASAPORTE' | 'NIT';

export interface RegisterClientData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  address: string;
  city: string;
}

export interface RegisterProviderData {
  email: string;
  password: string;
  companyName: string;
  legalRepresentative: string;
  nitRut: string;
  phone: string;
  address: string;
  city: string;
}
