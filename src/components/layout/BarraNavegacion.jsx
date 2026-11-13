import React from 'react';
import { motion } from 'motion/react';
import { Home, FileText, Package, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BarraNavegacion = ({
  activeTab = 0,
  onSelectTab,
  isInsideFrame = false,
  className = '',
}) => {
  const { notifications } = useAuth();
  const hasUnseen = notifications?.some((n) => n.unseen);

  const tabs = [
    { id: 0, label: 'Inicio', icon: Home },
    { id: 1, label: 'Consumo', icon: FileText },
    { id: 2, label: 'Sistemas', icon: Package },
    { id: 3, label: 'Perfil', icon: User, hasBadge: hasUnseen },
  ];

  const wrapperClass = isInsideFrame
    ? 'sticky bottom-0 left-0 right-0 z-30'
    : 'fixed bottom-0 left-0 right-0 z-40';

  const cx = activeTab * 100 + 50;
  const notchPath = `M 0 28 L ${cx - 48} 28 C ${cx - 28} 28, ${cx - 24} 2, ${cx} 2 C ${cx + 24} 2, ${cx + 28} 28, ${cx + 48} 28 L 400 28 L 400 100 L 0 100 Z`;

  return (
    <div className={`${wrapperClass} ${className} w-full m-0 p-0 bg-transparent select-none`}>
      <div className="relative w-full text-white pt-7 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Fondo SVG con curva envolvente animada y degradado lineal exacto */}
        <svg
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_-6px_14px_rgba(0,0,0,0.3)]"
        >
          <defs>
            <linearGradient id="hydroNavGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#505DD0" />
              <stop offset="50%" stopColor="#000000" />
              <stop offset="100%" stopColor="#505DD0" />
            </linearGradient>
          </defs>
          <motion.path
            d={notchPath}
            animate={{ d: notchPath }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            fill="url(#hydroNavGradient)"
          />
        </svg>

        <div className="flex items-center justify-around relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="relative flex-1 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
              >
                {isActive ? (
                  <div className="relative flex flex-col items-center">
                    {/* Botón flotante sobresaliendo dentro de la curva */}
                    <motion.div
                      layoutId="activeNavNotch"
                      initial={{ scale: 0.9, y: 4 }}
                      animate={{ scale: 1.05, y: 0 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-13 h-13 -mt-7 rounded-full bg-white flex items-center justify-center shadow-lg shadow-black/40 border-2 border-white/25"
                      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    >
                      <Icon className="w-6 h-6 text-[#FF5B22] stroke-[2.4]" />
                    </motion.div>

                    <span className="text-[11px] font-bold text-white mt-1.5 tracking-tight drop-shadow-sm">
                      {tab.label}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1.5 transition-transform group-hover:scale-105 active:scale-95">
                    <div className="relative">
                      <Icon className="w-5.5 h-5.5 text-white/85 group-hover:text-white transition-colors stroke-[2]" />
                      {tab.hasBadge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF5B22]" />
                      )}
                    </div>
                    {/* Espaciador para alinear con la pestaña activa */}
                    <div className="h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BarraNavegacion;
