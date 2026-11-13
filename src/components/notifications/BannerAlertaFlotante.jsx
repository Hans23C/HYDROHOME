import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Zap,
  ShieldCheck,
  Wrench,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BannerAlertaFlotante = ({ onOpenNotifications }) => {
  const {
    notifications,
    showNotificationBanner,
    dismissNotificationBanner,
    markNotificationsAsSeen,
    isDark,
  } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(5);

  const alertList =
    notifications && notifications.length > 0
      ? notifications.filter((n) => n.unseen).length > 0
        ? notifications.filter((n) => n.unseen)
        : notifications.slice(0, 4)
      : [];

  const total = alertList.length;
  const currentNotif = alertList[currentIndex] || alertList[0];

  // Temporizador de 5 segundos
  useEffect(() => {
    if (!showNotificationBanner || total === 0) return;

    setSecondsLeft(5);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Si hay más notificaciones, avanzar a la siguiente tarjeta o cerrar
          if (currentIndex < total - 1) {
            setCurrentIndex((c) => c + 1);
            return 5;
          } else {
            clearInterval(interval);
            dismissNotificationBanner();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showNotificationBanner, total, currentIndex, dismissNotificationBanner]);

  if (!showNotificationBanner || total === 0 || !currentNotif) return null;

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSecondsLeft(5);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSecondsLeft(5);
    }
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -40 && currentIndex < total - 1) {
      handleNext();
    } else if (info.offset.x > 40 && currentIndex > 0) {
      handlePrev();
    }
  };

  const getIcon = (cat) => {
    switch (cat) {
      case 'nivel':
        return <Droplet className="w-5 h-5 text-sky-400" />;
      case 'bomba':
        return <Zap className="w-5 h-5 text-indigo-400" />;
      case 'fuga':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      default:
        return <Wrench className="w-5 h-5 text-amber-400" />;
    }
  };

  const progressPercent = (secondsLeft / 5) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg select-none"
      >
        <div
          className={`relative overflow-hidden rounded-3xl border-2 backdrop-blur-xl shadow-2xl transition-all ${
            isDark
              ? 'bg-[#0B1E32]/95 border-sky-400/40 text-white shadow-[0_20px_50px_rgba(2,132,199,0.3)]'
              : 'bg-white/95 border-sky-400/35 text-slate-900 shadow-[0_15px_45px_rgba(15,23,42,0.2)]'
          }`}
        >
          {/* Barra superior de la tarjeta con paginador deslizable */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-slate-200/50 dark:border-sky-400/15 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold text-sky-600 dark:text-sky-400">
                Notificación {currentIndex + 1} de {total}
              </span>
              {total > 1 && (
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  (Desliza horizontalmente)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sky-600 dark:text-sky-400 mr-1">{secondsLeft}s</span>
              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex === total - 1}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={dismissNotificationBanner}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer ml-1"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tarjeta Deslizable con Gestos Táctiles */}
          <motion.div
            key={currentNotif.id || currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center shrink-0 shadow-sm">
                {getIcon(currentNotif.category)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                    {currentNotif.title}
                  </h4>
                  {currentNotif.systemName && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Home className="w-3 h-3 text-sky-500" />
                      <span>{currentNotif.systemName}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                  {currentNotif.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  markNotificationsAsSeen();
                  dismissNotificationBanner();
                  onOpenNotifications?.();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition"
              >
                <span>Ver</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Paginación con Puntos si hay más de 1 tarjeta */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-1.5 pb-2">
              {alertList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setSecondsLeft(5);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-cyan-400'
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Barra de progreso de 5 segundos */}
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BannerAlertaFlotante;
