import React, { useState } from 'react';
import {
  Home,
  Plus,
  Trash2,
  ArrowRight,
  MapPin,
  Check,
  Truck,
  Droplets,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PantallaMisSistemas = ({
  onSelectSystemAndGoHome,
  onNavigateToAddSystem,
  onNavigateToServices,
}) => {
  const { userSystems, activeSystemId, switchSystem, unlinkSystem, addToast } = useAuth();

  const handleSelectSystem = (systemId) => {
    switchSystem(systemId);
    onSelectSystemAndGoHome?.();
  };

  const activeSys = userSystems.find((s) => s.id === activeSystemId) || userSystems[0];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0F1722] rounded-t-[36px] min-h-[calc(100dvh-120px)] p-5 sm:p-7 shadow-xl pb-28">
      {/* ============================================================== */}
      {/* 1. SECCIÓN LATEST OFFERS / SISTEMAS VINCULADOS                 */}
      {/* ============================================================== */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
            Latest Offers & Sistemas
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {userSystems.length} viviendas
          </span>
        </div>

        {/* Carrusel de Viviendas con diseño de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userSystems.map((sys, idx) => {
            const isActive = sys.id === activeSystemId;
            const isFirst = idx % 2 === 0;

            return (
              <div
                key={sys.id}
                className={`p-5 rounded-3xl text-white flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden transition-all ${
                  isFirst
                    ? 'bg-gradient-to-r from-[#9061F9] to-[#7E3AF2] shadow-purple-500/20'
                    : 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] shadow-amber-500/20'
                } ${isActive ? 'ring-3 ring-[#FF5B22]' : ''}`}
              >
                {/* Parte Superior: Nombre y Código */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider">
                      {isActive ? 'Vivienda Activa' : 'Enlazada'}
                    </span>
                    <h4 className="text-xl font-black mt-1.5 leading-tight">{sys.name}</h4>
                    <p className="text-xs text-white/80 font-medium mt-0.5 truncate max-w-[200px]">
                      {sys.address}
                    </p>
                  </div>

                  <span className="font-mono text-xs font-black bg-white/20 px-2.5 py-1 rounded-xl">
                    {sys.deviceId || `ESP32-${idx + 1}`}
                  </span>
                </div>

                {/* Métricas de Telemetría */}
                <div className="grid grid-cols-3 gap-2 bg-black/15 backdrop-blur-xs p-2.5 rounded-2xl text-center text-xs">
                  <div>
                    <span className="block text-[10px] opacity-75">Cisterna</span>
                    <span className="font-extrabold">{Math.round(sys.level * 100)}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] opacity-75">Presión</span>
                    <span className="font-extrabold">{sys.pressure} bar</span>
                  </div>
                  <div>
                    <span className="block text-[10px] opacity-75">Válvula</span>
                    <span className="font-extrabold">{sys.valveOpen ? 'Abierta' : 'Cerrada'}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-1">
                  {userSystems.length > 1 && !isActive && (
                    <button
                      onClick={() => unlinkSystem(sys.id)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition cursor-pointer"
                      title="Desvincular vivienda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleSelectSystem(sys.id)}
                    className="flex-1 ml-auto py-2 px-4 rounded-xl bg-white text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                  >
                    <span>{isActive ? 'Monitoreando Ahora' : 'Seleccionar Vivienda'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF5B22]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SECCIÓN LIMITED OFFER / ENLAZAR NUEVO SISTEMA (Tarjeta Naranja) */}
      {/* ============================================================== */}
      <div className="mt-8">
        <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white pb-3">
          Limited Offer
        </h3>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FF6B22] via-[#FF5B22] to-[#E24810] text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-[#FF5B22]/30 relative overflow-hidden">
          <div className="z-10 text-center sm:text-left">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider">
              Enlace Rápido IoT
            </span>
            <h4 className="text-2xl sm:text-3xl font-black mt-2 leading-tight">
              20% OFF
            </h4>
            <p className="text-xs text-orange-100 font-semibold mt-1">
              Online Payment · Kit ESP32
            </p>
            <p className="font-mono text-xs font-black mt-2 bg-black/20 w-fit px-3 py-1 rounded-xl mx-auto sm:mx-0">
              Code: GO20
            </p>

            <button
              onClick={onNavigateToAddSystem}
              className="mt-4 px-6 py-2.5 rounded-2xl bg-white text-[#FF5B22] font-black text-xs sm:text-sm shadow-md hover:bg-orange-50 active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Enlazar Nueva Vivienda</span>
            </button>
          </div>

          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/10 flex items-center justify-center shrink-0">
            <Truck className="w-16 h-16 sm:w-20 sm:h-20 text-white fill-white/20" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. SECCIÓN JUST FOR YOU (3 Tarjetas Rápidas de Servicios)       */}
      {/* ============================================================== */}
      <div className="mt-8">
        <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white pb-3">
          Just for you
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {/* Tarjeta 1: Blue */}
          <div
            onClick={onNavigateToServices}
            className="p-4 rounded-3xl bg-[#3B82F6] text-white flex flex-col items-center justify-between text-center gap-3 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-blue-100">Desinfección</p>
              <h5 className="font-extrabold text-xs">Save 30%</h5>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/20 uppercase">
              Order Now
            </span>
          </div>

          {/* Tarjeta 2: Green */}
          <div
            onClick={onNavigateToServices}
            className="p-4 rounded-3xl bg-[#10B981] text-white flex flex-col items-center justify-between text-center gap-3 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-100">Calibración</p>
              <h5 className="font-extrabold text-xs">20% Off</h5>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/20 uppercase">
              Order Now
            </span>
          </div>

          {/* Tarjeta 3: Red/Pink */}
          <div
            onClick={onNavigateToServices}
            className="p-4 rounded-3xl bg-[#EC4899] text-white flex flex-col items-center justify-between text-center gap-3 shadow-md shadow-pink-500/20 cursor-pointer active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-pink-100">Pipa Express</p>
              <h5 className="font-extrabold text-xs">Save 15%</h5>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/20 uppercase">
              Order Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantallaMisSistemas;
