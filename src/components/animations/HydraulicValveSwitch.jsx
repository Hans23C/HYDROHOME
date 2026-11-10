import React, { useState } from 'react';
import { Power, Check, RefreshCw } from 'lucide-react';

/**
 * Interruptor táctil de válvula hidráulica inspirado en Jon Kantner (CSS mechanical micro-interactions).
 * Simula una perilla / palanca de válvula industrial con cambio de presión y feedback táctil.
 */
export const HydraulicValveSwitch = ({
  isOn = true,
  onToggle,
  label = 'Bypass Hidráulico',
  pressure = '3.8 bar',
}) => {
  const [active, setActive] = useState(isOn);
  const [isRotating, setIsRotating] = useState(false);

  const handleClick = () => {
    setIsRotating(true);
    const nextState = !active;
    setActive(nextState);
    if (onToggle) onToggle(nextState);

    setTimeout(() => {
      setIsRotating(false);
    }, 600);
  };

  return (
    <div
      onClick={handleClick}
      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-400/40 transition-all cursor-pointer flex items-center justify-between gap-3 group select-none"
    >
      <div className="flex items-center gap-3">
        {/* Perilla / Volante de Válvula Industrial */}
        <div className="relative">
          <div
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-md ${
              isRotating ? 'scale-110' : ''
            }`}
            style={{
              borderColor: active ? '#10B981' : '#64748B',
              backgroundColor: active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
              transform: isRotating ? (active ? 'rotate(180deg)' : 'rotate(-180deg)') : 'rotate(0deg)',
            }}
          >
            <Power
              className="w-4 h-4 transition-colors"
              style={{ color: active ? '#10B981' : '#94A3B8' }}
            />
          </div>

          {/* Luz LED indicadora */}
          <span
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 transition-colors"
            style={{
              backgroundColor: active ? '#10B981' : '#EF4444',
              boxShadow: active ? '0 0 8px #10B981' : '0 0 6px #EF4444',
            }}
          />
        </div>

        <div>
          <span className="font-bold text-xs text-slate-200 block group-hover:text-sky-300 transition-colors">
            {label}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Estado: <b style={{ color: active ? '#10B981' : '#EF4444' }}>{active ? 'ABIERTA / EN SERVICIO' : 'CERRADA / AISLADA'}</b>
          </span>
        </div>
      </div>

      {/* Indicador de Presión */}
      <div className="text-right">
        <span className="font-mono text-xs font-bold text-sky-400 block">
          {active ? pressure : '0.0 bar'}
        </span>
        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
          {active ? 'Presurizada' : 'Despresurizada'}
        </span>
      </div>
    </div>
  );
};
