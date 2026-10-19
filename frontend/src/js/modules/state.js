/**
 * Sistema Reactivo de Estado Centralizado para RentaMaq
 * Conforme a Frontend UI Engineering & Clean Architecture
 */

import API from '../api.js';

class AppState {
  constructor() {
    this.listeners = new Map();

    // Estado inicial
    this.data = {
      theme: localStorage.getItem('rentamaq_theme') || 'light',
      user: API.getUser(),
      currentView: 'home', // 'home' | 'client' | 'provider' | 'admin'
      
      // Control de Obras y Proyectos de la Constructora
      obras: [
        {
          id: 'OBRA-01',
          name: 'Torre 4 - Ciudad Salitre',
          type: 'Edificación Residencial / Comercial',
          resident: 'Ing. Carlos Mendoza (MP 25002-140)',
          costCenter: 'C.C. 104 - Concreto y Estructura',
          address: 'Av. Esperanza # 68-40, Bogotá D.C.',
          dailyBurn: 640000,
          budgetCap: 45000000,
          spent: 18450000
        },
        {
          id: 'OBRA-02',
          name: 'Puente Peatonal Autonorte Km 19',
          type: 'Infraestructura Vial y Espacio Público',
          resident: 'Arq. Elena Gómez (MP 11090-320)',
          costCenter: 'C.C. 208 - Cimentación Profunda',
          address: 'Autopista Norte Km 19, Chía - Bogotá',
          dailyBurn: 480000,
          budgetCap: 30000000,
          spent: 12100000
        },
        {
          id: 'OBRA-03',
          name: 'Parque Industrial Cota - Bodega 7',
          type: 'Estructuras Metálicas & Acabados',
          resident: 'Ing. Andrés Valderrama (MP 34011-980)',
          costCenter: 'C.C. 312 - Redes RETIE y Alturas',
          address: 'Km 3.5 Variante Cota-Siberia',
          dailyBurn: 320000,
          budgetCap: 25000000,
          spent: 8300000
        }
      ],
      selectedObraId: 'OBRA-01',
      activeWorkFront: 'TODOS', // 'TODOS' | 'CIMENTACION' | 'ESTRUCTURAS' | 'ALTURAS' | 'REDES'

      categories: [],
      tools: [],
      filteredTools: [],
      filters: {
        query: '',
        categoryId: null,
        workFront: 'TODOS',
        engineType: 'TODOS',
        sortBy: 'featured',
        onlyAvailable: false
      },
      selectedTool: null,
      bookingDates: {
        startDate: '',
        endDate: '',
        days: 1,
        dailyRate: 0,
        subtotal: 0,
        deposit: 0,
        total: 0
      },
      notifications: [],
      unreadNotifCount: 0
    };

    // Aplicar tema inicial
    if (this.data.theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  // Suscripción a eventos de cambio
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, callbacks);
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(payload, this.data);
        } catch (err) {
          console.error(`[State Error] en listener de "${event}":`, err);
        }
      });
    }
  }

  // Getters
  get() {
    return this.data;
  }

  // Modificadores de Estado
  setTheme(theme) {
    this.data.theme = theme;
    localStorage.setItem('rentamaq_theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this.emit('theme:change', theme);
  }

  toggleTheme() {
    const nextTheme = this.data.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setUser(user) {
    this.data.user = user;
    this.emit('auth:change', user);
  }

  setView(viewName) {
    this.data.currentView = viewName;
    this.emit('view:change', viewName);
  }

  setCategories(categories) {
    this.data.categories = categories || [];
    this.emit('categories:loaded', this.data.categories);
  }

  setTools(tools) {
    this.data.tools = tools || [];
    this.applyFilters();
    this.emit('tools:loaded', this.data.tools);
  }

  setObra(obraId) {
    this.data.selectedObraId = obraId;
    this.emit('obra:change', this.getSelectedObra());
  }

  getSelectedObra() {
    return this.data.obras.find(o => o.id === this.data.selectedObraId) || this.data.obras[0];
  }

  setWorkFront(front) {
    this.data.activeWorkFront = front;
    this.data.filters.workFront = front;
    this.applyFilters();
    this.emit('workfront:change', front);
  }

  setFilter(key, value) {
    this.data.filters[key] = value;
    this.applyFilters();
    this.emit('filters:change', this.data.filters);
  }

  applyFilters() {
    const { query, categoryId, workFront, sortBy, onlyAvailable } = this.data.filters;
    let result = [...this.data.tools];

    // Filtro por texto
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      result = result.filter(t => 
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.brand && t.brand.toLowerCase().includes(q)) ||
        (t.model && t.model.toLowerCase().includes(q))
      );
    }

    // Filtro por categoría
    if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
      result = result.filter(t => t.categoryId === Number(categoryId));
    }

    // Filtro por Frente de Obra
    if (workFront && workFront !== 'TODOS') {
      const frontCategoryMap = {
        'CIMENTACION': [1, 2, 9, 16], // Taladros, Mezcladoras, Compactadores, Martillos demoledores
        'ESTRUCTURAS': [2, 6, 7, 8],  // Mezcladoras, Sierras, Soldadura, Vibradores concreto
        'ALTURAS': [3, 10, 15],       // Andamios, Elevadores, Escaleras
        'REDES': [4, 5, 11, 12, 14, 20] // Compresores, Generadores, Topografía, Bombas, Hidrolavadoras, Iluminación
      };
      const allowedCatIds = frontCategoryMap[workFront] || [];
      if (allowedCatIds.length > 0) {
        result = result.filter(t => allowedCatIds.includes(t.categoryId));
      }
    }

    // Filtro disponibilidad (DISPONIBLE o AVAILABLE)
    if (onlyAvailable) {
      result = result.filter(t => t.status === 'AVAILABLE' || t.status === 'DISPONIBLE');
    }

    // Ordenamiento
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    this.data.filteredTools = result;
    this.emit('tools:filtered', result);
  }

  setSelectedTool(tool) {
    this.data.selectedTool = tool;
    if (tool) {
      this.calculateBooking(this.data.bookingDates.startDate, this.data.bookingDates.endDate);
    }
    this.emit('tool:selected', tool);
  }

  calculateBooking(startDate, endDate) {
    const tool = this.data.selectedTool;
    const dailyRate = tool ? Number(tool.baseDailyPrice || tool.pricePerDay || 0) : 0;
    let days = 1;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      days = Math.max(1, isNaN(diffDays) ? 1 : diffDays);
    }

    const subtotal = dailyRate * days;
    const deposit = Math.round(subtotal * 0.25); // 25% depósito en garantía
    const total = subtotal + deposit;

    this.data.bookingDates = {
      startDate: startDate || '',
      endDate: endDate || '',
      days,
      dailyRate,
      subtotal,
      deposit,
      total
    };

    this.emit('booking:calculated', this.data.bookingDates);
  }
}

export const state = new AppState();
export default state;
