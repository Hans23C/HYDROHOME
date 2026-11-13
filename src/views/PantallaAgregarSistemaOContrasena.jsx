import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Check, Delete, Home, Shield, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PantallaAgregarSistemaOContrasena = ({
  initialMode = 'password', // 'password' o 'system'
  onBack,
  onFinish,
}) => {
  const { linkNewSystem, addToast } = useAuth();
  const [mode, setMode] = useState(initialMode);

  // Estados de Change Password (Valores iniciales fieles a la imagen Agregar sistemas.png)
  const [currentPassword, setCurrentPassword] = useState('chj4x99nc2,#');
  const [newPassword, setNewPassword] = useState('Hydro2026!');
  const [confirmPassword, setConfirmPassword] = useState('Hydro2026!');
  const [showCurrent, setShowCurrent] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeField, setActiveField] = useState('confirm'); // 'current' | 'new' | 'confirm'

  // Estados de Agregar Vivienda / Sistema IoT
  const [systemName, setSystemName] = useState('');
  const [systemAddress, setSystemAddress] = useState('');
  const [systemCapacity, setSystemCapacity] = useState('5000');
  const [systemDeviceId, setSystemDeviceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleKeyPress = (num) => {
    if (activeField === 'current') {
      setCurrentPassword((prev) => prev + num);
    } else if (activeField === 'new') {
      setNewPassword((prev) => prev + num);
    } else if (activeField === 'confirm') {
      setConfirmPassword((prev) => prev + num);
    }
  };

  const handleDeleteKey = () => {
    if (activeField === 'current') {
      setCurrentPassword((prev) => prev.slice(0, -1));
    } else if (activeField === 'new') {
      setNewPassword((prev) => prev.slice(0, -1));
    } else if (activeField === 'confirm') {
      setConfirmPassword((prev) => prev.slice(0, -1));
    }
  };

  const handleSavePassword = (e) => {
    e?.preventDefault();
    if (!passwordsMatch) {
      addToast({
        title: 'Error de Contraseña',
        message: 'Las contraseñas no coinciden. Por favor verifica.',
        variant: 'danger',
        duration: 3500,
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast({
        title: 'Contraseña Actualizada',
        message: 'Tu contraseña ha sido guardada. Inicia sesión con tus nuevas credenciales.',
        variant: 'success',
        duration: 4000,
      });
      onFinish?.();
    }, 600);
  };

  const handleCreateSystem = (e) => {
    e.preventDefault();
    if (!systemName.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      linkNewSystem({
        name: systemName.trim(),
        address: systemAddress.trim(),
        capacity: Number(systemCapacity),
        deviceId: systemDeviceId.trim() || `ESP32-HYDRO-${Math.floor(1000 + Math.random() * 9000)}`,
      });

      addToast({
        title: 'Sistema Vinculado',
        message: `El sistema "${systemName}" y su sensor ESP32 han sido conectados.`,
        variant: 'success',
        duration: 4000,
      });

      setIsSubmitting(false);
      onFinish?.();
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-6 sm:p-8 shadow-xl pb-16 transition-colors">
      <div>
        {/* Selector de Modo: Password (Diseño Fiel) vs Enlazar Sistema IoT (Lógica Fiel) */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-5 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'password'
                ? 'bg-[#FF5B22] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('system')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'system'
                ? 'bg-[#FF5B22] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Add System</span>
          </button>
        </div>

        {mode === 'password' ? (
          /* ============================================================== */
          /* MODO EXACTO: CHANGE PASSWORD (De "Agregar sistemas.png")       */
          /* ============================================================== */
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Change Password
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mt-2 leading-relaxed max-w-sm">
                Please note changing password will required again login to the app.
              </p>
            </div>

            {/* Field 1: Current Password */}
            <div
              onClick={() => setActiveField('current')}
              className={`floating-input-box flex items-center justify-between cursor-text ${
                activeField === 'current' ? 'border-[#FF5B22] ring-2 ring-[#FF5B22]/15' : ''
              }`}
            >
              <label className="floating-input-label">Current Password</label>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCurrent(!showCurrent);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
              >
                {showCurrent ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Field 2: New Password */}
            <div
              onClick={() => setActiveField('new')}
              className={`floating-input-box flex items-center justify-between cursor-text ${
                activeField === 'new' ? 'border-[#FF5B22] ring-2 ring-[#FF5B22]/15' : ''
              }`}
            >
              <label className="floating-input-label">New Password</label>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNew(!showNew);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
              >
                {showNew ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Field 3: Confirm New Password (Con borde verde y checkmark cuando coincide) */}
            <div
              onClick={() => setActiveField('confirm')}
              className={`floating-input-box flex items-center justify-between cursor-text transition-all ${
                passwordsMatch
                  ? '!border-emerald-500 !ring-2 !ring-emerald-500/20'
                  : activeField === 'confirm'
                  ? 'border-[#FF5B22] ring-2 ring-[#FF5B22]/15'
                  : ''
              }`}
            >
              <label
                className={`floating-input-label transition-colors ${
                  passwordsMatch ? '!text-emerald-500 dark:!text-emerald-400' : ''
                }`}
              >
                Confirm New Password
              </label>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
              />
              {passwordsMatch ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(!showConfirm);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                >
                  {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              )}
            </div>

            {/* Botón Principal: Save Password */}
            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={handleSavePassword}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl text-sm font-black text-white bg-[#FF5B22] hover:bg-[#E54F1C] active:bg-[#CC4316] transition-all shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Password...' : 'Save Password'}
              </motion.button>
            </div>

            {/* Teclado Numérico iOS / Security Style idéntico a la imagen */}
            <div className="pt-3 pb-2 max-w-sm mx-auto select-none">
              <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-[#07131F]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
                {/* Filas 1-3 */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { n: '1', l: '' },
                    { n: '2', l: 'ABC' },
                    { n: '3', l: 'DEF' },
                    { n: '4', l: 'GHI' },
                    { n: '5', l: 'JKL' },
                    { n: '6', l: 'MNO' },
                    { n: '7', l: 'PQRS' },
                    { n: '8', l: 'TUV' },
                    { n: '9', l: 'WXYZ' },
                  ].map((k) => (
                    <button
                      key={k.n}
                      type="button"
                      onClick={() => handleKeyPress(k.n)}
                      className="h-12 bg-white dark:bg-[#132235] hover:bg-slate-50 dark:hover:bg-[#1A2E46] active:scale-95 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center transition shadow-xs cursor-pointer"
                    >
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">
                        {k.n}
                      </span>
                      {k.l && (
                        <span className="text-[9px] text-slate-400 font-bold tracking-widest mt-0.5">
                          {k.l}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Fila 4: Vacío | 0 | Borrar */}
                <div className="grid grid-cols-3 gap-2">
                  <div />
                  <button
                    type="button"
                    onClick={() => handleKeyPress('0')}
                    className="h-12 bg-white dark:bg-[#132235] hover:bg-slate-50 dark:hover:bg-[#1A2E46] active:scale-95 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-center transition shadow-xs cursor-pointer"
                  >
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">
                      0
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteKey}
                    className="h-12 bg-white/70 dark:bg-[#132235]/70 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-rose-500 transition shadow-xs cursor-pointer"
                  >
                    <Delete className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>

                {/* Barra inferior decorativa estilo iOS */}
                <div className="pt-2 flex justify-center">
                  <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* MODO: ENLAZAR NUEVO SISTEMA (Conserva 100% la lógica IoT)      */
          /* ============================================================== */
          <form onSubmit={handleCreateSystem} className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Enlazar Sistema IoT
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mt-2 leading-relaxed max-w-sm">
                Vincula una nueva vivienda, tinaco o cisterna a tu cuenta con su kit ESP32.
              </p>
            </div>

            <div className="floating-input-box">
              <label className="floating-input-label">Nombre de la Vivienda</label>
              <input
                type="text"
                required
                placeholder="Ej. Casa de Campo, Depto 302"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
              />
            </div>

            <div className="floating-input-box">
              <label className="floating-input-label">Dirección</label>
              <input
                type="text"
                placeholder="Ej. Paseo de las Palmas #45"
                value={systemAddress}
                onChange={(e) => setSystemAddress(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="floating-input-box">
                <label className="floating-input-label">Capacidad</label>
                <select
                  value={systemCapacity}
                  onChange={(e) => setSystemCapacity(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="2500">2,500 L</option>
                  <option value="5000">5,000 L</option>
                  <option value="10000">10,000 L</option>
                  <option value="15000">15,000 L</option>
                </select>
              </div>

              <div className="floating-input-box">
                <label className="floating-input-label">Código ESP32</label>
                <input
                  type="text"
                  placeholder="ESP32-HYDRO-XXXX"
                  value={systemDeviceId}
                  onChange={(e) => setSystemDeviceId(e.target.value)}
                  className="w-full text-sm font-mono font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none uppercase"
                />
              </div>
            </div>

            <div className="pt-4">
              <motion.button
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl text-sm font-black text-white bg-[#FF5B22] hover:bg-[#E54F1C] active:bg-[#CC4316] transition-all shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Vinculando Sistema...' : 'Guardar y Vincular Vivienda'}
              </motion.button>
            </div>
          </form>
        )}
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
        >
          Cancelar y Volver
        </button>
      </div>
    </div>
  );
};

export default PantallaAgregarSistemaOContrasena;
