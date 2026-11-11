import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, SkipForward, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SplashScreen = ({ onFinish }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const onFinishRef = useRef(onFinish);
  const userRef = useRef(user);

  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    onFinishRef.current = onFinish;
    userRef.current = user;
  }, [onFinish, user]);

  // Transición suave hacia la pantalla principal o login
  const handleComplete = useCallback(() => {
    if (isFinishing) return;
    setIsFinishing(true);
    setTimeout(() => {
      onFinishRef.current?.(userRef.current ? 0 : 'login');
    }, 450);
  }, [isFinishing]);

  // Intentar reproducción automática (requiere muted=true inicialmente en navegadores)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
      video
        .play()
        .then(() => setVideoLoaded(true))
        .catch(() => {
          // Si el navegador bloquea la reproducción automática, asegura muted
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
    }

    // Temporizador de seguridad: Si el video tarda más de 9.5s o se bloquea, avanza
    const safetyTimer = setTimeout(() => {
      handleComplete();
    }, 9500);

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [isMuted, handleComplete]);

  // Actualizar la barra de progreso del video
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  // Alternar sonido del video
  const toggleSound = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 min-h-dvh w-full bg-[#02060D] text-white flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Resplandor bioluminiscente sutil en los bordes de la pantalla */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-cyan-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-sky-500/15 blur-[140px] pointer-events-none" />

      {/* Barra superior con controles: Silencio y Saltar Intro */}
      <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between">
        {/* Indicador de presentación */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 backdrop-blur-md shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">HYDRO HOME</span>
          <span className="text-slate-400">•</span>
          <span>INTRODUCCIÓN</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Botón de Sonido */}
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 backdrop-blur-md flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Botón Saltar Intro */}
          <button
            type="button"
            onClick={handleComplete}
            title="Saltar intro"
            className="px-4 py-2 rounded-full bg-slate-900/85 hover:bg-slate-800/95 text-slate-200 hover:text-white text-xs font-bold border border-cyan-500/35 backdrop-blur-md flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer tracking-wide"
          >
            <span>Saltar</span>
            <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Contenedor central del video con relación de aspecto cinematográfica */}
      <div className="relative z-10 w-full h-full max-w-5xl flex items-center justify-center p-2 sm:p-6">
        <video
          ref={videoRef}
          src="/assets/videos/intro.mp4"
          autoPlay
          muted={isMuted}
          playsInline
          onEnded={handleComplete}
          onError={handleComplete}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full max-h-[92dvh] object-contain drop-shadow-[0_0_35px_rgba(6,182,212,0.35)] rounded-2xl"
        />
      </div>

      {/* Barra de progreso de la intro en la parte inferior */}
      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-900/90 z-30">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.9)] transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
