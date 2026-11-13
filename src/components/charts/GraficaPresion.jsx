import React, { useState } from 'react';

export const GraficaPresion = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(0); // 0: Turno actual, 1: Últimas 24h
  const [hoveredBar, setHoveredBar] = useState(null);

  const pressureTurno = [4.5, 3.1, 1.8, 4.2, 4.4, 0.0];
  const pressure24h = [4.3, 3.4, 2.2, 4.1, 4.2, 0.0];

  const zoneLabels = ['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06'];
  const zoneNames = ['Cisterna', 'Bomba', 'Planta Baja', 'Planta Alta', 'Regaderas', 'Jardín'];

  const currentData = selectedPeriod === 0 ? pressureTurno : pressure24h;
  const targetPressure = 4.0;

  const active = currentData.filter((p) => p > 0);
  const avgPressure = active.length > 0 ? active.reduce((a, b) => a + b, 0) / active.length : 0.0;

  const optimalCount = currentData.filter((p) => p >= targetPressure).length;
  const warningCount = currentData.filter((p) => p >= 2.5 && p < targetPressure).length;
  const criticalCount = currentData.filter((p) => p > 0 && p < 2.5).length;
  const offCount = currentData.filter((p) => p === 0).length;

  const svgWidth = 500;
  const svgHeight = 180;
  const paddingTop = 24;
  const paddingBottom = 30;
  const paddingLeft = 32;
  const paddingRight = 16;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const yMax = 6.0;

  const getY = (val) => paddingTop + chartH - (val / yMax) * chartH;
  const barWidth = 32;

  const getBarColor = (val) => {
    if (val === 0) return { grad: ['#94A3B8', '#64748B'], status: 'Inactivo' };
    if (val < 2.5) return { grad: ['#EF4444', '#B91C1C'], status: 'Crítico' };
    if (val < targetPressure) return { grad: ['#F59E0B', '#D97706'], status: 'Atención' };
    return { grad: ['#10B981', '#047857'], status: 'Óptimo' };
  };

  return (
    <div className="liquid-glass p-5">
      {/* Cabecera y Switch */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
              {avgPressure.toFixed(2)}
            </span>
            <span className="font-mono text-sm text-slate-500 dark:text-slate-400 font-bold">bar</span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                avgPressure >= targetPressure
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}
            >
              {avgPressure >= targetPressure ? 'En Rango' : 'Alerta Leve'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Presión promedio en la red hidráulica del hogar</p>
        </div>

        {/* Selector de Periodo */}
        <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50">
          {['Turno actual', 'Últimas 24h'].map((p, idx) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedPeriod === idx
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfica de Barras SVG */}
      <div className="relative w-full h-[180px]">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            {currentData.map((val, idx) => {
              const { grad } = getBarColor(val);
              return (
                <linearGradient key={idx} id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={grad[0]} />
                  <stop offset="100%" stopColor={grad[1]} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Líneas guía horizontales */}
          {[2, 4, 6].map((gridY) => (
            <g key={gridY}>
              <line
                x1={paddingLeft}
                y1={getY(gridY)}
                x2={svgWidth - paddingRight}
                y2={getY(gridY)}
                stroke="rgba(148, 163, 184, 0.15)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={getY(gridY) + 3}
                textAnchor="end"
                className="font-mono text-[9px] fill-slate-500"
              >
                {gridY}
              </text>
            </g>
          ))}

          {/* Línea Meta 4.0 bar */}
          <line
            x1={paddingLeft}
            y1={getY(targetPressure)}
            x2={svgWidth - paddingRight}
            y2={getY(targetPressure)}
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <text
            x={svgWidth - paddingRight}
            y={getY(targetPressure) - 5}
            textAnchor="end"
            className="font-mono text-[9px] font-bold fill-emerald-400"
          >
            Meta 4.0 bar
          </text>

          {/* Barras de Zonas */}
          {currentData.map((val, idx) => {
            const step = chartW / currentData.length;
            const x = paddingLeft + idx * step + (step - barWidth) / 2;
            const barH = (val / yMax) * chartH;
            const y = paddingTop + chartH - barH;
            const bgH = chartH;
            const bgY = paddingTop;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Fondo translúcido de la columna */}
                <rect
                  x={x}
                  y={bgY}
                  width={barWidth}
                  height={bgH}
                  rx="6"
                  fill="rgba(148, 163, 184, 0.08)"
                />

                {/* Barra activa con gradiente */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="6"
                  fill={`url(#barGrad-${idx})`}
                  className="transition-all hover:opacity-90"
                />

                {/* Valor numérico encima de la barra */}
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="font-mono text-[10px] font-bold fill-slate-700 dark:fill-slate-300"
                >
                  {val.toFixed(1)}
                </text>

                {/* Etiqueta Eje X */}
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className="font-mono text-[10px] fill-slate-600 dark:fill-slate-400 font-semibold"
                >
                  {zoneLabels[idx]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip flotante */}
        {hoveredBar !== null && (
          <div
            className="absolute -top-3 p-2 rounded-lg bg-slate-900 border border-sky-400/40 text-xs shadow-xl pointer-events-none transform -translate-x-1/2 z-20"
            style={{
              left: `${
                ((paddingLeft + hoveredBar * (chartW / currentData.length) + (chartW / currentData.length) / 2) /
                  svgWidth) *
                100
              }%`,
            }}
          >
            <span className="font-bold text-slate-200 block">
              {zoneLabels[hoveredBar]} ({zoneNames[hoveredBar]})
            </span>
            <span className="font-mono font-bold text-sky-400">
              {currentData[hoveredBar].toFixed(1)} bar · {getBarColor(currentData[hoveredBar]).status}
            </span>
          </div>
        )}
      </div>

      {/* Píldoras de Estado */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs pt-2 border-t border-slate-700/30">
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Óptimo ({optimalCount})
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Atención ({warningCount})
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" /> Crítico ({criticalCount})
        </span>
        {offCount > 0 && (
          <span className="px-2.5 py-1 rounded-lg bg-slate-500/15 text-slate-400 border border-slate-500/30 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Inactivo ({offCount})
          </span>
        )}
      </div>
    </div>
  );
};
