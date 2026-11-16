import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useRive,
  Layout,
  Fit,
  Alignment,
  StateMachineInputType,
} from '@rive-app/react-canvas';
import { useAuth } from '../context/AuthContext';

const quickReplySuggestions = [
  { id: 'nivel', text: '💧 Nivel y reserva de cisterna' },
  { id: 'bomba', text: '⚡ Estado de bomba y presión' },
  { id: 'fugas', text: '🛡️ Diagnóstico de fugas' },
  { id: 'consumo', text: '📊 Reporte de consumo actual' },
];

const initialChatMessages = [
  {
    id: 1,
    sender: 'agent',
    text: '¡Hola! Soy HydroBot IA, tu asistente hídrico inteligente. Estoy monitoreando la telemetría en tiempo real de tu vivienda.',
    time: '08:16 AM',
  },
  {
    id: 2,
    sender: 'user',
    text: 'Veo que mi cisterna está al 85%. ¿La presión de la tubería es la adecuada?',
    time: '08:20 AM',
  },
  {
    id: 4,
    sender: 'agent',
    text: 'Telemetría de Casa de Campo / Vacacional: la presión se encuentra en 2.8 bar y la reserva estimada es de 8500 Litros. Tu sensor ESP32-HYDRO-9120 está conectado y el flujo es de 0 L/min.',
    time: '08:21 AM',
  },
  {
    id: 5,
    sender: 'agent',
    text: 'No se registran caídas de presión anormales en los últimos 30 minutos. La instalación opera dentro de parámetros nominales. 💧',
    time: '08:22 AM',
  },
];

/**
 * Actualiza los TextRuns internos expuestos en bot_2.riv al español
 */
const actualizarTextosInternosRive = (riveInstance, textoEspanol) => {
  if (!riveInstance || typeof riveInstance.setTextRunValue !== 'function') return;

  const posiblesNodosTexto = [
    'text',
    'Text',
    'TEXT',
    'label',
    'Label',
    'status',
    'Status',
    'message',
    'Message',
    'Hello!',
    'Let me think',
    'Bye',
    'how can I help you?',
  ];

  posiblesNodosTexto.forEach((nodeName) => {
    try {
      riveInstance.setTextRunValue(nodeName, textoEspanol);
    } catch (e) {
      // Ignorar si el nodo de texto no está expuesto con ese nombre
    }
  });
};

/**
 * Componente / Motor Reutilizable RiveBotPlayer
 * Configura la State Machine interactiva de bot_2.riv (personaje IDYL),
 * seguimiento ocular de cursor/toque, y transiciones mediante StateMachineInputType
 * y ViewModel Data Binding (VMIdly -> IdlyBool / IdlyTrig).
 */
export const RiveBotPlayer = ({
  mode = 'intro', // 'intro' | 'outro' | 'avatar'
  onBotReaction,
  className = 'w-full h-full',
}) => {
  const [riveInputs, setRiveInputs] = useState([]);
  const riveRef = useRef(null);

  const isAvatar = mode === 'avatar';

  const inicializarMaquinaEstados = useCallback(
    (riveInstance) => {
      if (!riveInstance) return;
      riveRef.current = riveInstance;

      const smNames = riveInstance.stateMachineNames || [];
      if (smNames.length > 0) {
        const mainSM = smNames[0];
        riveInstance.play(mainSM);
        const inputs = riveInstance.stateMachineInputs(mainSM) || [];
        setRiveInputs(inputs);

        if (mode === 'intro' || mode === 'avatar') {
          // Estado base de saludo (false)
          inputs.forEach((input) => {
            if (input.type === StateMachineInputType.Boolean) {
              input.value = false;
            }
          });
          try {
            const vmi = riveInstance.viewModelInstance;
            const boolProp = vmi?.boolean?.('IdlyBool');
            if (boolProp) boolProp.value = false;
          } catch (e) {}
          actualizarTextosInternosRive(
            riveInstance,
            '¡Hola! Toca al asistente para comenzar'
          );
        } else if (mode === 'outro') {
          // Estado de despedida ("Bye")
          inputs.forEach((input) => {
            if (input.type === StateMachineInputType.Boolean) {
              input.value = false;
            } else if (input.type === StateMachineInputType.Trigger) {
              input.fire();
            }
          });
          try {
            const vmi = riveInstance.viewModelInstance;
            const boolProp = vmi?.boolean?.('IdlyBool');
            if (boolProp) boolProp.value = false;
            const trigProp = vmi?.trigger?.('IdlyTrig');
            if (trigProp && typeof trigProp.trigger === 'function') {
              trigProp.trigger();
            }
          } catch (e) {}
          try {
            const anims = riveInstance.animationNames || [];
            if (anims.includes('Text Bye')) riveInstance.play('Text Bye');
            if (anims.includes('Sleep')) riveInstance.play('Sleep');
          } catch (e) {}
          actualizarTextosInternosRive(riveInstance, '¡Hasta luego! 👋');
        }
      }
    },
    [mode]
  );

  const { rive, RiveComponent } = useRive({
    src: '/assets/Animaciones/bot_2.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
    autoBind: true,
    layout: new Layout({
      fit: isAvatar ? Fit.Cover : Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoad: () => {
      if (!rive) return;
      const smNames = rive.stateMachineNames;
      if (smNames && smNames.length > 0) {
        const mainSM = smNames[0];
        rive.play(mainSM);
        const inputs = rive.stateMachineInputs(mainSM) || [];
        setRiveInputs(inputs);
      }
      try {
        rive.setTextRunValue(
          'text',
          mode === 'outro'
            ? '¡Hasta luego! 👋'
            : '¡Hola! Toca al asistente para comenzar'
        );
      } catch (e) {}
    },
  });

  useEffect(() => {
    if (!rive) return;
    inicializarMaquinaEstados(rive);
  }, [rive, inicializarMaquinaEstados]);

  // Activa la transición real de los inputs al interactuar con el Bot
  const triggerBotReaction = useCallback(() => {
    const activeRive = rive || riveRef.current;
    if (!activeRive) return;

    const smNames = activeRive.stateMachineNames || [];
    const currentInputs =
      riveInputs.length > 0
        ? riveInputs
        : smNames.length > 0
        ? activeRive.stateMachineInputs(smNames[0]) || []
        : [];

    currentInputs.forEach((input) => {
      if (input.type === StateMachineInputType.Trigger) {
        input.fire();
      } else if (input.type === StateMachineInputType.Boolean) {
        input.value = mode === 'outro' ? false : true;
      }
    });

    // Soporte complementario para ViewModel Data Binding de Rive (VMIdly -> IdlyBool / IdlyTrig)
    try {
      const vmi = activeRive.viewModelInstance;
      if (vmi) {
        const boolProp = vmi.boolean?.('IdlyBool');
        if (boolProp) {
          boolProp.value = mode === 'outro' ? false : true;
        }
        const trigProp = vmi.trigger?.('IdlyTrig');
        if (trigProp && typeof trigProp.trigger === 'function') {
          trigProp.trigger();
        }
      }
    } catch (e) {}

    // Reproducción explícita de los estados de pensamiento o despedida en caso de múltiples capas
    try {
      const anims = activeRive.animationNames || [];
      if (mode === 'intro') {
        if (anims.includes('Think A')) activeRive.play('Think A');
        if (anims.includes('Text Letmethink')) activeRive.play('Text Letmethink');
        actualizarTextosInternosRive(activeRive, 'Déjame pensar...');
      } else if (mode === 'outro') {
        if (anims.includes('Text Bye')) activeRive.play('Text Bye');
        if (anims.includes('Sleep')) activeRive.play('Sleep');
        actualizarTextosInternosRive(activeRive, '¡Hasta luego! 👋');
      }
    } catch (e) {}

    if (onBotReaction) {
      onBotReaction();
    }
  }, [rive, riveInputs, mode, onBotReaction]);

  if (isAvatar) {
    return (
      <div className="w-full h-full scale-[2.25] transform-gpu flex items-center justify-center pointer-events-none">
        <RiveComponent className="w-full h-full pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      onClick={triggerBotReaction}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') triggerBotReaction();
      }}
      aria-label={
        mode === 'intro'
          ? 'Toca al asistente HydroBot IA para comenzar'
          : 'Animación de despedida de HydroBot IA'
      }
      className={className}
    >
      <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-[42px] overflow-hidden relative flex items-center justify-center shadow-2xl shadow-cyan-500/20">
        <div className="w-full h-full flex items-center justify-center scale-[1.75] transform-gpu pointer-events-auto cursor-pointer">
          <RiveComponent className="w-full h-full pointer-events-auto cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

/**
 * Arreglos ampliados de expresiones mexicanas aleatorias para las etapas 'intro_bot' y 'outro_bot'
 */
const FRASES_SALUDO_BOT_MX = [
  '¡Qué onda! Tócame y vemos qué dudas tienes de la app 👋',
  '¡Qué tal! Dame un toque para empezar a ayudarte con tu sistema',
  '¡Hola! Pícame aquí y resolvemos cualquier duda de Hydro Home',
  '¡Buenas! Tócame para revisar tus niveles o explicarte la app 💧',
  '¡Ey, qué gusto verte! Tócame para arrancar el diagnóstico',
  '¡Quiúbole! Dame un toque y checamos cómo anda todo por acá',
  '¡Hola! ¿En qué función de la app te atoraste? Tócame para empezar',
  '¡Listo para chambear! Tócame y dime qué necesitas saber 🤖',
  '¡Qué onda! Pícale al asistente para ver tus sensores o pedir ayuda',
  '¡Bienvenido! Tócame para iniciar nuestra plática hídrica',
  '¡Hola, hola! Dame un toque y te guío paso a paso en la app',
  '¡Aquí andamos al cien! Tócame para comenzar la consulta',
  '¿Listo para checar tu agua o resolver dudas? ¡Tócame!',
  '¡Qué tal! Un toque y nos ponemos a revisar tu instalación ⚡',
  '¡Hola! Tócame para activar el modo asistente de HydroIntelligent',
];

const FRASES_PENSANDO_MX = [
  'Aguántame tantito, déjame pensar...',
  'A ver, deja le echo coco a tus datos...',
  'Dame chance, estoy analizando tus sensores...',
  '¡Órale! Déjame revisar cómo anda todo en la app...',
  'Espérame tantito, ya estoy checando la telemetría...',
  'Deja conecto las neuronas hídricas...',
  'Un segundito, deja veo qué onda con tu sistema...',
  'Aguanta las carnes, ya estoy cargando la info...',
  'Déjame echarle un ojo rápido a tu cisterna y bomba...',
  '¡Va! Deja proceso todo para darte el dato exacto...',
  'Un momento porfa, estoy sincronizando los módulos...',
  'Deja hago cuentas de tus litros y presión...',
  '¡Sale! Dame dos segundos en lo que preparo el chat...',
  'Espérame tantito, estoy leyendo los registros del ESP32...',
  'Deja me pongo trucha para responderte al cien...',
  'Analizando tuberías, niveles y manual de la app...',
  'Un instante, ya mero queda listo tu asistente...',
  '¡Órale pues! Deja cargo todas las herramientas de ayuda...',
];

const FRASES_DESPEDIDA_MX = [
  '¡Ahí nos vemos! Cuida mucho el agua 👋',
  '¡Sale vale! Aquí ando por si ocupas más ayuda con la app',
  '¡Nos vemos luego! Todo queda monitoreado al cien',
  '¡Cámara! Cualquier duda con tus sensores me echas un grito',
  '¡Hasta luego! Seguimos al pendiente de tu cisterna 💧',
  '¡Va que va! Nos vemos en la próxima consulta',
  '¡Órale pues! Que tengas un excelente día 👋',
  '¡Nos vidrios! Aquí me quedo cuidando tus tuberías',
  '¡Chido! Si te surge otra duda de la app, ya sabes dónde picarle',
  '¡Ahí estamos! Que no falte el agua en casa',
  '¡Sale pues! Me paso a retirar, cualquier cosa me llamas 🤖',
  '¡Hasta pronto! Sigue echándole un ojo a tus niveles',
  '¡Arre! Aquí me quedo en guardia por si pasa algo',
  '¡Que te vaya súper bien! Aquí sigo por si ocupas otro paro',
  '¡Nos vemos! Recuerda revisar el apartado de Incidencias si ves algo raro',
  '¡Listo calisto! Ahí nos vemos cuando necesites más ayuda',
  '¡Cuídate mucho! Yo sigo vigilando la presión de tu red ⚡',
  '¡Bye bye! Un gusto echarte la mano hoy 👋',
];

const ultimasFrasesPorCategoria = {
  saludo: '',
  pensando: '',
  despedida: '',
};

const pickRandomPhrase = (phrases, categoryKey) => {
  const anterior = ultimasFrasesPorCategoria[categoryKey] || '';
  let nueva = '';
  do {
    nueva = phrases[Math.floor(Math.random() * phrases.length)];
  } while (nueva === anterior && phrases.length > 1);
  ultimasFrasesPorCategoria[categoryKey] = nueva;
  return nueva;
};

/**
 * Globo de diálogo estilo cómic con pico inferior apuntando hacia la cabeza del bot
 */
const GloboDialogoComic = ({ text, isHighlight = false }) => (
  <motion.div
    key={text}
    initial={{ opacity: 0, scale: 0.9, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="relative max-w-xs sm:max-w-sm z-20 pointer-events-none mb-6"
  >
    <div
      className={`bg-[#11192E]/90 backdrop-blur-md border rounded-[28px] px-6 py-3.5 shadow-lg transition-all duration-300 ${
        isHighlight
          ? 'border-cyan-300/60 shadow-cyan-400/30'
          : 'border-cyan-400/40 shadow-cyan-500/20'
      }`}
    >
      <p className="text-white font-medium text-base sm:text-lg text-center leading-snug">
        {text}
      </p>
    </div>

    {/* Pico / triángulo inferior apuntando directamente al personaje */}
    <div className="relative flex justify-center -mt-[1px]">
      <div
        className={`w-4 h-4 rotate-45 bg-[#11192E]/95 border-r border-b -mt-2 ${
          isHighlight ? 'border-cyan-300/60' : 'border-cyan-400/40'
        }`}
      />
    </div>
  </motion.div>
);

/**
 * ETAPA 2 ('intro_bot'):
 * Pantalla completa centrada entre el Header fijo y la Bottom Navbar fija sobre bg-[#090d16].
 * Muestra el globo de diálogo tipo cómic arriba del bot; al tocar al personaje cambia a una frase
 * aleatoria de FRASES_PENSANDO_MX durante 2600ms y transiciona suavemente hacia 'chat'.
 */
const EtapaIntroBot = ({ isTransitioning, onFinishIntro }) => {
  const [isThinking, setIsThinking] = useState(false);
  const [speechText, setSpeechText] = useState(() =>
    pickRandomPhrase(FRASES_SALUDO_BOT_MX, 'saludo')
  );
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleBotReaction = useCallback(() => {
    if (isThinking) return;
    setIsThinking(true);
    setSpeechText(pickRandomPhrase(FRASES_PENSANDO_MX, 'pensando'));

    timerRef.current = setTimeout(() => {
      onFinishIntro();
    }, 2600);
  }, [isThinking, onFinishIntro]);

  return (
    <div
      className={`flex-1 w-full h-full relative flex flex-col items-center justify-center bg-[#090d16] overflow-hidden px-6 select-none transition-all duration-500 ease-in-out ${
        isTransitioning
          ? 'opacity-0 -translate-y-4'
          : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Globo de Diálogo Tipo Cómic sobre el personaje */}
      <GloboDialogoComic text={speechText} isHighlight={isThinking} />

      {/* Lienzo Rive Interactivo con eventos de puntero habilitados */}
      <div className="w-full flex items-center justify-center relative">
        <RiveBotPlayer
          mode="intro"
          onBotReaction={handleBotReaction}
          className="relative flex items-center justify-center cursor-pointer"
        />
      </div>
    </div>
  );
};

/**
 * ETAPA 4 ('outro_bot'):
 * Pantalla completa ejecutando la animación de despedida ("Bye") de bot_2.riv.
 * Muestra el globo de diálogo tipo cómic con una frase aleatoria de FRASES_DESPEDIDA_MX
 * durante 2500ms y redirige automáticamente a 'home' con transición suave.
 */
const EtapaOutroBot = ({ onReturnHome }) => {
  const [speechText] = useState(() =>
    pickRandomPhrase(FRASES_DESPEDIDA_MX, 'despedida')
  );
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let fadeTimer = null;
    const redirectTimer = setTimeout(() => {
      setIsExiting(true);
      fadeTimer = setTimeout(() => {
        onReturnHome();
      }, 400);
    }, 2600);

    return () => {
      clearTimeout(redirectTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [onReturnHome]);

  return (
    <div
      className={`flex-1 w-full h-full relative flex flex-col items-center justify-center bg-[#090d16] overflow-hidden px-6 select-none animate-fadeIn transition-all duration-400 ease-in-out ${
        isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Globo de Diálogo Tipo Cómic de Despedida sobre el personaje */}
      <GloboDialogoComic text={speechText} isHighlight={true} />

      {/* Lienzo Rive Interactivo de Despedida */}
      <div className="w-full flex items-center justify-center relative">
        <RiveBotPlayer
          mode="outro"
          className="relative flex items-center justify-center cursor-pointer"
        />
      </div>
    </div>
  );
};

/**
 * Tarjeta del encabezado del asistente en la Etapa 3 ('chat')
 * Al hacer clic en el avatar circular de HydroBot IA ejecuta la transición hacia 'outro_bot'.
 */
const TarjetaEncabezadoAgente = ({ onExitChat }) => (
  <div className="flex items-center gap-4 p-3.5 bg-slate-50/90 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50">
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={onExitChat}
        title="Toca al bot para despedirte y salir"
        aria-label="Toca al bot para despedirte y salir"
        className="w-20 h-20 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-[#1a0b2e] ring-2 ring-cyan-400/50 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform p-0 relative"
      >
        <RiveBotPlayer mode="avatar" />
      </button>
      <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-800 z-10 pointer-events-none" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
          HydroBot IA
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
          IA Hídrica
        </span>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
        En línea · Respuesta inmediata
      </p>
      <button
        type="button"
        onClick={onExitChat}
        className="text-xs font-medium text-cyan-600 dark:text-cyan-400 flex items-center gap-1 mt-1 cursor-pointer hover:underline text-left"
      >
        Toca al bot para despedirte y salir
      </button>
    </div>
  </div>
);

/**
 * Burbuja de mensaje individual (compatible con Modo Claro y Modo Oscuro)
 */
const BurbujaMensaje = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[82%] px-5 py-3.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-r from-[#0284C7] to-[#2563EB] text-white rounded-[26px] rounded-br-md shadow-md'
            : 'bg-slate-100/95 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 rounded-[26px] rounded-bl-md shadow-sm border border-slate-200/80 dark:border-slate-700/60'
        }`}
      >
        {message.text}
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 px-2 font-medium">
        {message.time}
      </span>
    </motion.div>
  );
};

/**
 * Indicador animado de escritura del bot
 */
const IndicadorEscribiendo = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    className="flex items-start"
  >
    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
      />
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
      />
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
      />
    </div>
  </motion.div>
);

/**
 * Sugerencias rápidas de consulta
 */
const SugerenciasRapidas = ({ suggestions, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
    {suggestions.map((item) => (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect(item.text)}
        className="flex-shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-200 dark:hover:border-sky-800 transition-all active:scale-95 cursor-pointer"
      >
        {item.text}
      </button>
    ))}
  </div>
);

/**
 * Generador de respuestas inteligentes basadas en la telemetría del sistema activo
 */
const buildSmartResponse = (userText, telemetry, activeHouse) => {
  const lower = userText.toLowerCase();

  if (lower.includes('nivel') || lower.includes('cisterna') || lower.includes('agua')) {
    return `Tu cisterna en "${activeHouse.name}" se encuentra al ${telemetry.waterLevel}% (${telemetry.litersAvailable} L de ${activeHouse.capacityLiters} L). ${
      telemetry.waterLevel > 40
        ? 'El nivel es óptimo para el consumo habitual.'
        : 'Te recomendamos programar una recarga o activar la bomba.'
    }`;
  }

  if (lower.includes('bomba') || lower.includes('presión') || lower.includes('presion')) {
    return `La bomba está actualmente ${
      telemetry.isPumpActive ? 'ENCENDIDA (llenando cisterna)' : 'en REPOSO'
    } y la presión en línea es de ${telemetry.pressureBar} bar. La válvula principal se encuentra ${
      telemetry.isValveOpen ? 'ABIERTA' : 'CERRADA'
    }.`;
  }

  if (lower.includes('fuga') || lower.includes('alerta') || lower.includes('anomal') || lower.includes('incidencia') || lower.includes('averia') || lower.includes('avería') || lower.includes('tuberia') || lower.includes('tubería')) {
    return telemetry.leakDetected
      ? '⚠️ Se detectó una anomalía de flujo continuo. Te sugerimos revisar la red principal y registrar el daño en el módulo de Incidencias (Averías en Tuberías) desde Inicio.'
      : `Sin fugas activas en "${activeHouse.name}". El flujo actual es de ${telemetry.flowRateLpm} L/min y puedes consultar el historial técnico en el módulo de Incidencias / Averías en Tuberías.`;
  }

  if (lower.includes('consumo') || lower.includes('reporte') || lower.includes('gasto')) {
    return `El caudal instantáneo en "${activeHouse.name}" es de ${telemetry.flowRateLpm} L/min con ${telemetry.litersAvailable} L disponibles en reserva. Puedes descargar tu bitácora detallada en la pestaña Historial.`;
  }

  return `Recibido. En "${activeHouse.name}" tu cisterna está al ${telemetry.waterLevel}% (${telemetry.litersAvailable} L), presión de ${telemetry.pressureBar} bar y flujo de ${telemetry.flowRateLpm} L/min. ¿Deseas que revise algún parámetro en específico?`;
};

/**
 * Vista Principal del Asistente Hídrico ("HydroBot IA") con Flujo Interactivo de 4 Etapas:
 * 'home' | 'intro_bot' | 'chat' | 'outro_bot'
 */
export const ChatAyudaInteligente = ({
  telemetry: telemetryProp,
  activeHouse: activeHouseProp,
  onNavigateHome,
  botStage: externalBotStage,
  setBotStage: setExternalBotStage,
}) => {
  const { activeSystem } = useAuth() || {};

  const activeHouse = activeHouseProp || {
    name: activeSystem?.name || 'Casa de Campo / Vacacional',
    capacityLiters: activeSystem?.capacity || 10000,
    deviceCode: activeSystem?.deviceCode || 'ESP32-HYDRO-9120',
  };

  const rawLevel = activeSystem?.level ?? 0.85;
  const waterLevelPct =
    rawLevel <= 1 ? Math.round(rawLevel * 100) : Math.round(rawLevel);
  const capacityLiters = activeHouse.capacityLiters || 10000;

  const telemetry = telemetryProp || {
    waterLevel: waterLevelPct,
    litersAvailable: Math.round((waterLevelPct / 100) * capacityLiters),
    capacityLiters,
    isPumpActive: Boolean(activeSystem?.pumpActive ?? false),
    pressureBar: activeSystem?.pressure ?? 2.8,
    isValveOpen: true,
    leakDetected: false,
    flowRateLpm: activeSystem?.flowRate ?? 0,
  };

  const [internalBotStage, setInternalBotStage] = useState('intro_bot');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const botStage =
    externalBotStage && externalBotStage !== 'home'
      ? externalBotStage
      : internalBotStage;

  const updateBotStage = useCallback(
    (nextStage) => {
      setInternalBotStage(nextStage);
      if (setExternalBotStage) {
        setExternalBotStage(nextStage);
      }
    },
    [setExternalBotStage]
  );

  const [messages, setMessages] = useState(() =>
    initialChatMessages.map((msg) =>
      msg.id === 1
        ? {
            ...msg,
            text: `¡Hola! Soy HydroBot IA, tu asistente hídrico inteligente. Estoy monitoreando la telemetría en tiempo real de "${activeHouse.name}".`,
          }
        : msg.id === 4
        ? {
            ...msg,
            text: `Telemetría de ${activeHouse.name}: la presión se encuentra en ${telemetry.pressureBar} bar y la reserva estimada es de ${telemetry.litersAvailable} Litros. Tu sensor ${activeHouse.deviceCode} está conectado y el flujo es de ${telemetry.flowRateLpm} L/min.`,
          }
        : msg
    )
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const replyTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (botStage === 'chat') {
      scrollToBottom();
    }
  }, [messages, isTyping, botStage]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  // Transición Etapa 2 ('intro_bot') -> Etapa 3 ('chat')
  const handleFinishIntro = useCallback(() => {
    setIsTransitioning(true);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      updateBotStage('chat');
      setIsTransitioning(false);
    }, 500);
  }, [updateBotStage]);

  // Transición Etapa 3 ('chat') -> Etapa 4 ('outro_bot')
  const handleExitChat = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      updateBotStage('outro_bot');
      setIsTransitioning(false);
    }, 400);
  }, [isTransitioning, updateBotStage]);

  // Transición Etapa 4 ('outro_bot') -> Etapa 1 ('home')
  const handleReturnHome = useCallback(() => {
    updateBotStage('home');
    if (onNavigateHome) {
      onNavigateHome();
    }
  }, [updateBotStage, onNavigateHome]);

  const handleSendMessage = (textOverride) => {
    const messageToSend = (textOverride || inputText).trim();
    if (!messageToSend) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageToSend,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInputText('');
    setIsTyping(true);

    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    replyTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const replyText = buildSmartResponse(messageToSend, telemetry, activeHouse);
      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 1100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full w-full overflow-hidden">
      {/* ETAPA 2: Intro Bot a pantalla completa (desmontaje limpio WebGL) */}
      {botStage === 'intro_bot' && (
        <EtapaIntroBot
          isTransitioning={isTransitioning}
          onFinishIntro={handleFinishIntro}
        />
      )}

      {/* ETAPA 3: Interfaz de Conversación del Chat */}
      {botStage === 'chat' && (
        <div
          className={`flex flex-col flex-1 min-h-0 h-full overflow-hidden animate-fadeIn transition-all duration-400 ${
            isTransitioning
              ? 'opacity-0 scale-95 pointer-events-none'
              : 'opacity-100 scale-100'
          }`}
        >
          {/* Cabecera fija del chat */}
          <div className="flex-shrink-0 px-5 pt-5 pb-2 bg-white dark:bg-[#0B1726] z-10">
            <div className="mb-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Asistente Hídrico
              </h2>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              Consulta telemetría, presión y niveles en tiempo real.
            </p>

            {/* Tarjeta de HydroBot IA (única salida hacia 'outro_bot' al tocar el avatar) */}
            <TarjetaEncabezadoAgente onExitChat={handleExitChat} />

            {/* Sugerencias rápidas */}
            <div className="mt-2.5">
              <SugerenciasRapidas
                suggestions={quickReplySuggestions}
                onSelect={(text) => handleSendMessage(text)}
              />
            </div>
          </div>

          {/* Lista de mensajes con scroll interno independiente y mayor espaciado */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5 no-scrollbar bg-white dark:bg-[#0B1726]">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                08:16 AM
              </span>
            </div>

            {messages.map((msg) => (
              <BurbujaMensaje key={msg.id} message={msg} />
            ))}

            <AnimatePresence>{isTyping && <IndicadorEscribiendo />}</AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Barra de entrada fija sobre la Bottom Navbar */}
          <div className="flex-shrink-0 w-full bg-white dark:bg-[#0B1726] border-t border-slate-100 dark:border-slate-800/80 px-4 py-3 pb-6 z-20">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 rounded-full px-4 py-2 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta..."
                className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  handleSendMessage('👍 ¡Gracias por el reporte de telemetría!')
                }
                aria-label="Enviar agradecimiento rápido"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <Smile size={20} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                aria-label="Enviar mensaje"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim()
                    ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/25 active:scale-90 cursor-pointer'
                    : 'bg-sky-200/60 dark:bg-slate-700 text-white/70 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send size={15} strokeWidth={2.2} className="translate-x-[0.5px]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 4: Outro Bot a pantalla completa (desmontaje limpio WebGL) */}
      {botStage === 'outro_bot' && (
        <EtapaOutroBot onReturnHome={handleReturnHome} />
      )}
    </div>
  );
};
