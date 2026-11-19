import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Home as HomeIcon,
  Power,
  AlertTriangle,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimacionNivelCisterna } from '../components/animations/AnimacionNivelCisterna';
import { AnimacionFlujoAgua } from '../components/animations/AnimacionFlujoAgua';
import { AppleEmoji } from '../components/common/AppleEmoji';

const SALUDOS_MEXICO_SINGULAR = [
  // Norte (Sinaloa, Sonora, Nuevo León, Chihuahua)
  { texto: '¡Qué rollo, plebe!', emoji: '🤙' },
  { texto: '¡Qué onda, compa!', emoji: '🤠' },
  { texto: '¡Qué tranza, pariente!', emoji: '🔥' },
  { texto: '¡Quiúbole, primo!', emoji: '😎' },
  // Centro / CDMX / EdoMéx
  { texto: '¡Qué onda, carnal!', emoji: '✌️' },
  { texto: '¡Qué transita por tus venas!', emoji: '⚡' },
  { texto: '¡Quiúbole, qué tal tu día!', emoji: '☀️' },
  { texto: '¡Qué milagro, qué gusto verte!', emoji: '🙌' },
  // Occidente / Bajío (Jalisco, Michoacán, Guanajuato)
  { texto: '¡Qué onda, mi chavo!', emoji: '😄' },
  { texto: '¡Qué hubo, paisano!', emoji: '🌵' },
  { texto: '¡Cómo andas, valedor!', emoji: '💪' },
  // Sur / Sureste (Yucatán, Veracruz, Oaxaca, Chiapas)
  { texto: '¡Qué onda, mi hermano!', emoji: '🌊' },
  { texto: '¡Hola, qué tal va todo!', emoji: '💧' },
  { texto: '¡Qué onda, amigo!', emoji: '👋' },
  { texto: '¡Buenas, listo para checar tu agua!', emoji: '🚰' },
];

const LAST_SALUDO_KEY = 'hydro_last_saludo_idx_v1';

const seleccionarSaludoSingular = () => {
  let prevIdx = -1;
  try {
    const saved = localStorage.getItem(LAST_SALUDO_KEY);
    if (saved !== null) prevIdx = Number(saved);
  } catch {
    prevIdx = -1;
  }

  let nextIdx = Math.floor(Math.random() * SALUDOS_MEXICO_SINGULAR.length);
  if (SALUDOS_MEXICO_SINGULAR.length > 1 && nextIdx === prevIdx) {
    nextIdx =
      (nextIdx +
        1 +
        Math.floor(Math.random() * (SALUDOS_MEXICO_SINGULAR.length - 1))) %
      SALUDOS_MEXICO_SINGULAR.length;
  }

  try {
    localStorage.setItem(LAST_SALUDO_KEY, String(nextIdx));
  } catch {
    // Ignorar error de almacenamiento
  }

  return SALUDOS_MEXICO_SINGULAR[nextIdx];
};

export const PanelInicio = ({
  onNavigateToSystems,
  onNavigateToReports,
  onNavigateToServices,
}) => {
  const {
    activeSystem,
    togglePump: globalTogglePump,
    addToast,
  } = useAuth();

  // =========================================================================
  // HOOKS DE ESTADO LOCAL SIMULADOS (Preparados para conexión con Backend/API)
  // =========================================================================
  const [cisternLevel, setCisternLevel] = useState(activeSystem?.level ?? 0.82);
  const [cisternCapacity] = useState(activeSystem?.capacity ?? 10000);
  const [pumpActive, setPumpActive] = useState(activeSystem?.pumpActive ?? true);
  const [pressure, setPressure] = useState(activeSystem?.pressure ?? 3.6);
  const [flowRate, setFlowRate] = useState(activeSystem?.flowRate ?? 14.5);
  const [isSimulatingLeak, setIsSimulatingLeak] = useState(false);
  const [saludoActual] = useState(() => seleccionarSaludoSingular());

  // Sincronización reactiva ante cambios de vivienda o sistema
  useEffect(() => {
    if (activeSystem) {
      setCisternLevel(activeSystem.level ?? 0.82);
      setPumpActive(activeSystem.pumpActive ?? true);
      setPressure(activeSystem.pressure ?? 3.6);
      setFlowRate(activeSystem.flowRate ?? 14.5);
    }
  }, [activeSystem]);

  // Manejador: Encender o Apagar la Bomba Presurizadora
  const handleTogglePump = () => {
    const nextState = !pumpActive;
    setPumpActive(nextState);
    setPressure(nextState ? 3.6 : 0.0);

    if (globalTogglePump && activeSystem?.id) {
      globalTogglePump(activeSystem.id, nextState ? 'auto' : 'off');
    }

    addToast?.({
      title: nextState ? 'Bomba Presurizadora Encendida' : 'Bomba Presurizadora Apagada',
      message: nextState
        ? 'Presión en línea estabilizada a 3.6 bar.'
        : 'Bomba en modo de reposo (0.0 bar).',
      variant: nextState ? 'info' : 'warning',
      duration: 3500,
    });
  };

  // Manejador: Simulación de Diagnóstico Acústico de Microfugas
  const handleTestLeak = () => {
    setIsSimulatingLeak(true);
    addToast?.({
      title: 'Diagnóstico de Fugas',
      message: 'Analizando variaciones de presión y estanqueidad en tuberías...',
      variant: 'info',
      duration: 3000,
    });

    setTimeout(() => {
      setIsSimulatingLeak(false);
      addToast?.({
        title: '✅ Sistema Hermético',
        message: 'No se detectaron fugas en la red de distribución.',
        variant: 'success',
        duration: 4000,
      });
    }, 1800);
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#07131F] rounded-t-[36px] px-5 sm:px-6 pt-6 pb-24 shadow-xl transition-colors space-y-6 sm:space-y-7 no-scrollbar">
      {/* ============================================================== */}
      {/* 1. SECCIÓN DE BIENVENIDA                                       */}
      {/* ============================================================== */}
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
          <span>{saludoActual.texto}</span>
          <AppleEmoji emoji={saludoActual.emoji} size={30} className="shrink-0" />
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-snug break-words">
          Monitoreo predictivo y control de agua en tiempo real
        </p>
      </div>

      {/* ============================================================== */}
      {/* 2. FILA DE CONTROLES SUPERIORES (2 TARJETAS SIMÉTRICAS)        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 gap-4">
        {/* Botón 1: Cambiar Sistema */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onNavigateToSystems}
          className="p-4 rounded-2xl bg-[#FFECE8] dark:bg-rose-950/30 border border-transparent dark:border-rose-900/30 flex flex-col items-center justify-center text-center gap-2.5 hover:shadow-md cursor-pointer transition min-w-0"
          title="Toca para cambiar de vivienda o sistema"
        >
          <div className="w-11 h-11 rounded-full bg-white dark:bg-rose-900/50 text-[#FF5B22] flex items-center justify-center shadow-xs shrink-0">
            <HomeIcon className="w-5 h-5 fill-[#FF5B22]/15" />
          </div>
          <div className="w-full min-w-0 space-y-1">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug break-words whitespace-normal">
              Cambiar Sistema
            </h4>
            <p className="text-xs text-[#FF5B22] dark:text-rose-400 font-bold leading-snug break-words whitespace-normal">
              Cisterna {Math.round(cisternLevel * 100)}%
            </p>
          </div>
        </motion.button>

        {/* Botón 2: Apagar / Encender Bomba */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleTogglePump}
          className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2.5 hover:shadow-md cursor-pointer transition min-w-0 ${
            pumpActive
              ? 'bg-[#FFF4E6] dark:bg-amber-950/30 border-transparent dark:border-amber-900/30'
              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
          }`}
          title="Toca para alternar la bomba presurizadora"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xs shrink-0 ${
              pumpActive
                ? 'bg-white dark:bg-amber-900/50 text-amber-500'
                : 'bg-white dark:bg-slate-700 text-slate-400'
            }`}
          >
            <Power className="w-5 h-5" />
          </div>
          <div className="w-full min-w-0 space-y-1">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug break-words whitespace-normal">
              {pumpActive ? 'Apagar Bomba' : 'Encender Bomba'}
            </h4>
            <p
              className={`text-xs font-bold leading-snug break-words whitespace-normal ${
                pumpActive
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {pumpActive ? `${pressure.toFixed(1)} bar · Activa` : '0.0 bar · Reposo'}
            </p>
          </div>
        </motion.button>
      </div>

      {/* ============================================================== */}
      {/* 3. MÓDULOS DE GESTIÓN (3 MÓDULOS DISTRIBUIDOS UNIFORMEMENTE)   */}
      {/* ============================================================== */}
      <div className="pt-2">
        <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white mb-4">
          Módulos de Gestión
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {/* Módulo 1: Incidencias (Averías en Tuberías) */}
          <div
            onClick={onNavigateToReports}
            className="flex flex-col items-center text-center gap-2 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-[#FFF4E6] dark:bg-amber-950/40 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug break-words whitespace-normal">
              Incidencias
            </span>
          </div>

          {/* Módulo 2: Fugas */}
          <div
            onClick={handleTestLeak}
            className="flex flex-col items-center text-center gap-2 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-[#E6F7FF] dark:bg-sky-950/40 text-sky-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug break-words whitespace-normal">
              {isSimulatingLeak ? 'Probando...' : 'Fugas'}
            </span>
          </div>

          {/* Módulo 3: Pipa */}
          <div
            onClick={onNavigateToServices}
            className="flex flex-col items-center text-center gap-2 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-[#F3EDFF] dark:bg-purple-950/40 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug break-words whitespace-normal">
              Pipa
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. GRÁFICAS PRINCIPALES (SIEMPRE VISIBLES - SIN RECUADROS DOBLE)*/}
      {/* ============================================================== */}
      <div className="space-y-6">
        <AnimacionNivelCisterna
          initialLevel={cisternLevel}
          capacity={cisternCapacity}
          title={`Cisterna · ${activeSystem?.name || 'Residencia Central Admin'}`}
        />

        <AnimacionFlujoAgua initialFlowing={pumpActive} />
      </div>
    </div>
  );
};

export default PanelInicio;
