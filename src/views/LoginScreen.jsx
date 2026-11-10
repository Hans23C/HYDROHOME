import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ onLoginSuccess }) => {
  const { login, registerUser } = useAuth();

  // Estados de vista: 'welcome' | 'login' | 'register'
  const [view, setView] = useState('welcome');

  // Campos de inicio de sesión
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Campos de registro
  const [username, setUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login normal
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu usuario/correo y contraseña.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        login(email.trim(), password);
        setIsLoading(false);
        onLoginSuccess?.(0);
      } catch (err) {
        setIsLoading(false);
        setError(err.message || 'Error al iniciar sesión.');
      }
    }, 400);
  };

  // Registro normal
  const handleRegister = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!username.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (registerPassword.length < 5) {
      setError('La contraseña debe tener al menos 5 caracteres.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!agreeTerms) {
      setError('Debes aceptar los Términos y Privacidad.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        const parts = username.trim().split(' ');
        const firstName = parts[0] || username.trim();
        const lastName = parts.slice(1).join(' ') || 'Hogar';

        registerUser({
          firstName,
          lastName,
          email: registerEmail.trim(),
          password: registerPassword,
          initialSystemName: 'Casa Principal',
        });
        setIsLoading(false);
        onLoginSuccess?.(0);
      } catch (err) {
        setIsLoading(false);
        setError(err.message || 'Error al crear la cuenta.');
      }
    }, 450);
  };

  // Botón: Iniciar sesión con Cuenta Prueba
  const handleCuentaPrueba = () => {
    setError('');
    setEmail('prueba@hydrohome.io');
    setPassword('Prueba#2024');
    setIsLoading(true);
    setTimeout(() => {
      try {
        login('prueba@hydrohome.io', 'Prueba#2024');
        setIsLoading(false);
        onLoginSuccess?.(0);
      } catch (err) {
        setIsLoading(false);
        setError(err.message);
      }
    }, 300);
  };

  // Botón: Iniciar sesión con Cuenta Admin
  const handleCuentaAdmin = () => {
    setError('');
    setEmail('admin@hydrohome.io');
    setPassword('Admin#2024');
    setIsLoading(true);
    setTimeout(() => {
      try {
        login('admin@hydrohome.io', 'Admin#2024');
        setIsLoading(false);
        onLoginSuccess?.(0);
      } catch (err) {
        setIsLoading(false);
        setError(err.message);
      }
    }, 300);
  };

  return (
    <div className="min-h-dvh w-full bg-[#030912] text-slate-100 flex items-center justify-center p-0 sm:p-4 select-none relative overflow-x-hidden">
      {/* Resplandor ambiental de agua y cian del logo */}
      <div className="fixed -top-32 -left-32 w-[460px] h-[460px] rounded-full bg-cyan-500/20 blur-[130px] pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-[460px] h-[460px] rounded-full bg-sky-500/20 blur-[130px] pointer-events-none" />

      {/* Frame de teléfono/móvil con curvatura y proporciones equilibradas */}
      <div className="relative z-10 w-full max-w-[420px] h-dvh sm:h-[844px] sm:max-h-[96dvh] bg-[#071524] sm:rounded-[48px] sm:border-[8px] sm:border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-end">
        <AnimatePresence mode="wait">
          {/* ============================================================== */}
          {/* PANTALLA 1: BIENVENIDOS                                        */}
          {/* ============================================================== */}
          {view === 'welcome' && (
            <motion.div
              key="welcome-view"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="w-full h-full flex flex-col justify-between"
            >
              {/* Parte superior oscura: Logo amplio y distinguido */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-8 pb-4 relative">
                <div className="w-80 sm:w-96 h-28 sm:h-32 flex items-center justify-center mb-5">
                  <img
                    src="/assets/images/logo_principal_white.png"
                    alt="Hydro Home"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_24px_rgba(56,189,248,0.7)]"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/logo_principal.png';
                    }}
                  />
                </div>

                <p className="text-sm sm:text-base text-cyan-100/90 font-semibold max-w-[320px] leading-relaxed tracking-wide text-center">
                  Control inteligente de agua y prevención de fugas para tu hogar
                </p>
              </div>

              {/* Tarjeta inferior en azul agua con botones desahogados */}
              <div className="w-full bg-[#BDE0F5] text-slate-900 rounded-t-[50px] px-6 pt-9 pb-12 shadow-[0_-18px_45px_rgba(0,0,0,0.45)] flex flex-col items-center">
                <h1 className="text-3xl sm:text-4xl font-black text-[#071626] mb-8 text-center tracking-tight">
                  Bienvenidos
                </h1>

                {/* Botones con ancho más cómodo (320px) para no verse amontonados */}
                <div className="w-full max-w-[320px] flex flex-col gap-4 mx-auto">
                  {/* Botón Ingresar */}
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setError('');
                    }}
                    className="w-full h-14 rounded-full font-black text-lg bg-[#091A2D] hover:bg-[#05111E] text-white shadow-lg shadow-[#091A2D]/35 active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide"
                  >
                    Ingresar
                  </button>

                  {/* Botón Crear */}
                  <button
                    type="button"
                    onClick={() => {
                      setView('register');
                      setError('');
                    }}
                    className="w-full h-14 rounded-full font-black text-lg bg-white hover:bg-slate-50 text-[#071626] shadow-md shadow-black/10 active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide"
                  >
                    Crear
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PANTALLA 2: WELCOME BACK (INICIAR SESIÓN)                       */}
          {/* ============================================================== */}
          {view === 'login' && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="w-full h-full flex flex-col justify-end"
            >
              {/* Cabecera superior: Flecha más grande y texto cerca de la tarjeta (sin vacío gigante) */}
              <div className="w-full px-6 pt-6 pb-4 flex flex-col items-center text-center shrink-0">
                {/* Fila del icono de regreso más notorio y cómodo */}
                <div className="w-full max-w-[340px] flex items-center justify-start mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView('welcome');
                      setError('');
                    }}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white hover:text-cyan-300 hover:bg-white/10 transition cursor-pointer active:scale-95"
                    title="Volver"
                  >
                    <ArrowLeft className="w-7 h-7 stroke-[2.5]" />
                  </button>
                </div>

                {/* Título y subtítulo con letra más grande */}
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1.5">
                  Welcome back
                </h2>
                <p className="text-sm sm:text-base text-cyan-200 font-medium leading-relaxed max-w-[330px]">
                  Please enter your account details to sign in your account
                </p>
              </div>

              {/* Tarjeta inferior con recuadros blancos más amplios (320px) y no amontonados */}
              <div className="w-full bg-[#BDE0F5] text-slate-900 rounded-t-[50px] px-6 pt-7 pb-8 shadow-[0_-18px_45px_rgba(0,0,0,0.45)] flex flex-col items-center overflow-y-auto mt-2">
                <form onSubmit={handleLogin} className="w-full max-w-[320px] flex flex-col mx-auto">
                  {error && (
                    <div className="mb-3 p-3 rounded-2xl bg-rose-500/25 border border-rose-500/40 text-rose-950 text-xs font-bold text-center animate-fadeIn">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Input Usuario (Recuadro blanco más desahogado) */}
                  <div className="mb-3.5">
                    <input
                      type="text"
                      required
                      placeholder="Usuario"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 px-6 rounded-full text-base font-bold bg-white text-[#071626] placeholder:text-slate-500 placeholder:font-semibold text-center border border-sky-300/60 focus:border-sky-600 focus:bg-white focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* Input Contraseña (Recuadro blanco más desahogado) */}
                  <div className="relative mb-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 px-6 rounded-full text-base font-bold bg-white text-[#071626] placeholder:text-slate-500 placeholder:font-semibold text-center border border-sky-300/60 focus:border-sky-600 focus:bg-white focus:outline-none transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Forgot Password? centrado */}
                  <div className="text-center mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('prueba@hydrohome.io');
                        setPassword('Prueba#2024');
                      }}
                      className="text-xs sm:text-sm font-bold text-[#071626] hover:text-sky-900 transition cursor-pointer underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Botón Ingresar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-full font-black text-lg bg-[#091A2D] hover:bg-[#05111E] text-white shadow-lg shadow-[#091A2D]/35 active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide"
                  >
                    {isLoading ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Ingresar'
                    )}
                  </button>
                </form>

                {/* Divisor tenue centrado */}
                <div className="w-full max-w-[280px] border-t border-sky-300/80 my-4 mx-auto" />

                {/* Botones de Acceso Rápido (Recuadros blancos más amplios: 320px) */}
                <div className="w-full max-w-[320px] flex flex-col gap-3 mx-auto">
                  {/* Botón Cuenta Prueba */}
                  <button
                    type="button"
                    onClick={handleCuentaPrueba}
                    className="w-full h-13.5 rounded-full bg-white hover:bg-slate-50 text-[#071626] font-black text-base sm:text-lg shadow-sm flex items-center justify-center text-center transition cursor-pointer active:scale-98 border border-white tracking-wide"
                  >
                    Cuenta Prueba
                  </button>

                  {/* Botón Cuenta Admin */}
                  <button
                    type="button"
                    onClick={handleCuentaAdmin}
                    className="w-full h-13.5 rounded-full bg-white hover:bg-slate-50 text-[#071626] font-black text-base sm:text-lg shadow-sm flex items-center justify-center text-center transition cursor-pointer active:scale-98 border border-white tracking-wide"
                  >
                    Cuenta Admin
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PANTALLA 3: GET STARTED (CREAR CUENTA)                          */}
          {/* ============================================================== */}
          {view === 'register' && (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="w-full h-full flex flex-col justify-end"
            >
              {/* Cabecera superior: Flecha separada y texto cerca de la tarjeta */}
              <div className="w-full px-6 pt-5 pb-3 flex flex-col items-center text-center shrink-0">
                {/* Fila del icono de regreso visible y sin colisiones */}
                <div className="w-full max-w-[340px] flex items-center justify-start mb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setView('welcome');
                      setError('');
                    }}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white hover:text-cyan-300 hover:bg-white/10 transition cursor-pointer active:scale-95"
                    title="Volver"
                  >
                    <ArrowLeft className="w-7 h-7 stroke-[2.5]" />
                  </button>
                </div>

                {/* Título y subtítulo con letra más grande */}
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                  Get Started
                </h2>
                <p className="text-sm sm:text-base text-cyan-200 font-medium leading-relaxed max-w-[330px]">
                  Please enter your detail to create an account
                </p>
              </div>

              {/* Tarjeta inferior con recuadros blancos más amplios (320px) sin amontonar */}
              <div className="w-full bg-[#BDE0F5] text-slate-900 rounded-t-[50px] px-6 pt-6 pb-7 shadow-[0_-18px_45px_rgba(0,0,0,0.45)] flex flex-col items-center overflow-y-auto mt-2">
                <form onSubmit={handleRegister} className="w-full max-w-[320px] flex flex-col mx-auto">
                  {error && (
                    <div className="mb-2 p-2.5 rounded-2xl bg-rose-500/25 border border-rose-500/40 text-rose-950 text-xs font-bold text-center animate-fadeIn">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Input Nombre de Usuario */}
                  <div className="mb-3">
                    <input
                      type="text"
                      required
                      placeholder="Nombre de Usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-13 px-6 rounded-full text-sm sm:text-base font-bold bg-white text-[#071626] placeholder:text-slate-500 placeholder:font-semibold text-center border border-sky-300/60 focus:border-sky-600 focus:bg-white focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* Input Email */}
                  <div className="mb-3">
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full h-13 px-6 rounded-full text-sm sm:text-base font-bold bg-white text-[#071626] placeholder:text-slate-500 placeholder:font-semibold text-center border border-sky-300/60 focus:border-sky-600 focus:bg-white focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* Input Contraseña */}
                  <div className="relative mb-3">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Contraseña"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full h-13 px-6 rounded-full text-sm sm:text-base font-bold bg-white text-[#071626] placeholder:text-slate-500 placeholder:font-semibold text-center border border-sky-300/60 focus:border-sky-600 focus:bg-white focus:outline-none transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Input Confirmar Contraseña */}
                  <div className="mb-3.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirmar Contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-13 px-6 rounded-full text-sm sm:text-base font-bold bg-white text-[#071626] placeholder:text-slate-500 placeholder:font-semibold text-center border border-sky-300/60 focus:border-sky-600 focus:bg-white focus:outline-none transition shadow-xs"
                    />
                  </div>

                  {/* Checkbox Terms and Privacy centrado */}
                  <div className="flex items-center justify-center gap-2 mb-3.5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-400 bg-white text-[#091A2D] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs sm:text-sm font-bold text-[#071626] cursor-pointer select-none">
                      I agree with <span className="text-sky-800 font-black">Terms</span> and{' '}
                      <span className="text-sky-800 font-black">Privacy</span>
                    </label>
                  </div>

                  {/* Botón Ingresar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-13.5 rounded-full font-black text-lg bg-[#091A2D] hover:bg-[#05111E] text-white shadow-lg shadow-[#091A2D]/35 active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide mb-3"
                  >
                    {isLoading ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Ingresar'
                    )}
                  </button>
                </form>

                {/* Alternador inferior centrado */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setError('');
                    }}
                    className="text-xs sm:text-sm font-bold text-[#071626] hover:text-sky-950 transition cursor-pointer"
                  >
                    ¿Ya tienes una cuenta? <span className="underline font-black">Inicia sesión</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginScreen;
