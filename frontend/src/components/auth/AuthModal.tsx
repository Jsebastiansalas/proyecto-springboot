import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { rentaService } from '../../services/rentaService';
import { DocumentType } from '../../types';
import { 
  X, 
  Lock, 
  Mail, 
  UserCheck, 
  Shield, 
  Truck, 
  HardHat, 
  ArrowRight,
  Sparkles,
  Building2,
  FileText,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  Eye,
  EyeOff,
  Wand2
} from 'lucide-react';

type AuthMode = 'login' | 'register_client' | 'register_provider';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, setActiveView, quickDemoLogin, showToast } = useApp();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [showClientConfirmPassword, setShowClientConfirmPassword] = useState(false);
  const [showProviderPassword, setShowProviderPassword] = useState(false);
  const [showProviderConfirmPassword, setShowProviderConfirmPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Client registration form state
  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    documentType: 'CC' as DocumentType,
    documentNumber: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bogotá D.C.',
    password: '',
    confirmPassword: ''
  });

  // Provider registration form state
  const [providerForm, setProviderForm] = useState({
    companyName: '',
    legalRepresentative: '',
    nitRut: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bogotá D.C.',
    password: '',
    confirmPassword: ''
  });

  if (!isAuthModalOpen) return null;

  // Validación de contraseña según política OWASP del backend
  const validatePasswordStrength = (pwd: string) => {
    return {
      length: pwd.length >= 8 && pwd.length <= 64,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&#^()_+\-=]/.test(pwd)
    };
  };

  // Sanitizadores estrictos para evitar letras en teléfonos o números en nombres
  const sanitizeOnlyNumbers = (val: string, maxLen: number = 10) => {
    return val.replace(/\D/g, '').slice(0, maxLen);
  };

  const sanitizeNit = (val: string) => {
    // Solo números y un único guion
    const cleaned = val.replace(/[^0-9-]/g, '').slice(0, 12);
    return cleaned;
  };

  const sanitizeOnlyLetters = (val: string, maxLen: number = 50) => {
    return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '').slice(0, maxLen);
  };

  // Autocompletar datos de prueba válidos para agilizar pruebas del profesor
  const fillSampleClientData = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setClientForm({
      firstName: 'Carlos Andrés',
      lastName: 'Montoya Gómez',
      documentType: 'CC',
      documentNumber: `10${randomSuffix}789`,
      email: `contratista.${randomSuffix}@constructora.com`,
      phone: '3157894561',
      address: 'Calle 100 # 19A-40 Of. 602',
      city: 'Bogotá D.C.',
      password: 'Cliente#Renta2026!Sec',
      confirmPassword: 'Cliente#Renta2026!Sec'
    });
    showToast('Datos de cliente de prueba cargados con formato válido', 'info');
  };

  const fillSampleProviderData = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setProviderForm({
      companyName: `Maquinaria & Equipos ${randomSuffix} SAS`,
      legalRepresentative: 'Álvaro Hernán Ruiz',
      nitRut: `901${randomSuffix}321-4`,
      email: `contacto.${randomSuffix}@equiposandinos.com`,
      phone: '3206549871',
      address: 'Autopista Sur Km 7 Parque Industrial',
      city: 'Bogotá D.C.',
      password: 'Proveedor#Renta2026!Sec',
      confirmPassword: 'Proveedor#Renta2026!Sec'
    });
    showToast('Datos de proveedor de prueba cargados con formato válido', 'info');
  };

  // Login submit handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await rentaService.auth.login(loginEmail.trim(), loginPassword);
      setUser(loggedUser);
      showToast('Sesión iniciada con éxito', 'success');
      setIsAuthModalOpen(false);
      if (loggedUser.role === 'ROLE_ADMIN') {
        setActiveView('admin');
      } else if (loggedUser.role === 'ROLE_PROVEEDOR') {
        setActiveView('provider');
      } else {
        setActiveView('client');
      }
    } catch (err: any) {
      showToast(`Error al iniciar sesión: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Client registration submit handler
  const handleClientRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clientForm.phone.length < 7) {
      showToast('El teléfono debe tener al menos 7 dígitos numéricos (ej: 3101234567)', 'error');
      return;
    }

    if (clientForm.documentNumber.length < 6) {
      showToast('El número de documento debe tener al menos 6 dígitos', 'error');
      return;
    }

    if (clientForm.password !== clientForm.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    const strength = validatePasswordStrength(clientForm.password);
    if (!strength.length || !strength.upper || !strength.lower || !strength.number || !strength.special) {
      showToast('La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y un símbolo especial (@$!%*?&#)', 'error');
      return;
    }

    setLoading(true);
    try {
      const registeredUser = await rentaService.auth.registerClient({
        firstName: clientForm.firstName.trim(),
        lastName: clientForm.lastName.trim(),
        documentType: clientForm.documentType,
        documentNumber: clientForm.documentNumber.trim(),
        email: clientForm.email.trim().toLowerCase(),
        phone: clientForm.phone.trim(),
        address: clientForm.address.trim(),
        city: clientForm.city.trim(),
        password: clientForm.password
      });

      setUser(registeredUser);
      showToast('¡Cuenta de Cliente creada con éxito! Bienvenido a RentaMaq.', 'success');
      setIsAuthModalOpen(false);
      setActiveView('client');
    } catch (err: any) {
      showToast(`Error en el registro: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Provider registration submit handler
  const handleProviderRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (providerForm.phone.length < 7) {
      showToast('El teléfono debe tener al menos 7 dígitos numéricos (ej: 3201234567)', 'error');
      return;
    }

    if (!/^[0-9]{8,10}(-[0-9])?$/.test(providerForm.nitRut.trim())) {
      showToast('El NIT/RUT debe tener de 8 a 10 dígitos y opcionalmente el dígito de verificación (ej: 900123456-1)', 'error');
      return;
    }

    if (providerForm.password !== providerForm.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    const strength = validatePasswordStrength(providerForm.password);
    if (!strength.length || !strength.upper || !strength.lower || !strength.number || !strength.special) {
      showToast('La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y un símbolo especial (@$!%*?&#)', 'error');
      return;
    }

    setLoading(true);
    try {
      const registeredUser = await rentaService.auth.registerProvider({
        companyName: providerForm.companyName.trim(),
        legalRepresentative: providerForm.legalRepresentative.trim(),
        nitRut: providerForm.nitRut.trim(),
        email: providerForm.email.trim().toLowerCase(),
        phone: providerForm.phone.trim(),
        address: providerForm.address.trim(),
        city: providerForm.city.trim(),
        password: providerForm.password
      });

      setUser(registeredUser);
      showToast('¡Cuenta de Proveedor registrada con éxito! Ya puedes gestionar tu maquinaria.', 'success');
      setIsAuthModalOpen(false);
      setActiveView('provider');
    } catch (err: any) {
      showToast(`Error en el registro de proveedor: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clientStrength = validatePasswordStrength(clientForm.password);
  const providerStrength = validatePasswordStrength(providerForm.password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div 
        className="bg-[#181816] border border-[#363632] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-auto text-[#F5F4F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#363632] bg-[#121210] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D94E1F]/15 border border-[#D94E1F]/40 flex items-center justify-center text-[#D94E1F]">
              {mode === 'login' && <Lock className="w-5 h-5" />}
              {mode === 'register_client' && <HardHat className="w-5 h-5" />}
              {mode === 'register_provider' && <Truck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F5F4F0] tracking-tight">
                {mode === 'login' && 'Acceso a Plataforma RentaMaq'}
                {mode === 'register_client' && 'Registro de Cliente / Contratista'}
                {mode === 'register_provider' && 'Registro de Proveedor de Maquinaria'}
              </h3>
              <p className="text-xs text-[#A8A69E]">
                {mode === 'login' && 'Identificación corporativa y firma digital de contratos'}
                {mode === 'register_client' && 'Alquila maquinaria industrial con cotización y facturación electrónica'}
                {mode === 'register_provider' && 'Afiliación empresarial para publicar catálogo y gestionar despachos'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-[#232320] hover:bg-[#2C2C28] text-[#A8A69E] hover:text-[#F5F4F0] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-[#363632] bg-[#1E1E1C] p-1 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'login'
                ? 'bg-[#D94E1F] text-white shadow-sm font-bold'
                : 'text-[#A8A69E] hover:text-[#F5F4F0] hover:bg-[#282824]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Ingresar</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('register_client')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register_client'
                ? 'bg-[#D94E1F] text-white shadow-sm font-bold'
                : 'text-[#A8A69E] hover:text-[#F5F4F0] hover:bg-[#282824]'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Soy Cliente</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('register_provider')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register_provider'
                ? 'bg-[#D94E1F] text-white shadow-sm font-bold'
                : 'text-[#A8A69E] hover:text-[#F5F4F0] hover:bg-[#282824]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Soy Proveedor</span>
          </button>
        </div>

        {/* TAB 1: INICIAR SESIÓN */}
        {mode === 'login' && (
          <div>
            {/* Quick Demo Login Cards */}
            <div className="p-4 sm:p-5 border-b border-[#363632] bg-[#141412] space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#A8A69E]">
                <Sparkles className="w-3.5 h-3.5 text-[#D94E1F]" />
                <span>Acceso Inmediato de Demostración (Rúbrica)</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => quickDemoLogin('ROLE_CLIENTE')}
                  className="p-2.5 rounded-xl border border-[#363632] bg-[#232320] hover:border-[#D94E1F] hover:bg-[#2C2C28] text-left transition-all group"
                >
                  <div className="flex items-center gap-1 text-[#D94E1F] font-bold text-xs">
                    <HardHat className="w-3.5 h-3.5" />
                    <span>Cliente</span>
                  </div>
                  <div className="text-[10px] text-[#A8A69E] mt-0.5 truncate">Constructora</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('ROLE_PROVEEDOR')}
                  className="p-2.5 rounded-xl border border-[#363632] bg-[#232320] hover:border-[#1E6F43] hover:bg-[#2C2C28] text-left transition-all group"
                >
                  <div className="flex items-center gap-1 text-[#1E6F43] font-bold text-xs">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Proveedor</span>
                  </div>
                  <div className="text-[10px] text-[#A8A69E] mt-0.5 truncate">Ferretools SAS</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('ROLE_ADMIN')}
                  className="p-2.5 rounded-xl border border-[#363632] bg-[#232320] hover:border-[#B91C1C] hover:bg-[#2C2C28] text-left transition-all group"
                >
                  <div className="flex items-center gap-1 text-[#B91C1C] font-bold text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </div>
                  <div className="text-[10px] text-[#A8A69E] mt-0.5 truncate">Superintendencia</div>
                </button>
              </div>
            </div>

            {/* Formulario de Login */}
            <form onSubmit={handleLoginSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D94E1F]" />
                  Correo Electrónico Corporativo
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  required
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] text-xs focus:outline-none focus:border-[#D94E1F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D94E1F]" />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 pr-10 text-[#F5F4F0] text-xs focus:outline-none focus:border-[#D94E1F] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A69E] hover:text-[#F5F4F0]"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                <span>{loading ? 'Validando credenciales...' : 'Iniciar Sesión'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[11px] text-[#A8A69E]">
                ¿Aún no tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register_client')}
                  className="text-[#D94E1F] hover:underline font-bold"
                >
                  Regístrate como Cliente
                </button>
                {' o '}
                <button
                  type="button"
                  onClick={() => setMode('register_provider')}
                  className="text-[#D94E1F] hover:underline font-bold"
                >
                  como Proveedor
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: REGISTRO DE CLIENTE */}
        {mode === 'register_client' && (
          <form onSubmit={handleClientRegisterSubmit} className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
            <div className="p-3 bg-[#1E1E1C] rounded-xl border border-[#363632] flex items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <HardHat className="w-4 h-4 text-[#D94E1F] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#A8A69E]">
                  <strong className="text-[#F5F4F0]">Cuenta de Cliente / Contratista:</strong> Alquila maquinaria con cotización y facturación electrónica.
                </div>
              </div>
              <button
                type="button"
                onClick={fillSampleClientData}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#282824] hover:bg-[#32322E] text-[#D94E1F] border border-[#363632] text-[10px] font-bold transition-colors"
                title="Rellena el formulario con datos válidos de prueba para probar de inmediato"
              >
                <Wand2 className="w-3 h-3" />
                <span>Ejemplo</span>
              </button>
            </div>

            {/* Nombre y Apellido (Solo Letras) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold">Nombres *</label>
                <input
                  type="text"
                  required
                  placeholder="Carlos Andrés"
                  value={clientForm.firstName}
                  onChange={(e) => setClientForm({ ...clientForm, firstName: sanitizeOnlyLetters(e.target.value) })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                />
                <span className="text-[10px] text-[#787670]">Solo letras y espacios</span>
              </div>
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold">Apellidos *</label>
                <input
                  type="text"
                  required
                  placeholder="Montoya Gómez"
                  value={clientForm.lastName}
                  onChange={(e) => setClientForm({ ...clientForm, lastName: sanitizeOnlyLetters(e.target.value) })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                />
                <span className="text-[10px] text-[#787670]">Solo letras y espacios</span>
              </div>
            </div>

            {/* Tipo y Número de Documento (Solo Números para CC/NIT) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold">Tipo Doc. *</label>
                <select
                  value={clientForm.documentType}
                  onChange={(e) => setClientForm({ ...clientForm, documentType: e.target.value as DocumentType, documentNumber: '' })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-2.5 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                >
                  <option value="CC">Cédula (CC)</option>
                  <option value="NIT">NIT Empresa</option>
                  <option value="CE">Cédula Ext. (CE)</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[#A8A69E] font-semibold">Número de Documento *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="Ej: 1020304050"
                  value={clientForm.documentNumber}
                  onChange={(e) => {
                    const cleaned = clientForm.documentType === 'PASAPORTE'
                      ? e.target.value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 15)
                      : sanitizeOnlyNumbers(e.target.value, 15);
                    setClientForm({ ...clientForm, documentNumber: cleaned });
                  }}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F] font-mono"
                />
                <span className="text-[10px] text-[#787670]">Solo dígitos (sin puntos ni letras)</span>
              </div>
            </div>

            {/* Email y Teléfono (Solo números en teléfono) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#D94E1F]" />
                  Correo Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contratista@empresa.com"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                />
                <span className="text-[10px] text-[#787670]">Ej: usuario@empresa.com</span>
              </div>
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#D94E1F]" />
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="3101234567"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: sanitizeOnlyNumbers(e.target.value, 10) })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F] font-mono"
                />
                <span className="text-[10px] text-[#787670]">Solo números (10 dígitos colombianos)</span>
              </div>
            </div>

            {/* Dirección y Ciudad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D94E1F]" />
                  Dirección de Facturación / Obra *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cra. 7 # 72-41 Of. 501"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold">Ciudad *</label>
                <input
                  type="text"
                  required
                  placeholder="Bogotá D.C."
                  value={clientForm.city}
                  onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                />
              </div>
            </div>

            {/* Contraseña y Confirmación con Botón Mostrar/Ocultar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#D94E1F]" />
                  Contraseña Segura *
                </label>
                <div className="relative">
                  <input
                    type={showClientPassword ? 'text' : 'password'}
                    required
                    placeholder="Ej: Cliente#2026!Sec"
                    value={clientForm.password}
                    onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                    className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 pr-10 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientPassword(!showClientPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A69E] hover:text-[#F5F4F0]"
                  >
                    {showClientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#D94E1F]" />
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showClientConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repetir contraseña"
                    value={clientForm.confirmPassword}
                    onChange={(e) => setClientForm({ ...clientForm, confirmPassword: e.target.value })}
                    className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 pr-10 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientConfirmPassword(!showClientConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A69E] hover:text-[#F5F4F0]"
                  >
                    {showClientConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Requisitos de Contraseña Dinámicos */}
            <div className="p-2.5 bg-[#121210] rounded-lg border border-[#363632] grid grid-cols-2 gap-1 text-[10px]">
              <div className={`flex items-center gap-1 ${clientStrength.length ? 'text-[#1E6F43] font-bold' : 'text-[#A8A69E]'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Mínimo 8 caracteres</span>
              </div>
              <div className={`flex items-center gap-1 ${clientStrength.upper && clientStrength.lower ? 'text-[#1E6F43] font-bold' : 'text-[#A8A69E]'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Mayúscula y minúscula</span>
              </div>
              <div className={`flex items-center gap-1 ${clientStrength.number ? 'text-[#1E6F43] font-bold' : 'text-[#A8A69E]'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Al menos 1 número</span>
              </div>
              <div className={`flex items-center gap-1 ${clientStrength.special ? 'text-[#1E6F43] font-bold' : 'text-[#A8A69E]'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Símbolo (@$!%*?&#)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creando cuenta de cliente...' : 'Completar Registro de Cliente'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: REGISTRO DE PROVEEDOR */}
        {mode === 'register_provider' && (
          <form onSubmit={handleProviderRegisterSubmit} className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
            <div className="p-3 bg-[#1E1E1C] rounded-xl border border-[#363632] flex items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#D94E1F] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#A8A69E]">
                  <strong className="text-[#F5F4F0]">Cuenta de Proveedor / Ferretería:</strong> Publica herramientas y gestiona entregas con reporte de daños.
                </div>
              </div>
              <button
                type="button"
                onClick={fillSampleProviderData}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#282824] hover:bg-[#32322E] text-[#D94E1F] border border-[#363632] text-[10px] font-bold transition-colors"
                title="Rellena el formulario con datos válidos de prueba para probar de inmediato"
              >
                <Wand2 className="w-3 h-3" />
                <span>Ejemplo</span>
              </button>
            </div>

            {/* Razón Social y Representante Legal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#D94E1F]" />
                  Razón Social / Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Maquinaria y Equipos SAS"
                  value={providerForm.companyName}
                  onChange={(e) => setProviderForm({ ...providerForm, companyName: e.target.value })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold">Representante Legal *</label>
                <input
                  type="text"
                  required
                  placeholder="Pedro Pablo Mendoza"
                  value={providerForm.legalRepresentative}
                  onChange={(e) => setProviderForm({ ...providerForm, legalRepresentative: sanitizeOnlyLetters(e.target.value) })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                />
                <span className="text-[10px] text-[#787670]">Solo letras y espacios</span>
              </div>
            </div>

            {/* NIT/RUT (Solo Números y Guion) y Teléfono (Solo Números) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#D94E1F]" />
                  NIT / RUT (con dígito) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 900543210-4"
                  value={providerForm.nitRut}
                  onChange={(e) => setProviderForm({ ...providerForm, nitRut: sanitizeNit(e.target.value) })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F] font-mono"
                />
                <span className="text-[10px] text-[#787670]">Formato: 900123456-1 (solo números y guion)</span>
              </div>
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#D94E1F]" />
                  Teléfono Comercial *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="3209876543"
                  value={providerForm.phone}
                  onChange={(e) => setProviderForm({ ...providerForm, phone: sanitizeOnlyNumbers(e.target.value, 10) })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F] font-mono"
                />
                <span className="text-[10px] text-[#787670]">Solo números (10 dígitos colombianos)</span>
              </div>
            </div>

            {/* Correo Corporativo */}
            <div className="space-y-1">
              <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#D94E1F]" />
                Correo Electrónico Corporativo *
              </label>
              <input
                type="email"
                required
                placeholder="contacto@maquinaria.com"
                value={providerForm.email}
                onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
              />
              <span className="text-[10px] text-[#787670]">Ej: contacto@empresa.com</span>
            </div>

            {/* Dirección y Ciudad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D94E1F]" />
                  Dirección Sede / Bodega Principal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Zona Industrial Calle 13 # 68-20"
                  value={providerForm.address}
                  onChange={(e) => setProviderForm({ ...providerForm, address: e.target.value })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold">Ciudad *</label>
                <input
                  type="text"
                  required
                  placeholder="Bogotá D.C."
                  value={providerForm.city}
                  onChange={(e) => setProviderForm({ ...providerForm, city: e.target.value })}
                  className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F]"
                />
              </div>
            </div>

            {/* Contraseña y Confirmación con Botón Mostrar/Ocultar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#D94E1F]" />
                  Contraseña Segura *
                </label>
                <div className="relative">
                  <input
                    type={showProviderPassword ? 'text' : 'password'}
                    required
                    placeholder="Ej: Proveedor#2026!Sec"
                    value={providerForm.password}
                    onChange={(e) => setProviderForm({ ...providerForm, password: e.target.value })}
                    className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 pr-10 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProviderPassword(!showProviderPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A69E] hover:text-[#F5F4F0]"
                  >
                    {showProviderPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[#A8A69E] font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#D94E1F]" />
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showProviderConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repetir contraseña"
                    value={providerForm.confirmPassword}
                    onChange={(e) => setProviderForm({ ...providerForm, confirmPassword: e.target.value })}
                    className="w-full bg-[#121210] border border-[#363632] rounded-lg px-3 py-2 pr-10 text-[#F5F4F0] focus:outline-none focus:border-[#D94E1F] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProviderConfirmPassword(!showProviderConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A69E] hover:text-[#F5F4F0]"
                  >
                    {showProviderConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Requisitos de Contraseña Dinámicos */}
            <div className="p-2.5 bg-[#121210] rounded-lg border border-[#363632] grid grid-cols-2 gap-1 text-[10px]">
              <div className={`flex items-center gap-1 ${providerStrength.length ? 'text-[#1E6F43] font-bold' : 'text-[#A8A69E]'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Mínimo 8 caracteres</span>
              </div>
              <div className={`flex items-center gap-1 ${providerStrength.upper && providerStrength.lower ? 'text-[#1E6F43] font-bold' : 'text-[#A8A69E]'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Mayúscula y minúscula</span>
              </div>
              <div className={`flex items-center gap-1 ${providerStrength.number ? 'text-[#1E6F43] font-bold' : 'text-[#A8A69E]'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Al menos 1 número</span>
              </div>
              <div className={`flex items-center gap-1 ${providerStrength.special ? 'text-[#1E6F43] font-bold' : 'text-[#A8A69E]'}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Símbolo (@$!%*?&#)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#D94E1F] hover:bg-[#B83D14] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              <Building2 className="w-4 h-4" />
              <span>{loading ? 'Afiliando empresa proveedora...' : 'Completar Registro de Proveedor'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
