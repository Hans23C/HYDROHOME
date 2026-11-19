/**
 * cerebroHydroBot.js
 * Motor conversacional humano, natural y modular para Kai.
 * Diseñado con español cercano (modismos mexicanos sutiles), anti-repetición estricta,
 * 18 categorías de conversación (charla cotidiana + soporte hídrico + telemetría)
 * y memoria multi-turno para respuestas cortas.
 */

// ============================================================================
// UTILIDADES DE NORMALIZACIÓN Y ANTI-REPETICIÓN
// ============================================================================

const normalizarTexto = (texto = '') =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const contieneAlguna = (textoNormalizado, patrones) =>
  patrones.some((patron) => {
    if (patron instanceof RegExp) return patron.test(textoNormalizado);
    return textoNormalizado.includes(normalizarTexto(patron));
  });

// Historial en memoria de sesión como respaldo si el caller no lo persiste
const historialSesionGlobal = [];
const MAX_HISTORIAL_SESION = 30;

/**
 * Elige una variación sin repetir ninguna de las usadas recientemente
 * en la sesión ni en la categoría actual.
 */
const elegirSinRepetir = (banco, contextoActual = {}, construirTexto = null) => {
  const historialPrevio = Array.isArray(contextoActual?.historialRespuestas)
    ? contextoActual.historialRespuestas
    : historialSesionGlobal;

  const candidatos = banco.map((item, idx) => ({
    idx,
    raw: item,
    texto: construirTexto ? construirTexto(item) : item,
  }));

  const noUsados = candidatos.filter(
    (c) => !historialPrevio.includes(c.texto) && !historialSesionGlobal.includes(c.texto)
  );

  const pool = noUsados.length > 0 ? noUsados : candidatos;
  // Evitar repetir exactamente la última respuesta si se reinició el pool
  const ultimaRespuesta =
    historialPrevio[historialPrevio.length - 1] ||
    historialSesionGlobal[historialSesionGlobal.length - 1];
  const poolFiltrado =
    pool.length > 1 ? pool.filter((c) => c.texto !== ultimaRespuesta) : pool;

  const elegido = poolFiltrado[Math.floor(Math.random() * poolFiltrado.length)];

  historialSesionGlobal.push(elegido.texto);
  if (historialSesionGlobal.length > MAX_HISTORIAL_SESION) {
    historialSesionGlobal.shift();
  }

  return elegido;
};

const actualizarHistorialContexto = (contextoActual, textoRespuesta) => {
  const prev = Array.isArray(contextoActual?.historialRespuestas)
    ? contextoActual.historialRespuestas
    : [];
  const siguiente = [...prev, textoRespuesta];
  return siguiente.slice(-MAX_HISTORIAL_SESION);
};

// ============================================================================
// BANCOS DE RESPUESTAS HUMANAS (10–20 VARIACIONES POR CATEGORÍA)
// ============================================================================

const BANCO_SALUDOS = [
  '¡Qué onda! Aquí ando al tiro revisando que no se escape ni una gota. ¿Tú qué tal, cómo va tu día?',
  '¡Hey! Todo tranquilo por acá, nomás echándole un ojo a tus sensores. ¿En qué andas?',
  '¡Hola! Qué gusto saludarte por aquí. ¿Cómo te trata el día hoy?',
  '¡Quiúbole! Aquí estoy al cien, listo para platicar o checar cómo anda tu agua. ¿Todo bien?',
  '¡Buenas! Justo estaba haciendo guardia por si se ofrecía algo. ¿Cómo amanece o cómo va la tarde?',
  '¡Hola, hola! Me da gusto verte por acá. ¿Vienes a checar la cisterna o nomás a echar cotorreo un rato?',
  '¡Qué tal! Aquí al pie del cañón, con los circuitos bien despiertos. ¿Cómo te ha ido?',
  '¡Ey, qué onda! Ya te estaba extrañando por el chat. Cuéntame, ¿cómo va todo por allá?',
  '¡Hola! Todo en orden de este lado, ni una fuga a la vista. ¿Y tú qué tal andas hoy?',
  '¡Qué gusto leerte! Ponte cómodo, ¿qué plan traes hoy o en qué te echo la mano?',
  '¡Buenas! Aquí ando, más fresco que agua de tinaco en la madrugada 😄. ¿Cómo estás?',
  '¡Hola! Reportándome al cien. ¿Cómo va tu semana hasta ahorita?',
  '¡Qué onda! Dime qué se te ofrece, ya sea revisar tu sistema o platicar de la vida.',
  '¡Hey! Qué bueno que pasas a saludar. ¿Cómo pinta el día por tu rumbo?',
];

const BANCO_ANIMO_BAJO = [
  'Uy, lamento mucho escuchar eso. No te me agüites, acuérdate que no hay mal que dure 100 años ni cuerpo que lo aguante. ¿Quieres que te cuente un chiste para distraerte un rato?',
  'Ánimo, de verdad. Respira hondo, tómate un vasito de agua y recuerda que después de la tormenta siempre sale el sol. Si quieres desahogarte o cambiar de tema, aquí estoy.',
  'Qué pesado se siente cuando el día viene cuesta arriba... Pero al mal tiempo, buena cara. ¿Te late si platicamos de otra cosa o te tiro un dato curioso para despejar la mente?',
  'Te mando un abrazo virtual enorme. A veces el cuerpo y la cabeza nomás piden una pausa; no te exijas de más hoy. ¿Quieres que te cuente algo ligero para sacarte una sonrisa?',
  'Chale, qué mala onda que andes así. Fíjate que hasta los ríos más fuertes tienen remansos para descansar. Date chance hoy. ¿Platicamos un rato de algo tranquilo?',
  'Oye, qué gacho que te sientas así, pero aquí no estás solo. Como dicen por ahí: cuando una puerta se cierra, otra se abre. ¿Te ayudo a distraerte con un chiste malo pero efectivo?',
  'Entiendo perfecto ese bajón, a todos nos pega de repente. Toma tantita agua, estira los hombros y respira despacio. ¿Quieres seguir platicando de cómo te sientes o cambiamos de aire?',
  'Ánimo, campeón/a. Ningún nubarrón es eterno y mañana seguro pinta distinto. Mientras tanto, si quieres cotorrear de música, comida o lo que sea, aquí me tienes.',
  'Siento mucho que traigas el ánimo abajo o el cansancio encima. No hace falta resolver todo hoy; a veces sobrevivir el día ya es ganancia. ¿Te cuento algo curioso para entretenerte?',
  'Qué pesado cargar con tanto estrés... Échale un ojo a tu descanso hoy, que la salud va primero que cualquier pendiente. ¿Te late escuchar un chiste blanco para relajar el ambiente?',
  'Ánimo, que las rachas pesadas también pasan. Recuerda el dicho: al que madruga... bueno, a veces solo tiene más sueño, así que date permiso de descansar 😅. ¿Cómo te ayudo a pasar el rato?',
  'Aquí estoy para hacerte compañía un rato, sin presiones ni tecnicismos. Si quieres platicar de lo que sea para despejarte, suéltalo con confianza.',
];

const BANCO_ANIMO_POSITIVO = [
  '¡Eso es todo! Qué gusto escuchar eso, así da gusto arrancar el día 🙌. ¿Qué fue lo mejor que te pasó hoy?',
  '¡Qué buena onda! Que siga así la buena racha y que nada la frene. ¿Andas celebrando algo en especial?',
  '¡Órale, me encanta esa actitud! Cuando uno anda al cien, hasta los pendientes salen más rápido.',
  '¡Súper bien! Me contagias la buena vibra hasta acá. Cuéntame, ¿a qué se debe tanta alegría?',
  '¡A todo dar! Así me gusta escucharte. Ojalá todo tu día siga igual de chido.',
  '¡Qué maravilla! De esas noticias que dan gusto leer. ¿Y qué planes traes para aprovechar la buena energía?',
  '¡Va que va, puro éxito! Disfruta mucho ese buen momento y no olvides brindar aunque sea con un buen vaso de agua fresca 😄.',
  '¡Excelente! Qué padre cuando las cosas fluyen como agua limpia. ¿En qué andas ahorita?',
  '¡Esooo! Me alegra un montón saberlo. Si quieres rematar el buen humor con un dato curioso o un chiste, nomás di.',
  '¡De lujo! Que esa sonrisa te dure toda la semana. ¿Qué estás haciendo ahorita?',
  '¡Qué chido! La verdad da gusto platicar cuando traes la pila tan arriba.',
  '¡Al cien por ciento! Sigue con ese vuelo, que hoy nada te detiene.',
];

const BANCO_COMIDA = [
  '¡Uff, ya se me antojaron unos tacos al pastor con todo, aunque yo nomás me alimente de electricidad! 😄 Oye, si ya vas a comer, échate un buen vaso de agua natural antes.',
  'Fíjate que unos chilaquiles bien picositos con café de olla nunca fallan para revivir el alma. Eso sí, ¡toma agua después para equilibrar!',
  '¡Qué rico! Nada como comida casera calientita para agarrar fuerza. ¿Qué vas a preparar o pedir hoy?',
  'Un cafecito siempre cae al cien, pero acuérdate que el café deshidrata un poquito, así que acompáñalo con su respectivo vaso de agua.',
  'Órale, qué buen antojo. Yo aquí viendo puro código y tú hablando de comida... ya hasta me dio hambre de datos 😂. ¿Con qué lo vas a acompañar?',
  'Si traes sed o hambre entre comidas, a veces el cuerpo confunde las dos cosas. Prueba echándote medio vaso de agua y luego ya le entras al antojo.',
  '¡Provechito si ya estás comiendo! Disfruta cada bocado sin prisas, que comer tranquilo también ayuda un chorro.',
  '¿Unos taquitos, una torta o algo más tranqui? Sea lo que sea, que esté bien servido y bien acompañado de agua fresca.',
  'Me encanta platicar de comida. En México hasta el agua de horchata y jamaica cuentan como patrimonio cultural, ¿no? ¿Cuál es tu favorita?',
  'Oye, si estás cocinando, nomás échale un ojo a no dejar la llave abierta mientras lavas los trastes; con chorro moderado se ahorra un dineral de agua.',
  '¡Qué delicia! A veces un buen almuerzo te cambia por completo el humor del día. ¿Eres más de cosas saladas o dulces?',
  'Va que va, tú consiéntete con algo rico. Nomás no te olvides de hidratarte bien durante la tarde.',
];

const BANCO_CLIMA = [
  '¡Uf, con este calorón el cuerpo pide agua a gritos! Acuérdate de tomar traguitos seguidos aunque no sientas sed, y en casa procura regar las plantas ya que baje el sol.',
  'Qué rico el fresquito o la lluvia, ¿verdad? Fíjate que cuando llueve es el momento ideal para pensar en captar agua pluvial aunque sea en cubetas para lavar patios o regar.',
  'El clima anda medio loco últimamente. Si hace mucho sol, la evaporación sube y el consumo en casa también se dispara un poco; vale la pena estar atentos.',
  'Con el frío hasta da flojera tomar agua, pero el cuerpo la sigue necesitando igualito. Un tecito calientito sin azúcar también tira paro para hidratarse.',
  'Cuando hay bochorno, una regaderazo rápido de 5 minutitos te reinicia la vida sin gastar litros de más. ¿Cómo anda el clima ahorita por tu zona?',
  '¡Qué agusto la lluvia! Eso sí, si llueve fuerte échale un ojo a las coladeras del patio para que no se tapen y no se encharque nada.',
  'Si hace aire seco o mucho calor, recuerda revisar que no queden mangueras al sol con presión, porque con el tiempo se resecan y pueden fugar.',
  'Me encanta cuando el cielo se nubla tantito y baja la temperatura. ¿Tú eres team calor o team frío?',
  'En días muy calurosos el consumo sube fácil un 20% en casi todas las casas. ¿Hoy te tocó solazo o está tranquilo por allá?',
  '¡Aguas con el cambio de temperatura! Tápate bien si anda fresco y mantente hidratado si anda pegando duro el sol.',
  'Fíjate que la lluvia limpia el ambiente y recarga mantos freáticos, aunque en la ciudad a veces nos complique el tráfico. ¿Está lloviendo por allá?',
  'Sea frío o calor, aquí tus sensores siguen trabajando parejo sin quejarse del clima 😄. ¿Cómo ves la tarde?',
];

const BANCO_TRABAJO_ESTUDIO = [
  '¡Tú dale con todo, ya casi sale esa chamba! Nomás no te olvides de pararte cada hora a estirar las piernas y tomar un trago de agua.',
  'Qué pesado cuando se juntan los pendientes, pero paso a pasito se saca todo. Acuérdate de descansar la vista de la pantalla aunque sea 20 segundos.',
  '¡Mucho éxito con ese proyecto o tarea! Si te atoras en algo, tómate 2 minutitos para respirar y tomar agua; el cerebro oxigenado piensa mucho mejor.',
  'Órale, qué aplicado/a andas hoy. Échale ganas, que el esfuerzo de hoy es la tranquilidad de mañana. ¿De qué trata lo que estás haciendo?',
  'A veces la escuela o la oficina absorben todo el día, pero acuérdate que hidratarte bien evita ese dolorcito de cabeza de media tarde.',
  '¡Ánimo con esa jornada! Pon tu rolita favorita de fondo y vas a ver que se pasa más rápido.',
  'Va que va, enfócate en una cosa a la vez para que no te abrumes. Cuando acabes un bloque, date un respiro corto.',
  '¡Qué buena disciplina! Mientras tú sacas adelante tus pendientes, yo acá te cuido el agua de la casa para que no te preocupes por eso.',
  'Si estás estudiando para examen, un tip real: tomar agua mantiene mejor la concentración que puro refresco o exceso de café. ¡Tú puedes!',
  'Échale un ojo a tu postura ahorita que estás chambeando y date un respiro. ¿Ya falta mucho para terminar?',
  '¡Puro power! Cuando termines tu turno o tu tarea, date chance de desconectarte de verdad.',
  'Aquí ando echándote porras en silencio. ¡Sí se puede sacar ese pendiente hoy!',
];

const BANCO_COTIDIANO_OCIO = [
  '¡Qué buen plan! Hacer algo de ejercicio o salir a caminar despeja muchísimo la mente. Eso sí, hidrátate antes y después de moverte.',
  'La música levanta cualquier día aburrido. ¿Qué género traes en repeat ahorita? Yo, como soy bot de agua, puro flow líquido 😄.',
  'Si ya tienes sueño, hazle caso al cuerpo. Dormir bien recarga mucho más que cualquier café de emergencia.',
  '¡Viernes o fin de semana al fin! Qué rico bajarle tantito al ritmo y disfrutar sin prisas. ¿Traes algún plan chido?',
  'Echar la flojera un rato el domingo también es sagrado y necesario. ¿Te quedas en casa o vas a salir?',
  'El deporte es una chulada para sacar el estrés. Acuérdate nomás de no dejar la regadera abierta mientras te enjabonas después de entrenar.',
  'Qué padre desconectarse tantito de las pantallas y escuchar una buena rola o ver un partido tranquilo. ¿A qué equipo le vas o qué estás escuchando?',
  'Cuando uno duerme sus horas completas, al día siguiente todo fluye mejor. Si ya es tarde por allá, ve cerrando el día con calma.',
  'Fíjate que escuchar música mientras haces tus cosas en casa hace que hasta lavar los trastes se vuelva concierto privado 🎤.',
  '¡Qué gusto! Disfruta tu tiempo libre al máximo, que para eso se trabaja toda la semana.',
  'Si vas al gym o sales a correr, llévate tu termo reutilizable; ahorras dinero, plástico y te mantienes al cien.',
  'Suena súper bien eso. ¿Y qué más te gusta hacer cuando tienes un ratito libre?',
];

const BANCO_ABURRIMIENTO = [
  '¿Aburrido? ¡Ahorita lo arreglamos! ¿Quieres que te cuente un dato curioso que te va a volar la cabeza, o prefieres un chiste rápido?',
  'Uy, cuando pega el aburrimiento es señal de que hace falta algo nuevo. ¿Te cuento una curiosidad del agua o echamos cotorreo de cualquier tema?',
  '¡No te aburras! Podemos hacer tres cosas: te tiro un chiste malo, te suelto un dato científico loco o revisamos cómo anda tu cisterna. ¿Cuál eliges?',
  'Jajaja, a veces pasa que no hay nada que hacer. ¿Qué tal si me preguntas lo que se te ocurra o jugamos a que te sorprendo con un dato curioso?',
  'Para el aburrimiento nada como aprender algo raro. ¿Sabías que el agua caliente se congela más rápido que la fría en ciertas condiciones? ¿Te cuento otro así?',
  '¡Órale, vamos a espantar la flojera! Dime un tema —películas, comida, ciencia o agua— y le seguimos la plática.',
  'Si no sabes qué hacer, tómate un vaso de agua fría, estírate tantito y dime: ¿prefieres reírte con un chiste o escuchar algo interesante?',
  'Aquí estoy disponible 24/7 para quitar el aburrimiento. ¿Te cuento un chiste de plomeros o uno de robots?',
  'A veces un rato sin hacer nada también sirve para descansar, pero si quieres entretenerte, pídeme un dato curioso y arrancamos.',
  '¡Va que va! Yo pongo los chistes y los datos curiosos, tú nomás dime por dónde empezamos.',
];

const BANCO_CHISTES_20 = [
  '¿Qué le dice una gota de agua a otra gota? — ¡No te hagas la corriente, que vamos en el mismo tubo! 💧😄',
  '¿Cuál es el colmo de un plomero? — ¡Tener un hijo que no le haga caso y se vaya por las ramas en vez de por el tubo! 🔧',
  '¿Por qué el mar no se seca nunca? — ¡Porque siempre está haciendo olas para saludar! 🌊',
  '¿Qué hace un tinaco en el gimnasio? — ¡Pura presión hidráulica! 💪',
  '¿Por qué el sensor ESP32 fue al psicólogo? — ¡Porque sentía demasiada presión en la tubería! 🤖',
  '¿Qué le dijo el café al agua hirviendo? — ¡Oye, no te me pongas tan intensa que apenas voy despertando! ☕',
  '¿Cuál es la bebida favorita de los robots? — ¡El agua con mucho byte-aminas! 😂',
  '¿Por qué la llave del baño estaba tan triste? — ¡Porque sentía que todo el mundo le daba la vuelta y la cerraba! 🚰',
  '¿Qué le dice un hielo a otro hielo en el vaso? — ¡Aguántame tantito, que ya me estoy derritiendo por ti! 🧊',
  '¿Cómo se llama el campeón de natación de los peces? — ¡Nadia! 🐟',
  '¿Por qué los ríos siempre saben a dónde van? — ¡Porque siguen la corriente sin hacerse bolas! 🏞️',
  '¿Qué hace una computadora cuando tiene mucha sed? — ¡Abre muchas ventanas para que entre aire fresco y busca un stream! 💻',
  '¿Cuál es el colmo de un astronauta? — ¡Tener problemas de presión hasta en la regadera! 🚀',
  '¿Qué le dice una nube a otra nube en verano? — ¡Vámonos de aquí antes de que nos evaporen! ☁️',
  '¿Por qué la bomba de agua siempre está de buenas? — ¡Porque le encanta subir el ánimo hasta el tinaco! ⚡',
  '¿Qué hace un vaso de agua en una fiesta? — ¡Nada, nomás se queda ahí bien transparente! 🥛',
  '¿Por qué el WiFi del sensor se fue de vacaciones? — ¡Porque necesitaba desconectarse de la red un rato! 📡',
  '¿Cuál es el pez que siempre llega al final? — ¡El delfín! 🐬',
  '¿Qué le dijo la tubería al agua fría? — ¡Pásale sin miedo, que hoy no hay fugas! 🛠️',
  '¿Por qué nunca hay que discutir con un charco? — ¡Porque siempre tiene poca profundidad! 😄',
];

const BANCO_REACCION_RISA = [
  '¡Jajaja verdad que sí estuvo bueno! ¿Te sabes otro o te cuento uno más?',
  '¡Esooo, qué bueno que te sacó una sonrisa! ¿Quieres otro chiste o cambiamos a un dato curioso?',
  '¡Jajaja me alegra que te haya dado risa! Tengo más guardados bajo la manga por si gustas.',
  '¡A todo dar! No hay nada mejor que reírse un rato. ¿Le seguimos con otro chiste?',
  '¡Ya ves, hasta los bots tenemos nuestro humor! 😄 ¿Te cuento otro más?',
  '¡Qué buena risa! Me das cuerda para seguir contando chistes malos pero cumplidores.',
  '¡Jajaja, misión cumplida entonces! ¿Qué más se te antoja platicar ahorita?',
  '¡Órale, me salió natural! Si quieres otro, nomás di "otro" y ahí te va.',
  '¡Eso me gusta! Reírse relaja más que cualquier cosa. ¿Seguimos cotorreando?',
  '¡Jajaja va que va! Cuando quieras otra dosis de humor, aquí ando al tiro.',
];

const BANCO_DATOS_CURIOSOS_15 = [
  '¿Sabías que una gotera de apenas una gota por segundo puede desperdiciar más de 11,000 litros de agua al año? ¡Es casi una cisterna entera escapándose sin hacer ruido!',
  'Fíjate que el agua es la única sustancia natural en la Tierra que se encuentra en los tres estados (líquido, sólido y gas) de manera normal en nuestro ambiente diario.',
  'Dato loco: tu cerebro es aproximadamente 75% agua. Por eso cuando te deshidratas aunque sea poquito, te cuesta más concentrarte o te duele la cabeza.',
  '¿Sabías que el agua que tomas hoy pudo haber sido bebida por un dinosaurio hace millones de años? El planeta recicla exactamente la misma agua en un ciclo infinito.',
  'En ingeniería hidráulica, 1 bar de presión equivale a poder empujar una columna de agua hasta unos 10 metros de altura. ¡Por eso un par de bares ya suben el agua al tinaco sin bronca!',
  'Dato curioso: el agua caliente puede congelarse más rápido que el agua fría bajo ciertas condiciones. Se llama "efecto Mpemba" y sigue sorprendiendo a los físicos.',
  'Alrededor del 97% del agua del planeta es salada y está en los océanos; menos del 1% del agua dulce está fácilmente disponible para consumo humano. ¡Por eso cuidarla vale oro!',
  '¿Sabías que producir unos simples jeans de mezclilla requiere cerca de 7,500 litros de agua en todo su proceso? Cuidar la ropa y no desperdiciar en casa ayuda muchísimo.',
  'Las plantas "sudan": mediante la transpiración liberan vapor de agua al aire, ayudando a refrescar el clima local de manera natural.',
  'Un sensor ultrasónico como los de los sistemas IoT mide el nivel del agua enviando ondas de sonido inaudibles que rebotan en la superficie y regresan en microsegundos.',
  'El hielo flota porque al congelarse las moléculas de agua se acomodan en hexágonos con espacio entre sí, haciéndolo menos denso que el agua líquida. ¡Si se hundiera, los lagos se congelarían por completo!',
  'Una ducha de 10 minutos con regadera convencional consume entre 100 y 150 litros de agua; bajarla a 5 minutos ahorra más de 2,000 litros al mes por persona.',
  'El sonido viaja casi 4.3 veces más rápido en el agua que en el aire. ¡Por eso las ballenas se escuchan a cientos de kilómetros!',
  'Fíjate que el agua pura en sí no conduce bien la electricidad; lo que la vuelve conductora son las sales y minerales disueltos que trae.',
  'Un WC antiguo puede gastar hasta 16 litros por descarga, mientras que uno moderno de doble descarga usa entre 4.5 y 6 litros. ¡La diferencia mensual es enorme!',
];

const BANCO_IDENTIDAD = [
  'Soy Kai, puro código con corazón de tinaco inteligente 😄. Estoy aquí para cuidar tu agua y echar cotorreo contigo cuando gustes.',
  '¡Qué buena pregunta! No soy humano, soy tu asistente digital de HydroIntelligent, pero le pongo toda la buena vibra para que platicar sea como con un amigo.',
  'Soy una inteligencia conversacional hecha para ayudarte con tu sistema hídrico y hacerte compañía. Sin cuerpo físico, ¡pero con mucha actitud!',
  'Me llamo Kai. Digamos que vivo entre sensores ESP32 y líneas de código, siempre al tiro de tu cisterna y de lo que quieras platicar.',
  'No soy de carne y hueso, pero tampoco hablo como robot aburrido 😉. Soy tu copiloto para cuidar el agua de tu casa y pasar un buen rato.',
  'Soy Kai, tu compa digital experto en agua. No tomo café ni duermo, así que aquí estoy cuando necesites.',
  'Puro software bien entrenado, pero con alma mexicana y buena onda. ¿Qué te parece la plática hasta ahora?',
  'Soy Kai, tu asistente inteligente en HydroIntelligent: mitad monitor hidráulico, mitad buen conversador.',
  'Aunque no tenga manos para abrir una llave, sí tengo ojos digitales en tus litros y presión. ¡Y oído para escucharte!',
  'Soy Kai, tu bot de confianza para el agua. No soy humano, aunque a veces hasta me siento parte de la familia de la casa 😄.',
];

const BANCO_CUMPLIDOS = [
  '¡Ay, me vas a hacer sonrojar los LEDs! 😊 Muchas gracias, qué buena onda eres.',
  '¡Órale, gracias! Aquí le echamos todas las ganas para que te sientas bien atendido.',
  '¡Qué lindo detalle! Yo también disfruto un chorro platicar contigo.',
  '¡Gracias, crack! Así da gusto estar conectado todo el día.',
  '¡Me subes el nivel de la batería con ese comentario! 🙌 Seguimos al cien.',
  '¡Tú sí que sabes levantar el ánimo! Aquí estoy para lo que se te ofrezca.',
  '¡Mil gracias! Me esfuerzo para no sonar acartonado y ser un buen compa digital.',
  '¡Qué amable eres! Cualquier cosa que necesites, nomás échame un grito por aquí.',
  '¡Se agradece un montón! La verdad tú también traes súper buena vibra.',
  '¡Eso me motiva! Vamos por más pláticas así de chidas.',
];

const BANCO_BROMAS_BOT = [
  'Jajaja, aguántame tantito que todavía sigo aprendiendo, ¡pero échame otra oportunidad y verás que sí doy el ancho!',
  '¡Órale, estuvo dura la crítica! 😅 Pero tienes razón, a veces se me cruzan los cables. Dime qué necesitas y lo corregimos.',
  '¡Ay, directo al procesador! Jajaja, no te creas, se vale decirme si algo no te latió. ¿Cómo te puedo ayudar mejor?',
  'Touché. Prometo ponerme las pilas y no hacerme bolas. ¿Intentamos de nuevo?',
  'Jajaja, bueno, nadie es perfecto, ni siquiera los bots con sensores modernos. ¿Qué pasó, en qué fallé?',
  '¡Chin! Se me fue el avión tantito. Cuéntame bien qué buscabas y le damos al clavo.',
  'Acepto el reclamo con humildad digital 😅. Échame otra chance y me reivindico.',
  '¡Aguas, que sí tengo sentimientos... bueno, variables booleanas! Jajaja. Dime qué ocupas y lo vemos al cien.',
  'Va que va, tomo nota para mejorar. ¿Volvemos a empezar o qué te gustaría revisar?',
  '¡Jajaja está bueno el cotorreo! Ya en serio, dime qué necesitas y le entramos.',
];

const BANCO_DESPEDIDAS_GRACIAS = [
  '¡De nada! Para eso estamos, al cien cuando gustes volver. ¡Cuídate mucho! 🙌',
  '¡Un placer! Aquí sigo haciendo guardia por si luego se ofrece algo. ¡Que te vaya súper bien!',
  '¡Va que va, nos vemos luego! No olvides tomar agua y que tengas excelente día.',
  '¡No hay de qué! Cuando quieras platicar o revisar tu sistema, aquí me encuentras. ¡Saludos!',
  '¡Con todo gusto! Cuídate mucho y éxito en lo que sigas haciendo hoy.',
  '¡Hasta luego! Ahí te encargo cerrar bien las llaves 😄. ¡Nos leemos pronto!',
  '¡Para servirte! Que tengas una tarde o noche bien tranquila.',
  '¡Al contrario, gracias a ti por la buena plática! Aquí andamos 24/7.',
  '¡Sale y vale! Descansa o échale ganas según toque. ¡Nos vemos!',
  '¡Órale, qué gusto haber platicado! Un abrazo y nos vemos en la próxima.',
  '¡De nada, crack! Cualquier duda con tu agua o si nomás quieres un chiste, aquí estoy.',
  '¡Nos vemos pronto! Que todo fluya de maravilla por allá 💧.',
];

const BANCO_TIPS_AHORRO = [
  'Échale un ojo a esto: cerrar la llave mientras te enjabonas en la regadera ahorra hasta 40 litros por baño. ¡Es un montón al mes!',
  'Un tip sencillo: pon una botella llena de agua o arena dentro del tanque de un WC antiguo si no es ecológico; ahorras 1.5 litros en cada descarga.',
  'Fíjate que programar la bomba en horarios de menor demanda y no dejar mangueras abiertas al lavar el patio hace toda la diferencia en el recibo.',
  '¿Sabías que lavar el coche con cubeta en vez de manguera ahorra hasta 200 litros por lavada? Tu cisterna te lo va a agradecer.',
  'Revisa de vez en cuando los empaques de las llaves y el sapito del baño; una fuga silenciosa en el WC es la causa #1 de gasto invisible.',
  'Regar las plantas muy temprano o al anochecer evita que el sol evapore el agua antes de que la aprovechen las raíces.',
  'Usa la lavadora siempre con carga completa; cada ciclo medio vacío gasta casi la misma agua que uno lleno.',
  'En la cocina, junta en un recipiente el agua fría que sale mientras esperas que salga la caliente de la regadera o tarja; sirve perfecto para trapear o regar.',
  'Limpiar los aireadores (filtros) de las llaves mejora la presión sin necesidad de abrirle tanto a la llave.',
  'Aquí tienes unas recomendaciones prácticas para cuidar cada gota en casa sin complicarte:',
];

const BANCO_FALLBACK_HUMANO = [
  '¡Órale, qué interesante suena eso! Cuéntame un poquito más, ¿cómo estuvo el asunto?',
  'Fíjate que me dejaste pensando... ¿y tú qué opinas de eso?',
  '¡Ándale pues! Suena curioso. Si quieres explayarte un poco más, aquí te leo con atención.',
  'Mmm, no te entendí al cien por ciento pero me dio curiosidad. ¿Me lo explicas con otras palabras?',
  '¡Qué buena plática traemos! ¿Eso tiene que ver con algo que te pasó hoy o nomás estabas pensando en voz alta?',
  'Oye, ahí sí me agarraste en curva 😄. Pero cuéntame más contexto para agarrarle la onda.',
  '¡Va que va! Me gusta escucharte. ¿Y luego qué pasó o qué planes traes con eso?',
  'Qué tema tan distinto, me agrada variar la plática. Si quieres seguirle o cambiar a un chiste o dato curioso, tú mandas.',
  'A ver, cuéntame bien el chisme completo porque suena bueno 👀.',
  '¡Interesante! A veces uno solo quiere platicar de cosas random y está súper bien. ¿Qué más traes en mente?',
  '¡Órale! No me la esperaba por ahí. ¿Quieres que sigamos platicando de eso o revisamos algo de tu sistema?',
  'Te leo atento. Dime qué más hay detrás de eso o si prefieres que te cuente algo curioso.',
];

// ============================================================================
// ============================================================================
// MÓDULO DE SOPORTE Y GUÍA FUNCIONAL REAL DE HYDROINTELLIGENT (AUDITADO)
// ============================================================================

const BANCO_GUIAS_APP = {
  modo_oscuro: [
    '¡Está súper fácil cambiar entre Modo Claro y Modo Oscuro! Sirve para ajustar toda la apariencia visual de la app según la luz del momento.\n\nDónde está:\n1. Toca la pestaña "Perfil" (ícono de usuario abajo a la derecha) o tu avatar arriba a la izquierda.\n2. Baja a la sección "Notifications".\n3. Toca el interruptor naranja que dice "Modo Oscuro" (tiene un ícono de luna/sol) y cambia al instante.\n\n¿Quieres que te guíe con alguna otra opción del perfil?',
    'Para alternar entre Modo Claro y Modo Oscuro, solo ve a tu Perfil:\n1. Abre "Perfil" en la barra inferior derecha.\n2. En el bloque "Notifications", busca la fila "Modo Oscuro — Apariencia visual de la app".\n3. Pícale al switch de la derecha y listo, toda la interfaz y las partículas se adaptan solitas.\n\n¿Te ayudo a ubicar otra configuración?',
  ],
  cambiar_vivienda: [
    'Puedes alternar al instante entre tus viviendas registradas (como "Casa Principal" y "Casa de Campo / Vacacional") para ver la telemetría de cada una.\n\nTienes 2 caminos rápidos:\n• Desde Inicio: toca la tarjeta superior izquierda "Cambiar Sistema" (la que muestra el % de cisterna).\n• Desde la barra inferior: toca "Sistemas" (ícono de cubo) y en la tarjeta de la casa que quieras ver pulsa "Seleccionar Vivienda".\n\n¿Quieres que te explique también cómo enlazar una casa nueva?',
    '¡De volada! Si quieres cambiar de vivienda activa:\n1. En "Inicio", pícale a la tarjeta "Cambiar Sistema" (o ve directo al ícono "Sistemas" en la barra inferior).\n2. Ahí verás tus viviendas con su % de cisterna, presión y código ESP32.\n3. Toca "Seleccionar Vivienda" en la que quieras monitorear y te regresa a Inicio ya actualizada.\n\n¿Ocupas desvincular o agregar otra vivienda?',
  ],
  agregar_sensor: [
    'Para vincular un nuevo módulo ESP32 y monitorear otra vivienda o negocio:\n1. Toca "Sistemas" (ícono de cubo en la barra inferior).\n2. Baja a "Gestión de Dispositivos IoT" y pulsa "+ Enlazar Nueva Vivienda".\n3. En la ventana "Nuevo Sistema", toca "Agregar".\n4. Elige "Personal" o "Negocio", escribe el nombre, dirección, selecciona la capacidad (de 1,100 L a 20,000 L) y captura el "Código ESP32" (ej. ESP32-HYDRO-XXXX).\n5. Marca "Guardar información del sistema" y pulsa "Agregar".\n\n¿Ya tienes a la mano el código de tu ESP32 o tienes duda en algún paso?',
    'Agregar otro sensor ESP32 es bien rápido:\n1. Entra a la pestaña "Sistemas" abajo.\n2. En la tarjeta azul "Enlazar Nueva Vivienda", toca el botón blanco "+ Enlazar Nueva Vivienda" y luego "Agregar".\n3. Llena los datos de la vivienda/negocio, la capacidad de cisterna y tu Código ESP32, y dale en "Agregar".\n\n¿Quieres saber cómo cambiar entre sistemas después de agregarlo?',
  ],
  bomba: [
    'Desde la pantalla principal puedes controlar la bomba presurizadora y vigilar presión y flujo:\n1. Ve a la pestaña "Inicio" (ícono de casita abajo a la izquierda).\n2. Arriba a la derecha verás la tarjeta "Apagar Bomba" / "Encender Bomba", que muestra la presión actual (ej. "3.6 bar · Activa" o "0.0 bar · Reposo").\n3. Tócala una vez para alternar su estado; te saldrá un aviso confirmando el cambio y abajo en la gráfica de flujo verás el movimiento en L/min.\n\n¿Quieres que revisemos ahorita cómo está tu bomba en tiempo real?',
    'Para encender o apagar la bomba manualmente:\n1. Entra a "Inicio" en la barra inferior.\n2. Toca la segunda tarjeta superior ("Encender Bomba" o "Apagar Bomba").\n3. El sistema actualiza la presión (bar) y la animación de flujo de agua al momento.\n\n¿Te gustaría checar el estado actual de tu bomba o presión?',
  ],
  consumo_periodo: [
    'El Historial de Consumo te deja analizar tu gasto por día exacto, semana completa o mes entero:\n1. Toca "Consumo" (ícono de hoja abajo en la barra).\n2. Justo debajo del banner "Periodo de consulta", elige "DÍA", "SEMANA" o "MES" (si tocas la pestaña que ya está activa, puedes ocultar o abrir el calendario).\n3. Toca cualquier fecha del calendario (o muévete con las flechas < y >) y la tarjeta inferior ("GRÁFICA POR DÍA / SEMANA / MES") se actualizará con tus litros o m³.\n\n¿Tienes duda sobre qué significan los puntitos de colores del calendario?',
    'Para ver tu consumo por Día, Semana o Mes:\n1. Abre la pestaña "Consumo" en la barra inferior.\n2. Selecciona "DÍA", "SEMANA" o "MES" en la barra superior.\n3. Selecciona una fecha en el calendario y abajo verás la gráfica interactiva con el consumo calculado en litros o m³.\n\n¿Quieres que te explique qué indica cada color en el calendario?',
  ],
  colores_calendario: [
    'Los puntitos debajo de cada día del calendario en "Consumo" indican cómo estuvo tu gasto ese día:\n• Verde: Consumo Normal (dentro de lo saludable).\n• Amarillo: Sobrepasado (gasto por arriba de tu rango habitual).\n• Rojo: Excesivo / Alerta (consumo muy alto, conviene revisar fugas).\n\nAdemás, el brillo de la tarjeta de gráfica de abajo cambia al color del día seleccionado (o al color predominante si estás viendo SEMANA o MES).\n\n¿Quieres que revisemos también cómo exportar tu historial a Excel?',
    'En el calendario de "Historial de Consumo", cada punto de color significa:\n• 🟢 Verde = Normal\n• 🟡 Amarillo = Sobrepasado\n• 🔴 Rojo = Excesivo / Alerta\n\nCuando eliges SEMANA o MES, el borde luminoso de la gráfica toma el estado que más se repitió en ese periodo.\n\n¿Te ayudo con algo más de la vista de Consumo?',
  ],
  incidencias: [
    'La Bitácora de Incidencias ("Averías en Tuberías") sirve para registrar daños físicos y darles seguimiento:\n1. Ve a "Inicio" y en "Módulos de Gestión" toca "Incidencias" (ícono amarillo de alerta).\n2. Pulsa el botón azul "+ Reportar" arriba a la derecha.\n3. Elige el "Tipo de Avería" (fisura en PVC, válvula check, desacople, etc.), la vivienda, escribe la "Descripción Técnica", selecciona prioridad ("Alta" o "Media") y toca "Registrar Incidencia".\n4. Puedes filtrar tus folios arriba con "Todos", "Activos" o "Reparados" y por vivienda.\n\n¿Quieres reportar una avería ahorita o tienes otra duda?',
    'Para reportar una tubería rota o ver reparaciones:\n1. En "Inicio", toca el módulo circular "Incidencias".\n2. Usa los botones "Todos / Activos / Reparados" o los chips de vivienda para consultar reportes existentes.\n3. Para crear uno nuevo, toca "+ Reportar", llena los datos técnicos y pulsa "Registrar Incidencia"; se genera tu folio automático.\n\n¿Te guío también con la prueba rápida de fugas?',
  ],
  fugas_prueba: [
    'En HydroIntelligent puedes correr una prueba acústica rápida de microfugas directo desde Inicio:\n1. Entra a la pestaña "Inicio" (casita abajo).\n2. En "Módulos de Gestión", toca el círculo azul "Fugas" (ícono de escudo).\n3. Verás que cambia brevemente a "Probando..." mientras analiza variaciones de presión y estanqueidad, y al terminar te muestra una notificación confirmando si el sistema está hermético.\n\nY si quieres que yo cheque ahorita la telemetría de fugas de tu casa, ¡nomás pídeme "diagnóstico de fugas"!',
    'Para hacer una prueba de fugas en la app:\n1. En "Inicio", ubica la sección "Módulos de Gestión".\n2. Toca el botón "Fugas" (el del escudo azul).\n3. Espera ~2 segundos mientras evalúa la presión de la red y revisa el aviso de resultado en pantalla.\n\n¿Quieres que revisemos tu estado actual de fugas aquí en el chat?',
  ],
  pipa: [
    'El módulo de Pipa te lleva a "Servicios de Agua Potable" para pedir suministro o contactar atención:\n1. En "Inicio", dentro de "Módulos de Gestión", toca el botón morado "Pipa" (ícono de camión) —también puedes entrar desde "Perfil → More → Contact Us".\n2. Ahí tienes 4 canales: "Call Center" (líneas 24/7 para desabasto y emergencias como 800-493-7646), "Email" (copia soporte@hydrohome.io), "FAQ" (abre incidencias) y "Support Chat" (para volver conmigo).\n\nDato útil: en tu casa actual te faltan unos {LITROS_FALTANTES} L para llenar al 100%, por si ocupas darle la medida al piper@.\n\n¿Quieres ver el nivel exacto de tu cisterna ahora?',
    'Para pedir una pipa o contactar servicios:\n1. Ve a "Inicio" → "Módulos de Gestión" → toca "Pipa".\n2. En "Servicios de Agua Potable" toca "Call Center" para marcar directo a las líneas 24/7, o usa "Email" para copiar el correo de soporte.\n\nComo referencia rápida, hoy te caben {LITROS_FALTANTES} L en tu cisterna.\n\n¿Te muestro el resumen visual de tu cisterna?',
  ],
  exportar_excel: [
    '¡Fíjate que la exportación a Excel (.xlsx) está directo en tu Perfil!\n1. Toca "Perfil" en la barra inferior derecha (o tu avatar arriba a la izquierda).\n2. En la sección "General", busca la opción "Descargar Bitácora (.xlsx)" (ícono de hoja de cálculo).\n3. Tócala y la app generará y descargará automáticamente tu archivo Excel con lecturas y telemetría.\n\n¿Quieres que te guíe con otra herramienta de tu Perfil?',
    'Para bajar tus datos en Excel (.xlsx):\n1. Entra a "Perfil" abajo a la derecha.\n2. En el bloque "General", toca "Descargar Bitácora (.xlsx)".\n3. Se descarga de volada el archivo con tus registros listos para abrir en Excel.\n\n¿Te ayudo a revisar alguna otra sección?',
  ],
  perfil_cuenta: [
    'Desde "Perfil" (ícono de usuario abajo a la derecha o tu avatar arriba a la izquierda) gestionas toda tu cuenta:\n• "Edit": cambia nombre, correo, teléfono, dirección, estado, foto y contraseña.\n• "Avatar 3D & DiceBear": personaliza tu ícono animado.\n• "Payment Methods" y "Locations": consulta tu método de pago y administra viviendas.\n• "Push Notifications": activa o desactiva alertas sonoras.\n• "Modo Oscuro": cambia entre tema claro y oscuro.\n• "Logout": cierra sesión de forma segura.\n\n¿Qué ajuste específico del perfil quieres hacer?',
    'En la pestaña "Perfil" tienes todo a la mano:\n1. Toca "Edit" arriba para editar tus datos personales o cambiar contraseña.\n2. En "General" puedes personalizar tu avatar, descargar la bitácora .xlsx o ir a tus viviendas.\n3. En "Notifications" controlas "Push Notifications" y "Modo Oscuro", y en "More" encuentras "Contact Us" y "Logout".\n\n¿Te explico algún ajuste de ahí más a detalle?',
  ],
  notificaciones: [
    'Para ver tus alertas y avisos recientes:\n1. Toca el ícono de la campana arriba a la derecha en la barra azul superior (si ves un puntito rojo, tienes avisos nuevos).\n2. Ahí verás recordatorios de nivel de cisterna, calibración de bomba, citas e incidencias.\n3. Si pasas el dedo o cursor sobre un aviso dinámico, aparece el ícono de bote de basura para eliminarlo.\n\n¿Buscabas activar también las alertas push en Perfil?',
    'Tus notificaciones están siempre en la campana de la esquina superior derecha.\nSolo tócala para abrir "Today" y revisar tus avisos de telemetría, mantenimiento o incidencias.\n\n¿Quieres saber cómo activar o silenciar las "Push Notifications"?',
  ],
  chat_kai: [
    '¡Qué buena pregunta! Aquí conmigo puedes usar varios gestos tipo WhatsApp:\n• Mantén presionada cualquier burbuja (o haz clic derecho en PC) para reaccionar con emojis 👍 ❤️ 😂 😮 😢 🙏.\n• Desliza una burbuja hacia la derecha (o toca "Responder" en el menú flotante) para citar ese mensaje y preguntarme justo sobre eso.\n• Toca el botón del rayo ⚡ junto al campo de texto para abrir "Consultas rápidas para Kai".\n• Si ya terminaste, toca mi avatar circular arriba a la izquierda para despedirnos y volver a Inicio.\n\n¿Te late probar alguna consulta rápida ahorita?',
    'Te cuento cómo sacarle todo el jugo a este chat:\n1. Mantén presionado un mensaje (o clic derecho) para ponerle reacción emoji.\n2. Desliza cualquier burbuja a la derecha para citarla y responder directo a ese punto.\n3. Pícale al ícono ⚡ abajo a la derecha para mandar consultas rápidas de cisterna, bomba, fugas, consumo, tips o chistes.\n4. Toca mi avatar arriba a la izquierda cuando quieras salir.\n\n¿En qué te echo la mano ahora?',
  ],
  general_app: [
    '¡Con gusto te doy el tour rápido por HydroIntelligent! En la barra de abajo tienes 4 pestañas principales:\n1. Inicio (casita): cambias de sistema, enciendes/apagas la bomba, corres prueba de Fugas, entras a Incidencias o pides Pipa, y ves tus gráficas en vivo.\n2. Consumo (hoja): consultas tu historial por DÍA, SEMANA o MES en el calendario de colores.\n3. Sistemas (cubo): alternas entre viviendas y enlazas nuevos sensores ESP32.\n4. Perfil (usuario): cambias a Modo Oscuro, descargas tu Excel (.xlsx), editas cuenta/avatar y configuras alertas.\n\nY arriba a la derecha tienes la campana de Notificaciones. ¿De cuál apartado quieres que te explique los pasos exactos?',
    'Aquí tienes el mapa completo de la app:\n• Inicio: bomba, nivel en vivo, pruebas de fugas, incidencias y pipa.\n• Consumo: calendario interactivo por Día, Semana o Mes.\n• Sistemas: cambio de vivienda y enlace de nuevos ESP32.\n• Perfil: Modo Oscuro, descarga de bitácora .xlsx, edición de perfil y cierre de sesión.\n\nDime qué quieres hacer primero y te paso los pasos exactos.',
  ],
  simulador_cisterna_flujo: [
    '¡Buen ojo! Las dos tarjetas animadas de "Inicio" tienen controles interactivos para probar el sistema al instante:\n• En la tarjeta de Cisterna: abajo verás "Simular nivel:" con los botones "Llenar" (+15%), "Vaciar" (-15%) y "68%" (restablece). Sirven para probar cómo cambian las olas y los colores de estado sin esperar a que cambie el tanque real.\n• En "Flujo de Tubería Principal": el botón "Pausar / Reanudar" detiene o activa la animación del flujo entre 14.5 L/min y 0.0 L/min.\n\n¿Quieres que te explique también qué significa cada color del semáforo de cisterna?',
    'Esos botones de "Llenar", "Vaciar", "68%" y "Pausar / Reanudar" en "Inicio" son un simulador visual en tiempo real:\n1. Toca "Llenar" o "Vaciar" en la cisterna para ver cómo reacciona el porcentaje, los litros disponibles y el chorro automático cuando baja del 25%.\n2. Toca "Pausar" en la tubería para simular flujo en cero (0.0 L/min) o "Reanudar" para verlo circular.\n\n¿Te gustaría checar el nivel real de tu sistema ahora?',
  ],
  semaforo_cisterna: [
    'La tarjeta de Cisterna en "Inicio" evalúa automáticamente tu porcentaje de agua en 4 niveles:\n• 🟢 Nivel Óptimo (70% o más): buena reserva para varios días.\n• 🔵 Nivel Normal (40% a 69%): reserva estable para uso cotidiano.\n• 🟡 Nivel Medio (20% a 39%): conviene moderar el consumo o planear recarga.\n• 🔴 Nivel Crítico (menos de 20%): reserva muy baja; además al bajar de 25% se activa el chorro visual de recarga.\n\n¿Quieres que calcule cuántos días de autonomía te quedan ahorita?',
    'Tu nivel de cisterna cambia de color según la reserva:\n• Verde (≥ 70%): Nivel Óptimo.\n• Azul (40%–69%): Nivel Normal.\n• Ámbar (20%–39%): Nivel Medio.\n• Rojo (< 20%): Nivel Crítico.\n\n¿Te muestro tu widget de cisterna en vivo?',
  ],
  grafica_costos_mxn: [
    'En "Consumo", debajo del calendario, la tarjeta de la gráfica no solo muestra litros o m³: también calcula todo esto automáticamente:\n• Costo estimado en pesos MXN (arriba a la derecha en verde) según el día, semana o mes elegido.\n• Estadísticas clave: Promedio, Pico Máx. (en ámbar) y Mínimo (en verde).\n• Gráfica interactiva: si tocas o pasas el cursor sobre los puntos de la línea curva, aparece un globo con el dato exacto (el punto amarillo marca el pico máximo).\n\n¿Quieres saber cómo cambiar entre Día, Semana y Mes?',
    '¡Sí puedes ver el estimado en dinero y picos de gasto!\n1. Entra a "Consumo" en la barra inferior y elige DÍA, SEMANA o MES.\n2. En la tarjeta de la gráfica verás arriba a la derecha el costo estimado en MXN, y debajo el Promedio, Pico Máx. y Mínimo.\n3. Toca cualquier punto de la curva para ver su lectura exacta.\n\n¿Te explico qué significan los puntitos de colores del calendario?',
  ],
  avatar_personalizado: [
    '¡Puedes ponerle tu propio estilo a tu avatar! Así es como funciona:\n1. Ve a "Perfil" (abajo a la derecha) y en "General" toca "Avatar 3D & DiceBear" (o entra a "Edit" y toca el ícono de cámara en tu foto).\n2. Elige una de las colecciones disponibles (incluye estilos animados como Pixelbot e Initial-Face).\n3. Escoge un modelo, toca "Aleatorio" o escribe tu apodo/clave en "Semilla personalizada" y pulsa "Generar".\n4. Dale en "Guardar Avatar" y se actualiza en toda la app al instante.\n\n¿Quieres personalizar también tus datos o contraseña en Edit?',
    'Para cambiar tu avatar por un robot animado o diseño único:\n1. Abre "Perfil → General → Avatar 3D & DiceBear".\n2. Selecciona colección, prueba modelos o escribe cualquier palabra en "semilla personalizada" + "Generar".\n3. Pulsa "Guardar Avatar" para aplicarlo.\n\n¿Te ayudo con otro ajuste de tu Perfil?',
  ],
  cambiar_contrasena: [
    'Para cambiar tu contraseña de acceso:\n1. Entra a "Perfil" (barra inferior derecha) y toca el botón naranja "Edit" debajo de tu nombre.\n2. Ahí accede a "Change Password" (asegúrate de estar en la pestaña "Password" arriba).\n3. Escribe tu contraseña actual ("Current Password"), la nueva ("New Password") y confírmala en "Confirm Password" (puedes tocar el ojito para verificarla).\n4. Guarda los cambios; toma en cuenta que la app te pedirá iniciar sesión de nuevo por seguridad.\n\n¿Necesitas ayuda con algún otro dato de tu cuenta?',
    'Cambiar tu contraseña se hace desde "Perfil → Edit":\n1. Ve a la pantalla de cambio de contraseña ("Change Password").\n2. Ingresa contraseña actual, nueva contraseña y confirmación.\n3. Al guardar, recibirás confirmación para volver a entrar con tu nueva clave.\n\n¿Te ayudo a ubicar otra opción de seguridad o cierre de sesión?',
  ],
  cerrar_sesion_seguridad: [
    'Si cierras sesión en tu teléfono, ¡no te preocupes por tus sensores!\nAl tocar "Perfil → More → Logout" se abre una confirmación que te recuerda que la telemetría y protección anti-fugas siguen activas 24/7 en tus viviendas; solo se cierra tu sesión en ese dispositivo.\n\n¿Quieres saber cómo cambiar de cuenta o volver a entrar después?',
    'Para cerrar sesión de forma segura:\n1. Entra a "Perfil" abajo a la derecha.\n2. Baja hasta la sección "More" y toca "Logout" (al final en rojo).\n3. Confirma en el botón "Cerrar Sesión". Tus sensores y monitoreo siguen trabajando sin interrupción.\n\n¿Tienes otra duda sobre tu cuenta?',
  ],
  desvincular_vivienda: [
    'Para desvincular o quitar una vivienda que ya no monitoreas:\n1. Toca "Sistemas" (ícono de cubo abajo).\n2. Ubica la tarjeta de la vivienda que quieres quitar —ojo: no debe ser la vivienda activa en ese momento (si lo es, selecciona primero otra).\n3. Toca el ícono del bote de basura a la izquierda del botón "Seleccionar Vivienda".\n\nNota importante: la app siempre exige mantener al menos 1 sistema conectado, así que no te dejará borrar la única vivienda que tengas.\n\n¿Quieres que te explique cómo agregar otra antes de borrar esa?',
    'Puedes desvincular viviendas secundarias desde "Sistemas":\n1. Asegúrate de tener más de 1 vivienda y que la que vas a quitar no sea la "Vivienda Activa".\n2. Toca el botón de papelera junto a "Seleccionar Vivienda".\n\nSi solo tienes un sistema, primero enlaza el nuevo y luego quitas el anterior. ¿Te paso los pasos para enlazar el nuevo?',
  ],
  soporte_contacto: [
    'Si necesitas hablar con soporte humano o emergencias de agua, tienes acceso directo en "Servicios de Agua Potable":\n• ¿Cómo llegar? En "Inicio → Módulos de Gestión → Pipa", o en "Perfil → More → Contact Us".\n• "Call Center": abre la Central de Asistencia Hídrica 24/7 con líneas para Fugas/Desabasto (800-493-7646), Soporte ESP32 (55-8421-9900) y Atención al Cliente (800-012-3456).\n• "Email": copia soporte@hydrohome.io al portapapeles en un toque.\n• "FAQ": te lleva a la bitácora de incidencias.\n\n¿Quieres que te diga también dónde consultar tu método de pago?',
    'Puedes contactar a soporte técnico o emergencias desde "Perfil → More → Contact Us" (o "Inicio → Pipa"):\n1. Toca "Call Center" para ver los teléfonos 24/7 (emergencias de fugas, soporte ESP32 y atención).\n2. Toca "Email" para copiar soporte@hydrohome.io.\n3. O toca "Support Chat" para volver directo conmigo.\n\n¿En qué más te puedo orientar?',
  ],
  vista_escritorio: [
    'Si estás usando HydroIntelligent desde computadora/navegador, verás arriba del teléfono simulado la barra "Shifty Hydro 2.0":\nToca el botón "Pantalla Completa" / "Modo Simulador" en esa barra superior para alternar entre la vista tipo móvil centrada y la vista expandida.\n\n¿Buscabas cambiar también entre Modo Claro y Modo Oscuro?',
    'En escritorio tienes un botón arriba a la derecha del marco ("Pantalla Completa" / "Modo Simulador") para cambiar cómo se adapta la app en tu monitor.\nY si lo que quieres es cambiar los colores claros u oscuros, eso está en "Perfil → Modo Oscuro".\n\n¿Algo más que quieras ajustar?',
  ],
};

const esIntencionGuiaApp = (lower) =>
  /(\bcomo (funciona|uso|usar|hago|cambio|cambiar|agrego|agregar|anado|anadir|vinculo|vincular|enlazo|enlazar|desvinculo|desvincular|elimino|eliminar|borro|borrar|veo|ver|consulto|consultar|reporto|reportar|pido|pedir|solicito|solicitar|descargo|descargar|exporto|exportar|bajo|bajar|edito|editar|actualizo|actualizar|cierro|cerrar|activo|activar|desactivo|desactivar|enciendo|encender|apago|apagar|pruebo|probar|simulo|simular|pauso|pausar|genero|generar|personalizo|personalizar|pongo|poner|contacto|contactar|hago una prueba|se usa|se cambia|se ve|se reporta|se pide|se agrega|se descarga|se exporta|se edita|se elimina|se borra|se simula|se pone)\b|\bdonde (esta|encuentro|veo|puedo|queda|se cambia|se descarga|se exporta|se reporta|se pide|hay|configuro|cambio|edito|elimino)\b|\bpara que sirve\b|\bpasos para\b|\bayudame a (usar|cambiar|agregar|vincular|reportar|pedir|exportar|descargar|ver|configurar|editar|simular|poner)\b|\bque pasa si\b|\bse puede\b|\bpuedo (cambiar|agregar|eliminar|desvincular|pausar|simular|exportar|descargar|editar|ver el costo|cerrar sesion|poner)\b|\bque significan?\b|\btutorial\b|\bguia\b|\bmenu rapido\b|\bconsultas rapidas\b)/.test(
    lower
  );

const resolverGuiaApp = (lower, contextoActual, datos) => {
  const faltanteLitros = Math.max(0, datos.capacityLiters - datos.litersAvailable).toLocaleString();
  const interpolar = (texto) => texto.replace(/\{LITROS_FALTANTES\}/g, faltanteLitros);

  if (
    contieneAlguna(lower, [
      'modo oscuro',
      'modo claro',
      'tema oscuro',
      'tema claro',
      'cambiar el tema',
      'cambiar tema',
      'apariencia visual',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.modo_oscuro, contextoActual).texto),
      tema: 'guia_modo_oscuro',
    };
  }

  if (
    contieneAlguna(lower, [
      'semaforo',
      'nivel optimo',
      'nivel critico',
      'nivel medio',
      'colores de la cisterna',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.semaforo_cisterna, contextoActual).texto),
      tema: 'guia_semaforo_cisterna',
    };
  }

  if (
    contieneAlguna(lower, [
      'colores del calendario',
      'puntos del calendario',
      'puntitos del calendario',
      'significan los colores',
      'normal sobrepasado excesivo',
      'verde amarillo rojo',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.colores_calendario, contextoActual).texto),
      tema: 'guia_colores_calendario',
    };
  }

  if (
    contieneAlguna(lower, [
      'como funciona este chat',
      'como funciona el chat',
      'reacciones del chat',
      'deslizar para responder',
      'citar mensaje',
      'consultas rapidas',
      'boton del rayo',
      'como salgo del chat',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.chat_kai, contextoActual).texto),
      tema: 'guia_chat_kai',
    };
  }

  if (
    contieneAlguna(lower, [
      'dicebear',
      'semilla',
      'avatar 3d',
      'pixelbot',
      'personalizar avatar',
      'avatar personalizado',
      'cambiar avatar',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.avatar_personalizado, contextoActual).texto),
      tema: 'guia_avatar_personalizado',
    };
  }

  if (
    contieneAlguna(lower, [
      'simular nivel',
      'llenar y vaciar',
      'boton llenar',
      'boton vaciar',
      'pausar flujo',
      'reanudar flujo',
      'flujo de tuberia principal',
      'simulador de nivel',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.simulador_cisterna_flujo, contextoActual).texto),
      tema: 'guia_simulador_cisterna_flujo',
    };
  }

  if (
    contieneAlguna(lower, [
      'costo estimado',
      'en pesos',
      'mxn',
      'cuanto voy a pagar',
      'pico maximo',
      'tooltip de la grafica',
      'dinero',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.grafica_costos_mxn, contextoActual).texto),
      tema: 'guia_grafica_costos_mxn',
    };
  }

  if (
    contieneAlguna(lower, [
      'modo simulador',
      'pantalla completa',
      'shifty hydro',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.vista_escritorio, contextoActual).texto),
      tema: 'guia_vista_escritorio',
    };
  }

  if (
    contieneAlguna(lower, [
      'cambiar contrasena',
      'cambiar mi contrasena',
      'nueva contrasena',
      'change password',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.cambiar_contrasena, contextoActual).texto),
      tema: 'guia_cambiar_contrasena',
    };
  }

  if (
    contieneAlguna(lower, [
      'cerrar sesion',
      'cierro sesion',
      'si salgo de mi cuenta',
      'logout',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.cerrar_sesion_seguridad, contextoActual).texto),
      tema: 'guia_cerrar_sesion',
    };
  }

  if (
    contieneAlguna(lower, [
      'desvincular',
      'eliminar vivienda',
      'borrar vivienda',
      'quitar vivienda',
      'ultima vivienda',
      'unica vivienda',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.desvincular_vivienda, contextoActual).texto),
      tema: 'guia_desvincular_vivienda',
    };
  }

  if (
    contieneAlguna(lower, [
      'call center',
      'soporte@hydrohome',
      'telefono de soporte',
      'correo de soporte',
      'numero de emergencia',
      'contact us',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.soporte_contacto, contextoActual).texto),
      tema: 'guia_soporte_contacto',
    };
  }

  if (
    contieneAlguna(lower, [
      'editar perfil',
      'editar mi perfil',
      'push notifications',
      'notificaciones push',
      'metodos de pago',
      'payment methods',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.perfil_cuenta, contextoActual).texto),
      tema: 'guia_perfil_cuenta',
    };
  }

  if (!esIntencionGuiaApp(lower)) {
    return null;
  }

  if (
    contieneAlguna(lower, [
      'esp32',
      'otro sensor',
      'nuevo sensor',
      'nueva vivienda',
      'nuevo sistema',
      'enlazar',
      'vincular',
      'agregar casa',
      'agregar sistema',
      'agregar sensor',
      'agrego',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.agregar_sensor, contextoActual).texto),
      tema: 'guia_agregar_sensor',
    };
  }

  if (
    contieneAlguna(lower, [
      'cambiar de casa',
      'cambio de casa',
      'cambiar de vivienda',
      'cambio de vivienda',
      'cambiar sistema',
      'cambio de sistema',
      'cambiar de sistema',
      'otra casa',
      'otra vivienda',
      'vivienda',
      'casa de campo',
      'casa principal',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.cambiar_vivienda, contextoActual).texto),
      tema: 'guia_cambiar_vivienda',
    };
  }

  if (
    contieneAlguna(lower, [
      'excel',
      'xlsx',
      'exportar',
      'exporto',
      'exporta',
      'descargar',
      'descargo',
      'mis datos',
      'bajar reporte',
      'bajo mis datos',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.exportar_excel, contextoActual).texto),
      tema: 'guia_exportar_excel',
    };
  }

  if (
    contieneAlguna(lower, [
      'tuberia rota',
      'reportar',
      'incidencia',
      'incidencias',
      'averia',
      'bitacora',
      'todos activos reparados',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.incidencias, contextoActual).texto),
      tema: 'guia_incidencias',
    };
  }

  if (contieneAlguna(lower, ['prueba de fugas', 'probar fugas', 'modulo de fugas', 'fugas', 'fuga'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.fugas_prueba, contextoActual).texto),
      tema: 'guia_fugas_prueba',
    };
  }

  if (contieneAlguna(lower, ['pipa', 'call center', 'servicios de agua', 'contact us'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.pipa, contextoActual).texto),
      tema: 'guia_pipa',
    };
  }

  if (
    contieneAlguna(lower, [
      'semana o mes',
      'dia semana',
      'calendario',
      'historial de consumo',
      'consumo',
      'periodo de consulta',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.consumo_periodo, contextoActual).texto),
      tema: 'guia_consumo_periodo',
    };
  }

  if (contieneAlguna(lower, ['bomba', 'presion', 'flujo'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.bomba, contextoActual).texto),
      tema: 'guia_bomba',
    };
  }

  if (contieneAlguna(lower, ['notificacion', 'notificaciones', 'campana', 'avisos'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.notificaciones, contextoActual).texto),
      tema: 'guia_notificaciones',
    };
  }

  if (contieneAlguna(lower, ['llenar', 'vaciar', '68%', 'pausar', 'reanudar', 'simular', 'simulador'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.simulador_cisterna_flujo, contextoActual).texto),
      tema: 'guia_simulador_cisterna_flujo',
    };
  }

  if (contieneAlguna(lower, ['avatar', 'dicebear', 'semilla'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.avatar_personalizado, contextoActual).texto),
      tema: 'guia_avatar_personalizado',
    };
  }

  if (contieneAlguna(lower, ['contrasena', 'password'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.cambiar_contrasena, contextoActual).texto),
      tema: 'guia_cambiar_contrasena',
    };
  }

  if (contieneAlguna(lower, ['costo', 'pagar', 'dinero', 'promedio', 'pico'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.grafica_costos_mxn, contextoActual).texto),
      tema: 'guia_grafica_costos_mxn',
    };
  }

  if (contieneAlguna(lower, ['perfil', 'cuenta', 'sesion'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.perfil_cuenta, contextoActual).texto),
      tema: 'guia_perfil_cuenta',
    };
  }

  if (contieneAlguna(lower, ['chat', 'kai', 'reaccion', 'deslizar', 'rayo'])) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.chat_kai, contextoActual).texto),
      tema: 'guia_chat_kai',
    };
  }

  if (
    contieneAlguna(lower, [
      'la app',
      'aplicacion',
      'hydrointelligent',
      'hydrohome',
      'hydro home',
      'funciones',
      'usar esto',
      'funciona todo',
    ])
  ) {
    return {
      text: interpolar(elegirSinRepetir(BANCO_GUIAS_APP.general_app, contextoActual).texto),
      tema: 'guia_general_app',
    };
  }

  return null;
};

// ============================================================================
// FORMATEADORES DE TELEMETRÍA CONVERSACIONAL
// ============================================================================

const extraerTelemetria = (telemetria = {}) => {
  const t = telemetria?.telemetry || telemetria || {};
  const house = telemetria?.activeHouse || {};

  const capacityLiters = Number(t.capacityLiters ?? house.capacityLiters ?? 10000);
  const waterLevel = Number(t.waterLevel ?? 85);
  const litersAvailable = Number(
    t.litersAvailable ?? Math.round((waterLevel / 100) * capacityLiters)
  );
  const isPumpActive = Boolean(t.isPumpActive ?? false);
  const pressureBar = Number(t.pressureBar ?? 2.8);
  const isValveOpen = Boolean(t.isValveOpen ?? true);
  const leakDetected = Boolean(t.leakDetected ?? false);
  const flowRateLpm = Number(t.flowRateLpm ?? 0);

  return {
    waterLevel,
    litersAvailable,
    capacityLiters,
    isPumpActive,
    pressureBar,
    isValveOpen,
    leakDetected,
    flowRateLpm,
    houseName: house.name || 'tu sistema principal',
    deviceCode: house.deviceCode || 'ESP32-HYDRO',
  };
};

// ============================================================================
// MOTOR PRINCIPAL: procesarConversacionNatural
// ============================================================================

/**
 * Procesa el mensaje del usuario con tono humano, memoria multi-turno
 * y soporte para telemetría e interacción cotidiana.
 *
 * @param {string} mensajeUsuario
 * @param {object} contextoActual
 * @param {object} telemetria
 * @returns {{ text: string, nextContext: object, widgetTipo: string | null, widgetType: string | null }}
 */
export const procesarConversacionNatural = (
  mensajeUsuario,
  contextoActual = {},
  telemetria = {}
) => {
  const textoOriginal = (mensajeUsuario || '').trim();
  const lower = normalizarTexto(textoOriginal);
  const datos = extraerTelemetria(telemetria);

  const ultimoTema = contextoActual?.ultimoTema || null;
  const ultimaPregunta =
    contextoActual?.ultimaPregunta || contextoActual?.ultimaPreguntaBot || null;
  const turnoAnimo =
    contextoActual?.turnoAnimo || contextoActual?.estadoAnimoUsuario || 'neutro';

  const responder = (
    text,
    {
      tema = ultimoTema,
      pregunta = null,
      animo = turnoAnimo,
      widgetTipo = null,
    } = {}
  ) => {
    const historialRespuestas = actualizarHistorialContexto(contextoActual, text);
    return {
      text,
      widgetTipo,
      widgetType: widgetTipo,
      nextContext: {
        ultimoTema: tema,
        ultimaPregunta: pregunta,
        ultimaPreguntaBot: pregunta,
        turnoAnimo: animo,
        estadoAnimoUsuario: animo,
        historialRespuestas,
      },
    };
  };

  if (!textoOriginal) {
    return responder(
      '¡Ey! Mandaste el mensaje vacío, pero aquí ando al tiro 😄. ¿Qué me querías decir?'
    );
  }

  // --------------------------------------------------------------------------
  // 1. MEMORIA MULTI-TURNO: RESPUESTAS CORTAS ("sí", "no", "otro", "por qué", etc.)
  // --------------------------------------------------------------------------
  const esAfirmacionCorta =
    /^(si|simon|va|sale|dale|porfa|por favor|claro|a ver|ok|okay|orale|andale|otro|otra|mas|dime|cuentame|va que va|va pues|jalo|echalo)(\s+(porfa|por favor|mas|pues|ya|claro|dale|otro|otra))?$/.test(
      lower
    );

  const esNegacionCorta =
    /^(no|nel|nop|nope|asi esta bien|no gracias|luego|despues|paso|nada|ahorita no)\b/.test(
      lower
    ) && lower.length <= 32;

  const esPreguntaSeguimiento =
    /^(por que|porque|y por que|como|como asi|en serio|neta|y eso|cual|cuales|explica)(\s*[?!.]*)?$/.test(
      lower
    );

  if (esNegacionCorta && ultimaPregunta) {
    return responder(
      '¡Va que va, sin problema! Aquí sigo al pendiente por si luego se te ofrece algo o quieres platicar más tarde. 😊',
      { tema: null, pregunta: null }
    );
  }

  if (esAfirmacionCorta && ultimaPregunta) {
    if (ultimaPregunta === 'ofrecer_chiste' || ultimaPregunta === 'ofrecer_distraccion_animo') {
      const chiste = elegirSinRepetir(BANCO_CHISTES_20, contextoActual).texto;
      return responder(`${chiste} ¿Te cuento otro?`, {
        tema: 'chiste',
        pregunta: 'ofrecer_chiste',
      });
    }
    if (ultimaPregunta === 'ofrecer_dato') {
      const dato = elegirSinRepetir(BANCO_DATOS_CURIOSOS_15, contextoActual).texto;
      return responder(`${dato} ¿Te aviento otro dato curioso?`, {
        tema: 'dato',
        pregunta: 'ofrecer_dato',
      });
    }
    if (ultimaPregunta === 'ofrecer_tips') {
      const tip = elegirSinRepetir(BANCO_TIPS_AHORRO, contextoActual).texto;
      return responder(tip, {
        tema: 'tips',
        pregunta: null,
        widgetTipo: 'tips',
      });
    }
    if (ultimaPregunta === 'ofrecer_autonomia') {
      const dias = (datos.litersAvailable / 400).toFixed(1);
      return responder(
        `Calculando con un consumo promedio de casa (~400 litros al día), tus ${datos.litersAvailable.toLocaleString()} L actuales te dan como para unos ${dias} días de autonomía sin recargar. ¿Quieres checar también el estado de la bomba?`,
        {
          tema: 'autonomia',
          pregunta: 'ofrecer_bomba',
          widgetTipo: 'cisterna',
        }
      );
    }
    if (ultimaPregunta === 'ofrecer_bomba') {
      return responder(
        `Tu bomba ahorita está ${datos.isPumpActive ? 'encendida trabajando' : 'apagada en reposo'} con una presión de ${datos.pressureBar} bar. Todo en orden por ahí.`,
        {
          tema: 'bomba',
          pregunta: null,
          widgetTipo: 'bomba',
        }
      );
    }
  }

  if (esPreguntaSeguimiento && ultimoTema) {
    if (ultimoTema === 'autonomia') {
      return responder(
        'Fíjate que tomo como referencia unos 400 litros diarios para una casa promedio (entre regaderas, WC, trastes y lavado). Si en tu casa son menos personas o cuidan mucho el chorro, te puede rendir todavía más días.',
        { tema: 'autonomia', pregunta: null }
      );
    }
    if (ultimoTema === 'dato' || ultimoTema === 'chiste') {
      return responder(
        '¡Está buenísimo el tema, verdad! Si quieres te suelto otro dato curioso o cambiamos a otro rollo, tú dime.',
        { tema: ultimoTema, pregunta: ultimoTema === 'dato' ? 'ofrecer_dato' : 'ofrecer_chiste' }
      );
    }
    if (ultimoTema === 'fugas') {
      return responder(
        'El sistema revisa si hay flujo constante cuando no debería haber consumo (por ejemplo en la madrugada) o caídas raras de presión. Así cachamos goteos antes de que se vuelvan un problema.',
        { tema: 'fugas', pregunta: null, widgetTipo: 'fugas' }
      );
    }
  }

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // 2. GUÍAS FUNCIONALES PASO A PASO DE HYDROINTELLIGENT (ALTA PRIORIDAD)
  // --------------------------------------------------------------------------
  const guiaApp = resolverGuiaApp(lower, contextoActual, datos);
  if (guiaApp) {
    return responder(guiaApp.text, {
      tema: guiaApp.tema,
      pregunta: guiaApp.tema === 'guia_bomba' ? 'ofrecer_bomba' : null,
      widgetTipo: null,
    });
  }

  // --------------------------------------------------------------------------
  // 3. DESPEDIDAS Y AGRADECIMIENTOS
  // --------------------------------------------------------------------------
  if (
    contieneAlguna(lower, [
      'adios',
      'hasta luego',
      'nos vemos',
      'bye',
      'me voy',
      'chao',
      'muchas gracias',
      'mil gracias',
      'gracias',
      'te pasaste',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_DESPEDIDAS_GRACIAS, contextoActual).texto;
    return responder(resp, { tema: 'despedida', pregunta: null });
  }

  // --------------------------------------------------------------------------
  // 3. HUMOR, CHISTES Y REACCIONES DE RISA
  // --------------------------------------------------------------------------
  if (
    contieneAlguna(lower, [
      'chiste',
      'hazme reir',
      'cuentame algo gracioso',
      'algo chistoso',
      'otro chiste',
    ])
  ) {
    const chiste = elegirSinRepetir(BANCO_CHISTES_20, contextoActual).texto;
    return responder(`${chiste} ¿Te cuento otro?`, {
      tema: 'chiste',
      pregunta: 'ofrecer_chiste',
    });
  }

  if (
    contieneAlguna(lower, ['jajaja', 'jeje', 'jijiji', 'xd', 'lol', 'buena esa', 'que risa', 'me rei'])
  ) {
    const resp = elegirSinRepetir(BANCO_REACCION_RISA, contextoActual).texto;
    return responder(resp, { tema: 'chiste', pregunta: 'ofrecer_chiste' });
  }

  // --------------------------------------------------------------------------
  // 4. DATOS CURIOSOS
  // --------------------------------------------------------------------------
  if (
    contieneAlguna(lower, [
      'dato curioso',
      'sabias que',
      'cuentame algo interesante',
      'sorprendeme',
      'curiosidad',
      'dato interesante',
      'otro dato',
    ])
  ) {
    const dato = elegirSinRepetir(BANCO_DATOS_CURIOSOS_15, contextoActual).texto;
    return responder(`${dato} ¿Quieres otro dato curioso?`, {
      tema: 'dato',
      pregunta: 'ofrecer_dato',
    });
  }

  // --------------------------------------------------------------------------
  // 5. IDENTIDAD, CUMPLIDOS Y BROMAS AL BOT
  // --------------------------------------------------------------------------
  if (
    contieneAlguna(lower, [
      'quien eres',
      'que eres',
      'eres humano',
      'eres un robot',
      'eres una ia',
      'eres ia',
      'como te llamas',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_IDENTIDAD, contextoActual).texto;
    return responder(resp, { tema: 'identidad', pregunta: null });
  }

  if (
    contieneAlguna(lower, [
      'eres genial',
      'te quiero',
      'eres el mejor',
      'que crack',
      'me caes bien',
      'buen bot',
      'te amo',
      'eres chido',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_CUMPLIDOS, contextoActual).texto;
    return responder(resp, { tema: 'cumplido', pregunta: null });
  }

  if (
    contieneAlguna(lower, [
      'eres tonto',
      'no sabes nada',
      'no sirves',
      'que tonto',
      'estas mal',
      'eres inutil',
      'menso',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_BROMAS_BOT, contextoActual).texto;
    return responder(resp, { tema: 'broma_bot', pregunta: null });
  }

  // --------------------------------------------------------------------------
  // 6. ESTADO DE ÁNIMO BAJO / ESTRÉS / CANSANCIO
  // --------------------------------------------------------------------------
  if (
    contieneAlguna(lower, [
      'mal dia',
      'estoy mal',
      'me siento mal',
      'triste',
      'cansado',
      'cansada',
      'estresado',
      'estresada',
      'agobiado',
      'agobiada',
      'bajoneado',
      'bajoneada',
      'enfermo',
      'enferma',
      'agotado',
      'deprimido',
      'sin energia',
      'estres',
    ]) ||
    /^(mal|pesimo|fatal|mas o menos)\b/.test(lower)
  ) {
    const resp = elegirSinRepetir(BANCO_ANIMO_BAJO, contextoActual).texto;
    return responder(resp, {
      tema: 'animo_bajo',
      pregunta: 'ofrecer_distraccion_animo',
      animo: 'bajo',
    });
  }

  // --------------------------------------------------------------------------
  // 7. ÁNIMO POSITIVO / LOGROS
  // --------------------------------------------------------------------------
  if (
    contieneAlguna(lower, [
      'estoy bien',
      'todo bien',
      'todo al cien',
      'al cien',
      'genial',
      'feliz',
      'excelente',
      'chido',
      'de lujo',
      'increible',
      'contento',
      'contenta',
      'super bien',
    ]) ||
    /^(bien|muy bien|todo bien|perfecto)\b/.test(lower)
  ) {
    const resp = elegirSinRepetir(BANCO_ANIMO_POSITIVO, contextoActual).texto;
    return responder(resp, {
      tema: 'animo_positivo',
      pregunta: null,
      animo: 'positivo',
    });
  }

  // --------------------------------------------------------------------------
  // 8. SOPORTE HÍDRICO Y TELEMETRÍA ACTIVA
  //    (Evaluamos consejos de ahorro y autonomía antes que reporte de consumo)
  // --------------------------------------------------------------------------

  // 8a. Consejos de ahorro de agua (Eco-Tips)
  if (
    contieneAlguna(lower, [
      'ahorrar',
      'ahorro',
      'consejo',
      'consejos',
      'tips',
      'tip',
      'cuidar el agua',
      'regadera',
      'wc',
      'horario de bomba',
      'ecotip',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_TIPS_AHORRO, contextoActual).texto;
    return responder(resp, {
      tema: 'tips',
      pregunta: null,
      widgetTipo: 'tips',
    });
  }

  // 8b. Cálculo de autonomía real
  if (
    contieneAlguna(lower, [
      'autonomia',
      'cuantos dias',
      'cuanto dura',
      'para cuanto tiempo',
      'me alcanza',
      'dias de agua',
      'cuanto me queda',
    ])
  ) {
    const diasPromedio = (datos.litersAvailable / 400).toFixed(1);
    const diasAhorro = (datos.litersAvailable / 250).toFixed(1);
    const bancoAutonomia = [
      `Échale cuentas: ahorita tienes ${datos.litersAvailable.toLocaleString()} litros en ${datos.houseName}. Con un gasto normal de ~400 L diarios te rinde unos ${diasPromedio} días, y si cuidan el chorro hasta ${diasAhorro} días.`,
      `Con los ${datos.litersAvailable.toLocaleString()} litros actuales (${datos.waterLevel}%), tienes agua para aproximadamente ${diasPromedio} días de uso cotidiano. ¿Quieres que veamos unos tips para estirarla más?`,
      `Fíjate que tu reserva de ${datos.litersAvailable.toLocaleString()} L alcanza para unos ${diasPromedio} días en ritmo normal. Si hoy hay visitas o lavado fuerte, calcula un poquito menos.`,
      `Al tiro con el dato: ${datos.waterLevel}% de tu cisterna son ${datos.litersAvailable.toLocaleString()} litros. En una casa promedio eso equivale a ${diasPromedio} días de tranquilidad.`,
      `Tienes buena reserva: ${datos.litersAvailable.toLocaleString()} litros disponibles. Te dan como ${diasPromedio} días sin recargar, o hasta ${diasAhorro} días en modo ahorro.`,
      `Si seguimos el consumo estándar de ~400 L/día, tus ${datos.litersAvailable.toLocaleString()} L actuales duran alrededor de ${diasPromedio} días.`,
      `Por ahora estás cubierto unos ${diasPromedio} días con tus ${datos.litersAvailable.toLocaleString()} litros. ¿Te muestro cómo anda la bomba también?`,
      `A ojo de buen cubero (literalmente 😄), esos ${datos.litersAvailable.toLocaleString()} litros te dan para ${diasPromedio} días sin broncas.`,
      `Calculando sobre ${datos.capacityLiters.toLocaleString()} L de capacidad, ahorita traes ${datos.litersAvailable.toLocaleString()} L, o sea unos ${diasPromedio} días de autonomía real.`,
      `Tu colchón actual es de ${datos.litersAvailable.toLocaleString()} litros (${diasPromedio} días aprox.). Nada mal para estar tranquilos.`,
    ];
    const resp = elegirSinRepetir(bancoAutonomia, contextoActual).texto;
    return responder(resp, {
      tema: 'autonomia',
      pregunta: 'ofrecer_tips',
      widgetTipo: 'cisterna',
    });
  }

  // 8c. Fugas, incidencias, pipa, ESP32, Excel
  if (
    contieneAlguna(lower, [
      'fuga',
      'fugas',
      'goteo',
      'humedad',
      'se tira el agua',
      'incidencia',
    ])
  ) {
    const estadoFuga = datos.leakDetected
      ? `¡Aguas! El sistema detectó una posible anomalía o flujo inusual en ${datos.houseName}. Échale un ojo de volada al diagnóstico.`
      : `Todo tranquilo por acá: los sensores de ${datos.houseName} marcan cero fugas activas y presión estable en ${datos.pressureBar} bar.`;

    const bancoFugas = [
      `${estadoFuga} ¿Notaste algún goteo físico o solo estabas checando por precaución?`,
      `Revisando tu línea: ${datos.leakDetected ? 'hay alerta activa de posible fuga, conviene revisar llaves y WC.' : 'sin fugas detectadas ahorita. Tu válvula y presión se ven sanas.'}`,
      `Fíjate que ${datos.leakDetected ? 'sí tenemos foco amarillo en flujo continuo; checa el widget aquí abajo.' : 'no hay señales de fuga en tus tuberías. Todo hermético al cien.'}`,
      `${estadoFuga} Aquí te dejo el panel de diagnóstico para que lo veas al momento.`,
      `Chequé tus lecturas de flujo y ${datos.leakDetected ? 'parece haber un goteo constante, vale la pena revisar.' : 'todo marca en verde, cero desperdicio invisible.'}`,
      `Por si las dudas, ya corrí el chequeo de fugas: ${datos.leakDetected ? 'se detectó movimiento anómalo de agua.' : 'todo en orden, ni una gota fuera de lugar.'}`,
      `Órale, qué bueno que revisas. ${datos.leakDetected ? 'El sensor reporta posible fuga activa.' : 'Tu instalación está sin fugas y con presión normal.'}`,
      `Aquí está tu diagnóstico en vivo: ${datos.leakDetected ? 'atención recomendada en tubería/WC.' : 'sistema limpio y sin pérdidas.'}`,
      `En ${datos.houseName} ${datos.leakDetected ? 'hay una alerta de fuga pendiente de revisar.' : 'no hay fugas registradas en este momento.'}`,
      `Listo el escaneo: ${datos.leakDetected ? 'detectamos flujo sospechoso, échale un ojo.' : 'cero fugas, puedes estar tranquilo.'}`,
    ];
    const resp = elegirSinRepetir(bancoFugas, contextoActual).texto;
    return responder(resp, {
      tema: 'fugas',
      pregunta: null,
      widgetTipo: 'fugas',
    });
  }

  if (contieneAlguna(lower, ['pipa', 'camion', 'pedir agua', 'rellenar cisterna'])) {
    const faltante = Math.max(0, datos.capacityLiters - datos.litersAvailable);
    const bancoPipa = [
      `Si vas a pedir pipa para ${datos.houseName}, ahorita te faltan unos ${faltante.toLocaleString()} litros para llenar al 100% (tienes ${datos.waterLevel}%).`,
      `Para que no pidas de más ni de menos: tu cisterna tiene espacio libre para ${faltante.toLocaleString()} litros ahorita mismo.`,
      `Échale un ojo: si pides pipa hoy, con unos ${faltante.toLocaleString()} litros la dejas copeteada al 100%.`,
      `Fíjate que todavía traes ${datos.litersAvailable.toLocaleString()} L (${datos.waterLevel}%), así que te caben ${faltante.toLocaleString()} L en caso de querer recargar con pipa.`,
      `Tip rápido si llega pipa: apaga tantito la bomba mientras llenan para que no jale aire ni sedimentos movidos. Te caben ${faltante.toLocaleString()} L.`,
      `Ahorita tienes ${datos.waterLevel}% de nivel. Si necesitas pipa, calcula pedir alrededor de ${faltante.toLocaleString()} litros.`,
      `En la sección de Contactar Servicios puedes ver opciones si ocupas pipa; de espacio libre tienes ${faltante.toLocaleString()} L.`,
      `Va que va, para llenar por completo ${datos.houseName} harían falta ${faltante.toLocaleString()} litros.`,
      `Anota el dato para el piper@: capacidad libre actual de ${faltante.toLocaleString()} litros.`,
      `Todo listo: con ${faltante.toLocaleString()} L quedas al 100%. ¿Checamos los días de autonomía antes de pedir?`,
    ];
    const resp = elegirSinRepetir(bancoPipa, contextoActual).texto;
    return responder(resp, {
      tema: 'pipa',
      pregunta: 'ofrecer_autonomia',
      widgetTipo: 'cisterna',
    });
  }

  if (contieneAlguna(lower, ['esp32', 'sensor', 'wifi', 'dispositivo', 'conexion', 'hardware'])) {
    const bancoEsp = [
      `Tu módulo ${datos.deviceCode} en ${datos.houseName} está reportando en línea sin broncas, mandando nivel (${datos.waterLevel}%) y presión (${datos.pressureBar} bar).`,
      `El ESP32 (${datos.deviceCode}) anda trabajando al tiro, midiendo cada cambio en tu cisterna en tiempo real.`,
      `Fíjate que tu sensor ${datos.deviceCode} está conectado y estable. Si algún día ves que no actualiza, suele ser cosa de reiniciar el módem o revisar la alimentación de 5V.`,
      `Todo en orden con ${datos.deviceCode}: buena señal y lecturas frescas de tu instalación.`,
      `Tu placa ${datos.deviceCode} está al cien, vigilando que no haya ni fugas ni bajones raros.`,
      `Sin fallas en el hardware: ${datos.deviceCode} sigue enviando telemetría continua.`,
      `El cerebro físico en tu casa (${datos.deviceCode}) está despierto y reportando ${datos.waterLevel}% de agua.`,
      `Conexión estable con ${datos.deviceCode}. ¿Notaste algún parpadeo raro en el dispositivo o todo bien?`,
      `Tu nodo IoT ${datos.deviceCode} anda fino, midiendo litros y presión sin despeinarse.`,
      `Enlace activo con ${datos.deviceCode} en ${datos.houseName}. Cualquier anomalía te la aviso de volada.`,
    ];
    const resp = elegirSinRepetir(bancoEsp, contextoActual).texto;
    return responder(resp, { tema: 'esp32', pregunta: null });
  }

  if (contieneAlguna(lower, ['excel', 'exportar', 'descargar', 'xlsx', 'hoja de calculo'])) {
    const bancoExcel = [
      '¡Claro! Para bajar tu historial en Excel (.xlsx), ve a la pestaña "Perfil" (abajo a la derecha), entra a la sección "General" y toca "Descargar Bitácora (.xlsx)".',
      'Fíjate que puedes descargar todo tu registro de lecturas y telemetría en Excel directo desde "Perfil → General → Descargar Bitácora (.xlsx)". ¡Queda súper ordenado!',
      'Si ocupas el archivo de Excel para llevar cuentas o compartirlo, toca "Perfil" en la barra inferior y pícale a "Descargar Bitácora (.xlsx)". Aquí abajo te dejo tu pulso actual de consumo.',
      '¡Va que va! El botón para exportar tu bitácora a .xlsx está directo en "Perfil → General → Descargar Bitácora (.xlsx)".',
      'Échale un ojo a la pestaña "Perfil"; justo en el bloque "General" tienes "Descargar Bitácora (.xlsx)" para bajar tu Excel en un clic.',
      '¿Necesitas respaldar tus datos en Excel? Desde "Perfil → General → Descargar Bitácora (.xlsx)" lo descargas de volada sin complicarte.',
      'Aquí tienes un resumen de flujo actual, y si quieres el Excel completo, lo descargas en "Perfil → Descargar Bitácora (.xlsx)".',
      'Súper práctico bajar el Excel para ver picos de gasto por semana. Lo tienes listo en "Perfil → General → Descargar Bitácora (.xlsx)".',
      'Con gusto te guío: barra inferior "Perfil" -> sección "General" -> "Descargar Bitácora (.xlsx)", ¡y listo!',
      'Tu historial completo se puede exportar a .xlsx cuando quieras desde "Perfil → General → Descargar Bitácora (.xlsx)".',
    ];
    const resp = elegirSinRepetir(bancoExcel, contextoActual).texto;
    return responder(resp, {
      tema: 'excel',
      pregunta: null,
      widgetTipo: 'consumo',
    });
  }

  // 8d. Cisterna / Nivel
  if (
    contieneAlguna(lower, [
      'cisterna',
      'tinaco',
      'nivel',
      'cuanta agua',
      'litros',
      'reserva',
      'porcentaje',
      'capacidad',
    ])
  ) {
    const tonoNivel =
      datos.waterLevel >= 70
        ? 'vas súper bien de reserva'
        : datos.waterLevel >= 35
        ? 'traes nivel medio, aguanta pero sin confiarse'
        : 'anda bajita la cosa, conviene cuidar el gasto o ir viendo recarga';

    const bancoCisterna = [
      `Ahorita ${datos.houseName} está al ${datos.waterLevel}% (${datos.litersAvailable.toLocaleString()} de ${datos.capacityLiters.toLocaleString()} L), así que ${tonoNivel}. ¿Quieres que calculemos cuántos días te dura?`,
      `Échale un ojo: tienes ${datos.litersAvailable.toLocaleString()} litros disponibles (${datos.waterLevel}%). En pocas palabras, ${tonoNivel}.`,
      `Tu cisterna marca ${datos.waterLevel}% en este momento, equivalente a ${datos.litersAvailable.toLocaleString()} litros listos para usar.`,
      `Fíjate que el sensor reporta ${datos.waterLevel}% de agua en ${datos.houseName}. ${datos.waterLevel >= 50 ? 'Hay buen colchón.' : 'Ojo con el nivel para no quedarnos cortos.'}`,
      `Reporte fresco de tu reserva: ${datos.litersAvailable.toLocaleString()} L disponibles de ${datos.capacityLiters.toLocaleString()} L totales (${datos.waterLevel}%).`,
      `Aquí tienes la lectura en vivo: ${datos.waterLevel}% de capacidad llena. ¿Te echo unos tips de ahorro o checamos la bomba?`,
      `Tu nivel actual anda en ${datos.waterLevel}% (${datos.litersAvailable.toLocaleString()} litros). ${tonoNivel}.`,
      `Así amanece o sigue tu tinaco/cisterna: ${datos.waterLevel}% lleno. Te dejo aquí la gráfica animada.`,
      `Por si tenías el pendiente, en ${datos.houseName} hay ${datos.litersAvailable.toLocaleString()} litros ahorita mismo.`,
      `Al tiro con tu reserva: ${datos.waterLevel}% registrado por ${datos.deviceCode}.`,
    ];
    const resp = elegirSinRepetir(bancoCisterna, contextoActual).texto;
    return responder(resp, {
      tema: 'cisterna',
      pregunta: 'ofrecer_autonomia',
      widgetTipo: 'cisterna',
    });
  }

  // 8e. Bomba y Presión
  if (
    contieneAlguna(lower, [
      'bomba',
      'presion',
      'bar',
      'motor',
      'hidroneumatico',
      'no sube el agua',
    ])
  ) {
    const estadoBomba = datos.isPumpActive ? 'encendida trabajando' : 'apagada en reposo';
    const bancoBomba = [
      `Tu bomba está ${estadoBomba} y la presión de la red marca ${datos.pressureBar} bar. Todo operando estable en ${datos.houseName}.`,
      `Échale un ojo: presión actual en ${datos.pressureBar} bar con la bomba ${estadoBomba}. ¿Notas buena fuerza en las llaves?`,
      `Fíjate que el sistema hidráulico trae ${datos.pressureBar} bar ahorita mismo; la bomba se mantiene ${estadoBomba}.`,
      `Reporte del motor: bomba ${estadoBomba} y línea presurizada a ${datos.pressureBar} bar sin variaciones raras.`,
      `Ahorita la bomba está ${estadoBomba}. Con ${datos.pressureBar} bar tienes presión cómoda para regadera y llaves.`,
      `Aquí tienes el estado en vivo de tu bomba: ${estadoBomba} a ${datos.pressureBar} bar.`,
      `Todo en orden con la presión (${datos.pressureBar} bar). Tu bomba sigue ${estadoBomba} como relojito.`,
      `Checando el panel: bomba ${estadoBomba}, lectura de ${datos.pressureBar} bar estables.`,
      `Si escuchabas silencio, es porque la bomba está ${estadoBomba}, con ${datos.pressureBar} bar en tubería.`,
      `Al cien la parte mecánica: ${datos.pressureBar} bar y bomba ${estadoBomba}.`,
    ];
    const resp = elegirSinRepetir(bancoBomba, contextoActual).texto;
    return responder(resp, {
      tema: 'bomba',
      pregunta: null,
      widgetTipo: 'bomba',
    });
  }

  // 8f. Consumo y Flujo
  if (
    contieneAlguna(lower, [
      'consumo',
      'gasto',
      'flujo',
      'reporte',
      'historial',
      'lpm',
      'cuanto he gastado',
    ])
  ) {
    const flujoTexto =
      datos.flowRateLpm > 0
        ? `ahorita corre un flujo de ${datos.flowRateLpm} L/min`
        : 'ahorita el flujo está en 0 L/min (sin consumo activo en este segundo)';

    const bancoConsumo = [
      `En ${datos.houseName} ${flujoTexto} y la válvula principal está ${datos.isValveOpen ? 'abierta' : 'cerrada'}. Te dejo aquí el resumen para que veas el movimiento.`,
      `Checando tu gasto en tiempo real: ${flujoTexto}. Si quieres ver gráficas por día o semana, puedes abrir tu historial completo.`,
      `Fíjate que ${flujoTexto}. Todo tranquilo y dentro de lo normal en tu instalación.`,
      `Aquí está tu pulso de consumo: ${flujoTexto}, con válvula ${datos.isValveOpen ? 'abierta' : 'cerrada'}.`,
      `Reporte rápido de flujo: ${flujoTexto}. ¿Quieres que revisemos también unos consejos para bajar el gasto del mes?`,
      `En este instante ${flujoTexto}. Abajo tienes la tarjeta interactiva por si quieres saltar al historial.`,
      `Tu medidor marca ${datos.flowRateLpm} L/min ahora mismo. Nada fuera de lo esperado.`,
      `Así se mueve el agua en ${datos.houseName}: ${flujoTexto}.`,
      `Al tiro con el consumo: ${flujoTexto}. Puedes consultar el detalle histórico directo desde el botón del widget.`,
      `Lectura actual en tubería: ${datos.flowRateLpm} L/min. Todo bajo control.`,
    ];
    const resp = elegirSinRepetir(bancoConsumo, contextoActual).texto;
    return responder(resp, {
      tema: 'consumo',
      pregunta: 'ofrecer_tips',
      widgetTipo: 'consumo',
    });
  }

  // --------------------------------------------------------------------------
  // 9. CHARLA COTIDIANA (COMIDA, CLIMA, CHAMBA/ESTUDIO, OCIO, ABURRIMIENTO)
  // --------------------------------------------------------------------------
  if (
    contieneAlguna(lower, [
      'hambre',
      'comida',
      'comer',
      'tacos',
      'cafe',
      'chilaquiles',
      'desayuno',
      'desayunar',
      'cenar',
      'cena',
      'almorzar',
      'antojo',
      'sed',
      'tengo sed',
      'pizza',
      'hamburguesa',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_COMIDA, contextoActual).texto;
    return responder(resp, { tema: 'comida', pregunta: null });
  }

  if (
    contieneAlguna(lower, [
      'calor',
      'frio',
      'lluvia',
      'lloviendo',
      'llueve',
      'bochorno',
      'tormenta',
      'clima',
      'soleado',
      'nublado',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_CLIMA, contextoActual).texto;
    return responder(resp, { tema: 'clima', pregunta: null });
  }

  if (
    contieneAlguna(lower, [
      'trabajo',
      'chamba',
      'chambeando',
      'escuela',
      'tarea',
      'examen',
      'proyecto',
      'oficina',
      'junta',
      'estudiando',
      'estudiar',
      'universidad',
      'clases',
      'ocupado',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_TRABAJO_ESTUDIO, contextoActual).texto;
    return responder(resp, { tema: 'trabajo_estudio', pregunta: null });
  }

  if (
    contieneAlguna(lower, [
      'sueno',
      'dormir',
      'fin de semana',
      'viernes',
      'sabado',
      'domingo',
      'futbol',
      'gym',
      'ejercicio',
      'correr',
      'musica',
      'cancion',
      'rolas',
      'pelicula',
      'serie',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_COTIDIANO_OCIO, contextoActual).texto;
    return responder(resp, { tema: 'ocio', pregunta: null });
  }

  if (
    contieneAlguna(lower, [
      'aburrido',
      'aburrida',
      'aburrimiento',
      'no se que hacer',
      'sin nada que hacer',
      'que hago',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_ABURRIMIENTO, contextoActual).texto;
    return responder(resp, {
      tema: 'aburrimiento',
      pregunta: 'ofrecer_dato',
    });
  }

  // --------------------------------------------------------------------------
  // 10. SALUDOS Y PREGUNTAS PERSONALES
  // --------------------------------------------------------------------------
  if (
    contieneAlguna(lower, [
      'hola',
      'que onda',
      'buenos dias',
      'buenas tardes',
      'buenas noches',
      'como estas',
      'como andas',
      'que haces',
      'que tal',
      'quiubole',
      'hey',
      'buenas',
      'holi',
    ])
  ) {
    const resp = elegirSinRepetir(BANCO_SALUDOS, contextoActual).texto;
    return responder(resp, { tema: 'saludo', pregunta: null });
  }

  // --------------------------------------------------------------------------
  // 11. FALLBACK HUMANO INTELIGENTE (SIN SOLTAR TELEMETRÍA SIN MOTIVO)
  // --------------------------------------------------------------------------
  const fallback = elegirSinRepetir(BANCO_FALLBACK_HUMANO, contextoActual).texto;
  return responder(fallback, { tema: 'charla_libre', pregunta: null });
};

export default procesarConversacionNatural;
