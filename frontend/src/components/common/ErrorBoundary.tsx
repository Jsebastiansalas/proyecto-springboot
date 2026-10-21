import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error no controlado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#181816] border border-[#363632] rounded-2xl p-6 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#F5F4F0]">Ocurrió un problema al cargar esta vista</h2>
              <p className="text-xs text-[#A8A69E]">
                Se detectó una discrepancia inesperada en los datos. No te preocupes, tus registros y contratos en el sistema están seguros.
              </p>
              {this.state.error && (
                <div className="text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-left overflow-x-auto">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#D94E1F] hover:bg-[#B83D14] text-white rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-all shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recargar Aplicación</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-[#232320] hover:bg-[#2E2E2A] text-[#F5F4F0] border border-[#3F3E3A] rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
