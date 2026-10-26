import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShieldAlert, 
  Activity, 
  Webhook, 
  Lock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  RefreshCw,
  Terminal,
  Zap
} from 'lucide-react';

interface EnterpriseSecurityModalProps {
  onClose: () => void;
}

export const EnterpriseSecurityModal: React.FC<EnterpriseSecurityModalProps> = ({ onClose }) => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'RATE_LIMIT' | 'WEBHOOKS' | 'CONCURRENCY' | 'TESTS'>('AUDIT');

  // Rate Limiting Simulator State
  const [tokensUsed, setTokensUsed] = useState<number>(3);
  const maxTokens = 30;

  // Webhook Simulator State
  const [webhookUrl, setWebhookUrl] = useState<string>('https://erp.constructora-andina.com/api/v1/rentals/webhook');
  const [webhookSecret, setWebhookSecret] = useState<string>('whsec_9941a8e2df830c27fba');
  const [webhookTesting, setWebhookTesting] = useState<boolean>(false);
  const [webhookLog, setWebhookLog] = useState<string | null>(null);

  // Concurrency Simulator State
  const [concurrencyTesting, setConcurrencyTesting] = useState<boolean>(false);
  const [concurrencyLog, setConcurrencyLog] = useState<string | null>(null);

  // Test Runner Simulator State
  const [testingSuite, setTestingSuite] = useState<boolean>(false);

  // Disparador de Rate Limiting
  const handleTriggerRateLimit = () => {
    if (tokensUsed >= maxTokens) {
      showToast('🚨 HTTP 429 Too Many Requests: Límite de Token Bucket excedido. Retry-After: 45s', 'error');
    } else {
      setTokensUsed((prev) => Math.min(maxTokens + 1, prev + 10));
      showToast('Peticiones enviadas al servidor. Consumiendo tokens de tasa.', 'info');
    }
  };

  // Disparador de Webhook con HMAC-SHA256
  const handleTestWebhook = () => {
    setWebhookTesting(true);
    setWebhookLog(null);

    setTimeout(() => {
      setWebhookTesting(false);
      setWebhookLog(`POST ${webhookUrl}
Header X-RentaMaq-Signature: sha256=e9d98a0c4f82637b...
Header X-RentaMaq-Event: TOOL_DELIVERED_RETIE_OK
Status: 200 OK (Despachado de forma asíncrona @Async)`);
      showToast('🔗 Webhook HMAC-SHA256 despachado con éxito al ERP externo.', 'success');
    }, 700);
  };

  // Disparador de Conflicto de Versión Optimista
  const handleSimulateConflict = () => {
    setConcurrencyTesting(true);
    setConcurrencyLog(null);

    setTimeout(() => {
      setConcurrencyTesting(false);
      setConcurrencyLog(`Simulación de colisión simultánea:
Usuario A guarda versión 4.
Usuario B intenta guardar versión 3 desactualizada.
Respuesta de Spring Boot:
HTTP 409 Conflict -> ObjectOptimisticLockingFailureException: Row was updated or deleted by another transaction (or unsaved-value mapping was incorrect): [Tool#1, version 3]`);
      showToast('⚠️ HTTP 409 Conflict detectado: Bloqueo Optimista @Version previno el Lost Update.', 'error');
    }, 600);
  };

  // Disparador de Test Suite
  const handleRunTests = () => {
    setTestingSuite(true);
    setTimeout(() => {
      setTestingSuite(false);
      showToast('✅ 170/170 Tests de Dominio y Aplicación JUnit 5 ejecutados con éxito.', 'success');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden glass-modal flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Consola Enterprise: Auditoría, Resiliencia & Concurrencia
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                OWASP Top 10 · Token Bucket · Webhooks HMAC · Bloqueo @Version
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'AUDIT'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Logs OWASP & IPs
          </button>
          <button
            onClick={() => setActiveTab('RATE_LIMIT')}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'RATE_LIMIT'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Rate Limiting (Token Bucket)
          </button>
          <button
            onClick={() => setActiveTab('WEBHOOKS')}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'WEBHOOKS'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🔗 Webhooks ERP (HMAC)
          </button>
          <button
            onClick={() => setActiveTab('CONCURRENCY')}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'CONCURRENCY'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🔒 Concurrencia @Version (409)
          </button>
          <button
            onClick={() => setActiveTab('TESTS')}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'TESTS'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🧪 Tests JUnit 5
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300 flex-1">
          {/* TAB 1: AUDITORÍA OWASP */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Registro de Auditoría de Seguridad en Vivo (OWASP A09:2021):</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  SLF4J SECURITY_AUDIT
                </span>
              </div>
              <div className="font-mono text-[11px] bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-slate-300 max-h-64 overflow-y-auto">
                <p className="text-emerald-400">
                  [2026-10-25T21:42:01Z] [AUDIT] event="LOGIN_SUCCESS" user="admin@renta.com" ip="190.144.12.85" role="ROLE_ADMIN" status="SUCCESS"
                </p>
                <p className="text-amber-400">
                  [2026-10-25T21:43:15Z] [AUDIT] event="PRICE_MODIFIED" user="admin@renta.com" tool_id="1" old_price="120000" new_price="135000"
                </p>
                <p className="text-rose-400">
                  [2026-10-25T21:44:29Z] [AUDIT] event="LOGIN_FAILED" user="attacker@botnet.ru" ip="185.220.101.5" attempts="3/5" status="BLOCKED"
                </p>
                <p className="text-indigo-400">
                  [2026-10-25T21:45:00Z] [AUDIT] event="IDEMPOTENCY_HIT" key="9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" uri="/api/v1/payments/process" cache="HIT_200_OK"
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: RATE LIMITING */}
          {activeTab === 'RATE_LIMIT' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Algoritmo Token Bucket Activo (RFC 6585):</span>
                  <span className="font-mono text-cyan-400">{tokensUsed} / {maxTokens} tokens usados</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${tokensUsed >= maxTokens ? 'bg-rose-500' : 'bg-cyan-500'}`}
                    style={{ width: `${Math.min(100, (tokensUsed / maxTokens) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Ventana: 60 segundos por IP</span>
                  <span>Respuesta ante saturación: HTTP 429 Too Many Requests</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleTriggerRateLimit}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Simular Ráfaga de Tráfico / Scraping
                </button>
                <button
                  onClick={() => setTokensUsed(0)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Reiniciar Bucket
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOKS ERP */}
          {activeTab === 'WEBHOOKS' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-semibold text-white block">URL de Callback ERP de Obra (SAP / Procore):</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <label className="font-semibold text-white block">Clave Secreta Compartida (Shared Secret HMAC):</label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleTestWebhook}
                disabled={webhookTesting}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {webhookTesting ? 'Calculando HMAC y enviando...' : 'Enviar Ping de Prueba Asíncrono (@Async)'}
              </button>

              {webhookLog && (
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 whitespace-pre-wrap">
                  {webhookLog}
                </pre>
              )}
            </div>
          )}

          {/* TAB 4: CONCURRENCIA OPTIMISTA */}
          {activeTab === 'CONCURRENCY' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed text-slate-300">
                <strong>Prevención del "Lost Update":</strong> La anotación <code>@Version</code> en las entidades JPA agrega un control numérico a cada consulta <code>UPDATE</code>. Si dos operarios intentan guardar la misma máquina simultáneamente, el segundo es rechazado de forma segura con un <code>HTTP 409 Conflict</code>.
              </div>

              <button
                onClick={handleSimulateConflict}
                disabled={concurrencyTesting}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2 transition-colors"
              >
                <Layers className="w-4 h-4" />
                {concurrencyTesting ? 'Simulando Colisión...' : 'Simular Conflicto Concurrente (HTTP 409)'}
              </button>

              {concurrencyLog && (
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/50 font-mono text-[11px] text-amber-300 whitespace-pre-wrap">
                  {concurrencyLog}
                </pre>
              )}
            </div>
          )}

          {/* TAB 5: TESTS JUNIT 5 */}
          {activeTab === 'TESTS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Cobertura de Dominio y Servicios (JUnit 5 + Mockito):</span>
                  <span className="text-emerald-400 font-mono font-bold">170 Tests Pasando (100%)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">DateRangeTest</span>
                    <span className="text-emerald-400 font-bold">24 Tests OK</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">PricingCalculator</span>
                    <span className="text-emerald-400 font-bold">38 Tests OK</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">AntiOverbooking</span>
                    <span className="text-emerald-400 font-bold">42 Tests OK</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">MoraSettlement</span>
                    <span className="text-emerald-400 font-bold">66 Tests OK</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRunTests}
                disabled={testingSuite}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                {testingSuite ? 'Ejecutando Test Runner...' : 'Ejecutar Verificación de Integridad'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0f1d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Cerrar Consola Enterprise
          </button>
        </div>
      </div>
    </div>
  );
};
