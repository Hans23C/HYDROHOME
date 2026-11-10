import React, { useState, useRef } from 'react';
import {
  Droplets,
  Activity,
  ShieldCheck,
  Zap,
  Power,
  Lock,
  Unlock,
  Sparkles,
  Home,
  Clock,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CisternLevelAnimation } from '../components/animations/CisternLevelAnimation';
import { WaterFlowAnimation } from '../components/animations/WaterFlowAnimation';

export const HomeDashboard = ({ onNavigateToReports }) => {
  const {
    activeSystem,
    togglePump,
    toggleGeneralValve,
    addToast,
  } = useAuth();

  const [isSimulatingLeak, setIsSimulatingLeak] = useState(false);
  const [activeKpiIndex, setActiveKpiIndex] = useState(0);
  const kpiScrollRef = useRef(null);

  const sys = activeSystem || {
    id: 'sys-01',
    name: 'Casa Principal',
    address: 'Av. Jacarandas #124',
    capacity: 5000,
    level: 0.68,
    pumpActive: true,
    pumpMode: 'auto',
    pressure: 3.2,
    flowRate: 14.5,
    valveOpen: true,
    dailyConsumption: 248,
    leakDetected: false,
    deviceId: 'ESP32-HYDRO-8492',
    status: 'online',
  };

  // Los 4 apartados de inicio que se muestran de 1 en 1 haciendo scroll
  const kpiCards = [
    {
      id: 'cisterna',
      title: 'Nivel de Cisterna',
      value: `${Math.round(sys.level * 100)}%`,
      badge: `Capacidad ${(sys.capacity / 1000).toFixed(0)}k L`,
      subtitle: `${Math.round(sys.capacity * sys.level).toLocaleString()} Litros disponibles en tu hogar`,
      icon: Activity,
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-500',
      badgeBg: 'text-sky-600 dark:text-sky-400 bg-sky-500/15',
    },
    {
      id: 'consumo',
      title: 'Consumo de Hoy',
      value: `${sys.dailyConsumption} L`,
      badge: 'Rango Normal',
      subtitle: 'Gasto acumulado del día en tu vivienda',
      icon: Droplets,
      iconBg: 'bg-sky-500/15 border-sky-500/30 text-sky-500',
      badgeBg: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15',
    },
    {
      id: 'presion',
      title: 'Presión de Red',
      value: `${sys.pressure} bar`,
      badge: 'Flujo Estable',
      subtitle: 'Presión óptima en regaderas y llaves',
      icon: Zap,
      iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-500',
      badgeBg: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15',
    },
    {
      id: 'smartleak',
      title: 'Smart Leak',
      value: '0 Fugas',
      badge: 'Hogar Protegido',
      subtitle: 'Monitoreo continuo sin goteos detectados',
      icon: ShieldCheck,
      iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-500',
      badgeBg: 'text-teal-600 dark:text-teal-400 bg-teal-500/15',
    },
  ];

  const handleKpiScroll = (e) => {
    const container = e.currentTarget;
    if (!container.clientWidth) return;
    const newIndex = Math.round(container.scrollLeft / container.clientWidth);
    if (newIndex >= 0 && newIndex < kpiCards.length && newIndex !== activeKpiIndex) {
      setActiveKpiIndex(newIndex);
    }
  };

  const scrollToKpi = (index) => {
    const clamped = Math.max(0, Math.min(kpiCards.length - 1, index));
    setActiveKpiIndex(clamped);
    if (kpiScrollRef.current) {
      kpiScrollRef.current.scrollTo({
        left: clamped * kpiScrollRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleTestLeakDetector = () => {
    setIsSimulatingLeak(true);
    addToast({
      title: 'Diagnóstico en Curso',
      message: 'Verificando presión en tuberías de ' + sys.name + '...',
      variant: 'info',
      duration: 5000,
    });

    setTimeout(() => {
      setIsSimulatingLeak(false);
      addToast({
        title: '✅ Sin Fugas Detectadas',
        message: 'Red hidráulica hermética y sin goteos.',
        variant: 'success',
        duration: 5000,
      });
    }, 2200);
  };

  const autonomyHours = Math.round((sys.capacity * sys.level) / (sys.dailyConsumption / 24));

  return (
    <div className="min-h-[calc(100dvh-145px)] flex flex-col justify-between gap-7 sm:gap-8 pb-20">
      {/* ============================================================== */}
      {/* 🏡 CABECERA DE MI SISTEMA (Sin lista de otros sistemas activos) */}
      {/* ============================================================== */}
      <div className="liquid-glass p-5 sm:p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-500 flex items-center justify-center shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
              {sys.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {sys.address}
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Activo
        </span>
      </div>

      {/* ============================================================== */}
      {/* 📊 CARRUSEL DE SCROLL: 1 SOLO RECUADRO VISIBLE A LA VEZ        */}
      {/* (Nivel de Cisterna → Consumo de Hoy → Presión de Red → SmartLeak) */}
      {/* ============================================================== */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Indicadores de tu Hogar
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300 font-bold">
              {activeKpiIndex + 1} / {kpiCards.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Desliza para ver más
            </span>
            <button
              type="button"
              onClick={() => scrollToKpi(activeKpiIndex - 1)}
              disabled={activeKpiIndex === 0}
              className="w-9 h-9 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-sky-400/25 flex items-center justify-center disabled:opacity-35 hover:bg-sky-500/20 transition cursor-pointer"
              title="Anterior recuadro"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToKpi(activeKpiIndex + 1)}
              disabled={activeKpiIndex === kpiCards.length - 1}
              className="w-9 h-9 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-sky-400/25 flex items-center justify-center disabled:opacity-35 hover:bg-sky-500/20 transition cursor-pointer"
              title="Siguiente recuadro"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenedor Scroll Horizontal con Snap de 1 tarjeta al 100% de ancho */}
        <div
          ref={kpiScrollRef}
          onScroll={handleKpiScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-5 pb-1"
        >
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="min-w-full w-full shrink-0 snap-center liquid-glass p-6 sm:p-8 flex flex-col justify-between gap-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center shrink-0 ${card.iconBg}`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-200 block">
                        {card.title}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 block mt-0.5">
                        {card.subtitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-xl shrink-0 ${card.badgeBg}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-sky-400/15 flex items-baseline justify-between">
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-sky-600 dark:text-sky-400">
                    Desliza para cambiar →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Puntos indicadores de scroll */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          {kpiCards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              onClick={() => scrollToKpi(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === activeKpiIndex
                  ? 'w-8 bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.6)]'
                  : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-sky-400/50'
              }`}
              title={card.title}
            />
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🌊 SECCIÓN PRINCIPAL CON MAYOR ESPACIADO ENTRE RECUADROS       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8">
        {/* Columna Izquierda: Tanque de Agua y Tubería */}
        <div className="lg:col-span-7 space-y-7 sm:space-y-8">
          <CisternLevelAnimation
            initialLevel={sys.level}
            capacity={sys.capacity}
            title={`Cisterna · ${sys.name}`}
          />

          <WaterFlowAnimation />
        </div>

        {/* Columna Derecha: Controles Inteligentes Espaciados */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-7 sm:gap-8">
          <div className="liquid-glass p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Controles del Hogar
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* Válvula General / Modo Vacaciones */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-[#0B1928] border border-slate-200 dark:border-sky-400/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      sys.valveOpen
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-rose-500/15 text-rose-500'
                    }`}
                  >
                    {sys.valveOpen ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      Válvula General
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {sys.valveOpen ? 'Abierta · Paso normal' : 'Cerrada · Vacaciones'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleGeneralValve(sys.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
                    sys.valveOpen
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-400/30'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {sys.valveOpen ? 'Cerrar Paso' : 'Abrir Paso'}
                </button>
              </div>

              {/* Bomba Presurizadora */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-[#0B1928] border border-slate-200 dark:border-sky-400/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      sys.pumpActive
                        ? 'bg-sky-500/15 text-sky-500'
                        : 'bg-slate-500/15 text-slate-400'
                    }`}
                  >
                    <Power className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      Bomba Presurizadora
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {sys.pumpActive ? 'En servicio (3.2 bar)' : 'En pausa'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => togglePump(sys.id, sys.pumpActive ? 'off' : 'auto')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
                    sys.pumpActive
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-400/30'
                      : 'bg-sky-600 text-white'
                  }`}
                >
                  {sys.pumpActive ? 'Pausar' : 'Encender'}
                </button>
              </div>

              {/* Detector de Fugas */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-[#0B1928] border border-slate-200 dark:border-sky-400/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      Test de Tuberías
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Diagnóstico de microfugas
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTestLeakDetector}
                  disabled={isSimulatingLeak}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white transition shrink-0 cursor-pointer"
                >
                  {isSimulatingLeak ? 'Analizando...' : 'Verificar'}
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta Espaciada de Autonomía */}
          <div className="liquid-glass p-5 sm:p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block truncate">
                  Reserva: ~{autonomyHours} horas de agua
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                  Autonomía estimada del hogar
                </span>
              </div>
            </div>

            <button
              onClick={onNavigateToReports}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Bitácora</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
