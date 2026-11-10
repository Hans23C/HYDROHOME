import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const NordMessage = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
          border: 'border-emerald-500/35',
          text: 'text-emerald-800 dark:text-emerald-300',
          titleColor: 'text-emerald-900 dark:text-emerald-200',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/15',
          border: 'border-amber-500/35',
          text: 'text-amber-900 dark:text-amber-300',
          titleColor: 'text-amber-950 dark:text-amber-200',
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'danger':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/15',
          border: 'border-rose-500/35',
          text: 'text-rose-900 dark:text-rose-300',
          titleColor: 'text-rose-950 dark:text-rose-200',
          icon: AlertCircle,
          iconColor: 'text-rose-600 dark:text-rose-400',
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-500/10 dark:bg-sky-500/15',
          border: 'border-sky-500/35',
          text: 'text-sky-900 dark:text-sky-300',
          titleColor: 'text-sky-950 dark:text-sky-200',
          icon: Info,
          iconColor: 'text-sky-600 dark:text-sky-400',
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  return (
    <div
      className={`p-3.5 rounded-xl border ${style.bg} ${style.border} ${className} flex items-start gap-3 transition-all`}
    >
      <div className="shrink-0 mt-0.5">
        <Icon className={`w-4 h-4 ${style.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0 text-xs">
        {title && <h5 className={`font-bold mb-0.5 ${style.titleColor}`}>{title}</h5>}
        <div className={`leading-relaxed ${style.text}`}>{children}</div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-md text-slate-400 hover:text-white transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
