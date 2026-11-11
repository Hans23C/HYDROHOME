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

  // Estados de vista: 'welcome' | 'login' | 'register' (idéntico al diseño de Figma)
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

  // Botón Google: Iniciar sesión con Cuenta de Prueba (Familia Vásquez)
  const handleGoogleLogin = () => {
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

  // Botón Meta: Iniciar sesión con Cuenta de Administrador (Admin Hydro)
  const handleMetaLogin = () => {
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
    <div className="min-h-dvh w-full bg-[#050B14] text-slate-100 flex items-center justify-center p-0 sm:p-4 select-none relative overflow-x-hidden">
      {/* Resplandor ambiental de fondo */}
      <div className="fixed -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-[440px] h-[440px] rounded-full bg-sky-500/15 blur-[120px] pointer-events-none" />

      {/* Frame de teléfono/móvil: adaptativo a cualquier pantalla conservando la distribución exacta de Figma */}
      <div className="relative z-10 w-full max-w-[420px] h-dvh sm:h-[844px] sm:max-h-[96dvh] bg-[#11141D] sm:rounded-[48px] sm:border-[8px] sm:border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* ============================================================== */}
          {/* PANTALLA 1: BIENVENIDOS (IMAGEN 1 DE FIGMA)                    */}
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
              {/* Parte superior oscura (~52% de la altura): Logo Home y Eslogan */}
              <div className="h-[52%] flex flex-col items-center justify-center px-6 text-center pt-8 pb-4 relative">
                {/* Logo Oficial Home */}
                <div className="w-64 sm:w-72 h-auto max-h-24 flex items-center justify-center mb-6">
                  <img
                    src="/assets/images/Home_white.png"
                    alt="Hydro Home"
                    className="w-full h-auto max-h-20 object-contain filter drop-shadow-[0_0_18px_rgba(56,189,248,0.55)]"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/Home.png';
                    }}
                  />
                </div>

                {/* Eslogan sobre la curva de la tarjeta */}
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-[280px] leading-relaxed tracking-wide text-center">
                  Capture and share the world's moment
                </p>
              </div>

              {/* Tarjeta inferior curva (~48% de la altura) con 'Bienvenidos' */}
              <div className="h-[48%] w-full bg-[#B9CBD9] text-slate-900 rounded-t-[48px] px-8 pt-9 pb-12 shadow-[0_-15px_40px_rgba(0,0,0,0.35)] flex flex-col justify-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#232938] mb-8 text-left tracking-tight">
                  Bienvenidos
                </h1>

                <div className="flex flex-col gap-4">
                  {/* Botón Ingresar */}
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setError('');
                    }}
                    className="w-full h-14 rounded-full font-bold text-base bg-[#2E2E44] hover:bg-[#232338] text-white shadow-lg shadow-[#2E2E44]/35 active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide"
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
                    className="w-full h-14 rounded-full font-bold text-base bg-white hover:bg-slate-50 text-[#232938] shadow-md shadow-black/10 active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide"
                  >
                    Crear
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PANTALLA 2: WELCOME BACK (IMAGEN 2 DE FIGMA)                   */}
          {/* ============================================================== */}
          {view === 'login' && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="w-full h-full flex flex-col justify-between"
            >
              {/* Parte superior oscura (~34% de la altura): Flecha atrás, título y subtítulo alineados a la izquierda */}
              <div className="h-[34%] min-h-[160px] max-h-[220px] px-7 pt-8 pb-4 flex flex-col justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setView('welcome');
                    setError('');
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition cursor-pointer -ml-2"
                  title="Volver"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="mb-2">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-left tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300/85 text-left mt-1 font-medium leading-relaxed max-w-[320px]">
                    Please enter your account details to sign in your account
                  </p>
                </div>
              </div>

              {/* Tarjeta inferior curva (~66% de la altura): Inputs, divisor y botones sociales */}
              <div className="h-[66%] flex-1 w-full bg-[#B9CBD9] text-slate-900 rounded-t-[48px] px-7 sm:px-8 pt-7 pb-8 shadow-[0_-15px_40px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-y-auto">
                <form onSubmit={handleLogin} className="flex flex-col">
                  {error && (
                    <div className="mb-3 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-900 text-xs font-bold text-left animate-fadeIn">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Input Usuario */}
                  <div className="mb-3.5">
                    <input
                      type="text"
                      required
                      placeholder="Usuario"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-13 px-6 rounded-full text-sm font-semibold bg-[#EEF2F6] text-slate-900 placeholder:text-slate-500 text-left border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition shadow-sm"
                    />
                  </div>

                  {/* Input Contraseña */}
                  <div className="relative mb-1.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-13 pl-6 pr-12 rounded-full text-sm font-semibold bg-[#EEF2F6] text-slate-900 placeholder:text-slate-500 text-left border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Forgot Password? a la derecha */}
                  <div className="flex justify-end mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('prueba@hydrohome.io');
                        setPassword('Prueba#2024');
                      }}
                      className="text-xs font-bold text-[#2E2E44] hover:text-black transition cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Botón Ingresar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-13.5 rounded-full font-bold text-base bg-[#2E2E44] hover:bg-[#232338] text-white shadow-lg shadow-[#2E2E44]/35 active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide"
                  >
                    {isLoading ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Ingresar'
                    )}
                  </button>
                </form>

                {/* Divisor horizontal tenue */}
                <div className="w-full border-t border-[#9CB0C2] my-4" />

                {/* Botones Sociales tal cual Figma: Continue with Google y Continue with meta */}
                <div className="flex flex-col gap-3">
                  {/* Botón 1: Google (conecta con cuenta demo) */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full h-13 px-6 rounded-full bg-white hover:bg-slate-50 text-[#232938] font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition cursor-pointer active:scale-98 border border-white"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Botón 2: Meta (conecta con cuenta admin) */}
                  <button
                    type="button"
                    onClick={handleMetaLogin}
                    className="w-full h-13 px-6 rounded-full bg-white hover:bg-slate-50 text-[#232938] font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition cursor-pointer active:scale-98 border border-white"
                  >
                    <svg className="w-5 h-5 text-[#0081FB] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.92 6C14.7 6 12.98 7.4 12 9.06 11.02 7.4 9.3 6 7.08 6 3.73 6 1 8.85 1 12.38c0 3.93 3.2 7.62 6.18 7.62 2.1 0 3.75-1.31 4.82-2.94 1.07 1.63 2.72 2.94 4.82 2.94 2.98 0 6.18-3.69 6.18-7.62C23 8.85 20.27 6 16.92 6zm-9.84 11.5c-2.3 0-4.58-3.05-4.58-5.12 0-2.23 1.76-3.88 3.88-3.88 1.95 0 3.45 1.48 4.2 3.28-.9 2.45-2.14 5.72-3.5 5.72zm9.84 0c-1.36 0-2.6-3.27-3.5-5.72.75-1.8 2.25-3.28 4.2-3.28 2.12 0 3.88 1.65 3.88 3.88 0 2.07-2.28 5.12-4.58 5.12z" />
                    </svg>
                    <span>Continue with meta</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PANTALLA 3: GET STARTED (IMAGEN 3 DE FIGMA)                    */}
          {/* ============================================================== */}
          {view === 'register' && (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="w-full h-full flex flex-col justify-between"
            >
              {/* Parte superior oscura (~26% de la altura): Flecha, título y subtítulo */}
              <div className="h-[26%] min-h-[140px] max-h-[190px] px-7 pt-6 pb-3 flex flex-col justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setView('welcome');
                    setError('');
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition cursor-pointer -ml-2"
                  title="Volver"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="mb-1">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-left tracking-tight">
                    Get Started
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300/85 text-left mt-0.5 font-medium leading-relaxed max-w-[320px]">
                    Please enter your detail to create an account
                  </p>
                </div>
              </div>

              {/* Tarjeta inferior curva (~74% de la altura): 4 campos, términos y botón */}
              <div className="h-[74%] flex-1 w-full bg-[#B9CBD9] text-slate-900 rounded-t-[48px] px-7 sm:px-8 pt-6 pb-6 flex flex-col justify-between overflow-y-auto">
                <form onSubmit={handleRegister} className="flex flex-col">
                  {error && (
                    <div className="mb-2 p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-900 text-xs font-bold text-left animate-fadeIn">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Input Nombre de Usuario */}
                  <div className="mb-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Nombre de Usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-12 px-6 rounded-full text-sm font-semibold bg-[#EEF2F6] text-slate-900 placeholder:text-slate-500 text-left border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition shadow-sm"
                    />
                  </div>

                  {/* Input Email */}
                  <div className="mb-2.5">
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full h-12 px-6 rounded-full text-sm font-semibold bg-[#EEF2F6] text-slate-900 placeholder:text-slate-500 text-left border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition shadow-sm"
                    />
                  </div>

                  {/* Input Contraseña */}
                  <div className="relative mb-2.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Contraseña"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full h-12 pl-6 pr-12 rounded-full text-sm font-semibold bg-[#EEF2F6] text-slate-900 placeholder:text-slate-500 text-left border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition shadow-sm"
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
                  <div className="mb-3">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirmar Contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 px-6 rounded-full text-sm font-semibold bg-[#EEF2F6] text-slate-900 placeholder:text-slate-500 text-left border border-transparent focus:border-sky-500 focus:bg-white focus:outline-none transition shadow-sm"
                    />
                  </div>

                  {/* Checkbox Terms and Privacy */}
                  <div className="flex items-center gap-2.5 px-1 mb-3.5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded-md border-slate-400 bg-[#EEF2F6] text-[#2E2E44] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      I agree with <span className="text-sky-700 font-bold">Terms</span> and{' '}
                      <span className="text-sky-700 font-bold">Privacy</span>
                    </label>
                  </div>

                  {/* Botón Ingresar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-13 rounded-full font-bold text-base bg-[#2E2E44] hover:bg-[#232338] text-white shadow-lg shadow-[#2E2E44]/35 active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide mb-2"
                  >
                    {isLoading ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Ingresar'
                    )}
                  </button>
                </form>

                {/* Alternador inferior */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setError('');
                    }}
                    className="text-xs font-bold text-[#2E2E44] hover:text-black transition cursor-pointer"
                  >
                    ¿Ya tienes una cuenta? <span className="underline">Inicia sesión</span>
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
