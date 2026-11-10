import React, { useState } from 'react';
import {
  Home,
  Plus,
  Trash2,
  ArrowRight,
  MapPin,
  X,
  Lock,
  Unlock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MySystemsScreen = ({ onSelectSystemAndGoHome }) => {
  const { userSystems, activeSystemId, switchSystem, linkNewSystem, unlinkSystem } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCapacity, setNewCapacity] = useState('5000');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSystem = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      linkNewSystem({
        name: newName,
        address: newAddress,
        capacity: newCapacity,
        deviceId: newDeviceId || `ESP32-HYDRO-${Math.floor(1000 + Math.random() * 9000)}`,
      });

      setIsSubmitting(false);
      setIsModalOpen(false);
      setNewName('');
      setNewAddress('');
      setNewCapacity('5000');
      setNewDeviceId('');

      onSelectSystemAndGoHome?.();
    }, 400);
  };

  const handleSelectSystem = (systemId) => {
    switchSystem(systemId);
    onSelectSystemAndGoHome?.();
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-20">
      {/* Encabezado Compacto y Ordenado */}
      <div className="liquid-glass p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-500 flex items-center justify-center shrink-0">
            <Home className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
              Mis Sistemas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Viviendas enlazadas a tu cuenta personal
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm btn-hydro-primary flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Vivienda</span>
        </button>
      </div>

      {/* Rejilla de Sistemas Compacta sin Espacios Excesivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
        {userSystems.map((sys) => {
          const isActive = sys.id === activeSystemId;
          return (
            <div
              key={sys.id}
              className={`liquid-glass p-5 sm:p-6 flex flex-col gap-4 transition-all ${
                isActive ? 'ring-2 ring-sky-500/60' : ''
              }`}
            >
              {/* Parte Superior: Nombre y Ubicación */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-500 flex items-center justify-center shrink-0">
                    <Home className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                        {sys.name}
                      </h3>
                      {isActive && (
                        <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-600 text-white shrink-0">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-500" />
                      <span className="truncate">{sys.address}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Parte Central: 3 Recuadros de Telemetría Compactos */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-100/80 dark:bg-[#0B1928] border border-slate-200 dark:border-sky-400/20 flex flex-col justify-between gap-1">
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                    Cisterna
                  </span>
                  <span className="font-mono text-base sm:text-lg font-extrabold text-sky-500 block">
                    {Math.round(sys.level * 100)}%
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-100/80 dark:bg-[#0B1928] border border-slate-200 dark:border-sky-400/20 flex flex-col justify-between gap-1">
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                    Presión
                  </span>
                  <span className="font-mono text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 block">
                    {sys.pressure} bar
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-100/80 dark:bg-[#0B1928] border border-slate-200 dark:border-sky-400/20 flex flex-col justify-between gap-1">
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                    Válvula
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    {sys.valveOpen ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Abierta
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" /> Cerrada
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Parte Inferior: Botones de Acción */}
              <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                {userSystems.length > 1 && !isActive && (
                  <button
                    onClick={() => unlinkSystem(sys.id)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Desvincular vivienda"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}

                <button
                  onClick={() => handleSelectSystem(sys.id)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-400/35'
                      : 'bg-sky-600 hover:bg-sky-700 text-white shadow-md'
                  }`}
                >
                  <span>{isActive ? 'Monitoreando este Sistema' : 'Seleccionar Hogar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PARA ENLAZAR NUEVO SISTEMA HYDRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="liquid-glass max-w-md w-full p-6 border-sky-400/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-sky-400/20 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-500 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Enlazar Nueva Vivienda
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSystem} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre de la Vivienda
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Casa de Campo, Depto 302"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1928] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Ej. Calle Palmas #45"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1928] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Capacidad
                  </label>
                  <select
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1928] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="2500">2,500 L</option>
                    <option value="5000">5,000 L</option>
                    <option value="10000">10,000 L</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Código ESP32
                  </label>
                  <input
                    type="text"
                    placeholder="ESP32-XXXX"
                    value={newDeviceId}
                    onChange={(e) => setNewDeviceId(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0B1928] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold btn-hydro-primary flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySystemsScreen;
