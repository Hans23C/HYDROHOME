import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Wrench,
  X,
  Send,
  Calendar as CalendarIcon,
  CalendarDays,
  Home,
  ShieldCheck,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  obtenerReportes,
  guardarReporte,
  formatearCabeceraDia,
} from '../services/reportsService';
import { exportarExcel } from '../services/registroAguaService';
import { NordCalendar } from '../components/nord/NordCalendar';
import confetti from 'canvas-confetti';

export const ReportsScreen = () => {
  const { user, userSystems, activeSystem, addNotification, addToast } = useAuth();

  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('todos'); // 'todos', 'solicitados', 'concluidos'
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Control del scroll de tarjetas estilo Figma y detalles desplegables
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [expandedIds, setExpandedIds] = useState({});
  const scrollContainerRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario nuevo servicio
  const [serviceType, setServiceType] = useState('Limpieza y Desinfección de Cisterna');
  const [targetSystemName, setTargetSystemName] = useState(activeSystem?.name || 'Casa Principal');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');

  useEffect(() => {
    setServices(obtenerReportes());
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCreateService = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const created = guardarReporte({
      title: serviceType,
      systemName: targetSystemName,
      category: serviceType,
      description: description.trim(),
      severity: urgency,
      author: user?.name || 'Propietario',
    });

    setServices([created, ...services]);
    setIsModalOpen(false);
    setDescription('');
    setActiveCardIndex(0);

    addToast({
      title: 'Solicitud Registrada',
      message: `Folio ${created.id} generado para ${created.systemName}.`,
      variant: 'success',
      duration: 5000,
    });

    addNotification({
      title: 'Asistencia Solicitada',
      message: `${created.id}: ${created.title} (${created.systemName}).`,
      category: 'servicio',
      type: 'info',
      systemName: created.systemName,
    });
  };

  const handleExport = () => {
    try {
      exportarExcel();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.3 } });
    } catch (e) {
      console.error(e);
      alert('Error al exportar: ' + e.message);
    }
  };

  const filteredServices = services.filter((s) => {
    if (filter === 'solicitados' && s.status === 'Concluido') return false;
    if (filter === 'concluidos' && s.status !== 'Concluido') return false;
    if (selectedDate && s.date) {
      if (s.date !== selectedDate) return false;
    }
    return true;
  });

  const handleScroll = (e) => {
    const container = e.currentTarget;
    if (!container.clientWidth) return;
    const idx = Math.round(container.scrollLeft / container.clientWidth);
    if (idx >= 0 && idx < filteredServices.length && idx !== activeCardIndex) {
      setActiveCardIndex(idx);
    }
  };

  const scrollToCard = (index) => {
    if (!filteredServices.length) return;
    const clamped = Math.max(0, Math.min(filteredServices.length - 1, index));
    setActiveCardIndex(clamped);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: clamped * scrollContainerRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  const progressPercentage =
    filteredServices.length > 0
      ? ((activeCardIndex + 1) / filteredServices.length) * 100
      : 0;

  return (
    <div className="space-y-5 pb-20">
      {/* Encabezado Espaciado */}
      <div className="liquid-glass p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-500 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
              Bitácora de Servicios
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Desliza entre tus registros y solicitudes de asistencia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExport}
            className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-[#0B1928] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-sky-400/20 hover:bg-slate-200 transition flex items-center gap-2 cursor-pointer"
            title="Descargar Excel"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm btn-hydro-primary flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Solicitar Servicio</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros con Scroll y Calendario */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0B1928] p-1.5 rounded-2xl border border-slate-200 dark:border-sky-400/20 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setFilter('todos');
              scrollToCard(0);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
              filter === 'todos'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            Todos ({services.length})
          </button>
          <button
            onClick={() => {
              setFilter('solicitados');
              scrollToCard(0);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
              filter === 'solicitados'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            En Curso ({services.filter((s) => s.status !== 'Concluido').length})
          </button>
          <button
            onClick={() => {
              setFilter('concluidos');
              scrollToCard(0);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
              filter === 'concluidos'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            Concluidos ({services.filter((s) => s.status === 'Concluido').length})
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center gap-2 cursor-pointer ${
              selectedDate
                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-400/50'
                : 'bg-white dark:bg-[#0B1928] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-sky-400/20'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{selectedDate ? selectedDate : 'Filtrar Fecha'}</span>
            {selectedDate && (
              <X
                className="w-4 h-4 ml-1 text-slate-400 hover:text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate('');
                  scrollToCard(0);
                }}
              />
            )}
          </button>

          {showCalendar && (
            <div className="absolute right-0 top-12 z-50 animate-fadeIn">
              <NordCalendar
                value={selectedDate}
                onChange={(val) => {
                  setSelectedDate(val);
                  setShowCalendar(false);
                  scrollToCard(0);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 📑 VISOR DE SCROLL OCUPANDO EL RESTO DEL ESPACIO A LO LARGO     */}
      {/* ============================================================== */}
      {filteredServices.length === 0 ? (
        <div className="flex-1 liquid-glass p-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
          <Wrench className="w-12 h-12 mx-auto text-slate-500" />
          <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200">
            No hay servicios en esta fecha o filtro
          </h4>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between gap-6">
          {/* Cabecera del Visor de Scroll con Barra de Progreso y Botones */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 shrink-0">
            <div className="flex items-center gap-3.5">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Registro {activeCardIndex + 1} de {filteredServices.length}
              </span>
              <div className="w-32 sm:w-44 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs sm:text-sm text-slate-400">
                Desliza horizontalmente
              </span>
              <button
                type="button"
                onClick={() => scrollToCard(activeCardIndex - 1)}
                disabled={activeCardIndex === 0}
                className="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-sky-400/25 flex items-center justify-center disabled:opacity-35 hover:bg-sky-500/20 transition cursor-pointer"
                title="Anterior servicio"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollToCard(activeCardIndex + 1)}
                disabled={activeCardIndex === filteredServices.length - 1}
                className="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-sky-400/25 flex items-center justify-center disabled:opacity-35 hover:bg-sky-500/20 transition cursor-pointer"
                title="Siguiente servicio"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Píldoras Rápidas de Navegación por Folio */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 shrink-0">
            {filteredServices.map((srv, idx) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => scrollToCard(idx)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  idx === activeCardIndex
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-500/25'
                    : 'bg-white dark:bg-[#0B1928] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-sky-400/20'
                }`}
              >
                <span className="font-mono">{srv.id}</span>
                <span>·</span>
                <span className="truncate max-w-[150px]">{srv.systemName}</span>
              </button>
            ))}
          </div>

          {/* Contenedor Principal de Scroll con Tarjetas Compactas y Botón Central */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-5 pb-3 items-start"
          >
            {filteredServices.map((item) => {
              const isExpanded = !!expandedIds[item.id];
              const diaInfo = formatearCabeceraDia(item.date);

              return (
                <div
                  key={item.id}
                  className="min-w-full sm:min-w-[420px] max-w-xl mx-auto shrink-0 snap-center liquid-glass p-5 sm:p-6 rounded-3xl flex flex-col gap-3.5 transition-all shadow-md"
                >
                  {/* Encabezado de Fecha y Estado */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{diaInfo.formatoLargo}</span>
                    </div>

                    <span
                      className={`text-[11px] sm:text-xs font-bold px-3 py-1 rounded-xl border ${
                        item.status === 'Concluido'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Cuerpo Central Compacto: Folio, Lugar y Título */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-400/30">
                        {item.id}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#0B1928] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-sky-400/15">
                        <Home className="w-3.5 h-3.5 text-sky-500" />
                        <span>{item.systemName}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 ml-auto">
                        {item.createdAt}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* BOTÓN VISIBLE Y CENTRADO DE "VER DETALLES" */}
                  <div className="flex items-center justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="w-full sm:w-auto min-w-[200px] px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 border border-sky-400/40 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <span>{isExpanded ? 'Ocultar detalles' : 'Ver detalles'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-sky-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-sky-500" />
                      )}
                    </button>
                  </div>

                  {/* Información Extra Desplegable solo cuando se pulsa "Ver detalles" */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm animate-fadeIn">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-[#0B1928] border border-slate-200 dark:border-sky-400/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 text-xs">
                            <ShieldCheck className="w-4 h-4" />
                            Reporte Técnico Oficial
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{item.createdAt}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-xs">
                          {item.technicianNotes}
                        </p>
                        <span className="text-xs text-slate-500 block font-medium">
                          Especialista: {item.technicianName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL SOLICITAR ASISTENCIA TÉCNICA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="liquid-glass max-w-md w-full p-6 border-sky-400/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-sky-400/20 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-500 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Solicitar Servicio a Domicilio
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Vivienda
                </label>
                <select
                  value={targetSystemName}
                  onChange={(e) => setTargetSystemName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1928] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {userSystems.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Servicio Requerido
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1928] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Limpieza y Desinfección de Cisterna">
                    Limpieza de Cisterna
                  </option>
                  <option value="Mantenimiento de Bomba Presurizadora">
                    Mantenimiento de Bomba
                  </option>
                  <option value="Inspección y Reparación de Fuga">
                    Revisión de Fuga
                  </option>
                  <option value="Reemplazo de Filtro de Sedimentos">
                    Cambio de Filtro
                  </option>
                  <option value="Calibración de Sensores ESP32">
                    Calibración ESP32
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Prioridad
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Normal', 'Programado', 'Urgente'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setUrgency(p)}
                      className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                        urgency === p
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-100 dark:bg-[#0B1928] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Observaciones breves
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej. Solicito revisión el sábado por la mañana..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1928] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold btn-hydro-primary flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsScreen;
