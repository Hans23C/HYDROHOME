import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraficaPeriodoInteractiva } from '../components/charts/GraficaPeriodoInteractiva';
import { SelectorPeriodoConsumo } from '../components/consumo/SelectorPeriodoConsumo';
import {
  CalendarioConsumo,
  MOCK_CONSUMPTION_DATA,
  formatDateKey,
  getDayConsumptionInfo,
  getWeekBounds,
} from '../components/consumo/CalendarioConsumo';
import { GlowingBlueBox } from '../components/common/GlowingBlueBox';

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const getWeekRangeLabel = (date) => {
  const { start, end } = getWeekBounds(date);

  if (start.getMonth() === end.getMonth()) {
    return `Semana del ${start.getDate()} al ${end.getDate()} de ${MONTHS_ES[start.getMonth()]}`;
  }
  return `Semana del ${start.getDate()} ${MONTHS_ES[start.getMonth()].slice(0, 3)} al ${end.getDate()} ${MONTHS_ES[end.getMonth()].slice(0, 3)}`;
};

// Calcula la moda estadística (color predominante) de un arreglo de fechas
const getPredominantStatus = (dates) => {
  const counts = { good: 0, warning: 0, excess: 0 };

  dates.forEach((d) => {
    const info = getDayConsumptionInfo(d, MOCK_CONSUMPTION_DATA);
    if (info?.status && counts[info.status] !== undefined) {
      counts[info.status] += 1;
    }
  });

  // Prioridad de desempate: excess > warning > good
  const priorityOrder = ['excess', 'warning', 'good'];
  let bestStatus = 'good';
  let bestCount = -1;

  for (const status of priorityOrder) {
    if (counts[status] > bestCount) {
      bestCount = counts[status];
      bestStatus = status;
    }
  }

  return bestStatus;
};

export const PantallaConsumo = () => {
  const { activeSystem } = useAuth();
  const sys = activeSystem || {
    name: 'Casa Principal',
    address: 'Av. Jacarandas #124, Jardines del Valle',
    dailyConsumption: 248,
    capacity: 5000,
  };

  const [selectedPeriod, setSelectedPeriod] = useState('day'); // 'day' | 'week' | 'month'
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 10, 12)); // 12 Nov 2026
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  // Animación persistente e infinita mientras la tarjeta esté visible
  const [isGenerating, setIsGenerating] = useState(true);
  // Resplandor intenso durante los primeros 10 segundos tras interactuar con el calendario
  const [isIntense, setIsIntense] = useState(false);

  const chartSectionRef = useRef(null);
  const intenseTimeoutRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  const triggerIntenseAndScroll = useCallback((shouldRestart = false) => {
    if (intenseTimeoutRef.current) clearTimeout(intenseTimeoutRef.current);
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

    if (shouldRestart) {
      // Reinicia brevemente el ciclo visual al cambiar de pestaña
      setIsGenerating(false);
      restartTimeoutRef.current = setTimeout(() => {
        setIsGenerating(true);
      }, 60);
    } else {
      setIsGenerating(true);
    }

    setIsIntense(true);
    intenseTimeoutRef.current = setTimeout(() => {
      setIsIntense(false);
    }, 10000);

    setTimeout(() => {
      chartSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  }, []);

  useEffect(() => {
    return () => {
      if (intenseTimeoutRef.current) clearTimeout(intenseTimeoutRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, []);

  const handleSelectPeriod = (period) => {
    setSelectedPeriod(period);
    setIsCalendarOpen(true);
    triggerIntenseAndScroll(true);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    triggerIntenseAndScroll(false);
  };

  // Calcula el color dinámico del borde según Día, Semana (moda) o Mes (moda)
  const glowColor = useMemo(() => {
    if (selectedPeriod === 'day') {
      const info = getDayConsumptionInfo(selectedDate, MOCK_CONSUMPTION_DATA);
      return info?.status || 'good';
    }

    if (selectedPeriod === 'week') {
      const { start } = getWeekBounds(selectedDate);
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
      return getPredominantStatus(weekDates);
    }

    // Mes completo: calcula la moda de todos los días del mes seleccionado
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthDates = Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1)
    );
    return getPredominantStatus(monthDates);
  }, [selectedPeriod, selectedDate]);

  const selectedDayConsumption = useMemo(() => {
    const key = formatDateKey(selectedDate);
    if (MOCK_CONSUMPTION_DATA[key]) {
      return MOCK_CONSUMPTION_DATA[key].litros;
    }
    const factor = 0.85 + (((selectedDate.getDate() * 7 + selectedDate.getMonth() * 13) % 30) / 100);
    return Math.round(sys.dailyConsumption * factor);
  }, [selectedDate, sys.dailyConsumption]);

  // Configuración de la única tarjeta persistente según la pestaña activa (Día / Semana / Mes)
  const activeCard = useMemo(() => {
    const cardsByPeriod = {
      day: {
        id: 'day',
        title: 'GRÁFICA POR DÍA',
        badge: 'POR DÍA',
        badgeClass: 'bg-emerald-500 text-white shadow-emerald-500/30',
        date: `${selectedDate.getDate()} de ${MONTHS_ES[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}`,
        address: sys.address,
        metricValue: `${selectedDayConsumption} L`,
      },
      week: {
        id: 'week',
        title: 'GRÁFICA POR SEMANA',
        badge: 'POR SEMANA',
        badgeClass: 'bg-cyan-600 text-white shadow-cyan-500/30',
        date: getWeekRangeLabel(selectedDate),
        address: sys.address,
        metricValue: `${((selectedDayConsumption * 7) / 1000).toFixed(2)} m³`,
      },
      month: {
        id: 'month',
        title: 'GRÁFICA POR MES',
        badge: 'POR MES',
        badgeClass: 'bg-slate-900 dark:bg-slate-700 text-white',
        date: `${MONTHS_ES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`,
        address: sys.address,
        metricValue: `${((selectedDayConsumption * 30) / 1000).toFixed(1)} m³`,
      },
    };

    return cardsByPeriod[selectedPeriod] || cardsByPeriod.day;
  }, [selectedPeriod, selectedDate, selectedDayConsumption, sys.address]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-5 sm:p-7 shadow-xl pb-32 text-slate-800 dark:text-slate-100">
      {/* 1. Selector Superior (Día / Semana / Mes) + Calendario Dinámico */}
      <div className="pb-5 border-b border-slate-100 dark:border-slate-800">
        <SelectorPeriodoConsumo
          selectedPeriod={selectedPeriod}
          onSelectPeriod={handleSelectPeriod}
          isCalendarOpen={isCalendarOpen}
          onToggleCalendar={() => setIsCalendarOpen((prev) => !prev)}
        />

        {isCalendarOpen && (
          <CalendarioConsumo
            mode={selectedPeriod}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            consumptionData={MOCK_CONSUMPTION_DATA}
          />
        )}
      </div>

      {/* 2. Tarjeta Persistente de la Gráfica Activa envuelta en GlowingBlueBox */}
      <div className="mt-5">
        <GlowingBlueBox
          ref={chartSectionRef}
          isGenerating={isGenerating}
          glowColor={glowColor}
          isIntense={isIntense}
          className="scroll-mt-4"
        >
          <div className="p-4 sm:p-5 flex flex-col justify-between gap-4 bg-cyan-50/15 dark:bg-cyan-950/15">
            {/* Encabezado de Tarjeta: Etiqueta, Título y Lectura */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${activeCard.badgeClass}`}
                >
                  {activeCard.badge}
                </span>
                <span className="font-mono text-xs sm:text-sm font-black text-cyan-600 dark:text-cyan-400">
                  {activeCard.metricValue}
                </span>
              </div>

              <div>
                <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight">
                  {activeCard.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{activeCard.date}</p>
              </div>
            </div>

            {/* Gráfica Integrada */}
            <GraficaPeriodoInteractiva
              period={activeCard.id}
              systemName={sys.name}
              selectedDate={selectedDate}
            />

            {/* Pie de Tarjeta: Ubicación */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{activeCard.address}</span>
              </span>
            </div>
          </div>
        </GlowingBlueBox>
      </div>
    </div>
  );
};

export default PantallaConsumo;
