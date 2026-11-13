import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  Wrench,
  Calendar,
  Home,
  CheckCircle2,
  Clock,
  X,
  Send,
  User,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerReportes, guardarReporte } from '../services/reportsService';
import { exportarExcel } from '../services/registroAguaService';
import confetti from 'canvas-confetti';

export const PantallaReportes = ({ onNavigateHome }) => {
  const { user, activeSystem, addNotification, addToast } = useAuth();

  const [services, setServices] = useState([]);
  const [activeFilter, setActiveFilter] = useState('todos'); // 'todos' | 'curso' | 'concluidos'
  const [openFaqIndex, setOpenFaqIndex] = useState('c-2'); // Abierto por defecto como en Bitacora.png
  const [expandedServiceId, setExpandedServiceId] = useState('SRV-101'); // Abierto por defecto como en la interfaz vieja
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario nuevo servicio
  const [serviceType, setServiceType] = useState('Limpieza y Desinfección de Cisterna (5,000 L)');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');

  useEffect(() => {
    setServices(obtenerReportes());
  }, []);

  const toggleFaq = (key) => {
    setOpenFaqIndex((prev) => (prev === key ? null : key));
  };

  const toggleServiceExpand = (id) => {
    setExpandedServiceId((prev) => (prev === id ? null : id));
  };

  const handleExport = () => {
    try {
      exportarExcel();
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.3 } });
      addToast({
        title: 'Bitácora Exportada',
        message: 'Archivo Excel (.xlsx) descargado exitosamente.',
        variant: 'success',
        duration: 4000,
      });
    } catch (e) {
      console.error(e);
      alert('Error al exportar: ' + e.message);
    }
  };

  const handleCreateService = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const created = guardarReporte({
      title: serviceType,
      systemName: activeSystem?.name || 'Casa Principal',
      category: serviceType,
      description: description.trim(),
      severity: urgency,
      author: user?.name || 'Jesús Vásquez Granda',
    });

    setServices([created, ...services]);
    setIsModalOpen(false);
    setDescription('');
    setExpandedServiceId(created.id);

    addToast({
      title: 'Solicitud Registrada',
      message: `Folio ${created.id} generado para ${created.systemName}.`,
      variant: 'success',
      duration: 5000,
    });

    addNotification({
      title: 'Servicio Programado',
      message: `${created.id}: ${created.title}`,
      category: 'servicio',
      type: 'info',
      systemName: created.systemName,
    });
  };

  const filteredServices = services.filter((srv) => {
    if (activeFilter === 'curso') return srv.status === 'En Curso';
    if (activeFilter === 'concluidos') return srv.status === 'Concluido';
    return true;
  });

  const countTodos = services.length;
  const countCurso = services.filter((s) => s.status === 'En Curso').length;
  const countConcluidos = services.filter((s) => s.status === 'Concluido').length;

  return (
    <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-5 sm:p-7 shadow-xl pb-28 text-slate-800 dark:text-slate-100">
      <div>
        {/* ============================================================== */}
        {/* 1. ENCABEZADO SUPERIOR FAQ & BOTONES DE ACCIÓN                  */}
        {/* ============================================================== */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              FAQ & Bitácora
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed max-w-sm">
              Find important information and update about any recent changes and fees here.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botón Excel Rescatado */}
            <button
              onClick={handleExport}
              className="px-3 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Descargar en Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Botón Solicitar Servicio Rescatado */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Solicitar</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. BITÁCORA DE SERVICIOS (FUNCIONES CRÍTICAS RESCATADAS)        */}
        {/* ============================================================== */}
        <div className="mt-7 p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-[#0E1A29] border border-slate-200/80 dark:border-cyan-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Wrench className="w-4.5 h-4.5 text-cyan-500" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Bitácora de Asistencia Técnica
              </h3>
            </div>

            {/* Filtros de Estado Rescatados (Todos, En Curso, Concluidos) */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#132235] p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveFilter('todos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'todos'
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos ({countTodos})
              </button>
              <button
                onClick={() => setActiveFilter('curso')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'curso'
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                En Curso ({countCurso})
              </button>
              <button
                onClick={() => setActiveFilter('concluidos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'concluidos'
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Concluidos ({countConcluidos})
              </button>
            </div>
          </div>

          {/* Carrusel de Folios Rescatado (SRV-101, SRV-102, SRV-103) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
            {filteredServices.map((srv) => {
              const isSelected = expandedServiceId === srv.id;
              return (
                <button
                  key={srv.id}
                  onClick={() => setExpandedServiceId(srv.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                      : 'bg-white dark:bg-[#132235] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{srv.id}</span>
                  <span className="opacity-70">· {srv.systemName}</span>
                </button>
              );
            })}
          </div>

          {/* Tarjeta Detallada del Registro Activo (Exacta a la Interfaz Vieja) */}
          {filteredServices.map((srv) => {
            if (srv.id !== expandedServiceId) return null;
            const isExpanded = true;

            return (
              <div
                key={srv.id}
                className="mt-2 p-4 rounded-2xl bg-white dark:bg-[#132235] border border-cyan-500/30 shadow-xs animate-fadeIn"
              >
                {/* Cabecera del Servicio */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-600 dark:text-cyan-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{srv.date}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {srv.status || 'Concluido'}
                  </span>
                </div>

                {/* Folio, Vivienda y Título */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {srv.id}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Home className="w-3 h-3" />
                      {srv.systemName}
                    </span>
                    <span>•</span>
                    <span>{srv.time || '10:00 AM'}</span>
                  </div>

                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1.5 leading-snug">
                    {srv.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {/* Detalles del Técnico Desplegables */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Técnico: {srv.technicianName || 'AquaCare Especialistas'}
                    </span>
                    <span className="text-cyan-600 font-semibold">{srv.severity}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                    "{srv.technicianNotes || 'Servicio ejecutado bajo normas sanitarias oficiales.'}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 3. SECCIÓN FAQ IDÉNTICA A INTERFAZ NUEVA                       */}
        {/* ============================================================== */}
        <div className="mt-8 space-y-6">
          {/* General */}
          <div>
            <h4 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3">
              General
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleFaq('g-1')}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 transition-colors">
                    How to contact with riders ?
                  </span>
                  {openFaqIndex === 'g-1' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaqIndex === 'g-1' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed animate-fadeIn">
                    Los operadores de pipas y técnicos de servicio se coordinan desde "Contact Us" o mediante el chat de asistencia técnica 24/7.
                  </p>
                )}
              </div>

              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleFaq('g-2')}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 transition-colors">
                    How to change my selected furniture ?
                  </span>
                  {openFaqIndex === 'g-2' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaqIndex === 'g-2' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed animate-fadeIn">
                    Puedes alternar entre tus viviendas registradas (Casa Principal, Casa de Campo) desde la pestaña "Offers / Mis Sistemas" con solo un clic.
                  </p>
                )}
              </div>

              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleFaq('g-3')}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 transition-colors">
                    What is cost of each item ?
                  </span>
                  {openFaqIndex === 'g-3' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaqIndex === 'g-3' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed animate-fadeIn">
                    El costo estándar por metro cúbico (1,000 L) es de $18.50 MXN. El mantenimiento de cisterna cuenta con 40% de descuento de temporada.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3">
              Contact
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleFaq('c-1')}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 transition-colors">
                    What is the customer care number?
                  </span>
                  {openFaqIndex === 'c-1' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaqIndex === 'c-1' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed animate-fadeIn">
                    Línea de emergencia Hydro Home: 800-493-7646 (HYDRO-IO), disponible las 24 horas del día.
                  </p>
                )}
              </div>

              {/* Exacto abierto por defecto como en Bitacora.png */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleFaq('c-2')}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 transition-colors">
                    Can I Cancel the order after one week?
                  </span>
                  {openFaqIndex === 'c-2' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaqIndex === 'c-2' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed animate-fadeIn">
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Puedes reprogramar o cancelar cualquier solicitud sin costo hasta con 24 horas de anticipación.
                  </p>
                )}
              </div>

              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleFaq('c-3')}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 transition-colors">
                    How to call any service now?
                  </span>
                  {openFaqIndex === 'c-3' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaqIndex === 'c-3' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed animate-fadeIn">
                    Utiliza el botón superior "+ Solicitar" o entra en "Contact Us" para coordinar una visita presencial inmediata en tu domicilio.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Botón Inferior: Go to Homepage -> */}
      <div className="mt-8 pt-4">
        <button
          onClick={onNavigateHome}
          className="w-full btn-outline-action py-3.5 rounded-2xl flex items-center justify-center gap-2 group cursor-pointer hover:border-cyan-500"
        >
          <span className="font-bold text-sm text-slate-800 dark:text-white">
            Go to Homepage
          </span>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-cyan-500 transition-transform" />
        </button>
      </div>

      {/* ============================================================== */}
      {/* 5. MODAL DE NUEVA SOLICITUD DE ASISTENCIA TÉCNICA              */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0E1A29] max-w-md w-full p-6 rounded-3xl shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Solicitar Servicio Técnico
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="floating-input-box">
                <label className="floating-input-label">Tipo de Servicio</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="Limpieza y Desinfección de Cisterna (5,000 L)">
                    Limpieza y Desinfección de Cisterna (5,000 L)
                  </option>
                  <option value="Mantenimiento de Bomba Presurizadora">
                    Mantenimiento de Bomba Presurizadora
                  </option>
                  <option value="Revisión de Fugas y Tubería">Revisión de Fugas y Tubería</option>
                  <option value="Calibración de Sensores ESP32">Calibración de Sensores ESP32</option>
                  <option value="Suministro de Pipa Urgente">Suministro de Pipa Urgente</option>
                </select>
              </div>

              <div className="floating-input-box">
                <label className="floating-input-label">Detalles del Requerimiento</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe la necesidad o falla detectada..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none resize-none"
                />
              </div>

              <div className="floating-input-box">
                <label className="floating-input-label">Urgencia</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="Normal">Normal (En 48 hrs)</option>
                  <option value="Alta">Alta (En 24 hrs)</option>
                  <option value="Urgente">Urgente (Mismo día)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-sm shadow-lg shadow-cyan-600/30 transition cursor-pointer"
                >
                  Confirmar Solicitud
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
