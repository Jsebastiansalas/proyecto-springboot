// ============================================================================
// CLIENTE HTTP CON INTERCEPTOR JWT Y MANEJO DE ERRORES RFC 7807
// ============================================================================

const BASE_URL = '/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('rentamaq_jwt');
  }

  public setToken(token: string): void {
    localStorage.setItem('rentamaq_jwt', token);
  }

  public clearToken(): void {
    localStorage.removeItem('rentamaq_jwt');
    localStorage.removeItem('rentamaq_user');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expirado o inválido
      if (endpoint !== '/auth/login') {
        this.clearToken();
        window.dispatchEvent(new CustomEvent('rentamaq:unauthorized'));
      }
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.detail || errorBody.message || 'Credenciales inválidas o sesión caducada');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody.detail || errorBody.message || `Error del servidor (${response.status})`;
      throw new Error(message);
    }

    // Si es 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  public get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
