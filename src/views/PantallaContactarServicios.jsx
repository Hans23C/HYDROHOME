import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  MapPin,
  Phone,
  Copy,
  Check,
  Home,
  Building2,
  Factory,
  X,
  Tag,
  CheckCircle2,
  Droplets,
  BadgePercent,
  CalendarClock,
  Sparkles,
  ShieldCheck,
  Star,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DIRECCION_STORAGE_KEY = 'hydro_direccion_entrega';

const CUPONES_DISPONIBLES = [
  {
    id: 'home40',
    code: 'HOME40',
    discount: '40% OFF',
    shortLabel: '40% OFF · 2 servicios',
    subtitle: 'Al solicitar 2 servicios de agua potable',
    gradient: 'from-indigo-600 to-blue-700',
    showTruck: true,
    icon: null,
  },
  {
    id: 'new50',
    code: 'NEW50',
    discount: '10%',
    shortLabel: '10% OFF · Nuevos Usuarios',
    subtitle: 'Nuevos Usuarios',
    gradient: 'from-cyan-500 to-teal-600',
    showTruck: false,
    icon: BadgePercent,
  },
  {
    id: 'cisterna25',
    code: 'CISTERNA25',
    discount: '25% OFF',
    shortLabel: '25% OFF · Cisterna 10,000 LTS',
    subtitle: 'En recarga de cisterna de 10,000 LTS',
    gradient: 'from-sky-600 to-blue-800',
    showTruck: false,
    icon: Droplets,
  },
  {
    id: 'hydro150',
    code: 'HYDRO150',
    discount: '$150 MXN',
    shortLabel: '$150 MXN · Servicio programado',
    subtitle: 'Bonificación en servicio programado',
    gradient: 'from-blue-500 to-indigo-600',
    showTruck: false,
    icon: CalendarClock,
  },
  {
    id: 'hogar30',
    code: 'HOGAR30',
    discount: '30% OFF',
    shortLabel: '30% OFF · Suministro residencial',
    subtitle: 'Paquete mensual de suministro residencial',
    gradient: 'from-teal-600 to-cyan-800',
    showTruck: false,
    icon: Sparkles,
  },
];

const SERVICIOS_AGUA_POTABLE = [
  {
    id: 'xalatlaco',
    nombre: 'Comité Central de Aguas Potables Xalatlaco "Cuauhtémoc"',
    ubicacion: 'Xalatlaco, Estado de México',
    telefono: '713 105 2572',
    telefonoRaw: '7131052572',
    estrellas: 5,
    badgeLabel: 'FAST',
    badgeIcon: Zap,
    pinBg: 'bg-emerald-500',
    gradient: 'from-cyan-500 via-blue-600 to-blue-700',
  },
  {
    id: 'tlaltizapan-oficina',
    nombre: 'Oficina Agua potable',
    ubicacion: 'Av Juárez Sur Manzana 014, Centro, 52640 San Pedro Tlaltizapan, Méx.',
    telefono: '729 232 4522',
    telefonoRaw: '7292324522',
    estrellas: 4,
    badgeLabel: 'OFICIAL',
    badgeIcon: Droplets,
    pinBg: 'bg-cyan-400',
    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
  },
  {
    id: 'tianguistenco-bomba',
    nombre: 'Bomba de Agua Potable de Santiago Tianguistenco',
    ubicacion: 'Av Juárez Sur Manzana 014, Centro, 52640 San Pedro Tlaltizapan, Méx.',
    telefono: '722 204 9840',
    telefonoRaw: '7222049840',
    estrellas: 5,
    badgeLabel: 'VERIFICADO',
    badgeIcon: ShieldCheck,
    pinBg: 'bg-emerald-500',
    gradient: 'from-blue-600 via-indigo-600 to-blue-800',
  },
  {
    id: 'opdapas-lerma',
    nombre: 'OPDAPAS Lerma',
    ubicacion: 'Av Miguel Hidalgo 26, Centro, 52000 Lerma de Villada, Méx.',
    telefono: '729 448 6463',
    telefonoRaw: '7294486463',
    estrellas: 4,
    badgeLabel: 'OFICIAL',
    badgeIcon: Droplets,
    pinBg: 'bg-cyan-400',
    gradient: 'from-teal-500 via-cyan-600 to-blue-700',
  },
  {
    id: 'opdapas-san-mateo',
    nombre: 'Opdapas San Mateo Atenco',
    ubicacion: 'Hacienda Tres Marías 260, Santa Elena, 52105 San Mateo Atenco, Méx.',
    telefono: '729 650 3116',
    telefonoRaw: '7296503116',
    estrellas: 5,
    badgeLabel: 'VERIFICADO',
    badgeIcon: ShieldCheck,
    pinBg: 'bg-emerald-500',
    gradient: 'from-cyan-600 via-sky-600 to-indigo-700',
  },
];

const TARIFAS_PIPA = [
  {
    id: 'pequena',
    categoria: 'Pequeña',
    capacidad: '5,000 LTS',
    uso: 'Ideal para vivienda o tinaco residencial',
    icon: Home,
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-white/20',
  },
  {
    id: 'mediana',
    categoria: 'Mediana',
    capacidad: '10,000 LTS',
    uso: 'Ideal para cisterna familiar o negocio',
    icon: Building2,
    gradient: 'from-blue-600 to-indigo-700',
    iconBg: 'bg-white/20',
  },
  {
    id: 'grande',
    categoria: 'Grande',
    capacidad: '20,000 LTS',
    uso: 'Ideal para cisternas grandes o uso industrial',
    icon: Factory,
    gradient: 'from-teal-500 to-cyan-700',
    iconBg: 'bg-white/20',
  },
];

// Ilustración vectorial de camión pipa azul para la tarjeta principal de descuento
const IlustracionPipaAzul = () => (
  <svg
    viewBox="0 0 120 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-20 sm:w-24 h-14 sm:h-16 shrink-0 drop-shadow-md select-none"
    aria-hidden="true"
  >
    {/* Chasis base */}
    <rect x="10" y="47" width="98" height="6" rx="3" fill="#1E3A8A" />
    {/* Tanque cilíndrico de agua */}
    <rect x="12" y="16" width="66" height="33" rx="14" fill="url(#tankGrad)" />
    {/* Reflejo superior del tanque */}
    <rect x="20" y="21" width="50" height="5" rx="2.5" fill="#BAE6FD" fillOpacity="0.65" />
    {/* Bandas metálicas del tanque */}
    <rect x="29" y="16" width="3.5" height="33" fill="#0284C7" fillOpacity="0.55" />
    <rect x="57" y="16" width="3.5" height="33" fill="#0284C7" fillOpacity="0.55" />
    {/* Escotilla superior */}
    <rect x="38" y="11" width="14" height="5" rx="2" fill="#0369A1" />
    {/* Gota de agua en el tanque */}
    <path
      d="M45 26C45 26 39 33.2 39 36.8C39 40.1 41.7 42.8 45 42.8C48.3 42.8 51 40.1 51 36.8C51 33.2 45 26 45 26Z"
      fill="#E0F2FE"
    />
    {/* Cabina del camión */}
    <path
      d="M80 24C80 21.8 81.8 20 84 20H97.5C99.3 20 100.9 21.1 101.6 22.8L108 36V47H80V24Z"
      fill="#2563EB"
    />
    {/* Parabrisas */}
    <path d="M85 24H96.5L102 35H85V24Z" fill="#BAE6FD" />
    {/* Faro delantero */}
    <rect x="104" y="40" width="4" height="4" rx="1.5" fill="#FDE047" />
    {/* Llantas */}
    <circle cx="28" cy="54" r="8" fill="#0F172A" />
    <circle cx="28" cy="54" r="3.5" fill="#94A3B8" />
    <circle cx="48" cy="54" r="8" fill="#0F172A" />
    <circle cx="48" cy="54" r="3.5" fill="#94A3B8" />
    <circle cx="94" cy="54" r="8" fill="#0F172A" />
    <circle cx="94" cy="54" r="3.5" fill="#94A3B8" />
    <defs>
      <linearGradient id="tankGrad" x1="12" y1="16" x2="12" y2="49" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.55" stopColor="#0EA5E9" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
  </svg>
);

export const PantallaContactarServicios = () => {
  const { addToast } = useAuth();
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeServicioIdx, setActiveServicioIdx] = useState(0);
  const serviciosScrollRef = useRef(null);
  const direccionInputRef = useRef(null);

  // Proveedor activo vinculado al carrusel de Servicios de Agua Potable
  const proveedorActivo =
    SERVICIOS_AGUA_POTABLE[activeServicioIdx] || SERVICIOS_AGUA_POTABLE[0];

  // Dirección de entrega persistente en localStorage
  const [direccionEntrega, setDireccionEntrega] = useState(() => {
    try {
      return localStorage.getItem(DIRECCION_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [errorDireccion, setErrorDireccion] = useState('');

  // Estado del modal de solicitud de tarifa
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState(null);
  const [cuponInput, setCuponInput] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [errorCupon, setErrorCupon] = useState('');

  const copiarAlPortapapeles = (texto) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).catch(() => {});
    }
  };

  const guardarDireccionPersistente = (valor) => {
    try {
      localStorage.setItem(DIRECCION_STORAGE_KEY, valor);
    } catch {
      // Ignorar error de almacenamiento
    }
  };

  const handleDireccionChange = (e) => {
    const valor = e.target.value;
    setDireccionEntrega(valor);
    guardarDireccionPersistente(valor);
    if (errorDireccion && valor.trim()) {
      setErrorDireccion('');
    }
  };

  const handleCopyCoupon = (code) => {
    copiarAlPortapapeles(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2400);

    addToast?.({
      title: '¡Código copiado!',
      message: `Cupón ${code} copiado al portapapeles. Úsalo al solicitar tu pipa.`,
      variant: 'success',
      duration: 3000,
    });
  };

  const handleServiciosScroll = () => {
    const el = serviciosScrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const step = el.clientWidth + 12; // ancho tarjeta (100%) + gap-3 (12px)
    const idx = Math.round(el.scrollLeft / step);
    const clamped = Math.max(0, Math.min(SERVICIOS_AGUA_POTABLE.length - 1, idx));
    setActiveServicioIdx(clamped);
  };

  const scrollToServicio = (idx) => {
    const el = serviciosScrollRef.current;
    if (el) {
      const step = el.clientWidth + 12;
      el.scrollTo({ left: idx * step, behavior: 'smooth' });
    }
    setActiveServicioIdx(idx);
  };

  const handleOpenSolicitar = (tarifa) => {
    setTarifaSeleccionada(tarifa);
    setErrorCupon('');
    setErrorDireccion('');
    if (copiedCode) {
      const match = CUPONES_DISPONIBLES.find((c) => c.code === copiedCode);
      if (match) {
        setCuponInput(match.code);
        setCuponAplicado(match);
        return;
      }
    }
    setCuponInput('');
    setCuponAplicado(null);
  };

  const handleCloseModal = () => {
    setTarifaSeleccionada(null);
    setErrorCupon('');
    setErrorDireccion('');
  };

  const handleAplicarCupon = (codigoDirecto) => {
    const limpio = (codigoDirecto ?? cuponInput).trim().toUpperCase();
    if (!limpio) {
      setCuponAplicado(null);
      setErrorCupon('');
      return;
    }

    const encontrado = CUPONES_DISPONIBLES.find((c) => c.code === limpio);
    if (encontrado) {
      setCuponInput(encontrado.code);
      setCuponAplicado(encontrado);
      setErrorCupon('');
      addToast?.({
        title: 'Cupón aplicado',
        message: `Se aplicó ${encontrado.code} (${encontrado.discount}) a tu solicitud.`,
        variant: 'success',
        duration: 2800,
      });
    } else {
      setCuponAplicado(null);
      setErrorCupon('Cupón no válido. Prueba con HOME40, NEW50, CISTERNA25, HYDRO150 o HOGAR30.');
    }
  };

  const handleEnviarWhatsApp = () => {
    if (!tarifaSeleccionada) return;

    const direccionLimpia = direccionEntrega.trim();
    if (!direccionLimpia) {
      setErrorDireccion('Ingresa tu dirección de entrega para enviar la solicitud');
      direccionInputRef.current?.focus();
      return;
    }

    guardarDireccionPersistente(direccionLimpia);

    const soloDigitos = proveedorActivo.telefono.replace(/\D/g, '');
    const telefonoWhatsApp = soloDigitos.startsWith('52')
      ? soloDigitos
      : `52${soloDigitos}`;

    const lineaCupon = cuponAplicado
      ? `\n- Cupón de descuento aplicado: ${cuponAplicado.code}`
      : '';

    const mensajeWhatsApp =
      `Hola ${proveedorActivo.nombre}, buen día.\n\n` +
      `Me gustaría solicitar un servicio de agua potable a través de Hydro Home con los siguientes datos:\n\n` +
      `- Servicio: Pipa ${tarifaSeleccionada.categoria} (${tarifaSeleccionada.capacidad})\n` +
      `- Dirección de entrega: ${direccionLimpia}` +
      `${lineaCupon}\n\n` +
      `Quedo atento a su confirmación y horario estimado de entrega. Muchas gracias.`;

    const urlWhatsApp = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeWhatsApp)}`;
    window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');

    addToast?.({
      title: 'Abriendo WhatsApp',
      message: `Mensaje listo para ${proveedorActivo.nombre} (${tarifaSeleccionada.capacidad}).`,
      variant: 'success',
      duration: 4000,
    });

    handleCloseModal();
  };

  const telefonoActivoLimpio = proveedorActivo.telefono.replace(/\D/g, '');

  return (
    <div className="flex-1 w-full min-w-0 flex flex-col bg-white dark:bg-[#0B1726] rounded-t-[36px] px-4 sm:px-6 pt-6 pb-24 shadow-xl transition-colors overscroll-y-none overflow-x-hidden">
      {/* ================================================================= */}
      {/* SECCIÓN 1: DESCUENTOS (CARRUSEL HORIZONTAL RESPONSIVO)            */}
      {/* ================================================================= */}
      <section aria-labelledby="titulo-descuentos" className="w-full min-w-0">
        <h2
          id="titulo-descuentos"
          className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-3"
        >
          Descuentos
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar w-full min-w-0">
          {CUPONES_DISPONIBLES.map((cupon) => {
            const estaCopiado = copiedCode === cupon.code;
            const CuponIcon = cupon.icon;
            return (
              <motion.button
                key={cupon.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCopyCoupon(cupon.code)}
                aria-label={`Copiar cupón ${cupon.code}: ${cupon.discount}`}
                className={`bg-gradient-to-br ${cupon.gradient} min-w-[85%] sm:min-w-[270px] max-w-[85%] sm:max-w-[290px] shrink-0 snap-start rounded-2xl p-4 text-white relative overflow-hidden shadow-md text-left cursor-pointer box-border transition-shadow hover:shadow-lg`}
              >
                {/* Destello decorativo sutil */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/15 blur-xl"
                />

                <div className="relative z-10 flex items-center justify-between gap-3 h-full min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-black tracking-tight leading-none whitespace-normal">
                      {cupon.discount}
                    </p>
                    <p className="text-[11px] font-medium text-white/90 mt-1.5 leading-snug whitespace-normal break-words">
                      {cupon.subtitle}
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-xs border border-white/15 px-2.5 py-1 text-[11px] font-bold max-w-full">
                      {estaCopiado ? (
                        <>
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span className="whitespace-nowrap">¡Código copiado!</span>
                        </>
                      ) : (
                        <>
                          <span className="whitespace-nowrap">Code: {cupon.code}</span>
                          <Copy className="w-3 h-3 opacity-85 shrink-0" />
                        </>
                      )}
                    </div>
                  </div>

                  {cupon.showTruck ? (
                    <IlustracionPipaAzul />
                  ) : (
                    CuponIcon && (
                      <div
                        aria-hidden="true"
                        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/25 flex items-center justify-center shrink-0 shadow-inner"
                      >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-200/30 via-transparent to-white/15 pointer-events-none" />
                        <CuponIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white/95 drop-shadow-sm relative z-10" />
                      </div>
                    )
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECCIÓN 2: SERVICIOS DE AGUA POTABLE (CARRUSEL 100% ENCAJADO)     */}
      {/* ================================================================= */}
      <section aria-labelledby="titulo-servicios-agua" className="w-full min-w-0">
        <h2
          id="titulo-servicios-agua"
          className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-5 mb-3"
        >
          Servicios de Agua Potable
        </h2>

        <div
          ref={serviciosScrollRef}
          onScroll={handleServiciosScroll}
          className="flex gap-3 overflow-x-auto py-2 px-1.5 -mx-1.5 snap-x snap-mandatory no-scrollbar w-[calc(100%+0.75rem)] min-w-0"
        >
          {SERVICIOS_AGUA_POTABLE.map((servicio, idx) => {
            const BadgeIcon = servicio.badgeIcon;
            const esActivo = idx === activeServicioIdx;
            return (
              <div
                key={servicio.id}
                onClick={() => scrollToServicio(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToServicio(idx);
                  }
                }}
                aria-pressed={esActivo}
                className={`min-w-full w-full max-w-full shrink-0 snap-center rounded-3xl p-4 sm:p-5 text-white relative overflow-hidden bg-gradient-to-br ${servicio.gradient} flex flex-col justify-between box-border cursor-pointer transition-all duration-200 ${
                  esActivo
                    ? 'ring-4 ring-cyan-400 dark:ring-cyan-300 shadow-xl shadow-cyan-500/30 scale-[1.01]'
                    : 'shadow-lg opacity-85'
                }`}
              >
                {/* Franja decorativa diagonal en gris translúcido/oscuro */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 right-10 w-28 h-[175%] bg-slate-700/45 rotate-[28deg] rounded-2xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-16 right-4 w-24 h-44 bg-slate-700/45 -rotate-[28deg] rounded-2xl"
                />

                <div className="relative z-10 min-w-0">
                  {/* Fila superior de badges: Tipo + Seleccionado de alto contraste */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                      <BadgeIcon className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>{servicio.badgeLabel}</span>
                    </span>

                    {esActivo && (
                      <span className="bg-emerald-400 text-slate-950 font-extrabold text-[11px] px-3 py-1 rounded-full shadow-md inline-flex items-center gap-1.5 tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                        <span>SELECCIONADO</span>
                      </span>
                    )}
                  </div>

                  {/* Nombre del organismo con salto de línea natural */}
                  <h3 className="mt-3 text-base font-extrabold leading-snug text-white drop-shadow-xs whitespace-normal break-words">
                    {servicio.nombre}
                  </h3>

                  {/* Ubicación con pin */}
                  <div className="mt-2 flex items-start gap-2 min-w-0">
                    <span
                      className={`${servicio.pinBg} rounded-full p-1 inline-flex shrink-0 mt-0.5 shadow-sm`}
                    >
                      <MapPin className="w-3 h-3 text-white" />
                    </span>
                    <p className="text-xs text-white/85 leading-snug line-clamp-2 whitespace-normal break-words min-w-0 flex-1">
                      {servicio.ubicacion}
                    </p>
                  </div>
                </div>

                {/* Fila inferior: Teléfono tocable + Recuadro de 5 estrellas */}
                <div className="relative z-10 mt-4 flex items-center justify-between gap-2 min-w-0">
                  <a
                    href={`tel:${servicio.telefonoRaw}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Llamar al ${servicio.telefono}`}
                    className="text-lg sm:text-xl font-black tracking-wide text-white hover:text-cyan-100 transition-colors whitespace-nowrap"
                  >
                    {servicio.telefono}
                  </a>

                  {/* Recuadro translúcido con fila visual de 5 estrellas */}
                  <div
                    aria-label={`Calificación: ${servicio.estrellas} de 5 estrellas`}
                    className="bg-white/20 backdrop-blur-md border border-white/25 rounded-2xl px-2.5 sm:px-3 py-1.5 flex items-center gap-0.5 sm:gap-1 shadow-sm shrink-0"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Star
                        key={num}
                        className={`w-3.5 h-3.5 ${
                          num <= servicio.estrellas
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'fill-white/20 text-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicadores de paginación (puntitos) */}
        <div
          className="flex items-center justify-center gap-1.5 mt-1.5"
          role="tablist"
          aria-label="Servicios disponibles"
        >
          {SERVICIOS_AGUA_POTABLE.map((servicio, idx) => {
            const isActive = idx === activeServicioIdx;
            return (
              <button
                key={servicio.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Ver ${servicio.nombre}`}
                onClick={() => scrollToServicio(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'w-5 bg-cyan-500 dark:bg-cyan-400'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>

        {/* Confirmación visual en tiempo real del proveedor activo */}
        <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 text-center mt-1.5 truncate px-2">
          Servicio activo: {proveedorActivo.nombre}
        </p>
      </section>

      {/* ================================================================= */}
      {/* SECCIÓN 3: TARIFAS (CUADRÍCULA SIMÉTRICA DE 3 COLUMNAS)           */}
      {/* ================================================================= */}
      <section aria-labelledby="titulo-tarifas" className="w-full min-w-0">
        <h2
          id="titulo-tarifas"
          className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-5 mb-3"
        >
          Tarifas
        </h2>

        <div className="grid grid-cols-3 gap-2.5 w-full">
          {TARIFAS_PIPA.map((tarifa) => {
            const Icon = tarifa.icon;
            return (
              <div
                key={tarifa.id}
                className={`bg-gradient-to-b ${tarifa.gradient} rounded-2xl p-3 text-center text-white shadow-md flex flex-col items-center justify-between gap-2.5 relative overflow-hidden min-w-0`}
              >
                {/* Brillo superior sutil */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white/15 blur-xl"
                />

                {/* Ícono circular superior */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full ${tarifa.iconBg} backdrop-blur-xs flex items-center justify-center shadow-inner shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Categoría y capacidad */}
                <div className="relative z-10 w-full min-w-0">
                  <p className="text-[11px] font-semibold text-white/90 leading-tight truncate">
                    {tarifa.categoria}
                  </p>
                  <p className="text-sm sm:text-base font-black tracking-tight mt-0.5 whitespace-nowrap">
                    {tarifa.capacidad}
                  </p>
                </div>

                {/* Botón Solicitar con acabado tipo vidrio */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenSolicitar(tarifa)}
                  className="relative z-10 w-full py-1.5 px-2 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-bold tracking-wide backdrop-blur-sm border border-white/25 transition cursor-pointer"
                >
                  Solicitar
                </motion.button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* MODAL DE SOLICITUD: PROVEEDOR ACTIVO + DIRECCIÓN + CUPÓN + WHATSAPP */}
      {/* ================================================================= */}
      <AnimatePresence>
        {tarifaSeleccionada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm max-h-[90dvh] overflow-y-auto no-scrollbar bg-white dark:bg-[#0E1A29] rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              {/* Encabezado del modal */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-b ${tarifaSeleccionada.gradient} text-white flex items-center justify-center shadow-sm shrink-0`}
                  >
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      Pipa {tarifaSeleccionada.categoria}
                    </h3>
                    <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                      Capacidad: {tarifaSeleccionada.capacidad}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Cerrar ventana"
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Proveedor Asignado (vinculado al servicio seleccionado en el carrusel) */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#132235] border border-slate-100 dark:border-slate-800/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Proveedor asignado
                </p>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-1 leading-snug">
                  {proveedorActivo.nombre}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-blue-600 dark:text-cyan-400 whitespace-nowrap">
                    {proveedorActivo.telefono}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-right">
                    {tarifaSeleccionada.uso}
                  </span>
                </div>
              </div>

              {/* Campo persistente: Dirección de entrega */}
              <div className="mt-4">
                <label
                  htmlFor="input-direccion-entrega"
                  className="text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Dirección de entrega</span>
                </label>

                <input
                  ref={direccionInputRef}
                  id="input-direccion-entrega"
                  type="text"
                  value={direccionEntrega}
                  onChange={handleDireccionChange}
                  placeholder="Ej. Calle Juárez #15, Col. Centro..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#132235] border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                    errorDireccion
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-cyan-500'
                  }`}
                />

                {errorDireccion ? (
                  <p className="mt-1.5 text-[11px] font-bold text-rose-500">
                    {errorDireccion}
                  </p>
                ) : (
                  direccionEntrega.trim().length > 0 && (
                    <p className="mt-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Dirección guardada para este pedido
                    </p>
                  )
                )}
              </div>

              {/* Sección de Cupón */}
              <div className="mt-4">
                <label
                  htmlFor="input-cupon-pipa"
                  className="text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-2"
                >
                  <Tag className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Aplicar cupón de descuento (opcional)</span>
                </label>

                <div className="flex gap-2">
                  <input
                    id="input-cupon-pipa"
                    type="text"
                    value={cuponInput}
                    onChange={(e) => {
                      setCuponInput(e.target.value.toUpperCase());
                      if (errorCupon) setErrorCupon('');
                    }}
                    placeholder="Ej. HOME40 o CISTERNA25"
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-slate-50 dark:bg-[#132235] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAplicarCupon()}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-cyan-500 hover:bg-slate-800 dark:hover:bg-cyan-400 text-white text-xs font-extrabold transition cursor-pointer shrink-0"
                  >
                    Aplicar
                  </button>
                </div>

                {/* Chips de selección rápida */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  {CUPONES_DISPONIBLES.map((c) => {
                    const activo = cuponAplicado?.code === c.code;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleAplicarCupon(c.code)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                          activo
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-400'
                        }`}
                      >
                        {c.code} · {c.discount}
                      </button>
                    );
                  })}
                </div>

                {cuponAplicado && (
                  <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Cupón {cuponAplicado.code} activo ({cuponAplicado.shortLabel})
                    </span>
                  </p>
                )}

                {errorCupon && (
                  <p className="mt-2 text-xs font-bold text-rose-500">
                    {errorCupon}
                  </p>
                )}
              </div>

              {/* Botones de Acción: Llamar ahora + Msj (WhatsApp) */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${telefonoActivoLimpio}`}
                  className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Llamar ahora</span>
                </a>
                <button
                  type="button"
                  onClick={handleEnviarWhatsApp}
                  className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Msj</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PantallaContactarServicios;
