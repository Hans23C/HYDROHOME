import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const NordCalendar = ({ selectedDate, onSelectDate, className = '' }) => {
  const [currentDate, setCurrentDate] = useState(() => selectedDate ? new Date(selectedDate) : new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onSelectDate?.(today.toISOString().split('T')[0]);
  };

  // Primer día del mes (1 = lunes, 0 = domingo en getDay(), adaptamos a Lu=0, Do=6)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7; // Lu=0

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Matriz de días
  const days = [];
  // Días previos
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  // Días del mes
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, isCurrentMonth: true, dateStr });
  }
  // Días siguientes para completar 35 o 42 celdas
  const totalCells = days.length <= 35 ? 35 : 42;
  const remaining = totalCells - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className={`p-4 bg-slate-900/90 dark:bg-slate-900/90 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md text-slate-100 ${className}`}>
      {/* Cabecera del Calendario */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm tracking-wide text-white">
            {MONTH_NAMES[month]} {year}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToday}
            className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors mr-1"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAY_NAMES.map((d) => (
          <span key={d} className="text-[11px] font-semibold text-slate-400 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Rejilla de Días */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((item, idx) => {
          if (!item.isCurrentMonth) {
            return (
              <div
                key={idx}
                className="h-8 flex items-center justify-center text-xs text-slate-600 rounded-lg select-none"
              >
                {item.day}
              </div>
            );
          }

          const isSelected = selectedDate === item.dateStr;
          const isToday = todayStr === item.dateStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate?.(item.dateStr)}
              className={`h-8 text-xs font-medium rounded-lg flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/30'
                  : isToday
                  ? 'border border-cyan-400/80 text-cyan-300 hover:bg-slate-800 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NordCalendar;
