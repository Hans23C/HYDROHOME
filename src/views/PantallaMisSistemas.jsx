import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PantallaMisSistemas = ({
  onSelectSystemAndGoHome,
  onNavigateToAddSystem,
}) => {
  const { userSystems, activeSystemId, switchSystem, unlinkSystem } = useAuth();
  const [isNewSystemSheetOpen, setIsNewSystemSheetOpen] = useState(false);

  const handleSelectSystem = (systemId) => {
    switchSystem(systemId);
    onSelectSystemAndGoHome?.();
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B1726] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-5 sm:p-7 shadow-xl pb-28">
      {/* 1. SECCIÓN SISTEMAS Y VIVIENDAS */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
            Sistemas y Viviendas
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {userSystems.length} {userSystems.length === 1 ? 'vivienda' : 'viviendas'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userSystems.map((sys, idx) => {
            const isActive = sys.id === activeSystemId;
            const isEven = idx % 2 === 0;

            return (
              <div
                key={sys.id}
                className={`p-5 rounded-3xl text-white flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden transition-all border ${
                  isEven
                    ? 'bg-gradient-to-br from-[#0B2239] via-[#0E3358] to-[#0284C7] border-cyan-400/20 shadow-cyan-950/30'
                    : 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0E7490] border-cyan-500/20 shadow-slate-950/40'
                } ${isActive ? 'ring-2 ring-cyan-400 shadow-cyan-500/25' : ''}`}
              >
                {/* Parte Superior: Nombre y Código */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/30'
                          : 'bg-white/15 text-white/90'
                      }`}
                    >
                      {isActive ? 'Vivienda Activa' : 'Enlazada'}
                    </span>
                    <h4 className="text-xl font-black mt-1.5 leading-tight">{sys.name}</h4>
                    <p className="text-xs text-slate-200/80 font-medium mt-0.5 truncate max-w-[200px]">
                      {sys.address}
                    </p>
                  </div>

                  <span className="font-mono text-xs font-black bg-black/25 border border-white/10 px-2.5 py-1 rounded-xl shrink-0">
                    {sys.deviceId || `ESP32-${idx + 1}`}
                  </span>
                </div>

                {/* Métricas de Telemetría */}
                <div className="grid grid-cols-3 gap-2 bg-black/25 backdrop-blur-xs p-2.5 rounded-2xl text-center text-xs border border-white/10">
                  <div>
                    <span className="block text-[10px] text-slate-300">Cisterna</span>
                    <span className="font-extrabold">{Math.round(sys.level * 100)}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-300">Presión</span>
                    <span className="font-extrabold">{sys.pressure} bar</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-300">Válvula</span>
                    <span className="font-extrabold">{sys.valveOpen ? 'Abierta' : 'Cerrada'}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  {userSystems.length > 1 && !isActive && (
                    <button
                      type="button"
                      onClick={() => unlinkSystem(sys.id)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition cursor-pointer"
                      title="Desvincular vivienda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSelectSystem(sys.id)}
                    className="flex-1 ml-auto py-2 px-4 rounded-xl bg-white text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-cyan-50 transition active:scale-95 cursor-pointer"
                  >
                    <span>{isActive ? 'Monitoreando Ahora' : 'Seleccionar Vivienda'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SECCIÓN ENLAZAR NUEVO SISTEMA IoT */}
      <div className="mt-8">
        <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white pb-3">
          Gestión de Dispositivos IoT
        </h3>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0A1F35] via-[#0E3358] to-[#0284C7] border border-cyan-400/20 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-cyan-950/30 relative overflow-hidden">
          <div className="z-10 text-center sm:text-left max-w-md">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/25 backdrop-blur-md uppercase tracking-wider">
              Enlace Rápido IoT
            </span>
            <h4 className="text-2xl sm:text-3xl font-black mt-2.5 leading-tight">
              Enlazar Nueva Vivienda
            </h4>
            <p className="text-xs sm:text-sm text-cyan-100/85 font-medium mt-1.5 leading-relaxed">
              Configura un nuevo módulo ESP32 para monitoreo en tiempo real
            </p>

            <button
              type="button"
              onClick={() => setIsNewSystemSheetOpen(true)}
              className="mt-5 px-6 py-2.5 rounded-2xl bg-white text-[#0E3358] font-black text-xs sm:text-sm shadow-md hover:bg-cyan-50 active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3] text-cyan-600" />
              <span>Enlazar Nueva Vivienda</span>
            </button>
          </div>

          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xs flex items-center justify-center p-3 shrink-0">
            <img
              src="/assets/images/Viviendas.png"
              alt="Viviendas"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Bottom Sheet / Modal Inicial: Nuevo Sistema */}
      {isNewSystemSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs"
          onClick={() => setIsNewSystemSheetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#0E1A29] border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-[32px] sm:rounded-[32px] p-6 pb-8 shadow-2xl text-center"
          >
            {/* Indicador superior estilo Bottom Sheet */}
            <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-5" />

            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-800">
              Nuevo Sistema
            </h3>

            {/* Ícono representativo */}
            <div className="my-6 flex justify-center">
              <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center p-3">
                <img
                  src="/assets/images/Sistema.png"
                  alt="Nuevo Sistema"
                  className="w-16 h-16 object-contain drop-shadow-md"
                />
              </div>
            </div>

            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-6">
              Agrega un Nuevo Sistema
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setIsNewSystemSheetOpen(false);
                  onNavigateToAddSystem?.();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0E3358] to-[#0284C7] hover:from-[#0B2239] hover:to-[#0369A1] text-white font-black text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition cursor-pointer"
              >
                Agregar
              </button>

              <button
                type="button"
                onClick={() => setIsNewSystemSheetOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm active:scale-[0.99] transition cursor-pointer"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantallaMisSistemas;
