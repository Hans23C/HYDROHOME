import React from 'react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LogoutDialog = ({ isOpen, onClose, onConfirm }) => {
  const { isDark, user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`max-w-md w-full p-7 sm:p-8 rounded-3xl text-center border-2 shadow-2xl transition-colors ${
          isDark
            ? 'bg-[#0C1E30] border-rose-500/45 text-white shadow-[0_25px_60px_rgba(0,0,0,0.85)]'
            : 'bg-white border-rose-300 text-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.25)]'
        }`}
      >
        <div
          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl mx-auto flex items-center justify-center mb-5 border ${
            isDark
              ? 'bg-rose-500/20 border-rose-400/40 text-rose-400'
              : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}
        >
          <LogOut className="w-8 h-8 sm:w-9 sm:h-9" />
        </div>

        <h3
          className={`font-black text-xl sm:text-2xl mb-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          ¿Cerrar Sesión de tu Hogar?
        </h3>

        <p
          className={`text-sm sm:text-base font-medium mb-5 leading-relaxed ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          Se cerrará la sesión de{' '}
          <span className="font-extrabold text-sky-600 dark:text-sky-400">
            {user?.name || 'tu cuenta'}
          </span>{' '}
          en este dispositivo. Tus viviendas seguirán protegidas y monitoreadas automáticamente.
        </p>

        <div
          className={`mb-6 p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs sm:text-sm font-bold ${
            isDark
              ? 'bg-[#081523] border-sky-400/25 text-sky-300'
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}
        >
          <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-sky-500" />
          <span>Telemetría y protección anti-fugas activas 24/7</span>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          <button
            onClick={onClose}
            className={`py-3.5 sm:py-4 px-5 rounded-2xl text-sm sm:text-base font-extrabold border-2 transition active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
            }`}
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="py-3.5 sm:py-4 px-5 rounded-2xl text-sm sm:text-base font-extrabold bg-rose-600 hover:bg-rose-700 transition active:scale-95 text-white shadow-lg shadow-rose-600/35 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutDialog;
