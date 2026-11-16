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
  '¿Primera vez usando HydroIntelligent? Tócame y te doy el tour 👋',
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
      {/* Globo de Diálogo Tipo Cómic con visibilidad temporal de 10 segundos */}
      <div
        onClick={handleClick}
        role="button"
        tabIndex={showBubble ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
        aria-hidden={!showBubble}
        aria-label={`Abrir HydroBot IA: ${fraseActual}`}
        className={`relative mb-2.5 mr-1 transition-all duration-300 origin-bottom-right ${
          showBubble
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto cursor-pointer'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 text-slate-800 border border-cyan-500/40 shadow-lg shadow-cyan-500/15 dark:bg-[#11192E]/95 dark:text-white dark:border-cyan-400/40 dark:shadow-cyan-500/20 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[215px] text-xs sm:text-sm font-medium leading-snug backdrop-blur-md hover:scale-[1.03] active:scale-95 transition-transform">
          {fraseActual}
        </div>

        {/* Pico triangular en la esquina inferior derecha apuntando hacia la bolita del bot */}
        <div className="flex justify-end pr-6 -mt-[1px]">
          <div className="w-3 h-3 rotate-45 bg-white/95 dark:bg-[#11192E]/95 border-r border-b border-cyan-500/40 dark:border-cyan-400/40 -mt-1.5" />
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
        <div className="w-full h-full scale-[2.25] transform-gpu flex items-center justify-center pointer-events-none">
          <RiveComponent className="w-full h-full pointer-events-none" />
        </div>
      </button>
    </div>
  );
};
