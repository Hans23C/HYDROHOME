import React from 'react';
import { HelpCircle, X, Check, Droplets, SunMoon, FileSpreadsheet, Home, ShieldCheck } from 'lucide-react';

export const GuiaRapidaDialogo = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="liquid-glass max-w-lg w-full max-h-[85vh] flex flex-col p-5 sm:p-6 overflow-hidden border-sky-400/30">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Guía Rápida de Hydro Home</h3>
              <p className="text-xs text-slate-400">Cómo proteger y monitorear el agua de tu hogar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* 1. Semáforo */}
          <div>
            <h4 className="font-bold text-sm text-sky-400 mb-2 flex items-center gap-2">
              <span>🚦</span> 1. Estado de tu Suministro Hídrico
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <h5 className="font-bold text-xs text-emerald-400">Verde (Óptimo)</h5>
                  <p className="text-xs text-slate-300">
                    Tu cisterna o tinaco cuenta con buena reserva, la presión es constante y no hay fugas detectadas.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <h5 className="font-bold text-xs text-amber-400">Amarillo (Reserva Media o Modo Vacaciones)</h5>
                  <p className="text-xs text-slate-300">
                    El nivel de tu cisterna disminuyó o cerraste la válvula de paso general por vacaciones.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 mt-1 shrink-0" />
                <div>
                  <h5 className="font-bold text-xs text-rose-400">Rojo (Alerta de Fuga o Nivel Bajo)</h5>
                  <p className="text-xs text-slate-300">
                    Se detectó un flujo inusual en tuberías o reserva menor al 25%. Puedes cerrar la válvula desde el panel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Indicadores Principales */}
          <div>
            <h4 className="font-bold text-sm text-sky-400 mb-2 flex items-center gap-2">
              <Droplets className="w-4 h-4" /> 2. Controles e Indicadores de tu Casa
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <span className="font-bold text-sky-400 block mb-0.5">Nivel de Cisterna (%) y Autonomía</span>
                <p className="text-slate-300">
                  Muestra los litros disponibles en tu casa y cuántas horas de agua tienes garantizadas según tu consumo diario.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <span className="font-bold text-sky-400 block mb-0.5">Bomba Presurizadora y Modo Vacaciones</span>
                <p className="text-slate-300">
                  Puedes pausar o encender tu bomba presurizadora y bloquear la válvula general de entrada cuando salgas de viaje.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <span className="font-bold text-sky-400 block mb-0.5">Multisistema (Varias Viviendas en 1 Cuenta)</span>
                <p className="text-slate-300">
                  En el apartado "Mis Sistemas" puedes enlazar una segunda vivienda (casa de campo, departamento) sin crear otra cuenta.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Acciones Frecuentes */}
          <div>
            <h4 className="font-bold text-sm text-sky-400 mb-2 flex items-center gap-2">
              <span>⚡</span> 3. Funciones en tu Perfil (Avatar)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30">
                <SunMoon className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  Abre tu perfil en la esquina superior derecha para alternar entre Modo Claro/Oscuro y personalizar tu avatar.
                </p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  Descarga tu historial de lecturas en formato Excel (.xlsx) desde tu perfil o desde la Bitácora de Servicios.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de cierre */}
        <div className="pt-4 border-t border-sky-400/20">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm btn-hydro-primary flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Entendido, ¡gracias!
          </button>
        </div>
      </div>
    </div>
  );
};
