import React from 'react';
import {
  X,
  Sun,
  Moon,
  Volume2,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Smartphone,
  Monitor,
  Sparkles,
  Download,
  FileSpreadsheet,
  Home,
  Wifi,
  Activity,
} from 'lucide-react';
import { useAuth, getDicebearAvatarUrl, DICEBEAR_COLLECTIONS } from '../../context/AuthContext';
import { exportarExcel } from '../../services/registroAguaService';
import confetti from 'canvas-confetti';

export const NordDrawer = ({ isOpen, onClose, onOpenLogout, onOpenAvatarSelector }) => {
  const {
    user,
    userSystems,
    activeSystem,
    isDark,
    toggleTheme,
    viewMode,
    toggleViewMode,
    soundAlerts,
    updateSoundAlerts,
    syncInterval,
    updateSyncInterval,
  } = useAuth();

  if (!isOpen) return null;

  const currentCollection = DICEBEAR_COLLECTIONS[user?.avatarStyle] || DICEBEAR_COLLECTIONS['clay'];
  const avatarUrl = getDicebearAvatarUrl(
    user?.avatarStyle || 'clay',
    user?.avatarSeed || user?.firstName || 'CarlosHome'
  );

  const handleExportExcel = () => {
    try {
      exportarExcel();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.3 },
      });
    } catch (e) {
      console.error(e);
      alert('Error al exportar: ' + e.message);
    }
  };

  const cardBg = isDark
    ? 'bg-[#0F2234] border-sky-400/20 text-slate-100'
    : 'bg-slate-50 border-slate-200 text-slate-900';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Fondo backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-8 sm:pr-10">
        <div
          className={`w-screen max-w-sm sm:max-w-md border-r shadow-2xl flex flex-col h-dvh transition-colors overflow-hidden ${
            isDark
              ? 'bg-[#091724] text-slate-100 border-sky-400/20'
              : 'bg-white text-slate-900 border-slate-200'
          }`}
        >
          {/* Encabezado del Drawer */}
          <div
            className={`flex items-center justify-between px-6 py-4.5 border-b shrink-0 backdrop-blur-md ${
              isDark
                ? 'bg-[#091724]/95 border-sky-400/20'
                : 'bg-white/95 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Mi Cuenta & Ajustes
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo Scrolleable Distribuido a lo Largo de la Pantalla con Amplio Espacio y Separación */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-7 flex flex-col justify-between gap-8 sm:gap-10">
            <div className="space-y-8 sm:space-y-9">
              {/* 1. Tarjeta de Perfil con Avatar Animado y Botón Muy Visible */}
              <div
                className={`p-6 sm:p-7 rounded-3xl border flex flex-col items-center text-center shadow-sm ${cardBg}`}
              >
                <div className="relative mb-4 group cursor-pointer" onClick={() => { onClose(); onOpenAvatarSelector?.(); }}>
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 shadow-[0_0_28px_rgba(56,189,248,0.45)] animate-cyber-ring flex items-center justify-center overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt={user?.name}
                      className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-900 object-cover animate-avatar-float animate-avatar-glow"
                    />
                  </div>
                  {/* Badge de editar avatar visible para el usuario */}
                  <div
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-500 text-white border-2 border-white dark:border-slate-900 shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                    title="Cambiar avatar"
                  >
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                <h4 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                  {user?.name || 'Propietario Residencial'}
                </h4>
                <p className="text-xs sm:text-sm text-sky-600 dark:text-sky-400 font-mono mt-0.5">
                  {user?.email}
                </p>

                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/25 text-xs text-sky-600 dark:text-sky-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>{user?.roleLabel || 'Titular de Cuenta Residencial'}</span>
                </div>

                {/* BOTÓN DESTACADO Y VISIBLE PARA CAMBIAR AVATAR */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenAvatarSelector?.();
                  }}
                  className="mt-4 w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm btn-hydro-primary flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Cambiar Avatar ({currentCollection.name})</span>
                </button>
              </div>

              {/* 2. Vivienda Seleccionada */}
              <div className={`p-6 sm:p-7 rounded-3xl border space-y-4 shadow-sm ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Vivienda Activa
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                    {userSystems.length} {userSystems.length === 1 ? 'Propiedad' : 'Propiedades'}
                  </span>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark
                      ? 'bg-[#091624] border-sky-400/15'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="font-extrabold block text-sm truncate">
                    {activeSystem?.name || 'Casa Principal'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                    {activeSystem?.address}
                  </span>
                  <div className="mt-2.5 flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-mono font-bold">
                    <span>Capacidad: {activeSystem?.capacity} L</span>
                    <span>Nivel: {Math.round((activeSystem?.level || 0) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* 3. Reacomodo de Información Técnica ESP32 y MQTT */}
              <div className={`p-6 sm:p-7 rounded-3xl border space-y-4 shadow-sm ${cardBg}`}>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Enlace de Telemetría IoT
                </span>

                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div
                    className={`p-3.5 rounded-2xl border ${
                      isDark ? 'bg-[#091624] border-sky-400/15' : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-slate-400 block mb-0.5">Controlador</span>
                    <span className="font-mono font-bold text-emerald-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ESP32 En Línea
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border ${
                      isDark ? 'bg-[#091624] border-sky-400/15' : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-slate-400 block mb-0.5">Protocolo Red</span>
                    <span className="font-mono font-bold text-sky-500 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      MQTT v2.4 · 18ms
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Preferencias Espaciadas */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
                  Visualización & Preferencias
                </span>

                {/* Modo Escritorio / Móvil */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${cardBg}`}>
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                      {viewMode === 'desktop' ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm block">
                        {viewMode === 'desktop' ? 'Modo Escritorio' : 'Modo Simulador Móvil'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Cambiar vista de pantalla
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={toggleViewMode}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 transition active:scale-95 cursor-pointer"
                  >
                    Alternar
                  </button>
                </div>

                {/* Modo Oscuro / Modo Claro */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${cardBg}`}>
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm block">
                        {isDark ? 'Modo Oscuro' : 'Modo Claro (Blanco)'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Apariencia general de la app
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={toggleTheme}
                    className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                      isDark ? 'bg-sky-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isDark ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Muestreo ESP32 */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${cardBg}`}>
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">
                        Muestreo ESP32
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Intervalo de sincronización
                      </span>
                    </div>
                  </div>

                  <select
                    value={syncInterval}
                    onChange={(e) => updateSyncInterval(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:border-sky-500 cursor-pointer ${
                      isDark
                        ? 'bg-[#091624] border-slate-700 text-slate-200'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="15 seg">15s</option>
                    <option value="30 seg">30s</option>
                    <option value="1 minuto">1m</option>
                  </select>
                </div>

                {/* Alarmas sonoras */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${cardBg}`}>
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">
                        Alarmas Sonoras
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Aviso por fugas o nivel bajo
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => updateSoundAlerts(!soundAlerts)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                      soundAlerts ? 'bg-sky-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        soundAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Descargar Bitácora Excel */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-teal-500/10 border border-sky-400/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/30">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">
                        Descargar Bitácora (.xlsx)
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Exportar registros del hogar
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleExportExcel}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 🔴 BOTÓN OVALADO DE CERRAR SESIÓN DESPEGADO DE LA PARTE INFERIOR */}
            <div className="pt-4 pb-10 sm:pb-12">
              <button
                onClick={() => {
                  onClose();
                  onOpenLogout();
                }}
                className="w-full py-4 px-6 rounded-full text-sm font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NordDrawer;
