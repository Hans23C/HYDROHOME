import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const PERIOD_OPTIONS = [
  {
    id: 'day',
    label: 'DÍA',
    image: '/assets/images/Dia.png',
  },
  {
    id: 'week',
    label: 'SEMANA',
    image: '/assets/images/Semana.png',
  },
  {
    id: 'month',
    label: 'MES',
    image: '/assets/images/Mes.png',
  },
];

export const SelectorPeriodoConsumo = ({
  selectedPeriod,
  onSelectPeriod,
  isCalendarOpen,
  onToggleCalendar,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center bg-white dark:bg-[#0E1A29] rounded-[28px] p-1.5 sm:p-2 shadow-md border border-slate-200/80 dark:border-slate-800 divide-x divide-slate-200/70 dark:divide-slate-800">
        {PERIOD_OPTIONS.map((opt) => {
          const isActive = selectedPeriod === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                if (isActive) {
                  onToggleCalendar();
                } else {
                  onSelectPeriod(opt.id);
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 sm:gap-2.5 py-2 px-2 sm:px-4 transition-all cursor-pointer select-none first:rounded-l-[22px] last:rounded-r-[22px] ${
                isActive
                  ? 'bg-cyan-50/90 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              aria-pressed={isActive}
            >
              <img
                src={opt.image}
                alt={opt.label}
                className={`w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 transition-transform ${
                  isActive ? 'scale-110' : 'opacity-85'
                }`}
              />
              <span className="font-black text-[11px] sm:text-xs tracking-wide uppercase">
                {opt.label}
              </span>
              {isActive && (
                <span className="text-cyan-600 dark:text-cyan-400 ml-0.5">
                  {isCalendarOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectorPeriodoConsumo;
