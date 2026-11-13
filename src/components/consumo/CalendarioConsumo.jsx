import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Datos de prueba (mock data) de consumo diario monitoreado
// 'good' = Verde (normal), 'warning' = Amarillo (un poco sobrepasado), 'excess' = Rojo (excesivo / alerta)
export const MOCK_CONSUMPTION_DATA = {
  '2026-11-01': { litros: 195, status: 'good' },
  '2026-11-02': { litros: 210, status: 'good' },
  '2026-11-03': { litros: 275, status: 'warning' },
  '2026-11-04': { litros: 220, status: 'good' },
  '2026-11-05': { litros: 340, status: 'excess' },
  '2026-11-06': { litros: 205, status: 'good' },
  '2026-11-07': { litros: 285, status: 'warning' },
  '2026-11-08': { litros: 190, status: 'good' },
  '2026-11-09': { litros: 230, status: 'good' },
  '2026-11-10': { litros: 365, status: 'excess' },
  '2026-11-11': { litros: 260, status: 'warning' },
  '2026-11-12': { litros: 248, status: 'good' },
};

export const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getWeekBounds = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 (Dom) .. 6 (Sáb)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

export const getDayConsumptionInfo = (date, consumptionMap = MOCK_CONSUMPTION_DATA) => {
  const key = formatDateKey(date);
  if (consumptionMap[key]) return consumptionMap[key];

  // Para otros meses/días anteriores a hoy, generamos estado determinístico para visualizar el calendario
  const today = new Date();
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  if (date > todayEnd) return null;

  const seed = (date.getFullYear() * 31 + (date.getMonth() + 1) * 17 + date.getDate() * 13) % 10;
  if (seed <= 5) return { litros: 195 + seed * 10, status: 'good' };
  if (seed <= 7) return { litros: 265 + seed * 5, status: 'warning' };
  return { litros: 320 + seed * 6, status: 'excess' };
};

const STATUS_DOT_CLASSES = {
  good: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]',
  warning: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]',
  excess: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]',
};

export const CalendarioConsumo = ({
  mode = 'day',
  selectedDate,
  onSelectDate,
  consumptionData = MOCK_CONSUMPTION_DATA,
}) => {
  const [viewDate, setViewDate] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  useEffect(() => {
    setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Días del mes anterior
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        inCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        date: new Date(year, month, d),
        inCurrentMonth: true,
      });
    }

    // Relleno final para completar filas de 7 días
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        date: new Date(year, month + 1, d),
        inCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  const weekBounds = useMemo(() => getWeekBounds(selectedDate), [selectedDate]);

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setViewDate(prev);
    if (mode === 'month') {
      onSelectDate(prev);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setViewDate(next);
    if (mode === 'month') {
      onSelectDate(next);
    }
  };

  return (
    <div className="mt-3 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0E1A29] border border-slate-200/90 dark:border-slate-800 shadow-lg transition-colors">
      {/* Cabecera: Mes, Año y Botones de Navegación */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {MONTHS_ES[month]}, {year}
          </h3>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {mode === 'day' && 'Toca un día para ver su consumo'}
            {mode === 'week' && 'Toca cualquier día para seleccionar la semana completa'}
            {mode === 'month' && 'Mes completo seleccionado'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 dark:bg-[#132235] border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 shadow-xs transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 dark:bg-[#132235] border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 shadow-xs transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {WEEKDAYS.map((dayName) => (
          <span
            key={dayName}
            className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 py-1"
          >
            {dayName}
          </span>
        ))}
      </div>

      {/* Cuadrícula de Días */}
      <div className="grid grid-cols-7 gap-y-1.5">
        {calendarDays.map(({ date, inCurrentMonth }) => {
          const isSelectedDay = isSameDay(date, selectedDate);
          const inSelectedWeek =
            mode === 'week' &&
            date >= weekBounds.start &&
            date <= weekBounds.end;
          const isWeekStart = mode === 'week' && isSameDay(date, weekBounds.start);
          const isWeekEnd = mode === 'week' && isSameDay(date, weekBounds.end);

          const inSelectedMonth =
            mode === 'month' &&
            inCurrentMonth &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();

          const dayInfo = inCurrentMonth ? getDayConsumptionInfo(date, consumptionData) : null;

          // Clases de contenedor para resaltar semana o mes completo
          let wrapperClass = 'flex items-center justify-center py-0.5 ';
          if (inSelectedWeek) {
            wrapperClass += 'bg-cyan-500/15 dark:bg-cyan-500/25 ';
            if (isWeekStart) wrapperClass += 'rounded-l-full ';
            if (isWeekEnd) wrapperClass += 'rounded-r-full ';
          } else if (inSelectedMonth) {
            wrapperClass += 'bg-cyan-500/10 dark:bg-cyan-500/15 rounded-xl ';
          }

          // Clases del botón de día
          let dayBtnClass =
            'relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center text-xs sm:text-sm font-bold transition cursor-pointer select-none ';

          if (mode === 'day' && isSelectedDay) {
            dayBtnClass += 'bg-cyan-500 text-white shadow-md shadow-cyan-500/35 scale-105 ';
          } else if (mode === 'week' && isSelectedDay) {
            dayBtnClass += 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30 ';
          } else if (mode === 'month' && isSelectedDay) {
            dayBtnClass += 'bg-cyan-500 text-white shadow-sm ';
          } else if (inSelectedWeek || inSelectedMonth) {
            dayBtnClass += 'text-cyan-800 dark:text-cyan-200 hover:bg-cyan-500/20 ';
          } else if (inCurrentMonth) {
            dayBtnClass +=
              'text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 ';
          } else {
            dayBtnClass += 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 ';
          }

          return (
            <div key={date.toISOString()} className={wrapperClass}>
              <button
                type="button"
                onClick={() => onSelectDate(date)}
                title={
                  dayInfo
                    ? `${date.getDate()} ${MONTHS_ES[date.getMonth()]}: ${dayInfo.litros} L`
                    : `${date.getDate()} ${MONTHS_ES[date.getMonth()]}`
                }
                className={dayBtnClass}
              >
                <span className="leading-none">{date.getDate()}</span>
                {dayInfo && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      STATUS_DOT_CLASSES[dayInfo.status] || STATUS_DOT_CLASSES.good
                    }`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Leyenda de Indicadores de Consumo */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          Sobrepasado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          Excesivo / Alerta
        </span>
      </div>
    </div>
  );
};

export default CalendarioConsumo;
