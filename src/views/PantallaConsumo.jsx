import React, { useState } from 'react';
import {
  MapPin,
  Grid,
  List,
  BarChart3,
  DollarSign,
  ChevronDown,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GraficaPeriodoInteractiva } from '../components/charts/GraficaPeriodoInteractiva';

export const PantallaConsumo = () => {
  const { activeSystem } = useAuth();
  const sys = activeSystem || {
    name: 'Casa Principal',
    address: 'Av. Jacarandas #124, Jardines del Valle',
    dailyConsumption: 248,
    capacity: 5000,
  };

  const [selectedPeriod, setSelectedPeriod] = useState('day'); // 'day' | 'week' | 'month'
  const [viewLayout, setViewLayout] = useState('list'); // 'list' | 'grid'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periodOptions = [
    { id: 'day', label: 'Diario (Últimas 24h)' },
    { id: 'week', label: 'Semanal (Últimos 7 días)' },
    { id: 'month', label: 'Mensual (Noviembre 2026)' },
  ];

  const estimatedCost = ((sys.dailyConsumption * 30) / 1000 * 18.5).toFixed(2);

  // Las 3 tarjetas visualmente idénticas a Interfaz Nueva/Consumo.png
  const periodCards = [
    {
      id: 'day',
      title: 'GRAFICA POR DIA',
      badge: 'Active',
      badgeClass: 'bg-emerald-500 text-white shadow-emerald-500/30',
      date: 'Hoy, 12 de Noviembre',
      address: sys.address,
      metricValue: `${sys.dailyConsumption} L`,
      metricLabel: 'Hoy',
    },
    {
      id: 'week',
      title: 'GRAFICA POR SEMANA',
      badge: 'Semanal',
      badgeClass: 'bg-cyan-600 text-white shadow-cyan-500/30',
      date: 'Últimos 7 días móviles',
      address: sys.address,
      metricValue: `${((sys.dailyConsumption * 7) / 1000).toFixed(2)} m³`,
      metricLabel: '7 Días',
    },
    {
      id: 'month',
      title: 'GRAFICA POR MES',
      badge: 'Done',
      badgeClass: 'bg-slate-900 dark:bg-slate-700 text-white',
      date: 'Noviembre 2026',
      address: sys.address,
      metricValue: `${((sys.dailyConsumption * 30) / 1000).toFixed(1)} m³`,
      metricLabel: 'Mensual',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-5 sm:p-7 shadow-xl pb-28 text-slate-800 dark:text-slate-100">
      {/* 1. Barra de Controles Superiores (Selector de Periodo y Alternador Vista) */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 relative">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-cyan-500 transition cursor-pointer select-none"
          >
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
              {selectedPeriod === 'day' ? 'Por Día' : selectedPeriod === 'week' ? 'Por Semana' : 'Por Mes'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Menú desplegable */}
          {isDropdownOpen && (
            <div className="absolute top-11 left-0 z-30 w-52 p-1.5 rounded-2xl bg-white dark:bg-[#0E1A29] border border-slate-200 dark:border-slate-700 shadow-xl animate-fadeIn">
              {periodOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedPeriod(opt.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedPeriod === opt.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alternador de Diseño (Lista vs Cuadrícula) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setViewLayout('list')}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              viewLayout === 'list'
                ? 'bg-white dark:bg-[#132235] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Vista de lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewLayout('grid')}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              viewLayout === 'grid'
                ? 'bg-white dark:bg-[#132235] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Vista de cuadrícula"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Las 3 Tarjetas Visuales de Periodo (Exactas a Consumo.png) */}
      <div
        className={`mt-5 gap-4 ${
          viewLayout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'
        }`}
      >
        {periodCards.map((card) => {
          const isSelected = selectedPeriod === card.id;

          return (
            <div
              key={card.id}
              onClick={() => setSelectedPeriod(card.id)}
              className={`rounded-3xl border transition-all cursor-pointer overflow-hidden p-4 sm:p-5 flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'border-cyan-500 ring-2 ring-cyan-500/25 shadow-md bg-cyan-50/20 dark:bg-cyan-950/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0E1A29] hover:border-slate-300'
              }`}
            >
              {/* Miniatura Superior con Mapa y Pin de Ubicación */}
              <div className="relative w-full h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/70 dark:from-slate-800 dark:to-slate-900 overflow-hidden flex items-center justify-center p-3">
                {/* Cuadrícula isométrica que simula mapa */}
                <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#0284c71a_1px,transparent_1px),linear-gradient(to_bottom,#0284c71a_1px,transparent_1px)] bg-[size:16px_16px]" />

                <span
                  className={`absolute top-2.5 left-2.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${card.badgeClass}`}
                >
                  {card.badge}
                </span>

                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md animate-pulse">
                  <MapPin className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Título de la Gráfica y Lectura */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight">
                    {card.title}
                  </h4>
                  <span className="font-mono text-xs font-black text-cyan-600 dark:text-cyan-400">
                    {card.metricValue}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{card.date}</p>
              </div>

              {/* Ubicación y Estado de Selección */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{card.address}</span>
                </span>
                <span className="font-bold text-[11px] text-cyan-600 dark:text-cyan-400 shrink-0">
                  {isSelected ? 'Activa ▲' : 'Ver Gráfica ▼'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. GRÁFICA REACTIVA DE CONSUMO (Día, Semana y Mes) */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-500" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Gráfica Oficial ({selectedPeriod === 'day' ? 'Día' : selectedPeriod === 'week' ? 'Semana' : 'Mes'})
            </h3>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-black">
            <Layers className="w-3.5 h-3.5" />
            <span>Alternancia Dinámica</span>
          </div>
        </div>

        {/* Componente Modular de Gráfica por Periodo */}
        <GraficaPeriodoInteractiva period={selectedPeriod} systemName={sys.name} />
      </div>
    </div>
  );
};

export default PantallaConsumo;
