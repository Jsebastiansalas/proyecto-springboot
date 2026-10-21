import { apiClient } from './apiClient';
import { 
  AuthUser, 
  Tool, 
  Category, 
  Reservation, 
  ReviewSummary, 
  ToolComment, 
  OccupiedDateRange, 
  PaymentInstallment,
  AdminDashboardData,
  RegisterClientData,
  RegisterProviderData
} from '../types';

// Normalizador defensivo de reservas para conciliar modelos DTO del Backend con la UI
const mapReservation = (raw: any): Reservation => {
  if (!raw) return raw;
  const totalPrice = Number(raw.totalPrice ?? raw.totalAmount ?? 0);
  const depositAmount = Number(raw.depositAmount ?? raw.depositTotal ?? 0);
  const subtotalPrice = Number(raw.subtotalPrice ?? raw.subtotal ?? 0);
  const taxAmount = Number(raw.taxAmount ?? Math.round(subtotalPrice * 0.19) ?? 0);
  const days = Math.max(1, Number(raw.totalDays || 1));
  const dailyPrice = Number(raw.dailyPrice ?? (days > 0 ? Math.round(subtotalPrice / days) : 0));

  return {
    id: raw.id,
    reservationCode: raw.reservationCode || `RES-${raw.id}`,
    toolId: raw.toolId,
    toolName: raw.toolName || 'Maquinaria de Obra',
    toolImage: raw.toolImage || raw.toolImageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
    clientId: raw.clientId,
    clientName: raw.clientName || 'Cliente Constructora',
    startDate: raw.startDate || '',
    endDate: raw.endDate || '',
    totalDays: days,
    dailyPrice,
    subtotalPrice,
    depositAmount,
    taxAmount,
    totalPrice,
    status: raw.status || 'PENDIENTE',
    paymentStatus: raw.paymentStatus || (raw.hasPayment ? 'PAGADO' : 'PENDIENTE'),
    paymentMethod: raw.paymentMethod || 'TARJETA_CREDITO',
    installmentCount: raw.installmentCount || 1,
    paidInstallments: raw.paidInstallments || 0,
    totalInstallments: raw.installmentCount || 1,
    createdAt: raw.createdAt || new Date().toISOString(),
    invoiceId: raw.invoiceId,
    invoiceNumber: raw.invoiceNumber
  };
};

export const rentaService = {
  // 1. AUTENTICACIÓN & SEGURIDAD
  auth: {
    login: async (email: string, password: string): Promise<AuthUser> => {
      const data = await apiClient.post<any>('/auth/login', { email, password });
      apiClient.setToken(data.token);

      // Obtener identificadores específicos de perfil (clientId, providerId)
      let clientId: number | undefined;
      let providerId: number | undefined;
      let displayName: string = data.name || email;

      try {
        const me = await apiClient.get<any>('/auth/me');
        if (me) {
          clientId = me.clientId;
          providerId = me.providerId;
          displayName = me.displayName || displayName;
        }
      } catch (e) {
        console.warn('No se pudo obtener información adicional de /auth/me:', e);
      }

      const activeId = clientId ?? providerId ?? data.userId ?? data.id;

      const user: AuthUser = {
        id: activeId,
        userId: data.userId ?? data.id,
        clientId,
        providerId,
        email: data.email,
        role: data.role,
        fullName: displayName,
        companyName: displayName,
        token: data.token,
      };

      localStorage.setItem('rentamaq_user', JSON.stringify(user));
      return user;
    },
    registerClient: async (payload: RegisterClientData): Promise<AuthUser> => {
      const data = await apiClient.post<any>('/auth/register-client', payload);
      apiClient.setToken(data.token);

      let clientId: number | undefined;
      let providerId: number | undefined;
      let displayName: string = data.name || `${payload.firstName} ${payload.lastName}`;

      try {
        const me = await apiClient.get<any>('/auth/me');
        if (me) {
          clientId = me.clientId;
          providerId = me.providerId;
          displayName = me.displayName || displayName;
        }
      } catch (e) {
        console.warn('No se pudo obtener información adicional de /auth/me:', e);
      }

      const activeId = clientId ?? data.userId ?? data.id;

      const user: AuthUser = {
        id: activeId,
        userId: data.userId ?? data.id,
        clientId,
        providerId,
        email: data.email,
        role: data.role,
        fullName: displayName,
        companyName: displayName,
        token: data.token,
      };

      localStorage.setItem('rentamaq_user', JSON.stringify(user));
      return user;
    },
    registerProvider: async (payload: RegisterProviderData): Promise<AuthUser> => {
      const data = await apiClient.post<any>('/auth/register-provider', payload);
      apiClient.setToken(data.token);

      let clientId: number | undefined;
      let providerId: number | undefined;
      let displayName: string = data.name || payload.companyName;

      try {
        const me = await apiClient.get<any>('/auth/me');
        if (me) {
          clientId = me.clientId;
          providerId = me.providerId;
          displayName = me.displayName || displayName;
        }
      } catch (e) {
        console.warn('No se pudo obtener información adicional de /auth/me:', e);
      }

      const activeId = providerId ?? data.userId ?? data.id;

      const user: AuthUser = {
        id: activeId,
        userId: data.userId ?? data.id,
        clientId,
        providerId,
        email: data.email,
        role: data.role,
        fullName: displayName,
        companyName: payload.companyName,
        token: data.token,
      };

      localStorage.setItem('rentamaq_user', JSON.stringify(user));
      return user;
    },
    changePassword: async (currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<{ message: string }> => {
      return apiClient.post<{ message: string }>('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
    },
    logout: () => {
      apiClient.clearToken();
    },
    getCurrentUser: (): AuthUser | null => {
      const raw = localStorage.getItem('rentamaq_user');
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.id && parsed.userId) {
          parsed.id = parsed.clientId || parsed.providerId || parsed.userId;
        }
        return parsed;
      } catch {
        return null;
      }
    }
  },

  // 2. CATÁLOGO DE MAQUINARIA & CATEGORÍAS
  tools: {
    getAll: async (): Promise<Tool[]> => {
      const tools = await apiClient.get<Tool[]>('/tools');
      // Enriquecer con telemetría mock determinista por ID para demostración técnica IoT
      return tools.map(t => ({
        ...t,
        telemetry: {
          horometro: 120 + (t.id * 47) % 850,
          fuelOrBatteryLevel: 65 + (t.id * 17) % 35,
          nextServiceHours: 80 - (t.id * 9) % 60,
          retieCertified: t.id % 2 === 0,
          operatingTemp: 72 + (t.id * 3) % 18,
          vibrationLevel: t.id % 3 === 0 ? 'ÓPTIMO' : 'NORMAL'
        }
      }));
    },
    getById: async (id: number): Promise<Tool> => {
      const t = await apiClient.get<Tool>(`/tools/${id}`);
      return {
        ...t,
        telemetry: {
          horometro: 120 + (t.id * 47) % 850,
          fuelOrBatteryLevel: 75 + (t.id * 13) % 25,
          nextServiceHours: 65,
          retieCertified: true,
          operatingTemp: 74,
          vibrationLevel: 'ÓPTIMO'
        }
      };
    },
    getCategories: (): Promise<Category[]> => {
      return apiClient.get<Category[]>('/tools/categories');
    },
    getOccupiedDates: (toolId: number): Promise<OccupiedDateRange[]> => {
      return apiClient.get<OccupiedDateRange[]>(`/reservations/tool/${toolId}/occupied-dates`);
    },
    getByProvider: (providerId: number): Promise<Tool[]> => {
      return apiClient.get<Tool[]>(`/tools/provider/${providerId}`);
    },
    create: (toolData: any): Promise<Tool> => {
      return apiClient.post<Tool>('/tools', toolData);
    },
    update: (id: number, toolData: any): Promise<Tool> => {
      return apiClient.put<Tool>(`/tools/${id}`, toolData);
    },
    delete: (id: number): Promise<void> => {
      return apiClient.delete(`/tools/${id}`);
    },
    updateStatus: (id: number, status: string): Promise<void> => {
      return apiClient.patch(`/tools/${id}/status?status=${status}`);
    }
  },

  // 3. COTIZACIÓN & RESERVAS
  reservations: {
    calculatePrice: (toolId: number, daysOrStartDate: number | string, endDate?: string): Promise<{
      dailyPrice: number;
      subtotalPrice: number;
      depositAmount: number;
      taxAmount: number;
      totalPrice: number;
      weeklyDiscountApplied: boolean;
      discountAmount: number;
    }> => {
      if (typeof daysOrStartDate === 'number') {
        const start = new Date().toISOString().split('T')[0];
        const end = new Date(Date.now() + Math.max(1, daysOrStartDate) * 86400000).toISOString().split('T')[0];
        return apiClient.post('/reservations/calculate-price', {
          toolId,
          days: daysOrStartDate,
          startDate: start,
          endDate: end
        });
      }
      return apiClient.post('/reservations/calculate-price', {
        toolId,
        startDate: daysOrStartDate,
        endDate: endDate || daysOrStartDate
      });
    },
    create: async (data: {
      toolId: number;
      startDate: string;
      endDate: string;
      clientId?: number;
      paymentMethod?: string;
      installmentCount?: number;
      notes?: string;
    }): Promise<Reservation> => {
      const res = await apiClient.post<any>('/reservations', data);
      return mapReservation(res);
    },
    getAll: async (): Promise<Reservation[]> => {
      const res = await apiClient.get<any[]>('/reservations');
      return Array.isArray(res) ? res.map(mapReservation) : [];
    },
    getByClient: async (clientId: number): Promise<Reservation[]> => {
      const res = await apiClient.get<any[]>(`/reservations/client/${clientId}`);
      return Array.isArray(res) ? res.map(mapReservation) : [];
    },
    getByProvider: async (providerId: number): Promise<Reservation[]> => {
      const res = await apiClient.get<any[]>(`/reservations/provider/${providerId}`);
      return Array.isArray(res) ? res.map(mapReservation) : [];
    },
    getById: async (id: number): Promise<Reservation> => {
      const res = await apiClient.get<any>(`/reservations/${id}`);
      return mapReservation(res);
    },
    approve: async (id: number): Promise<Reservation> => {
      const res = await apiClient.patch<any>(`/reservations/${id}/approve`);
      return mapReservation(res);
    },
    reject: async (id: number, reason: string): Promise<Reservation> => {
      const cleanReason = reason || 'Rechazada por el proveedor';
      const res = await apiClient.patch<any>(`/reservations/${id}/reject?reason=${encodeURIComponent(cleanReason)}`, { reason: cleanReason });
      return mapReservation(res);
    },
    cancel: async (id: number, reason?: string): Promise<Reservation> => {
      const cleanReason = reason || 'Cancelada por el usuario';
      const res = await apiClient.patch<any>(`/reservations/${id}/cancel?reason=${encodeURIComponent(cleanReason)}`, { reason: cleanReason });
      return mapReservation(res);
    }
  },

  // 4. PAGOS & PLAN DE CUOTAS
  payments: {
    process: (reservationId: number, paymentMethod: string, installmentCount: number = 1, amount?: number): Promise<{ status: string; transactionId: string }> => {
      return apiClient.post('/payments/process', {
        reservationId,
        paymentMethod,
        installmentCount,
        ...(amount != null ? { amount } : {})
      });
    },
    getInstallments: (reservationId: number): Promise<PaymentInstallment[]> => {
      return apiClient.get<PaymentInstallment[]>(`/payments/reservation/${reservationId}/installments`);
    },
    payInstallment: (installmentId: number): Promise<{ message: string }> => {
      return apiClient.post(`/payments/installments/${installmentId}/pay`);
    }
  },

  // 5. RESEÑAS & CALIFICACIONES
  reviews: {
    getByTool: (toolId: number): Promise<ReviewSummary> => {
      return apiClient.get<ReviewSummary>(`/reviews/tool/${toolId}`);
    },
    create: (data: { toolId: number; reservationId: number; rating: number; comment: string }): Promise<void> => {
      return apiClient.post('/reviews', data);
    }
  },

  // 6. MURO INTERACTIVO DE PREGUNTAS Y COMENTARIOS (Q&A)
  comments: {
    getByTool: (toolId: number): Promise<ToolComment[]> => {
      return apiClient.get<ToolComment[]>(`/tools/${toolId}/comments`);
    },
    create: (toolId: number, content: string): Promise<ToolComment> => {
      return apiClient.post(`/tools/${toolId}/comments`, { content, commentText: content });
    },
    reply: (commentId: number, replyContent: string): Promise<ToolComment> => {
      return apiClient.patch(`/tools/comments/${commentId}/reply`, { replyContent, providerReply: replyContent });
    }
  },

  // 7. ADMINISTRACIÓN & OBSERVABILIDAD
  admin: {
    getDashboard: async (): Promise<AdminDashboardData> => {
      const res = await apiClient.get<any>('/reports/admin');
      return {
        totalRevenue: Number(res.totalRevenue ?? 0),
        totalDepositsInEscrow: Number(res.totalDepositsHeld ?? 0),
        activeRentals: Number(res.activeRentals ?? 0),
        totalTools: Number(res.totalTools ?? 0),
        totalClients: Number(res.totalClients ?? 0),
        totalProviders: Number(res.totalProviders ?? 0),
        topRentedTools: (res.topRentedTools || []).map((t: any) => ({
          toolName: t.toolName || t.name,
          brand: t.brand || 'Industrial',
          rentalCount: Number(t.rentalCount || t.totalRentals || 0),
          revenueGenerated: Number(t.revenueGenerated || t.revenue || 0)
        })),
        topClients: (res.topFrequentClients || []).map((c: any) => ({
          clientName: c.clientName || c.name,
          email: c.email || '',
          totalRentals: Number(c.rentalCount || c.totalRentals || 0),
          totalSpent: Number(c.totalSpent || 0)
        }))
      };
    },
    getUsers: (): Promise<any[]> => {
      return apiClient.get<any[]>('/admin/users');
    },
    toggleUserStatus: (id: number, active: boolean): Promise<void> => {
      return apiClient.patch(`/admin/users/${id}/status?active=${active}`);
    },
    getProviders: (): Promise<any[]> => {
      return apiClient.get<any[]>('/admin/providers');
    },
    verifyProvider: (id: number, verified: boolean): Promise<void> => {
      return apiClient.patch(`/admin/providers/${id}/verify?verified=${verified}`);
    }
  },

  // 8. ENTREGAS, DEVOLUCIONES & DAÑOS
  deliveries: {
    startRental: (data: { reservationId: number; initialOperatingHours?: number; deliveryNotes?: string; deliveredBy?: string }): Promise<any> => {
      return apiClient.post('/deliveries', {
        reservationId: data.reservationId,
        deliveredBy: data.deliveredBy || 'Patio Central RentaMaq',
        initialConditionNotes: data.deliveryNotes || 'Equipo inspeccionado y entregado según protocolo 4FN',
        clientSignatureAck: true,
        initialOperatingHours: data.initialOperatingHours || 0,
        observations: data.deliveryNotes
      });
    },
    finishRental: (data: { reservationId: number; returnDate?: string; returnCondition?: string; returnNotes?: string; extraDamageFee?: number }): Promise<any> => {
      const fee = data.extraDamageFee || 0;
      return apiClient.post('/returns', {
        reservationId: data.reservationId,
        receivedBy: 'Inspector Técnico RentaMaq',
        conditionStatus: data.returnCondition || (fee > 0 ? 'CON_DESGASTE' : 'OPTIMO'),
        inspectionNotes: data.returnNotes || 'Inspección técnica de retorno completada.',
        extraDamageFee: fee,
        depositRefunded: fee === 0,
        damageDescription: fee > 0 ? data.returnNotes : null
      });
    },
    registerDamage: (data: { returnId?: number; rentalReturnId?: number; description: string; repairCostEstimate?: number; estimatedRepairCost?: number }): Promise<any> => {
      const id = data.returnId || data.rentalReturnId || 0;
      const cost = data.repairCostEstimate != null ? data.repairCostEstimate : (data.estimatedRepairCost || 0);
      return apiClient.post('/damages', {
        returnId: id,
        rentalReturnId: id,
        reportedBy: 'Inspector Técnico RentaMaq',
        damageType: 'ESTRUCTURA',
        description: data.description,
        repairCostEstimate: cost,
        estimatedRepairCost: cost
      });
    },
    getDamageReports: (returnId: number): Promise<any[]> => {
      return apiClient.get<any[]>(`/damages/return/${returnId}`);
    }
  },

  // 9. LOGÍSTICA & LIQUIDACIÓN DE GARANTÍAS
  logistics: {
    dispatch: (reservationId: number, initialHours: number, observations: string) => {
      return apiClient.post('/deliveries', {
        reservationId,
        deliveredBy: 'Patio Central RentaMaq',
        initialConditionNotes: observations || `Horómetro inicial: ${initialHours} hrs. Equipo en óptimas condiciones.`,
        clientSignatureAck: true,
        initialOperatingHours: initialHours,
        initialHours,
        observations
      });
    },
    returnDelivery: (reservationId: number, finalHours: number, damageCost: number, damageReport: string) => {
      const condition = damageCost > 0 ? 'CON_DESGASTE' : 'OPTIMO';
      return apiClient.post('/returns', {
        reservationId,
        receivedBy: 'Inspector Técnico RentaMaq',
        conditionStatus: condition,
        inspectionNotes: damageReport || `Horómetro final: ${finalHours} hrs.`,
        extraDamageFee: damageCost,
        damageCost,
        repairCostEstimate: damageCost,
        depositRefunded: damageCost === 0,
        damageDescription: damageCost > 0 ? damageReport : null,
        damageReport,
        finalHours
      });
    },
    getSettlement: (reservationId: number) => {
      return apiClient.get(`/logistics/settlement/${reservationId}`);
    }
  }
};
