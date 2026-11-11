import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { Droplet, Wifi, Cpu, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TELEMETRY_STEPS = [
  { at: 0, text: 'Iniciando telemetría de red hídrica del hogar...', icon: Droplet },
  { at: 28, text: 'Calibrando transductores de presión (bar)...', icon: Cpu },
  { at: 58, text: 'Enlazando broker ESP32 / WiFi doméstico...', icon: Wifi },
  { at: 85, text: 'Sincronizando nivel de cisterna y bombas...', icon: Sparkles },
  { at: 100, text: 'Hydro Intelligent Home listo y sincronizado.', icon: ShieldCheck },
];

export const SplashScreen = ({ onFinish }) => {
  const { user } = useAuth();
  const counterRef = useRef({ value: 0 });
  const onFinishRef = useRef(onFinish);
  const userRef = useRef(user);

  useEffect(() => {
    onFinishRef.current = onFinish;
    userRef.current = user;
  }, [onFinish, user]);

  const [displayValue, setDisplayValue] = useState(0);
  const [currentStepText, setCurrentStepText] = useState(TELEMETRY_STEPS[0].text);
  const [CurrentIcon, setCurrentIcon] = useState(() => TELEMETRY_STEPS[0].icon);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    // Línea de tiempo GSAP estable para mostrar siempre el Logo al iniciar la app
    const tl = gsap.timeline({
      onComplete: () => {
        setIsFinishing(true);
        setTimeout(() => {
          onFinishRef.current?.(userRef.current ? 0 : 'login');
        }, 700);
      },
    });

    tl.to(counterRef.current, {
      value: 100,
      duration: 3.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.round(counterRef.current.value);
        setDisplayValue(val);

        for (let i = TELEMETRY_STEPS.length - 1; i >= 0; i--) {
          if (val >= TELEMETRY_STEPS[i].at) {
            setCurrentStepText(TELEMETRY_STEPS[i].text);
            setCurrentIcon(() => TELEMETRY_STEPS[i].icon);
            break;
          }
        }
      },
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 min-h-dvh flex flex-col items-center justify-between p-6 sm:p-10 bg-[#040C14] text-white overflow-hidden select-none"
    >
      {/* Fondo con mallas de gradiente */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0C2D48_0%,_#071927_50%,_#030910_100%)] pointer-events-none" />

      {/* Ondas concéntricas de agua pulsantes en el fondo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[220, 340, 460].map((size, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.95, 1.15, 0.95],
              opacity: [0.15, 0.38, 0.15],
            }}
            transition={{
              duration: 3.5 + index * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.4,
            }}
            style={{ width: size, height: size }}
            className="absolute rounded-full border border-cyan-500/25 shadow-[0_0_35px_rgba(6,182,212,0.12)]"
          />
        ))}
      </div>

      {/* Cabecera de estado */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative z-10 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/75 border border-cyan-500/35 text-xs font-mono text-cyan-300 backdrop-blur-md"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span>HYDRO HOME SMART TELEMETRY v3.0</span>
      </motion.div>

      {/* Contenido Central: Vista Destacada del Logo de la App */}
      <div className="my-auto relative z-10 flex flex-col items-center text-center max-w-md w-full px-4">
        {/* Contenedor Grande del Logo con Aura Bioluminiscente */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: isFinishing ? 1.06 : 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mb-8"
        >
          {/* Anillo de rotación cian */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-3 rounded-[32px] border-2 border-dashed border-cyan-400/40 pointer-events-none"
          />

          <div className="w-64 sm:w-80 h-24 sm:h-28 rounded-3xl p-3.5 bg-[#061524] border-2 border-cyan-400/70 shadow-[0_0_65px_rgba(6,182,212,0.55)] backdrop-blur-md flex items-center justify-center overflow-hidden">
            <img
              src="/assets/images/Home_white.png"
              alt="Hydro Home"
              className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(56,189,248,0.85)]"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/images/Home.png';
              }}
            />
          </div>

          {/* Destello de gota en el borde */}
          <motion.div
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/60"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </motion.div>
        </motion.div>

        {/* Título de la Marca con Letra Grande */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="flex items-center justify-center text-3xl sm:text-4xl font-extrabold tracking-widest mb-2"
        >
          <span className="text-white drop-shadow-md">HYDRO</span>
          <span className="text-cyan-400 ml-2 font-light">HOME</span>
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-sm sm:text-base text-slate-300 max-w-sm font-medium leading-relaxed mb-8"
        >
          Control Inteligente de Cisternas, Presión y Prevención de Fugas para tu Hogar
        </motion.p>

        {/* Contador Tacométrico y Barra de Telemetría */}
        <div className="w-full max-w-sm p-5 rounded-3xl bg-slate-900/75 border border-cyan-500/30 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-300 font-semibold truncate">
              <CurrentIcon className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
              <span className="truncate">{currentStepText}</span>
            </div>
            <span className="font-mono text-base sm:text-lg font-extrabold text-cyan-400 shrink-0">
              {displayValue}%
            </span>
          </div>

          {/* Barra de progreso animada */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.85)]"
              style={{ width: `${displayValue}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </div>
      </div>

      {/* Pie residencial */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 text-center font-mono text-xs text-slate-400 flex flex-wrap items-center justify-center gap-2"
      >
        <span>HYDRO INTELLIGENT HOME</span>
        <span>•</span>
        <span className="text-cyan-400 font-bold">PROTECCIÓN HÍDRICA RESIDENCIAL</span>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
