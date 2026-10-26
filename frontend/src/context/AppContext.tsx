import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, Tool, CartItem, UserRole } from '../types';
import { rentaService } from '../services/rentaService';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export type ActiveView = 'home' | 'catalog' | 'client' | 'provider' | 'admin';

interface AppContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  cart: CartItem[];
  addToCart: (tool: Tool, days?: number) => void;
  removeFromCart: (toolId: number) => void;
  updateCartDays: (toolId: number, days: number) => void;
  clearCart: () => void;
  favorites: number[];
  toggleFavorite: (toolId: number) => void;
  compareList: Tool[];
  toggleCompare: (tool: Tool) => void;
  removeFromCompare: (toolId: number) => void;
  clearCompare: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isQuoteDrawerOpen: boolean;
  setIsQuoteDrawerOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  selectedToolDetail: Tool | null;
  setSelectedToolDetail: (tool: Tool | null) => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => rentaService.auth.getCurrentUser());
  const [activeView, setActiveView] = useState<ActiveView>('home');
  
  // Carrito persistido
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rentamaq_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Favoritos persistidos
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('rentamaq_favs');
    return saved ? JSON.parse(saved) : [1, 5, 12];
  });

  const [compareList, setCompareList] = useState<Tool[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [selectedToolDetail, setSelectedToolDetail] = useState<Tool | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem('rentamaq_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rentamaq_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Atajo global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToCart = (tool: Tool, days: number = 3) => {
    const clampedDays = Math.max(1, Math.min(30, days));
    setCart(prev => {
      const idx = prev.findIndex(item => item.tool.id === tool.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].days = clampedDays;
        showToast(`Se actualizó la cotización de "${tool.name}" a ${clampedDays} días`, 'info');
        return updated;
      }
      showToast(`"${tool.name}" añadido a la cotización activa`, 'success');
      return [...prev, { tool, days: clampedDays }];
    });
    setIsQuoteDrawerOpen(true);
  };

  const removeFromCart = (toolId: number) => {
    setCart(prev => prev.filter(item => item.tool.id !== toolId));
    showToast('Equipo retirado de la cotización activa', 'info');
  };

  const updateCartDays = (toolId: number, days: number) => {
    if (days > 30) {
      showToast('Límite de alquiler alcanzado: máximo 30 días (1 mes) por contrato.', 'info');
      return;
    }
    const clamped = Math.max(1, Math.min(30, days));
    setCart(prev => prev.map(item => item.tool.id === toolId ? { ...item, days: clamped } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (toolId: number) => {
    setFavorites(prev => {
      const exists = prev.includes(toolId);
      if (exists) {
        showToast('Equipo retirado de favoritos', 'info');
        if (user && user.role === 'ROLE_CLIENTE') {
          rentaService.favorites.remove(toolId).catch(err => console.warn('Sync favorite error:', err));
        }
        return prev.filter(id => id !== toolId);
      } else {
        showToast('Equipo guardado en tus favoritos', 'success');
        if (user && user.role === 'ROLE_CLIENTE') {
          rentaService.favorites.add(toolId).catch(err => console.warn('Sync favorite error:', err));
        }
        return [...prev, toolId];
      }
    });
  };

  const toggleCompare = (tool: Tool) => {
    setCompareList(prev => {
      const exists = prev.some(item => item.id === tool.id);
      if (exists) {
        showToast(`"${tool.name}" retirado del comparador`, 'info');
        return prev.filter(item => item.id !== tool.id);
      }
      if (prev.length >= 3) {
        showToast('Máximo 3 equipos para comparar simultáneamente', 'error');
        return prev;
      }
      showToast(`"${tool.name}" añadido al comparador (${prev.length + 1}/3)`, 'success');
      return [...prev, tool];
    });
  };

  const removeFromCompare = (toolId: number) => {
    setCompareList(prev => prev.filter(item => item.id !== toolId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const quickDemoLogin = async (role: UserRole) => {
    try {
      let email = 'cliente1@correo.com';
      let password = 'Cliente#Renta2026!Sec';
      if (role === 'ROLE_PROVEEDOR') {
        email = 'proveedor1@correo.com';
        password = 'Proveedor#Renta2026!Sec';
      } else if (role === 'ROLE_ADMIN') {
        email = 'admin@renta.com';
        password = 'Admin#Renta2026!SecOps';
      }
      const loggedUser = await rentaService.auth.login(email, password);
      setUser(loggedUser);
      setIsAuthModalOpen(false);
      showToast(`Sesión iniciada con éxito como ${role.replace('ROLE_', '')}`, 'success');
      if (role === 'ROLE_ADMIN') setActiveView('admin');
      else if (role === 'ROLE_PROVEEDOR') setActiveView('provider');
      else setActiveView('client');
    } catch (err: any) {
      showToast(`Error de autenticación demo: ${err.message}`, 'error');
    }
  };

  const logout = () => {
    rentaService.auth.logout();
    setUser(null);
    setActiveView('catalog');
    showToast('Sesión cerrada correctamente', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeView,
        setActiveView,
        cart,
        addToCart,
        removeFromCart,
        updateCartDays,
        clearCart,
        favorites,
        toggleFavorite,
        compareList,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isQuoteDrawerOpen,
        setIsQuoteDrawerOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        selectedToolDetail,
        setSelectedToolDetail,
        quickDemoLogin,
        logout,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de un AppProvider');
  return context;
};
