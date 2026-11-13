import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Smile, ChevronLeft } from 'lucide-react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { useAuth } from '../context/AuthContext';

// 1. Componente: Tarjeta de Estado del Asistente con Animación Rive
export const TarjetaEncabezadoAgente = ({
  agentName = 'HydroBot IA',
  status = 'En línea',
}) => {
  const { rive, RiveComponent } = useRive({
    src: '/assets/Animaciones/Bot.riv',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  useEffect(() => {
    if (!rive) return;
    if (rive.stateMachineNames?.length) {
      rive.play(rive.stateMachineNames[0]);
    } else if (rive.animationNames?.length) {
      rive.play(rive.animationNames);
    }
  }, [rive]);

  return (
    <div className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-[#07131F]/70 border border-slate-100 dark:border-slate-800/80 mb-2 shadow-xs">
      <div className="relative shrink-0">
        <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center shadow-md shadow-[#00C2FF]/25 border border-cyan-400/30">
          <div className="w-full h-full flex items-center justify-center scale-[3.8] transform-gpu pointer-events-none">
            <RiveComponent className="w-full h-full block pointer-events-none" />
          </div>
        </div>
        <span className="absolute bottom-1 right-1 z-20 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#07131F]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
            {agentName}
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00C2FF]/10 text-[#0284C7] dark:text-[#00C2FF] border border-[#00C2FF]/20 shrink-0">
            IA Hídrica
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {status}
        </p>
      </div>
    </div>
  );
};

// 2. Componente: Burbuja de Mensaje Individual
export const BurbujaMensaje = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`max-w-[82%] sm:max-w-[78%] px-4 py-3 sm:px-5 sm:py-3.5 rounded-[22px] text-sm leading-relaxed shadow-xs ${
          isUser
            ? 'bg-gradient-to-r from-[#00C2FF] to-[#0284C7] text-white font-medium rounded-tr-sm shadow-md shadow-[#00C2FF]/20'
            : 'bg-slate-100 dark:bg-[#101F30] text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200/50 dark:border-slate-800/80 font-normal'
        }`}
      >
        <p className="whitespace-pre-line text-[13px] sm:text-sm">{message.text}</p>
      </motion.div>
      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 px-2 select-none">
        {message.time}
      </span>
    </div>
  );
};

// 3. Componente: Indicador de Escritura del Agente (Typing Indicator)
export const IndicadorEscribiendo = () => {
  return (
    <div className="flex flex-col items-start space-y-1">
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-[#101F30] border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-bounce" />
      </div>
      <span className="text-[10px] font-medium text-slate-400 px-2">Escribiendo...</span>
    </div>
  );
};

// 4. Componente: Sugerencias Rápidas de Diagnóstico de Agua
export const SugerenciasRapidas = ({ onSelectPrompt }) => {
  const prompts = [
    { label: '💧 Nivel y reserva de cisterna', query: '¿Cuál es el nivel actual de la cisterna?' },
    { label: '⚡ Estado de bomba y presión', query: '¿La presión de la bomba es adecuada?' },
    { label: '🛡️ Test de microfugas', query: '¿Hay alguna fuga o consumo no registrado?' },
    { label: '📶 Salud del sensor ESP32', query: '¿El sensor ESP32 está transmitiendo bien?' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
      {prompts.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(p.query)}
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#101F30] text-slate-700 dark:text-slate-300 hover:text-[#00C2FF] dark:hover:text-[#00C2FF] hover:border-[#00C2FF] border border-slate-200 dark:border-slate-800 transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

// 5. Componente Principal de la Pantalla: ChatAyudaInteligente
export const ChatAyudaInteligente = ({ onBack, onNavigateHome }) => {
  const { activeSystem } = useAuth();
  const sys = activeSystem || {
    name: 'Casa Principal',
    level: 0.68,
    pressure: 3.2,
    flowRate: 14.5,
    capacity: 5000,
    deviceId: 'ESP32-HYDRO-8492',
  };

  // Estado inicial del chat con conversación contextual hídrica
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: '¡Hola! Detecto una variación en el flujo de agua de mi vivienda.',
      time: '08:15 AM',
    },
    {
      id: 2,
      sender: 'agent',
      text: '¡Buenos días! Soy HydroBot IA, tu asistente inteligente de Hydro Home. Estoy analizando la telemetría en tiempo real de tu vivienda.',
      time: '08:16 AM',
    },
    {
      id: 3,
      sender: 'user',
      text: `Veo que mi cisterna está al ${Math.round(sys.level * 100)}%. ¿La presión de la tubería es la adecuada?`,
      time: '08:20 AM',
    },
    {
      id: 4,
      sender: 'agent',
      text: `Telemetría de ${sys.name}: la presión se encuentra en ${sys.pressure} bar y la reserva estimada es de ${Math.round(sys.capacity * sys.level).toLocaleString()} Litros. Tu sensor ${sys.deviceId} está conectado y el flujo es de ${sys.flowRate} L/min.`,
      time: '08:21 AM',
    },
    {
      id: 5,
      sender: 'agent',
      text: 'No se registran caídas de presión anormales en los últimos 30 minutos. La instalación opera dentro de parámetros nominales. 💧',
      time: '08:22 AM',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const nextIdRef = useRef(10);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    nextIdRef.current += 1;
    const newId = nextIdRef.current;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: newId,
      sender: 'user',
      text,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulación de respuesta inteligente predictiva orientada a la gestión de agua
    setTimeout(() => {
      let replyText =
        'Recibido. Estoy monitoreando los sensores de tu vivienda para garantizar el suministro óptimo y la presión continua.';
      const lower = text.toLowerCase();

      if (lower.includes('fuga') || lower.includes('goteo') || lower.includes('microfuga')) {
        replyText =
          'El análisis acústico y de flujo indica que no hay microfugas activas en tu tubería principal. La válvula general y las líneas de distribución están herméticas.';
      } else if (lower.includes('presion') || lower.includes('bomba')) {
        replyText = `Tu bomba presurizadora está calibrada a ${sys.pressure} bar en modo automático con recirculación activa. Si requieres pausarla, puedes hacerlo desde los Controles del Hogar en Inicio.`;
      } else if (lower.includes('nivel') || lower.includes('cisterna') || lower.includes('reserva')) {
        replyText = `Tu cisterna (${sys.name}) cuenta con el ${Math.round(sys.level * 100)}% de llenado (${Math.round(sys.capacity * sys.level).toLocaleString()} Litros disponibles), lo que garantiza más de 48 horas de autonomía estimada con tu promedio de consumo.`;
      } else if (lower.includes('esp32') || lower.includes('sensor') || lower.includes('conexion')) {
        replyText = `El módulo ${sys.deviceId} reporta conexión Wi-Fi estable (RSSI -58 dBm) con un intervalo de sincronización cada 3 segundos y batería al 98%.`;
      } else if (lower.includes('riego') || lower.includes('jardin')) {
        replyText =
          'El sistema predictivo sugiere programar el riego a las 06:00 AM para reducir la evaporación en un 28% y aprovechar la presión óptima de la red.';
      }

      nextIdRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: nextIdRef.current,
          sender: 'agent',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full min-h-0 flex-1 flex flex-col justify-between bg-white dark:bg-[#0B1726] overflow-hidden transition-colors">
      {/* 1. Cabecera Fija del Chat */}
      <div className="shrink-0 px-5 sm:px-6 pt-5 pb-2 bg-white dark:bg-[#0B1726] border-b border-slate-100/80 dark:border-slate-800/60">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Asistente Hídrico
          </h2>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-snug mb-3">
          Consulta telemetría, presión y niveles en tiempo real.
        </p>

        {/* Tarjeta de Presencia del Bot con Animación Rive */}
        <TarjetaEncabezadoAgente agentName="HydroBot IA" status="En línea" />

        {/* Chips de Consultas Rápidas de Telemetría Hídrica */}
        <SugerenciasRapidas onSelectPrompt={(q) => handleSendMessage(q)} />
      </div>

      {/* 2. Área Central de Conversación (Único Scroll Interno) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 space-y-3 no-scrollbar">
        {messages.map((msg) => (
          <BurbujaMensaje key={msg.id} message={msg} />
        ))}

        {isTyping && <IndicadorEscribiendo />}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Barra Inferior Fija de Entrada de Mensaje (Despejada encima de la Navbar) */}
      <div className="shrink-0 w-full z-20 px-4 sm:px-6 pt-3 pb-10 bg-white dark:bg-[#0B1726] border-t border-slate-100 dark:border-slate-800/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 p-1.5 pl-4 rounded-full bg-slate-100 dark:bg-[#101F30] border border-slate-200/80 dark:border-slate-800/80 focus-within:border-[#00C2FF] focus-within:ring-2 focus-within:ring-[#00C2FF]/20 transition-all shadow-xs"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu consulta..."
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => handleSendMessage('¿Cómo está el nivel de mi cisterna hoy?')}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 active:scale-95 transition cursor-pointer"
            title="Consulta rápida"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={!inputText.trim() && !isTyping}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00C2FF] to-[#0284C7] text-white flex items-center justify-center hover:shadow-md hover:shadow-[#00C2FF]/30 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shrink-0"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAyudaInteligente;
