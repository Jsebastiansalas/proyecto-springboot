/**
 * Cliente API REST para Plataforma de Renta de Herramientas y Equipos
 * Maneja autenticación JWT, RFC 7807 ProblemDetail y llamadas a endpoints v1.
 */

const API = (() => {
  // Detección automática del context-path (soporta raíz '/' y Tomcat '/renta-api/')
  const pathname = window.location.pathname;
  const contextPath = pathname.substring(0, pathname.lastIndexOf('/')).replace(/\/$/, '');
  const BASE_URL = (contextPath ? contextPath : '') + '/api/v1';

  const TOKEN_KEY = 'renta_jwt_token';
  const USER_KEY = 'renta_current_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json') || contentType.includes('application/problem+json');

      if (!response.ok) {
        let errorData = null;
        if (isJson) {
          errorData = await response.json();
        } else {
          errorData = { detail: await response.text() };
        }

        // Manejo específico de 401 sesión expirada
        if (response.status === 401 && token) {
          logout();
          throw new Error('Su sesión ha expirado o las credenciales no son válidas.');
        }

        // Formatear mensaje RFC 7807 ProblemDetail
        let errorMessage = errorData.detail || errorData.title || `Error HTTP ${response.status}`;
        if (errorData.errors && typeof errorData.errors === 'object') {
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, msg]) => `• ${field}: ${msg}`)
            .join('\n');
          errorMessage += `\n${fieldErrors}`;
        }

        const err = new Error(errorMessage);
        err.status = response.status;
        err.problem = errorData;
        throw err;
      }

      if (isJson) {
        return await response.json();
      }
      return await response.text();
    } catch (err) {
      console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint}:`, err);
      throw err;
    }
  }

  return {
    getToken,
    setToken,
    getUser,
    setUser,
    logout,

    // 1. Auth Endpoints
    auth: {
      async login(email, password) {
        const res = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setToken(res.token);
        setUser(res);
        return res;
      },
      async registerClient(clientData) {
        const res = await request('/auth/register-client', {
          method: 'POST',
          body: JSON.stringify(clientData)
        });
        setToken(res.token);
        setUser(res);
        return res;
      },
      async registerProvider(providerData) {
        const res = await request('/auth/register-provider', {
          method: 'POST',
          body: JSON.stringify(providerData)
        });
        setToken(res.token);
        setUser(res);
        return res;
      },
      async getMe() {
        return await request('/auth/me');
      }
    },

    // 2. Tools & Catalog Endpoints
    tools: {
      async getTools(params = {}) {
        const query = new URLSearchParams();
        if (params.query) query.append('query', params.query);
        if (params.categoryId) query.append('categoryId', params.categoryId);
        if (params.minPrice) query.append('minPrice', params.minPrice);
        if (params.maxPrice) query.append('maxPrice', params.maxPrice);
        const qs = query.toString() ? `?${query.toString()}` : '';
        return await request(`/tools${qs}`);
      },
      async getCategories() {
        return await request('/tools/categories');
      },
      async getToolDetail(id) {
        return await request(`/tools/${id}`);
      },
      async getToolsByProvider(providerId) {
        return await request(`/tools/provider/${providerId}`);
      },
      async createTool(toolData) {
        return await request('/tools', {
          method: 'POST',
          body: JSON.stringify(toolData)
        });
      },
      async updateTool(id, toolData) {
        return await request(`/tools/${id}`, {
          method: 'PUT',
          body: JSON.stringify(toolData)
        });
      },
      async updateStatus(id, status) {
        return await request(`/tools/${id}/status?status=${encodeURIComponent(status)}`, {
          method: 'PATCH'
        });
      }
    },

    // 3. Reservations Endpoints
    reservations: {
      async calculatePrice(toolId, startDate, endDate) {
        return await request('/reservations/calculate-price', {
          method: 'POST',
          body: JSON.stringify({ toolId, startDate, endDate })
        });
      },
      async getOccupiedDates(toolId) {
        return await request(`/reservations/tool/${toolId}/occupied-dates`);
      },
      async createReservation(data) {
        return await request('/reservations', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      async getById(id) {
        return await request(`/reservations/${id}`);
      },
      async getByCode(code) {
        return await request(`/reservations/code/${encodeURIComponent(code)}`);
      },
      async getByClient(clientId) {
        return await request(`/reservations/client/${clientId}`);
      },
      async getByProvider(providerId) {
        return await request(`/reservations/provider/${providerId}`);
      },
      async getAll() {
        return await request('/reservations');
      },
      async approve(id) {
        return await request(`/reservations/${id}/approve`, { method: 'PATCH' });
      },
      async cancel(id, reason = 'Cancelada por el usuario') {
        return await request(`/reservations/${id}/cancel?reason=${encodeURIComponent(reason)}`, { method: 'PATCH' });
      },
      async reject(id, reason = 'Rechazada por el proveedor') {
        return await request(`/reservations/${id}/reject?reason=${encodeURIComponent(reason)}`, { method: 'PATCH' });
      }
    },

    // 4. Payments Endpoints
    payments: {
      async processPayment(data) {
        return await request('/payments/process', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      async getByReservation(reservationId) {
        return await request(`/payments/reservation/${reservationId}`);
      }
    },

    // 5. Invoices Endpoints
    invoices: {
      async getById(id) {
        return await request(`/invoices/${id}`);
      },
      async getByReservation(reservationId) {
        return await request(`/invoices/reservation/${reservationId}`);
      },
      async downloadPdf(id) {
        const token = getToken();
        const url = `${BASE_URL}/invoices/${id}/pdf`;
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error('No se pudo descargar la factura');
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Factura-${id}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    },

    // 6. Deliveries & Returns Endpoints
    deliveries: {
      async startRental(data) {
        return await request('/deliveries', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      async finishRental(data) {
        return await request('/returns', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      async registerDamage(data) {
        return await request('/damages', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      async getDamagesByReturn(returnId) {
        return await request(`/damages/return/${returnId}`);
      },
      async getDepositSettlement(reservationId) {
        return await request(`/logistics/settlement/${reservationId}`);
      }
    },

    // 7. Reports & Dashboards Endpoints
    reports: {
      async getAdminDashboard() {
        return await request('/reports/admin');
      },
      async getProviderDashboard(providerId) {
        return await request(`/reports/provider/${providerId}`);
      }
    },

    // 8. Reviews & Ratings Endpoints
    reviews: {
      async getToolReviews(toolId) {
        return await request(`/reviews/tool/${toolId}`);
      },
      async createReview(data) {
        return await request('/reviews', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      async getReviewStatus(reservationId) {
        return await request(`/reviews/reservation/${reservationId}/status`);
      }
    }
  };
})();
