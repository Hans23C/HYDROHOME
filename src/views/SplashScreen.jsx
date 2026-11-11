import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const SplashScreen = ({ onFinish }) => {
  const { user } = useAuth();
  const onFinishRef = useRef(onFinish);
  const userRef = useRef(user);

  // Timestamp único para reiniciar la animación desde el fotograma 0 en cada apertura
  const [timestamp] = useState(() => Date.now());

  useEffect(() => {
    onFinishRef.current = onFinish;
    userRef.current = user;
  }, [onFinish, user]);

  // Transición suave hacia el inicio de sesión o panel
  const handleComplete = useCallback(() => {
    onFinishRef.current?.(userRef.current ? 0 : 'login');
  }, []);

  useEffect(() => {
    // La animación dura ~7.9 segundos (190 fotogramas a 24 fps)
    const timer = setTimeout(() => {
      handleComplete();
    }, 8000);

    return () => {
      clearTimeout(timer);
    };
  }, [handleComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      onClick={handleComplete}
      className="fixed inset-0 z-50 min-h-dvh w-full flex items-center justify-center overflow-hidden select-none cursor-pointer bg-[#050B14] p-4"
    >
      {/* Resplandor ambiental de fondo que unifica la atmósfera con la pantalla de inicio */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[140px] pointer-events-none" />

      {/* 
        Contenedor adaptativo:
        El logo y la animación flotan con fondo 100% transparente (canal alfa RGBA de 32 bits).
        No hay recuadros, bordes ni diferencias de color: la animación y la pantalla son una misma.
      */}
      <div className="relative z-10 w-full max-w-xl sm:max-w-2xl aspect-[16/9] max-h-[80vh] flex items-center justify-center">
        <picture className="w-full h-full flex items-center justify-center pointer-events-none select-none">
          <source srcSet={`/assets/images/intro.webp?t=${timestamp}`} type="image/webp" />
          <img
            src={`/assets/images/intro.gif?t=${timestamp}`}
            alt="Hydro Home Intro"
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0_35px_rgba(34,211,238,0.25)]"
          />
        </picture>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
