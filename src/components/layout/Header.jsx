import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth, getDicebearAvatarUrl } from '../../context/AuthContext';

export const Header = ({
  onOpenNotifications,
  onOpenDrawer,
}) => {
  const { user, notifications, isDark } = useAuth();

  const firstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : 'Usuario');
  const avatarUrl = getDicebearAvatarUrl(
    user?.avatarStyle || 'clay',
    user?.avatarSeed || user?.firstName || 'CarlosHome'
  );

  const unseenCount = notifications?.filter((n) => n.unseen)?.length || 0;

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b px-4 sm:px-7 py-3.5 sm:py-4.5 min-h-[76px] sm:min-h-[86px] flex items-center transition-colors duration-300 shadow-sm ${
        isDark
          ? 'bg-[#07131F]/95 border-sky-400/25 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-3 items-center gap-2 sm:gap-4">
        {/* ============================================================== */}
        {/* IZQUIERDA: ICONO DE AVATAR MÁS GRANDE                          */}
        {/* ============================================================== */}
        <div className="justify-self-start flex items-center">
          <button
            onClick={onOpenDrawer}
            title="Perfil y ajustes"
            className={`group relative flex items-center gap-2.5 p-1.5 sm:pl-1.5 sm:pr-4 sm:py-1.5 rounded-full border transition-all active:scale-95 shadow-sm cursor-pointer shrink-0 ${
              isDark
                ? 'bg-[#0F2234]/90 hover:bg-slate-800 border-sky-400/40 text-slate-100'
                : 'bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-800'
            }`}
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-900 border-2 border-sky-500/70 shadow-[0_0_12px_rgba(14,165,233,0.3)] shrink-0">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold hidden sm:inline-block max-w-[110px] truncate">
              {firstName}
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* CENTRO (EN MEDIO): HYDRO + [Logo_sin_letras_sin_fondo] + HOME  */}
        {/* ============================================================== */}
        <div className="justify-self-center flex items-center justify-center gap-1.5 sm:gap-3 min-w-0 select-none">
          <span
            className={`font-black text-base sm:text-2xl tracking-wider transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            HYDRO
          </span>

          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center p-1 sm:p-1.5 transition-all shrink-0 ${
              isDark
                ? 'bg-sky-500/15 border border-sky-400/40 shadow-[0_0_18px_rgba(56,189,248,0.3)]'
                : 'bg-sky-50 border border-sky-200/90 shadow-xs'
            }`}
          >
            <img
              src="/assets/images/Logo_sin_letras_sin_fondo.png"
              alt="Logo Hydro"
              className={`w-full h-full object-contain transition-all ${
                isDark
                  ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.75)] brightness-110'
                  : 'drop-shadow-[0_2px_5px_rgba(2,132,199,0.3)] contrast-125'
              }`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/images/Logo_sin_letras_sin_fondo.jpeg';
              }}
            />
          </div>

          <span
            className={`font-black text-base sm:text-2xl tracking-wider transition-colors ${
              isDark ? 'text-sky-400' : 'text-sky-600'
            }`}
          >
            HOME
          </span>
        </div>

        {/* ============================================================== */}
        {/* DERECHA: BOTÓN DE NOTIFICACIONES MÁS GRANDE                    */}
        {/* ============================================================== */}
        <div className="justify-self-end flex items-center">
          <button
            onClick={onOpenNotifications}
            title="Notificaciones"
            className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer shrink-0 ${
              isDark
                ? 'bg-[#0F2234]/90 hover:bg-slate-800 text-sky-400 border-sky-400/35'
                : 'bg-slate-100 hover:bg-slate-200/80 text-sky-700 border-slate-300'
            }`}
          >
            <Bell className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
            {unseenCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center animate-pulse shadow-md shadow-rose-500/50 border-2 border-white dark:border-[#07131F]">
                {unseenCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
