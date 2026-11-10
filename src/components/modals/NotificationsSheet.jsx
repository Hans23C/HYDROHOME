import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Droplet,
  ShieldCheck,
  Zap,
  Wrench,
  CheckCircle2,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotificationsSheet = ({ isOpen, onClose }) => {
  const { notifications, removeNotification, markNotificationsAsSeen } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('todas');

  // Marcar como vistas al abrir el centro de notificaciones
  useEffect(() => {
    if (isOpen) {
      markNotificationsAsSeen?.();
    }
  }, [isOpen, markNotificationsAsSeen]);

  if (!isOpen) return null;

  const categories = [
    { id: 'todas', label: 'Todas', icon: Bell },
    { id: 'nivel', label: 'Cisterna & Nivel', icon: Droplet },
    { id: 'bomba', label: 'Bomba & Red', icon: Zap },
    { id: 'fuga', label: 'Fugas Smart Leak', icon: ShieldCheck },
    { id: 'servicio', label: 'Servicios', icon: Wrench },
  ];

  const filtered = (notifications || []).filter((item) => {
    if (selectedCategory === 'todas') return true;
    return item.category === selectedCategory;
  });

  const getCategoryCount = (catId) => {
    if (catId === 'todas') return notifications?.length || 0;
    return notifications?.filter((n) => n.category === catId).length || 0;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'nivel':
        return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'bomba':
        return <Zap className="w-4 h-4 text-indigo-500" />;
      case 'fuga':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'servicio':
      default:
        return <Wrench className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="liquid-glass w-full sm:max-w-lg max-h-[85vh] flex flex-col p-5 sm:p-6 rounded-3xl border-slate-200 dark:border-sky-400/30 shadow-2xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-sky-400/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-500/15 border border-sky-300 dark:border-sky-400/35 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm shrink-0">
              <Bell className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Centro de Notificaciones
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Avisos de nivel, bombas, fugas y servicios técnicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Categorías Organizadas */}
        <div className="flex items-center gap-1.5 my-3 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = getCategoryCount(cat.id);
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white border-sky-600 shadow-sm shadow-sky-500/20'
                    : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lista de Alertas Categorizadas */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
              No hay notificaciones registradas en esta categoría.
            </div>
          ) : (
            filtered.map((item) => {
              const isCrit = item.type === 'danger' || item.type === 'critical';
              const isWarn = item.type === 'warning';

              const badgeColor = isCrit
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/30'
                : isWarn
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/30'
                : 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/15 border-sky-300 dark:border-sky-500/30';

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-4.5 rounded-2xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-800/60 hover:border-sky-400/60 transition flex items-start gap-3.5 shadow-sm"
                >
                  <div className="shrink-0 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </span>
                      <span className="font-mono text-xs text-slate-400 shrink-0">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${badgeColor}`}>
                        <Home className="w-3.5 h-3.5" />
                        <span>{item.systemName || 'Vivienda'}</span>
                      </span>
                      {removeNotification && (
                        <button
                          onClick={() => removeNotification(item.id)}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline cursor-pointer"
                        >
                          Descartar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSheet;
