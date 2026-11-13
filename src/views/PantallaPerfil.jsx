import React from 'react';
import {
  CreditCard,
  MapPin,
  Share2,
  Users,
  Sparkles,
  FileSpreadsheet,
  PhoneCall,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarUsuario } from '../components/common/AvatarUsuario';
import { exportarExcel } from '../services/registroAguaService';
import confetti from 'canvas-confetti';

export const PantallaPerfil = ({
  onNavigateToEditAvatar,
  onNavigateToSystems,
  onNavigateToContactUs,
  onOpenAvatarSelector,
  onOpenLogout,
}) => {
  const {
    user,
    soundAlerts,
    updateSoundAlerts,
    isDark,
    toggleTheme,
    activeSystem,
    addToast,
  } = useAuth();

  const handleExport = () => {
    try {
      exportarExcel();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.3 } });
      addToast({
        title: 'Exportación Exitosa',
        message: 'Bitácora descargada en formato Excel (.xlsx).',
        variant: 'success',
        duration: 4000,
      });
    } catch (e) {
      console.error(e);
      alert('Error al exportar: ' + e.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0F1722] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-6 sm:p-8 shadow-xl pb-28">
      {/* Información del Perfil Central */}
      <div className="flex flex-col items-center justify-center pt-2 pb-6 border-b border-slate-100 dark:border-slate-800">
        <AvatarUsuario size="xl" />

        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mt-3">
          {user?.name || 'Hannah Turin'}
        </h3>
        <p className="text-xs sm:text-sm text-[#FF5B22] font-semibold mt-0.5">
          {user?.email || 'hannah.turin@email.com'}
        </p>

        {/* Botón Edit */}
        <button
          onClick={onNavigateToEditAvatar}
          className="mt-3.5 px-6 py-1.5 rounded-full border border-[#FF5B22] text-[#FF5B22] hover:bg-[#FF5B22] hover:text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
        >
          Edit
        </button>
      </div>

      <div className="space-y-6 mt-6">
        {/* ============================================================== */}
        {/* SECCIÓN GENERAL                                                */}
        {/* ============================================================== */}
        <div>
          <h4 className="text-xs font-black text-[#FF5B22] uppercase tracking-wider mb-3">
            General
          </h4>
          <div className="space-y-1">
            {/* Payment Methods */}
            <button
              onClick={() => {
                addToast({
                  title: 'Métodos de Pago',
                  message: 'Tarjeta Visa terminada en 4821 activa para pago de agua.',
                  variant: 'info',
                  duration: 4000,
                });
              }}
              className="w-full py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-2xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-[#FF5B22] transition-colors" />
                <div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    Payment Methods
                  </h5>
                  <p className="text-xs text-slate-400">Add your credit & debit cards</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Locations */}
            <button
              onClick={onNavigateToSystems}
              className="w-full py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-2xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <MapPin className="w-5 h-5 text-slate-400 group-hover:text-[#FF5B22] transition-colors" />
                <div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    Locations
                  </h5>
                  <p className="text-xs text-slate-400">
                    {activeSystem?.name || 'Casa Principal'} · Administrar viviendas
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Personalizador de Avatar */}
            <button
              onClick={onOpenAvatarSelector}
              className="w-full py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-2xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <Sparkles className="w-5 h-5 text-slate-400 group-hover:text-[#FF5B22] transition-colors" />
                <div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    Avatar 3D & DiceBear
                  </h5>
                  <p className="text-xs text-slate-400">Personalizar icono animado</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Descargar Bitácora Excel */}
            <button
              onClick={handleExport}
              className="w-full py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-2xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <FileSpreadsheet className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    Descargar Bitácora (.xlsx)
                  </h5>
                  <p className="text-xs text-slate-400">Exportar lecturas y telemetría</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECCIÓN NOTIFICATIONS                                          */}
        {/* ============================================================== */}
        <div>
          <h4 className="text-xs font-black text-[#FF5B22] uppercase tracking-wider mb-3">
            Notifications
          </h4>
          <div className="space-y-3">
            {/* Push Notifications Switch */}
            <div className="py-2 px-2 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  Push Notifications
                </h5>
                <p className="text-xs text-slate-400">For daily update and others.</p>
              </div>

              {/* Interruptor Naranja */}
              <button
                type="button"
                onClick={() => updateSoundAlerts(!soundAlerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  soundAlerts ? 'bg-[#FF5B22]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Promotional Notifications / Modo Oscuro */}
            <div className="py-2 px-2 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>Modo Oscuro</span>
                  {isDark ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                </h5>
                <p className="text-xs text-slate-400">Apariencia visual de la app</p>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isDark ? 'bg-[#FF5B22]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECCIÓN MORE                                                   */}
        {/* ============================================================== */}
        <div>
          <h4 className="text-xs font-black text-[#FF5B22] uppercase tracking-wider mb-3">
            More
          </h4>
          <div className="space-y-1">
            {/* Contact Us */}
            <button
              onClick={onNavigateToContactUs}
              className="w-full py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-2xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <PhoneCall className="w-5 h-5 text-slate-400 group-hover:text-[#FF5B22] transition-colors" />
                <div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    Contact Us
                  </h5>
                  <p className="text-xs text-slate-400">For more information</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Logout */}
            <button
              onClick={onOpenLogout}
              className="w-full py-3 px-2 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <LogOut className="w-5 h-5 text-rose-500" />
                <div>
                  <h5 className="font-bold text-sm text-rose-600 dark:text-rose-400">
                    Logout
                  </h5>
                  <p className="text-xs text-slate-400">Cerrar sesión en este dispositivo</p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantallaPerfil;
