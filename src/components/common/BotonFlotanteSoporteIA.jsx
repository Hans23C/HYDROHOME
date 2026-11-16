import React, { useEffect, useRef, useState } from 'react';
import {
  useRive,
  Layout,
  Fit,
  Alignment,
  StateMachineInputType,
} from '@rive-app/react-canvas';

const FRASES_AYUDA_APP_MX = [
  '¿No sabes cómo vincular tu sensor ESP32? ¡Tócame y te explico! 📡',
  '¿Dudas con el módulo de Incidencias o fugas? Aquí te guío 🛠️',
  '¿Ocupas ayuda para pedir una pipa desde la app? Pícale aquí 🚚',
  '¿No le entiendes a las gráficas o presión en bar? ¡Pregúntame!',
  '¿Quieres saber cómo cambiar entre Casa Principal y Campo? Dime 🏠',
  '¿Buscas dónde descargar tu bitácora en Excel? ¡Yo te digo cómo! 📊',
  '¿No sabes cómo encender o automatizar la bomba? Échame un grito ⚡',
  "¿Tienes dudas de cómo funciona Hydro Home? ¡Aquí ando pa' ayudarte!",
  '¿Algo de la app no te queda claro? Tócame y lo resolvemos de volada',
  '¿Quieres aprender a registrar una avería en tuberías? ¡Pícale! 🔧',
  '¿No sabes cómo interpretar el porcentaje de tu cisterna? ¡Pregúntame! 💧',
  '¿Te atoraste en algún apartado de la app? ¡Déjame echarte la mano!',
  '¿Quieres activar alertas de nivel bajo o fugas? Te enseño cómo 🚨',
  '¿Dudas sobre cómo funciona el monitoreo en tiempo real? ¡Tócame!',
  '¿Necesitas ayuda para configurar tu sistema hídrico? Aquí estoy 🤖',
  '¿No encuentras alguna función en el menú? Pregúntame sin pena',
  '¿Quieres saber qué significa cada indicador de flujo? ¡Te explico!',
  '¿Primera vez usando HydroHome? Tócame y te doy el tour 👋',
];

let ultimaFraseAppMostrada = '';

const obtenerFraseAppAleatoria = (anterior) => {
  const referencia = anterior || ultimaFraseAppMostrada;
  let nueva = '';
  do {
    nueva =
      FRASES_AYUDA_APP_MX[
        Math.floor(Math.random() * FRASES_AYUDA_APP_MX.length)
      ];
  } while (nueva === referencia && FRASES_AYUDA_APP_MX.length > 1);
  ultimaFraseAppMostrada = nueva;
  return nueva;
};

const MULTICOLOR_GLOW_GRADIENT =
  'conic-gradient(from 0deg, #06b6d4 0deg, #2563eb 90deg, #a855f7 180deg, #10b981 270deg, #06b6d4 360deg)';

export const BotonFlotanteSoporteIA = ({
  onClick,
  activeTab,
  subView,
  botStage,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [riveInputs, setRiveInputs] = useState([]);
  const [fraseActual, setFraseActual] = useState(() =>
    obtenerFraseAppAleatoria()
  );

  const clickTimeoutRef = useRef(null);
  const isFirstMountRef = useRef(true);

  const { rive, RiveComponent } = useRive({
    src: '/assets/Animaciones/bot_2.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Cover,
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
    },
  });

  // Inicialización reactiva de la State Machine cuando la instancia rive está lista
  useEffect(() => {
    if (!rive) return;
    const smNames = rive.stateMachineNames || [];
    if (smNames.length > 0) {
      const mainSM = smNames[0];
      rive.play(mainSM);
      const inputs = rive.stateMachineInputs(mainSM) || [];
      setRiveInputs(inputs);
      inputs.forEach((input) => {
        if (input.type === StateMachineInputType.Boolean) {
          input.value = false;
        }
      });
    } else if (rive.animationNames?.length > 0) {
      rive.play(rive.animationNames[0]);
    }
  }, [rive]);

  // Ciclo de vida temporal (10,000ms) al abrir la app y al cambiar de pestaña o apartado
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      setShowBubble(true);
    } else if (activeTab === 0 && botStage === 'home' && !subView) {
      setFraseActual((anterior) => obtenerFraseAppAleatoria(anterior));
      setShowBubble(true);
    } else {
      setShowBubble(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [activeTab, subView, botStage]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (isFadingOut) return;

    // Dispara reacción visual rápida antes de desmontar
    riveInputs.forEach((input) => {
      if (input.type === StateMachineInputType.Trigger) {
        input.fire();
      } else if (input.type === StateMachineInputType.Boolean) {
        input.value = true;
      }
    });

    setIsFadingOut(true);
    clickTimeoutRef.current = setTimeout(() => {
      if (onClick) onClick();
    }, 300);
  };

  return (
    <div
      className={`fixed bottom-24 right-4 z-40 flex flex-col items-end transition-all duration-300 ${
        isFadingOut
          ? 'opacity-0 scale-90 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Globo de Diálogo Tipo Cómic con contorno multicolor animado (.animate-hydro-glow) */}
      <div
        onClick={handleClick}
        role="button"
        tabIndex={showBubble ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
        aria-hidden={!showBubble}
        aria-label={`Abrir HydroBot IA: ${fraseActual}`}
        className={`relative mb-3 mr-1 transition-all duration-300 origin-bottom-right ${
          showBubble
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto cursor-pointer'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="relative rounded-2xl rounded-br-sm hover:scale-[1.03] active:scale-95 transition-transform">
          {/* Resplandor neón difuminado detrás del borde */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1 rounded-[20px] rounded-br-sm overflow-hidden opacity-65 blur-md"
          >
            <div
              className="absolute inset-[-100%] animate-hydro-glow"
              style={{ background: MULTICOLOR_GLOW_GRADIENT }}
            />
          </div>

          {/* Contenedor con borde giratorio multicolor de 2px */}
          <div className="relative rounded-2xl rounded-br-sm p-[2px] overflow-hidden shadow-lg shadow-slate-900/10 dark:shadow-cyan-500/20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-100%] animate-hydro-glow"
              style={{ background: MULTICOLOR_GLOW_GRADIENT }}
            />

            {/* Interior adaptativo Modo Claro / Modo Oscuro de alto contraste */}
            <div className="relative rounded-[14px] rounded-br-[2px] bg-white/95 dark:bg-[#0f172a]/95 text-slate-800 dark:text-white px-4 py-2.5 max-w-[215px] text-xs sm:text-sm font-medium leading-snug backdrop-blur-md">
              {fraseActual}
            </div>
          </div>
        </div>

        {/* Pico triangular inferior derecho sincronizado con el tema y contorno luminoso */}
        <div className="flex justify-end pr-6 -mt-[1px] relative z-10">
          <div className="w-3.5 h-3.5 rotate-45 bg-white dark:bg-[#0f172a] border-r-2 border-b-2 border-cyan-400 shadow-[2px_2px_8px_rgba(6,182,212,0.35)] -mt-2" />
        </div>
      </div>

      {/* Botón Circular Flotante (FAB) con Animación Rive */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Abrir Soporte IA"
        title="Soporte IA"
        className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-[#1a0b2e] border-2 border-purple-500/40 shadow-[0_8px_30px_rgba(124,58,237,0.5)] hover:scale-105 active:scale-95 transition-transform cursor-pointer p-0"
      >
        <div className="w-full h-full scale-[2.85] transform-gpu flex items-center justify-center pointer-events-none">
          <RiveComponent className="w-full h-full pointer-events-none" />
        </div>
      </button>
    </div>
  );
};
