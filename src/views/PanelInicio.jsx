import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Home as HomeIcon,
  Power,
  Lock,
  Unlock,
  FileText,
  Headphones,
  Wrench,
  ShieldCheck,
  Truck,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimacionNivelCisterna } from '../components/animations/AnimacionNivelCisterna';
import { AnimacionFlujoAgua } from '../components/animations/AnimacionFlujoAgua';

export const PanelInicio = ({
  onNavigateToSystems,
  onNavigateToReports,
  onNavigateToChat,
  onNavigateToServices,
}) => {
  const {
    activeSystem,
    togglePump: globalTogglePump,
    toggleGeneralValve: globalToggleValve,
    addToast,
  } = useAuth();

  // =========================================================================
  // HOOKS DE ESTADO LOCAL SIMULADOS (Preparados para conexión con Backend/API)
  // =========================================================================
  const [cisternLevel, setCisternLevel] = useState(activeSystem?.level ?? 0.82);
  const [cisternCapacity] = useState(activeSystem?.capacity ?? 10000);
  const [pumpActive, setPumpActive] = useState(activeSystem?.pumpActive ?? true);
  const [pressure, setPressure] = useState(activeSystem?.pressure ?? 3.6);
  const [valveOpen, setValveOpen] = useState(activeSystem?.valveOpen ?? true);
  const [flowRate, setFlowRate] = useState(activeSystem?.flowRate ?? 14.5);
  const [isSimulatingLeak, setIsSimulatingLeak] = useState(false);

  // Sincronización reactiva ante cambios de vivienda o sistema
  useEffect(() => {
    if (activeSystem) {
      setCisternLevel(activeSystem.level ?? 0.82);
      setPumpActive(activeSystem.pumpActive ?? true);
      setPressure(activeSystem.pressure ?? 3.6);
      setValveOpen(activeSystem.valveOpen ?? true);
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

  // Manejador: Abrir o Cerrar la Válvula General de Paso
  const handleToggleValve = () => {
    const nextState = !valveOpen;
    setValveOpen(nextState);

    if (globalToggleValve && activeSystem?.id) {
      globalToggleValve(activeSystem.id);
    }

    addToast?.({
      title: nextState ? 'Válvula General Abierta' : 'Válvula General Cerrada',
      message: nextState
        ? 'Suministro de agua restaurado a la instalación.'
        : 'Cierre preventivo de paso de agua completado.',
      variant: nextState ? 'success' : 'danger',
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
    <div className="flex-1 flex flex-col bg-white dark:bg-[#07131F] rounded-t-[36px] min-h-[calc(100dvh-100px)] px-5 sm:px-6 pt-6 pb-32 sm:pb-36 shadow-xl transition-colors space-y-6 sm:space-y-7 no-scrollbar">
      {/* ============================================================== */}
      {/* 1. SECCIÓN DE BIENVENIDA                                       */}
      {/* ============================================================== */}
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Que rollo plebes <span className="animate-bounce inline-block">👋</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-snug break-words">
          Monitoreo predictivo y control de agua en tiempo real
        </p>
      </div>

      {/* ============================================================== */}
      {/* 2. FILA DE CONTROLES SUPERIORES (3 TARJETAS CON PADDING AMPLIO)*/}
      {/* ============================================================== */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
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

        {/* Botón 3: Cerrar / Abrir Válvula */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleToggleValve}
          className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2.5 hover:shadow-md cursor-pointer transition min-w-0 ${
            valveOpen
              ? 'bg-[#E6F7FF] dark:bg-[#00C2FF]/10 border-transparent dark:border-[#00C2FF]/20'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40'
          }`}
          title="Toca para alternar la válvula de paso general"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xs shrink-0 ${
              valveOpen
                ? 'bg-white dark:bg-[#00C2FF]/20 text-[#00C2FF]'
                : 'bg-white dark:bg-rose-900/50 text-rose-500'
            }`}
          >
            {valveOpen ? (
              <Unlock className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <div className="w-full min-w-0 space-y-1">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug break-words whitespace-normal">
              {valveOpen ? 'Cerrar Válvula' : 'Abrir Válvula'}
            </h4>
            <p
              className={`text-xs font-bold leading-snug break-words whitespace-normal ${
                valveOpen ? 'text-[#00C2FF]' : 'text-rose-500'
              }`}
            >
              {valveOpen ? 'Válvula Abierta' : 'Válvula Cerrada'}
            </p>
          </div>
        </motion.button>
      </div>

      {/* ============================================================== */}
      {/* 3. GRÁFICAS PRINCIPALES (SIEMPRE VISIBLES - SIN RECUADROS DOBLE)*/}
      {/* ============================================================== */}
      <div className="space-y-6">
        <AnimacionNivelCisterna
          initialLevel={cisternLevel}
          capacity={cisternCapacity}
          title={`Cisterna · ${activeSystem?.name || 'Residencia Central Admin'}`}
        />

        <AnimacionFlujoAgua initialFlowing={pumpActive && valveOpen} />
      </div>

      {/* ============================================================== */}
      {/* 4. MÓDULOS DE GESTIÓN (ARRIBA DE LOS BANNERS DE ACCIÓN)        */}
      {/* ============================================================== */}
      <div className="pt-2">
        <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white mb-4">
          Módulos de Gestión
        </h3>

        <div className="grid grid-cols-4 gap-3">
          {/* Módulo 1: Limpieza */}
          <div
            onClick={onNavigateToReports}
            className="flex flex-col items-center text-center gap-2 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-[#E6FFFB] dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug break-words whitespace-normal">
              Limpieza
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

          {/* Módulo 4: Soporte IA */}
          <div
            onClick={onNavigateToChat}
            className="flex flex-col items-center text-center gap-2 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-[#00C2FF]/10 dark:bg-[#00C2FF]/20 text-[#00C2FF] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug break-words whitespace-normal">
              Soporte IA
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. BANNERS DE ACCIÓN (DEBAJO DE MÓDULOS, SIN ALTURAS FIJAS)    */}
      {/* ============================================================== */}
      <div className="pt-2">
        <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white mb-4">
          Accesos Rápidos y Servicios
        </h3>

        <div className="grid grid-cols-1 gap-5">
          {/* Tarjeta 1 (Morada): Registro Histórico */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToReports}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-between gap-4 shadow-md shadow-purple-500/20 cursor-pointer transition"
          >
            <div className="flex-1 min-w-0 space-y-2.5">
              <span className="inline-block text-[11px] font-black px-3 py-1 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider">
                Auditoría Hídrica
              </span>
              <h4 className="text-lg sm:text-xl font-black leading-snug break-words whitespace-normal">
                Registro Histórico
              </h4>
              <p className="text-sm text-purple-100 font-medium leading-snug break-words whitespace-normal">
                Consulta de bitácoras, consumo diario y mantenimiento.
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black bg-white text-[#6D28D9] px-4 py-2 rounded-xl shadow-xs hover:bg-purple-50 transition">
                  <span>Solicitar Bitácora</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </span>
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-white fill-white/20" />
            </div>
          </motion.div>

          {/* Tarjeta 2 (Azul): Soporte Técnico */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToServices}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#00C2FF] to-[#0284C7] text-white flex items-center justify-between gap-4 shadow-md shadow-[#00C2FF]/20 cursor-pointer transition"
          >
            <div className="flex-1 min-w-0 space-y-2.5">
              <span className="inline-block text-[11px] font-black px-3 py-1 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider">
                Asistencia 24/7
              </span>
              <h4 className="text-lg sm:text-xl font-black leading-snug break-words whitespace-normal">
                Soporte Técnico
              </h4>
              <p className="text-sm text-sky-100 font-medium leading-snug break-words whitespace-normal">
                Asistencia técnica para reportar fugas, fallos de sensor y presión.
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black bg-white text-[#0284C7] px-4 py-2 rounded-xl shadow-xs hover:bg-sky-50 transition">
                  <span>Contactar Servicios</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </span>
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Headphones className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PanelInicio;
