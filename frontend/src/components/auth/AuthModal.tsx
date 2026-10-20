import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { 
  X, 
  Lock, 
  Mail, 
  UserCheck, 
  Shield, 
  Truck, 
  HardHat, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, quickDemoLogin, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await rentaService.auth.login(email, password);
      showToast('Sesión iniciada con éxito', 'success');
      setIsAuthModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(`Error al iniciar sesión: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Acceso a Plataforma RENTAMAQ
              </h3>
              <p className="text-xs text-slate-400">
                Identificación corporativa y firma de contratos
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="p-5 border-b border-slate-800/80 bg-[#0a0e1c] space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Acceso Inmediato de Demostración</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickDemoLogin('ROLE_CLIENTE')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-sky-500/50 hover:bg-sky-500/10 text-left transition-all"
            >
              <div className="flex items-center gap-1 text-sky-400 font-semibold text-xs">
                <HardHat className="w-3 h-3" />
                <span>Cliente</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">Constructora</div>
            </button>

            <button
              type="button"
              onClick={() => quickDemoLogin('ROLE_PROVEEDOR')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/50 hover:bg-amber-500/10 text-left transition-all"
            >
              <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
                <Truck className="w-3 h-3" />
                <span>Proveedor</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">MaqRental</div>
            </button>

            <button
              type="button"
              onClick={() => quickDemoLogin('ROLE_ADMIN')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-left transition-all"
            >
              <div className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">SecOps</div>
            </button>
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              Correo Electrónico Corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@empresa.com"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>{loading ? 'Validando credenciales...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
