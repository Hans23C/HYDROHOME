import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, BarChart3, Home, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NavigationBar = ({ activeTab, onSelectTab, isInsideFrame = false, className = '' }) => {
  const { notifications, isDark } = useAuth();
  const hasUnseenNotifs = notifications?.some((n) => n.unseen);

  // Las 4 pestañas oficiales residenciales
  const tabs = [
    { id: 0, label: 'Mi Sistema', icon: LayoutDashboard },
    { id: 1, label: 'Consumo', icon: BarChart3 },
    { id: 2, label: 'Mis Sistemas', icon: Home },
    { id: 3, label: 'Bitácora', icon: Wrench, hasBadge: hasUnseenNotifs },
  ];

  const wrapperClass = isInsideFrame
    ? 'sticky bottom-0 left-0 right-0 z-30 px-3 pb-4 pt-2'
    : 'fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-4 pb-4 sm:pb-5 pt-2';

  return (
    <div className={`${wrapperClass} ${className} pointer-events-none`}>
      <nav className="max-w-md sm:max-w-lg w-full mx-auto rounded-[30px] liquid-glass-dock p-2 sm:p-2.5 transition-all duration-300 shadow-xl pointer-events-auto h-[74px] sm:h-[80px] flex items-center">
        <div className="flex items-center justify-around relative gap-1.5 w-full h-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex-1 h-full flex flex-col items-center justify-center py-1.5 px-2 rounded-[24px] transition-all duration-300 select-none z-10 active:scale-95 cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'text-white font-extrabold'
                      : 'text-sky-900 font-extrabold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 font-semibold'
                }`}
              >
                {/* Burbuja Activa con Animación Liquid Glass */}
                {isActive && (
                  <motion.div
                    layoutId="liquidGlassActiveTab"
                    className="absolute inset-0 rounded-[24px] liquid-glass-pill"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 310,
                      damping: 23,
                      mass: 0.85,
                    }}
                  >
                    {/* Gota de luz superior que simula refracción de cristal líquido */}
                    <motion.span
                      initial={{ scaleX: 0.4, opacity: 0.3 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="absolute top-0 left-1/4 right-1/4 h-[2px] rounded-full bg-white/80 dark:bg-sky-200/90 blur-[0.5px]"
                    />
                  </motion.div>
                )}

                <motion.div
                  animate={
                    isActive
                      ? { y: -2, scale: 1.14 }
                      : { y: 0, scale: 1 }
                  }
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="relative flex items-center justify-center z-10"
                >
                  <Icon
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? 'text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.85)]'
                          : 'text-sky-600 drop-shadow-[0_2px_8px_rgba(2,132,199,0.5)]'
                        : ''
                    }`}
                  />
                  {tab.hasBadge && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                  {tab.hasBadge && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white dark:border-slate-900" />
                  )}
                </motion.div>

                <span className="text-[11.5px] sm:text-[12.5px] mt-1 tracking-tight relative z-10 leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default NavigationBar;
