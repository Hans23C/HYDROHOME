import React, { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlowingBlueBox } from '../components/common/GlowingBlueBox';

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const formatSpanishDate = (date = new Date()) =>
  `${date.getDate()} de ${MONTHS_ES[date.getMonth()]} del ${date.getFullYear()}`;

export const PantallaNuevoSistemaFlujo = ({ onFinish }) => {
  const { userSystems, linkNewSystem } = useAuth();

  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [accountType, setAccountType] = useState('personal'); // 'personal' | 'negocio'

  // Datos del formulario (se conservan intactos si ocurre error de validación)
  const [systemName, setSystemName] = useState('');
  const [systemAddress, setSystemAddress] = useState('');
  const [systemCapacity, setSystemCapacity] = useState('5000');
  const [systemDeviceId, setSystemDeviceId] = useState('');
  const [saveSystemInfo, setSaveSystemInfo] = useState(true);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorReason, setErrorReason] = useState('');
  const [addedDateText, setAddedDateText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = systemName.trim();
    const trimmedAddress = systemAddress.trim();
    const trimmedCode = systemDeviceId.trim();

    if (!trimmedName || !trimmedAddress || !trimmedCode) {
      setErrorReason('Completa todos los campos obligatorios, incluyendo el Código ESP32.');
      setShowErrorModal(true);
      return;
    }

    const isDuplicateCode = userSystems.some(
      (s) => (s.deviceId || '').trim().toLowerCase() === trimmedCode.toLowerCase()
    );
    const isDuplicateName = userSystems.some(
      (s) => (s.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicateCode || isDuplicateName) {
      setErrorReason('Verifica el Código ESP32 o el nombre de la vivienda; ya ha sido agregada.');
      setShowErrorModal(true);
      return;
    }

    linkNewSystem({
      name: trimmedName,
      address: trimmedAddress,
      capacity: Number(systemCapacity) || 5000,
      deviceId: trimmedCode.toUpperCase(),
      category: accountType,
      silent: true,
    });

    setAddedDateText(formatSpanishDate(new Date()));
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-4 sm:p-6 shadow-xl pb-28 text-slate-800 dark:text-slate-100">
        <GlowingBlueBox
          isGenerating={true}
          glowColor="good"
          isIntense={true}
          className="flex-1 flex flex-col"
        >
          <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 min-h-[calc(100dvh-230px)]">
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-4">
              {/* Imagen de Éxito */}
              <div className="w-28 h-28 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/15 p-3">
                <img
                  src="/assets/images/Exito.png"
                  alt="Éxito"
                  className="w-20 h-20 object-contain drop-shadow-md"
                />
              </div>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Felicidades
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed max-w-xs">
                ¡Regresa a tu página de Sistemas y selecciona el sistema que vas a monitorear!
              </p>

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-7" />

              {/* Confirmación de Fecha */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                  FECHA
                </span>
                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {addedDateText}
                </p>
                <span className="inline-block mt-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-extrabold">
                  Agregado con Éxito
                </span>
              </div>
            </div>

            <div className="max-w-md w-full mx-auto pt-4">
              <button
                type="button"
                onClick={onFinish}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0E3358] to-[#0284C7] hover:from-[#0B2239] hover:to-[#0369A1] text-white font-black text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition cursor-pointer"
              >
                Ir a la página
              </button>
            </div>
          </div>
        </GlowingBlueBox>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-6 sm:p-8 shadow-xl pb-28 text-slate-800 dark:text-slate-100 relative">
      <div className="max-w-md w-full mx-auto">
        {/* Pestañas alternables: Personal / Negocio */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-[#132235] border border-slate-200/70 dark:border-slate-800 mb-7">
          <button
            type="button"
            onClick={() => setAccountType('personal')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              accountType === 'personal'
                ? 'bg-white dark:bg-[#0E1A29] text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Personal
          </button>
          <button
            type="button"
            onClick={() => setAccountType('negocio')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              accountType === 'negocio'
                ? 'bg-white dark:bg-[#0E1A29] text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Negocio
          </button>
        </div>

        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre de la Vivienda */}
          <div className="relative">
            <label className="absolute -top-2.5 left-4 px-1.5 bg-white dark:bg-[#0B1726] text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {accountType === 'personal' ? 'Nombre de la Vivienda' : 'Nombre del Negocio / Sede'}
            </label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder={
                accountType === 'personal'
                  ? 'Ej. Casa de Campo, Depto 302'
                  : 'Ej. Restaurante Valle, Sucursal Norte'
              }
              className="w-full px-4 py-4 rounded-2xl bg-transparent border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          {/* Dirección */}
          <div className="relative">
            <label className="absolute -top-2.5 left-4 px-1.5 bg-white dark:bg-[#0B1726] text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Dirección
            </label>
            <input
              type="text"
              value={systemAddress}
              onChange={(e) => setSystemAddress(e.target.value)}
              placeholder="Ej. Av. Jacarandas #124, Jardines del Valle"
              className="w-full px-4 py-4 rounded-2xl bg-transparent border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          {/* Capacidad y Código ESP32 */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="relative">
              <label className="absolute -top-2.5 left-4 px-1.5 bg-white dark:bg-[#0B1726] text-[11px] font-bold text-slate-500 dark:text-slate-400 z-10">
                Capacidad
              </label>
              <select
                value={systemCapacity}
                onChange={(e) => setSystemCapacity(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl bg-white dark:bg-[#0B1726] border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
              >
                <option value="1100">1,100 L</option>
                <option value="2500">2,500 L</option>
                <option value="5000">5,000 L</option>
                <option value="10000">10,000 L</option>
                <option value="20000">20,000 L</option>
              </select>
            </div>

            <div className="relative">
              <label className="absolute -top-2.5 left-4 px-1.5 bg-white dark:bg-[#0B1726] text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Código ESP32
              </label>
              <input
                type="text"
                value={systemDeviceId}
                onChange={(e) => setSystemDeviceId(e.target.value)}
                placeholder="ESP32-HYDRO-XXXX"
                className="w-full px-4 py-4 rounded-2xl bg-transparent border border-slate-200 dark:border-slate-700 text-sm font-mono font-semibold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
              />
            </div>
          </div>

          {/* Checkbox guardar información */}
          <label className="flex items-center gap-3 pt-1 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setSaveSystemInfo((prev) => !prev)}
              className={`w-5 h-5 rounded-md flex items-center justify-center border transition cursor-pointer ${
                saveSystemInfo
                  ? 'bg-cyan-500 border-cyan-500 text-white'
                  : 'border-slate-300 dark:border-slate-600 bg-transparent'
              }`}
              aria-pressed={saveSystemInfo}
            >
              {saveSystemInfo && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Guardar información del sistema
            </span>
          </label>

          {/* Botón Agregar */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0E3358] to-[#0284C7] hover:from-[#0B2239] hover:to-[#0369A1] text-white font-black text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition cursor-pointer"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Error Superpuesto con GlowingBlueBox en rojo */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/65 backdrop-blur-xs">
          <div className="relative w-full max-w-xs">
            {/* Ícono circular superior fuera del overflow-hidden */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 w-16 h-16 rounded-full bg-gradient-to-br from-[#881337] to-[#e11d48] border-4 border-white dark:border-[#0B1726] flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <AlertCircle className="w-7 h-7" />
            </div>

            <GlowingBlueBox
              isGenerating={true}
              glowColor="excess"
              isIntense={true}
            >
              <div className="pt-12 pb-6 px-6 text-center">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  Sistema no se ha podido Agregar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                  {errorReason ||
                    'Verifica el Código ESP32 o el nombre de la vivienda ya ha sido agregada'}
                </p>

                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="mt-6 w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 dark:text-rose-400 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Regresar
                </button>
              </div>
            </GlowingBlueBox>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantallaNuevoSistemaFlujo;
