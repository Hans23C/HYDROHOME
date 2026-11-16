import React, { useState, useEffect } from 'react';
import {
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerReportes, guardarReporte } from '../services/reportsService';

const OPCIONES_AVERIA = [
  'Fisura en Codo de PVC Hidráulico (Línea Principal)',
  'Obstrucción por Sarro en Válvula Check de Bomba',
  'Desacople en Tubería de Alimentación a Tinaco',
  'Fuga en Unión Roscada de Medidor o Toma',
  'Daño en Tubería Subterránea por Sobrepresión',
];

export const PantallaReportes = () => {
  const { user, activeSystem, addNotification, addToast } = useAuth();

  const [incidents, setIncidents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('todos'); // 'todos' | 'activos' | 'reparados'
  const [selectedSystem, setSelectedSystem] = useState('INC-101 · Casa Principal');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario de nuevo reporte de avería en tubería
  const [damageTitle, setDamageTitle] = useState(OPCIONES_AVERIA[0]);
  const [targetSystem, setTargetSystem] = useState(
    activeSystem?.name || 'Casa Principal'
  );
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Alta');

  useEffect(() => {
    setIncidents(obtenerReportes());
  }, []);

  const handleCreateIncident = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const created = guardarReporte({
      title: damageTitle,
      systemName: targetSystem,
      category: 'Red Hidráulica',
      description: description.trim(),
      severity: urgency,
      author: user?.name || 'Jesús Vásquez Granda',
    });

    setIncidents((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setDescription('');

    addToast({
      title: 'Incidencia Registrada',
      message: `Folio ${created.id} generado para ${created.systemName}.`,
      variant: 'success',
      duration: 5000,
    });

    addNotification({
      title: 'Avería en Tubería Reportada',
      message: `${created.id}: ${created.title}`,
      category: 'incidencia',
      type: 'warning',
      systemName: created.systemName,
    });
  };

  const countTodos = incidents.length;
  const countActivos = incidents.filter(
    (item) => item.status === 'En Revisión'
  ).length;
  const countReparados = incidents.filter(
    (item) => item.status === 'Reparado'
  ).length;

  const filteredIncidents = incidents.filter((item) => {
    if (activeFilter === 'activos' && item.status !== 'En Revisión') {
      return false;
    }
    if (activeFilter === 'reparados' && item.status !== 'Reparado') {
      return false;
    }
    if (selectedSystem === 'INC-102 · Casa de Campo') {
      return item.systemName.toLowerCase().includes('campo');
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-5 sm:p-6 pb-28 text-slate-800 dark:text-slate-100 space-y-5">
      {/* ============================================================== */}
      {/* 1. CABECERA DEL APARTADO DE AVERÍAS EN TUBERÍAS                */}
      {/* ============================================================== */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Averías en Tuberías
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Monitoreo de fallas estructurales, caídas de presión y reparaciones en la red hidráulica.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#2563EB] hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/25 shrink-0 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. FILTROS DE ESTADO Y SELECTOR DE VIVIENDA                    */}
      {/* ============================================================== */}
      <div className="space-y-3">
        {/* Pestañas de estado: Todos (3), Activos (1), Reparados (2) */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0E1E32] border border-slate-200/70 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => setActiveFilter('todos')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeFilter === 'todos'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            Todos ({countTodos})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('activos')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeFilter === 'activos'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            Activos ({countActivos})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('reparados')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeFilter === 'reparados'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            Reparados ({countReparados})
          </button>
        </div>

        {/* Selector de sistema/vivienda */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {['INC-101 · Casa Principal', 'INC-102 · Casa de Campo'].map(
            (sysOption) => {
              const isSelected = selectedSystem === sysOption;
              return (
                <button
                  key={sysOption}
                  type="button"
                  onClick={() => setSelectedSystem(sysOption)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-600/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-50 dark:bg-[#0E1E32] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {sysOption}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. TARJETAS TÉCNICAS DE INCIDENCIAS Y AVERÍAS EN TUBERÍAS      */}
      {/* ============================================================== */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-[#0E1E32]">
            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Sin incidencias registradas para este filtro
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              La red hidráulica seleccionada no presenta averías en esta categoría.
            </p>
          </div>
        ) : (
          filteredIncidents.map((inc) => {
            const isEnRevision = inc.status === 'En Revisión';
            return (
              <div
                key={inc.id}
                className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 dark:bg-[#0E1E32] border border-slate-200/80 dark:border-slate-700/50 shadow-sm space-y-3"
              >
                {/* Código, Vivienda, Fecha + Badge de Estado */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 tracking-wide">
                    {inc.id} · {inc.systemName} · {inc.date}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isEnRevision
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {isEnRevision ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {isEnRevision ? 'EN REVISIÓN' : 'REPARADO'}
                  </span>
                </div>

                {/* Título del Daño */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {inc.title}
                </h3>

                {/* Descripción Técnica */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {inc.description}
                </p>

                {/* Pie de Tarjeta: Diagnóstico Técnico y Estado */}
                <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/50 flex items-center gap-2 text-xs">
                  <Wrench className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <p className="text-slate-600 dark:text-slate-300 font-medium leading-snug">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      Diagnóstico:
                    </span>{' '}
                    {inc.technicianName} ·{' '}
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      Estado:
                    </span>{' '}
                    <span
                      className={
                        isEnRevision
                          ? 'text-amber-600 dark:text-amber-400 font-semibold'
                          : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      }
                    >
                      {inc.stateDetail}
                    </span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. MODAL PARA REPORTAR NUEVO DAÑO EN TUBERÍA                   */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0E1A29] max-w-md w-full p-6 rounded-3xl shadow-2xl relative border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Reportar Avería en Tubería
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div className="floating-input-box">
                <label className="floating-input-label">Tipo de Avería</label>
                <select
                  value={damageTitle}
                  onChange={(e) => setDamageTitle(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                >
                  {OPCIONES_AVERIA.map((opcion) => (
                    <option
                      key={opcion}
                      value={opcion}
                      className="bg-white dark:bg-[#0E1A29]"
                    >
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="floating-input-box">
                <label className="floating-input-label">Vivienda / Sistema</label>
                <select
                  value={targetSystem}
                  onChange={(e) => setTargetSystem(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="Casa Principal" className="bg-white dark:bg-[#0E1A29]">
                    Casa Principal
                  </option>
                  <option
                    value="Casa de Campo / Vacacional"
                    className="bg-white dark:bg-[#0E1A29]"
                  >
                    Casa de Campo / Vacacional
                  </option>
                </select>
              </div>

              <div className="floating-input-box">
                <label className="floating-input-label">Descripción Técnica</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe la ubicación, caída de presión o fuga detectada..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none resize-none"
                />
              </div>

              <div className="floating-input-box">
                <label className="floating-input-label">Prioridad</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="Alta" className="bg-white dark:bg-[#0E1A29]">
                    Alta (Fuga activa / caída de presión)
                  </option>
                  <option value="Media" className="bg-white dark:bg-[#0E1A29]">
                    Media (Revisión programada)
                  </option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#2563EB] text-white font-black text-sm shadow-lg shadow-sky-600/30 transition cursor-pointer"
                >
                  Registrar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantallaReportes;
