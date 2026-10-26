import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, AlertTriangle, ShieldCheck, Info, RefreshCw, Zap } from 'lucide-react';

interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [runningScheduler, setRunningScheduler] = useState(false);
  const [schedulerMessage, setSchedulerMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [resList, resCount] = await Promise.all([
        fetch('/api/v1/notifications/my', { headers }),
        fetch('/api/v1/notifications/my/unread-count', { headers })
      ]);

      if (resList.ok) {
        const data = await resList.json();
        setNotifications(data);
      }
      if (resCount.ok) {
        const countData = await resCount.json();
        setUnreadCount(countData.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Error al cargar notificaciones:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling suave cada 30s
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers
      });

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/v1/notifications/my/read-all', {
        method: 'PATCH',
        headers
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerScheduler = async () => {
    setRunningScheduler(true);
    setSchedulerMessage(null);
    try {
      const res = await fetch('/api/v1/notifications/trigger-expiration-alerts', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setSchedulerMessage(`⚡ Scheduler ejecutado: ${data.alertsCreated} alertas de vencimiento generadas.`);
        await fetchNotifications();
      }
    } catch (err: any) {
      setSchedulerMessage(`Error al disparar scheduler: ${err.message}`);
    } finally {
      setRunningScheduler(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ALERTA_VENCIMIENTO':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'ESTADO_RESERVA':
        return <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
      if (diffMin < 1) return 'Justo ahora';
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de Campana */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(prev => !prev);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl bg-[#232320] hover:bg-[#2C2C28] text-[#F5F4F0] border border-[#363632] transition-colors focus:outline-none"
        title="Centro de Notificaciones y Alertas"
      >
        <Bell className="w-4 h-4 text-[#A8A69E] hover:text-[#F5F4F0]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D94E1F] text-white text-[10px] font-black font-mono rounded-full flex items-center justify-center border-2 border-[#181816] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#181816] border border-[#363632] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col text-xs text-[#F5F4F0] animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="p-3.5 border-b border-[#363632] flex items-center justify-between bg-[#232320]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D94E1F]" />
              <span className="font-bold tracking-tight text-sm text-[#F5F4F0]">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#D94E1F]/20 text-[#D94E1F] font-mono text-[10px] font-bold border border-[#D94E1F]/40">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-[#A8A69E] hover:text-emerald-400 flex items-center gap-1 transition-colors"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Leídas</span>
              </button>
            )}
          </div>

          {/* Banner de resultado de Scheduler si se disparó */}
          {schedulerMessage && (
            <div className="p-2.5 bg-emerald-500/10 border-b border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{schedulerMessage}</span>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#363632]/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#A8A69E] space-y-2">
                <Bell className="w-6 h-6 mx-auto text-[#706E66] opacity-60" />
                <p>No tienes notificaciones pendientes.</p>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => !item.read && handleMarkAsRead(item.id)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                    item.read
                      ? 'bg-[#181816] hover:bg-[#232320]/50 opacity-80'
                      : 'bg-[#232320]/70 hover:bg-[#232320] border-l-2 border-[#D94E1F]'
                  }`}
                >
                  <div className="mt-0.5">{getTypeIcon(item.type)}</div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[#F5F4F0] truncate leading-tight">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-[#A8A69E] font-mono shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A8A69E] line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-[#D94E1F] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer: Botón de Simulación de Scheduler para Examen */}
          <div className="p-3 bg-[#1E1E1C] border-t border-[#363632] flex items-center justify-between">
            <span className="text-[10px] text-[#706E66] font-mono">
              @Scheduled Cron: 08:00 AM
            </span>
            <button
              type="button"
              onClick={handleTriggerScheduler}
              disabled={runningScheduler}
              className="px-2.5 py-1.5 rounded-lg bg-[#2C2C28] hover:bg-[#D94E1F] text-[#F5F4F0] text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-[#363632] shadow-sm disabled:opacity-50"
              title="Disparar tarea de escaneo de fondo para demostración en vivo"
            >
              <Zap className={`w-3 h-3 text-amber-400 ${runningScheduler ? 'animate-spin' : ''}`} />
              <span>{runningScheduler ? 'Escaneando...' : 'Simular Scheduler'}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
