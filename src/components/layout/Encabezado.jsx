import React from 'react';
import { Bell, ChevronLeft, Droplets } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AvatarUsuario } from '../common/AvatarUsuario';

export const Encabezado = ({
  title,
  showBack = false,
  onBack,
  onOpenNotifications,
  onOpenProfile,
  showBell = true,
  className = '',
}) => {
  const { notifications } = useAuth();
  const hasUnseen = notifications?.some((n) => n.unseen);

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[radial-gradient(circle,#000000_0%,#505DD0_100%)] text-white px-5 sm:px-6 py-5 flex items-center justify-between min-h-[84px] select-none transition-colors ${className}`}
    >
      {/* Botón Izquierdo: Back Arrow o Avatar de Usuario */}
      <div className="flex items-center">
        {showBack ? (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer text-white"
            title="Volver"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={onOpenProfile}
            className="group flex items-center gap-2 cursor-pointer focus:outline-none"
            title="Ver Perfil"
          >
            <AvatarUsuario size="md" />
          </button>
        )}
      </div>

      {/* Centro: Título de la pantalla o Logo de la Aplicación */}
      <div className="flex-1 flex items-center justify-center text-center px-2">
        {title ? (
          <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white truncate max-w-[220px] sm:max-w-md">
            {title}
          </h1>
        ) : (
          <div className="flex items-center justify-center cursor-pointer py-1" onClick={onBack}>
            <img
              src="/assets/images/Home_white.png"
              alt="Hydro Home"
              className="h-8 sm:h-9 w-auto max-w-[170px] sm:max-w-[200px] object-contain drop-shadow"
              onError={(e) => {
                // Fallback elegante en caso de ruta
                e.currentTarget.style.display = 'none';
                const sibling = e.currentTarget.nextElementSibling;
                if (sibling) sibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#00C2FF]/20 text-[#00C2FF] flex items-center justify-center shadow-xs">
                <Droplets className="w-4 h-4 fill-current" />
              </div>
              <span className="font-black text-base sm:text-lg tracking-wider text-white">
                HYDRO <span className="text-[#00C2FF]">HOME</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Botón Derecho: Campana de Notificaciones con punto rojo */}
      <div className="flex items-center">
        {showBell ? (
          <button
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition cursor-pointer text-white"
            title="Notificaciones"
          >
            <Bell className="w-5.5 h-5.5 fill-white/10" />
            {hasUnseen && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#1E2022] animate-pulse" />
            )}
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </header>
  );
};

export default Encabezado;
