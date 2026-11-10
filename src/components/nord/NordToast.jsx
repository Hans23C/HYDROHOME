import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { NordVisuallyHidden } from './NordVisuallyHidden';

const VARIANT_CONFIGS = {
  info: {
    icon: Info,
    bg: 'bg-white dark:bg-[#0F2234] border-sky-300 dark:border-cyan-500/45 text-slate-900 dark:text-cyan-100',
    iconColor: 'text-sky-600 dark:text-cyan-400',
    barColor: 'bg-sky-500 dark:bg-cyan-400',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-white dark:bg-[#0F2234] border-emerald-300 dark:border-emerald-500/45 text-slate-900 dark:text-emerald-100',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    barColor: 'bg-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white dark:bg-[#0F2234] border-amber-300 dark:border-amber-500/45 text-slate-900 dark:text-amber-100',
    iconColor: 'text-amber-600 dark:text-amber-400',
    barColor: 'bg-amber-500',
  },
  danger: {
    icon: AlertCircle,
    bg: 'bg-white dark:bg-[#0F2234] border-rose-300 dark:border-rose-500/45 text-slate-900 dark:text-rose-100',
    iconColor: 'text-rose-600 dark:text-rose-400',
    barColor: 'bg-rose-500',
  },
};

export const NordToast = ({
  id,
  title,
  message,
  variant = 'info',
  actionText,
  onAction,
  duration = 5000,
  onDismiss,
}) => {
  const cfg = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.info;
  const Icon = cfg.icon;
  const effectiveDuration = 5000; // Cierre automático en 5 segundos

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss?.(id);
    }, effectiveDuration);
    return () => clearTimeout(timer);
  }, [id, effectiveDuration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-lg transition-all duration-300 animate-fadeIn ${cfg.bg}`}
      style={{ minWidth: '295px', maxWidth: '410px' }}
    >
      <div className="shrink-0 mt-0.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
        <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
            {title}
          </p>
        )}
        {message && (
          <p className="text-slate-700 dark:text-slate-200 mt-1 line-clamp-2 text-xs leading-relaxed font-medium">
            {message}
          </p>
        )}
        {actionText && onAction && (
          <button
            onClick={() => onAction(id)}
            className="mt-2 text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            {actionText}
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss?.(id)}
        className="shrink-0 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
        title="Cerrar notificación"
      >
        <X className="w-4 h-4" />
        <NordVisuallyHidden>Cerrar</NordVisuallyHidden>
      </button>

      {/* Barra de progreso inferior sincronizada a 5 segundos */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1.5 ${cfg.barColor} rounded-b-2xl opacity-85`}
        style={{ animation: `shrinkWidth ${effectiveDuration}ms linear forwards` }}
      />
    </div>
  );
};

export default NordToast;
