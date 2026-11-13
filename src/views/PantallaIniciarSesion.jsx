import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ParticulasAgua } from '../components/common/ParticulasAgua';

export const PantallaIniciarSesion = ({ onLoginSuccess }) => {
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

  // Iniciar sesión con Cuenta de Prueba
  const handleQuickDemoLogin = () => {
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

  // Iniciar sesión con Cuenta de Administrador
  const handleQuickAdminLogin = () => {
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

  // Clases reutilizables para mantener consistencia visual
  const inputClass =
    'w-full h-14 px-5 rounded-2xl text-base sm:text-sm font-medium bg-slate-900/60 text-white placeholder:text-slate-400 border border-slate-700/60 focus:border-cyan-400 focus:bg-slate-900/80 backdrop-blur-md focus:outline-none transition shadow-inner';
  const primaryBtnClass =
    'w-full h-14 rounded-2xl font-bold text-base sm:text-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide shrink-0';
  const quickBtnClass =
    'w-full h-13.5 px-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 font-semibold text-sm backdrop-blur-md shadow-sm flex items-center justify-center transition cursor-pointer active:scale-98';
  const backBtnClass =
    'w-12 h-12 rounded-full flex items-center justify-center text-white bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md shadow-lg shadow-black/30 transition cursor-pointer active:scale-95';

  // Animación común de entrada/salida de cada vista
  const viewMotion = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.28, ease: 'easeOut' },
  };

  return (
    <div className="min-h-dvh w-full bg-[#050B14] text-slate-100 flex flex-col items-center px-6 select-none relative overflow-x-hidden">
      {/* Resplandor ambiental de fondo */}
      <div className="fixed -top-32 -left-32 w-[440px] h-[440px] rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-[440px] h-[440px] rounded-full bg-sky-500/15 blur-[120px] pointer-events-none" />

      {/* tsParticles: fondo fijo absoluto a pantalla completa */}
      <ParticulasAgua className="absolute inset-0 z-0 pointer-events-none" />

      {/*
        Contenedor principal a altura completa de pantalla.
        Cada vista reparte sus bloques con espaciadores flexibles proporcionales,
        así los elementos ocupan su zona (arriba / centro / 3/4) en cualquier altura
        y en pantallas bajas se respetan mínimos y aparece scroll natural.
      */}
      <div className="relative z-10 w-full max-w-sm mx-auto min-h-dvh flex flex-col">
        <AnimatePresence mode="wait">
          {/* ============================================================== */}
          {/* VISTA 1: INICIO / BIENVENIDA (HOME / WELCOME)                  */}
          {/* ============================================================== */}
          {view === 'welcome' && (
            <motion.div
              key="welcome-view"
              {...viewMotion}
              className="w-full flex-1 flex flex-col items-center text-center py-8"
            >
              {/* Espaciador superior corto: el logo queda más arriba */}
              <div className="flex-[0.55] min-h-6" />

              {/* Logotipo Oficial: un poco más grande */}
              <div className="w-[380px] sm:w-[440px] max-w-full flex items-center justify-center shrink-0">
                <img
                  src="/assets/images/Home_white.png"
                  alt="Hydro Home"
                  className="w-full h-auto max-h-40 object-contain filter drop-shadow-[0_0_30px_rgba(56,189,248,0.7)]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/images/Home.png';
                  }}
                />
              </div>

              {/* Espaciador logo → título */}
              <div className="flex-1 min-h-10" />

              {/* Título Bienvenidos: más grande y en el centro de la pantalla */}
              <h1 className="text-[2.75rem] sm:text-6xl leading-none font-extrabold text-white tracking-tight drop-shadow-md shrink-0">
                Bienvenidos
              </h1>

              {/* Espaciador título → botones (simétrico al de arriba para centrar el título) */}
              <div className="flex-1 min-h-12" />

              {/* Bloque de botones: más abajo */}
              <div className="w-full flex flex-col gap-4.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError('');
                  }}
                  className={primaryBtnClass}
                >
                  Ingresar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView('register');
                    setError('');
                  }}
                  className="w-full h-14 rounded-2xl font-bold text-base sm:text-lg bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md shadow-md active:scale-98 transition cursor-pointer flex items-center justify-center text-center tracking-wide"
                >
                  Crear Cuenta
                </button>
              </div>

              {/* Espaciador inferior corto: botones cerca de la zona baja */}
              <div className="flex-[0.55] min-h-6" />
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* VISTA 2: INICIAR SESIÓN (LOGIN)                                */}
          {/* ============================================================== */}
          {view === 'login' && (
            <motion.div
              key="login-view"
              {...viewMotion}
              className="w-full flex-1 flex flex-col py-8"
            >
              {/* Botón de regresar: separado del borde superior (mt considerable) */}
              <div className="w-full flex items-center mt-6 sm:mt-10 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setView('welcome');
                    setError('');
                  }}
                  className={backBtnClass}
                  title="Volver"
                >
                  <ArrowLeft className="w-5 h-5 text-white stroke-[2.5]" />
                </button>
              </div>

              {/* Cabecera: acompaña al botón de regresar en la parte alta */}
              <div className="w-full text-center mt-6 shrink-0">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Bienvenido de nuevo
                </h2>
                <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                  Ingresa los datos de tu cuenta para continuar
                </p>
              </div>

              {/* Espaciador cabecera → formulario: aleja el formulario hacia abajo */}
              <div className="flex-[0.8] min-h-10" />

              {/* Formulario */}
              <form onSubmit={handleLogin} className="w-full flex flex-col shrink-0">
                {error && (
                  <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center animate-fadeIn">
                    ⚠️ {error}
                  </div>
                )}

                {/* Campos más separados entre sí */}
                <div className="flex flex-col gap-5">
                  <input
                    type="text"
                    required
                    placeholder="Usuario o Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-13`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1.5"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Botón Ingresar: claramente separado de los recuadros */}
                <button type="submit" disabled={isLoading} className={`${primaryBtnClass} mt-9`}>
                  {isLoading ? (
                    <span className="animate-spin w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
                  ) : (
                    'Ingresar'
                  )}
                </button>
              </form>

              {/* Espaciador simétrico: el divisor queda justo en medio */}
              <div className="flex-1 min-h-9" />

              {/* Divisor "o acceso rápido" */}
              <div className="w-full flex items-center justify-center shrink-0">
                <div className="flex-1 border-t border-slate-700/60" />
                <span className="px-4 text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  o acceso rápido
                </span>
                <div className="flex-1 border-t border-slate-700/60" />
              </div>

              <div className="flex-1 min-h-9" />

              {/* Botones de acceso rápido: hacia los 3/4 inferiores */}
              <div className="w-full flex flex-col gap-4 shrink-0">
                <button type="button" onClick={handleQuickDemoLogin} className={quickBtnClass}>
                  Cuenta de Prueba
                </button>
                <button type="button" onClick={handleQuickAdminLogin} className={quickBtnClass}>
                  Cuenta de Administrador
                </button>
              </div>

              {/* Margen inferior proporcional */}
              <div className="flex-[0.45] min-h-6" />
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* VISTA 3: CREAR CUENTA (REGISTRO)                               */}
          {/* ============================================================== */}
          {view === 'register' && (
            <motion.div
              key="register-view"
              {...viewMotion}
              className="w-full flex-1 flex flex-col py-8"
            >
              {/* Botón de regresar: mismo margen superior que en Login */}
              <div className="w-full flex items-center mt-6 sm:mt-10 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setView('welcome');
                    setError('');
                  }}
                  className={backBtnClass}
                  title="Volver"
                >
                  <ArrowLeft className="w-5 h-5 text-white stroke-[2.5]" />
                </button>
              </div>

              {/* Título Crear Cuenta: un poco más arriba (pegado al flujo del botón) */}
              <div className="w-full text-center mt-5 shrink-0">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Crear Cuenta
                </h2>
                <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                  Ingresa tus datos para registrarte
                </p>
              </div>

              {/* Espaciador cabecera → campos: baja el bloque de recuadros */}
              <div className="flex-[0.7] min-h-8" />

              <form onSubmit={handleRegister} className="w-full flex-[3] flex flex-col">
                {error && (
                  <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center animate-fadeIn shrink-0">
                    ⚠️ {error}
                  </div>
                )}

                {/* 4 campos con separación uniforme */}
                <div className="flex flex-col gap-4.5 shrink-0">
                  <input
                    type="text"
                    required
                    placeholder="Nombre de Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                  />

                  <input
                    type="email"
                    required
                    placeholder="Correo Electrónico"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className={inputClass}
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Contraseña"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className={`${inputClass} pr-13`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1.5"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirmar Contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Espaciadores iguales arriba y abajo: la casilla queda justo en medio */}
                <div className="flex-1 min-h-7" />

                <div className="flex items-center justify-center gap-2.5 px-1 shrink-0">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4.5 h-4.5 rounded-md border-slate-700 bg-slate-900/70 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                  />
                  <label htmlFor="terms" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                    Acepto los <span className="text-cyan-400 font-semibold underline">Términos</span> y la{' '}
                    <span className="text-cyan-400 font-semibold underline">Privacidad</span>
                  </label>
                </div>

                <div className="flex-1 min-h-7" />

                {/* Botón Crear Cuenta: hacia los 3/4 de la pantalla */}
                <button type="submit" disabled={isLoading} className={primaryBtnClass}>
                  {isLoading ? (
                    <span className="animate-spin w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>

              {/* Enlace inferior con su propio margen */}
              <div className="w-full text-center mt-7 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError('');
                  }}
                  className="text-sm font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  ¿Ya tienes una cuenta? <span className="text-cyan-400 font-semibold underline ml-1">Inicia sesión</span>
                </button>
              </div>

              {/* Margen inferior proporcional */}
              <div className="flex-[0.4] min-h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PantallaIniciarSesion;
