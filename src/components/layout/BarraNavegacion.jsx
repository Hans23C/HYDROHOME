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

  return (
    <div className={`${wrapperClass} ${className} w-full m-0 p-0 select-none`}>
      <div className="relative w-full bg-[linear-gradient(90deg,#505DD0_0%,#000000_50%,#505DD0_100%)] text-white pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] px-3 shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-around relative">
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
                    {/* Botón flotante en notch blanco con icono naranja */}
                    <motion.div
                      layoutId="activeNavNotch"
                      className="w-14 h-14 -mt-8 rounded-full bg-white flex items-center justify-center shadow-lg shadow-black/40 border-2 border-white/25"
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
