import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const GraficaPeriodoInteractiva = ({ period = 'day', systemName = 'Casa Principal' }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [rangeIndex, setRangeIndex] = useState(0); // Para filtros secundarios dentro del periodo

  // Datasets reales y calibrados según el periodo seleccionado (Día, Semana, Mes)
  const datasets = {
    day: {
      title: 'Consumo por Hora (Últimas 24h)',
      unit: 'L',
      data: [8.2, 5.1, 3.4, 2.1, 4.0, 12.5, 24.8, 38.2, 28.4, 18.2, 14.5, 19.8, 22.4, 16.2, 14.8, 21.3, 26.5, 34.2, 42.1, 31.8, 24.2, 18.5, 12.4, 9.8],
      labels: ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h', '24h'],
      ranges: ['24H', '12H', '6H'],
      scaleY: { min: 0, max: 50, steps: [0, 15, 30, 45] },
      costEstimate: '$12.50 MXN (Hoy)',
    },
    week: {
      title: 'Consumo Diario (Última Semana)',
      unit: 'm³',
      data: [205.1, 218.4, 222.0, 230.5, 210.8, 232.1, 248.2],
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      ranges: ['7D', '14D', '21D'],
      scaleY: { min: 160, max: 280, steps: [180, 210, 240, 270] },
      costEstimate: '$45.80 MXN (Esta Semana)',
    },
    month: {
      title: 'Consumo Mensual Acumulado',
      unit: 'm³',
      data: [
        210.2, 215.4, 218.0, 225.1, 228.4, 235.2, 220.1, 214.5, 228.7, 241.2,
        219.6, 263.4, 248.9, 201.2, 235.7, 248.2, 230.1, 224.5, 218.9, 235.0,
        240.2, 245.1, 252.0, 238.4, 229.1, 242.0, 250.4, 255.1, 248.2, 252.8
      ],
      labels: ['01/11', '05/11', '10/11', '15/11', '20/11', '25/11', '30/11'],
      ranges: ['Mes Activo', 'Mes Anterior'],
      scaleY: { min: 180, max: 280, steps: [190, 220, 250, 280] },
      costEstimate: '$137.64 MXN (Est. Mensual)',
    },
  };

  const currentDataset = datasets[period] || datasets.day;
  const data = currentDataset.data;
  const labels = currentDataset.labels;

  const currentVal = data[data.length - 1];
  const prevVal = data.length > 1 ? data[data.length - 2] : currentVal;
  const diffPercent = ((currentVal - prevVal) / prevVal) * 100;
  const isIncrease = diffPercent >= 0;

  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const max = Math.max(...data);
  const min = Math.min(...data);

  // Dimensiones SVG
  const svgWidth = 520;
  const svgHeight = 175;
  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const yMin = currentDataset.scaleY.min;
  const yMax = currentDataset.scaleY.max;

  const getX = (idx) => paddingLeft + (idx / (data.length - 1)) * chartW;
  const getY = (val) => paddingTop + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  // Curva Bézier fluida
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
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-[#0E1A29] border border-slate-200/80 dark:border-cyan-500/20 shadow-xs">
      {/* 1. Métrica Principal y Rango de Alternancia */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentVal.toFixed(1)} {currentDataset.unit}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                isIncrease
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(diffPercent).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Consumo registrado · vs periodo anterior
          </p>
        </div>

        {/* Costo Estimado en MXN */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-black shrink-0">
          <DollarSign className="w-4 h-4" />
          <span>{currentDataset.costEstimate}</span>
        </div>
      </div>

      {/* 2. Estadísticas Clave (Promedio, Pico Máx., Mínimo) */}
      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4 text-center">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-extrabold block">
            Promedio
          </span>
          <span className="font-mono text-xs sm:text-sm font-black text-cyan-600 dark:text-cyan-400">
            {avg.toFixed(1)} {currentDataset.unit}
          </span>
        </div>
        <div className="border-x border-cyan-500/20">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-extrabold block">
            Pico Máx.
          </span>
          <span className="font-mono text-xs sm:text-sm font-black text-amber-500 dark:text-amber-400">
            {max.toFixed(1)} {currentDataset.unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-extrabold block">
            Mínimo
          </span>
          <span className="font-mono text-xs sm:text-sm font-black text-emerald-500 dark:text-emerald-400">
            {min.toFixed(1)} {currentDataset.unit}
          </span>
        </div>
      </div>

      {/* 3. Gráfica SVG Dinámica con Gradientes Corporativos */}
      <div className="relative w-full h-[175px]">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="corpAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0077B6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0077B6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="corpLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00C2FF" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
          </defs>

          {/* Líneas Horizontales de Referencia */}
          {currentDataset.scaleY.steps.map((yVal) => (
            <g key={yVal}>
              <line
                x1={paddingLeft}
                y1={getY(yVal)}
                x2={svgWidth - paddingRight}
                y2={getY(yVal)}
                stroke="rgba(148, 163, 184, 0.2)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={getY(yVal) + 3}
                textAnchor="end"
                className="font-mono text-[9px] fill-slate-400 font-semibold"
              >
                {yVal}
              </text>
            </g>
          ))}

          {/* Área con relleno en gradiente */}
          <path d={areaD} fill="url(#corpAreaGrad)" />

          {/* Línea Principal del Gráfico */}
          <path d={pathD} fill="none" stroke="url(#corpLineGrad)" strokeWidth="3" strokeLinecap="round" />

          {/* Puntos de Datos y Picos */}
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
                  r={isHovered ? 6.5 : 5}
                  fill={isPeak ? '#F59E0B' : '#00C2FF'}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="transition-all cursor-pointer shadow-md"
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            }
            return (
              <circle
                key={idx}
                cx={getX(idx)}
                cy={getY(val)}
                r={2.5}
                fill="transparent"
                className="hover:fill-cyan-400 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Etiquetas Eje X */}
          {labels.map((lbl, idx) => {
            const xPos = paddingLeft + (idx / (labels.length - 1)) * chartW;
            return (
              <text
                key={idx}
                x={xPos}
                y={svgHeight - 8}
                textAnchor="middle"
                className="font-mono text-[9px] fill-slate-400 font-bold"
              >
                {lbl}
              </text>
            );
          })}
        </svg>

        {/* Tooltip Dinámico */}
        {hoveredPoint !== null && (
          <div
            className="absolute -top-3 p-2 rounded-xl bg-slate-900 border border-cyan-400/50 text-white text-xs shadow-xl pointer-events-none transform -translate-x-1/2 z-20"
            style={{ left: `${(getX(hoveredPoint) / svgWidth) * 100}%` }}
          >
            <span className="font-mono font-bold text-cyan-400 block">
              {data[hoveredPoint].toFixed(1)} {currentDataset.unit}
            </span>
          </div>
        )}
      </div>

      {/* Leyenda Inferior */}
      <div className="mt-3 flex items-center justify-end gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <span className="font-semibold">Consumo del periodo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="font-semibold">Pico máximo</span>
        </div>
      </div>
    </div>
  );
};

export default GraficaPeriodoInteractiva;
