import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  PhoneCall, 
  Mail, 
  HelpCircle, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Phone,
  Droplets,
  Radio,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 1. Componente Modular: Tarjeta de Canal de Contacto
export const TarjetaCanalContacto = ({
  icon: Icon,
  title,
  subtitle,
  iconColor,
  bubbleBg,
  onClick,
  badgeText,
}) => {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#101F30] hover:border-[#00C2FF] dark:hover:border-[#00C2FF] hover:shadow-lg dark:hover:shadow-[#00C2FF]/10 transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group relative"
    >
      {badgeText && (
        <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00C2FF]/10 text-[#00C2FF] border border-[#00C2FF]/20">
          {badgeText}
        </span>
      )}
      <div
        className={`w-16 h-16 rounded-full ${bubbleBg} ${iconColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#00C2FF] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium max-w-[150px] mx-auto truncate">
          {subtitle}
        </p>
      </div>
    </motion.button>
  );
};

// 2. Componente Modular: Modal de Líneas Telefónicas Hídricas
export const ModalLlamadaEmergencia = ({ isOpen, onClose, onSelectNumber }) => {
  const phoneNumbers = [
    {
      name: 'Reporte de Fugas y Desabasto 24/7',
      number: '800-493-7646',
      desc: 'Emergencias de red municipal, rotura de tubos o corte total',
      icon: ShieldAlert,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
    },
    {
      name: 'Soporte de Sensores ESP32 & Cisterna',
      number: '55-8421-9900',
      desc: 'Asistencia técnica en calibración de nivel ultrasónico y presión',
      icon: Radio,
      color: 'text-[#00C2FF] bg-[#00C2FF]/10',
    },
    {
      name: 'Atención al Cliente Hydro Home',
      number: '800-012-3456',
      desc: 'Consultas de consumo histórico, facturación y nuevas viviendas',
      icon: Phone,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="w-full max-w-md bg-white dark:bg-[#0E1A29] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#00C2FF]/15 text-[#00C2FF] flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Central de Asistencia Hídrica
                  </h3>
                  <p className="text-xs text-slate-400">Atención telefónica los 365 días</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {phoneNumbers.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectNumber(p.number)}
                    className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#132235] hover:border-[#00C2FF] hover:bg-white dark:hover:bg-[#162940] transition-all text-left flex items-start gap-3.5 group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#00C2FF] transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-xs font-mono font-bold text-[#00C2FF]">
                          {p.number}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {p.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 3. Componente Principal de la Pantalla: PantallaContactarServicios
export const PantallaContactarServicios = ({
  onNavigateToChat,
  onNavigateToFaq,
  onNavigateHome,
}) => {
  const { addToast } = useAuth();
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCall = (phoneNumber) => {
    addToast({
      title: 'Marcando Línea de Agua',
      message: `Conectando con ${phoneNumber}...`,
      variant: 'info',
      duration: 4000,
    });
    window.open(`tel:${phoneNumber.replace(/[^0-9]/g, '')}`);
    setIsCallModalOpen(false);
  };

  const handleEmailCopy = () => {
    navigator.clipboard?.writeText('soporte@hydrohome.io');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);

    addToast({
      title: 'Correo de Soporte Copiado',
      message: 'soporte@hydrohome.io guardado en el portapapeles para enviar bitácora.',
      variant: 'success',
      duration: 3500,
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-6 sm:p-8 shadow-xl pb-24 transition-colors">
      <div>
        {/* Encabezado Principal según diseño nuevo */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Contact Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mt-2 leading-relaxed max-w-sm">
            Please choose what types of support do you need and let us know.
          </p>
        </div>

        {/* Rejilla 2x2 Adaptada a Soporte de Agua Potable y Sensores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Opción 1: Support Chat (Soporte Predictivo y Telemetría) */}
          <TarjetaCanalContacto
            icon={MessageSquare}
            title="Support Chat"
            subtitle="24x7 Online Support"
            iconColor="text-emerald-500"
            bubbleBg="bg-[#E8F8F0] dark:bg-emerald-950/40"
            badgeText="IA Kane"
            onClick={onNavigateToChat}
          />

          {/* Opción 2: Call Center (Línea de Emergencia y Reporte de Fugas) */}
          <TarjetaCanalContacto
            icon={PhoneCall}
            title="Call Center"
            subtitle="24x7 Customer Service"
            iconColor="text-[#00C2FF]"
            bubbleBg="bg-[#00C2FF]/10 dark:bg-[#00C2FF]/20"
            badgeText="Urgencias"
            onClick={() => setIsCallModalOpen(true)}
          />

          {/* Opción 3: Email (Bitácora de Sensores y Fallos ESP32) */}
          <TarjetaCanalContacto
            icon={Mail}
            title="Email"
            subtitle={copiedEmail ? '¡Copiado!' : 'soporte@hydrohome.io'}
            iconColor="text-[#8B5CF6]"
            bubbleBg="bg-[#F3EDFF] dark:bg-purple-950/40"
            badgeText={copiedEmail ? 'Listo' : 'Bitácora'}
            onClick={handleEmailCopy}
          />

          {/* Opción 4: FAQ (Calibración de Cisterna y Modos de Bomba) */}
          <TarjetaCanalContacto
            icon={HelpCircle}
            title="FAQ"
            subtitle="+50 Answers"
            iconColor="text-[#D97706]"
            bubbleBg="bg-[#FEF9C3] dark:bg-amber-950/40"
            badgeText="Guías"
            onClick={onNavigateToFaq}
          />
        </div>

        {/* Banner Informativo de SLA y Tiempos de Respuesta Hídrica */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-[#07131F]/60 border border-slate-100 dark:border-slate-800/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00C2FF]/10 text-[#00C2FF] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Atención hídrica prioritaria
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Respuestas en chat en &lt; 2 min. En reportes de fuga o caída de presión atención inmediata.
            </p>
          </div>
        </div>
      </div>

      {/* Botón Inferior: Go to Homepage (Con Cyan Corporativo y microinteracción) */}
      <div className="mt-8 pt-4">
        <button
          onClick={onNavigateHome}
          className="w-full py-4 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 hover:border-[#00C2FF] dark:hover:border-[#00C2FF] bg-white dark:bg-[#07131F] text-slate-800 dark:text-white hover:text-[#00C2FF] dark:hover:text-[#00C2FF] font-bold text-sm flex items-center justify-center gap-2 group transition-all shadow-sm active:scale-[0.99] cursor-pointer"
        >
          <span>Go to Homepage</span>
          <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:translate-x-1 group-hover:text-[#00C2FF] transition-all" />
        </button>
      </div>

      {/* Modal de Marcación Telefónica de Emergencias de Agua */}
      <ModalLlamadaEmergencia
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onSelectNumber={handleCall}
      />
    </div>
  );
};

export default PantallaContactarServicios;
