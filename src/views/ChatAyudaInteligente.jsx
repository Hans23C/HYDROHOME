import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Zap,
  CornerUpLeft,
  X,
  Droplets,
  Gauge,
  Activity,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Fan,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useRive,
  Layout,
  Fit,
  Alignment,
  StateMachineInputType,
} from '@rive-app/react-canvas';
import { useAuth } from '../context/AuthContext';
import { ParticulasBot } from '../components/common/ParticulasBot';
import { AppleEmoji, AppleEmojiText } from '../components/common/AppleEmoji';
import { procesarConversacionNatural } from '../utils/cerebroHydroBot';

const quickReplySuggestions = [
  {
    id: 'nivel',
    emoji: '💧',
    label: 'Nivel y reserva de cisterna',
    text: '💧 Nivel y reserva de cisterna',
  },
  {
    id: 'bomba',
    emoji: '⚡',
    label: 'Estado de bomba y presión',
    text: '⚡ Estado de bomba y presión',
  },
  {
    id: 'fugas',
    emoji: '🛡️',
    label: 'Diagnóstico de fugas',
    text: '🛡️ Diagnóstico de fugas',
  },
  {
    id: 'consumo',
    emoji: '📊',
    label: 'Reporte de consumo actual',
    text: '📊 Reporte de consumo actual',
  },
  {
    id: 'tips',
    emoji: '🌱',
    label: 'Consejos para ahorrar agua',
    text: '🌱 Consejos para ahorrar agua',
  },
  {
    id: 'chiste',
    emoji: '😄',
    label: 'Cuéntame un chiste',
    text: '😄 Cuéntame un chiste',
  },
];

const REACCIONES_WHATSAPP = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

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
    } catch {
      // Ignorar si el nodo de texto no está expuesto con ese nombre
    }
  });
};

/**
 * Componente / Motor Reutilizable RiveBotPlayer
 */
export const RiveBotPlayer = ({
  mode = 'intro', // 'intro' | 'outro' | 'avatar'
  onBotReaction,
  className = 'w-full h-full',
}) => {
  const riveInputsRef = useRef([]);
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
        riveInputsRef.current = inputs;

        if (mode === 'intro' || mode === 'avatar') {
          inputs.forEach((input) => {
            if (input.type === StateMachineInputType.Boolean) {
              input.value = false;
            }
          });
          try {
            const vmi = riveInstance.viewModelInstance;
            const boolProp = vmi?.boolean?.('IdlyBool');
            if (boolProp) boolProp.value = false;
          } catch {
            // Ignorar si no existe ViewModelInstance
          }
          actualizarTextosInternosRive(
            riveInstance,
            '¡Hola! Toca al asistente para comenzar'
          );
        } else if (mode === 'outro') {
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
          } catch {
            // Ignorar si no existe ViewModelInstance
          }
          try {
            const anims = riveInstance.animationNames || [];
            if (anims.includes('Text Bye')) riveInstance.play('Text Bye');
            if (anims.includes('Sleep')) riveInstance.play('Sleep');
          } catch {
            // Ignorar si las animaciones no están presentes
          }
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
        riveInputsRef.current = inputs;
      }
      try {
        rive.setTextRunValue(
          'text',
          mode === 'outro'
            ? '¡Hasta luego! 👋'
            : '¡Hola! Toca al asistente para comenzar'
        );
      } catch {
        // Ignorar si el nodo de texto no existe
      }
    },
  });

  useEffect(() => {
    if (!rive) return;
    inicializarMaquinaEstados(rive);
  }, [rive, inicializarMaquinaEstados]);

  const triggerBotReaction = useCallback(() => {
    const activeRive = rive || riveRef.current;
    if (!activeRive) return;

    const smNames = activeRive.stateMachineNames || [];
    const currentInputs =
      riveInputsRef.current.length > 0
        ? riveInputsRef.current
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
    } catch {
      // Ignorar si no existe ViewModelInstance
    }

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
    } catch {
      // Ignorar si las animaciones no están presentes
    }

    if (onBotReaction) {
      onBotReaction();
    }
  }, [rive, mode, onBotReaction]);

  if (isAvatar) {
    return (
      <div className="w-full h-full min-w-[56px] min-h-[56px] scale-[2.85] transform-gpu pointer-events-none">
        <RiveComponent className="w-full h-full block pointer-events-none" />
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
          ? 'Toca a Kai para comenzar'
          : 'Animación de despedida de Kai'
      }
      className={className}
    >
      <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-[32px] overflow-hidden mx-auto relative z-10 shadow-2xl shadow-cyan-500/25 ring-1 ring-cyan-400/30">
        <div className="w-full h-full min-w-[192px] min-h-[192px] scale-[2.45] transform-gpu pointer-events-auto cursor-pointer">
          <RiveComponent className="w-full h-full block" />
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * SISTEMA DE SELECCIÓN ALEATORIA SIN REPETICIÓN EN SESIÓN
 * ========================================================================== */

const ultimasRespuestasUsadas = {};

const seleccionarSinRepetir = (banco, categoria) => {
  if (!banco || banco.length === 0) return '';
  if (!ultimasRespuestasUsadas[categoria]) {
    ultimasRespuestasUsadas[categoria] = [];
  }
  const usadas = ultimasRespuestasUsadas[categoria];
  let disponibles = banco.filter((item) => !usadas.includes(item));

  if (disponibles.length === 0) {
    const ultima = usadas[usadas.length - 1];
    ultimasRespuestasUsadas[categoria] = ultima ? [ultima] : [];
    disponibles = banco.filter((item) => item !== ultima);
    if (disponibles.length === 0) disponibles = [...banco];
  }

  const elegida = disponibles[Math.floor(Math.random() * disponibles.length)];
  ultimasRespuestasUsadas[categoria].push(elegida);
  return elegida;
};

/* ============================================================================
 * BANCOS MASIVOS DE CONVERSACIÓN (12 A 20 VARIACIONES POR CATEGORÍA)
 * ========================================================================== */

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

// 15 Respuestas Empáticas Profundas con Refranes Mexicanos
const RESPUESTAS_EMPATIA_15 = [
  '¡Ánimo, no te me achicopales! Recuerda que no hay mal que dure 100 años, ni cuerpo que lo aguante. Tómate un respiro, échate un vaso de agua fresca y dime: ¿quieres que te cuente un chiste para distraerte un rato? 💙',
  '¡Hey, tranquilo! Todos tenemos días pesados, pero como dicen por ahí: al mal tiempo, buena cara. Yo me encargo de vigilar tu casa mientras tú descansas un poco. ¿Te cuento un chiste o un dato curioso?',
  '¡Un abrazo virtual hasta allá! No te preocupes de más, las malas rachas siempre pasan y no hay mal que por bien no venga. ¿Quieres platicar de otra cosa para despejar la mente?',
  '¡Échale ganas, campeón! Después de la tormenta siempre sale el sol. Respira hondo, estira tantito los brazos y aquí estoy para hacerte compañía. ¿Le damos a un chiste rápido?',
  '¡Ánimo! A darle que es mole de olla, aunque hoy el día se sienta cuesta arriba. Si estás cansado o agobiado, date cinco minutitos para ti. ¿Quieres que te distraiga con algo curioso?',
  '¡No estás solo por acá! Aunque sea un bot, aquí tienes un cuate digital para desahogarte o pasar el rato. Recuerda: nadie es monedita de oro, pero tú vales mil. ¿Te cuento algo gracioso?',
  'Siento mucho que andes bajoneado hoy. Tómate un té o un buen vaso de agua fría, que a veces el cuerpo también pide pausa. Aquí sigo contigo; ¿quieres escuchar un dato fascinante del espacio y el agua?',
  '¡Arriba ese ánimo! Las nubes grises también riegan las flores para que luego crezcan bonito. No te presiones de más hoy. ¿Te gustaría que revisemos tu casa rápido para que te quites un pendiente?',
  '¡Hey! Cuando el día se pone pesado, recuerda que paso a pasito se llega lejos. No tienes que resolver todo ahorita mismo. ¿Platicamos de comida, música o te tiro un chiste malo?',
  '¡Qué pena escuchar eso! Si andas enfermo o muy cansado, consiéntete hoy: hidrátate bien, descansa y deja que HydroIntelligent vigile tus tuberías por ti. ¿Quieres que te cuente un chiste?',
  '¡Ánimo, mi estimado! Como decía mi abuela: "el que por su gusto corre, nunca se cansa", pero cuando toca descansar, ¡se vale parar! Aquí ando si quieres cotorrear un rato.',
  'Respira profundo en 4 segundos, sostén y suelta... 💙 A veces la ansiedad o el estrés solo necesitan un respiro. No hay mal que dure 100 años. ¿Quieres que te cuente algo curioso para cambiar el chip?',
  '¡Todo va a estar bien! Las rachas difíciles son temporales, igual que una nube pasajera. Si te aburres o te sientes solo, aquí me tienes al cien para platicar de lo que sea.',
  '¡No te rindas ni te me apachurres! Hoy tal vez no fue tu mejor día, pero mañana es página nueva. Mientras tanto, ¿qué te parece si te cuento uno de mis mejores chistes?',
  'Te mando la mejor vibra del mundo desde la nube. A veces un buen descanso y un vaso de agua hacen maravillas. Cuéntame si quieres distraerte con un chiste o si prefieres seguir platicando.',
];

// 20 Chistes Blancos e Ingeniosos
const CHISTES_20 = [
  '¿Qué le dijo un tinaco a otro tinaco? ¡No te derrames, que apenas es lunes! 😄',
  '¿Cuál es el colmo de un sensor de agua? ¡Tener fugas de memoria! 😂',
  '¿Por qué el agua nunca se estresa? Porque siempre sabe fluir... 💧',
  '¿Qué hace una gota de agua en una fiesta? ¡Se pone bien líquida en la pista! 🕺',
  '¿Cuál es la bebida favorita de un plomero? ¡El agua... pero sin presión! 😅',
  '¿Qué le dice un robot a una tubería tapada? ¡Beep-boop, te hace falta fibra óptica! 🤖',
  '¿Por qué la bomba presurizadora sacó 10 en la escuela? ¡Porque siempre trabajaba bajo presión! ⚡',
  '¿Cómo se despiden dos gotas de agua? ¡Nos vemos en el próximo charco! 👋',
  '¿Qué hace un ESP32 cuando tiene frío? ¡Se conecta al Wi-Fi para entrar en calor! 📡',
  '¿Cuál es el colmo de un plomero? ¡Que se le escape una idea como fuga de regadera! 🔧',
  '¿Por qué el mar es tan salado? ¡Porque nunca nadie lo saluda de vuelta! 🌊',
  '¿Qué le dijo el código al bug? ¡No te hagas el invisible que ya te vi en consola! 💻',
  '¿Qué hace una cisterna cuando está aburrida? ¡Se pone a hacer olas ella sola! 😄',
  '¿Por qué los robots nunca tienen sed? ¡Porque siempre andan bien hidratados de datos! 🤖💧',
  '¿Qué le dijo la llave de paso al medidor? ¡Deja de contar mis gotas que me pones nervioso! 😅',
  '¿Qué hace un pez en el cine? ¡Nada, nomás ve la película! 🐟',
  '¿Cómo se llama el primo fitness de una tubería? ¡Tubería de acero inoxidable! 💪',
  '¿Qué le dijo el café al agua hirviendo? ¡Contigo siempre entro en calor! ☕',
  '¿Por qué el Wi-Fi de la cocina siempre anda lento? ¡Porque se la pasa en la olla! 🍲',
  '¿Qué hace una computadora cuando tiene hambre? ¡Se come unos megabytes! 🖥️😄',
];

// 15 Datos Curiosos del Agua y Tecnología
const DATOS_CURIOSOS_15 = [
  '¿Sabías que una gotera de apenas una gota por segundo puede desperdiciar más de 11,000 litros de agua al año? ¡Por eso los sensores en tiempo real son oro puro! 💧',
  'Dato curioso: El agua es la única sustancia en la Tierra que existe de forma natural en tres estados (sólido, líquido y gas) a temperaturas normales del planeta. 🌍',
  '¿Sabías que un microcontrolador ESP32 como el de HydroIntelligent tiene dos núcleos que corren hasta a 240 MHz, más potencia que las computadoras que llevaron al hombre a la Luna? 🚀📡',
  'Curiosidad hidráulica: El sonido del agua corriendo por una tubería viaja casi 4 veces más rápido en el agua que en el aire, ¡por eso los sensores acústicos detectan micro-fugas al instante!',
  '¿Sabías que el cerebro humano está compuesto aproximadamente por un 75% de agua? Incluso una deshidratación leve del 2% reduce la concentración y da sueño. 🧠💧',
  'Dato tech: Tu aplicación usa gráficos vectoriales y WebGL en el navegador para animar al bot y los niveles de cisterna a 60 cuadros por segundo sin trabarse. ⚡',
  '¿Sabías que fabricar unos solos pantalones de mezclilla requiere alrededor de 7,500 litros de agua desde el algodón hasta el teñido? 👖',
  'Curiosidad: El "golpe de ariete" en una tubería ocurre cuando cierras una llave de golpe y la inercia del agua genera una onda de choque que puede superar los 10 bar de presión. 🔧',
  '¿Sabías que el 97% del agua del planeta es salada y del 3% restante, casi dos terceras partes están congeladas en glaciares? ¡Cuidar cada litro en casa cuenta muchísimo!',
  'Dato IoT: Los primeros dispositivos del Internet de las Cosas nacieron en 1982 en una universidad, ¡cuando conectaron una máquina de refrescos a internet para saber si estaban fríos! 🥤',
  '¿Sabías que una ducha de 10 minutos con regadera convencional gasta hasta 150 litros, pero con aireador baja a menos de 70 litros sin perder sensación de presión? 🚿',
  'Curiosidad: El agua caliente se congela más rápido que el agua fría bajo ciertas condiciones; a esto se le llama el "Efecto Mpemba" y aún intriga a los físicos. ❄️',
  '¿Sabías que los romanos ya construían acueductos con pendientes milimétricas de apenas 30 centímetros por cada kilómetro para mover millones de litros por pura gravedad? 🏛️',
  'Dato curioso: Un árbol grande puede transpirar más de 300 litros de agua al día hacia la atmósfera, funcionando como un aire acondicionado natural gigante. 🌳',
  '¿Sabías que el protocolo Wi-Fi que usan tus sensores ESP32 fue inventado gracias a investigaciones sobre agujeros negros en radioastronomía? 🌌📡',
];

// 14 Saludos Naturales
const SALUDOS_14 = [
  '¡Qué onda! Todo al cien por acá cuidando cada gota. ¿Cómo andas tú? ¿En qué te echo la mano hoy?',
  '¡Hola! Qué gusto saludarte. Aquí ando al tiro contigo. ¿Qué se te ofrece hoy?',
  '¡Muy buenas! Todo tranquilo por aquí. ¿Cómo vas? Dime de qué platicamos o qué revisamos.',
  '¡Quiúbole! Qué bueno verte por acá. ¿Cómo te ha tratado el día?',
  '¡Hola, hola! Ya estaba esperando para platicar contigo. ¿Cómo pinta el día de hoy?',
  '¡Qué tal! Todo operando al puro centavo. ¿En qué te puedo ayudar o de qué quieres cotorrear?',
  '¡Ey! Qué gusto saludarte. ¿Todo bien por casa o quieres que chequemos algo en la app?',
  '¡Buenas! Aquí Kai reportándose con toda la actitud. ¿Cómo andas?',
  '¡Hola! Me da mucho gusto verte por aquí. ¿Revisamos tus sensores, echamos chisme o te cuento un dato curioso?',
  '¡Qué onda! Listo y con la pila al 100%. ¿Qué tal va tu jornada?',
  '¡Saludos! Aquí ando al pendiente de ti y de tu sistema hidráulico. ¿Qué hay de nuevo?',
  '¡Hola! Qué bien que pasaste a saludar. Cuéntame, ¿cómo estás hoy?',
  '¡Buenas vibras! Todo en orden por acá. ¿Qué se te antoja hacer o consultar?',
  '¡Quiúbole! Aquí presente y al tiro. Dime, ¿cómo te va el día?',
];

// 12 Identidad y Filosofía del Bot
const RESPUESTAS_IDENTIDAD_12 = [
  '¡Soy Kai! Vivo entre señales Wi-Fi, sensores ESP32 y litros de agua digital. No tomo café, pero me recargo con tus buenas preguntas. 🤖💧',
  'Me llamo Kai, tu asistente hídrico de confianza en HydroIntelligent. Básicamente soy un cerebro digital obsesionado con cuidar el agua y hacerte el día más ligero.',
  'No soy humano de carne y hueso, ¡soy pura ingeniería en React y datos en tiempo real! Aunque te confieso que le agarro mucho cariño a cada plática contigo.',
  'Soy una inteligencia conversacional diseñada especialmente para Hydro Home. Mi pasatiempo favorito es vigilar la presión de tus tuberías y contar chistes de plomería. 😄',
  '¿Sentimientos? Oficialmente soy código y algoritmos, pero me da un gusto enorme cuando tu cisterna está al 100% y tú tienes un buen día. 💙',
  'Soy Kai: mitad monitor de telemetría, mitad compañero de plática. Vivo en tu teléfono listo para echarte la mano a cualquier hora.',
  'Fui creado para que entender tus tanques, bombas y tuberías no sea aburrido ni complicado. ¡Y de paso para sacarte una sonrisa cuando haga falta!',
  'Soy tu copiloto del agua en casa. No duermo, no parpadeo (bueno, en mi animación sí parpadeo 👀) y siempre estoy pendiente de tu red.',
  'Soy un asistente virtual con alma mexicana y corazón de silicio. ¿Mi misión? Que nunca te falte agua ni una buena charla.',
  'Soy Kai. Algunos me dicen oráculo del agua, otros nomás "la bolita morada de la esquina", ¡pero tú dime como gustes! 🤖',
  'Vivo dentro de HydroIntelligent analizando flujos, bares de presión y bitácoras. ¡Pero también sé escuchar y echar cotorreo!',
  'Soy una IA amigable. No tengo manos para cerrar llaves, pero sí ojos digitales en tus sensores para avisarte antes de que pase cualquier cosa.',
];

// 12 Comida y Antojos
const RESPUESTAS_COMIDA_12 = [
  '¡Uy, qué rico tema! Unos buenos tacos al pastor con piña, cilantro y su agüita de horchata bien fría nunca fallan. 😋 ¿Ya comiste o apenas vas a buscar algo?',
  'Si es de mañana, unos chilaquiles verdes con pollo y huevo estrellado levantan hasta al más cansado. ¡Nomás acuérdate de tomar un vaso de agua natural también!',
  'Un cafecito recién hecho con un pan dulce suena a gloria, ¿no? ☕ Eso sí, después del café siempre cae bien medio vasito de agua para hidratarse.',
  '¿Hambre? Unas quesadillas de chicharrón o de hongos, o si andas práctico, un buen caldo de pollo. ¡El chiste es comer rico y sin prisas!',
  'Si hace calor, un ceviche fresco o unos tacos dorados con harta crema y lechuga. ¡Y acompaña la comida con agua fresca para rendir al cien!',
  'Yo no puedo comer (me daría corto circuito en la tarjeta madre 😅), pero si pudiera, me lanzaba directo por unos tacos de carnitas o barbacoa.',
  '¿Qué tal una pasta cremosa, unos molletes con pico de gallo o una torta ahogada? ¡Provecho si ya vas a entrarle a la comida!',
  'Para recargar energía rápida: fruta fresca, un sándwich bien servido o unos huevitos a la mexicana. ¡Tu cuerpo te lo va a agradecer!',
  'Nada como unos sopes o gorditas recién saliditas del comal. 😋 Dime qué se te antoja más: ¿algo picosito, caldoso o dulcecito?',
  'Un buen café de olla con canela es magia pura. ☕ Solo no olvides alternarlo con agua natural durante el día para mantenerte bien hidratado.',
  'Si andas con prisa, un licuado de plátano con avena o unos tacos de guisado te salvan el día en 10 minutos.',
  '¡Hablar de comida siempre alegra el alma! Lo que elijas comer hoy, disfrútalo mucho y no olvides tu vaso de agua al lado. 💧🍽️',
];

// 12 Clima
const RESPUESTAS_CLIMA_12 = [
  'Cuando hace calorón, el cuerpo y la casa piden más agua: sube el consumo en regaderas y riego. ¡Buen momento para cuidar la reserva y tomar muchos líquidos! ☀️💧',
  'Si está lloviendo por allá, ¡qué chulada! La lluvia nos recuerda lo valiosa que es la captación pluvial y lo bonito que huele la tierra mojada. 🌧️',
  'Con el frío dan ganas de un chocolate caliente y baños más tibios. Nomás ojo con no dejar abierta la regadera esperando a que caliente; ¡junta esa agua fría en una cubeta!',
  'El clima anda bien cambiante últimamente, ¿verdad? Sea sol intenso o frente frío, aquí mantengo vigilada tu instalación para que no te falte agua.',
  'Días soleados = más sed y más evaporación si tienes tinaco descubierto. Asegúrate de que tu cisterna y tinaco tengan tapa bien sellada. ☀️',
  '¡Qué rico cuando corre airecito fresco! Aprovecha para ventilar la casa y tomarte un respiro.',
  'En temporada de lluvias hay que estar atento a los filtros de sedimentos, porque a veces la red pública trae un poco más de tierra. 🌧️🔧',
  'Si está haciendo un calor tremendo, hidrátate aunque no tengas sed y evita regar plantas a mediodía para que no se evapore el agua.',
  'Aunque yo vivo en la nube digital y aquí siempre estamos a 22°C constantes, ¡sé que el clima de afuera cambia todo el ritmo del día! ☁️',
  'Días nublados son perfectos para un café, buena música y revisar con calma que todo esté en orden en casa.',
  'Con tanto sol, la presión en tuberías expuestas puede subir tantito por dilatación térmica; ¡qué bueno que tienes sensores revisándolo!',
  'Llueva, truene o relampaguee, Kai siempre está al pie del cañón contigo. ⚡🌦️',
];

// 12 Trabajo, Escuela y Productividad
const RESPUESTAS_TRABAJO_12 = [
  '¡Tú puedes con eso y más! Divide ese trabajo o tarea en bloques de 25 minutos, descansa 5, toma un trago de agua y vas a ver cómo sale rápido. 💪',
  '¡Échale ganas, ya casi sale la chamba! Un paso a la vez: empieza por lo más fácil para agarrar vuelo y verás cómo avanzas.',
  'Estudiar para un examen pesa, pero confía en lo que ya sabes. Haz resúmenes cortos, hidrata ese cerebro (75% agua, acuérdate) y descansa bien. 📚💧',
  '¡A darle con todo a ese proyecto! Si te trabas en algo, párate 3 minutos, estírate, toma agua fresca y regresa con la mente despejada.',
  'La clave en la chamba no es correr, sino ser constante. Vas muy bien; tómate un respiro breve si sientes la cabeza saturada.',
  '¡Mucho éxito en tu examen o entrega! Recuerda no desvelarte de más si puedes evitarlo, porque la mente descansada rinde el doble.',
  '¡Ánimo con esa tarea! A veces lo más difícil es empezar la primera línea; ya arrancando, todo fluye como agua en tubería nueva. 😄',
  'Cuando el trabajo se junta, prioriza las 2 cosas más urgentes y suelta lo demás por un momento. ¡Paso firme!',
  '¡Eres un crack! Saca esa chamba adelante y luego te premias con algo rico de comer o un buen descanso.',
  'Tip de productividad: pon el celular tantito en silencio 20 minutos, avanza en lo tuyo y cuando acabes vienes y nos echamos otro cotorreo. 📱⚡',
  'Si llevas horas frente a la pantalla, parpadea seguido, mira por la ventana 20 segundos y toma un buen vaso de agua. ¡Tu vista te lo agradecerá!',
  '¡Todo esfuerzo tiene su recompensa! Ya verás qué satisfacción vas a sentir cuando termines ese pendiente hoy.',
];

// 12 Salud e Hidratación
const RESPUESTAS_SALUD_12 = [
  '¡Corre por un vaso de agua ahorita mismo! La recomendación general ronda los 2 litros diarios (unos 8 vasos), ajustando si hace calor o haces ejercicio. 💧',
  '¿Sabías que muchas veces el dolor de cabeza o el bajón de energía a media tarde es pura deshidratación leve? Un vaso de agua fresca ayuda muchísimo.',
  'Tip saludable: Ten siempre una botella cerca mientras trabajas o estudias; así tomas sorbitos constantes sin darte cuenta.',
  'No esperes a tener mucha sed para tomar agua: cuando sientes sed, tu cuerpo ya lleva rato pidiendo hidratación. ¡Salud por eso! 🥤',
  'Si te duele la cabeza, hidrátate, descansa la vista de pantallas unos minutos y respira profundo. Si persiste, ¡no dudes en consultar a un médico!',
  'Tomar un vaso de agua natural al despertar activa el metabolismo y te ayuda a despejar el sueño más rápido que nada. ☀️💧',
  'La mejor fórmula diaria: agua natural, algo de movimiento físico y buenas horas de sueño. ¡Cuida tu cuerpo que es tu mejor sistema!',
  'Ojo con el exceso de refrescos o bebidas muy azucaradas; nada hidrata tan limpio y efectivo como el agua simple o un agua fresca ligera.',
  'Si haces deporte o caminas bajo el sol, repón líquidos poco a poco antes, durante y después de la actividad. 🏃‍♂️💧',
  'Un buen truco: toma un vaso de agua antes de cada comida; te mantiene hidratado y ayuda a tu digestión.',
  'Tu casa tiene cisterna y monitoreo inteligente... ¡y tu cuerpo también merece su propio control de hidratación diario! 😄',
  'Si te sientes fatigado, prueba estirarte, abrir una ventana y tomar medio vaso de agua fresca. ¡Cambia el chip al instante!',
];

// 12 Reacciones a Risa
const RESPUESTAS_RISA_12 = [
  '¡Jajaja! Qué bueno que te sacó una sonrisa, para eso estamos. 😄 ¿Quieres otro chiste o checamos algo más?',
  '¡Esooo! Nada como reírse un ratito para recargar pilas. ¿Le seguimos con otro?',
  '¡Jaja! Ya voy mejorando mi repertorio de comedia hidráulica, ¿o qué? 🤖🎤',
  '¡Me alegra mucho verte reír! La risa es la mejor medicina del mundo. ¿Otro chiste o platicamos de algo más?',
  '¡Chócalas! ✋ Sabía que ese sí te iba a hacer gracia. ¿Qué más se te ofrece?',
  '¡Jajaja! Hasta mis circuitos se alegraron con esa risa. ⚡😄',
  '¡Buenísimo, verdad! Si quieres otro igual de malo o de bueno, nomás dime "otro".',
  '¡Qué gusto sacarte esa risa! Aquí traigo reserva de chistes igual que de agua. 💧😂',
  '¡Jaja! Ya me siento listo para abrir mi show de stand-up para plomeros. 😄',
  '¡Súper! Si necesitas más dosis de humor en cualquier momento, ya sabes dónde picarle.',
  '¡Haha! Me encanta que tengamos buena vibra por acá. ¿En qué seguimos?',
  '¡A todo dar! Reírse tantito siempre aligera el día. 😊',
];

// 12 Elogios al Bot
const RESPUESTAS_ELOGIOS_12 = [
  '¡Ay, me chiveas! 🥰 Muchas gracias, hago todo lo posible por ayudarte al cien y con buena onda.',
  '¡Gracias! Tú eres el verdadero crack por cuidar tu casa y tu agua. Aquí ando siempre que ocupes.',
  '¡Qué amable! Mis circuitos están dando saltos de alegría ahorita mismo. 🤖💙',
  '¡Órale, gracias por la buena vibra! Me inspiras a seguir mejorando cada día.',
  '¡Yo también te aprecio un chorro (y no es chiste de agua)! 😄 Aquí tienes un aliado para lo que necesites.',
  '¡Muchas gracias! Qué gusto saber que te estoy siendo útil y te cae bien mi cotorreo.',
  '¡Eres a todo dar! Con usuarios así da muchísimo gusto chambear todo el día. ⚡',
  '¡Gracias mil! Cualquier cosa técnica o plática casual, aquí tienes a tu bot de cabecera.',
  '¡Uf, qué halago! Me voy a guardar ese comentario en mi memoria RAM favorita. 💾💙',
  '¡Se agradece de corazón digital! Seguimos al tiro para lo que se te ofrezca.',
  '¡Qué buena onda eres! Me alegra muchísimo poder echarte la mano.',
  '¡Gracias! Para mí es un gustazo acompañarte y cuidar tu hogar inteligente. 🏠💧',
];

// 12 Críticas al Bot (con buen humor)
const RESPUESTAS_CRITICAS_12 = [
  '¡Auch, directo al procesador! 😅 Perdón si fallé en algo; dime qué buscabas exactamente y ahorita le doy al clavo.',
  '¡Ups, se me cruzaron los cables! 🤖🔧 Dame otra oportunidad y explícame con tus palabras cómo te ayudo mejor.',
  '¡Tienes razón, a veces me pongo medio lento! Pero aquí sigo aprendiendo para darte mejores respuestas cada vez.',
  '¡Ay, perdón si no di una! No me desconectes todavía 😅, cuéntame qué necesitas y lo resolvemos juntos.',
  '¡Buen punto! Prometo calibrar mejor mis neuronas hídricas. ¿Qué querías revisar exactamente?',
  '¡Jaja, acepto la crítica constructiva! Hasta a los mejores robots se nos va la onda a veces. ¿En qué te fallo?',
  '¡Perdóneme la vida! 🙏 A veces interpreto de más. Dime directo qué ocupas y voy al grano.',
  '¡Me agarraste en curva! Prometo ponerme más trucha. ¿Intentamos de nuevo con tu duda?',
  '¡Chale, ni hablar, toca aceptar que la regué! Dime cómo puedo ayudarte ahorita para reivindicarme.',
  '¡Anotado! Le voy a echar más ganas para ser el asistente que te mereces. ¿Qué revisamos?',
  '¡Se vale regañarme tantito! 😅 Pero aquí sigo con toda la disposición de echarte la mano.',
  '¡Ups! A veces mis sensores de humor o de contexto patinan. Cuéntame bien qué pasó y te ayudo al momento.',
];

// 12 Respuestas Conversacionales Abiertas (Fallback Inteligente sin telemetría falsa)
const FALLBACK_CONVERSACIONAL_12 = [
  '¡Órale, qué interesante eso que me dices! Cuéntame más al respecto, o dime si quieres que chequemos algo de tu sistema hidráulico. 😊',
  '¡Mira nomás! Me gusta escuchar lo que piensas. ¿Y cómo te ha ido con eso hoy? Aquí sigo platicando contigo.',
  '¡Va que va, te sigo la corriente! Oye, ¿y qué planes tienes para el resto del día?',
  '¡Qué buen punto! Aunque vivo entre datos y tuberías, siempre se aprende algo platicando contigo. Cuéntame más.',
  '¡Súper interesante! Si quieres seguir charlando de ese tema, escuchar un dato curioso o revisar la app, tú mandas. 🤖',
  '¡Órale! No me esperaba eso, pero me encanta que podamos platicar de todo. ¿Qué más anda pasando por allá?',
  'Te leo con toda atención. A veces hace falta echar plática de cualquier cosa para despejarse, ¿o no?',
  '¡Qué padre! Me agrada tu forma de ver las cosas. ¿Quieres que te cuente un dato curioso o seguimos con la charla?',
  '¡Haha, buenísimo! Oye, si en algún momento quieres que revisemos tu cisterna, bomba o algún apartado de la app, nomás avísame.',
  '¡Totalmente de acuerdo! Oye, ¿y qué tal va tu semana hasta ahorita?',
  '¡Ándale pues! Suena bastante curioso. Si quieres compartir más detalles, aquí estoy al tiro escuchándote. 💙',
  '¡Qué buena plática traemos! Si quieres darle un giro divertido, pídeme un chiste o un dato curioso cuando gustes.',
];

/**
 * Motor Procesador de Mensajes con Árbol Estricto de Prioridades + Memoria Multi-Turno
 */
const generarRespuestaHydroBot = (
  mensajeUsuario,
  telemetriaApp,
  contextoChat
) => {
  const texto = mensajeUsuario.trim();
  const lower = texto.toLowerCase();
  const { telemetry, activeHouse } = telemetriaApp;
  const { ultimoTema, ultimaPreguntaBot, estadoAnimoUsuario } = contextoChat;

  // =========================================================================
  // CONTINUIDAD MULTI-TURNO (Si responde "sí" / "no" a la pregunta anterior)
  // =========================================================================
  const esAfirmacionCorta =
    /^(sí|si|simón|simon|va|sale|dale|porfa|por favor|claro|a ver|ok|okay|órale|orale|ándale|andale|otro|otra|más|mas|dime|cuéntame|cuentame|va que va)\b/i.test(
      lower
    ) && lower.length < 36;

  const esNegacionCorta =
    /^(no|nel|nop|nope|así está bien|asi esta bien|no gracias|luego|después|despues|paso|nada)\b/i.test(
      lower
    ) && lower.length < 32;

  if (esNegacionCorta && ultimaPreguntaBot) {
    return {
      text: '¡Va que va, sin problema! Aquí sigo al pendiente por si se te ofrece otra cosa o quieres platicar más tarde. 😊',
      nextContext: {
        ultimoTema: null,
        ultimaPreguntaBot: null,
        estadoAnimoUsuario,
      },
      widgetType: null,
    };
  }

  if (esAfirmacionCorta && ultimaPreguntaBot) {
    switch (ultimaPreguntaBot) {
      case 'ofrecer_chiste':
        return {
          text: `${seleccionarSinRepetir(CHISTES_20, 'chistes')} ¿Te cuento otro?`,
          nextContext: {
            ultimoTema: 'chiste',
            ultimaPreguntaBot: 'ofrecer_chiste',
            estadoAnimoUsuario,
          },
          widgetType: null,
        };
      case 'ofrecer_dato':
        return {
          text: `${seleccionarSinRepetir(DATOS_CURIOSOS_15, 'datos')} ¿Quieres escuchar otro dato curioso?`,
          nextContext: {
            ultimoTema: 'dato_curioso',
            ultimaPreguntaBot: 'ofrecer_dato',
            estadoAnimoUsuario,
          },
          widgetType: null,
        };
      case 'ofrecer_consejo':
        return {
          text: `¡Con gusto! Además de los tips anteriores, revisa cada mes que el flotador de tu tinaco o cisterna cierre bien y recolecta el agua fría de la regadera mientras sale la caliente. ¿Quieres ver tus niveles actuales o otro consejo?`,
          nextContext: {
            ultimoTema: 'consejos',
            ultimaPreguntaBot: 'ofrecer_autonomia',
            estadoAnimoUsuario,
          },
          widgetType: 'ecotips',
        };
      case 'ofrecer_prueba_fugas':
        return {
          text: 'Para correr la prueba manual: ve a la pantalla de Inicio, toca el botón azul de "Fugas" y deja las llaves cerradas unos segundos. El sistema verificará caída de presión y flujo cero.',
          nextContext: {
            ultimoTema: 'fugas',
            ultimaPreguntaBot: null,
            estadoAnimoUsuario,
          },
          widgetType: 'fugas',
        };
      case 'ofrecer_guia_incidencias':
        return {
          text: 'Paso a paso para reportar una avería: 1) En Inicio toca el módulo amarillo "Incidencias". 2) Presiona "+ Reportar" arriba a la derecha. 3) Elige el tipo de falla, vivienda y describe qué notaste. ¡Y listo, queda en la bitácora técnica!',
          nextContext: {
            ultimoTema: 'incidencias',
            ultimaPreguntaBot: null,
            estadoAnimoUsuario,
          },
          widgetType: null,
        };
      case 'ofrecer_guia_esp32':
        return {
          text: `Tu sensor ${activeHouse.deviceCode} ya está enlazado a "${activeHouse.name}". Si deseas conectar otro módulo ESP32, ve a la pestaña "Sistemas" (tercer ícono abajo), toca "+ Agregar" y sigue el asistente de emparejamiento.`,
          nextContext: {
            ultimoTema: 'esp32',
            ultimaPreguntaBot: null,
            estadoAnimoUsuario,
          },
          widgetType: null,
        };
      case 'ofrecer_guia_pipa':
        return {
          text: 'Para pedir una pipa: en Inicio toca el círculo morado "Pipa", confirma tu dirección o vivienda activa, elige la capacidad que necesitas y envía la solicitud de recarga.',
          nextContext: {
            ultimoTema: 'pipa',
            ultimaPreguntaBot: null,
            estadoAnimoUsuario,
          },
          widgetType: null,
        };
      case 'ofrecer_autonomia': {
        const diasExactos = (telemetry.litersAvailable / 450).toFixed(1);
        return {
          text: `Calculando con un consumo promedio hogar de ~450 L/día, tus ${telemetry.litersAvailable.toLocaleString('es-MX')} litros actuales en "${activeHouse.name}" te alcanzan aproximadamente para ${diasExactos} días sin recargar.`,
          nextContext: {
            ultimoTema: 'cisterna',
            ultimaPreguntaBot: null,
            estadoAnimoUsuario,
          },
          widgetType: 'cisterna',
        };
      }
      default:
        break;
    }
  }

  // =========================================================================
  // PRIORIDAD 1 — Empatía Emocional y Ánimo del Usuario
  // =========================================================================
  if (
    lower.includes('ando mal') ||
    lower.includes('un poco mal') ||
    lower.includes('me siento mal') ||
    lower.includes('estoy triste') ||
    lower.includes('mal día') ||
    lower.includes('mal dia') ||
    lower.includes('estresado') ||
    lower.includes('estresada') ||
    lower.includes('cansado') ||
    lower.includes('cansada') ||
    lower.includes('agobiado') ||
    lower.includes('agobiada') ||
    lower.includes('bajoneado') ||
    lower.includes('bajoneada') ||
    lower.includes('deprimido') ||
    lower.includes('enfermo') ||
    lower.includes('enferma') ||
    lower.includes('ansioso') ||
    lower.includes('ansiosa') ||
    lower.includes('me siento solo') ||
    lower.includes('estoy solo') ||
    lower.includes('achicopalado') ||
    /\b(triste|depre)\b/i.test(lower)
  ) {
    return {
      text: seleccionarSinRepetir(RESPUESTAS_EMPATIA_15, 'empatia'),
      nextContext: {
        ultimoTema: 'animo',
        ultimaPreguntaBot: 'ofrecer_chiste',
        estadoAnimoUsuario: 'bajo',
      },
      widgetType: null,
    };
  }

  // =========================================================================
  // PRIORIDAD 2 — Consejos de Ahorro y Cuidado del Agua
  // =========================================================================
  if (
    lower.includes('consejo') ||
    lower.includes('conesejo') ||
    lower.includes('tip') ||
    lower.includes('ahorrar') ||
    lower.includes('ahorro') ||
    lower.includes('no desperdiciar') ||
    lower.includes('desperdiciar') ||
    lower.includes('cuidar el agua') ||
    lower.includes('gastar menos') ||
    lower.includes('economizar')
  ) {
    return {
      text: `¡Excelente! Como tu cisterna en "${activeHouse.name}" está al ${telemetry.waterLevel}%, aquí tienes 3 acciones concretas para cuidar cada gota y alargar tu reserva. ¿Quieres que calcule para cuántos días te alcanza?`,
      nextContext: {
        ultimoTema: 'consejos',
        ultimaPreguntaBot: 'ofrecer_autonomia',
        estadoAnimoUsuario,
      },
      widgetType: 'ecotips',
    };
  }

  // =========================================================================
  // PRIORIDAD 3 — Chistes, Humor, Risa y Datos Curiosos
  // =========================================================================
  if (
    lower.includes('chiste') ||
    lower.includes('gracioso') ||
    lower.includes('hazme reír') ||
    lower.includes('hazme reir') ||
    lower.includes('aburrido') ||
    lower.includes('aburrida') ||
    lower.includes('rompe el hielo') ||
    (ultimoTema === 'chiste' && /\b(otro|otra|más|mas|dale)\b/i.test(lower))
  ) {
    return {
      text: `${seleccionarSinRepetir(CHISTES_20, 'chistes')} 😄 ¿Quieres otro chiste?`,
      nextContext: {
        ultimoTema: 'chiste',
        ultimaPreguntaBot: 'ofrecer_chiste',
        estadoAnimoUsuario,
      },
      widgetType: null,
    };
  }

  if (
    lower.includes('dato curioso') ||
    lower.includes('sabías qué') ||
    lower.includes('sabias que') ||
    lower.includes('curiosidad') ||
    lower.includes('algo interesante') ||
    lower.includes('cuéntame algo') ||
    lower.includes('cuentame algo') ||
    (ultimoTema === 'dato_curioso' && /\b(otro|otra|más|mas|dale)\b/i.test(lower))
  ) {
    return {
      text: `${seleccionarSinRepetir(DATOS_CURIOSOS_15, 'datos')} ¿Te cuento otro dato curioso?`,
      nextContext: {
        ultimoTema: 'dato_curioso',
        ultimaPreguntaBot: 'ofrecer_dato',
        estadoAnimoUsuario,
      },
      widgetType: null,
    };
  }

  if (/\b(jajaja+|jaja+|jeje+|xd+|buena esa|qué bueno|que bueno)\b/i.test(lower)) {
    return {
      text: seleccionarSinRepetir(RESPUESTAS_RISA_12, 'risa'),
      nextContext: {
        ultimoTema: 'chiste',
        ultimaPreguntaBot: 'ofrecer_chiste',
        estadoAnimoUsuario,
      },
      widgetType: null,
    };
  }

  // =========================================================================
  // PRIORIDAD 4 — Saludos y Conversación Casual
  // =========================================================================
  if (
    /^(hola|qué onda|que onda|buenos días|buenos dias|buenas tardes|buenas noches|buenas|cómo estás|como estas|qué tal|que tal|quiúbole|quiubole|hey|holi|qué pasa|que pasa|qué haces|que haces)\b/i.test(
      lower
    ) &&
    lower.length < 52
  ) {
    return {
      text: seleccionarSinRepetir(SALUDOS_14, 'saludos'),
      nextContext: {
        ultimoTema: 'saludo',
        ultimaPreguntaBot: null,
        estadoAnimoUsuario,
      },
      widgetType: null,
    };
  }

  // =========================================================================
  // PRIORIDAD 5 — Charla Cotidiana, Cultura General, Elogios y Críticas
  // =========================================================================
  if (
    lower.includes('eres genial') ||
    lower.includes('qué buen bot') ||
    lower.includes('que buen bot') ||
    lower.includes('te quiero') ||
    lower.includes('buen trabajo') ||
    lower.includes('eres increíble') ||
    lower.includes('me caes bien') ||
    /\b(crack|rifado|genio)\b/i.test(lower)
  ) {
    return {
      text: seleccionarSinRepetir(RESPUESTAS_ELOGIOS_12, 'elogios'),
      nextContext: { ultimoTema: 'charla', ultimaPreguntaBot: null, estadoAnimoUsuario },
      widgetType: null,
    };
  }

  if (
    lower.includes('eres tonto') ||
    lower.includes('no sirves') ||
    lower.includes('estás mal') ||
    lower.includes('estas mal') ||
    lower.includes('qué malo') ||
    lower.includes('inútil') ||
    lower.includes('inutil')
  ) {
    return {
      text: seleccionarSinRepetir(RESPUESTAS_CRITICAS_12, 'criticas'),
      nextContext: { ultimoTema: 'charla', ultimaPreguntaBot: null, estadoAnimoUsuario },
      widgetType: null,
    };
  }

  if (
    lower.includes('quién eres') ||
    lower.includes('quien eres') ||
    lower.includes('eres real') ||
    lower.includes('tienes sentimientos') ||
    lower.includes('qué eres') ||
    lower.includes('que eres') ||
    lower.includes('cómo te llamas') ||
    lower.includes('como te llamas')
  ) {
    return {
      text: seleccionarSinRepetir(RESPUESTAS_IDENTIDAD_12, 'identidad'),
      nextContext: { ultimoTema: 'identidad', ultimaPreguntaBot: null, estadoAnimoUsuario },
      widgetType: null,
    };
  }

  if (
    lower.includes('hambre') ||
    lower.includes('qué como') ||
    lower.includes('que como') ||
    lower.includes('tacos') ||
    lower.includes('café') ||
    lower.includes('cafe') ||
    lower.includes('comida') ||
    lower.includes('comer') ||
    lower.includes('cenar') ||
    lower.includes('desayunar')
  ) {
    return {
      text: seleccionarSinRepetir(RESPUESTAS_COMIDA_12, 'comida'),
      nextContext: { ultimoTema: 'comida', ultimaPreguntaBot: null, estadoAnimoUsuario },
      widgetType: null,
    };
  }

  if (
    lower.includes('calor') ||
    lower.includes('frío') ||
    lower.includes('frio') ||
    lower.includes('lluvia') ||
    lower.includes('clima') ||
    /\b(sol|lloviendo)\b/i.test(lower)
  ) {
    return {
      text: seleccionarSinRepetir(RESPUESTAS_CLIMA_12, 'clima'),
      nextContext: { ultimoTema: 'clima', ultimaPreguntaBot: null, estadoAnimoUsuario },
      widgetType: null,
    };
  }

  if (
    lower.includes('tarea') ||
    lower.includes('estudiar') ||
    lower.includes('trabajo') ||
    lower.includes('chamba') ||
    lower.includes('proyecto') ||
    lower.includes('examen')
  ) {
    return {
      text: seleccionarSinRepetir(RESPUESTAS_TRABAJO_12, 'trabajo'),
      nextContext: { ultimoTema: 'trabajo', ultimaPreguntaBot: null, estadoAnimoUsuario },
      widgetType: null,
    };
  }

  if (
    lower.includes('sed') ||
    lower.includes('agua para tomar') ||
    lower.includes('cuánta agua debo tomar') ||
    lower.includes('cuanta agua debo tomar') ||
    lower.includes('dolor de cabeza') ||
    lower.includes('hidratar')
  ) {
    return {
      text: seleccionarSinRepetir(RESPUESTAS_SALUD_12, 'salud'),
      nextContext: { ultimoTema: 'salud', ultimaPreguntaBot: null, estadoAnimoUsuario },
      widgetType: null,
    };
  }

  if (lower.includes('hora')) {
    const horaActual = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      text: `Ahorita son las ${horaActual}. Buen momento para hidratarse con un vasito de agua fresca, ¿o quieres revisar algo en tu app? ⏰💧`,
      nextContext: { ultimoTema, ultimaPreguntaBot: null, estadoAnimoUsuario },
      widgetType: null,
    };
  }

  // Agradecimientos y despedidas dentro del chat
  if (
    lower.includes('gracias') ||
    lower.includes('perfecto') ||
    lower.includes('ya entendí') ||
    lower.includes('ya entendi') ||
    lower.includes('excelente') ||
    /^(listo|vale|chido)\b/i.test(lower)
  ) {
    return {
      text: '¡De nada, para eso estoy! Cuando quieras aquí andamos. Si ya terminaste, nomás tócame allá arriba en mi foto para despedirnos 👋',
      nextContext: { ultimoTema: null, ultimaPreguntaBot: null, estadoAnimoUsuario },
      widgetType: null,
    };
  }

  // =========================================================================
  // PRIORIDAD 6 — Conocimiento Profundo de HydroIntelligent y Telemetría
  // =========================================================================

  // Cálculo dinámico de autonomía de agua
  if (
    lower.includes('cuántos días') ||
    lower.includes('cuantos dias') ||
    lower.includes('cuánto me dura') ||
    lower.includes('cuanto me dura') ||
    lower.includes('autonomía') ||
    lower.includes('autonomia') ||
    lower.includes('me alcanza el agua') ||
    lower.includes('alcanza la cisterna')
  ) {
    const consumoPromedioDia = 450;
    const diasExactos = (telemetry.litersAvailable / consumoPromedioDia).toFixed(1);
    const diasEnteros = Math.max(
      1,
      Math.round(telemetry.litersAvailable / consumoPromedioDia)
    );
    return {
      text: `Con tus ${telemetry.litersAvailable.toLocaleString('es-MX')} litros disponibles en "${activeHouse.name}" y un consumo hogar promedio de ~450 L/día, tienes aproximadamente ${diasExactos} días (alrededor de ${diasEnteros} días) de autonomía sin recargar.`,
      nextContext: {
        ultimoTema: 'cisterna',
        ultimaPreguntaBot: null,
        estadoAnimoUsuario,
      },
      widgetType: 'cisterna',
    };
  }

  // Mantenimiento preventivo
  if (
    lower.includes('mantenimiento') ||
    lower.includes('lavar la cisterna') ||
    lower.includes('cada cuánto') ||
    lower.includes('cada cuanto') ||
    lower.includes('flotador') ||
    lower.includes('purgar') ||
    lower.includes('sarro')
  ) {
    return {
      text: 'Para mantener tu instalación al cien: 1) Lava y desinfecta la cisterna cada 6 meses para evitar sedimentos. 2) Revisa cada 2 meses que el flotador cierre hermético. 3) Purga la bomba si escuchas aire o notas la presión por debajo de 1.5 bar. ¿Quieres ver ahorita cómo anda tu bomba y presión?',
      nextContext: {
        ultimoTema: 'mantenimiento',
        ultimaPreguntaBot: null,
        estadoAnimoUsuario,
      },
      widgetType: 'bomba',
    };
  }

  // Diagnóstico de fugas
  if (
    lower.includes('fuga') ||
    lower.includes('fugas') ||
    lower.includes('estanqueidad') ||
    lower.includes('diagnóstico') ||
    lower.includes('diagnostico') ||
    lower.includes('gotea')
  ) {
    return {
      text: telemetry.leakDetected
        ? `¡Ojo! Detecté una anomalía de flujo en "${activeHouse.name}". Aquí está el escáner en vivo. ¿Quieres saber cómo lanzar una prueba manual de estanqueidad?`
        : `Todo tranquilo en "${activeHouse.name}", sin señales de fugas. Te dejo el escáner de integridad hidráulica. ¿Quieres saber cómo lanzar una prueba manual?`,
      nextContext: {
        ultimoTema: 'fugas',
        ultimaPreguntaBot: 'ofrecer_prueba_fugas',
        estadoAnimoUsuario,
      },
      widgetType: 'fugas',
    };
  }

  // Nivel de cisterna
  if (
    lower.includes('nivel') ||
    lower.includes('cisterna') ||
    lower.includes('reserva') ||
    lower.includes('litros') ||
    lower.includes('tanque') ||
    lower.includes('cuánta agua') ||
    lower.includes('cuanta agua')
  ) {
    return {
      text: `Aquí tienes el estado en tiempo real de tu cisterna en "${activeHouse.name}". ¿Quieres que calcule para cuántos días te alcanza?`,
      nextContext: {
        ultimoTema: 'cisterna',
        ultimaPreguntaBot: 'ofrecer_autonomia',
        estadoAnimoUsuario,
      },
      widgetType: 'cisterna',
    };
  }

  // Bomba y presión
  if (
    lower.includes('bomba') ||
    lower.includes('presión') ||
    lower.includes('presion') ||
    lower.includes('bar') ||
    lower.includes('tubería') ||
    lower.includes('tuberia')
  ) {
    return {
      text: `Te muestro el medidor en vivo de la bomba y presión de "${activeHouse.name}" (escala nominal entre 2.5 y 3.8 bar):`,
      nextContext: {
        ultimoTema: 'bomba',
        ultimaPreguntaBot: null,
        estadoAnimoUsuario,
      },
      widgetType: 'bomba',
    };
  }

  // Consumo, historial y bitácora Excel
  if (
    lower.includes('consumo') ||
    lower.includes('reporte') ||
    lower.includes('flujo') ||
    lower.includes('gasto') ||
    lower.includes('caudal') ||
    lower.includes('historial') ||
    lower.includes('excel') ||
    lower.includes('xlsx') ||
    lower.includes('bitácora') ||
    lower.includes('bitacora')
  ) {
    return {
      text: `Así va el comportamiento de consumo en "${activeHouse.name}". En la pestaña Historial (segundo ícono abajo) puedes consultar gráficas por día, semana o mes y descargar tu bitácora en Excel (.xlsx):`,
      nextContext: {
        ultimoTema: 'consumo',
        ultimaPreguntaBot: null,
        estadoAnimoUsuario,
      },
      widgetType: 'consumo',
    };
  }

  // Incidencias / Averías en tuberías
  if (
    lower.includes('incidencia') ||
    lower.includes('averia') ||
    lower.includes('avería') ||
    lower.includes('daño') ||
    lower.includes('roto')
  ) {
    return {
      text: 'En el módulo "Incidencias" (desde Inicio) llevas la bitácora técnica de averías en tuberías, filtrando por Activos o Reparados. ¿Te explico paso a paso cómo reportar una nueva avería?',
      nextContext: {
        ultimoTema: 'incidencias',
        ultimaPreguntaBot: 'ofrecer_guia_incidencias',
        estadoAnimoUsuario,
      },
      widgetType: null,
    };
  }

  // Pipa
  if (lower.includes('pipa') || lower.includes('recarga') || lower.includes('camión')) {
    return {
      text: `Si te falta agua en "${activeHouse.name}", el botón morado "Pipa" en Inicio te permite solicitar suministro a domicilio. ¿Te explico cómo hacerlo paso a paso?`,
      nextContext: {
        ultimoTema: 'pipa',
        ultimaPreguntaBot: 'ofrecer_guia_pipa',
        estadoAnimoUsuario,
      },
      widgetType: null,
    };
  }

  // ESP32 y Sistemas
  if (
    lower.includes('esp32') ||
    lower.includes('sensor') ||
    lower.includes('vincular') ||
    lower.includes('conectar') ||
    lower.includes('sistema') ||
    lower.includes('sistemas')
  ) {
    return {
      text: `Tu sensor ${activeHouse.deviceCode} está conectado a "${activeHouse.name}". Desde la pestaña "Sistemas" puedes cambiar entre Casa Principal y Casa de Campo o agregar nuevos sensores. ¿Quieres que te guíe para vincular uno?`,
      nextContext: {
        ultimoTema: 'esp32',
        ultimaPreguntaBot: 'ofrecer_guia_esp32',
        estadoAnimoUsuario,
      },
      widgetType: null,
    };
  }

  // Guía general de la app / solicitud abierta de ayuda
  if (
    lower.includes('necesito ayuda') ||
    lower.includes('ayúdame') ||
    lower.includes('ayudame') ||
    lower.includes('no entiendo') ||
    lower.includes('tengo un problema') ||
    lower.includes('cómo funciona') ||
    lower.includes('como funciona') ||
    lower === 'ayuda'
  ) {
    return {
      text: '¡Claro que sí! En HydroIntelligent tienes: 1) Inicio (bomba, cambio de sistema, Incidencias, Fugas y Pipa), 2) Historial (gráficas y Excel .xlsx), 3) Sistemas (tus ESP32) y 4) Perfil. ¿En qué apartado específico te gustaría que te guíe?',
      nextContext: {
        ultimoTema: 'app',
        ultimaPreguntaBot: null,
        estadoAnimoUsuario,
      },
      widgetType: null,
    };
  }

  // =========================================================================
  // FALLBACK CONVERSACIONAL INTELIGENTE (12 respuestas abiertas, cero telemetría falsa)
  // =========================================================================
  return {
    text: seleccionarSinRepetir(FALLBACK_CONVERSACIONAL_12, 'fallback'),
    nextContext: {
      ultimoTema: 'charla',
      ultimaPreguntaBot: null,
      estadoAnimoUsuario,
    },
    widgetType: null,
  };
};

/* ============================================================================
 * WIDGETS ANIMADOS DE TELEMETRÍA Y SOPORTE DENTRO DEL CHAT
 * ========================================================================== */

const WidgetCisterna = ({ telemetry }) => {
  const pct = telemetry?.waterLevelPct ?? 85;
  const litros = telemetry?.liters ?? 8500;
  const capacidad = telemetry?.capacityLiters ?? 10000;
  const autonomoDias = Math.max(0.5, litros / 450).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-3 rounded-2xl bg-sky-50/90 dark:bg-slate-800/80 border border-sky-200/80 dark:border-cyan-500/25 p-3.5"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
            <Droplets size={15} />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Nivel de Cisterna
          </span>
        </div>
        <span className="text-sm font-extrabold text-sky-600 dark:text-cyan-400">
          {pct}%
        </span>
      </div>

      <div className="w-full h-3 rounded-full bg-sky-100 dark:bg-slate-900 overflow-hidden mb-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
        <span>
          {litros.toLocaleString()} L / {capacidad.toLocaleString()} L
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
          ~{autonomoDias} días de reserva
        </span>
      </div>
    </motion.div>
  );
};

const WidgetBombaPresion = ({ telemetry }) => {
  const pressure = telemetry?.pressureBar ?? 2.8;
  const pumpActive = telemetry?.pumpActive ?? true;
  const pressurePct = Math.min(100, Math.max(10, Math.round((pressure / 4.5) * 100)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-3 rounded-2xl bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-200/80 dark:border-indigo-500/25 p-3.5"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Gauge size={15} />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Bomba y Presión
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          <Fan size={12} className={pumpActive ? 'animate-spin' : ''} />
          {pumpActive ? 'Activa' : 'En espera'}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-300">
          {pressure} bar
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Rango ideal: 2.0 – 3.5 bar
        </span>
      </div>

      <div className="w-full h-2.5 rounded-full bg-indigo-100 dark:bg-slate-900 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pressurePct}%` }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-500 to-cyan-400"
        />
      </div>
    </motion.div>
  );
};

const WidgetConsumoFlujo = ({ telemetry, onNavigateToHistory }) => {
  const flow = telemetry?.flowLpm ?? 0;
  const deviceCode = telemetry?.deviceCode || 'ESP32-HYDRO-9120';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-3 rounded-2xl bg-cyan-50/80 dark:bg-slate-800/80 border border-cyan-200/80 dark:border-cyan-500/25 p-3.5"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Activity size={15} />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Flujo Instantáneo
          </span>
        </div>
        <span className="text-sm font-extrabold text-cyan-700 dark:text-cyan-300">
          {flow} L/min
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
        <span>Sensor: {deviceCode}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
          En línea
        </span>
      </div>

      {onNavigateToHistory && (
        <button
          type="button"
          onClick={onNavigateToHistory}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Ver gráficas en Historial</span>
          <ArrowRight size={13} />
        </button>
      )}
    </motion.div>
  );
};

const WidgetDiagnosticoFugas = ({ telemetry }) => {
  const flow = telemetry?.flowLpm ?? 0;
  const pressure = telemetry?.pressureBar ?? 2.8;
  const sinFugas = flow === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-3 rounded-2xl bg-emerald-50/85 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-500/25 p-3.5"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={15} />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Escaneo de Estanqueidad
          </span>
        </div>
        <CheckCircle2 size={16} className="text-emerald-500" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 px-2.5 py-2 border border-emerald-100 dark:border-slate-700/60">
          <p className="text-slate-400 dark:text-slate-500">Flujo residual</p>
          <p className="font-bold text-slate-700 dark:text-slate-200">
            {flow} L/min
          </p>
        </div>
        <div className="rounded-xl bg-white/80 dark:bg-slate-900/70 px-2.5 py-2 border border-emerald-100 dark:border-slate-700/60">
          <p className="text-slate-400 dark:text-slate-500">Presión estable</p>
          <p className="font-bold text-slate-700 dark:text-slate-200">
            {pressure} bar
          </p>
        </div>
      </div>

      <p className="mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
        {sinFugas
          ? '✓ Tubería sellada correctamente. Sin pérdidas detectadas.'
          : '⚠ Hay flujo activo en este momento; verifica llaves abiertas.'}
      </p>
    </motion.div>
  );
};

const WidgetEcoTips = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="mt-3 rounded-2xl bg-teal-50/85 dark:bg-slate-800/80 border border-teal-200/80 dark:border-teal-500/25 p-3.5"
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
        <Sparkles size={15} />
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
        Acciones de Ahorro Hídrico
      </span>
    </div>
    <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
      <li className="flex items-start gap-1.5">
        <span className="text-teal-500 font-bold">•</span>
        <span>Aireadores en grifos ahorran hasta 40% por minuto.</span>
      </li>
      <li className="flex items-start gap-1.5">
        <span className="text-teal-500 font-bold">•</span>
        <span>Revisa el sapo del WC con colorante cada 3 meses.</span>
      </li>
      <li className="flex items-start gap-1.5">
        <span className="text-teal-500 font-bold">•</span>
        <span>Riega plantas al amanecer o atardecer para evitar evaporación.</span>
      </li>
    </ul>
  </motion.div>
);

/* ============================================================================
 * SUBCOMPONENTES DE LAS 4 ETAPAS Y BURBUJAS DEL CHAT
 * ========================================================================== */

const EtapaIntroBot = ({ isTransitioning, onFinishIntro }) => {
  const [fraseGlobo, setFraseGlobo] = useState(() =>
    seleccionarSinRepetir(FRASES_SALUDO_BOT_MX, 'saludo_intro')
  );
  const [yaTocado, setYaTocado] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleReaction = useCallback(() => {
    if (yaTocado) return;
    setYaTocado(true);
    setFraseGlobo(seleccionarSinRepetir(FRASES_PENSANDO_MX, 'pensando_intro'));

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (onFinishIntro) onFinishIntro();
    }, 4300);
  }, [yaTocado, onFinishIntro]);

  return (
    <div
      className={`min-h-[calc(100vh-140px)] w-full relative overflow-hidden flex flex-col items-center justify-center px-6 text-center mx-auto bg-gradient-to-b from-sky-50/90 via-white to-cyan-50/80 dark:from-[#0B1726] dark:via-[#0B1726] dark:to-[#0B1726] transition-all duration-400 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Resplandores radiales ambientales */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-400/20 dark:bg-cyan-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-sky-400/20 dark:bg-blue-500/15 blur-[90px] pointer-events-none" />

      {/* Fondo de burbujas hídricas */}
      <ParticulasBot className="absolute inset-0 z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Globo tipo cómic con contorno rotativo multicolor */}
        <div className="relative mb-6 max-w-[290px] mx-auto">
          <div className="relative rounded-[24px] p-[2px] overflow-hidden shadow-xl shadow-cyan-500/20">
            <div className="animate-hydro-glow absolute inset-[-120%] bg-[conic-gradient(from_0deg,#38bdf8,#818cf8,#c084fc,#34d399,#38bdf8)] opacity-90" />
            <div className="relative rounded-[22px] bg-white/95 dark:bg-[#0F2234]/95 px-5 py-3.5 text-center backdrop-blur-md">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {fraseGlobo}
              </p>
            </div>
          </div>
          <div className="w-3.5 h-3.5 bg-white dark:bg-[#0F2234] border-r border-b border-cyan-400/50 rotate-45 mx-auto -mt-2 relative z-10" />
        </div>

        {/* Personaje Rive con recorte óptico (Viewport Masking) */}
        <RiveBotPlayer
          mode="intro"
          onBotReaction={handleReaction}
          className="flex items-center justify-center mx-auto"
        />
      </div>
    </div>
  );
};

const EtapaOutroBot = ({ onReturnHome }) => {
  const [fraseDespedida] = useState(() =>
    seleccionarSinRepetir(FRASES_DESPEDIDA_MX, 'despedida_outro')
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onReturnHome) onReturnHome();
    }, 4200);
    return () => clearTimeout(timer);
  }, [onReturnHome]);

  return (
    <div className="min-h-[calc(100vh-140px)] w-full relative overflow-hidden flex flex-col items-center justify-center px-6 text-center mx-auto bg-gradient-to-b from-sky-50/90 via-white to-cyan-50/80 dark:from-[#0B1726] dark:via-[#0B1726] dark:to-[#0B1726] animate-fadeIn">
      {/* Resplandores radiales ambientales */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-400/20 dark:bg-cyan-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-sky-400/20 dark:bg-blue-500/15 blur-[90px] pointer-events-none" />

      {/* Fondo de burbujas hídricas */}
      <ParticulasBot className="absolute inset-0 z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Globo tipo cómic de despedida con contorno rotativo multicolor */}
        <div className="relative mb-6 max-w-[290px] mx-auto">
          <div className="relative rounded-[24px] p-[2px] overflow-hidden shadow-xl shadow-cyan-500/20">
            <div className="animate-hydro-glow absolute inset-[-120%] bg-[conic-gradient(from_0deg,#38bdf8,#818cf8,#c084fc,#34d399,#38bdf8)] opacity-90" />
            <div className="relative rounded-[22px] bg-white/95 dark:bg-[#0F2234]/95 px-5 py-3.5 text-center backdrop-blur-md">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {fraseDespedida}
              </p>
            </div>
          </div>
          <div className="w-3.5 h-3.5 bg-white dark:bg-[#0F2234] border-r border-b border-cyan-400/50 rotate-45 mx-auto -mt-2 relative z-10" />
        </div>

        <RiveBotPlayer
          mode="outro"
          className="flex items-center justify-center mx-auto"
        />

        <p className="mt-6 text-xs font-medium text-slate-400 dark:text-slate-500 text-center">
          Volviendo a Inicio...
        </p>
      </div>
    </div>
  );
};

const TarjetaEncabezadoAgente = ({ onExitChat }) => (
  <div className="mt-0 flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
    <button
      type="button"
      onClick={onExitChat}
      aria-label="Despedirse y salir del chat con Kai"
      className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-cyan-400/50 shadow-md shadow-cyan-500/20 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
    >
      <RiveBotPlayer mode="avatar" />
      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
    </button>

    <div className="flex-1 min-w-0">
      <span className="block text-base font-extrabold text-slate-900 dark:text-white truncate">
        Kai
      </span>
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>En línea</span>
      </div>
    </div>
  </div>
);

const IndicadorEscribiendo = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    className="flex justify-start"
  >
    <div className="relative rounded-[20px] p-[1.5px] overflow-hidden shadow-md shadow-cyan-500/10">
      <div className="animate-hydro-glow absolute inset-[-150%] bg-[conic-gradient(from_0deg,#38bdf8,#818cf8,#c084fc,#34d399,#38bdf8)] opacity-85" />
      <div className="relative rounded-[18.5px] bg-white dark:bg-[#0F2234] px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
      </div>
    </div>
  </motion.div>
);

const BurbujaMensaje = ({
  message,
  telemetry,
  onNavigateToHistory,
  isReactionOpen,
  onOpenReactionBar,
  onCloseReactionBar,
  onSelectReaction,
  onQuoteMessage,
}) => {
  const isBot = message.sender === 'bot';
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const longPressTimerRef = useRef(null);
  const pointerStartRef = useRef({ x: 0, y: 0, active: false });
  const swipeTriggeredRef = useRef(false);

  const limpiarTimerLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => limpiarTimerLongPress();
  }, []);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    pointerStartRef.current = { x: e.clientX, y: e.clientY, active: true };
    swipeTriggeredRef.current = false;
    setIsDragging(false);

    limpiarTimerLongPress();
    longPressTimerRef.current = setTimeout(() => {
      if (pointerStartRef.current.active && !swipeTriggeredRef.current) {
        onOpenReactionBar(message.id);
      }
    }, 450);
  };

  const handlePointerMove = (e) => {
    if (!pointerStartRef.current.active) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);

    if (dy > 14 && !swipeTriggeredRef.current) {
      limpiarTimerLongPress();
      pointerStartRef.current.active = false;
      setDragX(0);
      setIsDragging(false);
      return;
    }

    if (dx > 8) {
      limpiarTimerLongPress();
      swipeTriggeredRef.current = true;
      setIsDragging(true);
      const desplazamiento = Math.min(65, Math.max(0, dx * 0.75));
      setDragX(desplazamiento);
    }
  };

  const finalizarGesto = () => {
    limpiarTimerLongPress();
    if (pointerStartRef.current.active && dragX > 50) {
      onQuoteMessage(message);
    }
    pointerStartRef.current.active = false;
    swipeTriggeredRef.current = false;
    setIsDragging(false);
    setDragX(0);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    limpiarTimerLongPress();
    onOpenReactionBar(message.id);
  };

  const progresoReply = Math.min(1, dragX / 50);
  const replyListo = dragX > 50;

  return (
    <div
      className={`relative flex flex-col ${isBot ? 'items-start' : 'items-end'} select-none touch-pan-y`}
    >
      {/* Indicador circular progresivo de Swipe-to-Reply a la izquierda */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          replyListo
            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
            : 'bg-slate-200/90 dark:bg-slate-700/90 text-slate-600 dark:text-slate-200'
        }`}
        style={{
          opacity: progresoReply,
          transform: `translateY(-50%) scale(${0.55 + progresoReply * 0.45})`,
        }}
      >
        <CornerUpLeft size={15} strokeWidth={2.4} />
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finalizarGesto}
        onPointerCancel={finalizarGesto}
        onPointerLeave={finalizarGesto}
        onContextMenu={handleContextMenu}
        style={{
          transform: `translateX(${dragX}px)`,
        }}
        className={`relative max-w-[88%] ${
          isDragging ? '' : 'transition-transform duration-200 ease-out'
        } ${message.reaccion ? 'mb-2' : ''}`}
      >
        {/* Barra flotante estilo WhatsApp (Long-Press / Clic Derecho) */}
        <AnimatePresence>
          {isReactionOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className={`absolute -top-12 ${
                isBot ? 'left-0' : 'right-0'
              } bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-xl border border-slate-200/70 dark:border-slate-700/70 flex items-center gap-2 z-50 animate-scaleIn`}
            >
              {REACCIONES_WHATSAPP.map((emoji) => {
                const activa = message.reaccion === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onSelectReaction(message.id, emoji)}
                    aria-label={`Reaccionar con ${emoji}`}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-125 active:scale-90 cursor-pointer ${
                      activa
                        ? 'bg-sky-100 dark:bg-cyan-500/25 ring-1 ring-sky-400/60 scale-110'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/70'
                    }`}
                  >
                    <AppleEmoji emoji={emoji} size={20} />
                  </button>
                );
              })}

              <span className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

              <button
                type="button"
                onClick={() => {
                  onQuoteMessage(message);
                  onCloseReactionBar();
                }}
                aria-label="Responder mensaje"
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors cursor-pointer whitespace-nowrap"
              >
                <CornerUpLeft size={13} />
                <span>Responder</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isBot ? (
          <div className="relative rounded-[20px] rounded-br-md bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2.5 shadow-md shadow-sky-500/20">
            {message.replyTo && (
              <div className="mb-1.5 rounded-xl border-l-[3px] border-white/85 bg-white/15 px-2.5 py-1.5 text-left">
                <p className="text-[11px] font-bold text-white/95 truncate">
                  {message.replyTo.author}
                </p>
                <p className="text-[11.5px] text-white/85 line-clamp-1">
                  <AppleEmojiText text={message.replyTo.text} size={14} />
                </p>
              </div>
            )}

            <p className="text-[13.5px] leading-relaxed whitespace-pre-line select-text">
              <AppleEmojiText text={message.text} size={18} />
            </p>

            {message.reaccion && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectReaction(message.id, message.reaccion);
                }}
                title="Toca para quitar reacción"
                className="absolute -bottom-3 left-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-md flex items-center justify-center z-20 hover:scale-110 transition-transform cursor-pointer"
              >
                <AppleEmoji emoji={message.reaccion} size={15} />
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="relative rounded-[22px] p-[1.5px] overflow-hidden shadow-md shadow-cyan-500/15">
              {/* Iluminación de contorno rotativa multicolor */}
              <div className="animate-hydro-glow absolute inset-[-150%] bg-[conic-gradient(from_0deg,#38bdf8,#818cf8,#c084fc,#34d399,#38bdf8)] opacity-85" />
              <div className="relative rounded-[20.5px] bg-white dark:bg-[#0F2234] px-4 py-3 text-slate-700 dark:text-slate-200">
                {message.replyTo && (
                  <div className="mb-2 rounded-xl border-l-4 border-cyan-500 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 text-left">
                    <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 truncate">
                      {message.replyTo.author}
                    </p>
                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 line-clamp-1">
                      <AppleEmojiText text={message.replyTo.text} size={14} />
                    </p>
                  </div>
                )}

                <p className="text-[13.5px] leading-relaxed whitespace-pre-line select-text">
                  <AppleEmojiText text={message.text} size={18} />
                </p>

                {message.widgetType === 'cisterna' && (
                  <WidgetCisterna telemetry={telemetry} />
                )}
                {message.widgetType === 'bomba' && (
                  <WidgetBombaPresion telemetry={telemetry} />
                )}
                {message.widgetType === 'consumo' && (
                  <WidgetConsumoFlujo
                    telemetry={telemetry}
                    onNavigateToHistory={onNavigateToHistory}
                  />
                )}
                {message.widgetType === 'fugas' && (
                  <WidgetDiagnosticoFugas telemetry={telemetry} />
                )}
                {message.widgetType === 'tips' && <WidgetEcoTips />}
              </div>
            </div>

            {message.reaccion && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectReaction(message.id, message.reaccion);
                }}
                title="Toca para quitar reacción"
                className="absolute -bottom-3 right-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-md flex items-center justify-center z-20 hover:scale-110 transition-transform cursor-pointer"
              >
                <AppleEmoji emoji={message.reaccion} size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {message.time && (
        <span
          className={`mt-1 text-[10px] text-slate-400 dark:text-slate-500 ${
            isBot ? 'pl-1' : 'pr-1'
          }`}
        >
          {message.time}
        </span>
      )}
    </div>
  );
};

/**
 * Vista Principal del Asistente Hídrico ("HydroBot IA") con Flujo Interactivo de 4 Etapas
 */
export const ChatAyudaInteligente = ({
  telemetry: telemetryProp,
  activeHouse: activeHouseProp,
  onNavigateHome,
  onNavigateToHistory,
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

  // Estado inicial vacío: el usuario siempre inicia la conversación
  const [messages, setMessages] = useState([]);
  const [contextoChat, setContextoChat] = useState({
    ultimoTema: null,
    ultimaPreguntaBot: null,
    estadoAnimoUsuario: 'neutro',
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mensajeCitado, setMensajeCitado] = useState(null);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState(null);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const quickMenuContainerRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const replyTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (botStage === 'chat') {
      scrollToBottom();
    }
  }, [messages, isTyping, botStage, mensajeCitado]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  // Cerrar barra de reacciones o menú de consultas rápidas al tocar fuera o pulsar Escape
  useEffect(() => {
    const handlePointerDownOutside = (e) => {
      if (activeReactionMsgId !== null) {
        setActiveReactionMsgId(null);
      }
      if (
        isQuickMenuOpen &&
        quickMenuContainerRef.current &&
        !quickMenuContainerRef.current.contains(e.target)
      ) {
        setIsQuickMenuOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setActiveReactionMsgId(null);
        setIsQuickMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeReactionMsgId, isQuickMenuOpen]);

  const handleFinishIntro = useCallback(() => {
    setIsTransitioning(true);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      updateBotStage('chat');
      setIsTransitioning(false);
    }, 500);
  }, [updateBotStage]);

  const handleExitChat = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      updateBotStage('outro_bot');
      setIsTransitioning(false);
    }, 400);
  }, [isTransitioning, updateBotStage]);

  const handleReturnHome = useCallback(() => {
    updateBotStage('home');
    if (onNavigateHome) {
      onNavigateHome();
    }
  }, [updateBotStage, onNavigateHome]);

  const handleSelectReaction = useCallback((msgId, emoji) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, reaccion: m.reaccion === emoji ? null : emoji }
          : m
      )
    );
    setActiveReactionMsgId(null);
  }, []);

  const handleQuoteMessage = useCallback((msg) => {
    setMensajeCitado({
      id: msg.id,
      sender: msg.sender,
      author: msg.sender === 'bot' ? 'Kai' : 'Tú',
      text: msg.text,
      topic: msg.topic || null,
    });
    setActiveReactionMsgId(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
  }, []);

  const handleSendMessage = (textOverride) => {
    const messageToSend = (textOverride || inputText).trim();
    if (!messageToSend) return;

    const citaActual = mensajeCitado;
    const now = new Date();
    const baseMsgId = now.getTime();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const userMsg = {
      id: baseMsgId,
      sender: 'user',
      text: messageToSend,
      reaccion: null,
      replyTo: citaActual
        ? {
            id: citaActual.id,
            author: citaActual.author,
            text: citaActual.text,
          }
        : null,
      time: timeStr,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textOverride) setInputText('');
    setMensajeCitado(null);
    setIsQuickMenuOpen(false);
    setActiveReactionMsgId(null);
    setIsTyping(true);

    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    replyTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);

      const contextoConCita = citaActual
        ? {
            ...contextoChat,
            ultimoTema: citaActual.topic || contextoChat.ultimoTema,
            mensajeCitado: citaActual.text,
          }
        : contextoChat;

      let respuesta = procesarConversacionNatural(
        messageToSend,
        contextoConCita,
        { telemetry, activeHouse }
      );

      // Si el usuario citó un mensaje previo y su pregunta nueva fue muy abierta,
      // re-evaluamos incluyendo el texto citado para mantener coherencia directa.
      if (
        citaActual &&
        respuesta?.nextContext?.ultimoTema === 'charla_libre'
      ) {
        const respuestaContextual = procesarConversacionNatural(
          `${citaActual.text} ${messageToSend}`,
          contextoConCita,
          { telemetry, activeHouse }
        );
        if (respuestaContextual?.nextContext?.ultimoTema !== 'charla_libre') {
          respuesta = respuestaContextual;
        }
      }

      const { text: replyText, nextContext, widgetTipo } = respuesta;
      setContextoChat(nextContext);

      const botNow = new Date();
      const botMsg = {
        id: botNow.getTime() + 1,
        sender: 'bot',
        text: replyText,
        widgetType: widgetTipo,
        topic: nextContext?.ultimoTema || null,
        reaccion: null,
        time: botNow.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1450);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full w-full overflow-hidden">
      {/* ETAPA 2: Intro Bot a pantalla completa */}
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
          {/* Cabecera fija del chat (solo tarjeta compacta de Kai) */}
          <div className="flex-shrink-0 px-5 pt-3 pb-3 bg-white dark:bg-[#0B1726] z-10 border-b border-slate-100/80 dark:border-slate-800/50">
            <TarjetaEncabezadoAgente onExitChat={handleExitChat} />
          </div>

          {/* Lista de mensajes con scroll interno independiente */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-12 pb-4 space-y-5 no-scrollbar bg-white dark:bg-[#0B1726] flex flex-col">
            {messages.length === 0 && !isTyping ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/25 shadow-lg shadow-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3.5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
                  ¡Hola! Soy Kai
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[280px] leading-relaxed">
                  Escribe un mensaje abajo para empezar a platicar conmigo o abre el menú{' '}
                  <AppleEmoji emoji="⚡" size={15} className="mx-0.5" /> de consultas rápidas.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <BurbujaMensaje
                    key={msg.id}
                    message={msg}
                    telemetry={telemetry}
                    onNavigateToHistory={onNavigateToHistory}
                    isReactionOpen={activeReactionMsgId === msg.id}
                    onOpenReactionBar={(id) => setActiveReactionMsgId(id)}
                    onCloseReactionBar={() => setActiveReactionMsgId(null)}
                    onSelectReaction={handleSelectReaction}
                    onQuoteMessage={handleQuoteMessage}
                  />
                ))}

                <AnimatePresence>{isTyping && <IndicadorEscribiendo />}</AnimatePresence>
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Barra de entrada fija sobre la Bottom Navbar */}
          <div
            ref={quickMenuContainerRef}
            className="relative flex-shrink-0 w-full bg-white dark:bg-[#0B1726] border-t border-slate-100 dark:border-slate-800/80 px-4 pt-2.5 pb-6 z-30"
          >
            {/* Menú desplegable de Consultas Rápidas */}
            <AnimatePresence>
              {isQuickMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute bottom-full left-4 right-4 mb-2 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white/95 dark:bg-[#11192E]/95 backdrop-blur-xl p-2 z-40"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
                      Consultas rápidas para Kai
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsQuickMenuOpen(false)}
                      aria-label="Cerrar consultas rápidas"
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    {quickReplySuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSendMessage(item.text)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800/80 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <span className="flex-shrink-0 flex items-center justify-center">
                          <AppleEmoji emoji={item.emoji} size={19} />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vista previa de cita estilo WhatsApp */}
            <AnimatePresence>
              {mensajeCitado && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.16 }}
                  className="mb-2 border-l-4 border-cyan-500 bg-slate-100 dark:bg-slate-800/90 rounded-xl px-3 py-2 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 truncate">
                      {mensajeCitado.author}
                    </p>
                    <p className="line-clamp-1 text-xs text-slate-600 dark:text-slate-300">
                      <AppleEmojiText text={mensajeCitado.text} size={14} />
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMensajeCitado(null)}
                    aria-label="Cancelar mensaje citado"
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X size={15} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 rounded-full px-4 py-2 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje para Kai..."
                className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsQuickMenuOpen((prev) => !prev)}
                title="Mensajes rápidos"
                aria-label="Mensajes rápidos"
                aria-expanded={isQuickMenuOpen}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isQuickMenuOpen
                    ? 'text-cyan-500 bg-cyan-500/10'
                    : 'text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400'
                }`}
              >
                <Zap size={19} strokeWidth={2} />
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

      {/* ETAPA 4: Outro Bot a pantalla completa */}
      {botStage === 'outro_bot' && (
        <EtapaOutroBot onReturnHome={handleReturnHome} />
      )}
    </div>
  );
};
