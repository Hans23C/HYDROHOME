import React, { useEffect } from 'react';
import { Bell, CheckCircle2, MessageSquare, Tag, Droplets, Zap, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PantallaNotificaciones = ({ onBack, onNavigateToChat }) => {
  const { notifications, removeNotification, markNotificationsAsSeen, activeSystem } = useAuth();

  useEffect(() => {
    markNotificationsAsSeen?.();
  }, [markNotificationsAsSeen]);

  const defaultMockNotifs = [
    {
      id: 'mock-1',
      type: 'reminder',
      title: 'Reminder',
      message: `Telemetría ${activeSystem?.name || 'Casa Principal'}: Cisterna al ${Math.round((activeSystem?.level || 0.68) * 100)}% de capacidad.`,
      time: '13min',
      iconBg: 'bg-[#EBF2FF] dark:bg-blue-950/40 text-blue-600',
      icon: Bell,
    },
    {
      id: 'mock-2',
      type: 'message',
      title: 'You have a new Message',
      message: '“Revisé la presión de tu bomba y está calibrada a 3.2 bar en modo automático.”',
      time: '1 hr',
      iconBg: 'bg-[#EBF8FF] dark:bg-sky-950/40 text-sky-600',
      icon: MessageSquare,
      action: onNavigateToChat,
    },
    {
      id: 'mock-3',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Solicitud de Limpieza Anual de Cisterna agendada con éxito para este sábado.',
      time: '1 hr',
      iconBg: 'bg-[#E6FFFB] dark:bg-emerald-950/40 text-emerald-600',
      icon: CheckCircle2,
    },
    {
      id: 'mock-4',
      type: 'offer',
      title: 'Summer Offer',
      message: '40% de ahorro en mantenimiento preventivo de bombas y sensores antes del 23 de Nov.',
      time: '1 hr',
      iconBg: 'bg-[#FFEBEB] dark:bg-rose-950/40 text-[#FF5B22]',
      icon: Tag,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0F1722] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-6 sm:p-8 shadow-xl pb-24">
      {/* Encabezado de la Sección */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Today
        </h2>
        <span className="text-xs font-bold text-slate-400">
          {(notifications?.length || 0) + defaultMockNotifs.length} avisos
        </span>
      </div>

      {/* Lista de Notificaciones Estilizada */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
        {/* Notificaciones Reales Dinámicas del AuthContext */}
        {notifications?.map((item) => (
          <div
            key={item.id}
            className="py-4 flex items-start gap-4 group hover:bg-slate-50 dark:hover:bg-slate-900/40 px-2 rounded-2xl transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5B22] flex items-center justify-center shrink-0">
              <Droplets className="w-6 h-6 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {item.title}
                </h4>
                <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                  {item.time || 'Ahora'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {item.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(item.id)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
              title="Eliminar aviso"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Notificaciones Mock visualmente idénticas a Notificaciones.png */}
        {defaultMockNotifs.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              onClick={n.action}
              className={`py-4.5 flex items-start gap-4 px-2 rounded-2xl transition ${
                n.action ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40' : ''
              }`}
            >
              <div
                className={`w-13 h-13 rounded-2xl ${n.iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">{n.time}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PantallaNotificaciones;
