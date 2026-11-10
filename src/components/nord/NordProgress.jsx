import React from 'react';
import { CheckCircle2, Clock, Wrench, ShieldCheck } from 'lucide-react';

export const REPAIR_STEPS = [
  { step: 1, percent: 25, label: 'Reportado', desc: 'Incidencia en bitácora', icon: Clock },
  { step: 2, percent: 50, label: 'Diagnóstico', desc: 'Inspección técnica', icon: Wrench },
  { step: 3, percent: 75, label: 'En Reparación', desc: 'Refacción autorizada', icon: ShieldCheck },
  { step: 4, percent: 100, label: 'Resuelto', desc: 'Flujo y presión verificados', icon: CheckCircle2 },
];

export const NordProgress = ({
  status = 'Pendiente',
  onStepChange,
  interactive = false,
}) => {
  const getPercent = () => {
    switch (status) {
      case 'Resuelto':
        return 100;
      case 'En proceso':
        return 75;
      case 'Diagnóstico':
        return 50;
      case 'Pendiente':
      default:
        return 25;
    }
  };

  const currentPercent = getPercent();

  const handleDotClick = (targetStep) => {
    if (!interactive || !onStepChange) return;
    if (targetStep === 1) onStepChange('Pendiente');
    else if (targetStep === 2) onStepChange('Diagnóstico');
    else if (targetStep === 3) onStepChange('En proceso');
    else if (targetStep === 4) onStepChange('Resuelto');
  };

  const getColor = () => {
    if (currentPercent === 100) return '#10B981';
    if (currentPercent >= 75) return '#0EA5E9';
    if (currentPercent >= 50) return '#F59E0B';
    return '#E11D48';
  };

  const color = getColor();

  return (
    <div className="space-y-2 py-1">
      {/* Barra de progreso de fondo */}
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="font-bold text-slate-300">Progreso de Reparación:</span>
        <span className="font-mono font-bold" style={{ color }}>
          {currentPercent}% · {status}
        </span>
      </div>

      <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${currentPercent}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* 4 Hitos / Pasos */}
      <div className="grid grid-cols-4 gap-1 pt-1">
        {REPAIR_STEPS.map((s) => {
          const isReached = currentPercent >= s.percent;
          const isCurrent = currentPercent === s.percent;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!interactive}
              onClick={() => handleDotClick(s.step)}
              className={`flex flex-col items-center text-center p-1 rounded-lg transition-all ${
                interactive ? 'hover:bg-slate-800/60 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full mb-1 flex items-center justify-center text-[8px] transition-all ${
                  isReached
                    ? 'text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}
                style={{
                  backgroundColor: isReached ? color : undefined,
                  boxShadow: isCurrent ? `0 0 10px ${color}` : undefined,
                }}
              >
                {isReached ? '✓' : s.step}
              </div>
              <span
                className={`text-[10px] font-bold block truncate max-w-full ${
                  isReached ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
