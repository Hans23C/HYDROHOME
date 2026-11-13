import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const GraficaConsumo = () => {
  const [rangeIndex, setRangeIndex] = useState(1); // 0: 7D, 1: 14D, 2: 21D
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const allData = [
    205.1, 218.4, 222.0, 230.5, 210.8, 204.3, 219.0,
    215.4, 228.7, 241.2, 195.8, 187.3, 232.1, 256.8,
    244.5, 219.6, 263.4, 248.9, 201.2, 235.7, 248.2,
  ];

  const allLabels = [
    '22/9', '23/9', '24/9', '25/9', '26/9', '27/9', '28/9',
    '29/9', '30/9', '01/10', '02/10', '03/10', '04/10', '05/10',
    '06/10', '07/10', '08/10', '09/10', '10/10', '11/10', '12/10',
  ];

  const data = rangeIndex === 0 ? allData.slice(-7) : (rangeIndex === 1 ? allData.slice(-14) : allData);
  const labels = rangeIndex === 0 ? allLabels.slice(-7) : (rangeIndex === 1 ? allLabels.slice(-14) : allLabels);

  const today = data[data.length - 1];
  const yesterday = data.length > 1 ? data[data.length - 2] : today;
  const diffPercent = ((today - yesterday) / yesterday) * 100;
  const isIncrease = diffPercent >= 0;

  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const max = Math.max(...data);
  const min = Math.min(...data);

  // Dimensiones SVG
  const svgWidth = 520;
  const svgHeight = 180;
  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const yMin = 160;
  const yMax = 280;

  const getX = (idx) => paddingLeft + (idx / (data.length - 1)) * chartW;
  const getY = (val) => paddingTop + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  // Generar curva suave bezier
  let pathD = `M ${getX(0)} ${getY(data[0])}`;
  for (let i = 0; i < data.length - 1; i++) {
    const x0 = getX(i);
    const y0 = getY(data[i]);
    const x1 = getX(i + 1);
    const y1 = getY(data[i + 1]);
    const mx = (x0 + x1) / 2;
    pathD += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }

  const areaD = `${pathD} L ${getX(data.length - 1)} ${paddingTop + chartH} L ${getX(0)} ${paddingTop + chartH} Z`;

  return (
    <div className="liquid-glass p-5 sm:p-6 rounded-3xl w-full shadow-sm">
      {/* Cabecera y Rango */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
              {today.toFixed(1)} m³
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 ${
                isIncrease ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(diffPercent).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Consumo registrado hoy · vs día anterior</p>
        </div>

        {/* Selector de Rango */}
        <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50">
          {['7D', '14D', '21D'].map((range, idx) => (
            <button
              key={range}
              onClick={() => setRangeIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                rangeIndex === idx
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Mini Resumen de Estadísticas */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-sky-500/10 border border-sky-400/20 mb-4 text-center">
        <div>
          <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">Promedio</span>
          <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">{avg.toFixed(1)} m³</span>
        </div>
        <div className="border-x border-sky-400/20">
          <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">Pico Máx.</span>
          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">{max.toFixed(1)} m³</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">Mínimo</span>
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{min.toFixed(1)} m³</span>
        </div>
      </div>

      {/* Gráfica SVG Reactiva */}
      <div className="relative w-full h-[180px]">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#087FAD" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#087FAD" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>

          {/* Líneas horizontales de referencia */}
          {[180, 210, 240, 270].map((yVal) => (
            <g key={yVal}>
              <line
                x1={paddingLeft}
                y1={getY(yVal)}
                x2={svgWidth - paddingRight}
                y2={getY(yVal)}
                stroke="rgba(148, 163, 184, 0.15)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={getY(yVal) + 3}
                textAnchor="end"
                className="font-mono text-[9px] fill-slate-500"
              >
                {yVal}
              </text>
            </g>
          ))}

          {/* Área sombreada */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Línea principal */}
          <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" />

          {/* Puntos destacados */}
          {data.map((val, idx) => {
            const isPeak = val === max;
            const isLast = idx === data.length - 1;
            const isHovered = hoveredPoint === idx;

            if (isPeak || isLast || isHovered) {
              return (
                <circle
                  key={idx}
                  cx={getX(idx)}
                  cy={getY(val)}
                  r={isHovered ? 6 : 4.5}
                  fill={isPeak ? '#F59E0B' : '#087FAD'}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="transition-all cursor-pointer"
                />
              );
            }
            return (
              <circle
                key={idx}
                cx={getX(idx)}
                cy={getY(val)}
                r={3}
                fill="transparent"
                className="hover:fill-sky-400 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Etiquetas Eje X */}
          {labels.map((lbl, idx) => {
            if (rangeIndex !== 0 && idx % 2 !== 0 && idx !== labels.length - 1) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={svgHeight - 8}
                textAnchor="middle"
                className="font-mono text-[9px] fill-slate-400 font-medium"
              >
                {lbl}
              </text>
            );
          })}
        </svg>

        {/* Tooltip flotante si se hace hover */}
        {hoveredPoint !== null && (
          <div
            className="absolute -top-3 p-2 rounded-lg bg-slate-900 border border-sky-400/40 text-xs shadow-xl pointer-events-none transform -translate-x-1/2 z-20"
            style={{ left: `${(getX(hoveredPoint) / svgWidth) * 100}%` }}
          >
            <span className="font-mono font-bold text-sky-400 block">{data[hoveredPoint].toFixed(1)} m³</span>
            <span className="text-[10px] text-slate-400">{labels[hoveredPoint]}</span>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-3 flex items-center justify-end gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-700/30">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>Consumo diario</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Pico máximo</span>
        </div>
      </div>
    </div>
  );
};
