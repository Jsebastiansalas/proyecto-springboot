import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        let borderClass = 'border-indigo-500/30';
        let bgClass = 'bg-[#0f172a]/95';
        let textClass = 'text-indigo-400';
        let Icon = Info;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40';
          textClass = 'text-emerald-400';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/40';
          textClass = 'text-rose-400';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderClass} ${bgClass} backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${textClass}`} />
            <div className="flex-1 text-sm text-slate-200 leading-snug font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
